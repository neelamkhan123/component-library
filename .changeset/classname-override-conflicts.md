---
"neelam-ui": minor
---

`className` now reliably overrides a component's own styles. Class names are combined with `tailwind-merge`, so a utility you pass that conflicts with a component default replaces it instead of sitting alongside it:

```tsx
<Badge className="rounded-full bg-slate-900 px-6">Beta</Badge>
```

`Button`, `Badge`, `Input`, `Toggle` and `AlertDialog`'s action buttons were a second case of the same bug: they passed `className` into their cva variant call, which concatenates too, so their defaults were never overridable either. They now merge the same way every other component does.

Previously both classes reached the stylesheet with equal specificity, so which one applied came down to Tailwind's ordering of its generated output rather than to what you passed — `px-6` happened to beat a default `px-3`, while `bg-slate-900` silently lost to a default `bg-white`. Overrides that already worked keep working; ones that silently did nothing now take effect, which may reveal a `className` in your app that was never being applied.

`Sidebar` no longer forces `h-svh` on its `<aside>`. It stretches to the height of its `SidebarProvider` instead, so it stays viewport-tall in a normal app shell while also working inside a deliberately smaller container — a preview, a card, a split pane. Pair a fixed height with `min-h-0` to opt out of the provider's `min-h-svh` floor:

```tsx
<SidebarProvider className="h-72 min-h-0">…</SidebarProvider>
```
