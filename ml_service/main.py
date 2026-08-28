import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from scripts.preprocess_welfare_dataset import preprocess_dataset
from hard_filter import filter_and_sort_schemes
from rag_engine import RAGEngine

load_dotenv()

app = FastAPI(
    title="SUVIDHA AI & ML Microservice",
    description="FastAPI Scheme Recommendation & RAG Engine",
    version="1.0.0"
)

# Enable CORS for Express backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dataset & RAG engine instance
SCHEMES_CACHE: List[Dict[str, Any]] = []
rag_engine: Optional[RAGEngine] = None

class UserProfileRequest(BaseModel):
    state: str = Field(default="All India", example="Maharashtra")
    age: int = Field(default=25, example=28)
    gender: str = Field(default="All", example="Female")
    income: float = Field(default=250000.0, example=150000.0)
    category: str = Field(default="General", example="OBC")
    isStudent: bool = Field(default=False, example=False)
    occupation: str = Field(default="All", example="Farmer")
    pincode: Optional[str] = Field(default="", example="400001")

class ChatQueryRequest(BaseModel):
    query: str = Field(..., example="Which schemes can help a 25 year old female farmer in Maharashtra?")
    userProfile: Optional[UserProfileRequest] = None

@app.on_event("startup")
def load_and_initialize_dataset():
    global SCHEMES_CACHE, rag_engine
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "updated_data.csv")
    json_path = os.path.join(base_dir, "data", "preprocessed_schemes.json")

    try:
        if not os.path.exists(json_path):
            print("Preprocessing CSV dataset...")
            SCHEMES_CACHE = preprocess_dataset(csv_path, json_path)
        else:
            with open(json_path, "r", encoding="utf-8") as f:
                SCHEMES_CACHE = json.load(f)
            print(f"Loaded {len(SCHEMES_CACHE)} preprocessed schemes.")
        
        rag_engine = RAGEngine(SCHEMES_CACHE)
    except Exception as e:
        print(f"Dataset load error: {e}")
        SCHEMES_CACHE = []

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SUVIDHA ML Engine",
        "port": 8000,
        "schemes_loaded": len(SCHEMES_CACHE)
    }

@app.post("/recommend")
def recommend_schemes(profile: UserProfileRequest):
    user_dict = profile.dict()
    if not SCHEMES_CACHE:
        raise HTTPException(status_code=500, detail="Schemes dataset not initialized")
    
    # Run deterministic hard filter and ascending match score sorting
    eligible_schemes = filter_and_sort_schemes(user_dict, SCHEMES_CACHE)
    
    return {
        "success": True,
        "count": len(eligible_schemes),
        "total_catalog": len(SCHEMES_CACHE),
        "user_profile": user_dict,
        "schemes": eligible_schemes
    }

@app.post("/chat")
def chat_rag_endpoint(request: ChatQueryRequest):
    if not rag_engine:
        raise HTTPException(status_code=500, detail="RAG engine not initialized")
    
    context_docs = rag_engine.query_schemes(request.query, top_k=3)
    response_data = rag_engine.generate_rag_response(request.query, context_docs)
    
    return {
        "success": True,
        "query": request.query,
        "answer": response_data["answer"],
        "cited_schemes": response_data["cited_schemes"],
        "sources": response_data["sources"]
    }
