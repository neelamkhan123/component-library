import type { Meta, StoryObj } from "@storybook/react";
import { buttonVariants } from "../Button/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A panel that slides in from an edge of the screen. Compose it with `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, and `DrawerClose`. `DrawerContent` takes a `side` prop (`"top"`, `"right"`, `"bottom"`, `"left"`) choosing which edge it slides in from. Built on the same native `<dialog>` foundation as `Dialog`.',
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
type Story = StoryObj<typeof Drawer>;

export const Top: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
        Open from top
      </DrawerTrigger>
      <DrawerContent side="top">
        <DrawerHeader>
          <DrawerTitle>Announcement</DrawerTitle>
          <DrawerDescription>Scheduled maintenance starts at 10 PM tonight.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
};

export const Right: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
        Open from right
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Left: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
        Open from left
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to a section of the app.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
        Open from bottom
      </DrawerTrigger>
      <DrawerContent side="bottom">
        <DrawerHeader>
          <DrawerTitle>Cookie preferences</DrawerTitle>
          <DrawerDescription>
            We use cookies to improve your experience.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose className={buttonVariants({ variant: "outline" })}>
            Decline
          </DrawerClose>
          <DrawerClose className={buttonVariants({ variant: "default" })}>
            Accept
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
