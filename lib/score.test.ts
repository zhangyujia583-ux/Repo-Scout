import { describe, expect, it } from "vitest";
import {
  SCORE_WEIGHTS,
  activityPoints,
  communityPoints,
  compareWatchScore,
  describeLicense,
  documentationPoints,
  formatRate,
  rankByWatchScore,
  recencyPoints,
  scoreRepository,
  starsPerDay,
  velocityPoints,
  type ScoreInput,
} from "./score";

const now = new Date("2026-11-13T12:00:00.000Z");

function repo(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    stars: 40,
    forks: 6,
    createdAt: new Date("2026-11-06T12:00:00.000Z"),
    pushedAt: new Date("2026-11-13T06:00:00.000Z"),
    description:
      "A clear description of a small tool that does one job well and documents the workflow.",
    topics: ["cli", "devtools"],
    license: "MIT",
    homepage: "https://example.com",
    hasReadme: true,
    readmeChars: 1800,
    archived: false,
    ...overrides,
  };
}

describe("watch score weights", () => {
  it("sums the six factors to 100", () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((sum, points) => sum + points, 0);
    expect(total).toBe(100);
  });
});

describe("factor points", () => {
  it("scores star velocity on a log scale that saturates at 40 stars per day", () => {
    expect(velocityPoints(0)).toBe(0);
    expect(velocityPoints(-4)).toBe(0);
    expect(velocityPoints(40)).toBeCloseTo(32, 5);
    expect(velocityPoints(1000)).toBe(32);
    expect(velocityPoints(5)).toBeGreaterThan(velocityPoints(1));
    expect(velocityPoints(5)).toBeLessThan(32);
  });

  it("gives newer repositories more recency points", () => {
    expect(recencyPoints(1)).toBe(16);
    expect(recencyPoints(5)).toBe(14);
    expect(recencyPoints(10)).toBe(12);
    expect(recencyPoints(20)).toBe(9);
    expect(recencyPoints(60)).toBe(5);
    expect(recencyPoints(400)).toBe(0);
  });

  it("gives recent pushes more activity points", () => {
    expect(activityPoints(0.2)).toBe(18);
    expect(activityPoints(2)).toBe(15);
    expect(activityPoints(5)).toBe(12);
    expect(activityPoints(10)).toBe(8);
    expect(activityPoints(45)).toBe(2);
    expect(activityPoints(120)).toBe(0);
  });

  it("treats permissive licenses as stronger than missing or copyleft ones", () => {
    expect(describeLicense("MIT")).toMatchObject({ points: 10, kind: "permissive", label: "MIT" });
    expect(describeLicense("apache-2.0").points).toBe(10);
    expect(describeLicense("GPL-3.0-only")).toMatchObject({ points: 8, kind: "copyleft" });
    expect(describeLicense("unknown-license").points).toBe(6);
    expect(describeLicense("NOASSERTION")).toMatchObject({ points: 4, label: "Other" });
    expect(describeLicense(null)).toMatchObject({ points: 0, kind: "none", label: null });
    expect(describeLicense("  ").points).toBe(0);
  });

  it("scales documentation when README length is unknown and withholds points when it is missing", () => {
    const fullWriteup = {
      description: "x".repeat(90),
      topics: ["a", "b", "c"],
      homepage: "https://example.com",
    };
    expect(documentationPoints({ ...fullWriteup, hasReadme: null, readmeChars: null }).points).toBeCloseTo(18, 5);
    expect(documentationPoints({ ...fullWriteup, hasReadme: false, readmeChars: 0 }).points).toBe(12);
    expect(documentationPoints({ ...fullWriteup, hasReadme: true, readmeChars: 2000 }).points).toBe(18);
    expect(
      documentationPoints({
        description: null,
        topics: [],
        homepage: null,
        hasReadme: true,
        readmeChars: 100,
      }).points,
    ).toBe(2);
    expect(
      documentationPoints({
        description: null,
        topics: [],
        homepage: null,
        hasReadme: null,
        readmeChars: null,
      }).points,
    ).toBe(0);
  });

  it("rewards forks, with a bonus when the fork-to-star ratio is healthy", () => {
    expect(communityPoints(0, 100)).toBe(0);
    expect(communityPoints(80, 400)).toBe(6);
    expect(communityPoints(2, 400)).toBeGreaterThan(0);
    expect(communityPoints(2, 400)).toBeLessThan(communityPoints(80, 400));
  });
});

