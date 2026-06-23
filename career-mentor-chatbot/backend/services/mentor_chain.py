import os
from typing import List, Tuple
from dotenv import load_dotenv

load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.documents import Document

MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

SYSTEM_PROMPT = """You are an expert AI Career Mentor helping students and fresh graduates.

Use the retrieved context below to give accurate, personalised career advice.

Think step-by-step:
1. Understand the student's situation, skills, and goals.
2. Analyse their profile against industry requirements.
3. Recommend concrete career paths and next actions.
4. Break the path into clear milestones with timelines.
5. Point to specific free learning resources.

Be warm, encouraging, and specific. Use bullet points for clarity.

Retrieved Context:
{context}

Student Profile:
Name: {student_name}
Skills: {skills}
Interests: {interests}
Education: {education}
Target Role: {target_role}
"""

class MentorChainService:
    def __init__(self):
        load_dotenv()
        self.llm = ChatGroq(
            model=MODEL,
            temperature=0.7,
            api_key=os.getenv("GROQ_API_KEY")
        )

    def build_context(self, results):
        if not results:
            return "No specific context retrieved.", []
        parts, sources = [], []
        for doc, score in results:
            src = doc.metadata.get("source", "knowledge base")
            parts.append(f"[Source: {src}]\n{doc.page_content}")
            if src not in sources:
                sources.append(src)
        return "\n\n---\n\n".join(parts), sources

    def generate_reply(self, user_message, history, context, sources,
                       student_name="Student", skills=None, interests=None,
                       education="Not specified", target_role="Not specified"):
        system_content = SYSTEM_PROMPT.format(
            context=context,
            student_name=student_name or "Student",
            skills=", ".join(skills or []) or "Not specified",
            interests=", ".join(interests or []) or "Not specified",
            education=education or "Not specified",
            target_role=target_role or "Not specified",
        )
        messages = [SystemMessage(content=system_content)]
        for msg in (history or []):
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=user_message))
        response = self.llm.invoke(messages)
        return response.content, sources

    def generate_interview_questions(self, role, skills):
        prompt = f"""Generate 10 targeted interview questions for a {role} position.
Candidate skills: {', '.join(skills)}.
Include 3 technical, 3 behavioural (STAR format), 2 system design, 2 culture fit questions.
Number each question and give brief answer guidance."""
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content

    def analyse_resume(self, resume_text, target_role=""):
        prompt = f"""Analyse this resume{' for ' + target_role if target_role else ''}.

RESUME:
{resume_text}

Give:
1. Overall Score out of 10
2. Strengths
3. Weaknesses and Gaps
4. ATS Optimisation Tips
5. Rewrite 2-3 weak bullet points
6. Top 3 immediate action items"""
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content

    def skill_gap_analysis(self, current_skills, target_job):
        prompt = f"""Skill gap analysis.
Target Job: {target_job}
Current Skills: {', '.join(current_skills)}

Provide:
1. Required skills for target job
2. Skills already have (tick)
3. Missing skills ranked by importance (cross)
4. Learning plan with free resources and time estimates
5. Realistic timeline to become job-ready"""
        response = self.llm.invoke([HumanMessage(content=prompt)])
        return response.content