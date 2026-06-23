import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSkillGap } from '../services/api'
import styles from './ToolPage.module.css'

export default function SkillGapPage({ profile }) {
  const [skills, setSkills] = useState((profile?.skills || []).join(', '))
  const [targetJob, setTargetJob] = useState(profile?.targetRole || '')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!targetJob.trim()) { setError('Enter a target job title.'); return }
    setError(''); setResult(''); setLoading(true)
    try {
      const current = skills.split(',').map(s => s.trim()).filter(Boolean)
      const data = await getSkillGap({ currentSkills: current, targetJob })
      setResult(data.analysis)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Analysis failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Skill Gap Analysis</h1>
        <p className={styles.sub}>Find what skills you're missing and get a personalised learning plan</p>
      </div>

      <div className={styles.body}>
        <div className={styles.inputPanel}>
          <label className={styles.label}>Your Current Skills <span className={styles.hint}>(comma separated)</span>
            <textarea className={styles.textarea} rows={4}
              value={skills} onChange={e => setSkills(e.target.value)}
              placeholder="Python, SQL, Excel, Statistics …" />
          </label>
          <label className={styles.label}>Target Job Title
            <input className={styles.input} value={targetJob}
              onChange={e => setTargetJob(e.target.value)}
              placeholder="e.g. Machine Learning Engineer" />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} onClick={run} disabled={loading}>
            {loading ? 'Analysing …' : '🔎 Analyse Skill Gap'}
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
