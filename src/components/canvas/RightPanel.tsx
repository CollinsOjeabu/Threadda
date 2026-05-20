'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { AgentHeader } from './AgentHeader'
import type { Id } from '../../../convex/_generated/dataModel'

interface RightPanelProps {
  canvasState: 'constellation' | 'session' | 'post-preview'
  activeAgent: 'authority' | 'catalyst'
  onAgentChange: (agent: 'authority' | 'catalyst') => void
  sessionId: Id<'canvasSessions'> | null
  chatMessages: Array<{ role: 'user' | 'agent' | 'system'; content: string }>
  onSendMessage: (message: string) => Promise<void>
  onGeneratePost: () => Promise<void>
  onRefine: (instruction: string) => Promise<void>
  isGenerating: boolean
  sourcesCount: number
}

const REFINEMENT_CHIPS = [
  { label: 'Make it punchier', instruction: 'Make the opening hook punchier and the overall tone more direct. Remove any filler phrases.' },
  { label: 'Add a hot take', instruction: 'Add a bold, contrarian point of view that challenges conventional wisdom.' },
  { label: 'More storytelling', instruction: 'Rewrite with a narrative arc — open with a personal story or anecdote, then draw the insight.' },
  { label: 'Shorten to 150 words', instruction: 'Compress to under 150 words while keeping the core insight and hook.' },
  { label: 'Add data points', instruction: 'Add specific numbers, percentages, or data points to make the argument more credible.' },
]

/**
 * Right panel — 3 sub-states:
 * 1. Agent selector cards (constellation)
 * 2. Chat interface (session)
 * 3. Refinement mode (post-preview)
 */
