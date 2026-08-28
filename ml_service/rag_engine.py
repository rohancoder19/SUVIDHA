import os
import json
from typing import List, Dict, Any

# Optional imports handled gracefully
try:
    import chromadb
    HAS_CHROMADB = True
except ImportError:
    HAS_CHROMADB = False

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

class RAGEngine:
    def __init__(self, schemes_data: List[Dict[str, Any]]):
        self.schemes = schemes_data
        self.chroma_client = None
        self.collection = None
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        if HAS_GEMINI and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
            except Exception as e:
                print(f"Gemini config notice: {e}")

        self._init_vector_store()

    def _init_vector_store(self):
        if not HAS_CHROMADB:
            print("ChromaDB not installed. Using in-memory dataset search fallback.")
            return

        try:
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.get_or_create_collection(name="welfare_schemes")
            
            # Check if collection is empty
            if self.collection.count() == 0 and self.schemes:
                documents = []
                metadatas = []
                ids = []
                for idx, s in enumerate(self.schemes):
                    text = f"Scheme: {s.get('scheme_name')}\nDepartment: {s.get('department')}\nLevel: {s.get('level')} ({s.get('state_name')})\nEligibility: {s.get('eligibility_text')}\nBenefits: {s.get('benefits')}\nDescription: {s.get('description')}"
                    documents.append(text)
                    metadatas.append({
                        "name": s.get("scheme_name", ""),
                        "slug": s.get("scheme_slug", ""),
                        "url": s.get("application_url", "#")
                    })
                    ids.append(f"scheme_{idx}")

                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                print(f"ChromaDB initialized with {len(documents)} documents.")
        except Exception as e:
            print(f"Vector Store initialization notice: {e}")

    def query_schemes(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_text_lower = query_text.lower()
        results = []

        if self.collection and HAS_CHROMADB:
            try:
                chroma_res = self.collection.query(
                    query_texts=[query_text],
                    n_results=min(top_k, len(self.schemes))
                )
                docs = chroma_res.get("documents", [[]])[0]
                metas = chroma_res.get("metadatas", [[]])[0]
                for doc, meta in zip(docs, metas):
                    results.append({"text": doc, "metadata": meta})
                if results:
                    return results
            except Exception as e:
                print(f"Chroma query fallback triggered: {e}")

        # In-memory keyword match fallback
        scored = []
        for s in self.schemes:
            text = f"{s.get('scheme_name')} {s.get('description')} {s.get('benefits')} {s.get('eligibility_text')}".lower()
            score = sum(1 for word in query_text_lower.split() if word in text)
            scored.append((score, s))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        top_schemes = [item[1] for item in scored[:top_k]]

        for s in top_schemes:
            text = f"Scheme: {s.get('scheme_name')}\nDepartment: {s.get('department')}\nLevel: {s.get('level')} ({s.get('state_name')})\nEligibility: {s.get('eligibility_text')}\nBenefits: {s.get('benefits')}\nDescription: {s.get('description')}"
            results.append({
                "text": text,
                "metadata": {
                    "name": s.get("scheme_name", ""),
                    "slug": s.get("scheme_slug", ""),
                    "url": s.get("application_url", "#")
                }
            })
        return results

    def generate_rag_response(self, user_query: str, context_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        context_str = "\n---\n".join([d["text"] for d in context_docs])
        cited_schemes = [d["metadata"]["name"] for d in context_docs]

        if HAS_GEMINI and self.api_key:
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            for m_name in [model_name, "gemini-1.5-flash", "gemini-2.5-flash", "gemini-pro"]:
                try:
                    model = genai.GenerativeModel(m_name)
                    prompt = f"""You are SUVIDHA AI, an expert Civic Welfare & Scheme Assistant.
Answer the citizen's query based ONLY on the provided scheme context below.
Provide accurate details about eligibility, benefits, and step-by-step application instructions.
Cite exact scheme names in your response.

Citizen Query: {user_query}

Scheme Context:
{context_str}

Format your response clearly with markdown headings, bullet points, and actionable steps.
"""
                    response = model.generate_content(prompt)
                    return {
                        "answer": response.text,
                        "cited_schemes": cited_schemes,
                        "sources": context_docs
                    }
                except Exception as e:
                    print(f"Gemini API model {m_name} note: {e}")
                    continue

        # High quality structured fallback response
        fallback_answer = f"### 🏛️ Welfare Scheme Intelligence Report\n\nBased on your query **\"{user_query}\"**, here are the most relevant government schemes:\n\n"
        for doc in context_docs:
            meta = doc["metadata"]
            fallback_answer += f"#### 🔹 [{meta['name']}]({meta.get('url', '#')})\n"
            lines = doc["text"].split("\n")
            for line in lines[1:]:
                fallback_answer += f"- {line}\n"
            fallback_answer += "\n"
        
        fallback_answer += "### 📋 General Application Steps:\n"
        fallback_answer += "1. Gather required documents: Aadhaar Card, Income Certificate, Caste Certificate (if applicable), and Bank Passbook.\n"
        fallback_answer += "2. Visit the official portal link cited above for online application submission.\n"
        fallback_answer += "3. Alternatively, contact your nearest Common Service Centre (CSC) or District Welfare Office for assistance.\n"

        return {
            "answer": fallback_answer,
            "cited_schemes": cited_schemes,
            "sources": context_docs
        }
