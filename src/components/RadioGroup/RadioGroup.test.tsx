import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

expect.extend(toHaveNoViolations);

function FullRadioGroup(props: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <RadioGroup
      aria-label="Layout density"
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
    >
      <label>
        <RadioGroupItem value="compact" />
        Compact
      </label>
      <label>
        <RadioGroupItem value="comfortable" />
        Comfortable
      </label>
      <label>
        <RadioGroupItem value="spacious" />
        Spacious
      </label>
    </RadioGroup>
  );
}

test("RadioGroup renders with no accessibility violations", async () => {
  const { container } = render(<FullRadioGroup defaultValue="comfortable" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("RadioGroup renders as a labeled radiogroup of native radio inputs", () => {
  render(<FullRadioGroup />);
  expect(screen.getByRole("radiogroup", { name: "Layout density" })).toBeInTheDocument();
  const radios = screen.getAllByRole("radio");
  expect(radios).toHaveLength(3);
  radios.forEach((radio) => expect(radio.tagName).toBe("INPUT"));
});

test("every item shares one name, so only one can be checked at a time", async () => {
  const user = userEvent.setup();
  render(<FullRadioGroup defaultValue="compact" />);

  const compact = screen.getByRole("radio", { name: "Compact" });
  const comfortable = screen.getByRole("radio", { name: "Comfortable" });
  expect(compact).toHaveAttribute("name", comfortable.getAttribute("name"));
  expect(compact).toBeChecked();

  await user.click(comfortable);

  expect(comfortable).toBeChecked();
  expect(compact).not.toBeChecked();
});

test("clicking an associated label selects its radio natively", async () => {
  const user = userEvent.setup();
  render(<FullRadioGroup />);

  await user.click(screen.getByText("Spacious"));

  expect(screen.getByRole("radio", { name: "Spacious" })).toBeChecked();
});

test("uncontrolled RadioGroup keeps its own selection", async () => {
  const user = userEvent.setup();
  render(<FullRadioGroup defaultValue="compact" />);

  await user.click(screen.getByRole("radio", { name: "Spacious" }));

  expect(screen.getByRole("radio", { name: "Spacious" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Compact" })).not.toBeChecked();
});

test("controlled RadioGroup reports changes via onValueChange", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FullRadioGroup value="compact" onValueChange={onValueChange} />);

  await user.click(screen.getByRole("radio", { name: "Comfortable" }));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("comfortable");
});

test("arrow keys move both focus and selection between items in the group", async () => {
  const user = userEvent.setup();
  render(<FullRadioGroup defaultValue="compact" />);

  screen.getByRole("radio", { name: "Compact" }).focus();
  await user.keyboard("{ArrowDown}");

  expect(screen.getByRole("radio", { name: "Comfortable" })).toHaveFocus();
  expect(screen.getByRole("radio", { name: "Comfortable" })).toBeChecked();
});

test("disabled on RadioGroup disables every item", () => {
  render(<FullRadioGroup disabled />);
  screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
});

test("disabled on a RadioGroupItem overrides the group for just that item", () => {
  render(
    <RadioGroup aria-label="Example">
      <label>
        <RadioGroupItem value="a" />A
      </label>
      <label>
        <RadioGroupItem value="b" disabled />B
      </label>
    </RadioGroup>,
  );
  expect(screen.getByRole("radio", { name: "A" })).toBeEnabled();
  expect(screen.getByRole("radio", { name: "B" })).toBeDisabled();
});

test("RadioGroupItem merges a custom className with its defaults", () => {
  render(
    <RadioGroup aria-label="Example">
      <RadioGroupItem value="a" className="custom-radio" />
    </RadioGroup>,
  );
  expect(screen.getByRole("radio")).toHaveClass("custom-radio", "peer");
});

test("RadioGroupItem forwards its ref to the underlying input", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(
    <RadioGroup aria-label="Example">
      <RadioGroupItem ref={inputRef} value="a" />
    </RadioGroup>,
  );
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
});

test("RadioGroupItem throws outside of a RadioGroup", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<RadioGroupItem value="a" />)).toThrow(
    "<RadioGroupItem /> must be rendered inside a <RadioGroup>.",
  );
  consoleError.mockRestore();
});
