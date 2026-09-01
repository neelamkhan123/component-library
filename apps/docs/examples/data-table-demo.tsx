"use client";

import { Badge, DataTable, type DataTableColumn } from "neelam-ui";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  score: number;
}

const people: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "Engineer", score: 98 },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "Engineer", score: 95 },
  { id: 3, name: "Alan Turing", email: "alan@example.com", role: "Researcher", score: 99 },
  { id: 4, name: "Katherine Johnson", email: "katherine@example.com", role: "Mathematician", score: 97 },
  { id: 5, name: "Margaret Hamilton", email: "margaret@example.com", role: "Engineer", score: 96 },
  { id: 6, name: "Barbara Liskov", email: "barbara@example.com", role: "Researcher", score: 94 },
  { id: 7, name: "Radia Perlman", email: "radia@example.com", role: "Engineer", score: 93 },
];

const columns: DataTableColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  {
    key: "role",
    header: "Role",
    sortable: true,
    cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
    // The cell renders a Badge, so the raw string has to be given separately
    // for the filter box to match against it.
    filterValue: (row) => row.role,
  },
  { key: "score", header: "Score", sortable: true, align: "right" },
];

export default function DataTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={people}
      getRowId={(row) => row.id}
      pageSize={5}
      filterable
      filterPlaceholder="Filter people…"
    />
  );
}
