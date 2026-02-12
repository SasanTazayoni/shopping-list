import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Controls from "./Controls";
import userEvent from "@testing-library/user-event";

describe("Controls", () => {
  const inputRef = { current: null };
  const quantityRef = { current: null };

  it("renders input and buttons", () => {
    render(
      <Controls
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText=""
        setNewItemText={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const input = screen.getByPlaceholderText("Add an item...");
    const quantityInput = screen.getByLabelText("Quantity");
    const addButton = screen.getByRole("button", { name: "✓" });
    const sortButton = screen.getByRole("button", { name: "A→Z" });

    expect(input).toBeInTheDocument();
    expect(quantityInput).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(sortButton).toBeInTheDocument();
  });

  it("calls addListItem when add button is clicked", async () => {
    const addListItem = vi.fn();

    render(
      <Controls
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText="milk"
        setNewItemText={vi.fn()}
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
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText=""
        setNewItemText={vi.fn()}
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
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText=""
        setNewItemText={vi.fn()}
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
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText=""
        setNewItemText={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="desc"
      />,
    );

    const sortButton = screen.getByRole("button", { name: "Z→A" });
    expect(sortButton).toBeInTheDocument();
  });

  it("clamps quantity input to 1 when a value below 1 is entered", () => {
    render(
      <Controls
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText="milk"
        setNewItemText={vi.fn()}
        addListItem={vi.fn()}
        addListItemKeyboard={vi.fn()}
        sortShoppingList={vi.fn()}
        sortOrder="asc"
      />,
    );

    const quantityInput = screen.getByLabelText("Quantity") as HTMLInputElement;

    fireEvent.input(quantityInput, { target: { value: "0" } });
    expect(quantityInput.value).toBe("1");

    fireEvent.input(quantityInput, { target: { value: "-5" } });
    expect(quantityInput.value).toBe("1");
  });
});
