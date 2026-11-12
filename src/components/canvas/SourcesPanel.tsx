'use client'

import { useMemo } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'

interface ContentItem {
  _id: Id<'contentItems'>
  title: string
  type: string
}

interface SourcesPanelProps {
  sources: ContentItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  canvasState: 'constellation' | 'session' | 'post-preview'
  onStartSession: () => void
  onBackToSession: () => void
  onNewSession: () => void
  sessionSourceIds: Id<'contentItems'>[]
  isLoading: boolean
}

/**
 * Left panel — source library with ON CANVAS / LIBRARY split.
 * 168px wide, 3-state design.
 */
export function SourcesPanel({
  sources,
  selectedIds,
  onToggle,
  canvasState,
  onStartSession,
  onBackToSession,
  onNewSession,
  sessionSourceIds,
  isLoading,
}: SourcesPanelProps) {
  /* ─── Split sources into selected / library ─── */
  const { onCanvas, library } = useMemo(() => {
    const sessionSet = new Set(sessionSourceIds.map(String))
    const onCanvas: ContentItem[] = []
    const library: ContentItem[] = []

    for (const item of sources) {
      const id = String(item._id)
      if (canvasState === 'post-preview') {
        if (sessionSet.has(id)) onCanvas.push(item)
        else library.push(item)
      } else if (selectedIds.has(id)) {
        onCanvas.push(item)
      } else {
        library.push(item)
      }
    }
    return { onCanvas, library }
  }, [sources, selectedIds, sessionSourceIds, canvasState])

  const isIdle = canvasState === 'constellation'

  return (
    <>
      {/* ─── Header ─── */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
        <div className="font-playfair" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
          {canvasState === 'post-preview' ? 'Sources' : 'Sources'}
        </div>
        <div className="font-mono" style={{
          fontSize: 7.5, color: 'var(--text-muted)', marginTop: 3,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {canvasState === 'post-preview'
            ? `Used in this post`
            : `${onCanvas.length} selected · ${library.length} in library`}
        </div>
      </div>

      {/* ─── Source lists ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                marginBottom: 4,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))
        ) : sources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: 22, marginBottom: 6, opacity: 0.3 }}>📚</div>
            <div className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
              Add research to your Library first
            </div>
            <a
              href="/dashboard/library/new"
              className="text-body-sm"
              style={{ color: 'var(--ember)', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              Add new item →
            </a>
          </div>
        ) : (
          <>
            {/* ON CANVAS / SYNTHESISED section */}
            {onCanvas.length > 0 && (
              <div>
                <div className="font-mono" style={{
                  fontSize: 7.5, padding: '6px 6px 4px',
                  color: canvasState === 'post-preview' ? 'var(--ember)' : 'var(--ember)',
                  opacity: 0.55,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {canvasState === 'post-preview' ? `SYNTHESISED (${onCanvas.length})` : `ON CANVAS (${onCanvas.length})`}
                </div>

                {onCanvas.map((item, i) => {
                  const id = String(item._id)
                  return (
                    <button
                      key={id}
                      onClick={() => isIdle && onToggle(id)}
                      disabled={!isIdle && canvasState !== 'session'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderLeft: canvasState === 'post-preview'
                          ? '1.5px solid rgba(255,107,53,0.28)'
                          : '1.5px solid rgba(255,107,53,0.35)',
                        padding: '5px 8px',
                        cursor: isIdle ? 'pointer' : 'default',
                        marginBottom: 1,
                        transition: 'all 150ms ease',
                      }}
                    >
                      {canvasState === 'post-preview' ? (
                        /* Ember dot */
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: 'var(--ember)', flexShrink: 0,
                        }} />
                      ) : (
                        /* Filled checkbox */
                        <div style={{
                          width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                          background: 'var(--ember)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="8" height="8" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="font-mono" style={{
                          fontSize: 12, color: canvasState === 'post-preview' ? 'var(--text-muted)' : 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.title}
                        </div>
                        {canvasState === 'post-preview' && (
                          <div className="font-mono" style={{
                            fontSize: 12, color: 'var(--ember)', opacity: 0.5,
                            textTransform: 'uppercase', marginTop: 1,
                          }}>
                            {i === 0 ? 'PRIMARY' : 'SUPPORTING'}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* LIBRARY section (hidden in post-preview) */}
            {canvasState !== 'post-preview' && library.length > 0 && (
              <div style={{ marginTop: onCanvas.length > 0 ? 8 : 0 }}>
                <div className="font-mono" style={{
                  fontSize: 7.5, padding: '6px 6px 4px',
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  LIBRARY ({library.length})
                </div>

                {library.map((item) => {
                  const id = String(item._id)
                  return (
                    <button
                      key={id}
                      onClick={() => isIdle && onToggle(id)}
                      disabled={!isIdle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderLeft: '1.5px solid transparent',
                        padding: '5px 8px',
                        cursor: isIdle ? 'pointer' : 'default',
                        marginBottom: 1,
                        transition: 'all 150ms ease',
                        opacity: isIdle ? 1 : 0.4,
                      }}
                    >
                      {/* Empty checkbox */}
                      <div style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                      }} />

                      <div className="font-mono" style={{
                        fontSize: 12, color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}>
                        {item.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Footer ─── */}
      <div style={{ padding: '8px 8px', borderTop: '0.5px solid var(--border)', flexShrink: 0 }}>
        {canvasState === 'constellation' && sources.length > 0 && (
          <button
            onClick={onStartSession}
            disabled={selectedIds.size < 2}
            style={{
              width: '100%',
              padding: '8px 0',
              background: selectedIds.size < 2 ? 'var(--bg-elevated)' : 'var(--ember)',
              color: selectedIds.size < 2 ? 'var(--text-muted)' : 'var(--bg-page)',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-inter), sans-serif',
              cursor: selectedIds.size < 2 ? 'not-allowed' : 'pointer',
              opacity: selectedIds.size < 2 ? 0.4 : 1,
              transition: 'all 150ms ease',
            }}
          >
            Start Session →
          </button>
        )}

        {canvasState === 'session' && (
          <div style={{
            background: 'var(--ember-muted)',
            border: '0.5px solid rgba(255,107,53,0.25)',
            borderRadius: 4,
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
            <span className="font-mono" style={{ fontSize: 8, color: 'var(--ember)', opacity: 0.8 }}>
              Session active
            </span>
          </div>
        )}

        {canvasState === 'post-preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={onBackToSession}
              style={{
                width: '100%', padding: '6px 0', borderRadius: 4,
                background: 'var(--ember-muted)', border: '0.5px solid rgba(255,107,53,0.22)',
                color: 'var(--ember)', fontSize: 10, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              ← Back to session
            </button>
            <button
              onClick={onNewSession}
              style={{
                width: '100%', padding: '6px 0', borderRadius: 4,
                background: 'transparent', border: '0.5px solid rgba(255,255,255,0.06)',
                color: 'var(--text-muted)', fontSize: 10, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              New canvas session
            </button>
          </div>
        )}
      </div>
    </>
  )
}
