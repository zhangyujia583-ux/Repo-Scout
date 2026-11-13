import { formatRate } from "@/lib/score";
import type { ScoreResult } from "@/lib/score";
import { formatRelative, formatStars } from "@/lib/format";
import type { RepoCardModel } from "@/lib/types";

export type RepoDraft = {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerUrl: string;
  url: string;
  avatarUrl: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  license: string | null;
  topics: string[];
  homepage: string | null;
  createdAt: string;
  pushedAt: string;
  archived: boolean;
  hasReadme: boolean | null;
  readmeChars: number | null;
};

function hostname(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function toScoreInput(repo: RepoDraft) {
  return {
    stars: repo.stars,
    forks: repo.forks,
    createdAt: new Date(repo.createdAt),
    pushedAt: new Date(repo.pushedAt),
    description: repo.description,
    topics: repo.topics,
    license: repo.license,
    homepage: repo.homepage,
    hasReadme: repo.hasReadme,
    readmeChars: repo.readmeChars,
    archived: repo.archived,
  };
}

export function toRepoCard(repo: RepoDraft, scoring: ScoreResult, now: Date): RepoCardModel {
  const licenseFactor = scoring.factors.find((factor) => factor.id === "license");
  const licenseLabel =
    licenseFactor && licenseFactor.detail !== "No license" ? licenseFactor.detail : null;

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    ownerLogin: repo.ownerLogin,
    ownerUrl: repo.ownerUrl,
    url: repo.url,
    avatarUrl: repo.avatarUrl,
    description: repo.description,
    language: repo.language,
    stars: repo.stars,
    starsLabel: formatStars(repo.stars),
    forks: repo.forks,
    licenseLabel,
    topics: repo.topics.slice(0, 6),
    homepage: repo.homepage,
    homepageHost: hostname(repo.homepage),
    pushedAt: new Date(repo.pushedAt).getTime(),
    pushedLabel: `Pushed ${formatRelative(new Date(repo.pushedAt), now)}`,
    createdLabel: `Created ${formatRelative(new Date(repo.createdAt), now)}`,
    starsPerDay: scoring.starsPerDay,
    starsPerDayLabel: `${formatRate(scoring.starsPerDay)} stars/day`,
    score: scoring.score,
    reason: scoring.reason,
    factors: scoring.factors,
  };
}
