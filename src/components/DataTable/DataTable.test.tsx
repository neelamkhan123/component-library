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

test("filterable DataTable renders with no accessibility violations", async () => {
  const { container } = render(<DataTable columns={columns} data={people} filterable />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("shows no filter box unless asked", () => {
  render(<DataTable columns={columns} data={people} />);
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
});

test("labels the filter box even though the label isn't drawn", () => {
  render(<DataTable columns={columns} data={people} filterable />);
  expect(screen.getByRole("searchbox", { name: "Filter rows" })).toBeInTheDocument();
});

test("filters rows across every column", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  // Matches a `name`...
  await user.type(screen.getByRole("searchbox"), "ali");
  expect(rowTexts()).toHaveLength(1);
  expect(rowTexts()[0]).toContain("Alice");

  // ...and a `role`, which no column was told about specially.
  await user.clear(screen.getByRole("searchbox"));
  await user.type(screen.getByRole("searchbox"), "Engineer");
  expect(rowTexts()).toHaveLength(2);
});

test("filters case-insensitively and ignores surrounding whitespace", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  await user.type(screen.getByRole("searchbox"), "  DESIGNER  ");
  expect(rowTexts()).toHaveLength(1);
  expect(rowTexts()[0]).toContain("Alice");
});

test("uses a column's filterValue in place of its raw value", async () => {
  const user = userEvent.setup();
  const withFilterValue: DataTableColumn<Person>[] = [
    { key: "name", header: "Name", cell: () => "—", filterValue: (row) => `${row.name} ${row.role}` },
    { key: "score", header: "Score" },
  ];
  render(<DataTable columns={withFilterValue} data={people} filterable />);

  // "Designer" is nowhere in the rendered cells, only in the filter text.
  await user.type(screen.getByRole("searchbox"), "Designer");
  expect(rowTexts()).toHaveLength(1);
});

test("a column opting out of filtering contributes nothing to matches", async () => {
  const user = userEvent.setup();
  const optedOut: DataTableColumn<Person>[] = [
    { key: "name", header: "Name" },
    { key: "role", header: "Role", filterValue: () => "" },
  ];
  render(<DataTable columns={optedOut} data={people} filterable />);

  await user.type(screen.getByRole("searchbox"), "Engineer");
  expect(screen.getByText("No rows match your filter.")).toBeVisible();
});

test("announces the match count politely while filtering", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  // Silent before anything is typed, so it says nothing on first paint.
  expect(screen.getByRole("status")).toHaveTextContent("");

  await user.type(screen.getByRole("searchbox"), "Engineer");
  expect(screen.getByRole("status")).toHaveTextContent("2 rows match Engineer");

  await user.type(screen.getByRole("searchbox"), "x");
  expect(screen.getByRole("status")).toHaveTextContent("0 rows match Engineerx");
});

test("uses the singular in the announcement for exactly one match", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  await user.type(screen.getByRole("searchbox"), "Alice");
  expect(screen.getByRole("status")).toHaveTextContent("1 row match");
});

test("distinguishes a filtered-to-nothing table from an empty one", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DataTable columns={columns} data={[]} filterable />);
  expect(screen.getByText("No results.")).toBeVisible();

  rerender(<DataTable columns={columns} data={people} filterable />);
  await user.type(screen.getByRole("searchbox"), "nobody");
  expect(screen.getByText("No rows match your filter.")).toBeVisible();
});

test("filters before sorting, so sort order describes the visible rows", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  await user.click(screen.getByRole("button", { name: /Name/ }));
  await user.type(screen.getByRole("searchbox"), "Engineer");

  expect(rowTexts()[0]).toContain("Bob");
  expect(rowTexts()[1]).toContain("Charlie");
});

test("filters before paginating, so the page count follows the matches", async () => {
  const user = userEvent.setup();
  const manyPeople = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: i < 3 ? "Designer" : "Engineer",
    score: i,
  }));
  render(<DataTable columns={columns} data={manyPeople} pageSize={5} filterable getRowId={(row) => row.id} />);

  expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();

  await user.type(screen.getByRole("searchbox"), "Designer");
  expect(rowTexts()).toHaveLength(3);
  // Three matches fit on one page, so the pager goes away entirely.
  expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
});

test("returns to the first page when the filter changes", async () => {
  const user = userEvent.setup();
  const manyPeople = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: "Engineer",
    score: i,
  }));
  render(<DataTable columns={columns} data={manyPeople} pageSize={5} filterable getRowId={(row) => row.id} />);

  await user.click(screen.getByRole("button", { name: "3" }));
  expect(rowTexts()[0]).toContain("Person 11");

  // Without the reset this would sit on a page past the end of the matches.
  await user.type(screen.getByRole("searchbox"), "Person 1");
  expect(rowTexts()[0]).toContain("Person 1");
});

test("keeps sorting available while filtered", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={people} filterable />);

  await user.type(screen.getByRole("searchbox"), "Engineer");
  const nameHeader = screen.getAllByRole("columnheader")[0];
  await user.click(within(nameHeader).getByRole("button"));

  expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  expect(rowTexts()[0]).toContain("Bob");
});
