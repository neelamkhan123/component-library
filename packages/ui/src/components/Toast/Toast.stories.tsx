import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { buttonVariants } from "../Button/Button";
import { toast, Toaster } from "./Toast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A notification shown briefly at the edge of the screen. Unlike every other component here, it\'s triggered imperatively: call `toast("message")` (or `toast({ title, description, variant, action })`) from anywhere — a click handler, an async callback — and it renders into whichever `<Toaster />` is mounted, typically once near your app\'s root. `Toaster` accepts a `position` prop (`"top-left"`, `"top-center"`, `"top-right"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"` — defaults to `"bottom-right"`).',
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
  },
  args: {
    position: "bottom-right",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-56 items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: (args) => (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline" })}
        onClick={() => toast("Saved successfully")}
      >
        Show toast
      </button>
      <Toaster {...args} />
    </>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline" })}
        onClick={() =>
          toast({
            title: "Event created",
            description: "Monday, January 3rd at 6:00pm.",
          })
        }
      >
        Show toast
      </button>
      <Toaster {...args} />
    </>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonVariants({ variant: "outline" })}
          onClick={() => toast({ title: "Draft saved" })}
        >
          Default
        </button>
        <button
          type="button"
          className={buttonVariants({ variant: "outline" })}
          onClick={() =>
            toast({ title: "Upload failed", description: "Check your connection and try again.", variant: "destructive" })
          }
        >
          Destructive
        </button>
        <button
          type="button"
          className={buttonVariants({ variant: "outline" })}
          onClick={() => toast({ title: "Changes published", variant: "success" })}
        >
          Success
        </button>
      </div>
      <Toaster {...args} />
    </>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline" })}
        onClick={() =>
          toast({
            title: "Conversation archived",
            action: { label: "Undo", onClick: () => toast("Restored") },
          })
        }
      >
        Show toast
      </button>
      <Toaster {...args} />
    </>
  ),
};

// Demonstrates updating a toast in place by reusing its id — a "Loading…"
// toast that becomes "Done!" without stacking a second notification.
export const UpdatingInPlace: Story = {
  render: (args) => (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline" })}
        onClick={() => {
          const id = toast({ title: "Uploading…", duration: Number.POSITIVE_INFINITY });
          setTimeout(() => {
            toast({ id, title: "Uploaded!", variant: "success", duration: 3000 });
          }, 1500);
        }}
      >
        Upload file
      </button>
      <Toaster {...args} />
    </>
  ),
};

// Exercises the store → portal → render → dismiss flow against real
// Chromium via `@storybook/addon-vitest`'s play functions, the same
// reasoning as this library's other "Interactive" stories.
export const Interactive: Story = {
  render: (args) => (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline" })}
        onClick={() => toast({ title: "Saved successfully", duration: Number.POSITIVE_INFINITY })}
      >
        Show toast
      </button>
      <Toaster {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));

    // The toast portals to document.body, outside canvasElement, so it's
    // queried from the document rather than the local canvas.
    const body = within(document.body);
    const toastEl = await body.findByRole("status");
    await waitFor(() => expect(toastEl).toHaveTextContent("Saved successfully"));

    await userEvent.click(body.getByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(body.queryByRole("status")).toBeNull());
  },
};
