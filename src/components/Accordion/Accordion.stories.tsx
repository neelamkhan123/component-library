import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'A vertically stacked set of headings that each reveal a section of content. Compose it with `AccordionItem`, `AccordionHeader`, `AccordionTrigger`, and `AccordionContent`. `type="single"` (the default) keeps at most one item open at a time — pass `collapsible` to allow closing the open item — while `type="multiple"` allows any number of items open together.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const faq = [
  {
    value: "what-is-it",
    question: "What is this component library?",
    answer:
      "A small set of accessible, themeable React components built on native HTML elements wherever the platform provides one.",
  },
  {
    value: "styling",
    question: "How is it styled?",
    answer:
      "With Tailwind utility classes composed via class-variance-authority, so every component ships variants without a runtime CSS-in-JS cost.",
  },
  {
    value: "themes",
    question: "Does it support dark mode?",
    answer:
      "Yes — every component ships light and dark styles via Tailwind's `dark:` variant, toggled by a `.dark` class ancestor.",
  },
];

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      {faq.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>{item.question}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["what-is-it"]} className="w-full max-w-md">
      {faq.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>{item.question}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const NotCollapsible: Story = {
  name: "Single, not collapsible",
  parameters: {
    docs: {
      description: {
        story:
          "Without `collapsible`, activating the currently open item leaves it open — there's always exactly one item expanded.",
      },
    },
  },
  render: () => (
    <Accordion type="single" defaultValue="what-is-it" className="w-full max-w-md">
      {faq.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>{item.question}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
