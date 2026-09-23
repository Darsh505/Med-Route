"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SOSRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/emergency-cashless");
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center font-body-md text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></span>
        <p className="font-semibold text-primary-container">Connecting to Emergency &amp; Cashless Portal...</p>
      </div>
    </div>
  );
}
