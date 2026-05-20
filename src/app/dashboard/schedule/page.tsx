'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

/* eslint-disable @typescript-eslint/no-explicit-any */
type PostItem = { _id: string; _creationTime: number; status: string; scheduledAt?: number | null; agent: string; platform: string; body: string; title?: string; publishedAt?: number }

/* ─── Calendar helpers ─── */
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getCalendarDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return days
}

function isSameDay(ts: number, year: number, month: number, day: number) {
  const d = new Date(ts)
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatShortDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── Types ─── */
type ViewTab = 'Month' | 'List'

export default function SchedulePage() {
  const { profile, isLoading: userLoading } = useCurrentUser()

  const allPosts = useQuery(
    api.posts.list,
    profile?._id ? { userId: profile._id } : 'skip'
  )

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewTab, setViewTab] = useState<ViewTab>('Month')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [datePickerFor, setDatePickerFor] = useState<string | null>(null)
  const [datePickerValue, setDatePickerValue] = useState('')

  const scheduleMut = useMutation(api.posts.schedule)
  const unscheduleMut = useMutation(api.posts.unschedule)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  const goToToday = () => setCurrentMonth(new Date())

  /* ─── Derived data ─── */
  const scheduledPosts = allPosts?.filter((p: PostItem) =>
    p.status === 'scheduled' || p.status === 'published' || p.status === 'approved'
  ) ?? []

  const postsWithDate = scheduledPosts.filter((p: PostItem) => p.scheduledAt != null)
  const postsWithoutDate = scheduledPosts.filter((p: PostItem) => p.scheduledAt == null)
  const allDrafts = allPosts?.filter((p: PostItem) => p.status === 'draft') ?? []

  const isLoading = userLoading || allPosts === undefined

  const today = new Date()
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()

  const calendarDays = getCalendarDays(currentMonth)
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  /* ─── Get posts for a specific day ─── */
  function getPostsForDay(day: number) {
    return postsWithDate.filter((p: PostItem) => isSameDay(p.scheduledAt!, year, month, day))
  }

  /* ─── Stats ─── */
  const scheduledCount = allPosts?.filter((p: PostItem) => p.status === 'scheduled').length ?? 0
  const publishedCount = allPosts?.filter((p: PostItem) => p.status === 'published').length ?? 0

  return (
    <TooltipProvider>
      <div style={{ animation: 'fadeIn 0.18s ease' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>(04) — Content Calendar</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Schedule &amp; <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>publish.</em></div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>
          {isLoading ? (
            <Skeleton className="h-3 w-48 rounded" />
          ) : (
            <>{formatMonthYear(currentMonth)} · {scheduledCount} scheduled · {publishedCount} published</>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap' as const, gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Button variant="outline" size="sm" onClick={goToPrevMonth} className="text-xs">
              ← Prev
            </Button>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', padding: '0 8px' }}>
              {formatMonthYear(currentMonth)}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth} className="text-xs">
              Next →
            </Button>
            {!isCurrentMonth && (
              <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs text-[var(--ember)]">
                Today
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ display: 'flex', gap: 2, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3 }}>
              {(['Month', 'List'] as const).map((t) => (
                <button key={t} onClick={() => setViewTab(t)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', border: 'none',
                  background: viewTab === t ? 'var(--bg-surface)' : 'transparent',
                  color: viewTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: "'Inter', sans-serif", transition: 'all 0.14s',
                }}>
                  {t}
                </button>
              ))}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button size="sm" disabled>+ Schedule post</Button></span>
              </TooltipTrigger>
              <TooltipContent>Posts are scheduled after agents generate and you approve them</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ═══ MONTH VIEW ═══ */}
        {viewTab === 'Month' && (
          <>
            {/* Day header row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
              {DAY_HEADERS.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', padding: 5, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, position: 'relative' }}>
              {isLoading ? (
                /* Skeleton cells */
                Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} style={{ minHeight: 100, background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 8 }}>
                    <Skeleton className="h-3 w-4 rounded mb-2" />
                    {i % 5 === 2 && <Skeleton className="h-4 w-full rounded" />}
                  </div>
                ))
              ) : (
                calendarDays.map((day, i) => {
                  if (day === null) {
                    return (
                      <div key={`pad-${i}`} style={{ minHeight: 100, background: 'var(--bg-page)', border: '0.5px solid var(--border)', borderRadius: 8, opacity: 0.4 }} />
                    )
                  }

                  const isToday = day === today.getDate() && isCurrentMonth
                  const dayPosts = getPostsForDay(day)
                  const isSelected = selectedDay === day

                  return (
                    <div key={day} className="cal-cell" onClick={() => { setSelectedDay(day); setSelectedPost(null) }} style={{
                      minHeight: 100, background: isSelected ? 'var(--bg-elevated)' : isToday ? 'var(--ember-muted)' : 'var(--bg-surface)',
                      border: `0.5px solid ${isSelected ? 'var(--ember)' : isToday ? 'var(--ember)' : 'var(--border)'}`,
                      borderRadius: 8, padding: 8, cursor: 'pointer', transition: 'background 0.14s',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--ember)' : 'var(--text-muted)', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                        {day}
                      </div>
                      {dayPosts.slice(0, 2).map((post: PostItem) => (
                        <Tooltip key={post._id}>
                          <TooltipTrigger asChild>
                            <div style={{
                              borderRadius: 4, padding: '2px 6px', fontSize: 9, marginBottom: 3,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              background: post.agent === 'authority' ? 'var(--ember-muted)' : 'rgba(55,138,221,0.12)',
                              color: post.agent === 'authority' ? 'var(--ember)' : 'var(--info)',
                              fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                            }}>
                              {post.agent === 'authority' ? 'LI' : 'X'}: {(post.title || post.body).slice(0, 25)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            <div className="text-xs font-semibold mb-1">{post.agent === 'authority' ? 'The Authority' : 'The Catalyst'}</div>
                            <div className="text-xs text-[var(--text-muted)]">{(post.title || post.body).slice(0, 120)}</div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {dayPosts.length > 2 && (
                        <div style={{ fontSize: 9, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Empty state overlay */}
            {!isLoading && scheduledPosts.length === 0 && (
              <Card className="mt-5">
                <CardContent className="p-6 text-center">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--ember-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 16 16" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="1" y="2.5" width="14" height="12" rx="2" />
                      <line x1="5" y1="1" x2="5" y2="4.5" />
                      <line x1="11" y1="1" x2="11" y2="4.5" />
                      <line x1="1" y1="7" x2="15" y2="7" />
                    </svg>
                  </div>
                  <div className="text-base font-semibold text-[var(--text-primary)] mb-2">No scheduled posts yet</div>
                  <div className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[400px] mx-auto mb-5">
                    Posts will appear here once your agents generate drafts and you approve them for scheduling.
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/agents">Go to Agents →</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Unscheduled posts section */}
            {!isLoading && postsWithoutDate.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-semibold text-[var(--text-muted)] mb-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                  Unscheduled ({postsWithoutDate.length})
                </div>
                <div className="flex flex-col gap-2">
                  {postsWithoutDate.map((post: PostItem) => (
                    <Card key={post._id}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: post.agent === 'authority' ? 'var(--ember-muted)' : 'rgba(55,138,221,0.12)',
                        }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke={post.agent === 'authority' ? 'var(--ember)' : 'var(--info)'} strokeWidth="1.5" strokeLinecap="round">
                            <path d="M2 14 C2 9 5 3 12 2" /><path d="M6 14 C6 10 8.5 6 12 5" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-[var(--text-primary)] truncate">{post.title || post.body.slice(0, 60)}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {post.agent === 'authority' ? 'The Authority · LinkedIn' : 'The Catalyst · X'}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {post.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ LIST VIEW ═══ */}
        {viewTab === 'List' && (
          <div>
            {isLoading ? (
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2].map(i => (
                  <Card key={i}>
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-3.5 w-52 rounded mb-1.5" />
                        <Skeleton className="h-3 w-28 rounded" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : scheduledPosts.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <div className="text-base font-semibold text-[var(--text-primary)] mb-2">No posts in the pipeline</div>
                  <div className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[400px] mx-auto mb-5">
                    Once your agents generate content and you approve it, scheduled posts will appear in this list chronologically.
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/agents">Go to Agents →</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {scheduledPosts
                  .sort((a: PostItem, b: PostItem) => (a.scheduledAt ?? a._creationTime) - (b.scheduledAt ?? b._creationTime))
                  .map((post: PostItem) => (
                    <Card key={post._id} className="list-card">
                      <CardContent className="p-3.5 flex items-center gap-3.5">
                        <div style={{
                          width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: post.agent === 'authority' ? 'var(--ember-muted)' : 'rgba(55,138,221,0.12)',
                        }}>
                          <svg width="15" height="15" fill="none" viewBox="0 0 16 16" stroke={post.agent === 'authority' ? 'var(--ember)' : 'var(--info)'} strokeWidth="1.5" strokeLinecap="round">
                            <path d="M2 14 C2 9 5 3 12 2" /><path d="M6 14 C6 10 8.5 6 12 5" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {post.title || post.body.slice(0, 80)}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {post.agent === 'authority' ? 'The Authority · LinkedIn' : 'The Catalyst · X'}
                            {post.scheduledAt && <> · {formatShortDate(post.scheduledAt)}</>}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0"
                          style={{
                            borderColor: post.status === 'published' ? 'rgba(29,158,117,0.3)' : post.status === 'scheduled' ? 'rgba(255,107,53,0.3)' : 'var(--border)',
                            color: post.status === 'published' ? 'var(--success)' : post.status === 'scheduled' ? 'var(--ember)' : 'var(--text-muted)',
                            background: post.status === 'published' ? 'var(--success-muted)' : post.status === 'scheduled' ? 'var(--ember-muted)' : 'transparent',
                          }}
                        >
                          {post.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SELECTED DAY PANEL ═══ */}
        {viewTab === 'Month' && selectedDay !== null && !selectedPost && (() => {
          const dayPosts = getPostsForDay(selectedDay)
          return (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-[var(--text-muted)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                  {formatMonthYear(currentMonth).split(' ')[0]} {selectedDay} — {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''}
                </div>
                {dayPosts.length === 0 ? (
                  <div className="text-sm text-[var(--text-muted)]">No posts scheduled for this date.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {dayPosts.map((post: PostItem) => (
                      <button key={post._id} onClick={() => setSelectedPost(post)} className="list-card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.14s' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: post.agent === 'authority' ? 'var(--ember-muted)' : 'rgba(55,138,221,0.12)' }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke={post.agent === 'authority' ? 'var(--ember)' : 'var(--info)'} strokeWidth="1.5" strokeLinecap="round"><path d="M2 14 C2 9 5 3 12 2" /><path d="M6 14 C6 10 8.5 6 12 5" /></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title || post.body.slice(0, 60)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.agent === 'authority' ? 'LinkedIn' : 'X'}</div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">{post.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => setSelectedDay(null)}>Close</Button>
              </CardContent>
            </Card>
          )
        })()}

        {/* ═══ POST DETAIL PANEL ═══ */}
        {selectedPost && (() => {
          const isDue = selectedPost.scheduledAt != null && selectedPost.scheduledAt <= Date.now()
          const schedDate = selectedPost.scheduledAt ? new Date(selectedPost.scheduledAt) : null
          return (
            <Card className="mt-4">
              <CardContent className="p-5">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="text-xs font-semibold text-[var(--text-muted)]" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Post Detail</div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedPost(null)}>✕ Close</Button>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>{selectedPost.title || 'Untitled post'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {selectedPost.agent === 'authority' ? 'The Authority · LinkedIn' : 'The Catalyst · X'}
                  {schedDate && <> · Scheduled for {schedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>}
                </div>
                <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, maxHeight: 200, overflowY: 'auto', marginBottom: 14 }}>
                  {selectedPost.body.slice(0, 500)}{selectedPost.body.length > 500 ? '…' : ''}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  {selectedPost.status === 'scheduled' && (
                    <>
                      <Button size="sm" disabled={!isDue} onClick={() => { navigator.clipboard.writeText(selectedPost.body); window.open('https://www.linkedin.com/feed/', '_blank'); showToast('Copied! Paste into LinkedIn.') }} style={{ background: isDue ? 'var(--ember)' : 'var(--bg-elevated)', color: isDue ? '#fff' : 'var(--text-muted)' }}>
                        {isDue ? '📋 Publish to LinkedIn' : `Publishes on ${schedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={async () => { await unscheduleMut({ postId: selectedPost._id as any }); setSelectedPost(null); setSelectedDay(null); showToast('Post unscheduled') }}>
                        Unschedule
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* ═══ DRAFT POSTS — SCHEDULE SECTION ═══ */}
        {!isLoading && allDrafts.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-[var(--text-muted)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
              Draft posts ({allDrafts.length})
            </div>
            <div className="flex flex-col gap-2">
              {allDrafts.map((post: PostItem) => (
                <Card key={post._id} className="list-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: post.agent === 'authority' ? 'var(--ember-muted)' : 'rgba(55,138,221,0.12)' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke={post.agent === 'authority' ? 'var(--ember)' : 'var(--info)'} strokeWidth="1.5" strokeLinecap="round"><path d="M2 14 C2 9 5 3 12 2" /><path d="M6 14 C6 10 8.5 6 12 5" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[var(--text-primary)] truncate">{post.title || post.body.slice(0, 60)}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{post.agent === 'authority' ? 'The Authority · LinkedIn' : 'The Catalyst · X'}</div>
                    </div>
                    {datePickerFor === post._id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="date" value={datePickerValue} onChange={(e) => setDatePickerValue(e.target.value)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '0.5px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }} />
                        <Button size="sm" className="text-xs" disabled={!datePickerValue} onClick={async () => {
                          const ts = new Date(datePickerValue + 'T09:00:00Z').getTime()
                          await scheduleMut({ postId: post._id as any, scheduledAt: ts })
                          setDatePickerFor(null); setDatePickerValue(''); showToast('Post scheduled!')
                        }}>Set</Button>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setDatePickerFor(null); setDatePickerValue('') }}>✕</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => setDatePickerFor(post._id)}>
                        📅 Schedule
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-elevated)', border: '0.5px solid var(--ember)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'fadeIn 0.18s ease' }}>
            {toast}
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .cal-cell:hover { background: var(--bg-hover) !important; }
          .list-card:hover { border-color: var(--border-hover) !important; }
        `}</style>
      </div>
    </TooltipProvider>
  )
}
