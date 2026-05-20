'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/time'
import { Id } from '../../../../convex/_generated/dataModel'
import Link from 'next/link'

const TYPE_CONFIG: Record<string, { label: string; bg: string; stroke: string; icon: React.ReactNode }> = {
  article: {
    label: 'Article', bg: 'rgba(29,158,117,0.1)', stroke: '#1D9E75',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="12" height="14" rx="2"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>,
  },
  pdf: {
    label: 'PDF', bg: 'var(--ember-muted)', stroke: '#FF6B35',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round"><path d="M4 1h6l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/><polyline points="10,1 10,5 14,5"/></svg>,
  },
  note: {
    label: 'Note', bg: 'rgba(55,138,221,0.1)', stroke: '#378ADD',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round"><path d="M12 1H4a1 1 0 00-1 1v12l3-2 3 2 3-2 3 2V2a1 1 0 00-1-1z"/></svg>,
  },
  video: {
    label: 'Video', bg: 'rgba(239,159,39,0.1)', stroke: '#EF9F27',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="10" height="10" rx="1.5"/><polyline points="11,6 15,4 15,12 11,10"/></svg>,
  },
  tweet: {
    label: 'Tweet', bg: 'rgba(29,161,242,0.1)', stroke: '#1DA1F2',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#1DA1F2" strokeWidth="1.5" strokeLinecap="round"><path d="M15 3a7.5 7.5 0 01-2.36.66A3.5 3.5 0 0014.21 1.5a7 7 0 01-2.6 1A3.5 3.5 0 005.5 6.5 10 10 0 011.5 2s-1.5 3.5 2 5.5A3.5 3.5 0 011 7s0 3.5 3.5 4.5a3.5 3.5 0 01-2 0s.5 2.5 3.5 3A7 7 0 011 13.5 10 10 0 006.5 15c6 0 9.5-5 9.5-9.5 0-.15 0-.3-.02-.44A6.5 6.5 0 0015 3z"/></svg>,
  },
}

const STATUS_COLORS: Record<string, string> = {
  ready: '#1D9E75',
  processing: '#EF9F27',
  queued: 'rgba(237,232,224,0.35)',
  error: '#E24B4A',
}

