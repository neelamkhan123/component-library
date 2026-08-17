# Accessibility Decisions Log

## Accordion

- Unlike `Dialog`, there's no native element that cleanly covers this: `<details>`/
  `<summary>` only gets exclusive-open grouping via the `name` attribute, has no
  built-in way to animate open/closed, and doesn't map onto a controlled
  `value`/`onValueChange` API without fighting the UA's own open-state handling.
  So `Accordion` instead hand-implements the WAI-ARIA Accordion pattern:
  `AccordionHeader` renders an `h3` wrapping an `AccordionTrigger` button with
  `aria-expanded`/`aria-controls`, and `AccordionContent` is a
  `div[role="region"]` linked back to the trigger via `aria-labelledby`.
- `AccordionContent`'s open/close is animated via a `grid-template-rows`
  transition (`0fr` ↔ `1fr` on a wrapper, `overflow-hidden` on the row inside
  it) rather than transitioning `height`, since `height: auto` isn't a
  transitionable value but `1fr` on a single-track grid resolves to the
  content's natural size and _is_. `motion-reduce:` drops the transition
  entirely, same as `Dialog`/`Drawer` (WCAG 2.3.3).
- A closed item's content stays mounted (at zero height) rather than being
  unmounted, so it's still there to animate open again — but that leaves its
  focusable descendants reachable by Tab and exposed to assistive tech even
  though they're visually clipped by the grid-rows trick, so `AccordionContent`
  sets `inert` on itself while closed. That removes it from both the tab order
  and the accessibility tree without touching `display` (which would fight the
  transition), and is dropped the moment the item opens.
- `type="single"` (default) keeps at most one item open, matching the common
  FAQ/settings-list accordion shape; `collapsible` (default `false`) chooses
  whether activating the already-open item closes it, mirroring `Dialog`'s
  approach of an explicit opt-in prop over a surprising default. `type="multiple"`
  switches to independent per-item state for cases like a multi-section reading
  view where more than one panel should stay open together.

## Avatar

- `AvatarImage` always mounts, even with a `src` that might 404 — its load
  state is tracked in context (`idle`/`loading`/`loaded`/`error`) rather than
  conditionally rendering the `<img>` itself, since the `load`/`error` events
  that drive that state only fire on a mounted element. `AvatarFallback`
  reads the same context and renders whenever the image isn't `loaded`, so a
  missing `src`, a still-loading image, and a broken image all resolve to
  the same visible state — initials or an icon — instead of a broken-image
  icon or an empty circle.
- `AvatarImage`'s `alt` is required (its `ImgHTMLAttributes` type is
  narrowed to make the otherwise-optional `alt` mandatory), the same
  non-optional treatment `Dialog` gives `DialogTitle`: an avatar conveys who
  or what it represents, so it needs a text alternative every time, not just
  when a caller remembers to add one.
- `AvatarFallback` takes an optional `delayMs` so callers can defer it past
  a brief loading window, avoiding an initials flash immediately before a
  fast-loading image replaces it — mirroring Radix's Avatar, which added the
  same option for the same reason.

## Breadcrumb

- Purely presentational — every other compound component in this library
  (`Accordion`, `Avatar`, `Dialog`) coordinates shared state through context,
  but a breadcrumb trail has none to coordinate: each `BreadcrumbItem` is
  independent, so the pieces are plain styled elements with no provider.
- `Breadcrumb` renders a native `<nav aria-label="breadcrumb">` around a
  `BreadcrumbList` `<ol>`, per the WAI-ARIA Breadcrumb pattern — an ordered
  list because the trail is a strict hierarchy, and the `nav` landmark plus
  label let assistive tech users jump straight to it and distinguish it from
  a page's primary navigation.
