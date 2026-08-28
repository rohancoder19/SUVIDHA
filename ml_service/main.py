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
    title="SUVIDHA 2.0 AI & ML Microservice",
    description="FastAPI Scheme Recommendation, RAG Engine & Explainable AI",
    version="2.0.0"
)

# Enable CORS
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
    district: Optional[str] = Field(default="", example="Pune")
    age: int = Field(default=25, example=28)
    gender: str = Field(default="All", example="Female")
    income: float = Field(default=250000.0, example=150000.0)
    category: str = Field(default="General", example="OBC")
    isStudent: bool = Field(default=False, example=False)
    occupation: str = Field(default="All", example="Farmer")
    education: Optional[str] = Field(default="Graduate")
    employmentStatus: Optional[str] = Field(default="Employed")
    pincode: Optional[str] = Field(default="", example="400001")

class ChatQueryRequest(BaseModel):
    query: str = Field(..., example="Which schemes can help a college student looking for scholarships?")
    userProfile: Optional[UserProfileRequest] = None

class NaturalSearchRequest(BaseModel):
    query: str = Field(..., example="Scholarships for female students in West Bengal")
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
        "service": "SUVIDHA ML Engine 2.0",
        "port": 8000,
        "schemes_loaded": len(SCHEMES_CACHE)
    }

@app.post("/recommend")
def recommend_schemes(profile: UserProfileRequest):
    user_dict = profile.dict()
    if not SCHEMES_CACHE:
        raise HTTPException(status_code=500, detail="Schemes dataset not initialized")
    
    # Run deterministic hard filter and descending match score sorting with explainability
    eligible_schemes = filter_and_sort_schemes(user_dict, SCHEMES_CACHE)
    
    return {
        "success": True,
        "count": len(eligible_schemes),
        "total_catalog": len(SCHEMES_CACHE),
        "user_profile": user_dict,
        "schemes": eligible_schemes
    }

@app.post("/natural-search")
def natural_search_endpoint(request: NaturalSearchRequest):
    if not rag_engine:
        raise HTTPException(status_code=500, detail="RAG engine not initialized")
    
    # Query ChromaDB / RAG engine for top relevant candidates
    context_docs = rag_engine.query_schemes(request.query, top_k=6)
    
    matched_slugs = set(doc["metadata"]["slug"] for doc in context_docs if doc.get("metadata", {}).get("slug"))
    matched_schemes = [s for s in SCHEMES_CACHE if s.get("scheme_slug") in matched_slugs or s.get("slug") in matched_slugs]
    
    if not matched_schemes:
        matched_schemes = SCHEMES_CACHE[:5]
        
    return {
        "success": True,
        "query": request.query,
        "count": len(matched_schemes),
        "schemes": matched_schemes
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

class GrievanceClassifyRequest(BaseModel):
    title: str = Field(..., example="High Voltage Open Transformer near school")
    description: str = Field(..., example="Large electrical wire hanging dangerously outside school gate.")
    category: Optional[str] = Field(default="Other")
    location: Optional[str] = Field(default="")

@app.post("/classify-grievance")
def classify_grievance_endpoint(request: GrievanceClassifyRequest):
    text = f"{request.title} {request.description}".lower()
    
    category = request.category or "Other"
    priority = "MEDIUM"
    urgency_score = 50
    department = "Municipal Corporation"
    reason = "General civic grievance received for officer triage."

    # Hazard & Urgency Rules
    if any(k in text for k in ["fire", "transformer", "wire", "electric shock", "explosion", "spark", "hanging wire", "high voltage"]):
        category = "Electricity"
        priority = "CRITICAL"
        urgency_score = 95
        department = "Electricity Department"
        reason = "Immediate public safety hazard involving electrical infrastructure near public areas."
    elif any(k in text for k in ["drainage overflow", "sewage", "contaminated water", "no water", "pipe burst", "leakage"]):
        category = "Water Supply" if "water" in text else "Drainage & Sewage"
        priority = "HIGH"
        urgency_score = 85
        department = "Water & Sanitation Department"
        reason = "Public health concern due to water or sewage line disruption."
    elif any(k in text for k in ["pothole", "accident", "collapsed road", "bridge", "cave in", "highway"]):
        category = "Road & Infrastructure"
        priority = "HIGH"
        urgency_score = 80
        department = "Public Works Department (PWD)"
        reason = "Road safety hazard affecting vehicular and pedestrian movement."
    elif any(k in text for k in ["garbage", "dump", "smell", "waste", "sanitation"]):
        category = "Garbage & Sanitation"
        priority = "MEDIUM"
        urgency_score = 65
        department = "Municipal Health & Sanitation Dept"
        reason = "Sanitation issue affecting local hygiene."
    elif any(k in text for k in ["street light", "darkness", "dark spot"]):
        category = "Street Light"
        priority = "MEDIUM"
        urgency_score = 60
        department = "Electrical Maintenance Cell"
        reason = "Street lighting defect creating night-time safety concerns."
    elif any(k in text for k in ["pension", "scholarship", "subsidy", "benefit", "delay", "payment"]):
        category = "Welfare Scheme"
        priority = "MEDIUM"
        urgency_score = 55
        department = "Social Welfare Department"
        reason = "Administrative welfare service delay reported by citizen."

    return {
        "success": True,
        "category": category,
        "priority": priority,
        "urgencyScore": urgency_score,
        "department": department,
        "reason": reason,
        "disclaimer": "AI-generated classification — subject to official verification."
    }

