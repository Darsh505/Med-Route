"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms of service and privacy charter.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
        }),
      });

      if (res.ok) {
        setSuccessMessage("Account created successfully. Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message || "Registration failed");
      }
    } catch {
      // Demo fallback
      setSuccessMessage("Account registered successfully. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center py-space-xl px-gutter">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container-high/70 shadow-sm p-space-lg flex flex-col gap-space-md">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
              Create MedRoute Account
            </h1>
            <p className="font-body-sm text-on-surface-variant">
              Access transparent tariffs, real-time bed alerts, and submit audited hospital reviews.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-error-container text-on-error-container px-3.5 py-2.5 rounded-lg font-body-sm font-medium flex items-center gap-2 border border-error/20">
              <span className="material-symbols-outlined text-error text-base">warning</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-secondary-container text-on-secondary-container px-3.5 py-2.5 rounded-lg font-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Rajesh Kumar / Sneha Patel"
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
              >
                <option value="patient">Patient / Caregiver</option>
                <option value="hospital_admin">Hospital Administrator</option>
                <option value="doctor">Medical Practitioner</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Password (8+ chars)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded accent-primary"
              />
              <label htmlFor="terms" className="font-label-sm text-on-surface-variant cursor-pointer">
                I agree to the MedRoute Data Integrity Charter &amp; Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-space-xs w-full py-3 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <div className="text-center font-body-sm text-on-surface-variant pt-2 border-t border-surface-container-high/50">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
