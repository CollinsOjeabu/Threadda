'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useState, useEffect } from 'react'

function Skel({ w, h }: { w: number; h: number }) {
  return <div style={{ width: w, height: h, borderRadius: 4, background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DashboardHome() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const contentItems = useQuery(api.content.list, profile?._id ? { userId: profile._id } : 'skip')
  const agentPosts = useQuery(api.posts.list, profile?._id ? { userId: profile._id } : 'skip')

  // Content ideas
  const [ideas, setIdeas] = useState<Array<{ title: string; sourceCount: number; agent: string; sourceIds: string[] }>>([])
  const [ideasLoading, setIdeasLoading] = useState(false)
  const generateIdeas = useAction(api.ideas.getForUser)

  useEffect(() => {
    if (profile?._id && contentItems && contentItems.length >= 1 && ideas.length === 0 && !ideasLoading) {
      setIdeasLoading(true)
      generateIdeas().then((r) => { setIdeas(r); setIdeasLoading(false) }).catch(() => setIdeasLoading(false))
    }
  }, [profile?._id, contentItems, ideas.length, ideasLoading, generateIdeas])

  const firstName = profile?.name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const libraryCount = contentItems?.length ?? 0
  const publishedPosts = agentPosts?.filter((p: any) => p.status === 'published') ?? []
  const pendingDrafts = agentPosts?.filter((p: any) => p.status === 'draft' || p.status === 'review') ?? []
  const linkedinDrafts = pendingDrafts.filter((p: any) => p.platform === 'linkedin')
  const xDrafts = pendingDrafts.filter((p: any) => p.platform === 'x')
  const scoredPosts = agentPosts?.filter((p: any) => typeof p.voiceMatchScore === 'number') ?? []
  const avgVoice = scoredPosts.length > 0 ? Math.round(scoredPosts.reduce((s: number, p: any) => s + p.voiceMatchScore, 0) / scoredPosts.length) : null

  const loading = contentItems === undefined || agentPosts === undefined

  // Build activity timeline
  const activities: Array<{ icon: string; text: string; bold: string; time: number }> = []
  if (agentPosts) {
    for (const p of agentPosts) {
      if (p.status === 'draft') activities.push({ icon: 'bolt', bold: p.agent === 'authority' ? 'The Authority' : 'The Catalyst', text: ` generated a draft from ${p.sourceContentIds.length} sources`, time: p._creationTime })
      if (p.status === 'approved') activities.push({ icon: 'check', bold: 'Draft approved', text: ' — queued for publishing', time: p._creationTime })
      if (p.status === 'scheduled' && p.scheduledAt) activities.push({ icon: 'cal', bold: 'Post scheduled', text: ` for ${new Date(p.scheduledAt).toLocaleDateString()}`, time: p._creationTime })
    }
  }
  if (contentItems) {
    for (const c of contentItems.slice(0, 3)) {
      activities.push({ icon: 'plus', bold: `"${c.title.slice(0, 40)}"`, text: ' added to library', time: c._creationTime })
    }
  }
  activities.sort((a, b) => b.time - a.time)

  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        {userLoading ? <Skel w={200} h={24} /> : (
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
            {greeting}, <em style={{ color: 'var(--ember)', fontStyle: 'italic', fontFamily: "'DM Serif Display', serif" }}>{firstName}.</em>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{dateStr}</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="Library items" value={loading ? null : String(libraryCount)} />
        <StatCard label="Graph connections" value={loading ? null : '0'} sub="Builds as your library grows" />
        <StatCard label="Posts published" value={loading ? null : String(publishedPosts.length)} />
        <StatCard label="Avg voice match" value={loading ? null : avgVoice !== null ? `${avgVoice}%` : '—'} sub={avgVoice === null ? 'Train your voice to see this' : undefined} />
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left — Content Ideas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: "'Inter', sans-serif" }}>Content ideas</span>
            {ideas.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-faint)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ember)', animation: 'pulse 2s infinite' }} />
                agents thinking
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 20 }}>
              <Skel w={200} h={14} /><div style={{ marginTop: 8 }}><Skel w={280} h={10} /></div>
            </div>
          ) : libraryCount < 1 ? (
            <div style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: 8, padding: 24, textAlign: 'center' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }}>
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z"/>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>Add research to get started</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, maxWidth: 280, margin: '0 auto 14px' }}>
                Save articles to your library. Once you have 3+ sources, your agents will brainstorm content ideas.
              </div>
              <Link href="/dashboard/library/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500, border: '0.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', textDecoration: 'none' }}>Add to library →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {ideasLoading ? (
                [0,1,2].map(i => <div key={i} style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '9px 11px' }}><Skel w={220} h={12} /><div style={{ marginTop: 6 }}><Skel w={140} h={9} /></div></div>)
              ) : ideas.length > 0 ? ideas.map((idea, i) => (
                <div key={i} style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '9px 11px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45 }}>{idea.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{idea.sourceCount} sources · {idea.agent === 'authority' ? 'The Authority' : 'The Catalyst'}</span>
                    <Link href="/dashboard/canvas" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ember)', textDecoration: 'none' }}>Open in Canvas →</Link>
                  </div>
                </div>
              )) : (
                <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>You have {libraryCount} research item{libraryCount > 1 ? 's' : ''} ready</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Open the Canvas to connect your sources and generate content.</div>
                  <Link href="/dashboard/canvas" style={{ display: 'inline-flex', padding: '5px 10px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: 'var(--ember)', color: '#fff', textDecoration: 'none' }}>Open Canvas →</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Agents + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Agent status */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>Agent status</div>
            <AgentCard
              name="The Authority" platform="LinkedIn · E-LI-772"
              avatarBg="rgba(255,107,53,0.15)" avatarColor="var(--ember)"
              drafts={linkedinDrafts.length} loading={loading}
            />
            <div style={{ height: 8 }} />
            <AgentCard
              name="The Catalyst" platform="X/Twitter · E-TW-119"
              avatarBg="rgba(29,158,117,0.15)" avatarColor="var(--success)"
              drafts={xDrafts.length} loading={loading}
            />
          </div>

          {/* Recent activity */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>Recent activity</div>
            <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 14 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><Skel w={240} h={11} /><Skel w={180} h={11} /></div>
              ) : activities.length > 0 ? (
                activities.slice(0, 5).map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: i < Math.min(activities.length, 5) - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" fill="none" viewBox="0 0 12 12" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round">
                        {a.icon === 'bolt' && <path d="M6.5 1L3 7h3l-.5 4L10 5H7l.5-4z"/>}
                        {a.icon === 'check' && <><circle cx="6" cy="6" r="4.5"/><path d="M4 6l1.5 1.5L8 4.5"/></>}
                        {a.icon === 'cal' && <><rect x="1" y="2" width="10" height="8.5" rx="1.5"/><line x1="1" y1="5" x2="11" y2="5"/></>}
                        {a.icon === 'plus' && <><line x1="6" y1="2" x2="6" y2="10"/><line x1="2" y1="6" x2="10" y2="6"/></>}
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.bold}</strong>{a.text}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{timeAgo(a.time)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 12 12" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round"><path d="M6.5 1L3 7h3l-.5 4L10 5H7l.5-4z"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Your activity will appear as you start using Threadda.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCard({ label, value, sub }: { label: string; value: string | null; sub?: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {value === null ? <Skel w={36} h={22} /> : (
        <div style={{ fontSize: 22, fontWeight: 500, color: value === '0' || value === '—' ? 'var(--text-faint)' : 'var(--ember)', lineHeight: 1 }}>{value}</div>
      )}
      {sub && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  )
}

/* ─── Agent Card ─── */
function AgentCard({ name, platform, avatarBg, avatarColor, drafts, loading }: {
  name: string; platform: string; avatarBg: string; avatarColor: string; drafts: number; loading: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '9px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 14 14" stroke={avatarColor} strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v3M4 5l2.5 2M10 5l-2.5 2M7 7v4"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{platform}</div>
        </div>
        {loading ? <Skel w={44} h={16} /> : drafts > 0 ? (
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: 10, background: 'rgba(239,159,39,0.1)', color: '#EF9F27' }}>Awaiting</span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: 10, background: 'var(--success-muted)', color: 'var(--success)' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--success)' }} />Ready
          </span>
        )}
      </div>
      {drafts > 0 ? (
        <Link href="/dashboard/agents" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, border: '0.5px solid rgba(255,107,53,0.2)', color: 'var(--ember)', textDecoration: 'none' }}>
          Review {drafts} draft{drafts > 1 ? 's' : ''} →
        </Link>
      ) : (
        <Link href="/dashboard/canvas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, border: '0.5px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}>
          Generate from Canvas →
        </Link>
      )}
    </div>
  )
}
