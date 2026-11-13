"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/copy";
import {
  DEFAULT_FILTERS,
  LANGUAGES,
  SUGGESTED_TOPICS,
  filtersAreDefault,
  parseFilters,
  type DiscoverMode,
} from "@/lib/filters";
import { parseLocale } from "@/lib/locale";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(Object.fromEntries(params.entries()));
  const locale = parseLocale(params.get("lang"));
  const copy = t(locale);
  const windows = [
    { value: "7", label: copy.windows["7"] },
    { value: "30", label: copy.windows["30"] },
    { value: "90", label: copy.windows["90"] },
  ];
  const [keyword, setKeyword] = useState(filters.query);
  const [topic, setTopic] = useState(filters.topic);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  const [syncedTopic, setSyncedTopic] = useState(filters.topic);
  const [pending, startTransition] = useTransition();

  if (filters.query !== syncedQuery || filters.topic !== syncedTopic) {
    setSyncedQuery(filters.query);
    setSyncedTopic(filters.topic);
    setKeyword(filters.query);
    setTopic(filters.topic);
  }

  const languageItems = useMemo(() => {
    const items: { value: string; label: string }[] = LANGUAGES.map((language) => ({
      value: language.value,
      label: language.value === "all" ? copy.anyLanguage : language.label,
    }));
    if (!items.some((item) => item.value === filters.language)) {
      items.push({ value: filters.language, label: filters.language });
    }
    return items;
  }, [copy.anyLanguage, filters.language]);

  function navigate(patch: {
    query?: string;
    topic?: string | null;
    language?: string | null;
    windowDays?: string | null;
    mode?: DiscoverMode | null;
  }) {
    const nextQuery = (patch.query ?? keyword).trim();
    const nextTopic = patch.topic === null ? "" : (patch.topic ?? topic).trim();
    const nextLanguage =
      patch.language === undefined
        ? filters.language
        : patch.language || DEFAULT_FILTERS.language;
    const nextWindow =
      patch.windowDays === undefined ? String(filters.windowDays) : patch.windowDays || "30";
    const nextMode = patch.mode === undefined ? filters.mode : patch.mode || "new";
    const search = new URLSearchParams();
    if (locale === "zh") search.set("lang", "zh");
    if (nextQuery) search.set("q", nextQuery);
    if (nextTopic) search.set("topic", nextTopic);
    if (nextLanguage && nextLanguage !== "all") search.set("language", nextLanguage);
    if (nextWindow && nextWindow !== "30") search.set("window", nextWindow);
    if (nextMode && nextMode !== "new") search.set("mode", nextMode);
    const qs = search.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const modeHelp = filters.mode === "rising" ? copy.modeHelpRising : copy.modeHelpNew;

  return (
    <section className="relative z-10 -mt-10 rounded-2xl border border-border bg-card p-4 shadow-[0_22px_50px_-32px_rgba(28,48,40,0.55)] sm:p-5">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          navigate({});
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label={copy.modeLabel}
            className="inline-flex w-fit rounded-lg bg-muted p-1"
          >
            {(
              [
                ["new", copy.modeNew],
                ["rising", copy.modeRising],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filters.mode === value}
                onClick={() => navigate({ mode: value })}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.mode === value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p id="mode-help" className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {modeHelp}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label htmlFor="keyword" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {copy.keyword}
            </label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={copy.keywordPlaceholder}
              autoComplete="off"
              aria-describedby="mode-help"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="topic" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {copy.topic}
            </label>
            <Input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={copy.topicPlaceholder}
              autoComplete="off"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="language" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {copy.language}
            </label>
            <Select
              value={filters.language}
              items={languageItems}
              onValueChange={(value) => {
                if (!value || value === filters.language) return;
                navigate({ language: value });
              }}
            >
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageItems.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="window" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {copy.created}
            </label>
            <Select
              value={String(filters.windowDays)}
              items={windows.map((item) => ({ value: item.value, label: item.label }))}
              onValueChange={(value) => {
                if (!value || value === String(filters.windowDays)) return;
                navigate({ windowDays: value });
              }}
            >
              <SelectTrigger id="window" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {windows.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label={copy.suggestedTopics}>
            {SUGGESTED_TOPICS.map((suggested) => {
              const active = filters.topic === suggested;
              return (
                <button
                  key={suggested}
                  type="button"
                  aria-pressed={active}
                  onClick={() => navigate({ topic: active ? null : suggested })}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-pine bg-pine text-white"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {suggested}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!filtersAreDefault(filters) ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setKeyword("");
                  setTopic("");
                  const search = new URLSearchParams();
                  if (locale === "zh") search.set("lang", "zh");
                  const qs = search.toString();
                  startTransition(() => {
                    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
                  });
                }}
              >
                {copy.clear}
              </Button>
            ) : null}
            <Button type="submit" disabled={pending}>
              <Search />
              {pending ? copy.searching : copy.search}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
