import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ShoppingList from "./ShoppingList";

describe("ShoppingList", () => {
  it("renders list items with correct text", () => {
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        quantity: 3,
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
        quantity: 2,
        completed: true,
        createdAt: new Date("2024-01-02"),
        completedAt: new Date("2024-01-03"),
      },
      {
        id: "item-3",
        text: "Apple",
        quantity: 1,
        completed: true,
        createdAt: new Date("2024-01-02"),
        completedAt: new Date("2024-01-06"),
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    expect(screen.getByText("Milk (3)")).toBeInTheDocument();
    expect(screen.getByText("Bread (2)")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("calls toggleItem with correct id when checkbox is clicked", async () => {
    const toggleItem = vi.fn();
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-02"),
        completedAt: null,
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={toggleItem}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);

    expect(toggleItem).toHaveBeenCalledWith("item-2");
  });

  it("calls removeItem with correct id when delete button is clicked", async () => {
    const removeItem = vi.fn();
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-02"),
        completedAt: null,
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={vi.fn()}
        removeItem={removeItem}
        editItem={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole("button", { name: "✕" });
    await user.click(deleteButtons[1]);

    expect(removeItem).toHaveBeenCalledWith("item-2");
  });

  it("exits edit mode after clicking ✓ with some text", async () => {
    const editItem = vi.fn();

    const shoppingList = [
      {
        id: "item-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-02"),
        completedAt: null,
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "✎" }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "asdf");

    await user.click(screen.getByRole("button", { name: "✓" }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✎" })).toBeInTheDocument();
    await waitFor(() => {
      expect(editItem).toHaveBeenCalledWith("item-2", "asdf", 1);
    });
  });

  it("exits edit mode after clicking ✕", async () => {
    const editItem = vi.fn();
    const shoppingList = [
      {
        id: "item-2",
        text: "Bread",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-02"),
        completedAt: null,
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "✎" }));
    await user.click(screen.getByRole("button", { name: "✕" }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✎" })).toBeInTheDocument();
    await waitFor(() => {
      expect(editItem).not.toHaveBeenCalledWith("item-2", "Bread");
    });
  });

  it("blurs the active element when cancelling edit by clicking ✕ while editing", async () => {
    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-2",
            text: "Bread",
            quantity: 1,
            completed: false,
            createdAt: new Date(),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "✎" }));

    const cancelBtn = screen.getByRole("button", { name: "✕" });

    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    const blurSpy = vi.spyOn(cancelBtn, "blur");

    fireEvent.click(cancelBtn);

    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it("cancels editing when Escape is pressed", async () => {
    const editItem = vi.fn();
    const removeItem = vi.fn();

    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-2",
            text: "Bread",
            quantity: 1,
            completed: false,
            createdAt: new Date("2024-01-02"),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={removeItem}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "✎" }));
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "asdf");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✎" })).toBeInTheDocument();
    expect(editItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
  });

  it("saves edits when Enter is pressed", async () => {
    const editItem = vi.fn();
    const removeItem = vi.fn();

    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-2",
            text: "Bread",
            quantity: 1,
            completed: false,
            createdAt: new Date("2024-01-02"),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={removeItem}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "✎" }));
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "asdf");
    await user.keyboard("{Enter}");

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✎" })).toBeInTheDocument();
    expect(editItem).toHaveBeenCalled();
  });

  it("reflects completed state in checkbox and styling", () => {
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        quantity: 1,
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
        quantity: 1,
        completed: true,
        createdAt: new Date("2024-01-02"),
        completedAt: new Date("2024-01-03"),
      },
    ];

    render(
      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    expect(screen.getByText("Milk")).not.toHaveClass("completed");
    expect(screen.getByText("Bread")).toHaveClass("completed");
  });

  it("increments quantity when + is clicked in edit mode", async () => {
    const editItem = vi.fn();

    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-1",
            text: "Milk",
            quantity: 2,
            completed: false,
            createdAt: new Date("2024-01-01"),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "✎" }));

    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "✓" }));
    expect(editItem).toHaveBeenCalledWith("item-1", "Milk", 4);
  });

  it("decrements quantity when - is clicked in edit mode", async () => {
    const editItem = vi.fn();

    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-1",
            text: "Milk",
            quantity: 3,
            completed: false,
            createdAt: new Date("2024-01-01"),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={editItem}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "✎" }));

    expect(screen.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "−" }));
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "✓" }));
    expect(editItem).toHaveBeenCalledWith("item-1", "Milk", 2);
  });

  it("does not decrement quantity below 1", async () => {
    render(
      <ShoppingList
        shoppingList={[
          {
            id: "item-1",
            text: "Milk",
            quantity: 1,
            completed: false,
            createdAt: new Date("2024-01-01"),
            completedAt: null,
          },
        ]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "✎" }));

    await user.click(screen.getByRole("button", { name: "−" }));
    await user.click(screen.getByRole("button", { name: "−" }));
    await user.click(screen.getByRole("button", { name: "−" }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders empty list when no items", () => {
    render(
      <ShoppingList
        shoppingList={[]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
      />,
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
