import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { buttonVariants } from "../Button/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./AlertDialog";

const meta: Meta<typeof AlertDialog> = {
  title: "Components/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A confirmation dialog that isn't dismissible by accident — no backdrop click, no Escape, no corner close button. Compose it with `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, and `AlertDialogAction`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>Log out</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>You'll need to sign back in to access your account.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Log out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Destructive: Story = {
  name: "A destructive confirmation",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

// The same real-Chromium verification approach every other native-<dialog>-
// or Popover-API-based component's "Interactive" story uses.
export const Interactive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Delete account" });

    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("alertdialog");
    await waitFor(() => expect(dialog).toBeVisible());

    // Escape does nothing — the one behavior that actually distinguishes
    // this from a plain Dialog, and specifically needs real Chromium to
    // verify: jsdom's <dialog> polyfill (see vitest.setup.ts) only covers
    // showModal()/close(), not real keyboard-triggered Escape/`cancel`
    // dispatch, so this can't be exercised in the jsdom unit tests the way
    // the backdrop-click case below is (see AlertDialog.test.tsx).
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(canvas.getByRole("alertdialog")).toBeVisible();

    // Only an explicit choice closes it.
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(canvas.queryByRole("alertdialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
