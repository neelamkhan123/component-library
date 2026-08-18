import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

expect.extend(toHaveNoViolations);

function FullTabs(props: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <Tabs
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
    >
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team" disabled>
          Team
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
      <TabsContent value="team">Team settings</TabsContent>
    </Tabs>
  );
}

test("Tabs renders with no accessibility violations", async () => {
  const { container } = render(<FullTabs defaultValue="account" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Tabs renders the WAI-ARIA tablist/tab/tabpanel structure", () => {
  render(<FullTabs defaultValue="account" />);
  expect(screen.getByRole("tablist")).toBeInTheDocument();
  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(screen.getByRole("tabpanel")).toBeInTheDocument();
});

test("the active tab is aria-selected and only it is in the tab order", () => {
  render(<FullTabs defaultValue="account" />);
  const account = screen.getByRole("tab", { name: "Account" });
  const password = screen.getByRole("tab", { name: "Password" });

  expect(account).toHaveAttribute("aria-selected", "true");
  expect(account).toHaveAttribute("tabIndex", "0");
  expect(password).toHaveAttribute("aria-selected", "false");
  expect(password).toHaveAttribute("tabIndex", "-1");
});

test("only the active panel is rendered", () => {
  render(<FullTabs defaultValue="account" />);
  expect(screen.getByText("Account settings")).toBeInTheDocument();
  expect(screen.queryByText("Password settings")).not.toBeInTheDocument();
});

test("clicking a tab switches the active panel", async () => {
  const user = userEvent.setup();
  render(<FullTabs defaultValue="account" />);

  await user.click(screen.getByRole("tab", { name: "Password" }));

  expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("Password settings")).toBeInTheDocument();
  expect(screen.queryByText("Account settings")).not.toBeInTheDocument();
});

test("the panel is linked to its tab via aria-labelledby/aria-controls", () => {
  render(<FullTabs defaultValue="account" />);
  const tab = screen.getByRole("tab", { name: "Account" });
  const panel = screen.getByRole("tabpanel");

  expect(tab).toHaveAttribute("aria-controls", panel.id);
  expect(panel).toHaveAttribute("aria-labelledby", tab.id);
});

test("ArrowRight/ArrowLeft move focus and switch tabs together, wrapping at the ends", async () => {
  const user = userEvent.setup();
  render(<FullTabs defaultValue="account" />);

  screen.getByRole("tab", { name: "Account" }).focus();
  await user.keyboard("{ArrowRight}");

  const password = screen.getByRole("tab", { name: "Password" });
  expect(password).toHaveFocus();
  expect(password).toHaveAttribute("aria-selected", "true");

  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();

  // Wraps past the start; "Team" is disabled and skipped.
  await user.keyboard("{ArrowLeft}");
  expect(password).toHaveFocus();
  expect(password).toHaveAttribute("aria-selected", "true");
});

test("Home/End jump to the first/last enabled tab", async () => {
  const user = userEvent.setup();
  render(<FullTabs defaultValue="password" />);

  screen.getByRole("tab", { name: "Password" }).focus();
  await user.keyboard("{End}");
  expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();

  await user.keyboard("{Home}");
  expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
});

test("vertical orientation uses ArrowDown/ArrowUp instead", async () => {
  const user = userEvent.setup();
  render(<FullTabs defaultValue="account" orientation="vertical" />);

  screen.getByRole("tab", { name: "Account" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus(); // unaffected

  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
});

test("a disabled tab can't be activated by clicking it", async () => {
  const user = userEvent.setup();
  render(<FullTabs defaultValue="account" />);

  const team = screen.getByRole("tab", { name: "Team" });
  expect(team).toBeDisabled();

  await user.click(team);
  expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
});

test("controlled Tabs reports changes via onValueChange", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullTabs value="account" onValueChange={onValueChange} />);

  await user.click(screen.getByRole("tab", { name: "Password" }));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("password");
});

test("TabsList merges a custom className with its defaults", () => {
  render(<FullTabs defaultValue="account" />);
  expect(screen.getByRole("tablist")).toHaveClass("rounded-xl");
});

test("TabsContent forwards its ref to the underlying element", () => {
  const contentRef = createRef<HTMLDivElement>();
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
      </TabsList>
      <TabsContent ref={contentRef} value="a">
        Content
      </TabsContent>
    </Tabs>,
  );
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("TabsTrigger throws outside of a Tabs", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<TabsTrigger value="a">A</TabsTrigger>)).toThrow(
    "<TabsTrigger /> must be rendered inside a <Tabs>.",
  );
  consoleError.mockRestore();
});
