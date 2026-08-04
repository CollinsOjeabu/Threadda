'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

const STORAGE_KEY = 'threadda-sidebar-collapsed'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullscreen = pathname === '/dashboard/canvas'

  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Hydration-safe: read localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'true') setCollapsed(true)
  }, [])

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  // Keyboard shortcut: Ctrl+B / Cmd+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('threadda-theme') || 'void'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), [])
  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true)
    window.dispatchEvent(new CustomEvent('threadda-open-search'))
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar collapsed={collapsed} onToggle={handleToggle} onSearchOpen={handleSearchOpen} />
        <div style={{
          flex: 1,
          overflowY: isFullscreen ? 'hidden' : 'auto',
          overflowX: 'hidden',
          padding: isFullscreen ? 0 : 26,
        }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 2px; }
      `}</style>
    </div>
  )
}
