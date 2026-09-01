"use client";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "neelam-ui";

export default function AccordionDemo() {
  return (
    <Accordion defaultValue="item-1" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Yes. It follows the WAI-ARIA Accordion pattern: a heading wrapping a
          button, and a labelled region for the panel.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionHeader>
          <AccordionTrigger>Is it animated?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Yes, via a grid-template-rows transition — and not at all under
          prefers-reduced-motion.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionHeader>
          <AccordionTrigger>Can several be open at once?</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Pass type=&quot;multiple&quot;.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
