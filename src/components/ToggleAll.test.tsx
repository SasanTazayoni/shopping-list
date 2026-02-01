import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ToggleAll from "./ToggleAll";

describe("ToggleAll", () => {
  it("renders a checkbox with the label text", () => {
    render(<ToggleAll checked={false} onToggle={() => {}} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    expect(checkbox).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    const { rerender } = render(
      <ToggleAll checked={true} onToggle={() => {}} />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    expect(checkbox).toBeChecked();

    rerender(<ToggleAll checked={false} onToggle={() => {}} />);

    expect(checkbox).not.toBeChecked();
  });

  it("calls onToggle when the user toggles it", async () => {
    const onToggle = vi.fn();

    render(<ToggleAll checked={false} onToggle={onToggle} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    const user = userEvent.setup();
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
