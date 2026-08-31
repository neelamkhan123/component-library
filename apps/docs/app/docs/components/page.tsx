import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ComponentGrid } from "@/components/component-grid";
import { components } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Components",
  description: "Every component in @neelamkhan21/ui, grouped by what it is for.",
};

export default function ComponentsIndexPage() {
  return (
    <>
      <PageHeader
        title="Components"
        description={`All ${components.length} components, grouped by what they are for. Every one is keyboard operable and checked against axe-core in CI.`}
      />
      <ComponentGrid />
    </>
  );
}
