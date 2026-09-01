"use client";

import { Calendar, Settings, Smile, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "neelam-ui";

export default function CommandDemo() {
  return (
    <Command className="w-full max-w-sm">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandGroup heading="Suggestions">
          <CommandItem
            value="calendar"
            icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
          >
            Calendar
          </CommandItem>
          <CommandItem
            value="emoji"
            icon={<Smile className="h-4 w-4" aria-hidden="true" />}
          >
            Search emoji
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem
            value="profile"
            icon={<User className="h-4 w-4" aria-hidden="true" />}
          >
            Profile
          </CommandItem>
          <CommandItem
            value="preferences"
            icon={<Settings className="h-4 w-4" aria-hidden="true" />}
          >
            Preferences
          </CommandItem>
        </CommandGroup>
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </Command>
  );
}
