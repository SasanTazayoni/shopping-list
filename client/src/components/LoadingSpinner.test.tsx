import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingSpinner from "./LoadingSpinner";
import { describe, expect, it } from "vitest";

describe("LoadingSpinner", () => {
  it("renders the spinner", () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
  });
});