export default function LibraryPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  const items = useQuery(
    api.content.list,
    profile ? { userId: profile._id } : 'skip',
  )
  const removeItem = useMutation(api.content.remove)

  const isLoading = profileLoading || items === undefined

  // --- Counts ---
  const counts: Record<string, number> = { all: items?.length ?? 0 }
  if (items) {
    for (const item of items) {
      counts[item.type] = (counts[item.type] ?? 0) + 1
    }
  }

  // --- Filtering ---
  const filtered = activeFilter === 'all'
    ? items
    : items?.filter((item: { type: string }) => item.type === activeFilter)

  const searched = searchQuery
    ? filtered?.filter((item: { title: string; rawText?: string }) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.rawText && item.rawText.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filtered

  // --- Filter pills ---
  const filterPills = [
    { key: 'all', label: 'All' },
    { key: 'article', label: 'Articles' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'note', label: 'Notes' },
    { key: 'video', label: 'Videos' },
    { key: 'tweet', label: 'Tweets' },
  ].filter(f => f.key === 'all' || (counts[f.key] ?? 0) > 0)

  const handleDelete = async (contentId: Id<"contentItems">) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    await removeItem({ contentId })
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div style={{ animation: 'fadeIn 0.18s ease' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>(01) — Library</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Knowledge <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>base.</em></div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>Loading your library…</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '0.5px solid var(--border)' }}>
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton className="h-3.5 rounded" style={{ width: '60%' }} />
                <Skeleton className="h-2.5 rounded" style={{ width: '40%' }} />
              </div>
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
            </div>
          ))}
        </div>
        <style jsx>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    )
  }

  // --- EMPTY STATE ---
  if (items && items.length === 0) {
    return (
      <div style={{ animation: 'fadeIn 0.18s ease' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>(01) — Library</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Knowledge <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>base.</em></div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 48 }}>Your research, all in one place.</div>

        <div style={{ maxWidth: 400, margin: '0 auto', border: '1px dashed var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--ember-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 16 16" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="12" height="14" rx="2"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Your library is empty</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            Save articles, PDFs, notes, and videos to start building your knowledge graph.
          </div>
          <Link href="/dashboard/library/new">
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: 'var(--ember)', color: '#fff', fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
            }}>
              Add your first item →
            </button>
          </Link>
        </div>

        <style jsx>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    )
  }

  // --- POPULATED STATE ---
  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      {/* Header */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>(01) — Library</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>Knowledge <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>base.</em></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>{counts.all} items saved · {counts.article ?? 0} articles · {counts.note ?? 0} notes</div>

      {/* Filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filterPills.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              transition: 'all 0.14s', border: 'none',
              background: activeFilter === f.key ? 'var(--ember)' : 'var(--bg-surface)',
              color: activeFilter === f.key ? '#fff' : 'var(--text-muted)',
              ...(activeFilter !== f.key ? { border: '0.5px solid var(--border)' } : {}),
            }}
          >
            {f.label} ({counts[f.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Toolbar: Search + View toggle + Add button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        {/* Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '7px 11px' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 13 13" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="5.5" cy="5.5" r="4"/><line x1="8.5" y1="8.5" x2="12" y2="12"/></svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 2 }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            title="List view"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="3.5" x2="12" y2="3.5"/><line x1="2" y1="7" x2="12" y2="7"/><line x1="2" y1="10.5" x2="12" y2="10.5"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            title="Grid view"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="1"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="1"/><rect x="8" y="8" width="4.5" height="4.5" rx="1"/>
            </svg>
          </button>
        </div>

        {/* Add button */}
        <Link href="/dashboard/library/new">
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: 'var(--ember)', color: '#fff', fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
          }}>
            + Add item
          </button>
        </Link>
      </div>

      {/* Search results feedback */}
      {searchQuery && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {searched?.length ?? 0} result{(searched?.length ?? 0) !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {/* No results after filter/search */}
      {searched && searched.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          No items match your {searchQuery ? 'search' : 'filter'}.
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && searched && searched.length > 0 && (
        <div>
          {searched.map((item: { _id: Id<'contentItems'>; type: string; title: string; rawText?: string; summary?: string; _creationTime: number; status: string; url?: string }) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.article!
            return (
              <Link key={item._id} href={`/dashboard/library/${item._id}`} style={{ textDecoration: 'none', display: 'contents' }}>
              <div
                className="lib-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 8px', borderBottom: '0.5px solid var(--border)',
                  transition: 'background 0.15s', cursor: 'pointer',
                }}
              >
                {/* Type icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '1px 6px',
                      borderRadius: 20, background: cfg.bg, color: cfg.stroke,
                    }}>
                      {cfg.label}
                    </span>
                    {item.url && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                        {item.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                      {timeAgo(item._creationTime)}
                    </span>
                  </div>
                </div>

                {/* Status dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: STATUS_COLORS[item.status] ?? STATUS_COLORS.queued,
                }} title={item.status} />

                {/* Delete */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item._id) }}
                  className="lib-del"
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: 'transparent', color: 'var(--text-faint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.14s', flexShrink: 0, opacity: 0,
                  }}
                  title="Delete item"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <polyline points="3,4 4,12 10,12 11,4"/><line x1="2" y1="4" x2="12" y2="4"/><line x1="5.5" y1="2" x2="8.5" y2="2"/>
                  </svg>
                </button>
              </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && searched && searched.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {searched.map((item: { _id: Id<'contentItems'>; type: string; title: string; rawText?: string; summary?: string; _creationTime: number; status: string; url?: string }) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.article!
            return (
              <Link key={item._id} href={`/dashboard/library/${item._id}`} style={{ textDecoration: 'none' }}>
              <div
                className="lib-grid-card"
                style={{
                  background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
                  borderRadius: 12, padding: 16, transition: 'border-color 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
                }}
              >
                {/* Top: badge + status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 7px',
                    borderRadius: 20, background: cfg.bg, color: cfg.stroke,
                  }}>
                    {cfg.label}
                  </span>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: STATUS_COLORS[item.status] ?? STATUS_COLORS.queued,
                  }} title={item.status} />
                </div>

                {/* Title */}
                <div style={{
                  fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', lineHeight: 1.4,
                }}>
                  {item.title}
                </div>

                {/* URL or preview */}
                {item.url && !item.rawText && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {item.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                    {item.status === 'queued' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#EF9F27' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF9F27' }} />
                        Pending
                      </span>
                    )}
                  </div>
                )}
                {item.rawText && (
                  <div style={{
                    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.rawText.substring(0, 120)}
                  </div>
                )}

                {/* Bottom: date + delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    {timeAgo(item._creationTime)}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item._id) }}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-faint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.14s',
                    }}
                    title="Delete item"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="3,4 4,12 10,12 11,4"/><line x1="2" y1="4" x2="12" y2="4"/><line x1="5.5" y1="2" x2="8.5" y2="2"/>
                    </svg>
                  </button>
                </div>
              </div>
              </Link>
            )
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .lib-row:hover { background: var(--bg-surface); }
        .lib-row:hover .lib-del { opacity: 1 !important; }
        .lib-del:hover { background: rgba(226,75,74,0.1) !important; color: #E24B4A !important; }
        .lib-grid-card:hover { border-color: rgba(255,107,53,0.2) !important; }
        input::placeholder { color: var(--text-faint); }
      `}</style>
    </div>
  )
}
