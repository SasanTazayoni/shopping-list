import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadError from "./LoadError";

describe("LoadError", () => {
  it("renders the error message", () => {
    render(<LoadError />);

    expect(
      screen.getByText(
        "Something went wrong loading your list. Please refresh the page. If the problem persists, please try again later.",
      ),
    ).toBeInTheDocument();
  });
});
