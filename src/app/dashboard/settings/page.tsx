'use client'

import { useState, useEffect } from 'react'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import Link from 'next/link'

/* ─── Settings tab config ─── */
const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'voicedna', label: 'Voice DNA', icon: 'target' },
  { id: 'integrations', label: 'Integrations', icon: 'plug' },
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
  { id: 'billing', label: 'Billing', icon: 'billing' },
] as const

type TabId = typeof SETTINGS_TABS[number]['id']

function SettingsIcon({ name }: { name: string }) {
  switch (name) {
    case 'user': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="4.5" r="2.5" /><path d="M1.5 11.5c0-2.76 2.24-5 5-5s5 2.24 5 5" /></svg>
    case 'target': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4" /><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'wave': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 12 C2 7.5 4.5 2.5 10.5 1.5" /><path d="M5.5 12 C5.5 9.5 7.5 6.5 10.5 5.5" /></svg>
    case 'plug': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3.5" width="11" height="8" rx="1" /><line x1="4" y1="1" x2="4" y2="4.5" /><line x1="9" y1="1" x2="9" y2="4.5" /></svg>
    case 'sun': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="3" /><path d="M6.5 1v1.5M6.5 10v1.5M1 6.5h1.5M10 6.5h1.5" /></svg>
    case 'billing': return <svg fill="none" viewBox="0 0 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="11" height="11" rx="1.5" /><line x1="4" y1="5" x2="9" y2="5" /><line x1="4" y1="8" x2="7" y2="8" /></svg>
    default: return null
  }
}

/* ─── Plan data ─── */
const PLANS = [
  { id: 'free' as const, name: 'Scout', price: '$0', period: '/forever', features: ['5 library items', '1 agent', 'Basic voice profile'] },
  { id: 'pro' as const, name: 'Authority', price: '$29', period: '/month', features: ['Unlimited library', '2 agents', 'Advanced Voice DNA', 'Scheduling', 'Analytics'] },
  { id: 'team' as const, name: 'Collective', price: '$79', period: '/month', features: ['Everything in Authority', '5 team members', 'Shared library', 'Team analytics', 'Priority support'] },
]

