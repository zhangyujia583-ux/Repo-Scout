import { describe, expect, it } from "vitest";
import { formatCount, formatDay, formatRelative, formatStars } from "./format";

const now = new Date("2026-11-13T12:00:00.000Z");

describe("format helpers", () => {
  it("compacts star counts", () => {
    expect(formatStars(86)).toBe("86");
    expect(formatStars(1200)).toBe("1.2k");
    expect(formatStars(57030)).toBe("57k");
  });

  it("formats calendar days in UTC", () => {
    expect(formatDay("2026-10-14")).toBe("Oct 14, 2026");
  });

  it("formats counts with separators", () => {
    expect(formatCount(9571900)).toBe("9,571,900");
  });

  it("describes recent instants without crossing an hour boundary too early", () => {
    expect(formatRelative(new Date(now.getTime() - 30 * 60 * 1000), now)).toBe("just now");
    expect(formatRelative(new Date(now.getTime() - 2 * 60 * 60 * 1000), now)).toBe("2 hours ago");
    expect(formatRelative(new Date(now.getTime() - 26 * 60 * 60 * 1000), now)).toBe("yesterday");
    expect(formatRelative(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), now)).toBe(
      "3 days ago",
    );
  });
});
