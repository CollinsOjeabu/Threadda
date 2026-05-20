'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useAction } from 'convex/react'
import { ConvexError } from 'convex/values'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { S, ProgressDots, NavButtons, Spinner, analyzeHeuristics, getPersonaLine } from './components'

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export default function OnboardingPage() {
  const router = useRouter()
  const { clerkUser, profile } = useCurrentUser()
  const completeOnboard = useMutation(api.users.completeOnboarding)
  const updateProfile = useMutation(api.users.updateProfile)
  const saveVoiceSamples = useMutation(api.users.saveVoiceSamples)
  const analyzeVoice = useAction(api.voiceDna.analyzeManualSamples)
  const startIngestion = useAction(api.ingestion.startIngestion)

  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [samples, setSamples] = useState(['', '', ''])
  const [voicePreview, setVoicePreview] = useState({ storytelling: 0, technical: 0, provocative: 0, datadriven: 0, formality: 0 })
  const [realVoiceProfile, setRealVoiceProfile] = useState<Record<string, any> | null>(null)
  const [firstSource, setFirstSource] = useState<{ title: string } | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [skippedVoiceDna, setSkippedVoiceDna] = useState(false)
  const [skippedSource, setSkippedSource] = useState(false)
  const [sourceUrl, setSourceUrl] = useState('')
  const [fetchingSource, setFetchingSource] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill name from Clerk
  useEffect(() => {
    if (clerkUser && !displayName) setDisplayName(clerkUser.firstName ?? clerkUser.fullName ?? '')
  }, [clerkUser, displayName])

  // Redirect if already onboarded
  useEffect(() => {
    if (profile?.onboardingComplete && clerkUser?.id) {
      setCookie(`threadda-onboarded-${clerkUser.id}`, 'true', 31536000)
      router.push('/dashboard')
    }
  }, [profile, router, clerkUser])

  // Debounced voice heuristics
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const filled = samples.filter(s => s.trim().length > 0)
      if (filled.length > 0) setVoicePreview(analyzeHeuristics(filled))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [samples])

  const validSamples = samples.filter(s => s.trim().length >= 50)
  const canContinueStep2 = validSamples.length >= 2

  const addSample = () => { if (samples.length < 5) setSamples([...samples, '']) }
  const removeSample = (i: number) => setSamples(samples.filter((_, j) => j !== i))
  const updateSample = (i: number, v: string) => { const n = [...samples]; n[i] = v; setSamples(n) }

  const goNext = useCallback(() => { setError(''); setStep(s => Math.min(s + 1, 5)) }, [])
  const goBack = useCallback(() => { setError(''); setStep(s => Math.max(s - 1, 1)) }, [])

  /* ── Step handlers ── */
  const handleStep1 = async () => {
    if (displayName.trim().length < 2) { setError('Name must be at least 2 characters.'); return }
    setLoading(true)
    try { await updateProfile({ name: displayName.trim() }); goNext() }
    catch (e) { setError(e instanceof ConvexError ? (e as ConvexError<string>).data : 'Failed to save.') }
    finally { setLoading(false) }
  }

  const handleStep2 = async () => {
    if (!canContinueStep2) { setError('Add at least 2 samples (50+ chars each).'); return }
    setAnalysing(true); setError('')
    try {
      const cleaned = samples.map(s => s.trim()).filter(s => s.length > 0)
      await saveVoiceSamples({ samples: cleaned })
      const result = await analyzeVoice()
      setRealVoiceProfile(result as any)
      if (result) {
        setVoicePreview({
          storytelling: (result as any).storytelling ?? 0, technical: (result as any).technical ?? 0,
          provocative: (result as any).provocative ?? 0, datadriven: (result as any).datadriven ?? 0,
          formality: (result as any).formality ?? 0,
        })
      }
      goNext()
    } catch (e) { setError(e instanceof ConvexError ? (e as ConvexError<string>).data : 'Analysis failed. Try again.') }
    finally { setAnalysing(false) }
  }

  const handleFetchSource = async () => {
    if (!sourceUrl.trim()) { setError('Enter a URL.'); return }
    if (!profile) { setError('Profile not ready.'); return }
    try { new URL(sourceUrl) } catch { setError('Invalid URL format.'); return }
    setFetchingSource(true); setFetchStatus('Fetching...'); setError('')
    try {
      await startIngestion({ url: sourceUrl.trim(), userId: profile._id })
      setFetchStatus('Done ✓'); setFirstSource({ title: new URL(sourceUrl).hostname })
      goNext()
    } catch (e) { setError(e instanceof ConvexError ? (e as ConvexError<string>).data : 'Failed to fetch.'); setFetchStatus(null) }
    finally { setFetchingSource(false) }
  }

  const handleFinish = async (dest: string) => {
    setLoading(true)
    try {
      await completeOnboard()
      if (clerkUser?.id) {
        setCookie(`threadda-onboarded-${clerkUser.id}`, 'true', 31536000)
      }
      router.push(dest)
    } catch (e) { setError(e instanceof ConvexError ? (e as ConvexError<string>).data : 'Something went wrong.'); setLoading(false) }
  }

  const barTraits = [
    { key: 'storytelling', label: 'Storytelling' },
    { key: 'technical', label: 'Technical' },
    { key: 'provocative', label: 'Provocative' },
    { key: 'datadriven', label: 'Data-driven' },
    { key: 'formality', label: 'Formality' },
  ] as const

  return (
    <div style={S.page}>
      <ProgressDots current={step} total={5} />

      {/* ═══ STEP 1 — Welcome ═══ */}
      {step === 1 && (
        <div style={{ ...S.card, animation: 'slideIn 0.2s ease' }}>
          <div style={S.heading}>Your voice, amplified.</div>
          <div style={S.sub}>Threadda turns your research into original content that sounds exactly like you. Let&apos;s get you set up.</div>
          <label style={S.label}>What should we call you?</label>
          <input style={S.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" onFocus={e => (e.target.style.borderColor = 'var(--ember)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          {error && <div style={S.err}>{error}</div>}
          <NavButtons onContinue={handleStep1} backHidden disabled={displayName.trim().length < 2 || !profile} loading={loading} label={!profile ? 'Setting up your profile...' : 'Continue →'} />
        </div>
      )}

      {/* ═══ STEP 2 — Voice DNA ═══ */}
      {step === 2 && (
        <div style={{ ...S.card, animation: 'slideIn 0.2s ease' }}>
          <div style={{ ...S.heading, fontSize: 26 }}>Train your Voice DNA</div>
          <div style={{ ...S.sub, fontSize: 14 }}>Paste 2–5 samples of your own writing — LinkedIn posts, tweets, emails, anything you&apos;ve written. Your agents will match your exact voice.</div>

          {samples.map((s, i) => (
            <div key={i} style={{ marginBottom: 10, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Sample {i + 1}</span>
                {i > 0 && <button onClick={() => removeSample(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>×</button>}
              </div>
              <textarea value={s} onChange={e => updateSample(i, e.target.value)} placeholder="Paste a post, tweet, email, or anything you've written..."
                style={{ width: '100%', minHeight: 80, padding: '10px 12px', fontSize: 13, fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'var(--ember)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{s.length} chars</div>
            </div>
          ))}

          {samples.length < 5 && (
            <button onClick={addSample} style={{ background: 'none', border: 'none', color: 'var(--ember)', fontSize: 12, cursor: 'pointer', padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>+ Add another sample</button>
          )}

          {/* Voice DNA preview */}
          {samples.some(s => s.length > 20) && (
            <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginTop: 16 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Voice DNA Preview</div>
              {barTraits.map((t, i) => (
                <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
                  <span style={{ width: 80, flexShrink: 0, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{t.label}</span>
                  <div style={{ flex: 1, height: 3, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: 'var(--ember)', width: `${voicePreview[t.key]}%`, transition: 'width 0.6s ease-out', transitionDelay: `${i * 100}ms` }} />
                  </div>
                  <span style={{ width: 28, textAlign: 'right', fontSize: 10, color: 'var(--ember)', fontFamily: "'JetBrains Mono', monospace" }}>{voicePreview[t.key]}%</span>
                </div>
              ))}
              <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 14, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
                {analysing ? 'Reading your samples...' : getPersonaLine(voicePreview)}
              </div>
            </div>
          )}

          {error && <div style={S.err}>{error}</div>}
          <NavButtons onBack={goBack} onContinue={handleStep2} disabled={!canContinueStep2} loading={analysing} label={analysing ? 'Analysing your voice...' : 'Continue →'} />
          <button style={S.skip} onClick={() => { setSkippedVoiceDna(true); goNext() }}>Skip for now →</button>
        </div>
      )}

      {/* ═══ STEP 3 — First Source ═══ */}
      {step === 3 && (
        <div style={{ ...S.card, animation: 'slideIn 0.2s ease' }}>
          <div style={{ ...S.heading, fontSize: 26 }}>Save your first piece of research</div>
          <div style={{ ...S.sub, fontSize: 14 }}>Paste any article URL and we&apos;ll read it for you. Your agents use saved research to generate content ideas.</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input style={{ ...S.input, flex: 1 }} value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." onFocus={e => (e.target.style.borderColor = 'var(--ember)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            <button style={{ ...S.btnEmber, whiteSpace: 'nowrap', flexShrink: 0 }} onClick={handleFetchSource} disabled={fetchingSource}>
              {fetchingSource ? <Spinner /> : 'Fetch article'}
            </button>
          </div>

          {fetchStatus && (
            <div style={{ fontSize: 11, color: fetchStatus === 'Done ✓' ? 'var(--ember)' : 'var(--text-muted)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{fetchStatus}</div>
          )}

          {firstSource && (
            <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{firstSource.title}</div>
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--ember-muted)', color: 'var(--ember)' }}>Saved to Library ✓</span>
            </div>
          )}

          {error && <div style={S.err}>{error}</div>}
          <NavButtons onBack={goBack} onContinue={() => { if (firstSource || skippedSource) goNext(); else { setSkippedSource(true); goNext() } }} disabled={false} label={firstSource ? 'Continue →' : 'Continue →'} />
          <button style={S.skip} onClick={() => { setSkippedSource(true); goNext() }}>Skip — I&apos;ll add research later</button>
        </div>
      )}

      {/* ═══ STEP 4 — Meet Your Agents ═══ */}
      {step === 4 && (
        <div style={{ ...S.card, animation: 'slideIn 0.2s ease' }}>
          <div style={{ ...S.heading, fontSize: 26 }}>Meet your agents</div>
          <div style={{ ...S.sub, fontSize: 14 }}>Two AI writers trained on your voice. They&apos;ll turn your research into content — you just approve.</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {/* Authority */}
            <div style={{ background: 'rgba(255,107,53,0.12)', border: '0.5px solid rgba(255,107,53,0.3)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 14 14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v3M4 5l2.5 2M10 5l-2.5 2M7 7v4"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>The Authority</div>
                  <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 3 }}>E-LI-772</span>
                </div>
              </div>
              <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', marginBottom: 8 }}>LinkedIn</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 10 }}>Writes long-form LinkedIn posts. Provocative hooks, data-backed insights, thought leadership.</div>
              {!skippedVoiceDna && realVoiceProfile ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {barTraits.filter(t => voicePreview[t.key] > 40).slice(0, 3).map(t => (
                    <span key={t.key} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,107,53,0.1)', color: 'var(--ember)' }}>{voicePreview[t.key]}% {t.label.toLowerCase()}</span>
                  ))}
                </div>
              ) : <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>Voice DNA not yet trained</div>}
            </div>

            {/* Catalyst — locked */}
            <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(29,158,117,0.08)', border: '0.5px solid rgba(29,158,117,0.3)', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 14 14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M1 7.5c1.5-3 3-5 4.5-5s2 3 3.5 3 2-2.5 3.5-2.5"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>The Catalyst</div>
                    <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 3 }}>E-TW-119</span>
                  </div>
                </div>
                <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', marginBottom: 8 }}>X / Twitter</span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 10 }}>Writes punchy X threads. Sharp takes, strong opinions, built for retweets and replies.</div>
                {!skippedVoiceDna && realVoiceProfile ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {barTraits.filter(t => voicePreview[t.key] > 40).slice(0, 3).map(t => (
                      <span key={t.key} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(29,158,117,0.1)', color: '#1D9E75' }}>{voicePreview[t.key]}% {t.label.toLowerCase()}</span>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>Voice DNA not yet trained</div>}
              </div>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)', fontSize: 10,
                color: 'var(--text-muted)', letterSpacing: '0.08em',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                COMING SOON
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>Both agents write in YOUR voice. They never post without your approval.</div>
          {error && <div style={S.err}>{error}</div>}
          <NavButtons onBack={goBack} onContinue={goNext} />
        </div>
      )}

      {/* ═══ STEP 5 — Ready ═══ */}
      {step === 5 && (
        <div style={{ ...S.card, animation: 'slideIn 0.2s ease', textAlign: 'center' }}>
          <div style={{ ...S.heading, fontSize: 36 }}>You&apos;re ready.</div>
          <div style={S.sub}>Your voice is trained. Your agents are ready. Start by adding research to your Library, then open Canvas to synthesise it into content.</div>

          <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
            <CheckRow done={!skippedVoiceDna} label="Voice DNA trained" />
            <CheckRow done={!!firstSource && !skippedSource} label="First source saved" />
            <CheckRow done label="Agents ready" />
          </div>

          <button style={{ ...S.btnEmber, width: '100%', height: 48, fontSize: 14, fontWeight: 700 }} onClick={() => handleFinish('/dashboard/canvas')} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Spinner /> Preparing Canvas...</span> : 'Open Canvas →'}
          </button>
          <button style={{ ...S.skip, marginTop: 8 }} onClick={() => handleFinish('/dashboard')} disabled={loading}>Go to dashboard instead</button>
          {error && <div style={S.err}>{error}</div>}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea::placeholder, input::placeholder { color: var(--text-muted); opacity: 0.5; }
      `}</style>
    </div>
  )
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${done ? 'var(--ember)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done ? (
          <svg width="10" height="10" fill="none" viewBox="0 0 12 12" stroke="var(--ember)" strokeWidth="2" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>
        ) : (
          <div style={{ width: 8, height: 1.5, background: 'var(--text-muted)', borderRadius: 1 }} />
        )}
      </div>
      <span style={{ fontSize: 14, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
