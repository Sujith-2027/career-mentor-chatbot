import styles from './Sidebar.module.css'

const NAV = [
  { id: 'chat',      label: 'Chat',          icon: '💬' },
  { id: 'resume',    label: 'Resume',         icon: '📄' },
  { id: 'skillgap',  label: 'Skill Gap',      icon: '📊' },
  { id: 'interview', label: 'Interview Prep', icon: '🎤' },
]

export default function Sidebar({ activePage, onNavigate, profile }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🎓</span>
        <div>
          <div className={styles.brandName}>CareerAI</div>
          <div className={styles.brandSub}>Mentor</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <button key={item.id}
            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.profile}>
        <div className={styles.avatar}>{profile.name?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <div className={styles.profileName}>{profile.name}</div>
          <div className={styles.profileRole}>{profile.targetRole || 'Exploring options'}</div>
        </div>
      </div>
    </aside>
  )
}
