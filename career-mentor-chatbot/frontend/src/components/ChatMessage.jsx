import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './ChatMessage.module.css'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && <div className={styles.avatar}>🎓</div>}
      <div className={styles.bubble}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, children, ...props }) {
              return inline
                ? <code className={styles.inlineCode} {...props}>{children}</code>
                : <pre className={styles.codeBlock}><code {...props}>{children}</code></pre>
            },
            p: ({ children }) => <p className={styles.para}>{children}</p>,
            ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
            li: ({ children }) => <li className={styles.listItem}>{children}</li>,
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
            h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
            strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
          }}>
          {message.content}
        </ReactMarkdown>
        {message.sources?.length > 0 && (
          <div className={styles.sources}>
            📚 Sources: {message.sources.join(', ')}
          </div>
        )}
      </div>
      {isUser && <div className={styles.userAvatar}>You</div>}
    </div>
  )
}
