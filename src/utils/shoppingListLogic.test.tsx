import { describe, expect, it } from "vitest";
import { toggleAllItems, toggleItemById } from "./shoppingListLogic";
import type { TodoItem } from "../App";

describe("toggleItemById", () => {
  it("marks an incomplete item as completed and sets completedAt to now", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const items: TodoItem[] = [
      {
        id: "item-1",
        text: "Item 1",
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Item 2",
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
    ];

    const result = toggleItemById(items, "item-1", now);

    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).toEqual(now);
    expect(result[1]).toEqual(items[1]);
  });

  it("marks a completed item as incomplete and clears completedAt", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const items: TodoItem[] = [
      {
        id: "item-1",
        text: "Item 1",
        completed: true,
        createdAt: new Date(),
        completedAt: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        id: "item-2",
        text: "Item 2",
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
    ];

    const result = toggleItemById(items, "item-1", now);

    expect(result[0].completed).toBe(false);
    expect(result[0].completedAt).toBeNull();
    expect(result[1]).toEqual(items[1]);
  });
});

describe("toggleAllItems", () => {
  it("when allCompleted=true, unchecks all items and clears completedAt", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");

    const items: TodoItem[] = [
      {
        id: "item-1",
        text: "Milk",
        completed: true,
        createdAt: now,
        completedAt: new Date("2026-01-01T09:30:00.000Z"),
      },
      {
        id: "item-2",
        text: "Eggs",
        completed: true,
        createdAt: now,
        completedAt: new Date("2026-01-01T09:45:00.000Z"),
      },
    ];

    const result = toggleAllItems(items, true, now);

    expect(result.every((index) => index.completed === false)).toBe(true);
    expect(result.every((index) => index.completedAt === null)).toBe(true);
  });

  it("when allCompleted=false, checks all items and sets completedAt to now", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");

    const items: TodoItem[] = [
      {
        id: "item-1",
        text: "Milk",
        completed: false,
        createdAt: now,
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Eggs",
        completed: false,
        createdAt: now,
        completedAt: null,
      },
    ];

    const result = toggleAllItems(items, false, now);
    expect(result.every((index) => index.completed === true)).toBe(true);
    expect(
      result.every((index) => index.completedAt?.getTime() === now.getTime()),
    ).toBe(true);
  });

  it("completes only incomplete items when some items are already completed", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");
    const earlier = new Date("2026-01-01T09:00:00.000Z");

    const items: TodoItem[] = [
      {
        id: "item-1",
        text: "Milk",
        completed: true,
        createdAt: earlier,
        completedAt: earlier,
      },
      {
        id: "item-2",
        text: "Eggs",
        completed: false,
        createdAt: earlier,
        completedAt: null,
      },
    ];

    const result = toggleAllItems(items, false, now);

    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).toEqual(earlier);
    expect(result[1].completed).toBe(true);
    expect(result[1].completedAt).toEqual(now);
  });
});
