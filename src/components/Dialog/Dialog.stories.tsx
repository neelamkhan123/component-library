import type { Meta, StoryObj } from "@storybook/react";
import { Button, buttonVariants } from "../Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from "./Dialog";

// Demonstrates `useDialog`, for wiring a custom control (here, a `Button`
// rather than `DialogClose`) up to the dialog's open state.
function SaveChangesButton() {
  const { onOpenChange } = useDialog();
  return <Button onClick={() => onOpenChange(false)}>Save changes</Button>;
}

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A modal window layered over the page. Compose it with `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, and `DialogClose`. Built on the native `<dialog>` element, so focus trapping and Escape-to-close come from the browser.",
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
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
        Edit profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </DialogClose>
          <SaveChangesButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "destructive" })}>
        Delete account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </DialogClose>
          <Button variant="destructive">Delete account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
        View notifications
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You have 3 unread messages.
        </p>
      </DialogContent>
    </Dialog>
  ),
};
