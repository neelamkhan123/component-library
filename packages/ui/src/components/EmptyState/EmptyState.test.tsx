import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";

expect.extend(toHaveNoViolations);

test("EmptyState renders with no accessibility violations", async () => {
  const { container } = render(
    <EmptyState
      title="No projects yet"
      description="Connect a data source to get started."
      action={<Button>New project</Button>}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("EmptyState renders its title, description, and action", () => {
  render(
    <EmptyState
      title="No projects yet"
      description="Connect a data source to get started."
      action={<Button>New project</Button>}
    />,
  );

  expect(screen.getByText("No projects yet")).toBeVisible();
  expect(screen.getByText("Connect a data source to get started.")).toBeVisible();
  expect(screen.getByRole("button", { name: "New project" })).toBeVisible();
});

test("EmptyState omits the description and action when not given", () => {
  render(<EmptyState title="No projects yet" />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("EmptyState is not a live region by default", () => {
  render(<EmptyState title="No projects yet" />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("EmptyState announces itself when live", () => {
  render(<EmptyState live title="No rows match your filter" />);
  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveTextContent("No rows match your filter");
});

test("EmptyState hides its icon from assistive tech", () => {
  const { container } = render(<EmptyState icon={<svg data-testid="icon" />} title="Nothing here" />);
  expect(container.querySelector('[aria-hidden="true"]')).toContainElement(screen.getByTestId("icon"));
});

test("EmptyState renders its title as a paragraph by default", () => {
  render(<EmptyState title="No projects yet" />);
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  expect(screen.getByText("No projects yet").tagName).toBe("P");
});

test("EmptyState renders the title at the heading level the caller names", () => {
  render(<EmptyState title="No projects yet" titleAs="h2" />);
  const heading = screen.getByRole("heading", { level: 2, name: "No projects yet" });
  // The level is chosen without nesting a heading inside a styling paragraph.
  expect(heading.querySelector("h2")).toBeNull();
});

test("EmptyState merges a custom className with its defaults", () => {
  const { container } = render(<EmptyState className="custom-empty" title="Nothing here" />);
  expect(container.firstChild).toHaveClass("custom-empty", "border-dashed");
});

test("EmptyState forwards its ref to the underlying div", () => {
  const ref = createRef<HTMLDivElement>();
  render(<EmptyState ref={ref} title="Nothing here" />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
