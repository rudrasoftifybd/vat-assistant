import bn from "./bn.json";
import en from "./en.json";

export type TranslationKey = keyof typeof bn;
export type NestedKey<T, K extends keyof T & string> = keyof T[K];
export type Language = "bn" | "en";

const translations: Record<Language, typeof bn> = { bn, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part] as string;
    }
    return "";
  }, obj) as string;
}

export function t(key: string, lang: Language = "bn"): string {
  const result = getNestedValue(translations[lang], key);
  return result || key;
}

export { translations };
