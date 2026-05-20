'use client'

import { useState } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/time'
import Link from 'next/link'
import { Id } from '../../../../convex/_generated/dataModel'

const AGENTS = {
  authority: {
    name: 'The Authority',
    platform: 'LinkedIn',
    voiceCode: 'E-LI-772',
    color: '#FF6B35',
    bg: 'var(--ember-muted)',
    borderColor: 'var(--ember)',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 16 16" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 14 C2 9 5 3 12 2"/><path d="M6 14 C6 10 8.5 6 12 5"/>
        <line x1="4" y1="1.5" x2="7" y2="14.5" stroke="#EDE8E0" strokeWidth="1.2"/>
      </svg>
    ),
  },
  catalyst: {
    name: 'The Catalyst',
    platform: 'X/Twitter',
    voiceCode: 'E-TW-119',
    color: '#378ADD',
    bg: 'rgba(55,138,221,0.1)',
    borderColor: 'var(--border)',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 16 16" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 14 C2 9 5 3 12 2"/><path d="M6 14 C6 10 8.5 6 12 5"/>
        <line x1="4" y1="1.5" x2="7" y2="14.5" stroke="#EDE8E0" strokeWidth="1.2"/>
      </svg>
    ),
  },
}

type AgentKey = keyof typeof AGENTS

/* ── Voice match badge ── */
function VoiceMatchBadge({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) return null
  const color = score >= 80 ? 'var(--ember)' : score >= 60 ? '#EF9F27' : 'var(--text-muted)'
  const bg = score >= 80 ? 'rgba(255,107,53,0.12)' : score >= 60 ? 'rgba(239,159,39,0.1)' : 'var(--bg-elevated)'
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
      borderRadius: 20, background: bg, color, border: `0.5px solid ${color}`,
    }}>
      {score}% match
    </span>
  )
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'var(--bg-elevated)', color: 'var(--text-muted)', label: 'Draft' },
    review: { bg: 'rgba(239,159,39,0.1)', color: '#EF9F27', label: 'Review' },
    approved: { bg: 'rgba(29,158,117,0.1)', color: '#1D9E75', label: 'Approved' },
    scheduled: { bg: 'rgba(55,138,221,0.1)', color: '#378ADD', label: 'Scheduled' },
    published: { bg: 'rgba(29,158,117,0.15)', color: '#1D9E75', label: 'Published' },
    rejected: { bg: 'rgba(220,60,60,0.1)', color: '#DC3C3C', label: 'Rejected' },
  }
  const s = map[status] ?? map.draft
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
      borderRadius: 20, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

