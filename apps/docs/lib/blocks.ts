import { components, type ComponentMeta } from "@/lib/nav";

export type BlockMeta = {
  /** File name under `blocks/`, and the URL segment under /blocks. */
  slug: string;
  title: string;
  description: string;
  category: string;
  /**
   * Exported names in `neelam-ui` the block is assembled from, listed in the
   * order they appear in the source. Rendered as links, so every name here
   * has to match a `ComponentMeta.name` in `lib/nav.ts`.
   */
  uses: string[];
  /**
   * Height of the preview frame on the index page. Blocks scroll inside it;
   * the full-width page renders them at their natural height instead.
   */
  height: string;
};

const b = (
  slug: string,
  title: string,
  description: string,
  category: string,
  uses: string[],
  height: string,
): BlockMeta => ({ slug, title, description, category, uses, height });

export const blocks: BlockMeta[] = [
  // Application
  b(
    "dashboard-01",
    "Analytics dashboard",
    "A full app shell: collapsible sidebar, a KPI row, a trend chart, and a sortable table of recent activity.",
    "Application",
    ["Sidebar", "StatCard", "Chart", "DataTable", "Badge", "Avatar", "DropdownMenu", "Button"],
    "46rem",
  ),
  b(
    "settings-01",
    "Account settings",
    "A tabbed settings page — profile fields, notification switches, a plan chooser, and a destructive action behind a confirmation.",
    "Application",
    ["Tabs", "Input", "Textarea", "Switch", "RadioGroup", "Select", "AlertDialog", "Separator", "Toast"],
    "44rem",
  ),
  b(
    "team-01",
    "Team members",
    "A members table with search, per-row role menus, an invite dialog, and an empty state for a team nobody has joined yet.",
    "Application",
    ["DataTable", "Dialog", "DropdownMenu", "Avatar", "AvatarGroup", "Badge", "Combobox", "EmptyState"],
    "42rem",
  ),

  // Authentication
  b(
    "login-01",
    "Sign in",
    "A centred sign-in card with provider buttons, a remembered-session checkbox, and inline field validation.",
    "Authentication",
    ["Card", "Input", "Checkbox", "Button", "Separator"],
    "40rem",
  ),
  b(
    "signup-01",
    "Split sign-up",
    "A two-column create-account screen: the form on one side, social proof and a feature list on the other.",
    "Authentication",
    ["Input", "Checkbox", "Button", "Avatar", "AvatarGroup", "Progress", "Separator"],
    "44rem",
  ),

  // Marketing
  b(
    "pricing-01",
    "Pricing tiers",
    "Three plans with a monthly/annual switch, a highlighted recommendation, and a per-plan feature list.",
    "Marketing",
    ["Card", "Switch", "Badge", "Button", "Tooltip", "Separator"],
    "44rem",
  ),
  b(
    "faq-01",
    "FAQ and contact",
    "An accordion of common questions beside a support card — the pattern most marketing pages close on.",
    "Marketing",
    ["Accordion", "Card", "Button", "Avatar", "AvatarGroup", "Badge"],
    "40rem",
  ),

  // AI & Chat
  b(
    "chat-01",
    "Assistant panel",
    "A working chat surface: conversation history, attachments, a typing indicator, and a composer that sends.",
    "AI & Chat",
    ["Message", "Bubble", "Composer", "TypingIndicator", "Attachment", "Avatar", "Badge", "Button"],
    "44rem",
  ),
];

export const blockCategoryOrder = [
  "Application",
  "Authentication",
  "Marketing",
  "AI & Chat",
] as const;

/** The one rendered in full on the home page; the rest are listed as cards. */
export const featuredBlockSlug = "dashboard-01";

export function getBlock(slug: string): BlockMeta | undefined {
  return blocks.find((block) => block.slug === slug);
}

/** Resolves a name in `uses` to the component it documents, if there is one. */
export function componentFor(name: string): ComponentMeta | undefined {
  return components.find((component) => component.name === name);
}
