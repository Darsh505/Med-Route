import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-16 bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center py-space-xl px-gutter">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-space-md p-space-lg bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-error">near_me_disabled</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest font-bold text-outline">
              Telemetry Error 404
            </span>
            <h1 className="text-2xl font-bold text-on-surface">Route Not Found</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The clinical corridor or hospital registry endpoint you are attempting to reach does not exist or has been relocated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Back to Home</span>
            </Link>
            <Link
              href="/search"
              className="flex-1 py-2.5 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              <span>Find Hospitals</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
