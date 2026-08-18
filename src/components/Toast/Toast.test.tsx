import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, expect, test, vi } from "vitest";
import { toast, Toaster } from "./Toast";

expect.extend(toHaveNoViolations);

// `toast()`'s store is module-level, not React state (see Toast.tsx for
// why), so it isn't reset between tests just by unmounting a component the
// way component-scoped state would be. Every toast below that isn't
// specifically testing dismissal timing uses `duration: Infinity`, so it
// never schedules a real background timer that could fire mid-way through
// a later test — the handful of tests that *do* test timing switch to
// `vi.useFakeTimers()` themselves and fully flush what they scheduled
// before finishing, rather than a blanket fake-timers setup for the whole
// file (axe's own internals need real timers to resolve, so mixing modes
// file-wide caused exactly the cross-test leakage this avoids).
afterEach(() => {
  cleanup();
  vi.useFakeTimers();
  act(() => {
    toast.dismiss();
    vi.advanceTimersByTime(1000);
  });
  vi.useRealTimers();
});

test("Toaster renders nothing until a toast is shown", () => {
  render(<Toaster />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("toast() shows a toast with the given title", () => {
  render(<Toaster />);
  act(() => {
    toast({ title: "Saved successfully", duration: Number.POSITIVE_INFINITY });
  });
  expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");
});

test("a toast with no accessibility violations", async () => {
  render(<Toaster />);
  act(() => {
    toast({
      title: "Saved successfully",
      description: "Your changes are live.",
      duration: Number.POSITIVE_INFINITY,
    });
  });
  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});

test("shows a description alongside the title", () => {
  render(<Toaster />);
  act(() => {
    toast({ title: "Event created", description: "Monday at 6pm.", duration: Number.POSITIVE_INFINITY });
  });
  expect(screen.getByText("Event created")).toBeInTheDocument();
  expect(screen.getByText("Monday at 6pm.")).toBeInTheDocument();
});

test("variant=destructive uses role=alert; other variants use role=status", () => {
  render(<Toaster />);
  act(() => {
    toast({ id: "a", title: "Oops", variant: "destructive", duration: Number.POSITIVE_INFINITY });
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Oops");

  act(() => {
    toast({ id: "b", title: "Nice", variant: "success", duration: Number.POSITIVE_INFINITY });
  });
  expect(screen.getByRole("status")).toHaveTextContent("Nice");
});

test("auto-dismisses after its duration, animating out first", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ title: "Bye soon", duration: 1000 });
  });
  expect(screen.getByRole("status")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  // Still present but marked closing, mid-exit-transition.
  expect(screen.getByRole("status")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("duration: Infinity never auto-dismisses", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ title: "Stays put", duration: Number.POSITIVE_INFINITY });
  });

  act(() => {
    vi.advanceTimersByTime(1_000_000);
  });
  expect(screen.getByRole("status")).toBeInTheDocument();
  vi.useRealTimers();
});

test("hovering pauses the auto-dismiss timer", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ title: "Hover me", duration: 1000 });
  });
  const toastEl = screen.getByRole("status");

  act(() => {
    vi.advanceTimersByTime(500);
  });
  fireEvent.mouseEnter(toastEl);
  act(() => {
    vi.advanceTimersByTime(1000); // would have elapsed the original duration
  });
  expect(screen.getByRole("status")).toBeInTheDocument();

  fireEvent.mouseLeave(toastEl);
  act(() => {
    vi.advanceTimersByTime(1000 + 200);
  });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("clicking the dismiss button removes the toast", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ title: "Dismiss me", duration: Number.POSITIVE_INFINITY });
  });

  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  });
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("clicking the action button calls its onClick and dismisses the toast", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  const onClick = vi.fn();
  act(() => {
    toast({
      title: "Archived",
      duration: Number.POSITIVE_INFINITY,
      action: { label: "Undo", onClick },
    });
  });

  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  });
  expect(onClick).toHaveBeenCalledOnce();

  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("reusing an id updates the toast in place instead of stacking a new one", () => {
  render(<Toaster />);
  act(() => {
    toast({ id: "upload", title: "Uploading…", duration: Number.POSITIVE_INFINITY });
  });
  expect(screen.getAllByRole("status")).toHaveLength(1);

  act(() => {
    toast({ id: "upload", title: "Uploaded!", duration: Number.POSITIVE_INFINITY });
  });

  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(screen.getByRole("status")).toHaveTextContent("Uploaded!");
});

test("toast.dismiss(id) dismisses only that toast", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ id: "a", title: "First", duration: Number.POSITIVE_INFINITY });
    toast({ id: "b", title: "Second", duration: Number.POSITIVE_INFINITY });
  });

  act(() => {
    toast.dismiss("a");
    vi.advanceTimersByTime(200);
  });

  expect(screen.queryByText("First")).not.toBeInTheDocument();
  expect(screen.getByText("Second")).toBeInTheDocument();
  vi.useRealTimers();
});

test("toast.dismiss() with no id dismisses every toast", () => {
  vi.useFakeTimers();
  render(<Toaster />);
  act(() => {
    toast({ title: "First", duration: Number.POSITIVE_INFINITY });
    toast({ title: "Second", duration: Number.POSITIVE_INFINITY });
  });

  act(() => {
    toast.dismiss();
    vi.advanceTimersByTime(200);
  });

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});

test("Toaster renders into document.body via a portal, not inline", () => {
  const { container } = render(<Toaster />);
  act(() => {
    toast({ title: "Portaled", duration: Number.POSITIVE_INFINITY });
  });

  expect(within(container).queryByText("Portaled")).not.toBeInTheDocument();
  expect(within(document.body).getByText("Portaled")).toBeInTheDocument();
});

test("position defaults to bottom-right", () => {
  render(<Toaster />);
  act(() => {
    toast({ title: "Positioned", duration: Number.POSITIVE_INFINITY });
  });
  const stack = screen.getByRole("status").parentElement;
  expect(stack).toHaveClass("bottom-4", "right-4");
});

test("position can be overridden", () => {
  render(<Toaster position="top-center" />);
  act(() => {
    toast({ title: "Positioned", duration: Number.POSITIVE_INFINITY });
  });
  const stack = screen.getByRole("status").parentElement;
  expect(stack).toHaveClass("top-4", "flex-col-reverse");
});
