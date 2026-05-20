'use client'

import { useRef, useEffect } from 'react'

interface LinkedInCardProps {
  post: string
  onPostChange: (value: string) => void
  profileName: string
  sourceTitles: string[]
}

/**
 * LinkedIn-style post card with contentEditable body.
 */
export function LinkedInCard({ post, onPostChange, profileName, sourceTitles }: LinkedInCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  const initial = profileName?.charAt(0)?.toUpperCase() ?? 'U'
  const charCount = post.length

  /* Sync post text into contentEditable ref without React reconciliation */
  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerText !== post) {
      bodyRef.current.innerText = post
    }
  }, [post])

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: 16,
      maxWidth: 520,
      margin: '0 auto',
    }}>
      {/* Header — avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--ember-muted)', border: '1.5px solid var(--ember)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="font-playfair" style={{ fontSize: 16, color: 'var(--ember)' }}>
            {initial}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            {profileName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Founder · Threadda · 1st+
          </div>
        </div>
      </div>

      {/* Body — contentEditable (ref-managed to avoid React DOM crashes) */}
      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onPostChange((e.target as HTMLDivElement).innerText)}
        style={{
          fontSize: 14,
          color: 'var(--text-primary)',
          lineHeight: 1.75,
          whiteSpace: 'pre-line',
          outline: 'none',
          minHeight: 80,
          marginBottom: 8,
        }}
      />



      {/* Source pills */}
      {sourceTitles.length > 0 && (
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.04)',
          paddingTop: 8, marginBottom: 8,
          display: 'flex', flexWrap: 'wrap', gap: 4,
        }}>
          {sourceTitles.map((title) => (
            <span
              key={title}
              className="font-mono"
              style={{
                fontSize: 11, color: 'var(--text-muted)',
                background: 'var(--bg-page)',
                padding: '3px 8px', borderRadius: 4,
              }}
            >
              {title.length > 20 ? title.slice(0, 20) + '…' : title}
            </span>
          ))}
        </div>
      )}

      {/* Char count */}
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>
        {charCount} / 3000 characters
      </div>

      {/* Engagement row */}
      <div style={{
        borderTop: '0.5px solid rgba(255,255,255,0.04)',
        paddingTop: 8,
        display: 'flex', gap: 20,
      }}>
        {['👍 Like', '💬 Comment', '🔄 Repost', '📤 Send'].map((action) => (
          <span key={action} style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'default' }}>
            {action}
          </span>
        ))}
      </div>
    </div>
  )
}
