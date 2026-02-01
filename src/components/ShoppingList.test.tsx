import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ShoppingList from "./ShoppingList";

describe("ShoppingList", () => {
  it("renders list items with correct text", () => {
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
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
        formatDate={vi.fn(() => "formatted date")}
      />,
    );

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
  });

  it("calls toggleItem with correct id when checkbox is clicked", async () => {
    const toggleItem = vi.fn();
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
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
        formatDate={vi.fn(() => "formatted date")}
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
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
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
        formatDate={vi.fn(() => "formatted date")}
      />,
    );

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole("button", { name: "✕" });
    await user.click(deleteButtons[1]);

    expect(removeItem).toHaveBeenCalledWith("item-2");
  });

  it("reflects completed state in checkbox and styling", () => {
    const shoppingList = [
      {
        id: "item-1",
        text: "Milk",
        completed: false,
        createdAt: new Date("2024-01-01"),
        completedAt: null,
      },
      {
        id: "item-2",
        text: "Bread",
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
        formatDate={vi.fn(() => "formatted date")}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    expect(screen.getByText("Milk")).not.toHaveClass("completed");
    expect(screen.getByText("Bread")).toHaveClass("completed");
  });

  it("renders empty list when no items", () => {
    render(
      <ShoppingList
        shoppingList={[]}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
        editItem={vi.fn()}
        formatDate={vi.fn()}
      />,
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