/* ─── Theme data ─── */
const THEMES = [
  { id: 'void' as const, name: 'Void', bg: '#070E09', accent: '#FF6B35', text: '#EDE8E0' },
  { id: 'dark' as const, name: 'Dark', bg: '#1A1A1A', accent: '#FF6B35', text: '#D9DCD8' },
  { id: 'light' as const, name: 'Light', bg: '#F6F6F4', accent: '#FF6B35', text: '#141414' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const { profile, isLoading } = useCurrentUser()

  /* ─── Profile form state ─── */
  const [formData, setFormData] = useState({ displayName: '', linkedInUrl: '', twitterHandle: '' })
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const updateProfile = useMutation(api.users.updateProfile)

  /* ─── Voice DNA analysis state ─── */
  const analyzeVoice = useAction(api.voiceDna.analyzeManualSamples)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  type VoiceProfile = {
    storytelling: number; technical: number; provocative: number; datadriven: number; formality: number;
    avgSentenceLength?: number; usesQuestions?: boolean; emojiUsage?: string;
    signaturePhrases?: string[]; writingPersona?: string;
  }
  const [voiceResult, setVoiceResult] = useState<VoiceProfile | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.name ?? '',
        linkedInUrl: (profile as Record<string, unknown>).linkedInUrl as string ?? '',
        twitterHandle: (profile as Record<string, unknown>).twitterHandle as string ?? '',
      })
    }
  }, [profile])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaveSuccess(false)
    setSaveError('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')
    try {
      await updateProfile({
        name: formData.displayName,
        linkedInUrl: formData.linkedInUrl || undefined,
        twitterHandle: formData.twitterHandle || undefined,
      })
      setHasChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.name ?? '',
        linkedInUrl: (profile as Record<string, unknown>).linkedInUrl as string ?? '',
        twitterHandle: (profile as Record<string, unknown>).twitterHandle as string ?? '',
      })
      setHasChanges(false)
      setSaveError('')
    }
  }

  /* ─── Preference toggles (persisted to Convex) ─── */
  const updatePreferences = useMutation(api.users.updatePreferences)
  const toggles = {
    auto: (profile as any)?.preferences?.auto ?? false,
    daily: (profile as any)?.preferences?.daily ?? true,
    weekly: (profile as any)?.preferences?.weekly ?? true,
    discovery: (profile as any)?.preferences?.discovery ?? false,
  }
  const toggle = (key: 'auto' | 'daily' | 'weekly' | 'discovery') => {
    updatePreferences({ [key]: !toggles[key] })
  }

  /* ─── Theme state (from ThemeProvider + Convex) ─── */
  const { theme, setTheme: handleTheme } = useTheme()

  /* ─── Derived ─── */
  const displayName = profile?.name ?? ''
  const initial = displayName.charAt(0).toUpperCase() || '?'
  const email = profile?.email ?? ''
  const plan = profile?.plan ?? 'free'

  return (
    <TooltipProvider>
      <div style={{ animation: 'fadeIn 0.18s ease' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ember)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>(06) — Settings</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 22 }}>Account &amp; <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>preferences.</em></div>

        <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 16 }}>
          {/* ─── TABS NAV ─── */}
          <Card className="h-fit">
            <CardContent className="p-1.5">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="sn-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 7,
                    fontSize: 12, cursor: 'pointer', border: 'none',
                    marginBottom: 2, width: '100%', textAlign: 'left' as const,
                    background: activeTab === tab.id ? 'var(--ember-muted)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--ember)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.14s',
                  }}
                >
                  <span style={{ width: 13, height: 13, flexShrink: 0, display: 'flex' }}><SettingsIcon name={tab.icon} /></span>
                  {tab.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* ─── PANEL CONTENT ─── */}
          <Card>
            <CardContent className="p-5">

              {/* ═══ PROFILE ═══ */}
              {activeTab === 'profile' && (
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Profile</div>
                  <div className="text-xs text-[var(--text-muted)] mb-5">Your public identity and platform connections.</div>

                  {isLoading ? (
                    <div>
                      <Card className="mb-5">
                        <CardContent className="p-3.5 flex items-center gap-3.5">
                          <Skeleton className="w-13 h-13 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-3.5 w-30 rounded mb-1.5" />
                            <Skeleton className="h-3 w-45 rounded" />
                          </div>
                        </CardContent>
                      </Card>
                      <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="mb-3">
                            <Skeleton className="h-3 w-20 rounded mb-2" />
                            <Skeleton className="h-9 w-full rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* User card */}
                      <Card className="mb-5">
                        <CardContent className="p-3.5 flex items-center gap-3.5">
                          {profile?.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt={displayName || 'Profile photo'}
                              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-full flex items-center justify-center shrink-0 text-white text-xl italic" style={{ background: 'var(--ember)', fontFamily: "'DM Serif Display', serif", width: 52, height: 52 }}>{initial}</div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-primary)]">{displayName || 'Unnamed'}</div>
                            <div className="text-xs text-[var(--text-muted)]">{email}</div>
                          </div>
                          <Button variant="outline" size="sm" className="ml-auto">Change photo</Button>
                        </CardContent>
                      </Card>

                      {/* Form */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="mb-3">
                          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Display name</label>
                          <Input value={formData.displayName} onChange={e => updateField('displayName', e.target.value)} className="h-9" />
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Email</label>
                          <Input value={email} disabled className="h-9" />
                          <div className="text-[10px] text-[var(--text-faint)] mt-0.5">Managed by Clerk</div>
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">LinkedIn URL</label>
                          <Input value={formData.linkedInUrl} onChange={e => updateField('linkedInUrl', e.target.value)} placeholder="https://linkedin.com/in/..." className="h-9" />
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-[var(--text-muted)] mb-1.5 block">X/Twitter handle</label>
                          <Input value={formData.twitterHandle} onChange={e => updateField('twitterHandle', e.target.value)} placeholder="@yourhandle" className="h-9" />
                        </div>
                      </div>

                      <hr className="border-t border-[var(--border)] my-4" />

                      <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Preferences</div>
                      <div className="text-xs text-[var(--text-muted)] mb-3.5">How Threadda behaves for you.</div>

                      {([
                        { key: 'auto' as const, label: 'Auto-approve drafts above 90% voice match', sub: 'High-scoring drafts queue automatically' },
                        { key: 'daily' as const, label: 'Daily idea notifications', sub: 'Get notified when content ideas surface' },
                        { key: 'weekly' as const, label: 'Weekly analytics digest', sub: 'Summary of best posts and sources' },
                        { key: 'discovery' as const, label: 'Research discovery mode', sub: 'Threadda suggests new sources from your graph' },
                      ]).map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < 3 ? '0.5px solid var(--border)' : 'none' }}>
                          <div>
                            <div className="text-[13px] text-[var(--text-primary)]">{row.label}</div>
                            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{row.sub}</div>
                          </div>
                          <Switch checked={toggles[row.key]} onCheckedChange={() => toggle(row.key)} />
                        </div>
                      ))}



                      <hr className="border-t border-[var(--border)] my-4" />

                      {saveSuccess && (
                        <div className="text-xs flex items-center gap-1.5 mb-2.5" style={{ color: '#1D9E75' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="5" /><polyline points="3.5,6 5.5,8 8.5,4" /></svg>
                          Changes saved successfully.
                        </div>
                      )}
                      {saveError && <div className="text-xs mb-2.5" style={{ color: '#E24B4A' }}>{saveError}</div>}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={!hasChanges}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving} className={!hasChanges ? 'opacity-40' : ''}>
                          {isSaving ? (
                            <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Saving…</>
                          ) : 'Save changes'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ VOICE DNA ═══ */}
              {activeTab === 'voicedna' && (
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Voice DNA</div>
                  <div className="text-xs text-[var(--text-muted)] mb-5">Your unique writing voice fingerprint.</div>

                  {isLoading ? (
                    <div>
                      <Skeleton className="h-4 w-40 rounded mb-3" />
                      <Skeleton className="w-full h-30 rounded mb-2" />
                      <Skeleton className="w-full h-30 rounded" />
                    </div>
                  ) : profile?.voiceRawSamples && profile.voiceRawSamples.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-[10px] border-[#1D9E75]/30 text-[#1D9E75] bg-[#1D9E75]/10">
                          {profile.voiceRawSamples.length} writing sample{profile.voiceRawSamples.length !== 1 ? 's' : ''} saved
                        </Badge>
                      </div>

                      <div className="text-xs font-semibold text-[var(--text-muted)] mb-2.5">Voice Training Samples</div>

                      <div className="flex flex-col gap-2">
                        {profile.voiceRawSamples.map((sample: string, i: number) => (
                          <VoiceSampleCard key={i} sample={sample} index={i} />
                        ))}
                      </div>

                      {profile.voiceProfile && !voiceResult && (
                        <div className="mt-5">
                          <div className="text-xs font-semibold text-[var(--text-muted)] mb-2.5">Current Voice Profile</div>
                          <div className="text-[13px] text-[var(--text-primary)] mb-1">Status: Analyzed ✓</div>
                          {profile.voiceProfile.writingPersona && (
                            <div className="text-[12px] text-[var(--text-muted)] mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto"
                              style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 8, border: '0.5px solid var(--border)', lineHeight: 1.6 }}>
                              {profile.voiceProfile.writingPersona}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Analyzed voice result */}
                      {voiceResult && (
                        <div className="mt-5">
                          <div className="text-xs font-semibold text-[var(--ember)] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Voice DNA Profile</div>

                          {/* Metrics bars */}
                          <div className="flex flex-col gap-2.5 mb-4">
                            {[
                              { key: 'storytelling', label: 'Storytelling', color: '#FF6B35' },
                              { key: 'technical', label: 'Technical', color: '#378ADD' },
                              { key: 'provocative', label: 'Provocative', color: '#E24B4A' },
                              { key: 'datadriven', label: 'Data-driven', color: '#1D9E75' },
                              { key: 'formality', label: 'Formality', color: '#EF9F27' },
                            ].map((m) => {
                              const val = voiceResult[m.key as keyof VoiceProfile] as number ?? 0
                              return (
                                <div key={m.key}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] text-[var(--text-muted)]">{m.label}</span>
                                    <span className="text-[11px] font-semibold" style={{ color: m.color }}>{val}%</span>
                                  </div>
                                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${val}%`, borderRadius: 3, background: m.color, transition: 'width 0.6s ease' }} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Writing Persona */}
                          {voiceResult.writingPersona && (
                            <div style={{ background: 'var(--ember-muted)', borderLeft: '2px solid var(--ember)', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: 12 }}>
                              <div className="text-[10px] font-semibold" style={{ color: 'var(--ember)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Writing Persona</div>
                              <div className="text-[13px] text-[var(--text-primary)] leading-relaxed">{String(voiceResult.writingPersona)}</div>
                            </div>
                          )}

                          {/* Signature phrases */}
                          {Array.isArray(voiceResult.signaturePhrases) && voiceResult.signaturePhrases.length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10px] font-semibold text-[var(--text-muted)] mb-2" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Signature Phrases</div>
                              <div className="flex flex-wrap gap-1.5">
                                {(voiceResult.signaturePhrases as string[]).map((phrase: string, i: number) => (
                                  <span key={i} style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', padding: '3px 8px', borderRadius: 6, fontSize: 11, color: 'var(--text-primary)' }}>
                                    &ldquo;{phrase}&rdquo;
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick stats */}
                          <div className="flex gap-3 text-[11px] text-[var(--text-muted)]">
                            {voiceResult.avgSentenceLength && <span>~{voiceResult.avgSentenceLength} words/sentence</span>}
                            {voiceResult.emojiUsage && <span>Emoji: {voiceResult.emojiUsage}</span>}
                            {voiceResult.usesQuestions && <span>Uses questions ✓</span>}
                          </div>
                        </div>
                      )}

                      {/* Retrain / Analyze button */}
                      <div className="mt-4">
                        {analyzeError && (
                          <div className="text-xs mb-2.5" style={{ color: '#E24B4A' }}>{analyzeError}</div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isAnalyzing || (profile?.voiceRawSamples?.length ?? 0) < 2}
                          onClick={async () => {
                            setIsAnalyzing(true)
                            setAnalyzeError('')
                            try {
                              const result = await analyzeVoice()
                              setVoiceResult(result as VoiceProfile)
                            } catch (err: unknown) {
                              const msg = err instanceof Error ? err.message : 'Voice analysis failed.'
                              setAnalyzeError(msg)
                            } finally {
                              setIsAnalyzing(false)
                            }
                          }}
                        >
                          {isAnalyzing ? (
                            <><span className="w-3 h-3 border-2 border-[var(--ember)]/30 border-t-[var(--ember)] rounded-full animate-spin inline-block mr-1.5" /> Analyzing voice…</>
                          ) : voiceResult || profile?.voiceProfile ? 'Retrain voice →' : 'Analyze voice →'}
                        </Button>
                        {(profile?.voiceRawSamples?.length ?? 0) < 2 && (
                          <div className="text-[11px] text-[var(--text-faint)] mt-1.5">Add at least 2 writing samples to enable analysis.</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 px-4 border border-dashed border-[var(--border)] rounded-xl">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--ember-muted)' }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 16 16" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="8" cy="8" r="5" /><circle cx="8" cy="8" r="2" fill="var(--ember)" stroke="none" />
                        </svg>
                      </div>
                      <div className="text-base font-semibold text-[var(--text-primary)] mb-2">No voice profile yet</div>
                      <div className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[360px] mx-auto mb-5">
                        Your Voice DNA will be trained when you connect LinkedIn or add writing samples during onboarding.
                      </div>
                      {profile?.onboardingComplete === false ? (
                        <Link href="/dashboard/onboarding" className="text-[13px] text-[var(--ember)] no-underline hover:underline">Go to onboarding →</Link>
                      ) : (
                        <div className="text-xs text-[var(--text-faint)]">Add writing samples from Settings → Profile to get started.</div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* ═══ INTEGRATIONS ═══ */}
              {activeTab === 'integrations' && (
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Connected Platforms</div>
                  <div className="text-xs text-[var(--text-muted)] mb-5">Platform connections enable direct publishing and Voice DNA training.</div>

                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Integrations coming soon
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
                      Connect Notion, Substack, and other platforms to bring your research directly into Threadda. Available in V1.
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ APPEARANCE ═══ */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Theme</div>
                  <div className="text-xs text-[var(--text-muted)] mb-5">Choose how Threadda looks for you.</div>

                  <div className="grid grid-cols-3 gap-3">
                    {THEMES.map((t) => {
                      const isActive = theme === t.id
                      return (
                        <button key={t.id} onClick={() => handleTheme(t.id)} className="rounded-xl overflow-hidden cursor-pointer transition-all text-left" style={{
                          background: 'var(--bg-elevated)',
                          border: isActive ? '1.5px solid var(--ember)' : '0.5px solid var(--border)',
                          boxShadow: isActive ? '0 0 0 3px rgba(255,107,53,0.08)' : 'none',
                          padding: 0,
                        }}>
                          <div className="relative" style={{ height: 56, background: t.bg, borderBottom: '0.5px solid var(--border)' }}>
                            <div className="absolute bottom-2 left-2.5 right-2.5 h-1 rounded-full" style={{ background: t.accent, opacity: 0.9 }} />
                            <div className="absolute top-2.5 left-2.5 w-6 h-1.5 rounded-sm" style={{ background: t.text, opacity: 0.6 }} />
                            <div className="absolute top-5 left-2.5 w-11 h-1 rounded-sm" style={{ background: t.text, opacity: 0.25 }} />
                          </div>
                          <div className="p-2.5 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--text-primary)]">{t.name}</span>
                            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{
                              border: isActive ? 'none' : '1.5px solid var(--border)',
                              background: isActive ? 'var(--ember)' : 'transparent',
                            }}>
                              {isActive && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><polyline points="1.5,4 3.5,6 6.5,2" /></svg>}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ═══ BILLING ═══ */}
              {activeTab === 'billing' && (
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Plan & Billing</div>
                  <div className="text-xs text-[var(--text-muted)] mb-5">Manage your subscription and payment details.</div>

                  {/* Current plan banner */}
                  <Card className="mb-5 border-[var(--ember)]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div>
                        <div className="text-[11px] text-[var(--text-faint)] uppercase tracking-wider mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Current plan</div>
                        <div className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                          {plan === 'free' ? 'Scout' : plan === 'pro' ? 'Authority' : 'Collective'}
                          <span className="font-normal text-sm text-[var(--text-muted)] ml-2">
                            {plan === 'free' ? 'Free forever' : plan === 'pro' ? '$29/month' : '$79/month'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan comparison */}
                  <div className="grid grid-cols-3 gap-3">
                    {PLANS.map((p) => {
                      const isCurrent = plan === p.id
                      return (
                        <Card key={p.id} className={`relative ${isCurrent ? 'border-[var(--ember)]' : ''}`}>
                          <CardContent className="p-4.5">
                            {isCurrent && (
                              <Badge className="absolute top-2.5 right-2.5 text-[8px]">Current</Badge>
                            )}
                            <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{p.name}</div>
                            <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: "'DM Serif Display', serif", color: isCurrent ? 'var(--ember)' : 'var(--text-primary)' }}>
                              {p.price}<span className="text-xs font-normal text-[var(--text-muted)]">{p.period}</span>
                            </div>
                            <hr className="border-t border-[var(--border)] my-3" />
                            <ul className="list-none p-0 m-0">
                              {p.features.map((f, i) => (
                                <li key={i} className="text-xs text-[var(--text-muted)] py-0.5 flex items-center gap-1.5">
                                  <span style={{ color: isCurrent ? 'var(--ember)' : '#1D9E75', fontSize: 10 }}>✓</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                            {!isCurrent && (
                              <Button variant="outline" size="sm" disabled className="w-full mt-3.5">
                                {p.id === 'free' ? 'Downgrade' : 'Upgrade →'}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  <div className="text-[13px] italic mt-4" style={{ color: 'var(--cream-muted, var(--text-faint))' }}>Billing management will be available when Stripe is connected.</div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .sn-item:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
      `}</style>
      </div>
    </TooltipProvider>
  )
}

/* ─── Voice sample card ─── */
function VoiceSampleCard({ sample, index }: { sample: string; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = sample.length > 200
  const displayText = isLong && !expanded ? sample.substring(0, 200) + '…' : sample

  return (
    <Card>
      <CardContent className="p-3.5">
        <Badge variant="outline" className="text-[9px] mb-2"># {index + 1}</Badge>
        <div className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{displayText}</div>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-[var(--ember)] bg-transparent border-none cursor-pointer p-0 mt-1.5">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
