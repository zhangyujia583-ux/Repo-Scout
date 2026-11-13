import "server-only";

import { connection } from "next/server";
import { buildGithubSearchUrl, buildSearchQuery, sinceDate, type Filters } from "@/lib/filters";
import { formatCount, formatDay, formatReset } from "@/lib/format";
import { toRepoCard, toScoreInput, type RepoDraft } from "@/lib/present";
import { compareWatchScore, scoreRepository } from "@/lib/score";
import type { DiscoverFailure, DiscoverResult, RateLimitInfo } from "@/lib/types";

const USER_AGENT = "repo-scout";

type SearchPayload = {
  total_count?: unknown;
  incomplete_results?: unknown;
  items?: unknown;
  message?: unknown;
};

function githubHeaders(): { headers: Headers; authenticated: boolean } {
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2022-11-28",
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { headers, authenticated: token.length > 0 };
}

function headerNumber(response: Response, name: string): number | null {
  const raw = response.headers.get(name);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readRateLimit(response: Response): RateLimitInfo {
  const reset = headerNumber(response, "x-ratelimit-reset");
  return {
    limit: headerNumber(response, "x-ratelimit-limit"),
    remaining: headerNumber(response, "x-ratelimit-remaining"),
    resetAt: reset === null ? null : new Date(reset * 1000).toISOString(),
  };
}

function safeMessage(message: unknown, fallback: string): string {
  if (typeof message !== "string") return fallback;
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.slice(0, 240);
}

function failure(
  error: DiscoverFailure["error"],
  message: string,
  extras: {
    authenticated: boolean;
    query: string;
    resetAt?: string | null;
  },
): DiscoverFailure {
  const resetAt = extras.resetAt ?? null;
  return {
    ok: false,
    error,
    message,
    resetAt,
    resetLabel: resetAt ? formatReset(resetAt) : null,
    authenticated: extras.authenticated,
    query: extras.query,
  };
}

function isRateLimit(status: number, message: string, remaining: number | null): boolean {
  if (status === 429) return true;
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("secondary rate")) return true;
  return status === 403 && remaining === 0;
}

function httpUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function githubUrl(value: unknown): string | null {
  const url = httpUrl(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && (parsed.hostname === "github.com" || parsed.hostname === "www.github.com")) {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function avatarUrl(value: unknown): string | null {
  const url = httpUrl(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname === "avatars.githubusercontent.com") {
      return parsed.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeLicense(license: unknown): string | null {
  if (!license || typeof license !== "object") return null;
  const record = license as { spdx_id?: unknown; key?: unknown };
  const spdx = typeof record.spdx_id === "string" ? record.spdx_id.trim() : "";
  if (spdx && spdx.toUpperCase() !== "NOASSERTION") return spdx;
  const key = typeof record.key === "string" ? record.key.trim() : "";
  if (!key || key === "other") return key === "other" ? "other" : null;
  return key;
}

function mapItem(value: unknown): RepoDraft | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (item.fork === true || item.private === true || item.archived === true) return null;

  const fullName = typeof item.full_name === "string" ? item.full_name : "";
  const [ownerLogin, name] = fullName.split("/");
  if (!ownerLogin || !name || fullName.split("/").length !== 2) return null;

  const url = githubUrl(item.html_url);
  const owner = item.owner && typeof item.owner === "object" ? (item.owner as Record<string, unknown>) : null;
  const ownerUrl = githubUrl(owner?.html_url) ?? `https://github.com/${encodeURIComponent(ownerLogin)}`;
  const createdAt = typeof item.created_at === "string" ? item.created_at : "";
  const pushedAt = typeof item.pushed_at === "string" ? item.pushed_at : "";
  if (Number.isNaN(new Date(createdAt).getTime()) || Number.isNaN(new Date(pushedAt).getTime())) {
    return null;
  }
  if (!url) return null;

  const id = typeof item.id === "number" ? item.id : 0;
  const description = typeof item.description === "string" && item.description.trim() ? item.description.trim() : null;
  const topics = Array.isArray(item.topics)
    ? item.topics.filter((topic): topic is string => typeof topic === "string" && topic.trim().length > 0)
    : [];

  return {
    id,
    name,
    fullName,
    ownerLogin: typeof owner?.login === "string" ? owner.login : ownerLogin,
    ownerUrl,
    url,
    avatarUrl: avatarUrl(owner?.avatar_url),
    description,
    language: typeof item.language === "string" && item.language.trim() ? item.language : null,
    stars: typeof item.stargazers_count === "number" ? item.stargazers_count : 0,
    forks: typeof item.forks_count === "number" ? item.forks_count : 0,
    license: normalizeLicense(item.license),
    topics,
    homepage: httpUrl(item.homepage),
    createdAt,
    pushedAt,
    archived: false,
    hasReadme: null,
    readmeChars: null,
  };
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  }
  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, () => run()));
  return results;
}

