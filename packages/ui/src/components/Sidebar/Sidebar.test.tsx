import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./Sidebar";

expect.extend(toHaveNoViolations);

// jsdom doesn't implement the Popover API at all — needed here because an
// icon-collapsed `SidebarMenuButton` renders a real `Tooltip`. Stubbed the
// same way as `Tooltip.test.tsx` itself (see there for the full reasoning).
const openPopovers = new WeakSet<Element>();
let originalMatches: typeof Element.prototype.matches;

beforeEach(() => {
  originalMatches = Element.prototype.matches;
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    openPopovers.add(this);
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    openPopovers.delete(this);
    this.style.removeProperty("display");
  };
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return openPopovers.has(this);
    return originalMatches.call(this, selector);
  } as typeof originalMatches;
});

afterEach(() => {
  Element.prototype.matches = originalMatches;
});

function FullSidebar(props: { defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <SidebarProvider defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
      <Sidebar>
        <SidebarHeader>Acme Inc</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/home" isActive>
                  Home
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/settings">Settings</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>Jane Doe</SidebarFooter>
      </Sidebar>
      <main>
        <SidebarTrigger />
        Page content
      </main>
    </SidebarProvider>
  );
}

test("Sidebar renders with no accessibility violations", async () => {
  const { container } = render(<FullSidebar />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("an icon-collapsed Sidebar renders with no accessibility violations", async () => {
  const { container } = render(<IconSidebar defaultOpen={false} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Sidebar renders as a native <aside> complementary landmark", () => {
  render(<FullSidebar />);
  expect(screen.getByRole("complementary").tagName).toBe("ASIDE");
});

test("defaults to open", () => {
  render(<FullSidebar />);
  expect(screen.getByRole("complementary")).toHaveAttribute("data-state", "open");
  expect(screen.getByRole("complementary")).not.toHaveAttribute("inert");
});

test("defaultOpen={false} starts collapsed and inert", () => {
  render(<FullSidebar defaultOpen={false} />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
  expect(sidebar).toHaveAttribute("inert");
});

test("SidebarTrigger toggles an uncontrolled sidebar open and closed", async () => {
  const user = userEvent.setup();
  render(<FullSidebar />);
  const sidebar = screen.getByRole("complementary");
  const trigger = screen.getByRole("button", { name: "Toggle sidebar" });

  expect(sidebar).toHaveAttribute("data-state", "open");
  await user.click(trigger);
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
  await user.click(trigger);
  expect(sidebar).toHaveAttribute("data-state", "open");
});

test("SidebarTrigger reports every change via onOpenChange", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<FullSidebar onOpenChange={onOpenChange} />);

  await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
});

test("a controlled SidebarProvider is driven entirely by its open prop", async () => {
  const user = userEvent.setup();
  function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar>
          <SidebarHeader>Acme Inc</SidebarHeader>
        </Sidebar>
        <main>
          <SidebarTrigger />
        </main>
      </SidebarProvider>
    );
  }
  render(<Controlled />);
  const sidebar = screen.getByRole("complementary");

  expect(sidebar).toHaveAttribute("data-state", "open");
  await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
});

test("useSidebar() exposes the same state and toggle SidebarTrigger uses", async () => {
  const user = userEvent.setup();
  function CustomTrigger() {
    const { open, toggleSidebar } = useSidebar();
    return (
      <button onClick={toggleSidebar}>{open ? "Collapse" : "Expand"}</button>
    );
  }
  render(
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Acme Inc</SidebarHeader>
      </Sidebar>
      <main>
        <CustomTrigger />
      </main>
    </SidebarProvider>,
  );

  const sidebar = screen.getByRole("complementary");
  expect(sidebar).toHaveAttribute("data-state", "open");
  await user.click(screen.getByRole("button", { name: "Collapse" }));
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
});

test("Sidebar/SidebarTrigger/useSidebar throw outside of a SidebarProvider", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Sidebar />)).toThrow("<Sidebar /> must be rendered inside a <SidebarProvider>.");
  expect(() => render(<SidebarTrigger />)).toThrow(
    "<SidebarTrigger /> must be rendered inside a <SidebarProvider>.",
  );
  consoleError.mockRestore();
});

