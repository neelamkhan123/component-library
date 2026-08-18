import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

expect.extend(toHaveNoViolations);

function FullTable() {
  return (
    <Table>
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

test("Table renders with no accessibility violations", async () => {
  const { container } = render(<FullTable />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Table renders as a native table with the expected sections", () => {
  render(<FullTable />);
  const table = screen.getByRole("table");
  expect(table.tagName).toBe("TABLE");
  expect(table.querySelector("thead")).not.toBeNull();
  expect(table.querySelector("tbody")).not.toBeNull();
  expect(table.querySelector("tfoot")).not.toBeNull();
});

test("Table renders inside a horizontally scrolling wrapper", () => {
  const { container } = render(<FullTable />);
  const wrapper = container.firstElementChild;
  expect(wrapper).toHaveClass("overflow-x-auto");
  expect(wrapper?.querySelector("table")).not.toBeNull();
});

test("TableHead defaults to scope=col", () => {
  render(<FullTable />);
  screen.getAllByRole("columnheader").forEach((cell) => {
    expect(cell).toHaveAttribute("scope", "col");
  });
});

test("TableHead accepts scope=row for a row header", () => {
  render(
    <Table>
      <TableBody>
        <TableRow>
          <TableHead scope="row">Total</TableHead>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(screen.getByRole("rowheader")).toHaveAttribute("scope", "row");
});

test("TableCaption renders as the table's native caption", () => {
  render(<FullTable />);
  expect(screen.getByText("A list of recent invoices.").tagName).toBe("CAPTION");
});

test("TableCell supports colSpan for a footer summary row", () => {
  render(
    <Table>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
  expect(screen.getByText("Total")).toHaveAttribute("colspan", "2");
});

test("Table merges a custom className with its defaults", () => {
  render(<Table className="custom-table" />);
  expect(screen.getByRole("table")).toHaveClass("custom-table", "w-full");
});

test("TableRow forwards its ref to the underlying row", () => {
  const rowRef = createRef<HTMLTableRowElement>();
  render(
    <Table>
      <TableBody>
        <TableRow ref={rowRef}>
          <TableCell>Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(rowRef.current).toBeInstanceOf(HTMLTableRowElement);
});
