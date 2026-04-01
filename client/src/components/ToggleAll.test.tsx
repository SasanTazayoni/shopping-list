import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ToggleAll from "./ToggleAll";

describe("ToggleAll", () => {
  it("renders a checkbox with the label text", () => {
    render(<ToggleAll checked={false} onToggle={() => {}} isPending={false} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    expect(checkbox).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    const { rerender } = render(
      <ToggleAll checked={true} onToggle={() => {}} isPending={false} />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    expect(checkbox).toBeChecked();

    rerender(<ToggleAll checked={false} onToggle={() => {}} isPending={false} />);

    expect(checkbox).not.toBeChecked();
  });

  it("calls onToggle when the user toggles it", async () => {
    const onToggle = vi.fn();

    render(<ToggleAll checked={false} onToggle={onToggle} isPending={false} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Check/Uncheck all",
    });

    const user = userEvent.setup();
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("disables the checkbox when isPending is true", () => {
    render(<ToggleAll checked={false} onToggle={vi.fn()} isPending={true} />);

    expect(screen.getByRole("checkbox", { name: "Check/Uncheck all" })).toBeDisabled();
  });

  it("enables the checkbox when isPending is false", () => {
    render(<ToggleAll checked={false} onToggle={vi.fn()} isPending={false} />);

    expect(screen.getByRole("checkbox", { name: "Check/Uncheck all" })).not.toBeDisabled();
  });
});
