"use client";

import { useState } from "react";
import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "neelam-ui";

const totalPages = 20;

export default function PaginationDemo() {
  // The current page lives here, not inside Pagination — see "Presentational
  // by design" on this page.
  const [page, setPage] = useState(6);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          />
        </PaginationItem>

        {getPaginationRange({ currentPage: page, totalPages }).map(
          (item, index) => (
            <PaginationItem key={item === "ellipsis" ? `gap-${index}` : item}>
              {item === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={item === page}
                  onClick={() => setPage(item)}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
