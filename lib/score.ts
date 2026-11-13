import type { Locale } from "@/lib/locale";

/**
 * Watch score for a public GitHub repository.
 *
 * Six factors sum to 100. Archived repositories keep the same breakdown,
 * then the final score is multiplied by 0.25. When README length is unknown,
 * points from the description, topics, and homepage are scaled up to the
 * full documentation weight so missing data is not treated as a missing README.
 */

export const SCORE_WEIGHTS = {
  velocity: 32,
  recency: 16,
  activity: 18,
  docs: 18,
  license: 10,
  community: 6,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_AGE_DAYS = 1 / 24;
const VELOCITY_FULL_STARS_PER_DAY = 40;

const PERMISSIVE = new Set([
  "mit",
  "apache-2.0",
  "bsd-2-clause",
  "bsd-3-clause",
  "bsd-3-clause-clear",
  "isc",
  "unlicense",
  "0bsd",
  "zlib",
  "bsl-1.0",
  "postgresql",
  "ncsa",
  "wtfpl",
  "cc0-1.0",
  "mit-0",
]);

const COPYLEFT = new Set([
  "gpl-2.0",
  "gpl-3.0",
  "agpl-3.0",
  "lgpl-2.1",
  "lgpl-3.0",
  "gpl-2.0-only",
  "gpl-2.0-or-later",
  "gpl-3.0-only",
  "gpl-3.0-or-later",
  "agpl-3.0-only",
  "agpl-3.0-or-later",
  "lgpl-2.1-only",
  "lgpl-2.1-or-later",
  "lgpl-3.0-only",
  "lgpl-3.0-or-later",
  "epl-2.0",
  "mpl-2.0",
  "eupl-1.2",
]);

const LICENSE_LABELS: Record<string, string> = {
  mit: "MIT",
  "mit-0": "MIT-0",
  "apache-2.0": "Apache-2.0",
  "bsd-2-clause": "BSD-2-Clause",
  "bsd-3-clause": "BSD-3-Clause",
  "bsd-3-clause-clear": "BSD-3-Clause",
  isc: "ISC",
  unlicense: "Unlicense",
  "0bsd": "0BSD",
  zlib: "Zlib",
  "bsl-1.0": "BSL-1.0",
  postgresql: "PostgreSQL",
  ncsa: "NCSA",
  wtfpl: "WTFPL",
  "cc0-1.0": "CC0-1.0",
  "gpl-2.0": "GPL-2.0",
  "gpl-3.0": "GPL-3.0",
  "gpl-2.0-only": "GPL-2.0",
  "gpl-2.0-or-later": "GPL-2.0",
  "gpl-3.0-only": "GPL-3.0",
  "gpl-3.0-or-later": "GPL-3.0",
  "agpl-3.0": "AGPL-3.0",
  "agpl-3.0-only": "AGPL-3.0",
  "agpl-3.0-or-later": "AGPL-3.0",
  "lgpl-2.1": "LGPL-2.1",
  "lgpl-3.0": "LGPL-3.0",
  "lgpl-2.1-only": "LGPL-2.1",
  "lgpl-2.1-or-later": "LGPL-2.1",
  "lgpl-3.0-only": "LGPL-3.0",
  "lgpl-3.0-or-later": "LGPL-3.0",
  "mpl-2.0": "MPL-2.0",
  "epl-2.0": "EPL-2.0",
  "eupl-1.2": "EUPL-1.2",
};

export type ScoreInput = {
  stars: number;
  forks: number;
  createdAt: Date;
  pushedAt: Date;
  description: string | null;
  topics: string[];
  license: string | null;
  homepage: string | null;
  hasReadme: boolean | null;
  readmeChars: number | null;
  archived: boolean;
};

export type ScoreFactorId =
  | "velocity"
  | "recency"
  | "activity"
  | "docs"
  | "license"
  | "community";

export type ScoreFactor = {
  id: ScoreFactorId;
  label: string;
  short: string;
  points: number;
  max: number;
  detail: string;
};

export type ScoreResult = {
  score: number;
  rawScore: number;
  starsPerDay: number;
  ageDays: number;
  daysSincePush: number;
  factors: ScoreFactor[];
  reason: string;
};

export type LicenseKind = "none" | "permissive" | "copyleft" | "other";

export type LicenseAssessment = {
  points: number;
  kind: LicenseKind;
  label: string | null;
};

export type DocsAssessment = {
  points: number;
  readmeKnown: boolean;
  hasAnyReadme: boolean;
  hasSubstantialReadme: boolean;
  hasClearDescription: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatRate(starsPerDay: number): string {
  if (!Number.isFinite(starsPerDay) || starsPerDay <= 0) return "0";
  if (starsPerDay >= 10) return String(Math.round(starsPerDay));
  const rounded = Math.round(starsPerDay * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function starsPerDay(stars: number, ageDays: number): number {
  const safeStars = Number.isFinite(stars) ? Math.max(0, stars) : 0;
  const age = Number.isFinite(ageDays) ? ageDays : 0;
  return safeStars / Math.max(age, MIN_AGE_DAYS);
}

export function velocityPoints(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  const ratio =
    Math.log10(1 + rate) / Math.log10(1 + VELOCITY_FULL_STARS_PER_DAY);
  return clamp(SCORE_WEIGHTS.velocity * ratio, 0, SCORE_WEIGHTS.velocity);
}

export function recencyPoints(ageDays: number): number {
  if (ageDays <= 3) return 16;
  if (ageDays <= 7) return 14;
  if (ageDays <= 14) return 12;
  if (ageDays <= 30) return 9;
  if (ageDays <= 90) return 5;
  if (ageDays <= 180) return 2;
  return 0;
}

export function activityPoints(daysSincePush: number): number {
  if (daysSincePush <= 1) return 18;
  if (daysSincePush <= 3) return 15;
  if (daysSincePush <= 7) return 12;
  if (daysSincePush <= 14) return 8;
  if (daysSincePush <= 30) return 4;
  if (daysSincePush <= 90) return 2;
  return 0;
}

export function describeLicense(license: string | null): LicenseAssessment {
  if (!license || !license.trim()) {
    return { points: 0, kind: "none", label: null };
  }
  const key = license.trim().toLowerCase();
  const label = LICENSE_LABELS[key] ?? license.trim();
  if (PERMISSIVE.has(key)) return { points: 10, kind: "permissive", label };
  if (COPYLEFT.has(key)) return { points: 8, kind: "copyleft", label };
  if (key === "other" || key === "noassertion") {
    return { points: 4, kind: "other", label: "Other" };
  }
  return { points: 6, kind: "other", label };
}

export function documentationPoints(input: {
  description: string | null;
  topics: string[];
  homepage: string | null;
  hasReadme: boolean | null;
  readmeChars: number | null;
}): DocsAssessment {
  const descriptionLength = input.description?.trim().length ?? 0;
  let descriptionPoints = 0;
  if (descriptionLength >= 80) descriptionPoints = 7;
  else if (descriptionLength >= 40) descriptionPoints = 5;
  else if (descriptionLength >= 12) descriptionPoints = 3;
  else if (descriptionLength > 0) descriptionPoints = 1;

  const topicCount = input.topics.map((topic) => topic.trim()).filter(Boolean).length;
  const topicScore = topicCount >= 3 ? 3 : topicCount === 2 ? 2 : topicCount === 1 ? 1 : 0;
  const homepageScore = input.homepage && input.homepage.trim() ? 2 : 0;
  const known = descriptionPoints + topicScore + homepageScore;

  const hasAnyReadme = input.hasReadme === true;
  const readmeChars = input.readmeChars ?? 0;
  let readmeScore = 0;
  if (hasAnyReadme) {
    if (readmeChars >= 1500) readmeScore = 6;
    else if (readmeChars >= 400) readmeScore = 4;
    else readmeScore = 2;
  }

  const points =
    input.hasReadme === null ? known * (SCORE_WEIGHTS.docs / 12) : known + readmeScore;

  return {
    points: clamp(points, 0, SCORE_WEIGHTS.docs),
    readmeKnown: input.hasReadme !== null,
    hasAnyReadme,
    hasSubstantialReadme: hasAnyReadme && readmeChars >= 400,
    hasClearDescription: descriptionLength >= 40,
  };
}

export function communityPoints(forks: number, stars: number): number {
  if (!Number.isFinite(forks) || forks <= 0) return 0;
  const volume = 4 * (Math.log10(1 + forks) / Math.log10(1 + 40));
  const safeStars = Number.isFinite(stars) ? Math.max(0, stars) : 0;
  const ratio = safeStars > 0 ? forks / safeStars : 1;
  const bonus = ratio >= 0.1 ? 2 : ratio >= 0.04 ? 1 : 0;
  return clamp(Math.min(volume, 4) + bonus, 0, SCORE_WEIGHTS.community);
}

const FACTOR_COPY = {
  en: {
    velocity: { label: "Star velocity", short: "Velocity" },
    recency: { label: "Recency", short: "Recency" },
    activity: { label: "Recent activity", short: "Activity" },
    docs: { label: "Documentation", short: "Docs" },
    license: { label: "License", short: "License" },
    community: { label: "Community", short: "Forks" },
  },
  zh: {
    velocity: { label: "Star 增速", short: "增速" },
    recency: { label: "新近程度", short: "新近" },
    activity: { label: "最近活跃", short: "活跃" },
    docs: { label: "文档", short: "文档" },
    license: { label: "许可证", short: "许可" },
    community: { label: "社区", short: "Fork" },
  },
} as const;

function licenseName(license: LicenseAssessment, locale: Locale): string | null {
  if (!license.label) return null;
  if (locale === "zh" && license.label === "Other") return "其他";
  return license.label;
}

function ageDetail(ageDays: number, locale: Locale): string {
  const days = Math.max(1, Math.round(ageDays));
  if (locale === "zh") {
    if (ageDays < 1) return "今天创建";
    return days === 1 ? "1 天前创建" : `${days} 天前创建`;
  }
  if (ageDays < 1) return "Created today";
  return days === 1 ? "Created 1 day ago" : `Created ${days} days ago`;
}

function pushDetail(daysSincePush: number, locale: Locale): string {
  const days = Math.max(1, Math.round(daysSincePush));
  if (locale === "zh") {
    if (daysSincePush < 1) return "今天有推送";
    return days === 1 ? "1 天前有推送" : `${days} 天前有推送`;
  }
  if (daysSincePush < 1) return "Pushed today";
  return days === 1 ? "Pushed 1 day ago" : `Pushed ${days} days ago`;
}

function docsDetail(input: ScoreInput, docs: DocsAssessment, locale: Locale): string {
  if (!docs.readmeKnown) {
    return locale === "zh"
      ? "未检查 README。简介、topics 和主页已按比例放大，避免把未检查当成没有 README。"
      : "README not checked. Description, topics, and homepage were scaled so missing data is not treated as a missing README.";
  }
  if (!docs.hasAnyReadme) return locale === "zh" ? "没有 README" : "No README found";
  if (!docs.hasSubstantialReadme) return locale === "zh" ? "README 较短" : "README is short";
  const kilobytes = ((input.readmeChars ?? 0) / 1000).toFixed(1);
  return locale === "zh" ? `README 约 ${kilobytes} KB` : `README about ${kilobytes} KB`;
}

function forkDetail(forks: number, locale: Locale): string {
  if (locale === "zh") {
    if (forks <= 0) return "还没有 fork";
    return forks === 1 ? "1 个 fork" : `${forks} 个 fork`;
  }
  if (forks <= 0) return "No forks yet";
  return forks === 1 ? "1 fork" : `${forks} forks`;
}

function joinClauses(parts: string[], locale: Locale): string {
  if (parts.length === 1) return parts[0];
  if (locale === "zh") return parts.join("，");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function buildReason(
  input: ScoreInput,
  metrics: { starsPerDay: number; ageDays: number; daysSincePush: number },
  docs: DocsAssessment,
  license: LicenseAssessment,
  locale: Locale,
): string {
  const zh = locale === "zh";
  if (input.archived) {
    return zh
      ? "已归档的仓库不适合继续关注，即使过去的 star 还在，分数也会被大幅压低。"
      : "Archived repositories are poor candidates to watch, so the score is cut sharply even if older stars remain.";
  }

  const name = licenseName(license, locale);
  const clauses: string[] = [];
  if (metrics.starsPerDay >= 8) {
    const rate = formatRate(metrics.starsPerDay);
    clauses.push(
      zh ? `自创建以来每天约 ${rate} 个 star` : `about ${rate} stars a day since it was created`,
    );
  }
  if (metrics.daysSincePush <= 2) {
    clauses.push(zh ? "最近两天有推送" : "a push landed in the last two days");
  } else if (metrics.daysSincePush <= 7) {
    clauses.push(zh ? "本周有更新" : "it was updated this week");
  }
  if (license.kind === "permissive" && name) {
    clauses.push(zh ? `已采用 ${name} 许可证` : `the ${name} license is in place`);
  } else if (license.kind === "copyleft" && name) {
    clauses.push(zh ? `以 ${name} 许可证发布` : `it publishes a ${name} license`);
  }
  if (docs.hasSubstantialReadme) {
    clauses.push(zh ? "README 内容充实" : "the README is substantial");
  } else if (docs.hasAnyReadme) {
    clauses.push(zh ? "已有 README" : "a README is present");
  } else if (docs.hasClearDescription) {
    clauses.push(zh ? "简介说明了它做什么" : "the description explains what it does");
  }
  if (metrics.ageDays <= 7 && metrics.starsPerDay < 8) {
    clauses.push(zh ? "创建于最近一周" : "it was created within the last week");
  } else if (metrics.ageDays <= 30 && metrics.starsPerDay < 1.5) {
    clauses.push(zh ? "仍处在第一个月" : "it is still in its first month");
  }
  if (metrics.starsPerDay >= 1.5 && metrics.starsPerDay < 8) {
    const rate = formatRate(metrics.starsPerDay);
    clauses.push(zh ? `每天稳定增加约 ${rate} 个 star` : `a steady ${rate} stars a day`);
  }

  if (clauses.length === 0) {
    return zh
      ? "目前公开信号偏少：star 不多、最近缺少活动，或缺少简介和许可证，所以分数保持在较低水平。"
      : "Thin public signals so far — few stars, little recent activity, or a missing description and license — so this stays a modest score.";
  }

  const sentence = joinClauses(clauses.slice(0, 3), locale);
  if (zh) return `${sentence}。`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

export function scoreRepository(
  input: ScoreInput,
  now = new Date(),
  locale: Locale = "en",
): ScoreResult {
  const ageDays = Math.max(0, (now.getTime() - input.createdAt.getTime()) / DAY_MS);
  const daysSincePush = Math.max(0, (now.getTime() - input.pushedAt.getTime()) / DAY_MS);
  const rate = starsPerDay(input.stars, ageDays);
  const velocity = velocityPoints(rate);
  const recency = recencyPoints(ageDays);
  const activity = activityPoints(daysSincePush);
  const docs = documentationPoints(input);
  const license = describeLicense(input.license);
  const community = communityPoints(input.forks, input.stars);
  const names = FACTOR_COPY[locale];

  const factors: ScoreFactor[] = [
    {
      id: "velocity",
      label: names.velocity.label,
      short: names.velocity.short,
      points: velocity,
      max: SCORE_WEIGHTS.velocity,
      detail: locale === "zh" ? `每天 ${formatRate(rate)} 个 star` : `${formatRate(rate)} stars/day`,
    },
    {
      id: "recency",
      label: names.recency.label,
      short: names.recency.short,
      points: recency,
      max: SCORE_WEIGHTS.recency,
      detail: ageDetail(ageDays, locale),
    },
    {
      id: "activity",
      label: names.activity.label,
      short: names.activity.short,
      points: activity,
      max: SCORE_WEIGHTS.activity,
      detail: pushDetail(daysSincePush, locale),
    },
    {
      id: "docs",
      label: names.docs.label,
      short: names.docs.short,
      points: docs.points,
      max: SCORE_WEIGHTS.docs,
      detail: docsDetail(input, docs, locale),
    },
    {
      id: "license",
      label: names.license.label,
      short: names.license.short,
      points: license.points,
      max: SCORE_WEIGHTS.license,
      detail: licenseName(license, locale) ?? (locale === "zh" ? "无许可证" : "No license"),
    },
    {
      id: "community",
      label: names.community.label,
      short: names.community.short,
      points: community,
      max: SCORE_WEIGHTS.community,
      detail: forkDetail(Math.max(0, input.forks), locale),
    },
  ];

  const raw = factors.reduce((sum, factor) => sum + factor.points, 0);
  const penalized = input.archived ? raw * 0.25 : raw;

  return {
    score: clamp(Math.round(penalized), 0, 100),
    rawScore: clamp(Math.round(raw), 0, 100),
    starsPerDay: rate,
    ageDays,
    daysSincePush,
    factors,
    reason: buildReason(
      input,
      { starsPerDay: rate, ageDays, daysSincePush },
      docs,
      license,
      locale,
    ),
  };
}

export function compareWatchScore(
  a: { fullName: string; stars: number; scoring: { score: number } },
  b: { fullName: string; stars: number; scoring: { score: number } },
): number {
  if (b.scoring.score !== a.scoring.score) return b.scoring.score - a.scoring.score;
  if (b.stars !== a.stars) return b.stars - a.stars;
  return a.fullName.localeCompare(b.fullName);
}

export function rankByWatchScore<T extends ScoreInput & { fullName: string }>(
  items: readonly T[],
  now = new Date(),
): Array<T & { scoring: ScoreResult }> {
  return items
    .map((item) => ({ ...item, scoring: scoreRepository(item, now) }))
    .sort((a, b) => compareWatchScore(a, b));
}
