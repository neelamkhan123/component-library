import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

expect.extend(toHaveNoViolations);

interface Person {
  id: number;
  name: string;
  role: string;
  score: number;
}

const people: Person[] = [
  { id: 1, name: "Charlie", role: "Engineer", score: 80 },
  { id: 2, name: "Alice", role: "Designer", score: 95 },
  { id: 3, name: "Bob", role: "Engineer", score: 70 },
];

const columns: DataTableColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role" },
  { key: "score", header: "Score", sortable: true, align: "right" },
];

function rowTexts() {
  // Skip the header row.
  return screen.getAllByRole("row").slice(1).map((row) => row.textContent ?? "");
}

test("DataTable renders with no accessibility violations", async () => {
  const { container } = render(<DataTable columns={columns} data={people} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders a header and a row per data item", () => {
  render(<DataTable columns={columns} data={people} />);
  expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Role" })).toBeInTheDocument();
  expect(rowTexts()).toHaveLength(3);
  expect(screen.getByText("Charlie")).toBeInTheDocument();
});

test("a custom cell renderer overrides the default String(value)", () => {
  render(
    <DataTable
      columns={[
        { key: "name", header: "Name" },
        { key: "score", header: "Score", cell: (row) => `${row.score}%` },
      ]}
      data={people}
    />,
  );
  expect(screen.getByText("80%")).toBeInTheDocument();
});

test("non-sortable columns render as plain text, not a button", () => {
  render(<DataTable columns={columns} data={people} />);
  const roleHeader = screen.getByRole("columnheader", { name: "Role" });
  expect(within(roleHeader).queryByRole("button")).not.toBeInTheDocument();
  expect(roleHeader).not.toHaveAttribute("aria-sort");
});

test("sortable columns start unsorted with aria-sort=none", () => {
  render(<DataTable columns={columns} data={people} />);
  expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "none");
});

test("clicking a sortable header cycles ascending -> descending -> unsorted", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} />);
  const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
  const nameButton = screen.getByRole("button", { name: /Name/ });

  await user.click(nameButton);
  expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  expect(rowTexts()[0]).toContain("Alice");

  await user.click(nameButton);
  expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  expect(rowTexts()[0]).toContain("Charlie");

  await user.click(nameButton);
  expect(nameHeader).toHaveAttribute("aria-sort", "none");
  expect(rowTexts()[0]).toContain("Charlie"); // original data order
});

test("sorting a numeric column compares numerically, not lexicographically", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} />);

  await user.click(screen.getByRole("button", { name: /Score/ }));

  expect(rowTexts()[0]).toContain("70"); // Bob, ascending
  expect(rowTexts()[2]).toContain("95"); // Alice, highest
});

test("sorting one column clears any previous column's sort", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} />);

  await user.click(screen.getByRole("button", { name: /Name/ }));
  await user.click(screen.getByRole("button", { name: /Score/ }));

  expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "none");
  expect(screen.getByRole("columnheader", { name: /Score/ })).toHaveAttribute("aria-sort", "ascending");
});

test("a numeric-aligned column right-aligns its header and cells", () => {
  render(<DataTable columns={columns} data={people} />);
  expect(screen.getByRole("columnheader", { name: /Score/ })).toHaveClass("text-right");
});

test("shows emptyMessage when there's no data, spanning every column", () => {
  render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here yet." />);
  const message = screen.getByText("Nothing here yet.");
  expect(message.closest("td")).toHaveAttribute("colspan", String(columns.length));
});

test("no pagination controls when pageSize is omitted", () => {
  render(<DataTable columns={columns} data={people} />);
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  expect(rowTexts()).toHaveLength(3);
});

test("no pagination controls when everything fits on one page", () => {
  render(<DataTable columns={columns} data={people} pageSize={10} />);
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

test("paginates data, with Previous disabled on the first page", async () => {
  const user = userEvent.setup();
  const manyPeople = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: "Engineer",
    score: i,
  }));
  render(<DataTable columns={columns} data={manyPeople} pageSize={5} getRowId={(row) => row.id} />);

  expect(rowTexts()).toHaveLength(5);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

  await user.click(screen.getByRole("button", { name: "2" }));
  expect(rowTexts()[0]).toContain("Person 6");

  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(rowTexts()).toHaveLength(2); // last page, 12 - 10 = 2 rows
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});
