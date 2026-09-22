"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("medroute_token", data.access_token);
        localStorage.setItem("medroute_user", JSON.stringify({ email, role: email.includes("admin") ? "admin" : "patient" }));
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 800);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message || "Invalid credentials");
      }
    } catch {
      // Fallback demo simulation
      if (password.length >= 6) {
        localStorage.setItem("medroute_token", "demo_jwt_token_" + Date.now());
        localStorage.setItem("medroute_user", JSON.stringify({ email, role: email.includes("admin") ? "admin" : "patient" }));
        setSuccessMessage("Logged in via Demo Session. Redirecting...");
        setTimeout(() => router.push("/"), 800);
      } else {
        setErrorMessage("Please enter a valid password (minimum 6 characters).");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@medroute.in");
    setPassword("admin123456");
  };

  const fillDemoPatient = () => {
    setEmail("patient@medroute.in");
    setPassword("patient123456");
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-primary-50) 100%)",
          padding: "var(--space-8) var(--space-4)",
        }}
      >
        <div
          style={{
            background: "var(--color-white)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--surface-border)",
            width: "100%",
            maxWidth: "440px",
            padding: "var(--space-8)",
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-xl)",
                background: "linear-gradient(135deg, var(--color-primary-600), var(--color-accent-500))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "var(--space-3)",
              }}
            >
              🏥
            </div>
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "var(--color-gray-900)" }}>
              Welcome to MedRoute
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginTop: "4px" }}>
              Sign in to manage reviews, save comparisons, and access hospital admin tools.
            </p>
          </div>

          {/* Quick Demo Fillers */}
          <div
            style={{
              background: "var(--color-gray-50)",
              border: "1px dashed var(--surface-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-3)",
              marginBottom: "var(--space-6)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-gray-500)", marginBottom: "6px" }}>
              ⚡ 1-CLICK DEMO ACCOUNTS
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: "11px", padding: "6px" }}
              >
                Fill Admin
              </button>
              <button
                type="button"
                onClick={fillDemoPatient}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: "11px", padding: "6px" }}
              >
                Fill Patient
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                background: "var(--color-emergency-bg)",
                color: "var(--color-emergency)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: "var(--color-success-bg)",
                color: "var(--color-success)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
              }}
            >
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--surface-border)",
                  fontSize: "var(--text-sm)",
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-gray-700)" }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: "none", background: "none", fontSize: "11px", color: "var(--color-primary-600)", cursor: "pointer" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--surface-border)",
                  fontSize: "var(--text-sm)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "var(--text-sm)", fontWeight: 700, marginTop: "var(--space-2)" }}
            >
              {isLoading ? "Signing in..." : "Sign In to MedRoute"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
            Don&apos;t have an account?{" "}
            <a href="/auth/register" style={{ color: "var(--color-primary-600)", fontWeight: 700, textDecoration: "none" }}>
              Create Account
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
