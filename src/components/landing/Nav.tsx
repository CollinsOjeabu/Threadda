"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 100, width: "calc(100% - 48px)", maxWidth: 960,
      background: "rgba(7,14,9,0.85)", backdropFilter: "blur(16px)",
      border: "0.5px solid rgba(237,232,224,0.1)", borderRadius: 100,
      padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <img src="/images/threadda-logo-dark.svg" alt="Threadda" style={{ height: 28 }} />
      </Link>
      <div style={{ display: "flex", gap: 24 }}>
        {["How it works", "Features", "Pricing"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
            style={{ fontSize: 13, color: "rgba(237,232,224,0.45)", textDecoration: "none" }}>
            {l}
          </a>
        ))}
      </div>
      <Link href="/sign-up" style={{
        fontSize: 12, fontWeight: 600, background: "#FF6B35", color: "#fff",
        padding: "7px 18px", borderRadius: 100, textDecoration: "none",
      }}>
        Start for free
      </Link>
    </nav>
  );
}
