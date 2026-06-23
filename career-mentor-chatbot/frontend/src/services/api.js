import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE })

export async function sendMessage({ message, history, profile }) {
  const { data } = await api.post('/api/chat/message', {
    message,
    history,
    student_name: profile?.name,
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    education: profile?.education,
    target_role: profile?.targetRole,
  })
  return data // { reply, sources }
}

export async function analyseResume({ resumeText, targetRole }) {
  const { data } = await api.post('/api/chat/resume-analysis', {
    resume_text: resumeText,
    target_role: targetRole,
  })
  return data // { analysis }
}

export async function getSkillGap({ currentSkills, targetJob }) {
  const { data } = await api.post('/api/chat/skill-gap', {
    current_skills: currentSkills,
    target_job: targetJob,
  })
  return data // { analysis }
}

export async function getInterviewQuestions({ currentSkills, targetJob }) {
  const { data } = await api.post('/api/chat/interview-questions', {
    current_skills: currentSkills,
    target_job: targetJob,
  })
  return data // { questions }
}

export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function healthCheck() {
  const { data } = await api.get('/api/health')
  return data
}
