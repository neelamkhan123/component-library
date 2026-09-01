# neelam-ui

## 1.2.2

### Patch Changes

- 6c536c3: Packaging metadata only — no functional change to any component. `repository.url` drops its `git+` prefix so npm's OIDC trusted-publishing match is unambiguous, `publishConfig.access` is declared explicitly as `public`, and a `prepublishOnly` script now rebuilds `dist` before any publish, so a stale build can no longer be shipped.

## 1.2.1

### Patch Changes

- Fix `Avatar` rendering its fallback on top of, and behind, the image. Three problems compounded: an errored `<img>` stayed mounted underneath the fallback, so the browser painted its broken-image glyph and `alt` text behind the initials (both elements are `absolute inset-0`); the fallback itself was transparent and sits after the image in the DOM, so it composited its initials over a mid-load image rather than standing in for it; and resetting the load status from a `useEffect` raced the `load` event, since effects flush after paint — a cached image could report `loaded` first, and the late reset then stranded the fallback over an image that had already arrived, with no further event to clear it. `AvatarImage` now renders nothing when it has no `src` or the current `src` failed, the fallback is opaque, and load state is read from the element in a ref callback during commit and recorded per-`src` so a failed image can't suppress the next one.

## 1.2.0

### Minor Changes

- 985884a: `DropdownMenuTrigger` now accepts a `side` prop (`"top" | "bottom"`, defaulting to `"bottom"`, its existing behavior) so a trigger sitting near the bottom of the viewport — a sidebar footer's account menu, say — can open its menu upward instead of getting clamped to the bottom of the viewport rather than actually landing next to the trigger. Optional and backward compatible — omitting it opens below exactly as before.
- 638ad7c: `DataTable` now accepts `hidePagination` and `onPaginationChange`, so a caller can render its own pagination footer somewhere other than wherever `DataTable` itself renders — e.g. outside a card the table sits inside — while `DataTable` keeps owning the sort/filter/page-size math exactly as before. `onPaginationChange` reports `{ page, totalPages, setPage }` whenever any of them changes; `hidePagination` just suppresses the built-in footer, and has no effect without `pageSize`. Both are optional and backward compatible — omitting them renders exactly as before.

## 1.1.2

### Patch Changes

- Add a `size` prop to `DateRangePicker` (`"sm" | "md" | "lg"`, matching `Button`'s own vocabulary minus `"icon"`). Previously the trigger always carried `buttonVariants({ size: "md" })` with no way to pick a different size other than overriding `className` — but that override never actually replaced the hardcoded size classes, it just added alongside them (e.g. `className="h-8 ..."` left both `h-8` and `h-10` on the same element, with Tailwind's generated stylesheet order silently deciding which one won). `size` now goes through the same `buttonVariants` call that resolves the variant/size combination cleanly, so there's no conflicting-class trap to fall into.

## 1.1.1

### Patch Changes

- Fix two `DateRangePicker`/`Calendar` bugs: an outside-month day could render as if it were a normal current-month day instead of muted (two conflicting text-color utility classes were applied to the same button, and which one actually painted depended on Tailwind's internal rule order), and picking a preset (or any externally-driven range change) left both calendars showing whichever month happened to already be open instead of jumping to the new range's month (`defaultMonth` only seeds a `Calendar`'s initial display and is ignored after that). `DateRangePicker` now gives each `Calendar` a real controlled `month` that re-syncs whenever the range changes for a reason other than the user paging through it by hand.

## 1.0.0

### Major Changes

- v0 components
