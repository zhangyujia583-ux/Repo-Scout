import type { RepoCardModel } from "@/lib/types";

export type SortKey = "score" | "stars" | "velocity" | "updated";

export function sortRepos(repos: readonly RepoCardModel[], sort: SortKey): RepoCardModel[] {
  const copy = [...repos];
  copy.sort((a, b) => {
    if (sort === "stars" && b.stars !== a.stars) return b.stars - a.stars;
    if (sort === "velocity" && b.starsPerDay !== a.starsPerDay) {
      return b.starsPerDay - a.starsPerDay;
    }
    if (sort === "updated" && b.pushedAt !== a.pushedAt) return b.pushedAt - a.pushedAt;
    if (b.score !== a.score) return b.score - a.score;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return a.fullName.localeCompare(b.fullName);
  });
  return copy;
}