async function enrichReadmes(
  repos: RepoDraft[],
  headers: Headers,
): Promise<{ repos: RepoDraft[]; checked: boolean }> {
  let checked = false;
  let stop = false;
  const reposWithReadme = await mapPool(repos, 6, async (repo) => {
    if (stop) return repo;
    const [owner, name] = repo.fullName.split("/");
    if (!owner || !name) return repo;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/readme`,
        {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        },
      );
      if (response.status === 404) {
        checked = true;
        return { ...repo, hasReadme: false, readmeChars: 0 };
      }
      if (response.status === 403 || response.status === 429) {
        stop = true;
        return repo;
      }
      if (!response.ok) return repo;
      const body = (await response.json()) as { size?: unknown };
      const size = typeof body.size === "number" && Number.isFinite(body.size) ? body.size : 0;
      checked = true;
      return { ...repo, hasReadme: true, readmeChars: size };
    } catch {
      return repo;
    }
  });
  return { repos: reposWithReadme, checked };
}

function summaryCopy(options: {
  filters: Filters;
  shown: number;
  totalCount: number;
  authenticated: boolean;
  readmeEnriched: boolean;
  incomplete: boolean;
  query: string;
  rateLimit: RateLimitInfo;
  now: Date;
}) {
  const since = formatDay(sinceDate(options.filters.windowDays, options.now));
  const noun = options.shown === 1 ? "repository" : "repositories";
  const quota =
    options.rateLimit.remaining !== null && options.rateLimit.limit !== null
      ? `Search quota: ${options.rateLimit.remaining} of ${options.rateLimit.limit} left in this window.`
      : null;

  return {
    heading: `${options.shown} ${noun} to consider`,
    detail: `Created on or after ${since}. GitHub reports about ${formatCount(options.totalCount)} matches. Repo Scout re-ranks the most-starred page it returned, instead of trusting star count alone.`,
    readmeNote: options.readmeEnriched
      ? "README length is included in the documentation score."
      : "README length is not checked without a token. Documentation is scored from the description, topics, and homepage, then scaled so that missing check is not treated as a missing README.",
    quotaNote: quota,
    authNote: options.authenticated
      ? "GitHub token connected. Higher search limits are active."
      : "No token connected. Unauthenticated search allows about 10 requests per minute.",
    incompleteNote: options.incomplete
      ? "GitHub marked this search as incomplete, so the page may be missing matches."
      : null,
    query: options.query,
  };
}

export async function discoverRepositories(filters: Filters): Promise<DiscoverResult> {
  await connection();
  const now = new Date();
  const query = buildSearchQuery(filters, now);
  const { headers, authenticated } = githubHeaders();

  let response: Response;
  try {
    response = await fetch(buildGithubSearchUrl(query), {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    const aborted =
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("GitHub search request failed", aborted ? error.name : "network");
    return failure(
      "network",
      aborted
        ? "The GitHub search request timed out before Repo Scout received a result."
        : "Repo Scout could not reach the GitHub API. Check the connection and try again.",
      { authenticated, query },
    );
  }

  const rateLimit = readRateLimit(response);
  const text = await response.text();
  let payload: SearchPayload = {};
  if (text) {
    try {
      payload = JSON.parse(text) as SearchPayload;
    } catch {
      payload = {};
    }
  }
  const apiMessage = safeMessage(payload.message, "");

  if (response.status === 401 || apiMessage.toLowerCase().includes("bad credentials")) {
    return failure(
      "invalid_token",
      "GitHub rejected the token in GITHUB_TOKEN. Replace it with a valid token that can read public repositories, or remove it to continue without one.",
      { authenticated, query, resetAt: rateLimit.resetAt },
    );
  }

  if (isRateLimit(response.status, apiMessage, rateLimit.remaining)) {
    return failure(
      "rate_limited",
      authenticated
        ? "GitHub rate-limited this token. Wait for the window to reset, then try again."
        : "GitHub rate-limited unauthenticated search from this server.",
      { authenticated, query, resetAt: rateLimit.resetAt },
    );
  }

  if (!response.ok || !Array.isArray(payload.items)) {
    console.error(`GitHub search failed with status ${response.status}`);
    const message =
      response.status === 422
        ? "GitHub rejected this search. Try a shorter keyword or a simpler topic."
        : safeMessage(
            payload.message,
            `GitHub search failed with status ${response.status}. Try again in a moment.`,
          );
    return failure("github_error", message, {
      authenticated,
      query,
      resetAt: rateLimit.resetAt,
    });
  }

  let drafts = payload.items.map(mapItem).filter((item): item is RepoDraft => item !== null);
  let readmeEnriched = false;
  if (authenticated && drafts.length > 0) {
    const enriched = await enrichReadmes(drafts, headers);
    drafts = enriched.repos;
    readmeEnriched = enriched.checked;
  }

  const repos = drafts
    .map((draft) => toRepoCard(draft, scoreRepository(toScoreInput(draft), now), now))
    .sort((a, b) =>
      compareWatchScore(
        { fullName: a.fullName, stars: a.stars, scoring: { score: a.score } },
        { fullName: b.fullName, stars: b.stars, scoring: { score: b.score } },
      ),
    );

  const totalCount = typeof payload.total_count === "number" ? payload.total_count : repos.length;

  return {
    ok: true,
    repos,
    totalCount,
    authenticated,
    readmeEnriched,
    summary: summaryCopy({
      filters,
      shown: repos.length,
      totalCount,
      authenticated,
      readmeEnriched,
      incomplete: payload.incomplete_results === true,
      query,
      rateLimit,
      now,
    }),
  };
}
