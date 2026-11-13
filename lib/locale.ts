export type Locale = "en" | "zh";

export const SOURCE_REPO = "https://github.com/zhangyujia583-ux/Repo-Scout";

export function parseLocale(value: string | string[] | null | undefined): Locale {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "zh" ? "zh" : "en";
}

export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}
