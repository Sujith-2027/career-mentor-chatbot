import { useState } from 'react'
import styles from './ProfileSetup.module.css'

const INTERESTS = ['Software Engineering','Data Science','Product Management','UI/UX Design','DevOps','Cybersecurity','Machine Learning','Blockchain','Cloud Computing','Mobile Development']

export default function ProfileSetup({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ name: '', education: '', skills: '', targetRole: '', interests: [] })
  const [error, setError] = useState('')

  const update = (k, v) => setData(d => ({ ...d, [k]: v }))

  const toggleInterest = (i) => {
    setData(d => ({
      ...d,
      interests: d.interests.includes(i) ? d.interests.filter(x => x !== i) : [...d.interests, i]
    }))
  }

  const next = () => {
    setError('')
    if (step === 0 && !data.name.trim()) { setError('Please enter your name.'); return }
    if (step < 2) setStep(s => s + 1)
    else {
      onComplete({
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>🎓</div>
          <h1 className={styles.title}>Career Mentor AI</h1>
          <p className={styles.sub}>Your personalised AI career guide</p>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          {[0,1,2].map(i => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.active : ''}`} />
          ))}
        </div>

        {/* Steps */}
        {step === 0 && (
          <div className={styles.step}>
            <h2>Let's get to know you</h2>
            <label>Your Name
              <input value={data.name} onChange={e => update('name', e.target.value)}
                placeholder="e.g. Priya Sharma" autoFocus />
            </label>
            <label>Education
              <input value={data.education} onChange={e => update('education', e.target.value)}
                placeholder="e.g. B.Tech CSE, IIT Madras (2025)" />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className={styles.step}>
            <h2>Your skills & goals</h2>
            <label>Current Skills <span className={styles.hint}>(comma separated)</span>
              <input value={data.skills} onChange={e => update('skills', e.target.value)}
                placeholder="Python, React, SQL, Machine Learning …" autoFocus />
            </label>
            <label>Target Role
              <input value={data.targetRole} onChange={e => update('targetRole', e.target.value)}
                placeholder="e.g. ML Engineer at a product company" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h2>Interests <span className={styles.hint}>(pick any)</span></h2>
            <div className={styles.chips}>
              {INTERESTS.map(i => (
                <button key={i}
                  className={`${styles.chip} ${data.interests.includes(i) ? styles.selected : ''}`}
                  onClick={() => toggleInterest(i)}>{i}</button>
              ))}
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {step > 0 && <button className={styles.back} onClick={() => setStep(s => s - 1)}>← Back</button>}
          <button className={styles.next} onClick={next}>
            {step < 2 ? 'Continue →' : '🚀 Start Mentoring'}
          </button>
        </div>
      </div>
    </div>
  )
}
