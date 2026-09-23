"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setUserLocale } from "@/services/locale";

const LOCALE_OPTIONS = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "hi", label: "हिन्दी", shortLabel: "हि" },
  { value: "pa", label: "ਪੰਜਾਬੀ", shortLabel: "ਪੰ" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    startTransition(async () => {
      await setUserLocale(nextLocale);
      router.refresh();
    });
  }

  return (
    <div className="relative flex items-center">
      <span className="material-symbols-outlined text-[18px] text-secondary pointer-events-none absolute left-2.5">
        translate
      </span>
      <select
        id="language-switcher"
        value={locale}
        onChange={onLocaleChange}
        disabled={isPending}
        aria-label="Select language"
        className={`
          appearance-none cursor-pointer
          pl-8 pr-7 py-space-xs
          bg-surface-container text-on-surface
          font-label-md text-label-md font-semibold
          rounded-lg border border-border-subtle
          hover:bg-surface-container-high
          focus:outline-none focus:ring-2 focus:ring-secondary/30
          transition-colors
          min-w-fit
          ${isPending ? "opacity-60 cursor-wait" : ""}
        `}
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none absolute right-1.5">
        keyboard_arrow_down
      </span>
    </div>
  );
}
