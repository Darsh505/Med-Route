/**
 * mobile/src/i18n/index.ts
 * Clinical Multi-Language Support (English, Hindi, Punjabi) for Med Route Mobile
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import pa from "./locales/pa.json";

export const LANGUAGE_STORAGE_KEY = "@medroute_mobile_locale";

export type SupportedLanguage = "en" | "hi" | "pa";

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; nativeName: string }[] = [
  { code: "en", label: "English", nativeName: "English (EN)" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी (HI)" },
  { code: "pa", label: "Punjabi", nativeName: "ਪੰਜਾਬੀ (PA)" },
];

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export async function loadSavedLanguage(): Promise<SupportedLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === "en" || saved === "hi" || saved === "pa")) {
      await i18n.changeLanguage(saved);
      return saved as SupportedLanguage;
    }
  } catch (e) {
    console.warn("Failed to load saved language from storage", e);
  }
  return "en";
}

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.warn("Failed to persist language choice", e);
  }
}

export default i18n;