test('side="right" moves the sidebar after its siblings in visual order', () => {
  render(
    <SidebarProvider>
      <Sidebar side="right">Right</Sidebar>
    </SidebarProvider>,
  );
  expect(screen.getByRole("complementary")).toHaveClass("order-last");
});

test("SidebarMenuButton renders a real link, with isActive setting aria-current", () => {
  render(<FullSidebar />);
  const home = screen.getByRole("link", { name: "Home" });
  expect(home).toHaveAttribute("href", "/home");
  expect(home).toHaveAttribute("aria-current", "page");

  const settings = screen.getByRole("link", { name: "Settings" });
  expect(settings).not.toHaveAttribute("aria-current");
});

test("Sidebar, SidebarProvider, and SidebarMenuButton merge a custom className with their defaults", () => {
  render(
    <SidebarProvider className="custom-provider" data-testid="provider">
      <Sidebar className="custom-sidebar">
        <SidebarMenuButton href="#" className="custom-link">
          Home
        </SidebarMenuButton>
      </Sidebar>
    </SidebarProvider>,
  );
  expect(screen.getByTestId("provider")).toHaveClass("custom-provider", "flex");
  expect(screen.getByRole("complementary")).toHaveClass("custom-sidebar", "flex");
  expect(screen.getByRole("link")).toHaveClass("custom-link", "flex");
});

test("SidebarProvider forwards its ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<SidebarProvider ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

function IconSidebar(props: { defaultOpen?: boolean }) {
  return (
    <SidebarProvider defaultOpen={props.defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/home" icon={<span />}>
                  Home
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main>
        <SidebarTrigger />
      </main>
    </SidebarProvider>
  );
}

test('collapsible="icon": a collapsed SidebarMenuButton is a fixed h-8 w-8 box centered with mx-auto, not a padded row', () => {
  // Regression test for a real bug: `justify-center` alone on the full-width
  // row wasn't enough — with the row's own `px-2` padding plus the icon
  // together wider than what's left of a narrow rail after `SidebarContent`'s
  // `p-3`, `justify-content` had negative free space to distribute and
  // silently fell back to flex-start (found directly in a screenshot: the
  // icon sat flush left, not centered). A fixed box centered via `mx-auto`
  // doesn't depend on that arithmetic working out.
  render(<IconSidebar defaultOpen={false} />);
  const home = screen.getByRole("link", { name: "Home" });
  expect(home).toHaveClass("mx-auto", "h-8", "w-8", "justify-center", "p-0");
  expect(home).not.toHaveClass("px-2", "py-1.5");
});

test('collapsible="icon" collapses to iconWidth, not 0, and stays out of inert', () => {
  render(<IconSidebar defaultOpen={false} />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
  expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  expect(sidebar).not.toHaveAttribute("inert");
  expect(sidebar).toHaveStyle({ width: "4rem" });
});

test('collapsible="offcanvas" (the default) is unaffected: still collapses to 0 and inert', () => {
  render(<FullSidebar defaultOpen={false} />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar).toHaveAttribute("data-collapsible", "offcanvas");
  expect(sidebar).toHaveAttribute("inert");
  expect(sidebar).toHaveStyle({ width: "0" });
});

test('collapsible="icon": collapsed SidebarMenuButton keeps its accessible name and shows a Tooltip label on focus', async () => {
  render(<IconSidebar defaultOpen={false} />);
  const home = screen.getByRole("link", { name: "Home" });
  // Still the sole focusable node for this control — no extra
  // `<span tabIndex={0}>` wrapper stealing a redundant tab stop (see
  // `TooltipTrigger`'s `asChild`).
  expect(home.tagName).toBe("A");
  home.focus();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Home");
});

test('collapsible="icon": SidebarGroupLabel renders nothing while collapsed', () => {
  render(<IconSidebar defaultOpen={false} />);
  expect(screen.queryByText("Platform")).not.toBeInTheDocument();
});

test('collapsible="icon": expanding restores the label and SidebarGroupLabel', () => {
  render(<IconSidebar defaultOpen={true} />);
  expect(screen.getByText("Platform")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Home" })).toHaveTextContent("Home");
});

test("Sidebar forwards its ref", () => {
  const ref = createRef<HTMLElement>();
  render(
    <SidebarProvider>
      <Sidebar ref={ref} />
    </SidebarProvider>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
});
