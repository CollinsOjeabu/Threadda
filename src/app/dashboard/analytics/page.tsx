'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Content type config ─── */
const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  article: { label: 'Articles', color: 'var(--ember)', bg: 'var(--ember-muted)' },
  note:    { label: 'Notes',    color: 'var(--success)', bg: 'var(--success-muted)' },
  pdf:     { label: 'PDFs',     color: 'var(--info)', bg: 'rgba(55,138,221,0.1)' },
  video:   { label: 'Videos',   color: 'var(--warning)', bg: 'rgba(239,159,39,0.1)' },
  tweet:   { label: 'Tweets',   color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
}

/* ─── Helpers ─── */
function getWeekLabel(ts: number) {
  const d = new Date(ts)
  const start = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `W${weekNum}`
}

function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-3 w-24 rounded mb-3" />
        <Skeleton className="h-7 w-14 rounded mb-2" />
        <Skeleton className="h-2.5 w-32 rounded" />
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { profile, isLoading: userLoading } = useCurrentUser()

  const allPosts = useQuery(api.posts.list, {})
  const allContent = useQuery(api.content.list, {})

  const isLoading = userLoading || allPosts === undefined || allContent === undefined

  /* ─── Computed stats ─── */
  const totalLibraryItems = allContent?.length ?? 0
  const totalPosts = allPosts?.length ?? 0
  const publishedPosts = allPosts?.filter((p: { status: string }) => p.status === 'published').length ?? 0
  const draftPosts = allPosts?.filter((p: { status: string }) => p.status === 'draft').length ?? 0
  const approvedPosts = allPosts?.filter((p: { status: string }) => p.status === 'approved').length ?? 0
  const authorityPosts = allPosts?.filter((p: { agent: string }) => p.agent === 'authority').length ?? 0
  const catalystPosts = allPosts?.filter((p: { agent: string }) => p.agent === 'catalyst').length ?? 0

  /* ─── Content type breakdown ─── */
  const typeCounts: Record<string, number> = {}
  allContent?.forEach((c: { type: string }) => {
    typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1
  })
  const typeEntries = Object.entries(typeCounts).filter(([, count]) => count > 0)
  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c), 1)

  /* ─── Library growth by week ─── */
  const weekCounts: Record<string, number> = {}
  allContent?.forEach((c: { _creationTime: number }) => {
    const label = getWeekLabel(c._creationTime)
    weekCounts[label] = (weekCounts[label] ?? 0) + 1
  })
  const weekEntries = Object.entries(weekCounts).slice(-8)
  const maxWeekCount = Math.max(...weekEntries.map(([, c]) => c), 1)

  /* ─── Post pipeline breakdown ─── */
  const pipelineStatuses = [
    { label: 'Draft', count: draftPosts, color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
    { label: 'Approved', count: approvedPosts, color: 'var(--warning)', bg: 'rgba(239,159,39,0.15)' },
    { label: 'Scheduled', count: allPosts?.filter((p: { status: string }) => p.status === 'scheduled').length ?? 0, color: 'var(--ember)', bg: 'var(--ember-muted)' },
    { label: 'Published', count: publishedPosts, color: 'var(--success)', bg: 'var(--success-muted)' },
  ]
  const pipelineTotal = pipelineStatuses.reduce((sum, s) => sum + s.count, 0)

  /* ─── Items added this week ─── */
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const itemsThisWeek = allContent?.filter((c: { _creationTime: number }) => c._creationTime >= weekAgo).length ?? 0

  /* ─── Recent library items for "top sources" ─── */
  const recentSources = allContent?.slice(0, 4) ?? []

  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>(05) — Analytics</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Performance &amp; <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>insights.</em></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>
        {isLoading ? <Skeleton className="h-3 w-40 rounded" /> : <>Real-time data from your workspace</>}
      </div>

      {/* ═══ TOP STATS ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            {/* Library items */}
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-2">Library items</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ember)' }}>{totalLibraryItems}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {itemsThisWeek > 0 ? `+${itemsThisWeek} this week` : 'total'}
                </div>
              </CardContent>
            </Card>

            {/* Posts generated */}
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-2">Posts generated</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 5 }}>
                  <span style={{ color: totalPosts > 0 ? 'var(--ember)' : 'var(--text-faint)' }}>{totalPosts}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {totalPosts > 0 ? `${authorityPosts} LinkedIn · ${catalystPosts} X` : 'Agents will generate posts'}
                </div>
              </CardContent>
            </Card>

            {/* Avg voice match */}
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-2">Avg voice match</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-faint)' }}>—</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">Train your voice to see this</div>
              </CardContent>
            </Card>

            {/* Posts published */}
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-2">Posts published</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 5 }}>
                  <span style={{ color: publishedPosts > 0 ? 'var(--success)' : 'var(--text-faint)' }}>{publishedPosts}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {totalPosts > 0 ? `${draftPosts} drafts · ${approvedPosts} approved` : 'Publish from Agents page'}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Library growth chart */}
        <Card>
          <CardContent className="p-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Library growth</span>
              <Badge variant="outline" className="text-[9px]">
                {totalLibraryItems} total
              </Badge>
            </div>
            {isLoading ? (
              <div className="flex items-end gap-1.5" style={{ height: 100 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : weekEntries.length > 0 ? (
              <div className="flex items-end gap-1.5" style={{ height: 100 }}>
                {weekEntries.map(([label, count], i) => {
                  const height = Math.max((count / maxWeekCount) * 100, 8)
                  const isPeak = count === maxWeekCount
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                          width: '100%', height: `${height}%`, borderRadius: '3px 3px 0 0',
                          background: isPeak ? 'var(--ember)' : 'var(--ember-muted)',
                          transition: 'height 0.3s ease',
                        }} />
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-faint)' }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 100 }}>
                <div className="text-xs text-[var(--text-faint)] text-center">
                  Add items to your library<br />to see growth data
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post pipeline chart */}
        <Card>
          <CardContent className="p-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Post pipeline</span>
              <Badge variant="outline" className="text-[9px]">
                {totalPosts} total
              </Badge>
            </div>
            {isLoading ? (
              <div className="flex flex-col gap-3" style={{ height: 100, justifyContent: 'center' }}>
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-5 w-full rounded" />)}
              </div>
            ) : pipelineTotal > 0 ? (
              <div className="flex flex-col gap-2.5">
                {/* Stacked bar */}
                <div style={{ height: 20, borderRadius: 6, overflow: 'hidden', display: 'flex', background: 'var(--bg-elevated)' }}>
                  {pipelineStatuses.filter(s => s.count > 0).map((s, i) => (
                    <div key={i} style={{
                      width: `${(s.count / pipelineTotal) * 100}%`,
                      background: s.bg, height: '100%',
                      borderRight: '1px solid var(--bg-page)',
                      transition: 'width 0.3s ease',
                    }} />
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-1">
                  {pipelineStatuses.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.count > 0 ? s.bg : 'var(--bg-elevated)', border: `1px solid ${s.count > 0 ? s.color : 'var(--border)'}` }} />
                      <span className="text-[10px] text-[var(--text-muted)]">{s.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: s.count > 0 ? s.color : 'var(--text-faint)' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 100 }}>
                <div className="text-xs text-[var(--text-faint)] text-center">
                  No posts yet<br />Generate from Canvas to begin
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ BOTTOM ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Library by type */}
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
              Library by type
            </div>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <Skeleton className="h-3 w-16 rounded mb-1.5" />
                    <Skeleton className="h-2.5 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : typeEntries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {typeEntries.map(([type, count]) => {
                  const meta = TYPE_META[type] ?? { label: type, color: 'var(--ember)', bg: 'var(--ember-muted)' }
                  const width = Math.max((count / maxTypeCount) * 100, 6)
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-primary)]">{meta.label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: meta.color }}>{count}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 100, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: meta.color, width: `${width}%`, transition: 'width 0.3s ease', opacity: 0.7 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs text-[var(--text-faint)] text-center py-6">
                Your library type breakdown will appear here
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Analytics — Engagement placeholder */}
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
              Platform analytics
            </div>
            <div className="flex flex-col items-center justify-center text-center py-4">
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20" stroke="var(--text-faint)" strokeWidth="1.3" strokeLinecap="round">
                  <rect x="2" y="3" width="16" height="14" rx="2" />
                  <polyline points="2,13 7,9 11,12 18,6" />
                  {/* Lock overlay */}
                  <rect x="7" y="8" width="6" height="5" rx="1" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1" />
                  <path d="M9 8V6.5a1.5 1.5 0 013 0V8" fill="none" stroke="var(--text-faint)" strokeWidth="1" />
                </svg>
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)] mb-1.5">Engagement metrics coming soon</div>
              <div className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[280px] mb-4">
                Impressions, engagements, and click-through rates will be available after you connect LinkedIn and X and publish your first posts.
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">Settings → Integrations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ RECENT SOURCES ═══ */}
      {!isLoading && (
        <Card className="mt-3.5">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
              {recentSources.length > 0 ? 'Recent library items' : 'Top performing sources'}
            </div>
            {recentSources.length > 0 ? (
              recentSources.map((src: { _id: string; type: string; title: string; _creationTime: number; status: string }, i: number) => {
                const meta = TYPE_META[src.type] ?? { label: src.type, color: 'var(--ember)', bg: 'var(--ember-muted)' }
                return (
                  <div key={src._id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 0', borderBottom: i < recentSources.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12" stroke={meta.color} strokeWidth="1.5"><rect x="1" y="1" width="10" height="10" rx="1" /><line x1="3" y1="4" x2="9" y2="4" /><line x1="3" y1="7" x2="6" y2="7" /></svg>
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)', minWidth: 0 }}>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.title}</strong>
                      {src.type}
                      {src.status !== 'ready' && <> · <span style={{ color: 'var(--warning)' }}>{src.status}</span></>}
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0" style={{ borderColor: `${meta.color}30`, color: meta.color, background: meta.bg }}>
                      {meta.label.replace(/s$/, '')}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6">
                <div className="text-sm text-[var(--text-muted)] mb-3">Start by adding research to your library. Your analytics will build from there.</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/library">Add to library →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
