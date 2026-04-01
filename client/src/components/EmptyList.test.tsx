import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EmptyList from "./EmptyList";

describe("EmptyList", () => {
  it("renders the empty state message", () => {
    render(<EmptyList />);

    expect(screen.getByText("No items yet. Add your first item!")).toBeInTheDocument();
  });
});
