import { describe, expect, it } from "vitest";
import { sortRepos } from "./sort";
import type { RepoCardModel } from "./types";

function card(overrides: Pick<RepoCardModel, "fullName" | "stars" | "starsPerDay" | "pushedAt" | "score">): RepoCardModel {
  return {
    id: overrides.score,
    name: overrides.fullName,
    ownerLogin: "owner",
    ownerUrl: "https://github.com/owner",
    url: "https://github.com/owner/repo",
    avatarUrl: null,
    description: null,
    language: null,
    starsLabel: String(overrides.stars),
    forks: 0,
    licenseLabel: null,
    topics: [],
    homepage: null,
    homepageHost: null,
    pushedLabel: "",
    createdLabel: "",
    starsPerDayLabel: "",
    reason: "Because.",
    factors: [],
    ...overrides,
  };
}

describe("sortRepos", () => {
  const repos = [
    card({ fullName: "b/quiet", stars: 20, starsPerDay: 1, pushedAt: 30, score: 40 }),
    card({ fullName: "a/hot", stars: 10, starsPerDay: 12, pushedAt: 10, score: 90 }),
    card({ fullName: "c/starred", stars: 80, starsPerDay: 2, pushedAt: 20, score: 70 }),
  ];

  it("defaults to watch score", () => {
    expect(sortRepos(repos, "score").map((repo) => repo.fullName)).toEqual([
      "a/hot",
      "c/starred",
      "b/quiet",
    ]);
  });

  it("can sort by stars, velocity, or latest push without dropping the watch-score tie break", () => {
    expect(sortRepos(repos, "stars").map((repo) => repo.fullName)[0]).toBe("c/starred");
    expect(sortRepos(repos, "velocity").map((repo) => repo.fullName)[0]).toBe("a/hot");
    expect(sortRepos(repos, "updated").map((repo) => repo.fullName)[0]).toBe("b/quiet");
  });
});
