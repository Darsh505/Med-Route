"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import MedRouteLogo from "@/components/MedRouteLogo";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="w-full bg-surface-card shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-space-xl border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-margin lg:px-margin-lg py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter">
          
          {/* Col 1 & 2: Institutional Brand & Accreditations */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <MedRouteLogo size="md" clickable={true} />
            
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              {t("footer.brandDescription")}
            </p>

            <div className="flex flex-wrap items-center gap-space-sm mt-space-xs">
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-ice text-secondary font-label-sm text-label-sm border border-border-subtle min-w-fit">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{t("footer.irdaiRegistered")}</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-ice text-secondary font-label-sm text-label-sm border border-border-subtle min-w-fit">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>{t("footer.nabhPartner")}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Discovery */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-bold">
              {t("footer.hospitalDiscovery")}
            </h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <Link href="/" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.findHospitals")}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.compareNetworkHospitals")}
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.icuBedCapacity")}
                </Link>
              </li>
              <li>
                <Link href="/#specialty-hub" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.doctorSpecialties")}
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
              {t("footer.cashlessClaims")}
            </h4>
            <ul className="flex flex-col gap-space-xs">
              <li>
                <Link href="/emergency-cashless" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.cashlessApproval")}
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless#checker-tool" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.tpaNetworkTieups")}
                </Link>
              </li>
              <li>
                <Link href="/emergency-cashless#checker-tool" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.abhaRecordLocker")}
                </Link>
              </li>
              <li>
                <Link href="/portal" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {t("footer.trackClaimStatus")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Mobile Healthcare */}
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-bold">
              {t("footer.mobileHealthcare")}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              {t("footer.mobileHealthcareDesc")}
            </p>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left cursor-pointer border border-border-subtle">
                <span className="material-symbols-outlined text-secondary text-[24px]">android</span>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant leading-none">{t("footer.useItOn")}</div>
                  <div className="font-label-md text-label-md text-on-surface font-bold leading-tight">{t("footer.androidApp")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-space-xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md border-t border-border-subtle">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t("footer.copyright")}
          </span>
          <div className="flex flex-wrap items-center gap-space-lg">
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              {t("footer.privacyPolicy")}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              {t("footer.termsOfService")}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              {t("footer.grievanceRedressal")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