export default function AgentsPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()

  const allPosts = useQuery(
    api.posts.list,
    profile ? { userId: profile._id } : 'skip',
  )
  const updateStatus = useMutation(api.posts.updateStatus)
  const scheduleMut = useMutation(api.posts.schedule)
  const removePost = useMutation(api.posts.remove)
  const regenerateAction = useAction(api.generation.regeneratePost)

  const [activeTab, setActiveTab] = useState<AgentKey>('authority')
  const [schedulingPostId, setSchedulingPostId] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [feedbackPostId, setFeedbackPostId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const updatePost = useMutation(api.posts.update)

  const isLoading = profileLoading || allPosts === undefined

  // Split by agent
  const postsByAgent = (agent: AgentKey) => allPosts?.filter((p) => p.agent === agent) ?? []
  const draftsByAgent = (agent: AgentKey) => postsByAgent(agent).filter((p) => p.status === 'draft' || p.status === 'review')
  const totalByAgent = (agent: AgentKey) => postsByAgent(agent).length
  const avgVoiceMatch = (agent: AgentKey) => {
    const posts = postsByAgent(agent).filter((p) => p.voiceMatchScore !== undefined)
    if (posts.length === 0) return '—'
    const avg = posts.reduce((sum, p) => sum + (p.voiceMatchScore ?? 0), 0) / posts.length
    return `${Math.round(avg)}%`
  }

  const handleApprove = async (postId: string) => {
    await updateStatus({ postId: postId as Id<"agentPosts">, status: 'approved' })
    setToast('Post approved ✓')
    setTimeout(() => setToast(null), 3000)
  }

  const handleScheduleConfirm = async (postId: string) => {
    if (!scheduleDate) return
    const ts = new Date(scheduleDate).getTime()
    if (ts <= Date.now()) { setToast('Pick a future date'); return }
    await scheduleMut({ postId: postId as Id<"agentPosts">, scheduledAt: ts })
    setSchedulingPostId(null)
    setScheduleDate('')
    const formatted = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    setToast(`Scheduled for ${formatted} ✓`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleRegenerate = async (postId: string) => {
    if (!feedbackText.trim()) return
    setIsRegenerating(true)
    try {
      await regenerateAction({ postId: postId as Id<"agentPosts">, feedback: feedbackText.trim() })
      setFeedbackPostId(null)
      setFeedbackText('')
      setToast('New draft created ✓')
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setToast(`Error: ${e instanceof Error ? e.message : 'Regeneration failed'}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDiscard = async (postId: string) => {
    if (!window.confirm('Discard this draft? This cannot be undone.')) return
    await removePost({ postId: postId as Id<"agentPosts"> })
  }

  const handleSaveEdit = async (postId: string) => {
    if (!editBody.trim()) return
    await updatePost({ postId: postId as Id<"agentPosts">, body: editBody.trim() })
    setEditingPostId(null)
    setEditBody('')
    setToast('Post updated \u2713')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>(03) — Agents</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Approval <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>queue.</em></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>Drafts generated on Canvas land here. Review, edit, then publish or schedule.</div>

      {/* Toast */}
      {toast && (
        <div style={{
          background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.25)',
          borderRadius: 7, padding: '7px 12px', marginBottom: 14,
          fontSize: 12, color: 'var(--ember)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {toast}
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid var(--border)', marginBottom: 20 }}>
        {[
          { key: 'authority' as AgentKey, label: 'The Authority', sub: 'LinkedIn' },
          { key: 'catalyst' as AgentKey, label: 'The Catalyst', sub: 'X / Twitter' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--ember)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--ember)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 500 : 400,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tab.label}
            <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.6 }}>{tab.sub}</span>
          </button>
        ))}
      </div>

      {/* Coming soon banner for Catalyst */}
      {activeTab === 'catalyst' && (
        <div style={{
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--ember-muted)',
          border: '0.5px solid var(--ember)',
          borderRadius: 8, fontSize: 12,
          color: 'var(--ember)',
        }}>
          The Catalyst (X/Twitter) is coming in V2. The Authority is your active agent for now.
        </div>
      )}

      {/* Active agent content — full width */}
      <div>
        {(() => {
          const agentKey = activeTab
          const agent = AGENTS[agentKey]
          const posts = postsByAgent(agentKey)
          const drafts = draftsByAgent(agentKey)
          const total = totalByAgent(agentKey)

          return (
            <div style={{
              background: 'var(--bg-surface)',
              border: `0.5px solid ${agent.borderColor}`,
              borderRadius: 13, padding: 20,
            }}>
              {/* Agent header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: agent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {agent.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{agent.platform} · Voice: {agent.voiceCode}</div>
                </div>
                {drafts.length > 0 ? (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                    borderRadius: 20, background: 'rgba(239,159,39,0.1)', color: 'var(--warning)',
                  }}>
                    {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                    borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                  }}>
                    Idle
                  </span>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 14 }}>
                {isLoading ? (
                  <>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: 9, textAlign: 'center' }}>
                        <Skeleton className="h-5 rounded mx-auto" style={{ width: 32, marginBottom: 4 }} />
                        <Skeleton className="h-2.5 rounded mx-auto" style={{ width: 48 }} />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: 9, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: agent.color }}>{total}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>total posts</div>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: 9, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--text-primary)' }}>{avgVoiceMatch(agentKey)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>voice match</div>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 7, padding: 9, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--text-primary)' }}>{drafts.length}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>pending</div>
                    </div>
                  </>
                )}
              </div>

              {/* All posts section */}
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Posts</div>

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[0,1].map(i => (
                    <div key={i} style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 9, padding: 13 }}>
                      <Skeleton className="h-3 rounded" style={{ width: '80%', marginBottom: 6 }} />
                      <Skeleton className="h-3 rounded" style={{ width: '60%', marginBottom: 6 }} />
                      <Skeleton className="h-3 rounded" style={{ width: '40%' }} />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '24px 16px',
                  background: 'var(--bg-elevated)', borderRadius: 9,
                  border: '0.5px dashed var(--border)',
                }}>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>No drafts yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-faint)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5, marginBottom: 12 }}>
                    Drafts will appear here when your agents generate posts from Canvas synthesis.
                  </div>
                  <Link href="/dashboard/canvas" style={{ fontSize: 13, color: 'var(--ember)', textDecoration: 'none' }}>
                    Go to Canvas →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {posts.map((post) => (
                    <div key={post._id} style={{
                      background: 'var(--bg-elevated)', border: '0.5px solid var(--border)',
                      borderRadius: 9, padding: 13, cursor: 'default',
                    }}>
                      {/* Title + badges row */}
                      {post.title && (
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                          {post.title}
                        </div>
                      )}

                      {/* Post body — expand/collapse + inline edit */}
                      {editingPostId === post._id ? (
                        /* Inline edit mode */
                        <div style={{ marginBottom: 9 }}>
                          <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            style={{
                              width: '100%', minHeight: 200, background: 'var(--bg-surface)',
                              border: '1px solid var(--border)', borderRadius: 7,
                              padding: 12, color: 'var(--text-primary)',
                              fontSize: 14, lineHeight: 1.6, outline: 'none',
                              resize: 'vertical', fontFamily: "'Inter', sans-serif",
                            }}
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button
                              onClick={() => handleSaveEdit(post._id)}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none',
                                background: 'var(--ember)', color: '#fff',
                                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              }}
                            >Save changes</button>
                            <button
                              onClick={() => { setEditingPostId(null); setEditBody('') }}
                              style={{
                                padding: '5px 10px', borderRadius: 6,
                                border: '0.5px solid var(--border)', background: 'transparent',
                                color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : expandedPostId === post._id ? (
                        /* Expanded view */
                        <div style={{ marginBottom: 9 }}>
                          <div style={{
                            fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                          }}>
                            {post.body}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button
                              onClick={() => setExpandedPostId(null)}
                              style={{
                                fontSize: 12, color: 'var(--text-muted)', background: 'none',
                                border: 'none', cursor: 'pointer', padding: 0,
                              }}
                            >Collapse ↑</button>
                            <button
                              onClick={() => { setEditingPostId(post._id); setEditBody(post.body) }}
                              style={{
                                fontSize: 12, color: 'var(--ember)', background: 'none',
                                border: 'none', cursor: 'pointer', padding: 0,
                              }}
                            >Edit post</button>
                          </div>
                        </div>
                      ) : (
                        /* Collapsed view */
                        <div style={{ marginBottom: 9 }}>
                          <div style={{
                            fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 13,
                            color: 'var(--text-primary)', lineHeight: 1.6,
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            &ldquo;{post.body}&rdquo;
                          </div>
                          <button
                            onClick={() => setExpandedPostId(post._id)}
                            style={{
                              fontSize: 12, color: 'var(--text-muted)', background: 'none',
                              border: 'none', cursor: 'pointer', padding: 0, marginTop: 4,
                            }}
                          >Read full post ↓</button>
                        </div>
                      )}

                      {/* Meta badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 9 }}>
                        <StatusBadge status={post.status} />
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                          borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                          border: '0.5px solid var(--border)',
                        }}>
                          {post.platform === 'linkedin' ? 'LinkedIn' : 'X'}
                        </span>
                        <VoiceMatchBadge score={post.voiceMatchScore} />
                        {post.scheduledAt && (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                            borderRadius: 20, background: 'rgba(55,138,221,0.1)', color: '#378ADD',
                          }}>
                            {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-faint)', marginLeft: 'auto' }}>
                          {timeAgo(post._creationTime)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {(post.status === 'draft' || post.status === 'review') && (
                          <>
                            <button
                              onClick={() => handleApprove(post._id)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7,
                                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                background: 'rgba(29,158,117,0.1)', color: '#1D9E75',
                                border: '0.5px solid rgba(29,158,117,0.2)', fontFamily: "'Inter', sans-serif",
                              }}
                            >✓ Approve</button>
                            <button
                              onClick={() => {
                                setFeedbackPostId(feedbackPostId === post._id ? null : post._id)
                                setFeedbackText('')
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7,
                                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                border: '0.5px solid var(--border)', background: feedbackPostId === post._id ? 'var(--ember-muted)' : 'var(--bg-elevated)',
                                color: feedbackPostId === post._id ? 'var(--ember)' : 'var(--text-primary)', fontFamily: "'Inter', sans-serif",
                              }}
                            >Feedback</button>
                          </>
                        )}
                        {post.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSchedulingPostId(schedulingPostId === post._id ? null : post._id)
                              setScheduleDate('')
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7,
                              fontSize: 11, fontWeight: 500, cursor: 'pointer',
                              border: '0.5px solid rgba(55,138,221,0.3)', background: 'rgba(55,138,221,0.1)',
                              color: '#378ADD', fontFamily: "'Inter', sans-serif",
                            }}
                          >📅 Schedule</button>
                        )}
                        <button
                          onClick={() => handleDiscard(post._id)}
                          style={{
                            padding: 6, width: 28, height: 28, borderRadius: 7,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            border: '0.5px solid var(--border)', background: 'transparent',
                            color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: "'Inter', sans-serif",
                          }}
                        >✕</button>
                      </div>

                      {/* Schedule picker (inline) */}
                      {schedulingPostId === post._id && (
                        <div style={{
                          marginTop: 8, padding: '8px 10px', background: 'var(--bg-surface)',
                          border: '0.5px solid var(--border)', borderRadius: 7,
                          display: 'flex', gap: 6, alignItems: 'center',
                        }}>
                          <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            style={{
                              flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)',
                              fontSize: 12, outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleScheduleConfirm(post._id)}
                            disabled={!scheduleDate}
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: 'none',
                              background: scheduleDate ? 'var(--ember)' : 'var(--bg-elevated)',
                              color: scheduleDate ? '#fff' : 'var(--text-muted)',
                              fontSize: 11, fontWeight: 600, cursor: scheduleDate ? 'pointer' : 'default',
                            }}
                          >Confirm</button>
                          <button
                            onClick={() => setSchedulingPostId(null)}
                            style={{
                              padding: '5px 8px', borderRadius: 6,
                              border: '0.5px solid var(--border)', background: 'transparent',
                              color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                            }}
                          >Cancel</button>
                        </div>
                      )}

                      {/* Feedback + regenerate (inline) */}
                      {feedbackPostId === post._id && (
                        <div style={{
                          marginTop: 8, padding: '8px 10px', background: 'var(--bg-surface)',
                          border: '0.5px solid var(--border)', borderRadius: 7,
                        }}>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="What should the agent change? Be specific..."
                            rows={3}
                            style={{
                              width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              borderRadius: 6, padding: '7px 10px', color: 'var(--text-primary)',
                              fontSize: 12, outline: 'none', resize: 'vertical',
                              fontFamily: "'Inter', sans-serif", marginBottom: 6,
                            }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleRegenerate(post._id)}
                              disabled={isRegenerating || !feedbackText.trim()}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none',
                                background: feedbackText.trim() ? 'var(--ember)' : 'var(--bg-elevated)',
                                color: feedbackText.trim() ? '#fff' : 'var(--text-muted)',
                                fontSize: 11, fontWeight: 600, cursor: feedbackText.trim() ? 'pointer' : 'default',
                              }}
                            >{isRegenerating ? 'Regenerating…' : 'Regenerate →'}</button>
                            <button
                              onClick={() => { setFeedbackPostId(null); setFeedbackText('') }}
                              style={{
                                padding: '5px 8px', borderRadius: 6,
                                border: '0.5px solid var(--border)', background: 'transparent',
                                color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
