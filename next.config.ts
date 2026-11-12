import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Clerk's Frontend API host is encoded in the publishable key
 * (pk_test_/pk_live_ + base64("<host>$")), so the CSP follows whichever
 * Clerk instance this build is configured for.
 */
function clerkFrontendApi(): string[] {
  const explicit = process.env.CLERK_FRONTEND_API_URL;
  if (explicit) return [explicit.replace(/\/+$/, "")];
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const encoded = key.split("_")[2];
  if (!encoded) return ["https://*.clerk.accounts.dev"];
  try {
    const host = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
    return host ? [`https://${host}`] : [];
  } catch {
    return ["https://*.clerk.accounts.dev"];
  }
}

function convexOrigins(): string[] {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return ["https://*.convex.cloud", "wss://*.convex.cloud"];
  const { host } = new URL(url);
  return [`https://${host}`, `wss://${host}`];
}

const clerk = clerkFrontendApi();
const convex = convexOrigins();
const turnstile = "https://challenges.cloudflare.com"; // Clerk bot protection

/**
 * Report-only for now: violations are logged in the browser console but
 * nothing is blocked. Enforcing needs nonces for Next's inline scripts
 * (and our theme / motion bootstrap snippets) instead of 'unsafe-inline'.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${[...clerk, turnstile].join(" ")}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://img.clerk.com",
  `connect-src 'self' ${[...clerk, ...convex, "https://clerk-telemetry.com"].join(" ")}${isDev ? " ws: http://localhost:*" : ""}`,
  `frame-src 'self' ${turnstile}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Browsers only honour this over HTTPS. No includeSubDomains/preload yet:
  // those are hard to undo and should wait until every subdomain is on HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
