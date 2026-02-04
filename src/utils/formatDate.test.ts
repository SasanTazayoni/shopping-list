import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("returns an em dash when date is null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("formats a Date using toLocaleString", () => {
    const date = new Date("2024-01-01T10:30:00Z");
    const expected = date.toLocaleString();

    expect(formatDate(date)).toBe(expected);
  });
});
