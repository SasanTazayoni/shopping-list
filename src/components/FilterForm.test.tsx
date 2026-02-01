import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterForm from "./FilterForm";
import { describe, expect, it, vi } from "vitest";

describe("FilterForm", () => {
  it("displays the filter text value", () => {
    render(
      <FilterForm
        filterText="milk"
        setFilterText={() => {}}
        hideCompleted={false}
        setHideCompleted={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText(/filter by name/i)).toHaveValue("milk");
  });

  it("calls setFilterText when typing", async () => {
    const setFilterText = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterForm
        filterText=""
        setFilterText={setFilterText}
        hideCompleted={false}
        setHideCompleted={() => {}}
      />,
    );

    await user.type(screen.getByPlaceholderText(/filter by name/i), "eggs");

    expect(setFilterText).toHaveBeenCalled();
  });

  it("displays the hideCompleted state", () => {
    render(
      <FilterForm
        filterText=""
        setFilterText={() => {}}
        hideCompleted={true}
        setHideCompleted={() => {}}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: /hide completed/i }),
    ).toBeChecked();
  });

  it("calls setHideCompleted when clicking checkbox", async () => {
    const setHideCompleted = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterForm
        filterText=""
        setFilterText={() => {}}
        hideCompleted={false}
        setHideCompleted={setHideCompleted}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /hide completed/i }));

    expect(setHideCompleted).toHaveBeenCalledWith(true);
  });
});
