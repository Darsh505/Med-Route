"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-800 flex items-center justify-center mb-4 animate-pulse">
        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
      </div>
      <h1 className="text-xl font-bold text-white">Redirecting to MedRoute Provider Portal...</h1>
      <p className="text-xs text-slate-400 mt-2 max-w-sm">
        Hospital administrative telemetry operations are managed at the decoupled provider node.
      </p>
      <a
        href="/portal/admin"
        className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-500 transition-colors shadow-md"
      >
        Proceed to Portal
      </a>
    </div>
  );
}
