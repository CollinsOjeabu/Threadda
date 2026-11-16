import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Threadda — Your Voice, Amplified",
  description:
    "Connect your research before you generate. Synthesize ideas across sources into voice-matched content.",
  keywords: [
    "knowledge graph",
    "AI content",
    "LinkedIn automation",
    "thought leadership",
    "personal branding",
  ],
  openGraph: {
    title: "Threadda — Your Voice, Amplified",
    description:
      "Connect your research before you generate. Synthesize ideas across sources into voice-matched content.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}
      data-theme="void"
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('threadda-theme');if(!t){var l=localStorage.getItem('echora-theme');if(l){t=l==='eden'?'dark':l;localStorage.setItem('threadda-theme',t);localStorage.removeItem('echora-theme');}}if(t&&['void','dark','light'].includes(t)){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        {/* Landing motion: mark JS as available before first paint so scroll entrances start
            hidden, not flashed. It lives here because the root layout never remounts: a <script>
            in the marketing layout gets re-created by React on client navigation, which never
            runs it and logs a dev error. Client navigations rely on LandingMotion adding the
            class instead. If LandingMotion hasn't booted within 4s, the class is removed and
            __lpMotionOff is set, so a late boot leaves the already-visible content alone. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(location.pathname==='/'){document.documentElement.classList.add('lp-js');setTimeout(function(){if(!window.__lpMotion){window.__lpMotionOff=true;document.documentElement.classList.remove('lp-js')}},4000)}",
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
      </body>
    </html>
  );
}

