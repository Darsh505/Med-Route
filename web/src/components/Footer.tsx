import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low py-space-md border-t border-surface-container-high/60 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-md text-label-md text-on-surface-variant">
        <div className="flex items-center gap-space-md">
          <span className="text-on-surface font-semibold">MedRoute Telemetry Systems</span>
          <span className="hidden md:inline">© 2025 MedRoute Inc. All clinical datasets NABH &amp; JCI verified.</span>
        </div>
        <div className="flex items-center gap-space-lg flex-wrap justify-center">
          <Link className="hover:text-on-surface transition-colors" href="/search">
            Emergency Matrix
          </Link>
          <Link className="hover:text-on-surface transition-colors" href="/compare">
            Audited Tariffs
          </Link>
          <Link className="hover:text-on-surface transition-colors" href="/admin">
            Provider Data Node
          </Link>
          <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2 py-0.5 rounded-md">
            NABH / PMJAY Compliant
          </span>
        </div>
      </div>
    </footer>
  );
}
