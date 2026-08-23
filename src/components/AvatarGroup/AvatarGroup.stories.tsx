import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";

const meta: Meta<typeof AvatarGroup> = {
  title: "Components/Avatar Group",
  component: AvatarGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A stack of overlapping `Avatar`s. Every avatar's box is reserved before any image loads, so the group's width is settled at first paint and doesn't reflow as images arrive.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const teamMembers = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Barbara Liskov", "Tim Berners-Lee"];

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("");
}

function avatars(names: string[]) {
  return names.map((name) => (
    <Avatar key={name}>
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  ));
}

export const Default: Story = {
  args: { label: "Team members", children: avatars(teamMembers.slice(0, 4)) },
};

export const WithOverflow: Story = {
  name: "Capped with an overflow count",
  args: { label: "Team members", max: 4, children: avatars(teamMembers) },
};

export const KnownTotal: Story = {
  name: "Counting against a known total",
  args: { label: "Team members", max: 3, total: 128, children: avatars(teamMembers.slice(0, 3)) },
  parameters: {
    docs: {
      description: {
        story:
          "When `children` is only the first few of a much larger set, `total` drives the counter — so you don't have to render 128 avatars to say there are 128.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <AvatarGroup key={size} label={`Team members (${size})`} size={size} max={4}>
          {avatars(teamMembers)}
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const WithImages: Story = {
  name: "With images (and fallbacks while they load)",
  render: () => (
    <AvatarGroup label="Team members" max={4}>
      {teamMembers.map((name, index) => (
        <Avatar key={name}>
          <AvatarImage src={`https://i.pravatar.cc/80?img=${index + 10}`} alt={name} />
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The fallbacks fill the same fixed boxes the images will, so nothing on the page moves when they resolve — or if they never do.",
      },
    },
  },
};

export const InATableRow: Story = {
  name: "In a table row",
  render: () => (
    <table className="w-full text-sm">
      <caption className="sr-only">Projects and their members</caption>
      <tbody>
        {[
          { project: "Design system", people: teamMembers.slice(0, 5), total: 42 },
          { project: "Mobile app", people: teamMembers.slice(2, 5), total: 3 },
        ].map((row) => (
          <tr key={row.project} className="border-b border-slate-200 dark:border-slate-800">
            <td className="py-2 pr-4">{row.project}</td>
            <td className="py-2">
              <AvatarGroup label={`Members of ${row.project}`} size="sm" max={3} total={row.total}>
                {avatars(row.people)}
              </AvatarGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
