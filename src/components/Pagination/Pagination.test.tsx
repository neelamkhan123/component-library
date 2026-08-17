import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "./Pagination";

expect.extend(toHaveNoViolations);

// getPaginationRange ---------------------------------------------------

test("returns every page when they all fit within the default slots", () => {
  expect(getPaginationRange({ currentPage: 1, totalPages: 5 })).toEqual([1, 2, 3, 4, 5]);
  expect(getPaginationRange({ currentPage: 3, totalPages: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test("returns an empty range for zero pages", () => {
  expect(getPaginationRange({ currentPage: 1, totalPages: 0 })).toEqual([]);
});

test("shows only a right ellipsis when the current page is near the start", () => {
  expect(getPaginationRange({ currentPage: 2, totalPages: 20 })).toEqual([
    1,
    2,
    3,
    4,
    5,
    "ellipsis",
    20,
  ]);
});

test("shows only a left ellipsis when the current page is near the end", () => {
  expect(getPaginationRange({ currentPage: 19, totalPages: 20 })).toEqual([
    1,
    "ellipsis",
    16,
    17,
    18,
    19,
    20,
  ]);
});

test("shows both ellipses when the current page is in the middle", () => {
  expect(getPaginationRange({ currentPage: 10, totalPages: 20 })).toEqual([
    1,
    "ellipsis",
    9,
    10,
    11,
    "ellipsis",
    20,
  ]);
});

test("the range always includes the current page", () => {
  for (let currentPage = 1; currentPage <= 20; currentPage++) {
    const items = getPaginationRange({ currentPage, totalPages: 20 });
    expect(items).toContain(currentPage);
  }
});

test("the range always starts with 1 and ends with totalPages once truncated", () => {
  for (let currentPage = 1; currentPage <= 20; currentPage++) {
    const items = getPaginationRange({ currentPage, totalPages: 20 });
    expect(items[0]).toBe(1);
    expect(items[items.length - 1]).toBe(20);
  }
});

test("a larger siblingCount widens the range around the current page", () => {
  expect(getPaginationRange({ currentPage: 10, totalPages: 20, siblingCount: 2 })).toEqual([
    1,
    "ellipsis",
    8,
    9,
    10,
    11,
    12,
    "ellipsis",
    20,
  ]);
});

// Components -------------------------------------------------------------

function FullPagination() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>20</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

test("Pagination renders with no accessibility violations", async () => {
  const { container } = render(<FullPagination />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Pagination renders as a labeled navigation landmark", () => {
  render(<FullPagination />);
  expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
});

test("PaginationLink marks the active page with aria-current", () => {
  render(<FullPagination />);
  expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "2" })).not.toHaveAttribute("aria-current");
});

test("PaginationPrevious and PaginationNext render their default labels", () => {
  render(<FullPagination />);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
});

test("PaginationPrevious/PaginationNext accept custom children", () => {
  render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious>Back</PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext>Forward</PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  );
  expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Forward" })).toBeInTheDocument();
});

test("PaginationEllipsis is hidden from assistive tech", () => {
  render(<FullPagination />);
  const ellipsis = screen.getByText("More pages");
  expect(ellipsis).toHaveClass("sr-only");
  expect(ellipsis.closest('[aria-hidden="true"]')).not.toBeNull();
});

test("PaginationLink merges a custom className with its defaults", () => {
  render(<PaginationLink className="custom-link">1</PaginationLink>);
  expect(screen.getByRole("button", { name: "1" })).toHaveClass("custom-link", "rounded-lg");
});

test("PaginationContent forwards its ref to the underlying list", () => {
  const listRef = createRef<HTMLUListElement>();
  render(
    <Pagination>
      <PaginationContent ref={listRef} />
    </Pagination>,
  );
  expect(listRef.current).toBeInstanceOf(HTMLUListElement);
});
