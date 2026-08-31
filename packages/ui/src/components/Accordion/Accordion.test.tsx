import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

expect.extend(toHaveNoViolations);

function FullAccordion(props: {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
}) {
  return (
    <Accordion
      type={props.type ?? "single"}
      collapsible={props.collapsible}
      defaultValue={props.defaultValue as never}
      onValueChange={props.onValueChange as never}
    >
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>First question</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>First answer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionHeader>
          <AccordionTrigger>Second question</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Second answer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

test("Accordion renders with no accessibility violations", async () => {
  const { container } = render(<FullAccordion defaultValue="one" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("items start closed and AccordionTrigger opens them", async () => {
  const user = userEvent.setup();
  render(<FullAccordion />);

  expect(
    screen.getByRole("button", { name: "First question" }),
  ).toHaveAttribute("aria-expanded", "false");

  await user.click(screen.getByRole("button", { name: "First question" }));

  expect(
    screen.getByRole("button", { name: "First question" }),
  ).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("First answer.")).toBeVisible();
});

test("type=single closes the previously open item when another opens", async () => {
  const user = userEvent.setup();
  render(<FullAccordion defaultValue="one" />);

  const first = screen.getByRole("button", { name: "First question" });
  const second = screen.getByRole("button", { name: "Second question" });
  expect(first).toHaveAttribute("aria-expanded", "true");

  await user.click(second);

  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(second).toHaveAttribute("aria-expanded", "true");
});

test("type=single without collapsible keeps the open item open when reactivated", async () => {
  const user = userEvent.setup();
  render(<FullAccordion defaultValue="one" collapsible={false} />);

  const first = screen.getByRole("button", { name: "First question" });
  await user.click(first);

  expect(first).toHaveAttribute("aria-expanded", "true");
});

test("type=single with collapsible closes the open item when reactivated", async () => {
  const user = userEvent.setup();
  render(<FullAccordion defaultValue="one" collapsible />);

  const first = screen.getByRole("button", { name: "First question" });
  await user.click(first);

  expect(first).toHaveAttribute("aria-expanded", "false");
});

test("type=multiple allows more than one item open at once", async () => {
  const user = userEvent.setup();
  render(<FullAccordion type="multiple" defaultValue={["one"]} />);

  const first = screen.getByRole("button", { name: "First question" });
  const second = screen.getByRole("button", { name: "Second question" });
  expect(first).toHaveAttribute("aria-expanded", "true");

  await user.click(second);

  expect(first).toHaveAttribute("aria-expanded", "true");
  expect(second).toHaveAttribute("aria-expanded", "true");
});

test("reports value changes via onValueChange", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullAccordion onValueChange={onValueChange} />);

  await user.click(screen.getByRole("button", { name: "First question" }));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("one");
});

test("closed content is inert", async () => {
  render(<FullAccordion />);
  const answer = screen.getByText("First answer.");
  expect(answer.closest("[inert]")).not.toBeNull();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "First question" }));

  await waitFor(() => expect(answer.closest("[inert]")).toBeNull());
});

test("AccordionTrigger merges a custom className with its defaults", () => {
  render(
    <Accordion type="single">
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger className="custom-trigger">Question</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Answer.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

  expect(screen.getByRole("button", { name: "Question" })).toHaveClass(
    "custom-trigger",
    "flex",
  );
});

test("AccordionContent forwards its ref to the underlying div", () => {
  const contentRef = createRef<HTMLDivElement>();
  render(
    <Accordion type="single" defaultValue="one">
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>Question</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent ref={contentRef}>Answer.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  expect(contentRef.current).toHaveTextContent("Answer.");
});
