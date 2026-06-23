"""
Chat endpoints — the core conversational API.
"""

from fastapi import APIRouter, Request, HTTPException
from models.schemas import ChatRequest, ChatResponse, SkillGapRequest, ResumeAnalysisRequest
from services.mentor_chain import MentorChainService

router = APIRouter()
mentor = MentorChainService()


def _get_vs(request: Request):
    vs = getattr(request.app.state, "vector_store", None)
    if vs is None:
        raise HTTPException(status_code=503, detail="Vector store not initialised.")
    return vs


@router.post("/message", response_model=ChatResponse)
async def chat_message(payload: ChatRequest, request: Request):
    """Main conversational endpoint — RAG + Chain-of-Thought."""
    vs = _get_vs(request)

    # 1. Retrieve relevant context
    results = vs.similarity_search(payload.message)
    context, sources = mentor.build_context(results)

    # 2. Generate reply
    history = [m.model_dump() for m in (payload.history or [])]
    reply, sources = mentor.generate_reply(
        user_message=payload.message,
        history=history,
        context=context,
        sources=sources,
        student_name=payload.student_name,
        skills=payload.skills,
        interests=payload.interests,
        education=payload.education,
        target_role=payload.target_role,
    )

    return ChatResponse(reply=reply, sources=sources)


@router.post("/interview-questions")
async def interview_questions(payload: SkillGapRequest):
    """Generate role-specific interview questions."""
    result = mentor.generate_interview_questions(payload.target_job, payload.current_skills)
    return {"questions": result}


@router.post("/resume-analysis")
async def resume_analysis(payload: ResumeAnalysisRequest):
    """Analyse a pasted resume text."""
    result = mentor.analyse_resume(payload.resume_text, payload.target_role or "")
    return {"analysis": result}


@router.post("/skill-gap")
async def skill_gap(payload: SkillGapRequest):
    """Return a detailed skill-gap analysis."""
    result = mentor.skill_gap_analysis(payload.current_skills, payload.target_job)
    return {"analysis": result}
