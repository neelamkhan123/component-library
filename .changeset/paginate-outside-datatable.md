---
"@neelamkhan21/ui": minor
---

`DataTable` now accepts `hidePagination` and `onPaginationChange`, so a caller can render its own pagination footer somewhere other than wherever `DataTable` itself renders — e.g. outside a card the table sits inside — while `DataTable` keeps owning the sort/filter/page-size math exactly as before. `onPaginationChange` reports `{ page, totalPages, setPage }` whenever any of them changes; `hidePagination` just suppresses the built-in footer, and has no effect without `pageSize`. Both are optional and backward compatible — omitting them renders exactly as before.
