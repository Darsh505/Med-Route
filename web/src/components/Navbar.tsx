"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      id="main-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-nav)",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--surface-border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          height: "var(--nav-height)",
          gap: "var(--space-8)",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          id="navbar-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, var(--color-primary-600), var(--color-accent-500))",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🏥
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "var(--text-lg)",
                color: "var(--color-gray-900)",
                lineHeight: 1,
              }}
            >
              MedRoute
            </div>
            <div style={{ fontSize: "10px", color: "var(--color-gray-500)", fontWeight: 500 }}>
              Hospital Discovery
            </div>
          </div>
        </a>

        {/* Desktop nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            flex: 1,
          }}
        >
          {[
            { label: "Search", href: "/search" },
            { label: "Compare", href: "/compare" },
            { label: "About", href: "#" },
          ].map((link) => (
            <a
              key={link.label}
              id={`nav-${link.label.toLowerCase()}`}
              href={link.href}
              style={{
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-gray-600)",
                textDecoration: "none",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-primary-600)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-primary-50)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-gray-600)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: SOS + Login */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <a
            href="/sos"
            id="navbar-sos-btn"
            className="sos-btn"
            style={{ fontSize: "var(--text-xs)", padding: "8px 16px" }}
          >
            🚨 SOS
          </a>
          <a
            href="/auth/login"
            id="navbar-login-btn"
            className="btn btn-outline"
            style={{ fontSize: "var(--text-sm)", padding: "8px 20px" }}
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
