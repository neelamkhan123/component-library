import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

expect.extend(toHaveNoViolations);

function FullCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one click.</CardDescription>
      </CardHeader>
      <CardContent>Choose a name and framework to get started.</CardContent>
      <CardFooter>Footer content</CardFooter>
    </Card>
  );
}

test("Card renders with no accessibility violations", async () => {
  const { container } = render(<FullCard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("CardTitle renders as a heading", () => {
  render(<FullCard />);
  expect(
    screen.getByRole("heading", { name: "Create project" }),
  ).toBeInTheDocument();
});

test("CardDescription and CardContent render their text", () => {
  render(<FullCard />);
  expect(
    screen.getByText("Deploy your new project in one click."),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Choose a name and framework to get started."),
  ).toBeInTheDocument();
});

test("each Card part merges a custom className with its defaults", () => {
  render(
    <Card className="custom-card" data-testid="card">
      <CardHeader className="custom-header" data-testid="header">
        <CardTitle className="custom-title">Title</CardTitle>
        <CardDescription className="custom-description">
          Description
        </CardDescription>
      </CardHeader>
      <CardContent className="custom-content" data-testid="content">
        Content
      </CardContent>
      <CardFooter className="custom-footer" data-testid="footer">
        Footer
      </CardFooter>
    </Card>,
  );

  expect(screen.getByTestId("card")).toHaveClass(
    "custom-card",
    "rounded-xl",
    "border",
  );
  expect(screen.getByTestId("header")).toHaveClass("custom-header", "flex");
  expect(screen.getByText("Title")).toHaveClass(
    "custom-title",
    "font-semibold",
  );
  expect(screen.getByText("Description")).toHaveClass(
    "custom-description",
    "text-xs",
  );
  expect(screen.getByTestId("content")).toHaveClass("custom-content", "p-6");
  expect(screen.getByTestId("footer")).toHaveClass("custom-footer", "flex");
});

test("each Card part forwards its ref to the underlying DOM element", () => {
  const cardRef = createRef<HTMLDivElement>();
  const headerRef = createRef<HTMLDivElement>();
  const titleRef = createRef<HTMLHeadingElement>();
  const descriptionRef = createRef<HTMLParagraphElement>();
  const contentRef = createRef<HTMLDivElement>();
  const footerRef = createRef<HTMLDivElement>();

  render(
    <Card ref={cardRef}>
      <CardHeader ref={headerRef}>
        <CardTitle ref={titleRef}>Title</CardTitle>
        <CardDescription ref={descriptionRef}>Description</CardDescription>
      </CardHeader>
      <CardContent ref={contentRef}>Content</CardContent>
      <CardFooter ref={footerRef}>Footer</CardFooter>
    </Card>,
  );

  expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
  expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
  expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
  expect(descriptionRef.current).toBeInstanceOf(HTMLParagraphElement);
  expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
});
