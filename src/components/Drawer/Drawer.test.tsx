import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
// The per-side layout assertions depend on real computed styles, so this
// file owns its own Tailwind import rather than relying on it being
// injected by whatever else happens to be in the test run.
import "../../styles.css";
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

expect.extend(toHaveNoViolations);

function FullDrawer(props: {
  side?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Drawer defaultOpen onOpenChange={props.onOpenChange}>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent side={props.side}>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Make changes to your profile.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

test("Drawer renders with no accessibility violations", async () => {
  const { container } = render(<FullDrawer />);
  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("DrawerTrigger opens a closed drawer", async () => {
  const user = userEvent.setup();
  render(
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Settings</DrawerTitle>
      </DrawerContent>
    </Drawer>,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog")).toBeVisible();
});

test("DrawerTitle supplies the drawer's accessible name", async () => {
  render(<FullDrawer />);
  await waitFor(() =>
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeVisible(),
  );
});

test("DrawerClose closes the drawer and reports the change", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullDrawer onOpenChange={onOpenChange} />);

  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false),
  );
});

test("clicking the backdrop closes the drawer", async () => {
  const onOpenChange = vi.fn();
  render(<FullDrawer onOpenChange={onOpenChange} />);

  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  fireEvent.click(dialog);

  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false),
  );
});

test.each([["top"], ["right"], ["bottom"], ["left"]] as const)(
  "side=%s pins the panel flush against that edge of the viewport",
  async (side) => {
    render(<FullDrawer side={side} />);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeVisible());

    // The slide-in transition is still running for a moment after the
    // dialog becomes visible, so poll the rect until it settles rather than
    // reading it once.
    await waitFor(() => {
      const rect = dialog.getBoundingClientRect();
      if (side === "top") expect(rect.top).toBeCloseTo(0, 0);
      if (side === "bottom")
        expect(rect.bottom).toBeCloseTo(window.innerHeight, 0);
      if (side === "left") expect(rect.left).toBeCloseTo(0, 0);
      if (side === "right")
        expect(rect.right).toBeCloseTo(window.innerWidth, 0);
    });
  },
);

test("DrawerContent merges a custom className with its defaults", async () => {
  render(
    <Drawer defaultOpen>
      <DrawerContent className="custom-content">
        <DrawerTitle>Settings</DrawerTitle>
      </DrawerContent>
    </Drawer>,
  );

  await waitFor(() =>
    expect(screen.getByRole("dialog")).toHaveClass("custom-content", "fixed"),
  );
});

test("DrawerContent forwards its ref to the underlying dialog element", async () => {
  const contentRef = createRef<HTMLDialogElement>();
  render(
    <Drawer defaultOpen>
      <DrawerContent ref={contentRef}>
        <DrawerTitle>Settings</DrawerTitle>
      </DrawerContent>
    </Drawer>,
  );

  await waitFor(() =>
    expect(contentRef.current).toBeInstanceOf(HTMLDialogElement),
  );
});
