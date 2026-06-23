"""
Career Mentor Chatbot - FastAPI Backend
Entry point for the API server.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import chat, documents, health
from services.vector_store import VectorStoreService

load_dotenv()

# ---------------------------------------------------------------------------
# Lifespan: initialise heavy resources once at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the FAISS index (or build a fresh one) when the server starts."""
    print("🚀 Starting Career Mentor Chatbot API …")
    vs = VectorStoreService()
    vs.load_or_create_index()
    app.state.vector_store = vs
    print("✅ Vector store ready.")
    yield
    print("🛑 Shutting down …")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Career Mentor Chatbot API",
    description="AI-powered career guidance for students and fresh graduates.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend (local dev + Render deployment)
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router,  prefix="/api/chat",  tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
