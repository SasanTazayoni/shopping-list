import { describe, it, expect } from "vitest";
import { shoppingListReducer } from "./shoppingListReducer";
import type { TodoItem, ShoppingListAction } from "./shoppingListReducer";

const item: TodoItem = {
  id: "1",
  text: "Milk",
  quantity: 1,
  completed: false,
  createdAt: new Date("2026-01-01"),
  completedAt: null,
};

describe("shoppingListReducer", () => {
  it("LOAD_ITEMS replaces state with payload", () => {
    const result = shoppingListReducer([], {
      type: "LOAD_ITEMS",
      payload: [item],
    });
    expect(result).toEqual([item]);
  });

  it("ADD_ITEM appends a new item", () => {
    const result = shoppingListReducer([], {
      type: "ADD_ITEM",
      payload: { id: "2", text: "Eggs", quantity: 2, createdAt: new Date() },
    });
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Eggs");
    expect(result[0].completed).toBe(false);
  });

  it("REMOVE_ITEM removes the matching item", () => {
    const result = shoppingListReducer([item], {
      type: "REMOVE_ITEM",
      payload: "1",
    });
    expect(result).toHaveLength(0);
  });

  it("TOGGLE_ITEM updates completed and completedAt", () => {
    const date = new Date();
    const result = shoppingListReducer([item], {
      type: "TOGGLE_ITEM",
      payload: { id: "1", completed: true, completedAt: date },
    });
    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).toBe(date);
  });

  it("TOGGLE_ITEM leaves non-matching items unchanged", () => {
    const item2 = { ...item, id: "2", text: "Eggs" };
    const result = shoppingListReducer([item, item2], {
      type: "TOGGLE_ITEM",
      payload: { id: "1", completed: true, completedAt: new Date() },
    });
    expect(result[0].completed).toBe(true);
    expect(result[1].completed).toBe(false);
  });

  it("EDIT_ITEM updates text and quantity", () => {
    const result = shoppingListReducer([item], {
      type: "EDIT_ITEM",
      payload: { id: "1", text: "Bread", quantity: 3 },
    });
    expect(result[0].text).toBe("Bread");
    expect(result[0].quantity).toBe(3);
  });

  it("EDIT_ITEM leaves non-matching items unchanged", () => {
    const item2 = { ...item, id: "2", text: "Eggs" };
    const result = shoppingListReducer([item, item2], {
      type: "EDIT_ITEM",
      payload: { id: "1", text: "Bread", quantity: 3 },
    });
    expect(result[0].text).toBe("Bread");
    expect(result[1].text).toBe("Eggs");
  });

  it("TOGGLE_ALL updates all matching items", () => {
    const item2 = { ...item, id: "2", text: "Eggs" };
    const result = shoppingListReducer([item, item2], {
      type: "TOGGLE_ALL",
      payload: [
        { id: "1", completed: true, completedAt: new Date() },
        { id: "2", completed: true, completedAt: new Date() },
      ],
    });
    expect(result[0].completed).toBe(true);
    expect(result[1].completed).toBe(true);
  });

  it("TOGGLE_ALL leaves items not in payload unchanged", () => {
    const item2 = { ...item, id: "2", text: "Eggs" };
    const result = shoppingListReducer([item, item2], {
      type: "TOGGLE_ALL",
      payload: [{ id: "1", completed: true, completedAt: new Date() }],
    });
    expect(result[0].completed).toBe(true);
    expect(result[1].completed).toBe(false);
  });

  it("returns current state for unknown action", () => {
    const state = [item];
    const result = shoppingListReducer(state, {
      type: "UNKNOWN",
    } as unknown as ShoppingListAction);
    expect(result).toBe(state);
  });
});
