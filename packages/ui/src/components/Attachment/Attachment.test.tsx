import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Attachment } from "./Attachment";

expect.extend(toHaveNoViolations);

test("Attachment renders with no accessibility violations", async () => {
  const { container } = render(<Attachment name="report.pdf" size="2.4 MB" url="https://example.com/report.pdf" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("a file attachment shows the name and size", () => {
  render(<Attachment name="report.pdf" size="2.4 MB" />);
  expect(screen.getByText("report.pdf")).toBeInTheDocument();
  expect(screen.getByText("2.4 MB")).toBeInTheDocument();
});

test("a file attachment with no url renders as non-interactive", () => {
  render(<Attachment name="report.pdf" />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("a file attachment with a url renders as a downloadable link", () => {
  render(<Attachment name="report.pdf" url="https://example.com/report.pdf" />);
  const link = screen.getByRole("link", { name: /report.pdf/ });
  expect(link).toHaveAttribute("href", "https://example.com/report.pdf");
  expect(link).toHaveAttribute("download", "report.pdf");
  expect(link).toHaveAttribute("target", "_blank");
});

test("an image attachment renders an img with alt text, linking to the full image", () => {
  render(<Attachment type="image" name="Sunset" url="https://example.com/sunset.jpg" />);
  const image = screen.getByRole("img", { name: "Sunset" });
  expect(image).toHaveAttribute("src", "https://example.com/sunset.jpg");
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "https://example.com/sunset.jpg");
  expect(link).toHaveAttribute("target", "_blank");
});

test("type=image without a url falls back to the file row", () => {
  render(<Attachment type="image" name="sunset.jpg" />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("sunset.jpg")).toBeInTheDocument();
});

test("Attachment merges a custom className with its defaults", () => {
  render(<Attachment name="report.pdf" className="custom-attachment" />);
  expect(screen.getByText("report.pdf").closest(".custom-attachment")).not.toBeNull();
});

test("Attachment forwards its ref to the outer element", () => {
  const attachmentRef = createRef<HTMLDivElement>();
  render(<Attachment ref={attachmentRef} name="report.pdf" />);
  expect(attachmentRef.current).toBeInstanceOf(HTMLDivElement);
});

test("no remove button is rendered without onRemove", () => {
  render(<Attachment name="report.pdf" />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("a file attachment with onRemove shows a remove button and calls it on click", () => {
  const onRemove = vi.fn();
  render(<Attachment name="report.pdf" onRemove={onRemove} />);
  const button = screen.getByRole("button", { name: "Remove report.pdf" });
  fireEvent.click(button);
  expect(onRemove).toHaveBeenCalledOnce();
});

test("removeLabel overrides the default remove button accessible name", () => {
  render(<Attachment name="report.pdf" onRemove={() => {}} removeLabel="Discard report" />);
  expect(screen.getByRole("button", { name: "Discard report" })).toBeInTheDocument();
});

test("a file attachment with a url and onRemove keeps the link and adds a remove button", () => {
  render(<Attachment name="report.pdf" url="https://example.com/report.pdf" onRemove={() => {}} />);
  expect(screen.getByRole("link", { name: /report.pdf/ })).toHaveAttribute(
    "href",
    "https://example.com/report.pdf",
  );
  expect(screen.getByRole("button", { name: "Remove report.pdf" })).toBeInTheDocument();
});

test("an image attachment with onRemove renders a captioned thumbnail instead of a link", () => {
  const onRemove = vi.fn();
  render(
    <Attachment type="image" name="Sunset" size="1.1 MB" url="https://example.com/sunset.jpg" onRemove={onRemove} />,
  );
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Sunset" })).toHaveAttribute("src", "https://example.com/sunset.jpg");
  expect(screen.getByText("Sunset")).toBeInTheDocument();
  expect(screen.getByText("1.1 MB")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remove Sunset" }));
  expect(onRemove).toHaveBeenCalledOnce();
});

test("Attachment thumbnail renders with no accessibility violations", async () => {
  const { container } = render(
    <Attachment type="image" name="Sunset" size="1.1 MB" url="https://example.com/sunset.jpg" onRemove={() => {}} />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
