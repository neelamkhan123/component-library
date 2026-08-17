import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

expect.extend(toHaveNoViolations);

function FullBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

test("Breadcrumb renders with no accessibility violations", async () => {
  const { container } = render(<FullBreadcrumb />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Breadcrumb renders as a labeled navigation landmark", () => {
  render(<FullBreadcrumb />);
  expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
});

test("BreadcrumbLink items render as links", () => {
  render(<FullBreadcrumb />);
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
  expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute(
    "href",
    "#components",
  );
});

test("BreadcrumbPage marks the current page and isn't a link", () => {
  render(<FullBreadcrumb />);
  const page = screen.getByText("Breadcrumb");
  expect(page).toHaveAttribute("aria-current", "page");
  expect(page.tagName).not.toBe("A");
});

test("BreadcrumbSeparator defaults to an icon and is hidden from assistive tech", () => {
  const { container } = render(<FullBreadcrumb />);
  const separators = container.querySelectorAll('[role="presentation"]');
  expect(separators).toHaveLength(2);
  separators.forEach((separator) => {
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator.querySelector("svg")).toBeInTheDocument();
  });
});

test("BreadcrumbSeparator renders custom children instead of the default icon", () => {
  render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
  expect(screen.getByText("/")).toBeInTheDocument();
});

test("BreadcrumbEllipsis is hidden from assistive tech but keeps a visible label for sighted users to ignore and a screen-reader-only one", () => {
  render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
  expect(screen.getByText("More")).toHaveClass("sr-only");
  expect(screen.getByText("More").closest('[aria-hidden="true"]')).not.toBeNull();
});

test("BreadcrumbList merges a custom className with its defaults", () => {
  render(
    <Breadcrumb>
      <BreadcrumbList className="custom-list" />
    </Breadcrumb>,
  );
  expect(screen.getByRole("list")).toHaveClass("custom-list", "flex");
});

test("BreadcrumbLink forwards its ref to the underlying anchor", () => {
  const linkRef = createRef<HTMLAnchorElement>();
  render(<BreadcrumbLink ref={linkRef} href="#home">Home</BreadcrumbLink>);
  expect(linkRef.current).toBeInstanceOf(HTMLAnchorElement);
});
