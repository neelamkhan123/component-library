# @neelamkhan21/ui

## 1.1.2

### Patch Changes

- Add a `size` prop to `DateRangePicker` (`"sm" | "md" | "lg"`, matching `Button`'s own vocabulary minus `"icon"`). Previously the trigger always carried `buttonVariants({ size: "md" })` with no way to pick a different size other than overriding `className` — but that override never actually replaced the hardcoded size classes, it just added alongside them (e.g. `className="h-8 ..."` left both `h-8` and `h-10` on the same element, with Tailwind's generated stylesheet order silently deciding which one won). `size` now goes through the same `buttonVariants` call that resolves the variant/size combination cleanly, so there's no conflicting-class trap to fall into.

## 1.1.1

### Patch Changes

- Fix two `DateRangePicker`/`Calendar` bugs: an outside-month day could render as if it were a normal current-month day instead of muted (two conflicting text-color utility classes were applied to the same button, and which one actually painted depended on Tailwind's internal rule order), and picking a preset (or any externally-driven range change) left both calendars showing whichever month happened to already be open instead of jumping to the new range's month (`defaultMonth` only seeds a `Calendar`'s initial display and is ignored after that). `DateRangePicker` now gives each `Calendar` a real controlled `month` that re-syncs whenever the range changes for a reason other than the user paging through it by hand.

## 1.0.0

### Major Changes

- v0 components
