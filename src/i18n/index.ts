import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en";
import fr from "./fr";

const LANGUAGE_KEY = "app_language";

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

export const supportedLanguages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

// Detect the best language from device locale
function getDeviceLanguage(): string {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    const lang = locales[0].languageCode;
    if (lang && (lang === "fr" || lang.startsWith("fr"))) return "fr";
  }
  return "en";
}

// Initialize i18next
const initI18n = async () => {
  // Check if user has previously chosen a language
  let savedLanguage: string | null = null;
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {}

  const lng = savedLanguage || getDeviceLanguage();

  await i18next.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
  });
};

// Change language and persist choice
export const changeLanguage = async (lang: string) => {
  await i18next.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
};

export { initI18n };
export default i18next;
