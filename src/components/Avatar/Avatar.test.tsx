import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

expect.extend(toHaveNoViolations);

test("Avatar renders with no accessibility violations", async () => {
  const { container } = render(
    <Avatar>
      <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("AvatarFallback is shown before the image has loaded", () => {
  render(
    <Avatar>
      <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(screen.getByText("JD")).toBeVisible();
});

test("AvatarFallback is hidden once the image loads successfully", async () => {
  render(
    <Avatar>
      <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  fireEvent.load(screen.getByAltText("Jane Doe"));

  await waitFor(() => expect(screen.queryByText("JD")).not.toBeInTheDocument());
});

test("AvatarFallback reappears if the image fails to load", async () => {
  render(
    <Avatar>
      <AvatarImage src="https://example.com/broken.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  fireEvent.load(screen.getByAltText("Jane Doe"));
  await waitFor(() => expect(screen.queryByText("JD")).not.toBeInTheDocument());

  fireEvent.error(screen.getByAltText("Jane Doe"));
  await waitFor(() => expect(screen.getByText("JD")).toBeVisible());
});

test("AvatarFallback with no image renders immediately and stays visible", () => {
  render(
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(screen.getByText("JD")).toBeVisible();
});

test("AvatarFallback honors delayMs before rendering", async () => {
  render(
    <Avatar>
      <AvatarFallback delayMs={50}>JD</AvatarFallback>
    </Avatar>,
  );

  expect(screen.queryByText("JD")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByText("JD")).toBeVisible());
});

test("Avatar merges a custom className with its defaults", () => {
  const { container } = render(
    <Avatar className="custom-avatar">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(container.firstChild).toHaveClass("custom-avatar", "rounded-full");
});

test("AvatarImage forwards its ref to the underlying img element", () => {
  const imageRef = createRef<HTMLImageElement>();
  render(
    <Avatar>
      <AvatarImage ref={imageRef} src="https://example.com/avatar.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(imageRef.current).toBeInstanceOf(HTMLImageElement);
});

test("AvatarFallback throws outside of an Avatar", () => {
  // Swallow the expected React error-boundary console output for this case.
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<AvatarFallback>JD</AvatarFallback>)).toThrow(
    "<AvatarFallback /> must be rendered inside an <Avatar>.",
  );
  consoleError.mockRestore();
});
