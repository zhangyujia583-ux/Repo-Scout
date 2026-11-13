import type { ScoreFactor } from "@/lib/score";

export type RepoCardModel = {
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
  starsLabel: string;
  forks: number;
  licenseLabel: string | null;
  topics: string[];
  homepage: string | null;
  homepageHost: string | null;
  pushedAt: number;
  pushedLabel: string;
  createdLabel: string;
  starsPerDay: number;
  starsPerDayLabel: string;
  score: number;
  reason: string;
  factors: ScoreFactor[];
};

export type RateLimitInfo = {
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

export type DiscoverErrorCode =
  | "rate_limited"
  | "invalid_token"
  | "github_error"
  | "network";

export type ResultsSummary = {
  heading: string;
  detail: string;
  readmeNote: string;
  quotaNote: string | null;
  authNote: string;
  incompleteNote: string | null;
  query: string;
};

export type DiscoverSuccess = {
  ok: true;
  repos: RepoCardModel[];
  summary: ResultsSummary;
  totalCount: number;
  authenticated: boolean;
  readmeEnriched: boolean;
};

export type DiscoverFailure = {
  ok: false;
  error: DiscoverErrorCode;
  message: string;
  resetAt: string | null;
  resetLabel: string | null;
  authenticated: boolean;
  query: string;
};

export type DiscoverResult = DiscoverSuccess | DiscoverFailure;
