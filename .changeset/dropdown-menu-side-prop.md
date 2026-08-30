---
"@neelamkhan21/ui": minor
---

`DropdownMenuTrigger` now accepts a `side` prop (`"top" | "bottom"`, defaulting to `"bottom"`, its existing behavior) so a trigger sitting near the bottom of the viewport — a sidebar footer's account menu, say — can open its menu upward instead of getting clamped to the bottom of the viewport rather than actually landing next to the trigger. Optional and backward compatible — omitting it opens below exactly as before.
