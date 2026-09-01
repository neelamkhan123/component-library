import { DocsSidebar } from "@/components/docs-sidebar";
import { TableOfContents } from "@/components/toc";
import { DocsPager } from "@/components/docs-pager";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[100rem] px-4 sm:px-6">
      <DocsSidebar />
      <main id="main" className="min-w-0 flex-1 py-10 lg:pl-10">
        <article className="mx-auto max-w-3xl">
          {children}
          <DocsPager />
        </article>
      </main>
      <TableOfContents />
    </div>
  );
}
