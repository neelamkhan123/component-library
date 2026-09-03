---
"neelam-ui": minor
---

Added two new ways to build persistent app navigation:

- `Sidebar` accepts `collapsible="icon"` (alongside the existing default,
  now named `"offcanvas"`) so closing collapses it to a slim, still-visible
  icon rail instead of hiding it entirely — `SidebarMenuButton` keeps its
  label for assistive tech and resurfaces it as a `Tooltip` on hover/focus,
  and a new `iconWidth` prop (default `"4rem"`) sets the rail's width.
- A new `Toolbar`/`ToolbarButton` pair: a floating, always-icon-only rail of
  actions docked to a viewport edge (`side="left" | "right" | "top" |
  "bottom"`), implementing the WAI-ARIA Toolbar pattern's roving `tabIndex`
  and arrow-key navigation.

Both build on a new `asChild` prop on `TooltipTrigger`, which merges its
hover/focus handling directly onto a single child element (a real `<a>` or
`<button>`) instead of wrapping it in an extra `<span tabIndex={0}>` — for
annotating something that must stay the sole focusable node, without a
second, redundant tab stop.

All additive and backward compatible: existing `Sidebar` usage (`collapsible`
omitted) and `TooltipTrigger` usage (`asChild` omitted) are unchanged.
