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

test("AvatarImage is unmounted once it fails to load", async () => {
  render(
    <Avatar>
      <AvatarImage src="https://example.com/broken.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  fireEvent.error(screen.getByAltText("Jane Doe"));

  // The broken <img> must leave the DOM, not just sit behind the initials,
  // or the browser paints its broken-image glyph through the fallback.
  await waitFor(() =>
    expect(screen.queryByAltText("Jane Doe")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("JD")).toBeVisible();
});

test("AvatarImage renders nothing when it has no src", () => {
  render(
    <Avatar>
      <AvatarImage alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(screen.queryByAltText("Jane Doe")).not.toBeInTheDocument();
  expect(screen.getByText("JD")).toBeVisible();
});

test("AvatarFallback gives way to an image that was already cached on attach", () => {
  // A cached image finishes before effects flush, so its `load` event can beat
  // any effect-based bookkeeping. React reads the element at attach time.
  const complete = vi
    .spyOn(HTMLImageElement.prototype, "complete", "get")
    .mockReturnValue(true);
  const naturalWidth = vi
    .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
    .mockReturnValue(128);

  render(
    <Avatar>
      <AvatarImage src="https://example.com/cached.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  expect(screen.queryByText("JD")).not.toBeInTheDocument();
  expect(screen.getByAltText("Jane Doe")).toBeVisible();

  complete.mockRestore();
  naturalWidth.mockRestore();
});

test("AvatarImage is retried when src changes after a failure", async () => {
  const { rerender } = render(
    <Avatar>
      <AvatarImage src="https://example.com/broken.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  fireEvent.error(screen.getByAltText("Jane Doe"));
  await waitFor(() =>
    expect(screen.queryByAltText("Jane Doe")).not.toBeInTheDocument(),
  );

  // The failure belonged to the old src and must not suppress the new one.
  rerender(
    <Avatar>
      <AvatarImage src="https://example.com/working.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  const image = await screen.findByAltText("Jane Doe");
  expect(image).toHaveAttribute("src", "https://example.com/working.jpg");

  fireEvent.load(image);
  await waitFor(() => expect(screen.queryByText("JD")).not.toBeInTheDocument());
});

test("AvatarFallback returns when a loaded src is removed", async () => {
  const { rerender } = render(
    <Avatar>
      <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

  fireEvent.load(screen.getByAltText("Jane Doe"));
  await waitFor(() => expect(screen.queryByText("JD")).not.toBeInTheDocument());

  rerender(
    <Avatar>
      <AvatarImage alt="Jane Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>,
  );

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