describe("scoreRepository", () => {
  it("ranks a fast young repository above an older one with the same star count", () => {
    const young = scoreRepository(
      repo({
        stars: 200,
        createdAt: new Date("2026-11-09T12:00:00.000Z"),
        pushedAt: new Date("2026-11-13T00:00:00.000Z"),
      }),
      now,
    );
    const old = scoreRepository(
      repo({
        stars: 200,
        createdAt: new Date("2025-01-01T12:00:00.000Z"),
        pushedAt: new Date("2026-11-13T00:00:00.000Z"),
      }),
      now,
    );

    expect(young.score).toBeGreaterThan(old.score);
    const youngVelocity = young.factors.find((factor) => factor.id === "velocity")?.points ?? 0;
    const oldVelocity = old.factors.find((factor) => factor.id === "velocity")?.points ?? 0;
    expect(youngVelocity).toBeGreaterThan(oldVelocity);
  });

  it("raises the score when a license is present", () => {
    const licensed = scoreRepository(repo({ license: "MIT" }), now);
    const unlicensed = scoreRepository(repo({ license: null }), now);
    expect(licensed.score).toBeGreaterThan(unlicensed.score);
    expect(unlicensed.reason.toLowerCase()).not.toContain("mit");
  });

  it("rewards a recent push over a stale repository", () => {
    const fresh = scoreRepository(repo({ pushedAt: new Date("2026-11-13T10:00:00.000Z") }), now);
    const stale = scoreRepository(repo({ pushedAt: new Date("2026-06-01T00:00:00.000Z") }), now);
    expect(fresh.score).toBeGreaterThan(stale.score);
    const freshActivity = fresh.factors.find((factor) => factor.id === "activity")?.points ?? 0;
    const staleActivity = stale.factors.find((factor) => factor.id === "activity")?.points ?? 0;
    expect(freshActivity).toBeGreaterThan(staleActivity);
  });

  it("cuts an archived repository to a quarter of its raw score", () => {
    const active = scoreRepository(repo(), now);
    const archived = scoreRepository(repo({ archived: true }), now);
    expect(archived.reason.toLowerCase()).toContain("archived");
    expect(Math.abs(archived.score - active.rawScore * 0.25)).toBeLessThanOrEqual(1);
    expect(archived.score).toBeLessThan(active.score / 2);
  });

  it("reaches 100 for a young, documented, licensed repository that is already spreading", () => {
    const perfect = scoreRepository(
      repo({
        stars: 400,
        forks: 80,
        createdAt: new Date("2026-11-12T12:00:00.000Z"),
        pushedAt: new Date("2026-11-13T12:00:00.000Z"),
        description: "x".repeat(90),
        topics: ["a", "b", "c"],
        license: "Apache-2.0",
        homepage: "https://example.com",
        hasReadme: true,
        readmeChars: 2000,
      }),
      now,
    );
    expect(perfect.score).toBe(100);
  });

  it("stays modest when the public signals are thin", () => {
    const quiet = scoreRepository(
      {
        stars: 0,
        forks: 0,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        pushedAt: new Date("2024-06-01T00:00:00.000Z"),
        description: null,
        topics: [],
        license: null,
        homepage: null,
        hasReadme: false,
        readmeChars: 0,
        archived: false,
      },
      now,
    );
    expect(quiet.score).toBeLessThan(20);
    expect(quiet.reason.toLowerCase()).toContain("thin public signals");
  });

  it("does not divide by zero for a repository created this instant", () => {
    const brandNew = scoreRepository(
      repo({
        stars: 10,
        createdAt: now,
        pushedAt: now,
      }),
      now,
    );
    expect(Number.isFinite(brandNew.starsPerDay)).toBe(true);
    expect(brandNew.starsPerDay).toBe(starsPerDay(10, 0));
    expect(brandNew.score).toBeGreaterThan(0);
    expect(brandNew.score).toBeLessThanOrEqual(100);
  });

  it("mentions the strongest signals and does not invent a README", () => {
    const fast = scoreRepository(
      repo({
        stars: 200,
        createdAt: new Date("2026-11-09T12:00:00.000Z"),
        license: "MIT",
        hasReadme: true,
        readmeChars: 2000,
      }),
      now,
    );
    expect(fast.reason).toMatch(/stars a day/i);
    expect(fast.reason).toContain("MIT");
    expect(fast.reason.toLowerCase()).not.toContain("readme");

    const documented = scoreRepository(
      repo({
        stars: 200,
        createdAt: new Date("2026-11-09T12:00:00.000Z"),
        license: null,
        hasReadme: true,
        readmeChars: 2000,
      }),
      now,
    );
    expect(documented.reason).toContain("README");
    expect(documented.reason.toLowerCase()).not.toContain("license");

    const unknownReadme = scoreRepository(
      repo({
        stars: 200,
        createdAt: new Date("2026-11-09T12:00:00.000Z"),
        license: null,
        hasReadme: null,
        readmeChars: null,
      }),
      now,
    );
    expect(unknownReadme.reason.toLowerCase()).not.toContain("readme");
    expect(unknownReadme.reason).toContain("description");
    expect(unknownReadme.factors.find((factor) => factor.id === "docs")?.detail).toMatch(
      /not checked/i,
    );
  });

  it("keeps every generated score inside 0 to 100 and always explains it", () => {
    for (const stars of [0, 1, 10, 50, 200, 500]) {
      for (const age of [0, 1, 7, 30, 400]) {
        const result = scoreRepository(
          repo({
            stars,
            forks: Math.floor(stars / 8),
            createdAt: new Date(now.getTime() - age * 24 * 60 * 60 * 1000),
            archived: stars === 50,
            hasReadme: stars % 20 === 0 ? null : true,
          }),
          now,
        );
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.reason.length).toBeGreaterThan(20);
        expect(result.factors).toHaveLength(6);
        expect(result.factors.map((factor) => factor.max)).toEqual([32, 16, 18, 18, 10, 6]);
      }
    }
  });
});

