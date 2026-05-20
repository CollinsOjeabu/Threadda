'use client'

import { useState, useCallback, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import type { Id } from '../../../../convex/_generated/dataModel'

import { CanvasShell } from '@/components/canvas/CanvasShell'
import { SourcesPanel } from '@/components/canvas/SourcesPanel'
import { Constellation } from '@/components/canvas/Constellation'
import { RightPanel } from '@/components/canvas/RightPanel'
import { PostPreview } from '@/components/canvas/PostPreview'

/* ─── Error parser for Convex errors (rate limits, etc.) ─── */
const parseError = (e: unknown): string => {
  if (e instanceof Error) {
    try {
      const data = JSON.parse(e.message)
      if (data?.code === 'RATE_LIMIT_EXCEEDED') {
        const resource = data.resource as string
        const resetAt = data.resetAt ? new Date(data.resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'next month'
        const labels: Record<string, string> = {
          generations: 'post generations',
          ingestions: 'source imports',
          canvasSessions: 'canvas sessions',
          voiceDnaAnalyses: 'Voice DNA analyses',
        }
        return `You've reached your ${labels[resource] ?? resource} limit for this month. Resets on ${resetAt}.`
      }
    } catch { /* not JSON, fall through */ }
    return e.message || 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

/* ─── State type ─── */
type CanvasState = 'constellation' | 'session' | 'post-preview'

/* ─── Main Page (wrapped in Suspense for useSearchParams) ─── */
export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-page)' }}>
        <div className="text-body" style={{ color: 'var(--text-muted)' }}>Loading canvas...</div>
      </div>
    }>
      <CanvasPageInner />
    </Suspense>
  )
}

