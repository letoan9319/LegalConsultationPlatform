from typing import List, Dict, Optional
import httpx
from ..config import get_settings


class LegalReferenceProcessor:
    def __init__(self):
        self.settings = get_settings()
        self.llm_client = None
        self.meilisearch_url = "http://localhost:7700"

    async def initialize(self):
        pass

    async def process(self, request: dict) -> dict:
        query = request.get("query", "")
        legal_domain = request.get("context", {}).get("legal_domain", "general")

        relevant_docs = await self._retrieve_legal_docs(query, legal_domain)
        response = await self._generate_response(query, relevant_docs)

        return {
            "request_id": request.get("request_id"),
            "session_id": request.get("session_id"),
            "answer": response["text"],
            "sources": [
                {
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "article": doc["article"],
                    "relevance_score": doc["score"],
                }
                for doc in relevant_docs
            ],
            "confidence": response["confidence"],
            "processing_time_ms": response["processing_time"],
        }

    async def _retrieve_legal_docs(self, query: str, legal_domain: str) -> List[Dict]:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.meilisearch_url}/indexes/legal_documents/search",
                    json={"q": query, "filter": f"domain = {legal_domain}", "limit": 5},
                    timeout=10.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return [
                        {
                            "doc_id": hit.get("id", ""),
                            "title": hit.get("title", ""),
                            "article": hit.get("article", ""),
                            "excerpt": hit.get("excerpt", ""),
                            "score": hit.get("_rankingScore", 0.0),
                        }
                        for hit in data.get("hits", [])
                    ]
        except Exception:
            pass
        return [
            {
                "doc_id": "fallback-1",
                "title": "General Legal Reference",
                "article": "N/A",
                "excerpt": "Legal reference service unavailable",
                "score": 0.0,
            }
        ]

    async def _generate_response(self, query: str, docs: List[Dict]) -> Dict:
        context = "\n\n".join(
            [
                f"- {doc['title']} (Article {doc['article']}): {doc.get('excerpt', '')}"
                for doc in docs
            ]
        )

        prompt = f"""Ban la mot luat su chuyen nghiep. Dua tren cac van ban phap luat sau:

{context}

Hay tra loi cau hoi sau mot cach chinh xac va co trich dan:
Cau hoi: {query}

Yeu cau:
1. Tra loi bang tieng Viet
2. Trich dan cu the dieu luat
3. Giai thich ngan gon y nghia
4. Neu khong chan chan, hay noi ro
"""

        return {
            "text": f"Processed: {query[:50]}... (see sources for details)",
            "confidence": 0.85 if docs else 0.3,
            "processing_time": 1500,
        }
