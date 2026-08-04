'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'

/* ─── NAV DATA ─── */
const NAV_SECTIONS = [
  {
    section: 'Workspace',
    items: [
      { label: 'Home', href: '/dashboard', icon: 'grid', badge: null },
      { label: 'Canvas', href: '/dashboard/canvas', icon: 'canvas', badge: { text: 'new' } },
      { label: 'Library', href: '/dashboard/library', icon: 'doc', badge: null },
    ],
  },
  {
    section: 'Agents',
    items: [
      { label: 'Agents', href: '/dashboard/agents', icon: 'wave', badge: null },
      { label: 'Schedule', href: '/dashboard/schedule', icon: 'calendar', badge: null },
      { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart', badge: null },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: 'gear', badge: null },
    ],
  },
]

/* ─── INLINE SVG ICONS ─── */
function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  switch (name) {
    case 'grid':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2"/></svg>)
    case 'canvas':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7.5 1v3M4 5l2.5 2M11 5l-2.5 2M7.5 7v4M4 14h7"/><circle cx="7.5" cy="1" r="0.8" fill="currentColor" stroke="none"/></svg>)
    case 'doc':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="11" height="13" rx="2"/><line x1="5" y1="5" x2="10" y2="5"/><line x1="5" y1="8" x2="8" y2="8"/></svg>)
    case 'wave':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 7.5c1.5-3 3-5 4.5-5s2 3 3.5 3 2-2.5 3.5-2.5 1.5 4 1.5 4"/></svg>)
    case 'calendar':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="2.5" width="13" height="11" rx="2"/><line x1="5" y1="1" x2="5" y2="4.5"/><line x1="10" y1="1" x2="10" y2="4.5"/><line x1="1" y1="7" x2="14" y2="7"/></svg>)
    case 'chart':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="1,12 5,7 9,9 14,3"/><circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>)
    case 'gear':
      return (<svg width={size} height={size} fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="2.5"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.7 2.7l1.4 1.4M10.9 10.9l1.4 1.4M2.7 12.3l1.4-1.4M10.9 4.1l1.4-1.4"/></svg>)
    default:
      return null
  }
}

