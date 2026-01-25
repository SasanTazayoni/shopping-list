import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Controls from "./Controls";
import userEvent from "@testing-library/user-event";

describe("Controls", () => {
  it("renders input and buttons", () => {
    render(
      <Controls
        itemToAdd=""
        setItemToAdd={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const input = screen.getByPlaceholderText("Add an item...");
    const addButton = screen.getByRole("button", { name: "✓" });
    const sortButton = screen.getByRole("button", { name: "A→Z" });

    expect(input).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(sortButton).toBeInTheDocument();
  });

  it("reflects itemToAdd in the input", () => {
    render(
      <Controls
        itemToAdd="Milk"
        setItemToAdd={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const input = screen.getByPlaceholderText("Add an item...");

    expect(input).toHaveValue("Milk");
  });

  it("calls setItemToAdd on input change", async () => {
    const setItemToAdd = vi.fn();

    render(
      <Controls
        itemToAdd=""
        setItemToAdd={setItemToAdd}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Add an item...");
    await user.type(input, "B");

    expect(setItemToAdd).toHaveBeenCalledWith("B");
  });

  it("calls addListItem when add button is clicked", async () => {
    const addListItem = vi.fn();

    render(
      <Controls
        itemToAdd=""
        setItemToAdd={vi.fn()}
        addListItem={addListItem}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const user = userEvent.setup();
    const addButton = screen.getByRole("button", { name: "✓" });
    await user.click(addButton);

    expect(addListItem).toHaveBeenCalledTimes(1);
  });

  it("calls addListItemKeyboard on keydown in input", async () => {
    const addListItemKeyboard = vi.fn();

    render(
      <Controls
        itemToAdd=""
        setItemToAdd={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={addListItemKeyboard}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Add an item...");
    await user.type(input, "{Enter}");

    expect(addListItemKeyboard).toHaveBeenCalled();
  });

  it("calls sortShoppingList when sort button is clicked", async () => {
    const sortShoppingList = vi.fn();

    render(
      <Controls
        itemToAdd=""
        setItemToAdd={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={sortShoppingList}
        sortOrder="asc"
      />,
    );

    const user = userEvent.setup();
    const sortButton = screen.getByRole("button", { name: "A→Z" });
    await user.click(sortButton);

    expect(sortShoppingList).toHaveBeenCalledTimes(1);
  });

  it("shows Z→A when sortOrder is desc", () => {
    render(
      <Controls
        itemToAdd=""
        setItemToAdd={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="desc"
      />,
    );

    const sortButton = screen.getByRole("button", { name: "Z→A" });
    expect(sortButton).toBeInTheDocument();
  });
});
