import { useState, useCallback } from 'react'
import { sendMessage } from '../services/api'

export function useChat(profile) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# 👋 Hey${profile?.name ? `, ${profile.name}` : ''}! I'm your AI Career Mentor.\n\nI can help you with:\n- 🎯 **Career path guidance** tailored to your skills\n- 📄 **Resume analysis** and improvement tips\n- 🧠 **Skill gap analysis** for your dream role\n- 🎤 **Interview preparation** questions and answers\n- 🗺️ **Learning roadmaps** with timelines and resources\n\nTell me about yourself or just ask anything career-related!`,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim()) return
    setError(null)

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const data = await sendMessage({ message: text, history, profile })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, sources: data.sources }])
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
    }
  }, [messages, profile])

  const clearChat = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: '🔄 Chat cleared. How can I help you today?',
    }])
  }, [])

  return { messages, loading, error, sendUserMessage, clearChat }
}
