export const WINDOWS = [7, 30, 90] as const;

export type WindowDays = (typeof WINDOWS)[number];
export type DiscoverMode = "new" | "rising";

export const LANGUAGES = [
  { value: "all", label: "Any language" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "Java", label: "Java" },
  { value: "Kotlin", label: "Kotlin" },
  { value: "Swift", label: "Swift" },
  { value: "Ruby", label: "Ruby" },
  { value: "PHP", label: "PHP" },
  { value: "C++", label: "C++" },
  { value: "C", label: "C" },
  { value: "C#", label: "C#" },
  { value: "Shell", label: "Shell" },
  { value: "Dart", label: "Dart" },
  { value: "Scala", label: "Scala" },
  { value: "Elixir", label: "Elixir" },
  { value: "Haskell", label: "Haskell" },
  { value: "Lua", label: "Lua" },
] as const;

export const SUGGESTED_TOPICS = [
  "ai",
  "llm",
  "mcp",
  "cli",
  "devtools",
  "react",
  "agent",
  "rust",
] as const;

export type Filters = {
  query: string;
  language: string;
  topic: string;
  windowDays: WindowDays;
  mode: DiscoverMode;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  language: "all",
  topic: "",
  windowDays: 30,
  mode: "new",
};

const SEARCH_PAGE_SIZE = 30;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function sanitizeKeyword(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/["\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function sanitizeTopic(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function sanitizeLanguage(raw: string | undefined): string {
  if (!raw) return "all";
  const trimmed = raw.trim().slice(0, 40);
  if (!trimmed || trimmed.toLowerCase() === "all") return "all";
  const known = LANGUAGES.find(
    (language) => language.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (known) return known.value;
  if (/^[A-Za-z0-9+#.\- ]+$/.test(trimmed)) return trimmed;
  return "all";
}

export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): Filters {
  const windowRaw = Number(first(searchParams.window));
  const windowDays = WINDOWS.includes(windowRaw as WindowDays)
    ? (windowRaw as WindowDays)
    : DEFAULT_FILTERS.windowDays;
  const mode = first(searchParams.mode) === "rising" ? "rising" : "new";
  return {
    query: sanitizeKeyword(first(searchParams.q)),
    language: sanitizeLanguage(first(searchParams.language)),
    topic: sanitizeTopic(first(searchParams.topic)),
    windowDays,
    mode,
  };
}

export function sinceDate(windowDays: number, now = new Date()): string {
  const date = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function quoteQualifier(value: string): string {
  if (/^[A-Za-z0-9.]+$/.test(value)) return value;
  return `"${value}"`;
}

export function buildSearchQuery(filters: Filters, now = new Date()): string {
  const parts = [
    "is:public",
    "fork:false",
    "archived:false",
    `created:>=${sinceDate(filters.windowDays, now)}`,
  ];

  if (filters.mode === "rising") {
    const pushedWindow = Math.min(7, filters.windowDays);
    parts.push(`pushed:>=${sinceDate(pushedWindow, now)}`);
    parts.push("stars:>=5");
  }

  if (filters.language !== "all") {
    parts.push(`language:${quoteQualifier(filters.language)}`);
  }
  if (filters.topic) parts.push(`topic:${filters.topic}`);
  if (filters.query) {
    parts.push(filters.query.includes(" ") ? `"${filters.query}"` : filters.query);
  }

  return parts.join(" ");
}

export function buildGithubSearchUrl(query: string): string {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(SEARCH_PAGE_SIZE));
  return url.toString();
}

export function filtersAreDefault(filters: Filters): boolean {
  return (
    filters.query === DEFAULT_FILTERS.query &&
    filters.language === DEFAULT_FILTERS.language &&
    filters.topic === DEFAULT_FILTERS.topic &&
    filters.windowDays === DEFAULT_FILTERS.windowDays &&
    filters.mode === DEFAULT_FILTERS.mode
  );
}
