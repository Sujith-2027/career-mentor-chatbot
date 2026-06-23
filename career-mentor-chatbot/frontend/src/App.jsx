import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import ResumePage from './pages/ResumePage'
import SkillGapPage from './pages/SkillGapPage'
import InterviewPage from './pages/InterviewPage'
import ProfileSetup from './components/ProfileSetup'
import styles from './App.module.css'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [activePage, setActivePage] = useState('chat')

  if (!profile) return <ProfileSetup onComplete={setProfile} />

  const pages = { chat: ChatPage, resume: ResumePage, skillgap: SkillGapPage, interview: InterviewPage }
  const Page = pages[activePage] || ChatPage

  return (
    <div className={styles.layout}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} profile={profile} />
      <main className={styles.main}>
        <Page profile={profile} />
      </main>
    </div>
  )
}
