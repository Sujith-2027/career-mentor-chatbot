"""Shared Pydantic schemas used across the API."""

from typing import Optional, List
from pydantic import BaseModel


class Message(BaseModel):
    role: str          # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []
    # Student profile context (optional)
    student_name: Optional[str] = None
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    education: Optional[str] = None
    target_role: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: Optional[List[str]] = []
    reasoning_steps: Optional[List[str]] = []


class DocumentUploadResponse(BaseModel):
    filename: str
    chunks_added: int
    message: str


class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_job: str


class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None