export function RightPanel({
  canvasState,
  activeAgent,
  onAgentChange,
  sessionId,
  chatMessages,
  onSendMessage,
  onGeneratePost,
  onRefine,
  isGenerating,
  sourcesCount,
}: RightPanelProps) {
  const [input, setInput] = useState('')
  const [refinementInput, setRefinementInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Focus input when session starts
  useEffect(() => {
    if (canvasState === 'session' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [canvasState])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    const msg = input
    setInput('')
    await onSendMessage(msg)
  }, [input, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleRefinement = useCallback(async (instruction: string) => {
    await onRefine(instruction)
  }, [onRefine])

  const handleCustomRefinement = useCallback(async () => {
    if (!refinementInput.trim()) return
    const msg = refinementInput
    setRefinementInput('')
    await onRefine(msg)
  }, [refinementInput, onRefine])

  // State 3: right panel is collapsed — PostPreview handles everything
  if (canvasState === 'post-preview') return null

  return (
    <>
      {/* Agent Header */}
      <AgentHeader
        canvasState={canvasState}
        activeAgent={activeAgent}
        sourcesCount={sourcesCount}
      />

      {/* ═══ STATE 1: Agent Selector ═══ */}
      {canvasState === 'constellation' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 8px', overflowY: 'auto' }}>
          <div className="font-mono" style={{
            fontSize: 7.5, color: 'var(--text-faint)', padding: '4px 4px 8px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            SELECT AGENT
          </div>

          {/* Authority card */}
          <AgentCard
            name="The Authority"
            code="E-LI-772"
            platform="LinkedIn"
            description="Long-form thought leadership. Builds credibility and attracts high-value connections."
            isSelected={activeAgent === 'authority'}
            onClick={() => onAgentChange('authority')}
          />

          {/* Catalyst card — locked */}
          <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
            <AgentCard
              name="The Catalyst"
              code="E-TW-119"
              platform="X / Twitter"
              description="Punchy, viral-ready takes. Sparks debate and grows your audience fast."
              isSelected={activeAgent === 'catalyst'}
              onClick={() => onAgentChange('catalyst')}
            />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)', fontSize: 10,
              color: 'var(--text-muted)', letterSpacing: '0.08em',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              COMING SOON
            </div>
          </div>

          {/* Hint */}
          <div style={{
            marginTop: 'auto', padding: '10px 6px',
            textAlign: 'center',
          }}>
            <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-faint)' }}>
              Select sources + click &quot;Start Session&quot;
            </div>
          </div>
        </div>
      )}

      {/* ═══ STATE 2: Chat Interface ═══ */}
      {canvasState === 'session' && (
        <>
          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 6,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '6px 9px',
                  borderRadius: 6,
                  background: msg.role === 'user' ? 'var(--ember-muted)' : 'var(--bg-surface)',
                  border: `0.5px solid ${msg.role === 'user' ? 'rgba(255,107,53,0.18)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div style={{
                    fontSize: 13, color: 'var(--text-primary)',
                    lineHeight: 1.6,
                  }}>
                    {msg.content === '...' ? (
                      <span style={{ color: 'var(--text-muted)', animation: 'pulse 1s ease-in-out infinite' }}>
                        Thinking...
                      </span>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p style={{margin: '0 0 6px 0'}}>{children}</p>,
                          strong: ({children}) => <strong style={{fontWeight: 600, color: 'var(--text-primary)'}}>{children}</strong>,
                          em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>,
                          ul: ({children}) => <ul style={{margin: '4px 0', paddingLeft: 16}}>{children}</ul>,
                          li: ({children}) => <li style={{marginBottom: 2}}>{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Lightbulb + Generate */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', flexShrink: 0,
          }}>
            <button
              onClick={onGeneratePost}
              disabled={isGenerating}
              style={{
                background: 'rgba(255,107,53,0.1)', border: '0.5px solid rgba(255,107,53,0.18)',
                borderRadius: 4, padding: '4px 8px', cursor: isGenerating ? 'wait' : 'pointer',
                fontSize: 10, color: isGenerating ? 'var(--text-muted)' : 'var(--ember)',
              }}
            >
              💡 Synthesise
            </button>

            <button
              onClick={onGeneratePost}
              disabled={isGenerating}
              className="font-mono"
              style={{
                marginLeft: 'auto',
                background: 'none', border: 'none',
                fontSize: 9, color: isGenerating ? 'var(--text-muted)' : 'var(--ember)',
                cursor: isGenerating ? 'wait' : 'pointer',
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate post →'}
            </button>
          </div>

          {/* Input bar */}
          <div style={{
            padding: '8px 8px', borderTop: '0.5px solid var(--border)', flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '6px 10px',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--text-primary)',
                  fontSize: 13, padding: '6px 6px',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  background: input.trim() ? 'var(--ember)' : 'var(--bg-elevated)',
                  color: input.trim() ? 'var(--bg-page)' : 'var(--text-muted)',
                  border: 'none', borderRadius: 4,
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'default',
                  fontSize: 12, flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* ─── Agent Selector Card ─── */
function AgentCard({
  name, code, platform, description, isSelected, onClick,
}: {
  name: string; code: string; platform: string; description: string
  isSelected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isSelected ? 'var(--ember-muted)' : 'var(--bg-page)',
        border: `0.5px solid ${isSelected ? 'rgba(255,107,53,0.28)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 6,
        padding: '10px 10px',
        textAlign: 'left',
        cursor: 'pointer',
        marginBottom: 4,
        transition: 'all 150ms ease',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="font-mono" style={{
          fontSize: 8.5,
          color: isSelected ? 'var(--ember)' : 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {name}
        </span>
        <span className="font-mono" style={{
          fontSize: 7, color: 'var(--text-faint)',
          padding: '1px 5px', borderRadius: 3,
          background: isSelected ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.04)',
        }}>
          {code}
        </span>
      </div>
      <div className="font-mono" style={{
        fontSize: 7.5, color: isSelected ? 'var(--ember)' : 'var(--text-muted)',
        opacity: isSelected ? 0.7 : 1,
        marginBottom: 4,
      }}>
        {platform}
      </div>
      <div style={{
        fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5,
      }}>
        {description}
      </div>
    </button>
  )
}
