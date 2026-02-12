import { describe, it, expect } from "vitest";
import { hasDuplicateItemText } from "./hasDuplicateItemText";
import type { TodoItem } from "../App";

describe("hasDuplicateItemText", () => {
  const baseItem = {
    completed: false,
    createdAt: new Date(),
    completedAt: null,
  };

  const items: TodoItem[] = [
    { ...baseItem, id: "1", text: "Milk", quantity: 1 },
    { ...baseItem, id: "2", text: "Bread", quantity: 2 },
    { ...baseItem, id: "3", text: "Eggs", quantity: 12 },
  ];

  it("returns true when text already exists (case-insensitive)", () => {
    expect(hasDuplicateItemText(items, "milk")).toBe(true);
    expect(hasDuplicateItemText(items, "MILK")).toBe(true);
    expect(hasDuplicateItemText(items, "Milk")).toBe(true);
  });

  it("returns false when text does not exist", () => {
    expect(hasDuplicateItemText(items, "Cheese")).toBe(false);
  });

  it("ignores leading and trailing whitespace", () => {
    expect(hasDuplicateItemText(items, "  bread  ")).toBe(true);
  });

  it("excludes the item with the given id", () => {
    expect(hasDuplicateItemText(items, "Milk", "1")).toBe(false);
  });

  it("still detects duplicates for other items when excludeId is provided", () => {
    expect(hasDuplicateItemText(items, "Milk", "2")).toBe(true);
  });
});
