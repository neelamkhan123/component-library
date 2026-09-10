---
"neelam-ui": patch
---

`DataTable` now centres its pagination controls under the table instead of
left-aligning them. The standalone `Pagination` is unchanged — it stays
presentational and leaves alignment to its caller, and `DataTable` is simply
making that call for the footer it renders itself.
