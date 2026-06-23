"""
Documents endpoint — upload PDFs, CSVs, or TXT files into the vector store.
"""

import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from models.schemas import DocumentUploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".csv", ".txt"}
MAX_SIZE_MB = 10


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...), request: Request = None):
    """Upload a career-related document and index it into the vector store."""
    vs = getattr(request.app.state, "vector_store", None)
    if vs is None:
        raise HTTPException(status_code=503, detail="Vector store not ready.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_SIZE_MB} MB limit.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        chunks_added = vs.add_documents_from_file(tmp_path)
    finally:
        os.unlink(tmp_path)

    return DocumentUploadResponse(
        filename=file.filename,
        chunks_added=chunks_added,
        message=f"Successfully indexed {chunks_added} chunks from '{file.filename}'.",
    )


@router.post("/add-text")
async def add_text(text: str, source: str = "manual", request: Request = None):
    """Directly add raw text to the knowledge base."""
    vs = getattr(request.app.state, "vector_store", None)
    if vs is None:
        raise HTTPException(status_code=503, detail="Vector store not ready.")
    chunks = vs.add_text(text, source)
    return {"chunks_added": chunks, "message": "Text indexed successfully."}
