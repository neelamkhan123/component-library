export type NavItem = {
  title: string;
  href: string;
  /** Set on components whose page still carries placeholder prose. */
  draft?: boolean;
  label?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type ComponentMeta = {
  /** Exported name in `@neelamkhan21/ui`, e.g. `AlertDialog`. */
  name: string;
  /** URL segment under /docs/components. */
  slug: string;
  title: string;
  description: string;
  group: string;
};

const c = (
  name: string,
  slug: string,
  title: string,
  description: string,
  group: string,
): ComponentMeta => ({ name, slug, title, description, group });

export const components: ComponentMeta[] = [
  // Layout
  c("AspectRatio", "aspect-ratio", "Aspect Ratio", "Constrains content to a fixed width-to-height ratio.", "Layout"),
  c("Card", "card", "Card", "A surface for grouping related content and actions.", "Layout"),
  c("Resizable", "resizable", "Resizable", "Panels a user can resize by dragging or with the keyboard.", "Layout"),
  c("Separator", "separator", "Separator", "A semantic or decorative divider between content.", "Layout"),
  c("Sidebar", "sidebar", "Sidebar", "A collapsible application navigation region.", "Layout"),

  // Forms
  c("Button", "button", "Button", "A versatile button with variants, sizes, icons, and a loading state.", "Forms"),
  c("Checkbox", "checkbox", "Checkbox", "A binary control supporting an indeterminate state.", "Forms"),
  c("Combobox", "combobox", "Combobox", "A text input paired with a filterable listbox, per the APG combobox pattern.", "Forms"),
  c("Input", "input", "Input", "A single-line text field with label, description, and error wiring.", "Forms"),
  c("RadioGroup", "radio-group", "Radio Group", "A set of mutually exclusive options with roving focus.", "Forms"),
  c("Select", "select", "Select", "A listbox for choosing one option from a list.", "Forms"),
  c("Switch", "switch", "Switch", "An on/off control for settings that apply immediately.", "Forms"),
  c("Textarea", "textarea", "Textarea", "A multi-line text field that can grow with its content.", "Forms"),
  c("Toggle", "toggle", "Toggle", "A two-state button that stays pressed.", "Forms"),

  // Navigation
  c("Breadcrumb", "breadcrumb", "Breadcrumb", "A trail showing the current page's place in the hierarchy.", "Navigation"),
  c("Command", "command", "Command", "A searchable command palette for fast keyboard navigation.", "Navigation"),
  c("ContextMenu", "context-menu", "Context Menu", "A menu opened by right-click or the context-menu key.", "Navigation"),
  c("DropdownMenu", "dropdown-menu", "Dropdown Menu", "A menu of actions triggered by a button.", "Navigation"),
  c("Pagination", "pagination", "Pagination", "Navigation across a paged set of results.", "Navigation"),
  c("Tabs", "tabs", "Tabs", "Switch between panels of related content.", "Navigation"),

  // Overlays
  c("AlertDialog", "alert-dialog", "Alert Dialog", "A modal that interrupts to confirm a destructive or irreversible action.", "Overlays"),
  c("Dialog", "dialog", "Dialog", "A modal window built on the native <dialog> element.", "Overlays"),
  c("Drawer", "drawer", "Drawer", "A panel that slides in from an edge of the screen.", "Overlays"),
  c("Popover", "popover", "Popover", "Rich floating content anchored to a trigger.", "Overlays"),
  c("Toast", "toast", "Toast", "Brief, non-blocking messages announced to assistive tech.", "Overlays"),
  c("Tooltip", "tooltip", "Tooltip", "A short label revealed on hover or focus.", "Overlays"),

  // Data display
  c("Accordion", "accordion", "Accordion", "Vertically stacked sections that expand and collapse.", "Data Display"),
  c("Avatar", "avatar", "Avatar", "A user image with a graceful initials fallback.", "Data Display"),
  c("AvatarGroup", "avatar-group", "Avatar Group", "Overlapping avatars with an overflow count.", "Data Display"),
  c("Badge", "badge", "Badge", "A small label for status, counts, or categories.", "Data Display"),
  c("Calendar", "calendar", "Calendar", "A date grid with full keyboard navigation.", "Data Display"),
  c("Carousel", "carousel", "Carousel", "A slideshow of content panels.", "Data Display"),
  c("Chart", "chart", "Chart", "An accessible shell around a plot you supply, with a data table fallback.", "Data Display"),
  c("DataTable", "data-table", "Data Table", "A sortable, filterable table over a set of rows.", "Data Display"),
  c("DateRangePicker", "date-range-picker", "Date Range Picker", "Two linked calendars plus presets for choosing a range.", "Data Display"),
  c("EmptyState", "empty-state", "Empty State", "A placeholder for when there is nothing to show yet.", "Data Display"),
  c("Progress", "progress", "Progress", "A determinate or indeterminate progress indicator.", "Data Display"),
  c("Skeleton", "skeleton", "Skeleton", "A shimmering placeholder shown while content loads.", "Data Display"),
  c("Sparkline", "sparkline", "Sparkline", "A compact inline trend line.", "Data Display"),
  c("StatCard", "stat-card", "Stat Card", "A single headline metric with supporting context.", "Data Display"),
  c("Table", "table", "Table", "A styled semantic table.", "Data Display"),

  // AI & chat
  c("Attachment", "attachment", "Attachment", "A file chip shown alongside a message or composer.", "AI & Chat"),
  c("Bubble", "bubble", "Bubble", "A single chat bubble for a user or assistant turn.", "AI & Chat"),
  c("Composer", "composer", "Composer", "A message input with attachments and a send action.", "AI & Chat"),
  c("Message", "message", "Message", "A full chat turn: author, content, and actions.", "AI & Chat"),
  c("TypingIndicator", "typing-indicator", "Typing Indicator", "An animated hint that a reply is being generated.", "AI & Chat"),
];

export const componentGroupOrder = [
  "Forms",
  "Overlays",
  "Navigation",
  "Data Display",
  "Layout",
  "AI & Chat",
] as const;

/** Component pages with hand-written prose. Everything else renders a stub notice. */
export const documented = new Set([
  "button",
  "dialog",
  "combobox",
  "data-table",
  "toast",
]);

export const gettingStarted: NavGroup = {
  title: "Getting Started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Theming", href: "/docs/theming" },
    { title: "Dark Mode", href: "/docs/dark-mode" },
    { title: "Accessibility", href: "/docs/accessibility" },
    { title: "Changelog", href: "/docs/changelog" },
  ],
};

export const sidebarNav: NavGroup[] = [
  gettingStarted,
  ...componentGroupOrder.map((group) => ({
    title: group,
    items: components
      .filter((component) => component.group === group)
      .map((component) => ({
        title: component.title,
        href: `/docs/components/${component.slug}`,
        draft: !documented.has(component.slug),
      })),
  })),
];

/** Flat, in-sidebar-order list used by the previous/next pager. */
export const flatNav: NavItem[] = sidebarNav.flatMap((group) => group.items);

export function getComponent(slug: string): ComponentMeta | undefined {
  return components.find((component) => component.slug === slug);
}
