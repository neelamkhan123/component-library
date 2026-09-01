import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Avatar, AvatarFallback } from "../Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";

expect.extend(toHaveNoViolations);

function people(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <Avatar key={index}>
      <AvatarFallback>{`P${index}`}</AvatarFallback>
    </Avatar>
  ));
}

test("AvatarGroup renders with no accessibility violations", async () => {
  const { container } = render(<AvatarGroup label="Team members">{people(3)}</AvatarGroup>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("AvatarGroup exposes itself as a named group", () => {
  render(<AvatarGroup label="Team members">{people(3)}</AvatarGroup>);
  expect(screen.getByRole("group", { name: "Team members" })).toBeInTheDocument();
});

test("AvatarGroup renders every child when no max is set", () => {
  render(<AvatarGroup label="Team members">{people(5)}</AvatarGroup>);
  expect(screen.getByText("P4")).toBeVisible();
  expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
});

test("AvatarGroup caps the stack at max and counts the rest", () => {
  render(
    <AvatarGroup label="Team members" max={3}>
      {people(7)}
    </AvatarGroup>,
  );

  expect(screen.getByText("P2")).toBeVisible();
  expect(screen.queryByText("P3")).not.toBeInTheDocument();
  expect(screen.getByText("+4")).toBeVisible();
});

test("AvatarGroup announces the overflow count in words", () => {
  render(
    <AvatarGroup label="Team members" max={2}>
      {people(6)}
    </AvatarGroup>,
  );

  // The "+4" glyph is decorative; the words are what gets announced.
  expect(screen.getByText("and 4 more")).toBeInTheDocument();
  expect(screen.getByText("+4")).toHaveAttribute("aria-hidden", "true");
});

test("AvatarGroup counts against total when children are only a subset", () => {
  render(
    <AvatarGroup label="Team members" max={3} total={128}>
      {people(3)}
    </AvatarGroup>,
  );

  expect(screen.getByText("+125")).toBeVisible();
});

test("AvatarGroup shows no overflow counter when the total is fully rendered", () => {
  render(
    <AvatarGroup label="Team members" max={5}>
      {people(3)}
    </AvatarGroup>,
  );

  expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
});

test("AvatarGroup applies its own size to every child, overriding theirs", () => {
  render(
    <AvatarGroup label="Team members" size="lg">
      <Avatar size="sm">
        <AvatarFallback>P0</AvatarFallback>
      </Avatar>
    </AvatarGroup>,
  );

  const avatar = screen.getByText("P0").parentElement;
  expect(avatar).toHaveClass("h-12", "w-12");
  expect(avatar).not.toHaveClass("h-8");
});

test("AvatarGroup keeps a child's own className alongside the stacking classes", () => {
  render(
    <AvatarGroup label="Team members">
      <Avatar className="custom-avatar">
        <AvatarFallback>P0</AvatarFallback>
      </Avatar>
    </AvatarGroup>,
  );

  expect(screen.getByText("P0").parentElement).toHaveClass("custom-avatar", "ring-2");
});

test("AvatarGroup reserves each avatar's box before any image loads", () => {
  // The layout-shift guarantee: fixed size classes are present at first
  // paint, with no image having resolved.
  render(<AvatarGroup label="Team members">{people(3)}</AvatarGroup>);
  for (const fallback of screen.getAllByText(/^P\d$/)) {
    expect(fallback.parentElement).toHaveClass("h-10", "w-10");
  }
});

test("AvatarGroup ignores non-element children", () => {
  render(
    <AvatarGroup label="Team members" max={2}>
      {people(2)}
      {null}
      {false}
    </AvatarGroup>,
  );

  expect(within(screen.getByRole("group")).queryByText(/^\+/)).not.toBeInTheDocument();
});

test("AvatarGroup forwards its ref to the underlying div", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <AvatarGroup ref={ref} label="Team members">
      {people(2)}
    </AvatarGroup>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
