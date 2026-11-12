'use client'

import { usePathname } from 'next/navigation'

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/canvas': 'Canvas',
  '/dashboard/library': 'Library',
  '/dashboard/agents': 'Agents',
  '/dashboard/schedule': 'Schedule',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
}

export function TopBar({
  collapsed,
  onToggle,
  onSearchOpen,
}: {
  collapsed: boolean
  onToggle: () => void
  onSearchOpen: () => void
}) {
  const pathname = usePathname()
  const pageName = PAGE_NAMES[pathname] || 'Home'

  // Expanded state — top utility bar: Hide it completely — render nothing when sidebar is expanded
  if (!collapsed) return null

  return (
    <header style={{
      height: 44, flexShrink: 0,
      background: 'var(--bg-page)',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 10,
    }}>
      {/* Collapsed: utility box + separator + page name */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-elevated)', border: '0.5px solid var(--border)',
        borderRadius: 7, padding: '3px 5px', gap: 2,
      }}>
        {/* Expand sidebar (PanelLeftOpen SVG) */}
        <UtilityButton
          tooltip="Expand sidebar"
          color="var(--text-muted)"
          onClick={onToggle}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <path d="M13 8l3 4-3 4"/>
          </svg>
        </UtilityButton>
        {/* Search */}
        <UtilityButton
          tooltip="Search"
          color="var(--text-muted)"
          onClick={onSearchOpen}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="4"/><line x1="9" y1="9" x2="13" y2="13"/>
          </svg>
        </UtilityButton>
      </div>

      {/* Separator */}
      <div style={{ width: 0.5, height: 18, background: 'var(--border)' }} />

      {/* Page name */}
      <span style={{
        fontSize: 12, fontFamily: "'Inter', sans-serif",
        color: 'var(--text-muted)',
      }}>
        {pageName}
      </span>
    </header>
  )
}

/* ─── Utility button with tooltip ─── */
function UtilityButton({
  children,
  tooltip,
  color,
  onClick,
}: {
  children: React.ReactNode
  tooltip: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="topbar-util"
      style={{
        position: 'relative',
        width: 24, height: 24, borderRadius: 4,
        background: 'transparent', border: 'none',
        color, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
      <span className="topbar-tooltip" style={{
        position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-elevated)', border: '0.5px solid var(--border)',
        borderRadius: 4, padding: '3px 8px', fontSize: 10,
        color: 'var(--text-primary)', whiteSpace: 'nowrap',
        pointerEvents: 'none', opacity: 0, transition: 'opacity 0.12s',
        zIndex: 100,
      }}>
        {tooltip}
      </span>

      <style jsx>{`
        .topbar-util:hover { background: var(--bg-hover) !important; }
        .topbar-util:hover .topbar-tooltip { opacity: 1 !important; }
      `}</style>
    </button>
  )
}
