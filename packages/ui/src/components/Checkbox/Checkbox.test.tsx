import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Checkbox, type CheckedState } from "./Checkbox";

expect.extend(toHaveNoViolations);

test("Checkbox renders with no accessibility violations", async () => {
  const { container } = render(
    <label>
      <Checkbox />
      Accept the terms
    </label>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("Checkbox renders as a native checkbox input", () => {
  render(<Checkbox aria-label="Accept" />);
  const checkbox = screen.getByRole("checkbox", { name: "Accept" });
  expect(checkbox.tagName).toBe("INPUT");
  expect(checkbox).toHaveAttribute("type", "checkbox");
});

test("clicking an associated label toggles the checkbox natively", async () => {
  const user = userEvent.setup();
  render(
    <label>
      <Checkbox />
      Accept the terms
    </label>,
  );

  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).not.toBeChecked();

  await user.click(screen.getByText("Accept the terms"));
  expect(checkbox).toBeChecked();
});

test("uncontrolled Checkbox respects defaultChecked and toggles freely", async () => {
  const user = userEvent.setup();
  render(<Checkbox aria-label="Accept" defaultChecked />);
  const checkbox = screen.getByRole("checkbox");

  expect(checkbox).toBeChecked();
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
});

test("controlled Checkbox reports changes via onCheckedChange", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Checkbox aria-label="Accept" checked={false} onCheckedChange={onCheckedChange} />);

  await user.click(screen.getByRole("checkbox"));

  expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
});

test('checked="indeterminate" sets the underlying DOM property without checking the box', () => {
  render(<Checkbox aria-label="Select all" checked="indeterminate" readOnly />);
  const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

  expect(checkbox.indeterminate).toBe(true);
  expect(checkbox.checked).toBe(false);
});

test("a select-all checkbox cycles through unchecked, indeterminate, and checked", async () => {
  const user = userEvent.setup();

  function SelectAll() {
    const [items, setItems] = useState([false, false]);
    const checkedCount = items.filter(Boolean).length;
    const allChecked: CheckedState =
      checkedCount === 0 ? false : checkedCount === items.length ? true : "indeterminate";

    return (
      <>
        <Checkbox
          aria-label="Select all"
          checked={allChecked}
          onCheckedChange={(checked) => setItems(items.map(() => checked))}
        />
        <Checkbox
          aria-label="Item 1"
          checked={items[0]}
          onCheckedChange={(checked) => setItems([checked, items[1]])}
        />
        <Checkbox
          aria-label="Item 2"
          checked={items[1]}
          onCheckedChange={(checked) => setItems([items[0], checked])}
        />
      </>
    );
  }

  render(<SelectAll />);
  const selectAll = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
  const item1 = screen.getByRole("checkbox", { name: "Item 1" });

  expect(selectAll.indeterminate).toBe(false);
  expect(selectAll.checked).toBe(false);

  await user.click(item1);
  expect(selectAll.indeterminate).toBe(true);

  await user.click(selectAll);
  expect(selectAll.indeterminate).toBe(false);
  expect(selectAll.checked).toBe(true);
});

test("disabled Checkbox can't be toggled", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Checkbox aria-label="Accept" disabled onCheckedChange={onCheckedChange} />);

  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).toBeDisabled();

  await user.click(checkbox);
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test("Checkbox merges a custom className with its defaults", () => {
  render(<Checkbox aria-label="Accept" className="custom-checkbox" />);
  expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox", "peer");
});

test("Checkbox forwards its ref to the underlying input", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(<Checkbox ref={inputRef} aria-label="Accept" />);
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
});
