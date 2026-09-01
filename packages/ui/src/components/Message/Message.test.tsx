import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Message } from "./Message";

expect.extend(toHaveNoViolations);

test("Message renders with no accessibility violations", async () => {
  const { container } = render(
    <Message sender="Jane" timestamp="10:32 AM">
      Hello there
    </Message>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders its children", () => {
  render(<Message>Hello there</Message>);
  expect(screen.getByText("Hello there")).toBeInTheDocument();
});

test("renders sender and timestamp when provided", () => {
  render(
    <Message sender="Jane" timestamp="10:32 AM">
      Hello
    </Message>,
  );
  expect(screen.getByText("Jane")).toBeInTheDocument();
  expect(screen.getByText("10:32 AM")).toBeInTheDocument();
});

test("omits the sender/timestamp line entirely when neither is given", () => {
  const { container } = render(<Message>Hello</Message>);
  // Just the row and its content column — no metadata line, no avatar slot.
  expect(container.querySelectorAll("div")).toHaveLength(2);
});

test("renders an avatar when provided, and nothing extra when omitted", () => {
  const { rerender } = render(<Message avatar={<span data-testid="avatar" />}>Hello</Message>);
  expect(screen.getByTestId("avatar")).toBeInTheDocument();

  rerender(<Message>Hello</Message>);
  expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
});

test("defaults to incoming layout (not reversed)", () => {
  render(<Message data-testid="row">Hello</Message>);
  expect(screen.getByTestId("row")).not.toHaveClass("flex-row-reverse");
});

test("an outgoing Message reverses its row layout", () => {
  render(
    <Message variant="outgoing" data-testid="row">
      Hello
    </Message>,
  );
  expect(screen.getByTestId("row")).toHaveClass("flex-row-reverse");
});

test("Message merges a custom className with its defaults", () => {
  render(
    <Message className="custom-message" data-testid="row">
      Hello
    </Message>,
  );
  expect(screen.getByTestId("row")).toHaveClass("custom-message", "flex");
});

test("Message forwards its ref to the underlying element", () => {
  const messageRef = createRef<HTMLDivElement>();
  render(<Message ref={messageRef}>Hello</Message>);
  expect(messageRef.current).toBeInstanceOf(HTMLDivElement);
});
