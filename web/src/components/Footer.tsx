export default function Footer() {
  return (
    <footer
      id="main-footer"
      style={{
        background: "var(--color-gray-900)",
        color: "var(--color-gray-400)",
        padding: "var(--space-12) 0 var(--space-8)",
      }}
    >
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "var(--space-8)", marginBottom: "var(--space-10)" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "24px" }}>🏥</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "var(--text-xl)", color: "white" }}>
                MedRoute
              </div>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, maxWidth: "280px" }}>
              AI-powered hospital discovery for India. Find the right hospital, at the right cost, near you.
            </p>
            <div
              style={{
                marginTop: "var(--space-4)",
                padding: "var(--space-3) var(--space-4)",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "var(--text-xs)",
              }}
            >
              🔍 <strong style={{ color: "white" }}>Data Transparency:</strong> Every hospital record shows its data source.
              ⚪ Simulated · 🟢 PMJAY Verified · 🟡 HFR Registry · 🔵 Community
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [{ label: "Search Hospitals", href: "/search" }, { label: "Compare", href: "/compare" }, { label: "SOS Emergency", href: "/sos" }],
            },
            {
              title: "Data Sources",
              links: [{ label: "PMJAY / Ayushman", href: "#" }, { label: "Health Facility Registry", href: "#" }, { label: "Contribute Data", href: "#" }],
            },
            {
              title: "Company",
              links: [{ label: "About Med Route", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "Contact", href: "#" }],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 style={{ color: "white", fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
                {section.title}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {section.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-400)", textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "var(--space-6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)" }}>
            © 2026 Med Route. Built for the Hackathon.
          </p>
          <p style={{ fontSize: "var(--text-xs)" }}>
            Powered by Google Gemini AI + PostGIS
          </p>
        </div>
      </div>
    </footer>
  );
}
