import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getInterviewQuestions } from '../services/api'
import styles from './ToolPage.module.css'

export default function InterviewPage({ profile }) {
  const [skills, setSkills] = useState((profile?.skills || []).join(', '))
  const [targetJob, setTargetJob] = useState(profile?.targetRole || '')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!targetJob.trim()) { setError('Enter a role first.'); return }
    setError(''); setResult(''); setLoading(true)
    try {
      const current = skills.split(',').map(s => s.trim()).filter(Boolean)
      const data = await getInterviewQuestions({ currentSkills: current, targetJob })
      setResult(data.questions)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Generation failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎤 Interview Preparation</h1>
        <p className={styles.sub}>Get targeted interview questions with answer guidance for your dream role</p>
      </div>

      <div className={styles.body}>
        <div className={styles.inputPanel}>
          <label className={styles.label}>Target Role
            <input className={styles.input} value={targetJob}
              onChange={e => setTargetJob(e.target.value)}
              placeholder="e.g. Frontend Engineer at a startup" />
          </label>
          <label className={styles.label}>Your Skills <span className={styles.hint}>(comma separated)</span>
            <textarea className={styles.textarea} rows={3}
              value={skills} onChange={e => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, CSS …" />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} onClick={run} disabled={loading}>
            {loading ? 'Generating …' : '🎯 Generate Questions'}
          </button>
        </div>

        {result && (
          <div className={styles.resultPanel}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
