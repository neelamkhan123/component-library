import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { DataTable, type DataTableColumn } from "./DataTable";

const meta: Meta<typeof DataTable> = {
  title: "Components/Data Table",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A sortable, optionally filterable and paginated table driven by a `columns`/`data` pair. Built on `Table`, `Pagination`, and `Input`. Filtering runs before sorting and pagination, so page counts and sort order describe the rows actually on screen, and match counts are announced through a live region. Still deliberately scoped — see `DECISIONS.md` for what's intentionally left out (row selection, column resizing, server-side data).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  score: number;
}

const people: Person[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Engineer",
    score: 98,
  },
  {
    id: 2,
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Engineer",
    score: 95,
  },
  {
    id: 3,
    name: "Alan Turing",
    email: "alan@example.com",
    role: "Researcher",
    score: 99,
  },
  {
    id: 4,
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Mathematician",
    score: 97,
  },
  {
    id: 5,
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "Engineer",
    score: 96,
  },
];

const columns: DataTableColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", sortable: true },
  { key: "score", header: "Score", sortable: true, align: "right" },
];

export const Default: Story = {
  render: () => (
    <DataTable columns={columns} data={people} getRowId={(row) => row.id} />
  ),
};

export const CustomCell: Story = {
  render: () => (
    <DataTable
      columns={[
        { key: "name", header: "Name", sortable: true },
        {
          key: "email",
          header: "Email",
          cell: (row) => (
            <a
              href={`mailto:${row.email}`}
              className="text-slate-950 underline dark:text-white"
            >
              {row.email}
            </a>
          ),
        },
        { key: "role", header: "Role", sortable: true },
      ]}
      data={people}
      getRowId={(row) => row.id}
    />
  ),
};

const manyPeople: Person[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  email: `person${index + 1}@example.com`,
  role:
    index % 3 === 0 ? "Engineer" : index % 3 === 1 ? "Designer" : "Researcher",
  score: 100 - index,
}));

export const Paginated: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={manyPeople}
      getRowId={(row) => row.id}
      pageSize={5}
    />
  ),
};

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
};

// Exercises this component's own logic — the sort cycle and page
// navigation, both driven by clicks — against real Chromium via
// `@storybook/addon-vitest`'s play functions, the same reasoning as this
// library's other "Interactive" stories.
export const Interactive: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={manyPeople}
      getRowId={(row) => row.id}
      pageSize={5}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameHeader = canvas.getByRole("columnheader", { name: /Name/ });
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    // First page, unsorted: "Person 1" through "Person 5".
    const firstCellText = () => canvas.getAllByRole("row")[1].textContent ?? "";
    expect(firstCellText()).toContain("Person 1");

    // Ascending sort by name — alphabetically, "Person 1" sorts before
    // "Person 10", so the first row changes even though "Person 1" itself
    // doesn't move off the page.
    await userEvent.click(canvas.getByRole("button", { name: /Name/ }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(firstCellText()).toContain("Person 1");

    // Descending — "Person 9" sorts last alphabetically among "Person N".
    await userEvent.click(canvas.getByRole("button", { name: /Name/ }));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(firstCellText()).toContain("Person 9");

    // Unsorted again — back to insertion order.
    await userEvent.click(canvas.getByRole("button", { name: /Name/ }));
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    expect(firstCellText()).toContain("Person 1");

    // Page navigation.
    await userEvent.click(canvas.getByRole("button", { name: "2" }));
    expect(firstCellText()).toContain("Person 6");
  },
};

export const Filterable: Story = {
  name: "Filterable",
  args: {
    columns,
    data: people,
    filterable: true,
  },
};

export const FilterableAndPaginated: Story = {
  name: "Filtered, sorted, and paginated together",
  args: {
    columns,
    data: Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      role: i % 3 === 0 ? "Designer" : "Engineer",
      score: 60 + ((i * 7) % 40),
    })),
    filterable: true,
    pageSize: 6,
    getRowId: (row: Person) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filtering happens first, so the pager reflects the matches rather than the full data set, and the page resets to 1 whenever the filter changes — otherwise a narrowed result set would leave you stranded on an empty page 4 of 2.",
      },
    },
  },
};

export const FilteredToNothing: Story = {
  name: "A filter matching nothing",
  args: {
    columns,
    data: people,
    filterable: true,
    noMatchesMessage: "No people match your filter.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox"), "nobody");
    await expect(canvas.getByText("No people match your filter.")).toBeVisible();
    // Distinct from the "no data at all" message, and announced politely.
    await expect(canvas.getByRole("status")).toHaveTextContent("0 rows match nobody");
  },
};
