import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Calendar, FileText, Search, Settings, Smile, User } from "lucide-react";
import { buttonVariants } from "../Button/Button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command";

const meta: Meta<typeof Command> = {
  title: "Components/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A searchable list of actions — a "command palette." `Command` is embeddable on its own; compose it with `CommandDialog` for the Cmd+K-style modal overlay. Compose it with `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, and `CommandEmpty`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  name: "Embedded directly in a page",
  render: () => (
    <Command className="w-80 border border-slate-200 dark:border-slate-800">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar" onSelect={(v) => alert(`Selected: ${v}`)}>
            Calendar
          </CommandItem>
          <CommandItem value="search-emoji" onSelect={(v) => alert(`Selected: ${v}`)}>
            Search Emoji
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem value="profile" onSelect={(v) => alert(`Selected: ${v}`)}>
            Profile
          </CommandItem>
          <CommandItem value="settings" onSelect={(v) => alert(`Selected: ${v}`)}>
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

// The Cmd+K-triggered overlay most people picture. Note the global keydown
// listener lives here, in the caller's own code — Command intentionally
// doesn't wire one up itself. See CommandDialog's own doc comment for why.
export const AsACommandPalette: Story = {
  name: "As a Cmd+K command palette",
  render: function Render() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          setOpen((current) => !current);
        }
      }
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    function runCommand(action: () => void) {
      setOpen(false);
      action();
    }

    return (
      <>
        <button onClick={() => setOpen(true)} className={buttonVariants({ variant: "outline" })}>
          <Search className="h-4 w-4" aria-hidden="true" />
          Search...
          <kbd className="ml-8 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem
                value="calendar"
                icon={<Calendar />}
                onSelect={() => runCommand(() => alert("Opening calendar"))}
              >
                Calendar
              </CommandItem>
              <CommandItem
                value="search-emoji"
                icon={<Smile />}
                onSelect={() => runCommand(() => alert("Searching emoji"))}
              >
                Search Emoji
              </CommandItem>
              <CommandItem
                value="documents"
                icon={<FileText />}
                onSelect={() => runCommand(() => alert("Opening documents"))}
              >
                Documents
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem value="profile" icon={<User />} onSelect={() => runCommand(() => alert("Opening profile"))}>
                Profile
              </CommandItem>
              <CommandItem
                value="settings"
                icon={<Settings />}
                onSelect={() => runCommand(() => alert("Opening settings"))}
              >
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};

// The same real-Chromium verification approach every native-<dialog>- or
// Popover-API-based component's "Interactive" story uses.
export const Interactive: Story = {
  // Starts pre-opened (below) purely so `play` can grab the dialog without
  // simulating a click first — fine for a story rendered on its own, but
  // the autodocs page renders every story in this file inline at once, and
  // `CommandDialog` is a real modal `<dialog>` whose backdrop covers the
  // *whole document*, not just its own preview box. Left in autodocs, this
  // story would pop up open over the entire docs page. `!autodocs` keeps
  // it fully runnable on its own and in the test runner, just out of that
  // aggregated view.
  tags: ["!autodocs"],
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="calendar">Calendar</CommandItem>
            <CommandItem value="search-emoji">Search Emoji</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem value="profile">Profile</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());

    expect(canvas.getAllByRole("option")).toHaveLength(3);

    const input = canvas.getByPlaceholderText("Type a command or search...");
    await userEvent.type(input, "emoji");
    await waitFor(() => expect(canvas.getAllByRole("option")).toHaveLength(1));
    expect(canvas.getByRole("option", { name: "Search Emoji" })).toBeInTheDocument();
    // The "Settings" group had nothing left matching "emoji" — its heading
    // shouldn't float over an empty group.
    expect(canvas.queryByText("Settings")).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "nothing matches this");
    await waitFor(() => expect(canvas.getByText("No results found.")).toBeInTheDocument());
  },
};