/* ─── SEARCH COMMAND PALETTE ─── */
function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const contentItems = useQuery(api.content.list, { limit: 5 })

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const filteredItems = contentItems?.filter(
    (item) => !query || item.title.toLowerCase().includes(query.toLowerCase())
  ) ?? []

  const quickActions = [
    { label: 'New Synthesis', icon: 'canvas', href: '/dashboard/canvas' },
    { label: 'Add to Library', icon: 'doc', href: '/dashboard/library/new' },
    { label: 'Open Agents', icon: 'wave', href: '/dashboard/agents' },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(7,14,9,0.85)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '18vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)', borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search library, canvas sessions, drafts..."
          style={{
            width: '100%', height: 44, padding: '0 16px',
            fontSize: 15, fontFamily: "'Inter', sans-serif",
            color: 'var(--text-primary)', background: 'var(--bg-page)',
            border: 'none', borderBottom: '0.5px solid var(--border)',
            outline: 'none',
          }}
        />

        <div style={{ padding: '10px 0', maxHeight: 340, overflowY: 'auto' }}>
          {/* Recent items */}
          {filteredItems.length > 0 && (
            <>
              <div style={{
                padding: '6px 16px 4px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              }}>Recent</div>
              {filteredItems.slice(0, 3).map((item) => (
                <button
                  key={item._id}
                  onClick={() => { router.push(`/dashboard/library/${item._id}`); onClose() }}
                  className="cmd-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 16px', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: 14, height: 14, opacity: 0.5, display: 'flex' }}>
                    <NavIcon name="doc" size={14} />
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <span style={{
                    fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                    padding: '1px 5px', borderRadius: 4,
                    background: 'var(--bg-elevated)', color: 'var(--text-faint)',
                  }}>{item.type}</span>
                </button>
              ))}
            </>
          )}

          {/* Quick Actions */}
          <div style={{
            padding: '10px 16px 4px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          }}>Quick Actions</div>
          {quickActions.map((a) => (
            <button
              key={a.href}
              onClick={() => { router.push(a.href); onClose() }}
              className="cmd-item"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 16px', background: 'transparent', border: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 14, height: 14, opacity: 0.6, display: 'flex' }}>
                <NavIcon name={a.icon} size={14} />
              </span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cmd-item:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════ */
export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const { profile, isLoading } = useCurrentUser()
  const [searchOpen, setSearchOpen] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/images/threadda-logo-dark.svg')

  useEffect(() => {
    const updateLogo = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setLogoSrc(theme === 'light' ? '/images/threadda-logo.svg' : '/images/threadda-logo-dark.svg')
    }
    updateLogo()
    const observer = new MutationObserver(updateLogo)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const displayName = profile?.name ?? ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    const handleOpen = () => setSearchOpen(true)
    window.addEventListener('threadda-open-search', handleOpen)
    return () => window.removeEventListener('threadda-open-search', handleOpen)
  }, [])

  /* ── COLLAPSED: Icon Rail ── */
  if (collapsed) {
    return (
      <>
        <aside style={{
          width: 52, background: 'var(--bg-surface)',
          borderRight: '0.5px solid var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          flexShrink: 0, zIndex: 20, paddingTop: 0,
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Logo at the very top */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 0 10px',
            borderBottom: '0.5px solid var(--border)',
            marginBottom: 10,
          }}>
            {/* Threadda icon logo (Ember square with woven threads) */}
            <img src="/images/threadda-icon.svg" alt="Threadda" style={{ width: 28, height: 28 }} />
          </div>

          {/* Nav icons grouped by section */}
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.section} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {si > 0 && (
                <div style={{ width: 20, height: 0.5, background: 'var(--border)', margin: '5px 0' }} />
              )}
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rail-item"
                    style={{
                      position: 'relative',
                      width: 38, height: 36, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: active ? 'var(--ember)' : 'var(--text-muted)',
                      background: active ? 'var(--bg-elevated)' : 'transparent',
                      margin: '1px 0', textDecoration: 'none',
                      transition: 'all 0.12s',
                    }}
                  >
                    <NavIcon name={item.icon} />
                    {/* Canvas orange dot badge */}
                    {item.badge && (
                      <span style={{
                        position: 'absolute', top: 5, right: 5,
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--ember)',
                      }} />
                    )}
                    {/* Tooltip */}
                    <span className="rail-tooltip" style={{
                      position: 'absolute', left: 46, top: '50%', transform: 'translateY(-50%)',
                      background: 'var(--bg-elevated)', border: '0.5px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: 10, fontWeight: 500,
                      padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
                      pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                      zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 'auto', padding: '8px 0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Avatar */}
            {isLoading ? (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ) : profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName || 'Profile'}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff',
                fontFamily: "'DM Serif Display', serif",
              }}>{initial}</div>
            )}
          </div>
        </aside>

        <CommandPalette open={searchOpen} onClose={closeSearch} />

        <style jsx>{`
          .rail-item:hover { background: var(--bg-elevated) !important; color: var(--text-muted) !important; }
          .rail-item:hover .rail-tooltip { opacity: 1 !important; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </>
    )
  }

  /* ── EXPANDED: Full Sidebar ── */
  return (
    <>
      <aside style={{
        width: 220, background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, zIndex: 20,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>
        {/* Row 1 — Logo + collapse */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 12px 10px',
          borderBottom: '0.5px solid var(--border)',
        }}>
          <span style={{
            fontSize: 14, fontWeight: 500, letterSpacing: '-0.3px',
            color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif",
          }}>
            <img src={logoSrc} alt="Threadda" style={{ height: 24 }} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Search */}
            <button
              onClick={openSearch}
              title="Search"
              className="util-btn"
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6" cy="6" r="4"/><line x1="9" y1="9" x2="13" y2="13"/>
              </svg>
            </button>
            {/* Collapse */}
            <button
              onClick={onToggle}
              title="Collapse sidebar (Ctrl+B)"
              className="util-btn"
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <path d="M16 8l-3 4 3 4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2px 0' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.section}>
              {/* Section label */}
              <div style={{
                padding: '8px 14px 3px', fontSize: 9, fontWeight: 500,
                fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              }}>
                {section.section}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 14px', fontSize: 12,
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: active ? 'var(--bg-elevated)' : 'transparent',
                      borderLeft: active ? '2px solid var(--ember)' : '2px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ width: 15, height: 15, display: 'flex', flexShrink: 0, opacity: active ? 1 : 0.7 }}>
                      <NavIcon name={item.icon} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 8, fontFamily: "'Inter', sans-serif",
                        padding: '1px 4px', borderRadius: 3,
                        background: 'var(--ember)', color: '#fff',
                      }}>
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '0.5px solid var(--border)', padding: '8px 12px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {/* Avatar */}
          {isLoading ? (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName || 'Profile'}
              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
              fontFamily: "'DM Serif Display', serif",
            }}>{initial}</div>
          )}
          {/* Name */}
          <div style={{
            flex: 1, fontSize: 11, color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isLoading ? '...' : displayName}
          </div>
          {/* Sign out */}
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            title="Sign out"
            className="util-btn"
            style={{
              width: 22, height: 22, borderRadius: 4,
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 1H3a2 2 0 00-2 2v9a2 2 0 002 2h3"/><path d="M10 11l4-4-4-4"/><line x1="5" y1="7" x2="14" y2="7"/>
            </svg>
          </button>
        </div>
      </aside>

      <CommandPalette open={searchOpen} onClose={closeSearch} />

      <style jsx>{`
        .nav-link:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .util-btn:hover { background: var(--bg-elevated) !important; color: var(--text-primary) !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  )
}
