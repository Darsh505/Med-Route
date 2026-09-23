import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/services/locale";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  // Validate locale against our routing config
  const resolvedLocale = routing.locales.includes(locale as "en" | "hi" | "pa")
    ? locale
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../../locales/${resolvedLocale}.json`)).default,
  };
});