function CanvasPageInner() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const userId = profile?._id

  /* ─── Core state machine ─── */
  const [canvasState, setCanvasState] = useState<CanvasState>('constellation')
  const [selectedIds, setSelectedIds] = useState<Id<'contentItems'>[]>([])
  const [activeSessionId, setActiveSessionId] = useState<Id<'canvasSessions'> | null>(null)
  const [activeAgent, setActiveAgent] = useState<'authority' | 'catalyst'>('authority')
  const [generatedPost, setGeneratedPost] = useState<string | null>(null)
  const [generatedPostId, setGeneratedPostId] = useState<string | null>(null)
  const [voiceMatchScore, setVoiceMatchScore] = useState<number | null>(null)
  const [platform, setPlatform] = useState<'linkedin' | 'x'>('linkedin')

  /* ─── Chat state ─── */
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'agent' | 'system'; content: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  /* ─── Prefilled idea from Home page ─── */
  const searchParams = useSearchParams()
  const [prefilledIdea, setPrefilledIdea] = useState<string | null>(null)

  useEffect(() => {
    const ideaParam = searchParams.get('idea')
    const agentParam = searchParams.get('agent')
    if (!ideaParam) return
    setActiveAgent(agentParam === 'catalyst' ? 'catalyst' : 'authority')
    setPrefilledIdea(ideaParam)
  }, [searchParams])

  /* ─── Convex queries ─── */
  const contentItems = useQuery(
    api.content.list,
    userId ? { userId } : 'skip',
  )
  const graphEdges = useQuery(api.graphEdges.listEdgesForUser, {})
  const sessions = useQuery(api.canvas.listSessions)
  const activeSession = useQuery(
    api.canvas.getSession,
    activeSessionId ? { sessionId: activeSessionId } : 'skip',
  )

  /* ─── Convex mutations & actions ─── */
  const createSession = useMutation(api.canvas.createSession)
  const sendMessageAction = useAction(api.canvasChat.sendMessage)
  const generatePostAction = useAction(api.generation.generatePost)
  const regeneratePostAction = useAction(api.generation.regeneratePost)
  const updatePostStatus = useMutation(api.posts.updateStatus)

  /* ─── Derived: selected set for O(1) lookups ─── */
  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds])

  /* ─── Restore session chat from chatHistory ─── */
  useEffect(() => {
    if (activeSession?.chatHistory && activeSession.chatHistory.length > 0 && canvasState === 'session') {
      const existingMessages = activeSession.chatHistory.map((m) => ({
        role: m.role as 'user' | 'agent',
        content: m.content,
      }))
      if (existingMessages[0]?.role !== 'agent' || !existingMessages[0]?.content.includes('read all')) {
        setChatMessages([
          { role: 'agent', content: `I've read all ${activeSession.sourceIds.length} sources. Ready to synthesise — or click 💡 to break down the connections first.` },
          ...existingMessages,
        ])
      } else {
        setChatMessages(existingMessages)
      }
    }
  }, [activeSession, canvasState])

  /* ─── Toggle source selection ─── */
  const toggleSource = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const idTyped = id as Id<'contentItems'>
      if (prev.some((s) => String(s) === id)) {
        return prev.filter((s) => String(s) !== id)
      }
      return [...prev, idTyped]
    })
  }, [])

  /* ─── Start session ─── */
  const handleStartSession = useCallback(async () => {
    if (selectedIds.length === 0) return

    const sourceNames = contentItems
      ?.filter((item) => selectedIds.some((id) => String(id) === String(item._id)))
      .map((item) => item.title) ?? []

    const sessionId = await createSession({
      name: `Session · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      sourceIds: selectedIds,
    })

    setActiveSessionId(sessionId)
    setChatMessages([
      { role: 'agent', content: `I've read all ${sourceNames.length} sources. Ready to synthesise — or click 💡 to break down the connections first.` },
    ])
    setCanvasState('session')
  }, [selectedIds, createSession, contentItems])

  /* ─── Load recent session ─── */
  const handleLoadSession = useCallback((sessionId: Id<'canvasSessions'>) => {
    setActiveSessionId(sessionId)
    setCanvasState('session')
  }, [])

  /* ─── Send chat message ─── */
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !activeSessionId) return

    setChatMessages((prev) => [...prev, { role: 'user', content: message }])
    setChatMessages((prev) => [...prev, { role: 'agent', content: '...' }])

    try {
      const agentResponse = await sendMessageAction({ sessionId: activeSessionId, message })
      setChatMessages((prev) => {
        const updated = [...prev]
        const typingIdx = updated.findLastIndex((m) => m.role === 'agent' && m.content === '...')
        if (typingIdx >= 0) {
          updated[typingIdx] = { role: 'agent', content: agentResponse }
        } else {
          updated.push({ role: 'agent', content: agentResponse })
        }
        return updated
      })
    } catch (e) {
      setChatMessages((prev) => {
        const updated = [...prev]
        const typingIdx = updated.findLastIndex((m) => m.role === 'agent' && m.content === '...')
        if (typingIdx >= 0) {
          updated[typingIdx] = { role: 'agent', content: parseError(e) }
        }
        return updated
      })
    }
  }, [activeSessionId, sendMessageAction])

  /* ─── Generate post ─── */
  const handleGeneratePost = useCallback(async () => {
    if (!activeSessionId) return
    setIsGenerating(true)
    try {
      const result = await generatePostAction({
        sessionId: activeSessionId,
        agent: activeAgent,
        platform,
      })
      setGeneratedPost(result.body)
      setGeneratedPostId(result.postId)
      setVoiceMatchScore(result.voiceMatchScore)
      setCanvasState('post-preview')
    } catch (e) {
      setChatMessages((prev) => [...prev, {
        role: 'agent',
        content: parseError(e),
      }])
    } finally {
      setIsGenerating(false)
    }
  }, [activeSessionId, activeAgent, platform, generatePostAction])

  /* ─── Refinement ─── */
  const handleRefine = useCallback(async (instruction: string) => {
    if (!generatedPostId) return
    setIsGenerating(true)
    try {
      const result = await regeneratePostAction({
        postId: generatedPostId as Id<'agentPosts'>,
        feedback: instruction,
      })
      setGeneratedPost(result.body)
      setGeneratedPostId(result.postId)
      setVoiceMatchScore(result.voiceMatchScore)
    } catch (e) {
      setChatMessages((prev) => [...prev, {
        role: 'agent',
        content: parseError(e),
      }])
    } finally {
      setIsGenerating(false)
    }
  }, [generatedPostId, regeneratePostAction])

  /* ─── Save draft ─── */
  const handleSaveDraft = useCallback(async () => {
    if (!generatedPostId) return
    try {
      await updatePostStatus({ postId: generatedPostId as Id<'agentPosts'>, status: 'approved' })
      return true
    } catch {
      return false
    }
  }, [generatedPostId, updatePostStatus])

  /* ─── Refine post (silent background call) ─── */
  const handleRefinePost = useCallback(async (instruction: string) => {
    if (!activeSessionId) return
    try {
      const response = await sendMessageAction({
        sessionId: activeSessionId,
        message: `Here is my current post:\n\n${generatedPost}\n\nPlease apply this change and return ONLY the updated post text, nothing else:\n${instruction}`,
      })
      setGeneratedPost(response)
    } catch (e) {
      throw new Error(parseError(e))
    }
  }, [activeSessionId, generatedPost, sendMessageAction])

  /* ─── Back to session ─── */
  const handleBackToSession = useCallback(() => {
    setCanvasState('session')
  }, [])

  /* ─── New session (reset) ─── */
  const handleNewSession = useCallback(() => {
    setActiveSessionId(null)
    setCanvasState('constellation')
    setChatMessages([])
    setSelectedIds([])
    setGeneratedPost(null)
    setGeneratedPostId(null)
    setVoiceMatchScore(null)
  }, [])

  /* ─── Sources count for active session ─── */
  const sourcesCount = activeSession?.sourceIds.length ?? selectedIds.length

  /* ─── Source titles for post preview ─── */
  const sessionSourceTitles = useMemo(() => {
    const sourceIdSet = activeSession?.sourceIds ?? selectedIds
    return contentItems
      ?.filter((item) => sourceIdSet.some((id) => String(id) === String(item._id)))
      .map((item) => item.title) ?? []
  }, [contentItems, activeSession, selectedIds])

  /* ─── Loading state ─── */
  if (userLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-page)' }}>
        <div className="text-body" style={{ color: 'var(--text-muted)' }}>Loading canvas...</div>
      </div>
    )
  }

  /* ─── Breadcrumb items ─── */
  const breadcrumbs: { label: string; state: CanvasState }[] = [
    { label: 'CONSTELLATION', state: 'constellation' },
    ...(canvasState === 'session' || canvasState === 'post-preview'
      ? [{ label: 'SESSION', state: 'session' as CanvasState }]
      : []),
    ...(canvasState === 'post-preview'
      ? [{ label: 'POST PREVIEW', state: 'post-preview' as CanvasState }]
      : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-page)' }}>

      {/* ─── TopBar ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        minHeight: 36,
      }}>
        {/* Left: Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.state} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && (
                <span className="font-mono" style={{ fontSize: 8, color: '#3a3733', letterSpacing: '0.06em' }}>›</span>
              )}
              <span
                className="font-mono"
                style={{
                  fontSize: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: crumb.state === canvasState ? 'var(--ember)' : '#3a3733',
                  cursor: crumb.state !== canvasState ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (crumb.state === 'constellation') handleNewSession()
                  else if (crumb.state === 'session') handleBackToSession()
                }}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </div>

        {/* Right: Voice match + platform toggle (state 3 only) */}
        {canvasState === 'post-preview' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Voice match bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-mono" style={{ fontSize: 7.5, color: '#4a4642', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                VOICE MATCH
              </span>
              <div style={{ width: 64, height: 3, background: '#1c1c1c', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${voiceMatchScore ?? 0}%`,
                  height: '100%',
                  background: 'var(--ember)',
                  borderRadius: 2,
                  transition: 'width 300ms ease',
                }} />
              </div>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--ember)' }}>
                {voiceMatchScore ?? 0}%
              </span>
            </div>

            {/* Platform toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['linkedin', 'x'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className="font-mono"
                  style={{
                    fontSize: 8,
                    padding: '3px 10px',
                    borderRadius: 4,
                    border: `0.5px solid ${platform === p ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    background: platform === p ? '#140b06' : '#111',
                    color: platform === p ? 'var(--ember)' : '#3a3733',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {p === 'linkedin' ? 'LinkedIn' : 'X'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Prefilled idea banner ─── */}
      {prefilledIdea && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--ember-muted)',
          borderBottom: '0.5px solid var(--border)',
          fontSize: 12,
          color: 'var(--ember)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span>💡 Idea: {prefilledIdea}</span>
          <button
            onClick={() => setPrefilledIdea(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Three-panel layout ─── */}
      <CanvasShell
        hideRightPanel={canvasState === 'post-preview'}
        sourcesSlot={
          <SourcesPanel
            sources={contentItems ?? []}
            selectedIds={selectedSet}
            onToggle={toggleSource}
            canvasState={canvasState}
            onStartSession={handleStartSession}
            onBackToSession={handleBackToSession}
            onNewSession={handleNewSession}
            sessionSourceIds={activeSession?.sourceIds ?? selectedIds}
            isLoading={!contentItems}
          />
        }
        canvasSlot={
          canvasState === 'post-preview' ? (
            <PostPreview
              post={generatedPost ?? ''}
              onPostChange={setGeneratedPost}
              platform={platform}
              sourceTitles={sessionSourceTitles}
              sourcesCount={sourcesCount}
              profileName={profile?.name ?? 'User'}
              onSaveDraft={handleSaveDraft}
              onBackToSession={handleBackToSession}
              onNewSession={handleNewSession}
              onRefinePost={handleRefinePost}
            />
          ) : (
            <Constellation
              nodes={contentItems ?? []}
              edges={graphEdges ?? []}
              selectedIds={selectedSet}
              onToggleNode={toggleSource}
              canvasState={canvasState}
              onStartSession={handleStartSession}
              onSynthesise={() => handleSendMessage("What's the synthesis?")}
              onGeneratePost={handleGeneratePost}
              sourcesCount={sourcesCount}
            />
          )
        }
        rightSlot={
          <RightPanel
            canvasState={canvasState}
            activeAgent={activeAgent}
            onAgentChange={setActiveAgent}
            sessionId={activeSessionId}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onGeneratePost={handleGeneratePost}
            onRefine={handleRefine}
            isGenerating={isGenerating}
            sourcesCount={sourcesCount}
          />
        }
      />
    </div>
  )
}
