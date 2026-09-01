"use client";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "neelam-ui";

export default function AccordionMultiple() {
  return (
    // type="multiple" takes an array, since more than one can be open.
    <Accordion
      type="multiple"
      defaultValue={["shipping", "returns"]}
      className="w-full max-w-md"
    >
      <AccordionItem value="shipping">
        <AccordionHeader>
          <AccordionTrigger>Shipping</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Ships within two business days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionHeader>
          <AccordionTrigger>Returns</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Free returns within 30 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionHeader>
          <AccordionTrigger>Warranty</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Two years, parts and labour.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
