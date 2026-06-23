import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { analyseResume } from '../services/api'
import styles from './ToolPage.module.css'

export default function ResumePage({ profile }) {
  const [resumeText, setResumeText] = useState('')
  const [targetRole, setTargetRole] = useState(profile?.targetRole || '')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!resumeText.trim()) { setError('Paste your resume text first.'); return }
    setError(''); setResult(''); setLoading(true)
    try {
      const data = await analyseResume({ resumeText, targetRole })
      setResult(data.analysis)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Analysis failed. Check your API connection.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📄 Resume Analyser</h1>
        <p className={styles.sub}>Paste your resume and get AI-powered feedback, ATS tips, and rewrites</p>
      </div>

      <div className={styles.body}>
        <div className={styles.inputPanel}>
          <label className={styles.label}>Target Role
            <input className={styles.input} value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Data Scientist at Google" />
          </label>
          <label className={styles.label}>Paste Resume Text
            <textarea className={styles.textarea} rows={16}
              value={resumeText} onChange={e => setResumeText(e.target.value)}
              placeholder="Copy and paste your full resume text here …" />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} onClick={run} disabled={loading}>
            {loading ? 'Analysing …' : '🔍 Analyse Resume'}
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
