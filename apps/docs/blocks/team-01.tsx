"use client";

import { useState } from "react";
import { MailPlus, MoreHorizontal, ShieldCheck, UserMinus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTriggerIcon,
  DataTable,
  type DataTableColumn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Input,
  toast,
  Toaster,
  useDialog,
} from "neelam-ui";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  status: "Active" | "Invited";
  avatar?: string;
  initials: string;
}

const members: Member[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@northstar.io", role: "Owner", status: "Active", avatar: "https://i.pravatar.cc/128?img=47", initials: "AL" },
  { id: 2, name: "Grace Hopper", email: "grace@northstar.io", role: "Admin", status: "Active", initials: "GH" },
  { id: 3, name: "Alan Turing", email: "alan@northstar.io", role: "Member", status: "Active", initials: "AT" },
  { id: 4, name: "Katherine Johnson", email: "katherine@northstar.io", role: "Member", status: "Active", initials: "KJ" },
  { id: 5, name: "Margaret Hamilton", email: "margaret@northstar.io", role: "Member", status: "Invited", initials: "MH" },
  { id: 6, name: "Radia Perlman", email: "radia@northstar.io", role: "Member", status: "Invited", initials: "RP" },
];

const columns: DataTableColumn<Member>[] = [
  {
    key: "name",
    header: "Member",
    sortable: true,
    cell: (row) => (
      <span className="flex items-center gap-3">
        <Avatar size="sm">
          {/* The name is right beside it, so the image is decorative. */}
          <AvatarImage src={row.avatar} alt="" />
          <AvatarFallback>{row.initials}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-slate-950 dark:text-white">
            {row.name}
          </span>
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">
            {row.email}
          </span>
        </span>
      </span>
    ),
    // The cell renders an avatar and two lines, so the filter is told which
    // text it should actually match against.
    filterValue: (row) => `${row.name} ${row.email}`,
  },
  { key: "role", header: "Role", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <Badge variant={row.status === "Active" ? "secondary" : "outline"}>
        {row.status}
      </Badge>
    ),
    filterValue: (row) => row.status,
  },
  {
    key: "id",
    header: <span className="sr-only">Actions</span>,
    align: "right",
    // An icon-only menu says nothing to a filter.
    filterValue: () => "",
    cell: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({ variant: "ghost", size: "sm" })}
          aria-label={`Actions for ${row.name}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{row.name}</DropdownMenuLabel>
          <DropdownMenuItem>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Change role
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            Resend invitation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserMinus className="h-4 w-4" aria-hidden="true" />
            Remove from team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const roles = ["Owner", "Admin", "Member", "Billing", "Read only"];

// `useDialog` lets a real Button drive the dialog's open state — something
// `DialogClose`, which is not a Button, cannot do.
function SendInviteButton() {
  const { onOpenChange } = useDialog();

  return (
    <Button
      onClick={() => {
        onOpenChange(false);
        toast({ title: "Invitation sent", variant: "success" });
      }}
    >
      Send invitation
    </Button>
  );
}

export default function Team01() {
  // Stands in for whatever a real page fetches — left empty here so the
  // block also shows what the section looks like with nothing in it.
  const [joinRequests] = useState<string[]>([]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Team
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {members.length} people have access to the Northstar workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AvatarGroup label="Team members" max={4} total={members.length}>
            {members.map((member) => (
              <Avatar key={member.id} size="sm">
                <AvatarImage src={member.avatar} alt="" />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>

          <Dialog>
            <DialogTrigger className={buttonVariants()}>Invite people</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Northstar</DialogTitle>
                <DialogDescription>
                  They will get an email with a link that expires in seven days.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                  Email address
                  <Input type="email" placeholder="teammate@northstar.io" />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-950 dark:text-white">
                  Role
                  <Combobox defaultValue="member">
                    <div className="relative">
                      <ComboboxInput placeholder="Search roles…" className="pr-8" />
                      <ComboboxTriggerIcon className="absolute top-1/2 right-3 -translate-y-1/2" />
                    </div>
                    <ComboboxContent>
                      {roles.map((role) => (
                        <ComboboxItem key={role} value={role.toLowerCase()}>
                          {role}
                        </ComboboxItem>
                      ))}
                      <ComboboxEmpty>No matching role.</ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                </label>
              </div>

              <DialogFooter>
                <SendInviteButton />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={members}
          getRowId={(row) => row.id}
          pageSize={5}
          filterable
          filterPlaceholder="Search members…"
          noMatchesMessage="Nobody here matches that search."
        />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
          Pending requests
        </h2>
        {joinRequests.length === 0 ? (
          <EmptyState
            className="mt-3"
            titleAs="h3"
            icon={<MailPlus className="h-5 w-5" />}
            title="No requests to review"
            description="When someone asks to join the workspace, their request waits here for an owner or admin to approve."
            action={<Button variant="outline">Manage join settings</Button>}
          />
        ) : null}
      </section>

      {/* In a real app this lives once, near the root of the tree. */}
      <Toaster position="bottom-right" />
    </div>
  );
}
