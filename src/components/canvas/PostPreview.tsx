'use client'

import { useState, useRef, useCallback } from 'react'
import { LinkedInCard } from './LinkedInCard'

/* ─── Inline emoji grid (no external dependency) ─── */
const EMOJI_GRID = [
  '🚀', '💡', '🔥', '✨', '🎯', '💪', '🏆', '📈', '🌟', '⚡',
  '🤝', '💬', '📊', '🎉', '🧠', '👀', '🙌', '💎', '🔑', '❤️',
]

/* ─── Quick refinement presets ─── */
const REFINEMENT_PRESETS = [
  { label: 'Make it punchier', instruction: 'Make the opening hook punchier and the overall tone more direct. Remove any filler phrases.' },
  { label: 'Add a hot take', instruction: 'Add a bold, contrarian point of view that challenges conventional wisdom.' },
  { label: 'More storytelling', instruction: 'Rewrite with a narrative arc — open with a personal story or anecdote, then draw the insight.' },
  { label: 'Shorten to 150 words', instruction: 'Compress to under 150 words while keeping the core insight and hook.' },
  { label: 'Add data points', instruction: 'Add specific numbers, percentages, or data points to make the argument more credible.' },
]

interface PostPreviewProps {
  post: string
  onPostChange: (value: string | null) => void
  platform: 'linkedin' | 'x'
  sourceTitles: string[]
  sourcesCount: number
  profileName: string
  onSaveDraft: () => Promise<boolean | undefined>
  onBackToSession: () => void
  onNewSession: () => void
  onRefinePost: (instruction: string) => Promise<void>
}

/**
 * Full center panel for post-preview state.
 * Shows editing topbar, LinkedIn card, character count, refinement pills,
 * inline refinement input, media upload, and action bar.
 */
