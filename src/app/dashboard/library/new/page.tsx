'use client'

import { useState, useCallback, useRef } from 'react'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type ActiveTab = 'url' | 'note' | 'upload'

const PIPELINE_STEPS = [
  { label: 'Fetching article…', detail: 'Firecrawl is scraping the page' },
  { label: 'Summarising…', detail: 'Claude is extracting key insights' },
  { label: 'Indexing…', detail: 'Generating embeddings for search' },
  { label: 'Done ✓', detail: 'Article saved to your library' },
]

export default function NewContentPage() {
  const router = useRouter()
  const { profile } = useCurrentUser()
  const createItem = useMutation(api.content.createFromAuth)
  const startIngestion = useAction(api.ingestion.startIngestion)

  const [activeTab, setActiveTab] = useState<ActiveTab>('url')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // URL tab
  const [url, setUrl] = useState('')
  const [pipelineStep, setPipelineStep] = useState(-1) // -1 = not started

  // Note tab
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Upload tab
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const isValidUrl = (u: string) => /^https?:\/\/.+/.test(u)

  /* ─── URL ingestion pipeline ─── */
  const handleUrlSubmit = useCallback(async () => {
    setError('')
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return setError('Please enter a URL.')
    if (!isValidUrl(trimmedUrl)) return setError('URL must start with http:// or https://')
    if (!profile) return setError('Profile not loaded yet. Please wait.')

    setIsSubmitting(true)
    setPipelineStep(0) // Fetching

    try {
      // Simulate progressive steps
      // Step 0→1 after 1.5s (Firecrawl typically takes 2-5s)
      const stepTimer1 = setTimeout(() => setPipelineStep(1), 1500)
      // Step 1→2 after 4s (Claude summarization)
      const stepTimer2 = setTimeout(() => setPipelineStep(2), 4000)

      const result = await startIngestion({
        url: trimmedUrl,
        userId: profile._id,
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)

      // Done
      setPipelineStep(3)
      await new Promise((r) => setTimeout(r, 800))
      router.push('/dashboard/library')
    } catch (err: unknown) {
      setPipelineStep(-1)
      if (err instanceof Error) {
        try {
          const data = JSON.parse(err.message)
          if (data?.code === 'RATE_LIMIT_EXCEEDED') {
            const resetAt = data.resetAt ? new Date(data.resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'next month'
            setError(`You've reached your source import limit for this month. Resets on ${resetAt}.`)
            return
          }
        } catch { /* not JSON */ }
      }
      if (err instanceof Error && err.message.includes('scrape')) {
        setError("Couldn't reach that URL. Try pasting the content manually instead.")
      } else if (err instanceof Error && err.message.includes('Summar')) {
        setError("Summarisation failed. The article was saved without a summary.")
        setTimeout(() => router.push('/dashboard/library'), 1500)
      } else {
        const message = err instanceof Error ? err.message : 'Failed to process. Please try again.'
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [url, profile, startIngestion, router])

  /* ─── Manual note submit ─── */
  const handleNoteSubmit = useCallback(async () => {
    setError('')
    if (!noteTitle.trim()) return setError('Title is required.')
    if (!noteContent.trim()) return setError('Content is required.')

    setIsSubmitting(true)
    try {
      await createItem({
        type: 'note',
        title: noteTitle.trim(),
        content: noteContent.trim(),
      })
      router.push('/dashboard/library')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save note.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [noteTitle, noteContent, createItem, router])

  /* ─── File upload handlers ─── */
  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      return
    }
    setSelectedFile(file)
    setError('')
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError('')
    try {
      const text = await selectedFile.text()
      const title = selectedFile.name.replace(/\.[^/.]+$/, '')
      await createItem({
        type: selectedFile.name.endsWith('.pdf') ? 'pdf' as const : 'note' as const,
        title,
        content: text,
      })
      router.push('/dashboard/library')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file.'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', animation: 'fadeIn 0.18s ease' }}>
      {/* Back link */}
      <Link href="/dashboard/library" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 20, transition: 'color 0.12s' }}>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="7,2 3,6 7,10"/></svg>
        Back to Library
      </Link>

      {/* Header */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>(02) — Add Content</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 3 }}>New <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>item.</em></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
        Add a URL to scrape, summarise, and index — or write a manual note.
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {(['url', 'note', 'upload'] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(''); setPipelineStep(-1) }}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif",
              color: activeTab === tab ? 'var(--ember)' : 'var(--text-muted)',
              background: 'transparent',
              borderBottom: activeTab === tab ? '2px solid var(--ember)' : '2px solid transparent',
              transition: 'all 0.14s',
            }}
          >
            {tab === 'url' ? 'URL' : tab === 'note' ? 'Manual Note' : 'Upload'}
          </button>
        ))}
      </div>

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 24 }}>
          {pipelineStep < 0 ? (
            /* Input mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Article URL <span style={{ color: 'var(--ember)' }}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError('') }}
                  onBlur={() => {
                    if (url.trim() && !isValidUrl(url.trim())) setError('URL must start with http:// or https://')
                  }}
                  className="form-input"
                  style={inputStyle}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
                Threadda will scrape the article, generate an AI summary, and create embeddings for search.
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.2)',
                  fontSize: 12, color: '#E24B4A', lineHeight: 1.5,
                }}>
                  {error}
                  {error.includes('manually') && (
                    <button
                      onClick={() => { setActiveTab('note'); setError('') }}
                      style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', color: 'var(--ember)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}
                    >
                      Switch to Manual Note →
                    </button>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleUrlSubmit}
                disabled={isSubmitting || !url.trim()}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 8,
                  border: 'none', cursor: !url.trim() ? 'not-allowed' : 'pointer',
                  background: !url.trim() ? 'var(--bg-elevated)' : 'var(--ember)',
                  color: !url.trim() ? 'var(--text-muted)' : '#fff',
                  fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                Add Article
              </button>
            </div>
          ) : (
            /* Pipeline progress mode */
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 20, textAlign: 'center' }}>
                This takes ~10 seconds
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {PIPELINE_STEPS.map((step, i) => {
                  const isComplete = pipelineStep > i
                  const isActive = pipelineStep === i
                  const isPending = pipelineStep < i

                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
                      {/* Vertical line connector */}
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 11, top: 24, width: 2, height: 28,
                          background: isComplete ? 'var(--ember)' : 'var(--border)',
                          transition: '0.3s ease',
                        }} />
                      )}

                      {/* Circle indicator */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: '0.3s ease',
                        ...(isComplete ? {
                          background: 'var(--ember)', border: 'none',
                        } : isActive ? {
                          background: 'transparent', border: '2px solid var(--ember)',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        } : {
                          background: 'transparent', border: '2px solid var(--border)',
                        }),
                      }}>
                        {isComplete && (
                          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isActive && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)' }} />
                        )}
                      </div>

                      {/* Label */}
                      <div style={{ paddingBottom: i < PIPELINE_STEPS.length - 1 ? 28 : 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: isActive || isComplete ? 600 : 400,
                          color: isPending ? 'var(--text-muted)' : 'var(--text-primary)',
                          transition: '0.2s ease',
                        }}>
                          {step.label}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                            {step.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Note Tab */}
      {activeTab === 'note' && (
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
                Title <span style={{ color: 'var(--ember)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="What's this about?"
                value={noteTitle}
                onChange={(e) => { setNoteTitle(e.target.value); setError('') }}
                className="form-input"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>
                Content <span style={{ color: 'var(--ember)' }}>*</span>
              </label>
              <textarea
                placeholder="Write your thoughts, paste text, or capture an idea…"
                value={noteContent}
                onChange={(e) => { setNoteContent(e.target.value); setError('') }}
                className="form-input"
                rows={8}
                style={{ ...inputStyle, minHeight: 160, resize: 'vertical' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.2)',
                fontSize: 12, color: '#E24B4A',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleNoteSubmit}
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 8,
                border: 'none', cursor: isSubmitting ? 'wait' : 'pointer',
                background: isSubmitting ? 'rgba(255,107,53,0.6)' : 'var(--ember)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
            >
              {isSubmitting ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              style={{
                border: '1px dashed var(--border)',
                borderRadius: 8,
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-elevated)',
                transition: 'border-color 0.14s',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                Drop a file or click to browse
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                PDF, TXT, or MD — max 10MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 8,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </span>
                <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>×</button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.2)',
                fontSize: 12, color: '#E24B4A',
              }}>
                {error}
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleFileUpload}
                disabled={isUploading}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 8,
                  border: 'none', cursor: isUploading ? 'wait' : 'pointer',
                  background: isUploading ? 'rgba(255,107,53,0.6)' : 'var(--ember)',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                {isUploading ? 'Processing…' : 'Add to Library →'}
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .form-input:focus { border-color: var(--ember) !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.12); outline: none; }
        .form-input::placeholder { color: var(--text-faint); }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-elevated)',
  border: '0.5px solid var(--border)',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--text-primary)',
  fontFamily: "'Inter', sans-serif",
  transition: 'border-color 0.14s, box-shadow 0.14s',
  outline: 'none',
}
