import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
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

expect.extend(toHaveNoViolations);

function FullAlertDialog(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <AlertDialog defaultOpen onOpenChange={props.onOpenChange}>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
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
  );
}

test("AlertDialog renders with no accessibility violations", async () => {
  const { container } = render(<FullAlertDialog />);
  await waitFor(() => expect(screen.getByRole("alertdialog")).toBeVisible());
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("renders role=alertdialog, not the plain dialog role", () => {
  render(<FullAlertDialog />);
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("AlertDialogTrigger opens a closed alert dialog", async () => {
  const user = userEvent.setup();
  render(
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete this?</AlertDialogTitle>
      </AlertDialogContent>
    </AlertDialog>,
  );
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(await screen.findByRole("alertdialog")).toBeVisible();
});

test("clicking the backdrop does nothing — unlike Dialog, there is no closeOnOutsideClick opt-in", async () => {
  render(<FullAlertDialog />);
  const dialog = await screen.findByRole("alertdialog");
  await waitFor(() => expect(dialog).toBeVisible());

  fireEvent.click(dialog);
  expect(screen.getByRole("alertdialog")).toBeVisible();
});

test("there is no built-in corner close button", () => {
  render(<FullAlertDialog />);
  expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
});

test("AlertDialogCancel closes the dialog and reports the change", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullAlertDialog onOpenChange={onOpenChange} />);

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("AlertDialogAction closes the dialog and reports the change", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullAlertDialog onOpenChange={onOpenChange} />);

  await user.click(screen.getByRole("button", { name: "Delete account" }));

  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("AlertDialogAction defaults to the default Button variant; AlertDialogCancel defaults to outline", () => {
  render(<FullAlertDialog />);
  // "Delete account" here is explicitly variant="destructive" in FullAlertDialog.
  expect(screen.getByRole("button", { name: "Delete account" })).toHaveClass("bg-red-50");
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("bg-white");
});

test("a custom onClick can prevent the default close", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(
    <AlertDialog defaultOpen onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Confirm</AlertDialogTitle>
        <AlertDialogAction onClick={(event) => event.preventDefault()}>Confirm</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  );

  await user.click(screen.getByRole("button", { name: "Confirm" }));
  expect(screen.getByRole("alertdialog")).toBeVisible();
  expect(onOpenChange).not.toHaveBeenCalled();
});

test("AlertDialogContent forwards its ref to the underlying dialog element", () => {
  const contentRef = createRef<HTMLDialogElement>();
  render(
    <AlertDialog defaultOpen>
      <AlertDialogContent ref={contentRef}>
        <AlertDialogTitle>Confirm</AlertDialogTitle>
      </AlertDialogContent>
    </AlertDialog>,
  );
  expect(contentRef.current).toBeInstanceOf(HTMLDialogElement);
});
