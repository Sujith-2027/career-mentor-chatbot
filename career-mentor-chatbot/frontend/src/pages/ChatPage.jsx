import { useRef, useEffect, useState } from 'react'
import ChatMessage from '../components/ChatMessage'
import { useChat } from '../hooks/useChat'
import styles from './ChatPage.module.css'

const SUGGESTIONS = [
  'What career paths suit a Python developer?',
  'How do I switch to Data Science?',
  'Give me a 6-month learning roadmap for ML',
  'What skills do I need to become a product manager?',
]

export default function ChatPage({ profile }) {
  const { messages, loading, sendUserMessage, clearChat } = useChat(profile)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendUserMessage(input)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Career Chat</h1>
          <p className={styles.sub}>Ask me anything about your career journey</p>
        </div>
        <button className={styles.clearBtn} onClick={clearChat}>Clear chat</button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {loading && (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <button key={s} className={styles.suggestion} onClick={() => { sendUserMessage(s) }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputBar}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your career question… (Enter to send)"
          rows={1}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  )
}
