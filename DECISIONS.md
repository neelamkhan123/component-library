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
  content's natural size and *is*. `motion-reduce:` drops the transition
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
  + `::-webkit-scrollbar { display: none }`). `CarouselPrevious`,
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
