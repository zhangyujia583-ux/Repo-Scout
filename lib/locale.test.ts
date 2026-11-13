import { describe, expect, it } from "vitest";
import { t } from "./copy";
import { parseLocale } from "./locale";
import { scoreRepository, type ScoreInput } from "./score";

describe("parseLocale", () => {
  it("keeps English unless the query explicitly asks for Chinese", () => {
    expect(parseLocale(undefined)).toBe("en");
    expect(parseLocale(null)).toBe("en");
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("zh-CN")).toBe("en");
    expect(parseLocale("zh")).toBe("zh");
    expect(parseLocale(["zh", "en"])).toBe("zh");
  });
});

describe("localized watch reasons", () => {
  const now = new Date("2026-11-13T12:00:00.000Z");

  function repo(overrides: Partial<ScoreInput> = {}): ScoreInput {
    return {
      stars: 200,
      forks: 20,
      createdAt: new Date("2026-11-09T12:00:00.000Z"),
      pushedAt: new Date("2026-11-13T06:00:00.000Z"),
      description: "A clear description of a small tool that does one job well and documents the workflow.",
      topics: ["cli"],
      license: "MIT",
      homepage: "https://example.com",
      hasReadme: null,
      readmeChars: null,
      archived: false,
      ...overrides,
    };
  }

  it("keeps the numeric score and changes only the wording", () => {
    const input = repo({ hasReadme: true, readmeChars: 2000 });
    const english = scoreRepository(input, now, "en");
    const chinese = scoreRepository(input, now, "zh");
    expect(chinese.score).toBe(english.score);
    expect(chinese.factors.map((factor) => factor.points)).toEqual(
      english.factors.map((factor) => factor.points),
    );
    expect(chinese.reason).not.toBe(english.reason);
    expect(chinese.reason.endsWith("。")).toBe(true);
    expect(chinese.reason).toContain("MIT");
    expect(chinese.reason).toMatch(/star/);
    expect(chinese.reason.toLowerCase()).not.toContain("readme");
    expect(chinese.factors.map((factor) => factor.short)).toEqual([
      "增速",
      "新近",
      "活跃",
      "文档",
      "许可",
      "Fork",
    ]);
  });

  it("does not invent a README in Chinese", () => {
    const unknown = scoreRepository(repo({ license: null }), now, "zh");
    expect(unknown.reason.toLowerCase()).not.toContain("readme");
    expect(unknown.reason).toContain("简介");
    expect(unknown.factors.find((factor) => factor.id === "docs")?.detail).toContain("未检查");

    const documented = scoreRepository(
      repo({ license: null, hasReadme: true, readmeChars: 2000 }),
      now,
      "zh",
    );
    expect(documented.reason).toContain("README");
    expect(documented.reason).not.toContain("许可证");
  });

  it("names an archived repository and a thin one in Chinese", () => {
    const archived = scoreRepository(repo({ archived: true }), now, "zh");
    expect(archived.reason).toContain("归档");

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
      "zh",
    );
    expect(quiet.reason).toContain("公开信号偏少");
    expect(quiet.score).toBe(scoreRepository(
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
    ).score);
  });

  it("exposes the same scoring explanation in both languages", () => {
    expect(Object.keys(t("zh").factors)).toEqual(Object.keys(t("en").factors));
    expect(t("zh").dialogTitle.length).toBeGreaterThan(4);
  });
});
