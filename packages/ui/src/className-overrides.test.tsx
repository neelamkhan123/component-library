import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { expect, test } from "vitest";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { Skeleton } from "./components/Skeleton";
import { Sidebar, SidebarProvider } from "./components/Sidebar";

/**
 * Components ship raw Tailwind utility strings that the *consuming app*
 * compiles, so a component's default and a caller's override land in the same
 * generated stylesheet as two single-class selectors. Equal specificity means
 * the winner is decided by their order in that stylesheet — which Tailwind
 * sorts alphabetically within a property group — and not by their order in the
 * `className` attribute. Concatenating the two therefore left the outcome to
 * coincidence: `px-6` beat a default `px-3`, while `bg-slate-900` silently
 * lost to a default `bg-white`.
 *
 * These tests assert the losing default is *absent* from the DOM, not merely
 * that the override is present. Asserting presence alone would have passed
 * against the old concatenating helper, since both classes were emitted.
 */

test("an overriding utility removes the component's conflicting default", () => {
  render(<Badge className="rounded-full bg-slate-900">Beta</Badge>);
  const badge = screen.getByText("Beta");
  expect(badge).toHaveClass("rounded-full", "bg-slate-900");
  expect(badge).not.toHaveClass("rounded-md", "bg-slate-950");
});

test("non-conflicting utilities are still additive", () => {
  render(<Badge className="shadow-lg">Beta</Badge>);
  const badge = screen.getByText("Beta");
  expect(badge).toHaveClass("shadow-lg");
  // The variant's own background survives — nothing it collides with.
  expect(badge).toHaveClass("bg-slate-950");
});

test("cva-based components merge their variant classes too", () => {
  // Button, Badge, Input and Toggle build their classes with cva, which
  // concatenates as well — so they need the merge applied to the variant
  // output rather than handing `className` to cva.
  render(<Button className="rounded-full bg-emerald-600">Go</Button>);
  const button = screen.getByRole("button", { name: "Go" });
  expect(button).toHaveClass("rounded-full", "bg-emerald-600");
  expect(button).not.toHaveClass("rounded-md", "bg-slate-950");
});

test("re-passing a utility the component already sets emits it once", () => {
  render(<Badge className="bg-slate-950">Beta</Badge>);
  const classes = screen.getByText("Beta").className.split(/\s+/).filter(Boolean);
  expect(classes.filter((c) => c === "bg-slate-950")).toHaveLength(1);
});

test("shape overrides beat the default radius", () => {
  render(<Skeleton className="h-12 w-12 rounded-full" data-testid="s" />);
  const skeleton = screen.getByTestId("s");
  expect(skeleton).toHaveClass("rounded-full");
  expect(skeleton).not.toHaveClass("rounded-md");
});

test("Sidebar fills a provider sized smaller than the viewport", () => {
  render(
    <SidebarProvider className="h-72 min-h-0" data-testid="provider">
      <Sidebar data-testid="sidebar">nav</Sidebar>
    </SidebarProvider>,
  );
  // The provider's `min-h-svh` floor is overridable...
  const provider = screen.getByTestId("provider");
  expect(provider).toHaveClass("h-72", "min-h-0");
  expect(provider).not.toHaveClass("min-h-svh");
  // ...and the panel no longer pins itself to the viewport, so it stretches
  // to whatever height the provider has.
  expect(screen.getByTestId("sidebar")).not.toHaveClass("h-svh");
});
