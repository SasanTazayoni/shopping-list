import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import userEvent from "@testing-library/user-event";
import { shoppingListReducer, type ShoppingListAction } from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates shopping list from localStorage on initial render", () => {
    const seeded = [
      {
        text: "Milk",
        completed: false,
        createdAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
        completedAt: null,
      },
      {
        text: "Eggs",
        completed: true,
        createdAt: new Date("2026-01-01T09:00:00.000Z").toISOString(),
        completedAt: new Date("2026-01-01T09:30:00.000Z").toISOString(),
      },
    ];
    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toHaveClass("completed");
  });

  it("saves shopping list to localStorage on updates", async () => {
    localStorage.clear();
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    render(<App />);

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );
    const addButton = screen.getByRole("button", { name: "✓" });
    const user = userEvent.setup();

    await user.type(input, "Milk");
    await user.click(addButton);

    const [key, value] = setItemSpy.mock.calls.at(-1)!;

    expect(setItemSpy).toHaveBeenCalled();
    expect(key).toBe("shoppingList");
    expect(value).toContain("Milk");

    setItemSpy.mockRestore();
  });

  it("adds a new item and clears the input", async () => {
    render(<App />);

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );
    const addButton = screen.getByRole("button", { name: "✓" });
    const user = userEvent.setup();

    await user.type(input, "Eggs");
    await user.click(addButton);

    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("adds a new item when pressing Enter in the input", async () => {
    render(<App />);

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );
    const user = userEvent.setup();

    await user.type(input, "Bread{Enter}");

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("does not add an item when input is empty or whitespace", async () => {
    render(<App />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/add an item/i);
    const addButton = screen.getByRole("button", { name: "✓" });

    await user.click(addButton);
    await user.type(input, "   ");
    await user.click(addButton);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("toggles an item when clicking its checkbox", async () => {
    const seeded = [
      {
        text: "Milk",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();

    const checkbox = screen.getByRole("checkbox", { name: "" });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("Milk")).toHaveClass("completed");
  });

  it("removes an item when clicking the delete button", async () => {
    const seeded = [
      {
        text: "Milk",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();

    expect(screen.getByText("Milk")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: "✕" });
    await user.click(deleteButton);

    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
  });

  it("edits an item when clicking edit, typing, and pressing Enter", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Eggs",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();

    expect(screen.getByText("Milk")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: "✎" });
    await user.click(editButtons[0]);

    const editInput = screen.getByDisplayValue("Milk");
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveFocus();

    await user.clear(editInput);
    await user.type(editInput, "Bread{Enter}");

    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: "✎" })).toHaveLength(2);
  });

  it("sorts items A→Z then Z→A when clicking the sort button", async () => {
    const seeded = [
      {
        text: "Zebra",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        text: "Apple",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems[0]).toHaveTextContent("Zebra");
    expect(listItems[1]).toHaveTextContent("Apple");

    const sortButton = screen.getByRole("button", { name: "A→Z" });
    await user.click(sortButton);

    const sortedAsc = screen.getAllByRole("listitem");
    expect(sortedAsc[0]).toHaveTextContent("Apple");
    expect(sortedAsc[1]).toHaveTextContent("Zebra");

    const sortButtonDesc = screen.getByRole("button", { name: "Z→A" });
    await user.click(sortButtonDesc);

    const sortedDesc = screen.getAllByRole("listitem");
    expect(sortedDesc[0]).toHaveTextContent("Zebra");
    expect(sortedDesc[1]).toHaveTextContent("Apple");
  });

  it("checks all items when clicking toggle all", async () => {
    const seeded = [
      {
        text: "Milk",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        text: "Eggs",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();

    const toggleAllCheckbox = screen.getByRole("checkbox", {
      name: /check\/uncheck all/i,
    });
    const hideCompletedCheckbox = screen.getByRole("checkbox", {
      name: /hide completed/i,
    });
    const itemCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb !== toggleAllCheckbox && cb !== hideCompletedCheckbox);

    expect(itemCheckboxes[0]).not.toBeChecked();
    expect(itemCheckboxes[1]).not.toBeChecked();

    await user.click(toggleAllCheckbox);

    expect(itemCheckboxes[0]).toBeChecked();
    expect(itemCheckboxes[1]).toBeChecked();

    await user.click(toggleAllCheckbox);

    expect(itemCheckboxes[0]).not.toBeChecked();
    expect(itemCheckboxes[1]).not.toBeChecked();
  });

  it("hides completed items when 'Hide completed' is checked", async () => {
    const seeded = [
      {
        text: "Milk",
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        text: "Eggs",
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    localStorage.setItem("shoppingList", JSON.stringify(seeded));

    render(<App />);
    const user = userEvent.setup();
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();

    const hideCompletedCheckbox = screen.getByRole("checkbox", {
      name: /hide completed/i,
    });
    await user.click(hideCompletedCheckbox);
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  it("returns the current state for unknown action types", () => {
    const initialState = [
      {
        id: "test-id-123",
        text: "Milk",
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
    ];

    const result = shoppingListReducer(initialState, {
      type: "UNKNOWN_ACTION",
    } as unknown as ShoppingListAction);

    expect(result).toBe(initialState);
  });
});
