import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import userEvent from "@testing-library/user-event";
import {
  shoppingListReducer,
  type ShoppingListAction,
} from "./reducers/shoppingListReducer";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads items from the API on initial render", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Eggs",
        quantity: 12,
        completed: true,
        createdAt: new Date("2026-01-01T09:00:00.000Z").toISOString(),
        completedAt: new Date("2026-01-01T09:30:00.000Z").toISOString(),
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs (12)")).toBeInTheDocument();
    expect(screen.getByText("Eggs (12)")).toHaveClass("completed");
  });

  it("sends a POST request when adding a new item", async () => {
    await act(async () => {
      render(<App />);
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "new-id",
          text: "Milk",
          quantity: 1,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }),
    } as unknown as Response);

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );

    const user = userEvent.setup();

    await user.type(input, "Milk");
    await user.click(screen.getByRole("button", { name: "✓" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/shopping-items",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Milk"),
      }),
    );
  });

  it("adds a new item and clears the input", async () => {
    await act(async () => {
      render(<App />);
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "new-id",
          text: "Eggs",
          quantity: 3,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }),
    } as unknown as Response);

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );
    const quantityInput = screen.getByRole("spinbutton");

    await user.type(input, "Eggs");
    await user.type(quantityInput, "3");
    await user.click(screen.getByRole("button", { name: "✓" }));

    expect(screen.getByText("Eggs (3)")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(quantityInput).toHaveDisplayValue("");
  });

  it("adds a new item when pressing Enter in the input", async () => {
    await act(async () => {
      render(<App />);
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "new-id",
          text: "Bread",
          quantity: 1,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }),
    } as unknown as Response);

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );

    await user.type(input, "Bread{Enter}");

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("does not add an item when the item is already on the list", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );

    await user.type(input, "Milk");
    await user.click(screen.getByRole("button", { name: "✓" }));
    const items = screen.getAllByText("Milk");
    expect(items).toHaveLength(1);
  });

  it("does not change an item when editing to empty or whitespace", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup();
    const editButton = screen.getByRole("button", { name: "✎" });

    await user.click(editButton);

    const editInput = screen.getByDisplayValue("Milk");
    expect(editInput).toHaveFocus();

    await user.clear(editInput);
    await user.keyboard("{Enter}");
    expect(screen.getByText("Milk")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "✎" }));
    const editInputAgain = screen.getByDisplayValue("Milk");
    await user.clear(editInputAgain);
    await user.type(editInputAgain, "   {Enter}");

    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("shows toast for duplicate item when adding that fades and disappears", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup({
      advanceTimers: (delay) => vi.advanceTimersByTime(delay),
    });

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );

    await user.type(input, "Milk");
    await user.click(screen.getByRole("button", { name: "✓" }));

    const toast = screen.getByText(/"Milk" is already in your list/);
    expect(toast).toBeInTheDocument();
    expect(toast).not.toHaveClass("fading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    expect(toast).toHaveClass("fading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(
      screen.queryByText(/"Milk" is already in your list/),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does not edit an item to a duplicate and shows a toast that fades and disappears", async () => {
    vi.useFakeTimers();

    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const breadLi = screen.getByText("Bread").closest("li")!;
    fireEvent.click(within(breadLi).getByRole("button", { name: "✎" }));

    const editInput = within(breadLi).getByRole("textbox") as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: "Milk" } });
    fireEvent.keyDown(editInput, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getAllByText("Milk")).toHaveLength(1);

    const toast = screen.getByText(/"Milk" is already in your list/);
    expect(toast).toBeInTheDocument();
    expect(toast).not.toHaveClass("fading");

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(toast).toHaveClass("fading");

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(
      screen.queryByText(/"Milk" is already in your list/),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("clears previous toast when a new duplicate is detected", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup({
      advanceTimers: (delay) => vi.advanceTimersByTime(delay),
    });

    const input = screen.getByPlaceholderText((text) =>
      text.startsWith("Add an item"),
    );

    await user.type(input, "Milk");
    await user.click(screen.getByRole("button", { name: "✓" }));

    const firstToast = screen.getByText(/"Milk" is already in your list/);
    expect(firstToast).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2700);
    });

    expect(firstToast).toBeInTheDocument();
    expect(firstToast).toHaveClass("fading");

    await user.clear(input);
    await user.type(input, "Bread");
    await user.click(screen.getByRole("button", { name: "✓" }));

    expect(
      screen.queryByText(/"Milk" is already in your list/),
    ).not.toBeInTheDocument();

    const secondToast = screen.getByText(/"Bread" is already in your list/);
    expect(secondToast).toBeInTheDocument();
    expect(secondToast).not.toHaveClass("fading");

    vi.useRealTimers();
  });

  it("does not add an item when input is empty or whitespace", async () => {
    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/add an item/i);

    await user.type(input, "{Enter}");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);

    await user.type(input, "   {Enter}");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("toggles an item when clicking its checkbox", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ...seeded[0],
          completed: true,
          completedAt: new Date().toISOString(),
        }),
    } as unknown as Response);

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
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

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
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Eggs",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup();
    const milkListItem = screen.getByText("Milk").closest("li")!;
    const milkEditButton = within(milkListItem).getByRole("button", {
      name: "✎",
    });

    await user.click(milkEditButton);

    const editInput = within(milkListItem).getByDisplayValue("Milk");
    expect(editInput).toHaveFocus();

    await user.clear(editInput);
    await user.type(editInput, "Bread{Enter}");

    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  it("sorts items A→Z then Z→A when clicking the sort button", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Zebra",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Apple",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    const user = userEvent.setup();

    let items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Apple");
    expect(items[1]).toHaveTextContent("Zebra");

    const sortButton = screen.getByRole("button", { name: /z→a|a→z/i });
    await user.click(sortButton);

    items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Zebra");
    expect(items[1]).toHaveTextContent("Apple");

    await user.click(sortButton);

    items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Apple");
    expect(items[1]).toHaveTextContent("Zebra");
  });

  it("checks all items when clicking toggle all", async () => {
    const seeded = [
      {
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: "test-id-2",
        text: "Eggs",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...seeded[0],
            completed: true,
            completedAt: new Date().toISOString(),
          }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...seeded[1],
            completed: true,
            completedAt: new Date().toISOString(),
          }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...seeded[0],
            completed: false,
            completedAt: null,
          }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...seeded[1],
            completed: false,
            completedAt: null,
          }),
      } as unknown as Response);

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
        id: "test-id-1",
        text: "Milk",
        quantity: 1,
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: "test-id-2",
        text: "Eggs",
        quantity: 1,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(seeded),
    } as unknown as Response);

    await act(async () => {
      render(<App />);
    });

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
        quantity: 1,
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
