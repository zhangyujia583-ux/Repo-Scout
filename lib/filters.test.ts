import { describe, expect, it } from "vitest";
import {
  buildGithubSearchUrl,
  buildSearchQuery,
  parseFilters,
  sinceDate,
  type Filters,
} from "./filters";

const now = new Date("2026-11-13T15:00:00.000Z");

const base: Filters = {
  query: "",
  language: "all",
  topic: "",
  windowDays: 30,
  mode: "new",
};

describe("sinceDate", () => {
  it("counts whole days back from the given instant", () => {
    expect(sinceDate(7, now)).toBe("2026-11-06");
    expect(sinceDate(30, now)).toBe("2026-10-14");
    expect(sinceDate(90, now)).toBe("2026-08-15");
  });
});

describe("buildSearchQuery", () => {
  it("searches public non-fork repositories created in the window", () => {
    expect(buildSearchQuery(base, now)).toBe(
      "is:public fork:false archived:false created:>=2026-10-14",
    );
  });

  it("adds a recent push and a star floor for rising mode", () => {
    const query = buildSearchQuery({ ...base, mode: "rising", windowDays: 30 }, now);
    expect(query).toContain("created:>=2026-10-14");
    expect(query).toContain("pushed:>=2026-11-06");
    expect(query).toContain("stars:>=5");
  });

  it("quotes languages and multi-word keywords", () => {
    expect(
      buildSearchQuery(
        {
          ...base,
          mode: "rising",
          windowDays: 7,
          language: "C++",
          topic: "llm",
          query: "vector db",
        },
        now,
      ),
    ).toBe(
      'is:public fork:false archived:false created:>=2026-11-06 pushed:>=2026-11-06 stars:>=5 language:"C++" topic:llm "vector db"',
    );
  });

  it("builds a GitHub search URL that round-trips the query", () => {
    const url = new URL(buildGithubSearchUrl('language:"C++"'));
    expect(url.searchParams.get("q")).toBe('language:"C++"');
    expect(url.searchParams.get("sort")).toBe("stars");
    expect(url.searchParams.get("order")).toBe("desc");
    expect(url.searchParams.get("per_page")).toBe("30");
    expect(url.hostname).toBe("api.github.com");
  });
});

describe("parseFilters", () => {
  it("normalizes window, mode, language, topic, and keyword", () => {
    expect(
      parseFilters({
        window: "90",
        mode: "rising",
        language: "rust",
        topic: "LLM!",
        q: ' "hello" ',
      }),
    ).toEqual({
      windowDays: 90,
      mode: "rising",
      language: "Rust",
      topic: "llm",
      query: "hello",
    });
  });

  it("falls back when the query string is invalid", () => {
    expect(
      parseFilters({
        window: "14",
        mode: ["nope"],
        language: "../etc",
        topic: "!!!",
        q: ["   "],
      }),
    ).toEqual({
      windowDays: 30,
      mode: "new",
      language: "all",
      topic: "",
      query: "",
    });
  });

  it("keeps a safe custom language that is not in the short list", () => {
    expect(parseFilters({ language: "Zig" }).language).toBe("Zig");
  });
});
