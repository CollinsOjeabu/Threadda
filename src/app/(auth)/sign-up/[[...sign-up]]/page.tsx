import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex bg-void">
      {/* Left — Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        {/* Ember glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-ember/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <h1 className="font-serif-display text-5xl text-cream leading-tight mb-6">
            Your knowledge,<br />
            <span className="text-ember italic">amplified.</span>
          </h1>
          <p className="text-cream-muted text-lg leading-relaxed mb-8">
            Save your research. Let AI build connections.
            Generate content that sounds like you — because it comes from you.
          </p>
          <div className="flex items-center gap-6 text-cream-muted text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Invite-only early access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Use the email your invite went to</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Clerk sign-up */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <SignUp
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md',
              cardBox: 'bg-surface border border-border-void shadow-2xl',
              headerTitle: 'text-cream font-serif-display',
              headerSubtitle: 'text-cream-muted',
              formButtonPrimary:
                'bg-ember hover:bg-ember/90 text-white shadow-none',
              formFieldInput:
                'bg-elevated border-border-void text-cream placeholder:text-cream-muted/40 focus:ring-ember/40 focus:border-ember',
              formFieldLabel: 'text-cream-muted',
              footerActionLink: 'text-ember hover:text-ember/80',
              dividerLine: 'bg-border-void',
              dividerText: 'text-cream-muted',
              socialButtonsBlockButton:
                'border-border-void text-cream hover:bg-elevated',
              socialButtonsBlockButtonText: 'text-cream',
              identityPreviewEditButton: 'text-ember',
              card: 'bg-transparent shadow-none',
            },
          }}
        />
      </div>
    </div>
  )
}