- `BreadcrumbPage` (the trail's last, current item) renders a plain `<span
aria-current="page">` rather than a link standing in for one. Other
  breadcrumb implementations reach for `role="link" aria-disabled="true"` on
  a span to keep it visually and structurally uniform with the real links
  around it, but that fabricates link semantics for something you can't
  actually activate — the current page has nowhere to navigate to — which
  is exactly the kind of hand-rolled-role substitute this library avoids
  elsewhere (see `Dialog`, `Button`) in favor of the plain element that
  already means what's intended.
- `BreadcrumbSeparator` and `BreadcrumbEllipsis` are marked
  `role="presentation"` and `aria-hidden="true"`. Screen readers already
  announce each item's position from the `<ol>` itself (e.g. "2 of 3"), so
  an unhidden separator glyph between every pair of items would be
  redundant noise on top of that, not new information.

## Button

- Used a native `<button>` element rather than a `<div>` with `role="button"`,
  so keyboard support (Enter/Space activation, focus handling) comes for free
  from the browser instead of being hand-rolled.
- `aria-busy` is set during the loading state so screen readers are told the
  control is mid-operation, since the visible label text changes to "Loading…"
  which alone isn't reliably announced.
- `disabled` is applied during loading too, preventing duplicate submissions
  from repeated activation while an action is in flight.

## Carousel

- Built on native CSS scroll-snap (`overflow-x-auto` + `snap-x snap-mandatory`
  on `CarouselContent`, `snap-start` on each `CarouselItem`) rather than a
  drag/transform-based carousel library or hand-rolled pointer-event slide
  logic, so swipe, trackpad scrolling, and momentum all come from the
  browser — the same "let the platform do it" reasoning behind `Dialog`
  using the native `<dialog>` element instead of a hand-rolled modal.
- Which slide counts as "current" is derived from an `IntersectionObserver`
  watching each `CarouselItem` against the scroll container, not computed
  from `scrollLeft` divided by an assumed item width, so it stays correct
  even when `CarouselItem`s aren't all the same size (e.g. a "1.5 slides
  visible" layout via a fractional `basis-*` override).
- The scroll container's native scrollbar is hidden (`scrollbar-width: none`
  - `::-webkit-scrollbar { display: none }`). `CarouselPrevious`,
    `CarouselNext`, and `CarouselDots` already provide the same navigation
    affordance visually, so the browser's own scrollbar chrome is redundant
    clutter on top of them — swiping, trackpad scrolling, and the arrow keys
    all still work identically; only its rendering is suppressed.
- `Carousel` renders `role="region" aria-roledescription="carousel"` and
  each `CarouselItem` renders `role="group" aria-roledescription="slide"`,
  per the WAI-ARIA Carousel pattern, so assistive tech announces the
  structure even though none of it is native HTML semantics.
- Arrow-key navigation is wired to a `keydown` handler on the `Carousel`
  root rather than giving the root its own `tabIndex` — it fires once focus
  bubbles up from something already focusable inside (a nav button, a dot,
  or interactive slide content), so keyboard users get ArrowLeft/ArrowRight
  navigation without the region picking up an extra, unlabeled stop in the
  tab order that wasn't there before.
- `CarouselPrevious`/`CarouselNext` disable themselves at the ends
  (derived from the container's `scrollLeft` vs. `scrollWidth`/`clientWidth`)
  rather than hiding, so their position in the layout — and in the tab
  order — stays stable as the carousel scrolls.

## Checkbox

- Renders a real `<input type="checkbox">`, restyled with `appearance-none`
  and Tailwind's `checked:`/`indeterminate:` variants, instead of a hidden
  native input paired with a fake `div`-based visual (the approach some
  other libraries use to get a fully custom look). Keyboard activation
  (Space), focus, label association, and participation in a native
  `<form>`'s submitted data all come from the browser for free — the same
  native-element-first reasoning as `Dialog`'s `<dialog>` and `Button`'s
  `<button>`.
- No `CheckboxLabel` component: an ordinary `<label>` wrapping a `Checkbox`
  and its text already toggles the checkbox when the text is clicked,
  because that's native `<label>`/`<input>` behavior, not something this
  library needs to reimplement. See the stories for the pattern.
- `checked` accepts `true`, `false`, or `"indeterminate"` — mirroring Radix
  Checkbox's tri-state API — but internally maps `"indeterminate"` to the
  DOM's own `.indeterminate` property via a ref effect, since indeterminate
  isn't a real HTML attribute or React prop and can only be set
  imperatively. Passing `"indeterminate"` also forces the native `checked`
  value to `false`, so a controlled "select all" checkbox's boolean state
  and its indeterminate visual never fight each other.
- The checkmark/dash icons layered over the box are `aria-hidden` and
  `pointer-events-none` — purely visual, shown/hidden via `peer-checked`/
  `peer-indeterminate` off the real input's pseudo-classes. The checkbox's
  state is already communicated by the native input's own checked/
  indeterminate properties (and its accessible name), so the icons add
  nothing for assistive tech to announce.
- No separate uncontrolled-state bookkeeping (unlike `Accordion`): because
  the real element is a native `<input>`, React's own controlled/
  uncontrolled `checked`/`defaultChecked` handling is reused directly
  rather than reimplemented.

## Context Menu

- `ContextMenuContent` is a native popover (`popover="auto"`) rather than a
  hand-rolled floating `<div>` positioned with a portal — the same
  native-element-first reasoning as `Dialog`'s `<dialog>`. Top-layer
  rendering, Escape-to-close, and outside-click light-dismiss all come from
  the browser; none of it is reimplemented here. The one thing `<dialog>`
  gives `Dialog` for free that popovers don't is auto-focusing something on
  open, so `ContextMenuContent` focuses the first item itself.
- `showPopover()` is called from inside a `requestAnimationFrame` callback,
  not synchronously in the effect that reacts to the triggering
  `contextmenu` event. This isn't stylistic — verified directly against a
  real, unpatched `npm run storybook` dev server (Playwright driving actual
  trusted mouse input, not `fireEvent`) that calling it synchronously, or
  even deferred by a microtask via `queueMicrotask`, opens the popover only
  for the browser's _own_ internal handling of that same contextmenu
  gesture to silently close it again around 100ms later — `:popover-open`
  never even matches in between, so the menu just never visibly appears.
  Deferring past the next paint is what actually avoids the race, which is
  also why positioning and the initial-focus call live inside that same
  callback rather than a separate effect: by the time it runs, the popover
  has genuinely finished opening, so `getBoundingClientRect()` reflects its
  real size instead of a still-hidden zero rect.
- Popovers expose their open state as the `:popover-open` CSS pseudo-class,
  not a reflected `[open]` attribute the way `<dialog>`/`<details>` do — so
  unlike `Dialog`/`Accordion`, this can't use Tailwind's built-in `open:`
  variant and spells out `[&:popover-open]` instead. Likewise, the native
  `close` event `Dialog` treats as its source of truth for closing doesn't
  exist on popovers; the equivalent here is the `toggle` event, checked for
  `newState === "closed"`.
- Position is computed from the triggering `contextmenu` event's
  `clientX`/`clientY`, then clamped to the viewport after the popover is
  shown (so its real, laid-out dimensions are known) rather than guessed at
  beforehand — this is plain `position: fixed` math, not CSS anchor
  positioning (`anchor-name`/`position-anchor`): there's no persistent DOM
  anchor at an arbitrary cursor point for that to attach to, and the
  feature's browser support doesn't yet clear the bar this library holds
  other native-platform choices to.
- Background scroll is locked (`document.body.style.overflow = "hidden"`)
  while the menu is open, the same treatment and the same reasoning as
  `Dialog`: the menu's `position: fixed` coordinates are pinned to wherever
  the cursor was on open, not to whatever ends up under them, so a page
  that keeps scrolling underneath is disorienting rather than just visually
  busy — a scroll lock protects a positioning invariant, not merely a
  modal's usual "nothing else moves" convention.
- `ContextMenuItem` renders a native `<button role="menuitem">` rather than
  a `<div>` with click handling bolted on, so Enter/Space activation and
  focusability come from the browser — its role is recategorized into the
  composite `menu` widget per the WAI-ARIA Menu pattern, the same
  interactive-element-plus-role-override approach `AccordionTrigger` uses.
- Item highlighting uses `focus:` rather than `focus-visible:`, unlike every
  other interactive control in this library (`Button`, `AccordionTrigger`,
  `CarouselPrevious`, …). A menu's current item is the primary way it shows
  "you're here" — the same way OS context menus highlight the hovered or
  focused item unconditionally — not just an accessibility nicety for
  keyboard users, so it isn't restricted to keyboard-only focus the way
  those controls' focus rings are.
- Submenus and checkbox/radio items are intentionally not included in this
  pass — each adds real complexity (nested popovers with hover-intent
  timing, or extra ARIA state to track) beyond what a first version needs,
  rather than being an oversight.
- Escape/outside-click dismissal is browser behavior this component's own
  code never touches, so `Checkbox.test.tsx`-style jsdom unit tests can't
  verify it — and it turns out real Chromium can't either, at least not
  through `@testing-library/user-event`: pressing `{Escape}` there dispatches
  a synthetic, non-trusted `keydown`, and this engine's native popover
  light-dismiss doesn't respond to it (confirmed directly — swapping the
  assertion to close via a `ContextMenuItem` click, which runs through this
  component's own `hidePopover()` call instead of the browser's native
  dismissal, passes immediately). So the "Interactive" story's `play`
  function verifies everything this component's code _is_ responsible for
  against real Chromium (opening at the cursor, auto-focus, roving focus,
  closing via an item), and Escape/outside-click are left to manual
  verification in Storybook's UI, where real keyboard/mouse input is trusted.

## Dialog

- Built on the native `<dialog>` element (shown via `showModal()`) instead of
  a hand-rolled `<div role="dialog">`, so focus trapping, initial focus,
  focus restoration to the trigger on close, top-layer stacking, and
  Escape-to-close all come from the browser instead of being reimplemented.
- `DialogContent` requires a `DialogTitle` descendant, which supplies the
  dialog's accessible name via `aria-labelledby`. This mirrors how other
  accessible dialog primitives (e.g. Radix) treat a title as non-optional.
- The native `close` event (fired by Escape or `dialog.close()`) is treated
  as the single source of truth for closing — `DialogClose` and the backdrop
  click handler call the DOM `close()` method rather than setting state
  directly, so every closure path (Escape, backdrop, close button, custom
  trigger) funnels through one state update instead of racing.
- Background scroll is locked (`document.body.style.overflow = "hidden"`)
  while the dialog is open, since the native element doesn't do this itself
  and a scrollable page behind a fixed-position modal is disorienting for
  sighted and screen-reader users alike.
- The open/close fade+scale is pure CSS (`@starting-style` + `transition-behavior:
allow-discrete`, via Tailwind's `starting:`/`open:`/`transition-discrete`
  utilities) rather than JS-timed classes, so it stays in sync with the
  browser's own top-layer/`display` handling instead of racing it. Every
  transitioned property is dropped under `motion-reduce:` so the dialog snaps
  open/closed instantly for users who've asked for reduced motion (WCAG 2.3.3).
- Note for anyone extending the transition: Tailwind v4 animates `scale`/
  `translate`/`rotate` as their own standalone CSS properties, not through
  `transform` — `transition-[opacity,transform,...]` compiles fine but silently
  doesn't animate a `scale-*`/`translate-*` utility. List the specific property
  (`scale`, `translate`) instead. This only shows up with real CSS loaded and
  computed styles sampled mid-transition; DOM-only assertions won't catch it.

## Drawer

- A drawer is a `Dialog` with different `Content` panel styling — opening,
  closing, focus handling, and labeling are all identical — so `Drawer`,
  `DrawerTrigger`, `DrawerClose`, `DrawerHeader`, `DrawerTitle`,
  `DrawerDescription`, and `DrawerFooter` are the exact same components as
  their `Dialog` counterparts, re-exported under drawer-flavored names. Only
  `DrawerContent` (the native `<dialog>`'s size/position/slide-direction, via
  a `side` prop) is genuinely new. The shared native-`<dialog>` plumbing
  (`showModal()`/`close()` effect, scroll lock, native-close sync) lives in
  `useDialogPanel` in `Dialog.tsx` so both `Content` components stay
  consistent instead of drifting.
- Each `side` pins the panel flush against one edge via `inset`/explicit
  sizing (overriding the `<dialog>` UA default of `width/height: fit-content`,
  which would otherwise just shrink-wrap the content instead of filling the
  edge) rather than centering, and slides in/out with the same
  `@starting-style` + `allow-discrete` + `motion-reduce:` pattern as `Dialog`.

## Dropdown Menu

- A dropdown menu is a `ContextMenu` triggered by clicking a real button
  instead of right-clicking, positioned below that button instead of at the
  cursor — the exact same relationship `Drawer` has to `Dialog`. Everything
  about the menu panel itself (the native popover, its
  `requestAnimationFrame`-deferred opening, roving keyboard focus, scroll
  lock, light-dismiss) is identical, so `DropdownMenuContent`,
  `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel`, and
  `DropdownMenuShortcut` are the exact same components as their
  `ContextMenu` counterparts, re-exported under dropdown-flavored names.
  Only `DropdownMenuTrigger` (a real `<button>`, where `ContextMenuTrigger`
  is a plain `<div>` listening for `contextmenu`) is genuinely new.
- The shared open/position state and the `showPopover()`-timing fix live in
  `ContextMenu.tsx` itself rather than a separately extracted hook, the same
  choice `Dialog.tsx` made keeping `useDialogPanel` alongside `Dialog`
  rather than in its own file: `ContextMenu` remains the canonical
  implementation, and `DropdownMenu` builds on it by name, not on a
  renamed-to-be-generic abstraction neither component would read as
  "belonging" to. A new `useContextMenu()` hook (mirroring `useDialog()`)
  is the one addition `DropdownMenuTrigger` needed to hook into that state
  from outside `ContextMenuTrigger`.
- `DropdownMenuTrigger` sets `aria-haspopup="menu"` and `aria-expanded`,
  per the WAI-ARIA Menu Button pattern — `ContextMenuTrigger` has neither,
  since a context menu isn't associated with a specific "opener" control in
  the accessibility tree the way a dropdown's trigger button is.
- ArrowDown/ArrowUp on the (closed) trigger open the menu with the
  first/last item focused respectively, also per the Menu Button pattern.
  This needed one small, backward-compatible addition to the shared
  `Position` state — an optional `initialFocus: "first" | "last"` — since
  `ContextMenuContent`'s auto-focus behavior on open otherwise always
  targets the first item, which is right for `ContextMenuTrigger` (no
  keyboard-driven "open with the last item" case exists for a right-click)
  but not sufficient for the dropdown's ArrowUp case.
- No `align`/flip-to-the-opposite-side placement in this pass —
  `DropdownMenuTrigger` always positions the menu below-left-aligned to
  itself, relying on `ContextMenuContent`'s existing viewport clamp to pull
  it back on-screen near an edge rather than truly flipping sides. The
  clamp already gets most of the practical benefit; real flipping needs the
  content's measured size fed back into which *side* to open on, not just
  where to clamp to, which is a deliberate scope cut, not an oversight —
  the same spirit as `ContextMenu` leaving out submenus.

## Input

- Renders a native `<input>`, with `size`/visual language matching
  `Button`'s, rather than a wrapper that shadows an inner native input the
  way some component libraries do — `type` (`email`, `password`, `search`,
  `number`, …), typing, selection, and native `<form>` participation all
  come from the browser as a result, with nothing about typing itself
  reimplemented here.
- Invalid state is styled off `aria-invalid` directly (an
  `aria-invalid:border-red-500` variant, no plain-CSS-selector equivalent
  needed since it's a real attribute), rather than a separate `invalid` or
  `error` boolean prop. A caller already needs to set `aria-invalid="true"`
  for assistive tech to announce the field as invalid — adding a parallel
  prop would just be a second, easy-to-forget place that same fact has to
  be kept in sync, for a purely visual difference that comes for free once
  the accessible one is set correctly.
- No bundled label or helper/error-text component. An ordinary `<label>`
  wrapping (or `htmlFor`-linked to) an `Input` already associates the two
  and makes clicking the label text focus the input, natively — the same
  reasoning `Checkbox`'s decisions above give for not having a
  `CheckboxLabel`. A `Label`/`FormField`-style component that also wires up
  helper and error text via `aria-describedby` would be a reasonable next
  addition, but is a distinct component in its own right, not something an
  `Input` needs to bundle to be complete on its own.
- Native `InputHTMLAttributes` already has a `size` attribute (the
  character-width one, rarely used), which collides with this component's
  own `size` variant (`"sm"`/`"md"`/`"lg"`, matching `Button`) — the native
  one is omitted from `InputProps` rather than the variant renamed, since
  `size="sm"`/`"md"`/`"lg"` is the more useful meaning for how this
  component is actually used, and the native attribute has no visual
  effect once a `width` is already set via `className` anyway (which is
  the norm here, given `Input` has no default width itself).

## Pagination

- Deliberately presentational, like `Breadcrumb`: there's no internal
  "current page" state or context to coordinate, since a real app's
  current page virtually always already lives in a URL or query state a
  caller owns. Forcing an internal state model here would just fight that
  external source of truth instead of simplifying anything — unlike
  `Accordion`/`Carousel`/`ContextMenu`, where owning state genuinely does
  simplify usage because there's no equally-natural external owner for it.
- `getPaginationRange({ currentPage, totalPages, siblingCount })` is
  exported alongside the components — a pure function, not a hook, since
  it's a plain computation with no DOM or lifecycle involved. It's the one
  piece of this component that *isn't* purely presentational, because it's
  fiddly enough, and easy enough to get subtly wrong at the boundaries
  (off-by-one truncation, jumps between "contiguous near the edge" and
  "ellipsis" modes), that it's worth providing rather than leaving every
  consumer to re-derive — the same reasoning `Carousel`'s `IntersectionObserver`-driven
  current-slide tracking gets built in rather than left to guesswork from
  scroll position.
- `PaginationLink` renders a native `<button>`, not an `<a>` the way
  `BreadcrumbLink` does. A breadcrumb trail is reasonably assumed to
  represent real navigable URLs, but whether changing pages here should
  actually navigate (vs. update local or query state without a URL change)
  genuinely varies by app — and an `<a>` with no `href` isn't
  keyboard-focusable, which would be an easy, silent accessibility
  regression for the (very common) apps that use pagination as pure local
  state. A `<button>` sidesteps that trap entirely; add `href` handling
  yourself if your pagination does navigate.
- `PaginationEllipsis` is marked `role="presentation"`/`aria-hidden="true"`,
  the same treatment `BreadcrumbEllipsis` gets and for the same reason:
  it's a stand-in for skipped page numbers, not information assistive tech
  needs to announce on its own.
- `PaginationPrevious`/`PaginationNext` take no `disabled`-deriving
  page-count props of their own — same as the rest of this component,
  that's state this component doesn't own, so `disabled` is just forwarded
  through `ButtonHTMLAttributes` for a caller to set from `currentPage`/
  `totalPages` however it already tracks them.
