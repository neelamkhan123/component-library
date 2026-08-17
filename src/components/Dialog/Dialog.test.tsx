import { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

expect.extend(toHaveNoViolations);

function FullDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog defaultOpen onOpenChange={props.onOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

test("Dialog renders with no accessibility violations", async () => {
  const { container } = render(<FullDialog />);
  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("DialogTrigger opens a closed dialog", async () => {
  const user = userEvent.setup();
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog")).toBeVisible();
});

test("DialogTitle supplies the dialog's accessible name", async () => {
  render(<FullDialog />);
  await waitFor(() =>
    expect(
      screen.getByRole("dialog", { name: "Delete project" }),
    ).toBeVisible(),
  );
});

test("DialogClose closes the dialog and reports the change", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullDialog onOpenChange={onOpenChange} />);

  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
});

test("clicking the backdrop closes the dialog", async () => {
  const onOpenChange = vi.fn();
  render(<FullDialog onOpenChange={onOpenChange} />);

  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  fireEvent.click(dialog);

  // The native `close` event (which our onOpenChange sync relies on) fires
  // on a queued task per spec, not synchronously with close() — so both the
  // removal and the callback need to be awaited rather than asserted right
  // after the click.
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false),
  );
});

test("closeOnOutsideClick={false} keeps the dialog open on a backdrop click", async () => {
  render(
    <Dialog defaultOpen>
      <DialogContent closeOnOutsideClick={false}>
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(dialog).toBeVisible());
  fireEvent.click(dialog);
  expect(screen.getByRole("dialog")).toBeVisible();
});

test("hideCloseButton omits the built-in close button", async () => {
  render(
    <Dialog defaultOpen>
      <DialogContent hideCloseButton>
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  expect(
    screen.queryByRole("button", { name: "Close" }),
  ).not.toBeInTheDocument();
});

test("Dialog supports fully controlled open state", async () => {
  const user = userEvent.setup();

  function Controlled() {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  render(<Controlled />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog")).toBeVisible();
});

test("DialogContent merges a custom className with its defaults", async () => {
  render(
    <Dialog defaultOpen>
      <DialogContent className="custom-content">
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

  await waitFor(() =>
    expect(screen.getByRole("dialog")).toHaveClass(
      "custom-content",
      "rounded-xl",
    ),
  );
});

test("DialogContent forwards its ref to the underlying dialog element", async () => {
  const contentRef = createRef<HTMLDialogElement>();
  render(
    <Dialog defaultOpen>
      <DialogContent ref={contentRef}>
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

  await waitFor(() =>
    expect(contentRef.current).toBeInstanceOf(HTMLDialogElement),
  );
});
