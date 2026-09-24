"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName, role);
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        if (role === "admin") {
          window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin-med-route.vercel.app/";
        } else {
          router.push("/");
        }
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please check your details.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMessage("Signed in with Google. Redirecting...");
      setTimeout(() => router.push("/"), 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in could not be completed.";
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center py-space-xl px-gutter">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container-high/70 shadow-xl p-space-lg flex flex-col gap-space-md">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-1 shadow-md">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
              Create MedRoute Account
            </h1>
            <p className="font-body-sm text-on-surface-variant">
              Access real-time emergency routing, hospital tariffs, and patient advocacy.
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
                placeholder="Dr. Arjun Sharma / Priya Patel"
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
                placeholder="name@example.com"
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "patient"
                      ? "bg-primary text-on-primary border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant border-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>Patient / Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "admin"
                      ? "bg-primary text-on-primary border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant border-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">shield_person</span>
                  <span>Hospital Admin</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold text-on-surface">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-surface-container-low rounded-lg px-3.5 py-2.5 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="font-body-sm text-xs text-on-surface-variant cursor-pointer">
                I agree to the National Digital Health &amp; Telemetry Charter.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-space-xs w-full py-3 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register with MedRoute</span>
              )}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-surface-container-high"></div>
            <span className="flex-shrink mx-3 text-outline font-label-sm text-xs">or continue with</span>
            <div className="flex-grow border-t border-surface-container-high"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md font-semibold border border-surface-container-high/80 shadow-xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? "Connecting Google..." : "Google Account"}</span>
          </button>

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
