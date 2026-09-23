import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-card shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-space-xl border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-lg py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter">
          
          {/* Col 1 & 2: Institutional Brand & Accreditations */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px]">local_hospital</span>
              </div>
              <span className="font-headline-md text-headline-md text-primary-container tracking-tight font-bold">
                Medi Route
              </span>
            </div>
            
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              Authoritative digital healthcare gateway providing guaranteed cashless hospitalization, direct NABH hospital admissions, and seamless ABHA health records integration.
            </p>

            <div className="flex flex-wrap items-center gap-space-sm mt-space-xs">
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-ice text-secondary font-label-sm text-label-sm border border-border-subtle">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>IRDAI Registered Network</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-ice text-secondary font-label-sm text-label-sm border border-border-subtle">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>NABH Partner Network</span>
              </div>
            </div>
          </div>

          {/* Col 3: Discovery */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-bold">
              Hospital Discovery
            </h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <Link href="/" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Find Hospitals
                </Link>
              </li>
              <li>
                <Link href="/compare" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Compare Network Hospitals
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  ICU &amp; Bed Capacity
                </Link>
              </li>
              <li>
                <Link href="/#specialty-hub" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Doctor Specialties
                </Link>
              </li>
              <li>
                <Link href="/portal/admin" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Hospital Provider Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Cashless & Claims */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-bold">
              Cashless &amp; Claims
            </h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <Link href="/emergency-cashless" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  20-Min Cashless Approval
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless#checker-tool" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  TPA Network Tie-ups
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless#checker-tool" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  ABHA Record Locker
                </Link>
              </li>
              <li>
                <Link href="/portal" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Track Claim Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Mobile Healthcare */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-bold">
              Mobile Healthcare
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Carry 24x7 instant medical desk &amp; digital health locker on your device.
            </p>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left cursor-pointer border border-border-subtle">
                <span className="material-symbols-outlined text-secondary text-[24px]">android</span>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant leading-none">Use it on</div>
                  <div className="font-label-md text-label-md text-on-surface font-bold leading-tight">Android App</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-space-xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md border-t border-border-subtle">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2025 Medi Route Healthcare Technologies Ltd. All rights reserved.
          </span>
          <div className="flex items-center gap-space-lg">
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              Privacy Policy
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              Terms of Service
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              Grievance Redressal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