describe("ranking", () => {
  it("orders by watch score, then stars, then name", () => {
    const ranked = [
      { fullName: "b/repo", stars: 10, scoring: { score: 50 } },
      { fullName: "a/repo", stars: 10, scoring: { score: 50 } },
      { fullName: "c/repo", stars: 30, scoring: { score: 50 } },
      { fullName: "d/repo", stars: 1, scoring: { score: 80 } },
    ].sort((a, b) => compareWatchScore(a, b));

    expect(ranked.map((item) => item.fullName)).toEqual([
      "d/repo",
      "c/repo",
      "a/repo",
      "b/repo",
    ]);
  });

  it("places a fast new repository ahead of a slower older one", () => {
    const ranked = rankByWatchScore(
      [
        {
          ...repo({ stars: 12, createdAt: new Date("2025-01-01T00:00:00.000Z") }),
          fullName: "old/slow",
        },
        {
          ...repo({
            stars: 80,
            createdAt: new Date("2026-11-10T12:00:00.000Z"),
            pushedAt: new Date("2026-11-13T08:00:00.000Z"),
          }),
          fullName: "new/fast",
        },
      ],
      now,
    );
    expect(ranked.map((item) => item.fullName)).toEqual(["new/fast", "old/slow"]);
  });
});

describe("formatRate", () => {
  it("rounds small rates to one decimal and larger rates to integers", () => {
    expect(formatRate(0)).toBe("0");
    expect(formatRate(4.24)).toBe("4.2");
    expect(formatRate(8)).toBe("8");
    expect(formatRate(12.6)).toBe("13");
  });
});