export function PostPreview({
  post,
  onPostChange,
  platform,
  sourceTitles,
  sourcesCount,
  profileName,
  onSaveDraft,
  onBackToSession,
  onNewSession,
  onRefinePost,
}: PostPreviewProps) {
  const [toast, setToast] = useState<string | null>(null)
  const [isRefining, setIsRefining] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showToneDropdown, setShowToneDropdown] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const refineInputRef = useRef<HTMLInputElement>(null)

  /* ─── Toast helper ─── */
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  /* ─── Draft ─── */
  const handleDraft = async () => {
    const success = await onSaveDraft()
    if (success !== false) {
      showToast('Saved to Agents queue')
    }
  }

  /* ─── Copy & Open LinkedIn ─── */
  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(post)
      window.open('https://www.linkedin.com/feed/', '_blank')
      showToast('Copied! Paste into LinkedIn.')
    } catch {
      showToast('Failed to copy — please copy manually.')
    }
  }

  /* ─── Inline refinement ─── */
  const handleRefineSubmit = async () => {
    const instruction = refineInput.trim()
    if (!instruction || isRefining) return
    setIsRefining(true)
    try {
      await onRefinePost(instruction)
      setRefineInput('')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Refinement failed. Please try again.')
    } finally {
      setIsRefining(false)
    }
  }

  /* ─── Preset refinement ─── */
  const handlePresetRefine = async (instruction: string) => {
    if (isRefining) return
    setIsRefining(true)
    try {
      await onRefinePost(instruction)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Refinement failed. Please try again.')
    } finally {
      setIsRefining(false)
    }
  }

  /* ─── Topbar: Bold / Italic ─── */
  const applyInlineFormat = (wrapper: string) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const selectedText = range.toString()
    if (!selectedText) return
    const start = post.indexOf(selectedText)
    if (start === -1) return
    const before = post.slice(0, start)
    const after = post.slice(start + selectedText.length)
    onPostChange(`${before}${wrapper}${selectedText}${wrapper}${after}`)
  }

  /* ─── Topbar: Copy ─── */
  const handleCopyPost = async () => {
    try {
      await navigator.clipboard.writeText(post)
      showToast('Copied!')
    } catch {
      showToast('Failed to copy.')
    }
  }

  /* ─── Topbar: AI actions ─── */
  const handleAIAction = async (instruction: string) => {
    setShowToneDropdown(false)
    setIsRefining(true)
    try {
      await onRefinePost(instruction)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Refinement failed. Please try again.')
    } finally {
      setIsRefining(false)
    }
  }

  /* ─── Emoji insert ─── */
  const handleEmojiInsert = (emoji: string) => {
    onPostChange(post + emoji)
    setShowEmojiPicker(false)
  }

  /* ─── File upload ─── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploadedImage(url)
  }

  /* ─── Character count ─── */
  const charCount = post.length
  const charColor = charCount > 3000 ? 'var(--error)' : charCount > 2700 ? 'var(--warning, #f59e0b)' : 'var(--text-faint)'

  /* ─── Shared icon button style ─── */
  const iconBtn: React.CSSProperties = {
    background: 'transparent', border: '0.5px solid var(--border)',
    borderRadius: 4, width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: isRefining ? 'wait' : 'pointer', fontSize: 12,
    color: 'var(--text-muted)', flexShrink: 0,
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-page)',
    }}>
      {/* Inner header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', flexShrink: 0,
      }}>
        <span className="font-mono" style={{
          fontSize: 7.5, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          POST PREVIEW
        </span>

        <span className="font-mono" style={{
          fontSize: 7.5, color: 'var(--ember)',
          background: 'var(--ember-muted)', border: '0.5px solid rgba(255,107,53,0.22)',
          borderRadius: 10, padding: '3px 10px',
        }}>
          Synthesised from {sourcesCount} sources ↗
        </span>
      </div>

      {/* ═══ Editing Topbar — icon-only ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: '5px 24px', flexShrink: 0,
        borderBottom: '0.5px solid var(--border)',
      }}>
        {/* Bold */}
        <button
          onMouseDown={(e) => { e.preventDefault(); applyInlineFormat('**') }}
          title="Bold"
          style={{ ...iconBtn, fontWeight: 700, fontSize: 11 }}
        >B</button>

        {/* Italic */}
        <button
          onMouseDown={(e) => { e.preventDefault(); applyInlineFormat('_') }}
          title="Italic"
          style={{ ...iconBtn, fontStyle: 'italic', fontSize: 11 }}
        >I</button>

        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 3px' }} />

        {/* Shorten */}
        <button
          onClick={() => handleAIAction('Make this post shorter')}
          disabled={isRefining}
          title="Shorten"
          style={iconBtn}
        >
          ↙
        </button>

        {/* Expand */}
        <button
          onClick={() => handleAIAction('Make this post longer and more detailed')}
          disabled={isRefining}
          title="Expand"
          style={iconBtn}
        >
          ↗
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 3px' }} />

        {/* Tone selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowToneDropdown(!showToneDropdown); setShowEmojiPicker(false) }}
            title="Tone"
            style={{
              ...iconBtn,
              background: showToneDropdown ? 'var(--ember-muted)' : 'transparent',
              color: showToneDropdown ? 'var(--ember)' : 'var(--text-muted)',
            }}
          >
            ☰
          </button>
          {showToneDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 20,
              background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
              borderRadius: 6, padding: 4, minWidth: 120,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {['Professional', 'Casual', 'Bold'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleAIAction(`Rewrite this post in a ${tone} tone`)}
                  className="font-mono"
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    padding: '6px 8px', fontSize: 9.5, color: 'var(--text-primary)',
                    cursor: 'pointer', borderRadius: 4,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--bg-elevated)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent' }}
                >
                  {tone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Emoji picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowToneDropdown(false) }}
            title="Emoji"
            style={{
              ...iconBtn,
              background: showEmojiPicker ? 'var(--ember-muted)' : 'transparent',
            }}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 20,
              background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
              borderRadius: 6, padding: 6,
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {EMOJI_GRID.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiInsert(emoji)}
                  style={{
                    background: 'transparent', border: 'none',
                    fontSize: 16, cursor: 'pointer', padding: 4,
                    borderRadius: 4,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--bg-elevated)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy */}
        <button
          onClick={handleCopyPost}
          title="Copy to clipboard"
          style={{ ...iconBtn, marginLeft: 'auto' }}
        >
          📋
        </button>
      </div>

      {/* ═══ Scrollable area ═══ */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '18px 24px',
      }}>
        {/* Toast */}
        {toast && (
          <div style={{
            background: 'var(--ember-muted)', border: '0.5px solid var(--ember-hover)',
            borderRadius: 'var(--radius-md)', padding: '7px 14px',
            marginBottom: 12, maxWidth: 520, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--ember)' }}>
              ✓ {toast}
            </span>
            <button
              onClick={() => setToast(null)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: 'var(--ember)', cursor: 'pointer', fontSize: 14,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Card */}
        {platform === 'linkedin' ? (
          <LinkedInCard
            post={post}
            onPostChange={(v) => onPostChange(v)}
            profileName={profileName}
            sourceTitles={sourceTitles}
          />
        ) : (
          /* X Thread placeholder */
          <div style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid rgba(255,107,53,0.15)',
            borderRadius: 10,
            padding: '40px 20px',
            maxWidth: 520,
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <span className="font-playfair" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              X Thread — Coming in Phase 2
            </span>
          </div>
        )}

        {/* ═══ Character count — right-aligned below card ═══ */}
        <div style={{ maxWidth: 520, margin: '6px auto 0', textAlign: 'right' }}>
          <span className="font-mono" style={{ fontSize: 8, color: charColor }}>
            {charCount} / 3000
          </span>
        </div>

        {/* ═══ Quick refinement presets — horizontal scrollable pills ═══ */}
        <div style={{
          maxWidth: 520, margin: '10px auto 0',
          display: 'flex', gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          {REFINEMENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetRefine(preset.instruction)}
              disabled={isRefining}
              className="font-mono"
              style={{
                flexShrink: 0,
                background: 'transparent',
                border: '0.5px solid var(--border)',
                borderRadius: 12,
                padding: '4px 10px',
                fontSize: 8.5,
                color: 'var(--text-muted)',
                cursor: isRefining ? 'wait' : 'pointer',
                opacity: isRefining ? 0.5 : 1,
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* ═══ Uploaded image preview ═══ */}
        {uploadedImage && (
          <div style={{
            maxWidth: 520, margin: '10px auto 0', position: 'relative',
          }}>
            <img
              src={uploadedImage}
              alt="Uploaded media"
              style={{
                width: '100%', borderRadius: 8,
                border: '0.5px solid var(--border)',
              }}
            />
            <button
              onClick={() => { setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'var(--bg-surface)', border: '0.5px solid var(--border)',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ═══ Media section — Upload only ═══ */}
        <div style={{
          background: 'var(--bg-page)',
          border: '0.5px solid rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: 11,
          maxWidth: 520,
          margin: '8px auto 0',
        }}>
          <div className="font-mono" style={{
            fontSize: 7.5, color: 'var(--text-faint)', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            ADD MEDIA · OPTIONAL
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--bg-surface)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
              padding: '10px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 3 }}>📁</div>
            <div className="font-mono" style={{ fontSize: 8.5, color: 'var(--text-muted)' }}>
              Upload image
            </div>
          </button>
        </div>
      </div>

      {/* ═══ Inline refinement input ═══ */}
      <div style={{
        padding: '8px 16px',
        borderTop: '0.5px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-page)', border: '0.5px solid var(--border)',
          borderRadius: 12, padding: '6px 10px',
          opacity: isRefining ? 0.6 : 1,
          transition: 'opacity 150ms ease',
        }}>
          <input
            ref={refineInputRef}
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRefineSubmit() }}
            placeholder="Ask the agent to change something..."
            disabled={isRefining}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', color: 'var(--text-primary)',
                fontSize: 13, padding: '6px 6px',
                fontFamily: 'var(--font-inter), sans-serif',
              }}
          />
          <button
            onClick={handleRefineSubmit}
            disabled={!refineInput.trim() || isRefining}
            style={{
              background: refineInput.trim() && !isRefining ? 'var(--ember)' : 'var(--bg-elevated)',
              color: refineInput.trim() && !isRefining ? 'var(--bg-page)' : 'var(--text-muted)',
              border: 'none', borderRadius: 4,
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: refineInput.trim() && !isRefining ? 'pointer' : 'default',
              fontSize: 12, flexShrink: 0,
              transition: 'all 150ms ease',
            }}
          >
            {isRefining ? '⏳' : '↑'}
          </button>
        </div>
      </div>

      {/* ═══ Bottom action bar ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        borderTop: '0.5px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        {/* Copy & Open LinkedIn */}
        <button
          onClick={handleCopyAndOpen}
          style={{
            background: 'var(--ember)', color: 'var(--bg-page)',
            border: 'none', borderRadius: 4,
            padding: '7px 16px', fontSize: 11, fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-inter), sans-serif',
            transition: 'all 150ms ease',
          }}
        >
          Copy & Open LinkedIn
        </button>

        {/* Save to draft */}
        <button
          onClick={handleDraft}
          style={{
            background: 'transparent',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            padding: '7px 16px', fontSize: 11, fontWeight: 500,
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'var(--font-inter), sans-serif',
            transition: 'all 150ms ease',
          }}
        >
          Save to draft
        </button>

        {/* Back to session */}
        <button
          onClick={onBackToSession}
          className="font-mono"
          style={{
            marginLeft: 'auto',
            background: 'none', border: 'none',
            fontSize: 8.5, color: 'var(--text-faint)',
            cursor: 'pointer',
          }}
        >
          ← Back to session
        </button>
      </div>
    </div>
  )
}
