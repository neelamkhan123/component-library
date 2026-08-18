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

## RadioGroup

- `RadioGroupItem` renders a real `<input type="radio">`, restyled with
  `appearance-none`, the same treatment `Checkbox` gives its own input —
  but radio inputs get *more* out of that choice than checkboxes do:
  every item in a `RadioGroup` shares one `name` (generated via `useId()`
  if a caller doesn't supply one), so mutual exclusivity comes from the
  browser the way it always would for a plain HTML form, and arrow-key
  navigation between options — moving both focus and selection together —
  is native `<input type="radio">` behavior with a shared `name`, not
  something this component implements. Verified directly that this holds
  even under jsdom (unlike, notably, `ContextMenu`'s popover-related native
  behaviors, which jsdom doesn't implement at all) — arrow-key navigation
  between grouped radios is old, stable, universally-supported browser
  behavior in a way the Popover API isn't yet, so it didn't need the same
  real-Chromium verification `ContextMenu`'s "Interactive" story provides
  for its own native-behavior claims.
- Neither the group nor `RadioGroupItem` sets an explicit ARIA role: a
  native `<input type="radio">` already has an implicit role of `radio`,
  and its `checked` property is already the accessibility-tree-exposed
  state — unlike `AccordionTrigger` or `ContextMenuItem`, which render a
  `<button>` and need their role explicitly recategorized for the widget
  they're part of, there's nothing to override here.
- `RadioGroup` renders `<div role="radiogroup">` rather than a native
  `<fieldset>`/`<legend>` pair, even though a `<fieldset>` is the more
  purely "native" way to group and name a set of form controls. `<legend>`
  is notoriously fiddly to style consistently, and `role="radiogroup"` +
  a caller-supplied `aria-label`/`aria-labelledby` is a well-established,
  fully accessible alternative other component libraries reach for for
  exactly that reason — the same kind of pragmatic call `Breadcrumb`/
  `Pagination` make using `nav` + `aria-label` rather than some more
  exotic native list-of-links element.
- No bundled label component, matching `Checkbox`/`Input`: an ordinary
  `<label>` wrapping a `RadioGroupItem` and its text already associates
  the two and makes clicking the text select the radio, natively.

## Select

- Not built on a native `<select>` — the one place in this library where
  the usual "restyle the real native element" approach (`Checkbox`,
  `RadioGroup`, `Input`) doesn't hold up: most browsers don't let CSS
  reach the open dropdown's own `<option>` list at all (padding, hover
  color, radius are outside its control), so getting the sleek, consistent
  look the rest of this library has means a trigger button plus a popup
  listbox instead.
- Not built *on* `ContextMenu` either, unlike `DropdownMenu`. It draws on
  the exact same proven techniques (native popover, `requestAnimationFrame`-
  deferred `showPopover()`, scroll lock, roving keyboard focus via real DOM
  focus) — but as a fresh, self-contained implementation, because a
  listbox's semantics (`role="listbox"`/`"option"`, `aria-selected`, a
  persistent single selection) differ from a menu's (`role="menu"`/
  `"menuitem"`, activate-and-close) enough that reusing `ContextMenu`'s
  components directly would mean parameterizing their roles and item
  selectors to serve a second, meaningfully different pattern — more
  indirection than the reuse would actually save. `DropdownMenu` reuses
  `ContextMenu` precisely because it *is* structurally identical (same
  role, same item selector, just re-triggered); `Select` isn't.
- Verified directly via axe that `role="listbox"` doesn't permit a
  `role="separator"` child the way `role="menu"` does (the ARIA spec's
  required-owned-elements differ between the two patterns) — `SelectSeparator`
  therefore renders with no ARIA role at all, unlike `ContextMenuSeparator`.
  This surfaced only by actually running the accessibility check, not from
  reasoning about the two patterns' surface similarity beforehand.
- Also verified directly via axe: `SelectTrigger`'s `role="combobox"`
  doesn't get "name from content" the way a plain `<button>` does, so
  visible text alone (via `SelectValue`) isn't a sufficient accessible
  name — it needs a wrapping `<label>` or `aria-label`, exactly like a
  native `<select>` does. This is a real requirement of the role, not a
  gap in this component to fix, so every story wraps `SelectTrigger` in a
  `<label>` to model that rather than the component trying to supply a
  name on a caller's behalf.
- `SelectContent` measures the trigger's width when opening and applies it
  as the panel's `min-width` — a native `<select>`'s dropdown is never
  narrower than the closed control, and a listbox that's narrower than its
  own trigger reads as visually broken in a way a menu positioned at a
  cursor point doesn't have an equivalent expectation for.
- On open, focus resumes on the already-selected option (falling back to
  the first) rather than always the first, the same way a native
  `<select>`'s dropdown opens scrolled to your last choice — `DropdownMenu`
  has no equivalent concept, since its items don't represent a persistent
  selection.
- Selecting an option, and dismissing without one (Escape, an outside
  click), both return focus to the trigger — handled in one place
  (`SelectContent`'s `onToggle` handler) since native `hidePopover()`
  fires a `toggle` event regardless of which of those closed it, rather
  than duplicating a `.focus()` call at each call site. `ContextMenu`/
  `DropdownMenu` don't do this, since returning focus to "whatever was
  right-clicked" or "the menu button" isn't expected there the way
  returning to a select control after choosing a value is.
- Typeahead (jumping to an option by typing its first letter, standard
  native `<select>` behavior) isn't included in this pass — it needs a
  buffered, timeout-reset input model that's a genuinely separate chunk of
  complexity from arrow-key roving focus, the same kind of deliberate
  scope cut `ContextMenu` documents for submenus and `DropdownMenu` for
  `align`/flip placement, not an oversight.

## Switch

- `Switch` is `Checkbox`'s sibling, not a new invention: WAI-ARIA
  describes the `switch` role as literally "a checkbox that can be used as
  a switch," so this renders a real `<input type="checkbox" role="switch">`
  — the same native-element-plus-role-override technique `ContextMenuItem`/
  `AccordionTrigger` use for a `<button>`, applied here to a checkbox
  instead. Keyboard toggling (Space), focus, label association, and native
  `<form>` participation all come from the browser as a result, exactly as
  they do for `Checkbox`.
- No `indeterminate` equivalent, unlike `Checkbox` — a switch is always
  simply on or off; there's no real-world "partially on" switch the way a
  "select all" checkbox has a genuine mixed state to represent, so
  `SwitchProps` doesn't carry the `boolean | "indeterminate"` shape
  `CheckedState` gives `Checkbox`.
- The sliding thumb needs `translate-x` (driven by `peer-checked`, on an
  `aria-hidden` sibling span layered over the real input, the same overlay
  structure `Checkbox`'s Check/Minus icons use) rather than `Checkbox`'s
  opacity fade — a switch's whole visual language is "the thumb moved to
  the other side," where a checkbox's is "a mark appeared," so the same
  peer-driven-overlay technique animates a different property.
- The thumb is a fixed white circle in almost every state, relying on a
  small `shadow-sm` rather than color contrast to read against a light
  "off" track — except in dark mode's "on" state, where the track itself
  becomes white (matching the checked/active/selected "inverted
  high-contrast color" language used everywhere else in this library —
  `Checkbox`, `Button`'s default variant, `PaginationLink`'s `isActive`),
  which would make a white thumb disappear against it. `dark:peer-checked:
  bg-slate-950` is the one place the thumb's color changes, and it's there
  specifically to stay visible against that one combination, not a
  stylistic flourish.
- No bundled label, matching `Checkbox`/`RadioGroup`/`Input`: an ordinary
  `<label>` wrapping a `Switch` and its text already associates the two
  and makes clicking the text toggle it, natively.

## Tabs

- Arrow keys move focus *and* switch the active tab together —
  "automatic activation," in the WAI-ARIA Tabs pattern's own terms —
  unlike the roving focus in `ContextMenu`/`Select`, where arrow keys only
  move focus and a separate click/Enter confirms a choice. This is a
  deliberate difference in kind, not an inconsistency to reconcile: tabs
  switching as you arrow through them is the expected behavior (a browser's
  own tab strip works the same way), whereas a menu or listbox option might
  represent a destructive or otherwise consequential action you shouldn't
  trigger just by passing through it on the way to what you actually meant
  to pick.
- Only the active tab has `tabIndex={0}`; every other `TabsTrigger` is
  `tabIndex={-1}` — standard roving tabindex for this pattern, so pressing
  Tab moves past the whole tab strip in one step (into the active panel,
  since `TabsContent` is itself `tabIndex={0}`) rather than through every
  tab in it. `ContextMenu`'s/`Select`'s popups use the simpler "just call
  `.focus()` on the next item" approach instead, since Tab doesn't need to
  skip past them the same way — closing them takes it out of the tab order
  entirely.
- `TabsContent` renders only the active panel — inactive ones return
  `null`, not hidden-but-mounted the way `Accordion`'s closed content
  stays mounted (there, to animate open again). Switching tabs isn't
  animated here, so there's nothing to gain from keeping inactive panels
  around, and unmounting is simpler than `Accordion`'s `inert`-while-closed
  treatment. The trade-off is real and undocumented nowhere else but
  here: a panel's own state (scroll position, an uncontrolled input's
  value) is lost when you switch away and won't be there if you switch
  back.
- `orientation="vertical"` is supported (swapping ArrowLeft/Right for
  ArrowUp/Down, and `TabsList`'s layout from a row to a column) rather than
  deferred the way `DropdownMenu` defers `align` or `Select` defers
  typeahead — the WAI-ARIA Tabs pattern documents vertical orientation as
  a first-class variant, not a nice-to-have layered on top, so leaving it
  out would make horizontal-only tabs feel like an incomplete
  implementation of the pattern rather than a deliberately scoped one.

## Textarea

- `Input`'s sibling in every respect but the element: same border/focus/
  disabled visual language, and invalid state is styled off `aria-invalid`
  directly for the exact reasoning `Input`'s entry gives (it's already the
  real signal a caller sets for assistive tech, so a separate `invalid`
  prop would just be a second place to keep it in sync).
- No `size` variant, unlike `Input`'s `"sm"`/`"md"`/`"lg"` — a text field's
  height is a fixed, meaningful visual weight (`h-8`/`h-10`/`h-12`), but a
  textarea's height is inherently content-driven (`rows`) and usually
  meant to be resized by whoever's typing into it, so a preset height
  scale would fight both of those rather than usefully describing the
  control the way it does for `Input`.
- Resizing is restricted to vertical only (`resize-y`, not the browser
  default of both axes), and disabled entirely once the field itself is
  `disabled` (`disabled:resize-none`) — horizontal resizing routinely
  breaks a form's column layout in a way vertical resizing doesn't, and a
  disabled field shouldn't invite an interaction (dragging a resize
  handle) that looks like it does something.
- `rows` defaults to `3` rather than leaving the unset native default of
  `2`, which reads as noticeably cramped for a control whose entire reason
  for existing (over `Input`) is holding more than one line.
- Auto-grow-with-content isn't included in this pass. The modern CSS
  answer, `field-sizing: content`, doesn't yet clear the browser-support
  bar this library holds other native-platform choices to (see `ContextMenu`
  on CSS anchor positioning for the same reasoning applied elsewhere), and
  the JS alternative — measuring `scrollHeight` and resizing on every
  input — is a meaningfully separate feature, not a natural extension of
  what's here, so it's a deliberate scope cut rather than an oversight.

## Toast

- The one component in this library that isn't composed declaratively in
  JSX: `toast()` is a plain function, callable from anywhere — a click
  handler, a promise's `.catch()`, code with no component above it at all
  — which is the whole point of a toast (the thing that tells you an
  action succeeded or failed generally isn't rendered by the same
  component that triggered the action). That rules out React context or
  component state as the source of truth, since neither is reachable from
  outside a component tree; the toast list lives in a plain module-level
  store instead, and `Toaster` reads it via `useSyncExternalStore` — the
  API React itself provides specifically for a component to subscribe to
  state that isn't React's.
- `Toaster` renders into a `createPortal(..., document.body)` — the one
  component here that uses a portal. Every other "floats above everything"
  component got that from a native platform feature instead (`Dialog`'s
  `<dialog>` top layer, `ContextMenu`/`Select`'s `popover` top layer), but
  there's no equivalently clean native primitive for a passive,
  non-modal notification stack — a portal plus fixed positioning and a
  high `z-index` is the standard, pragmatic answer real toast libraries
  reach for in that gap, not a first choice being passed over.
- Also the one component needing an SSR-safety mount guard (rendering
  `null` until a `useEffect` confirms the client has mounted, before
  calling `createPortal`) — `document.body` doesn't exist during server
  rendering, and unlike every other component here, a portal needs it at
  render time, not just inside an effect the way `Dialog`'s
  `document.body.style.overflow` does.
- Each toast gets its own `role="status"` (or `role="alert"` for
  `variant="destructive"`) rather than one shared live region wrapping the
  whole stack — both roles already imply the right `aria-live` politeness
  level on their own, and a screen reader announces content the moment
  it's inserted into either kind of region, so a freshly-mounted toast
  gets announced simply by existing. A single shared region covering
  every toast would need to diff "what actually changed" itself to get
  the same result.
- The enter animation uses `@starting-style` on a plain, freshly-inserted
  `<div>` — no popover or `<dialog>` involved, unlike everywhere else this
  library uses that CSS feature. `@starting-style` applies to any element
  on its first successful style update, not only elements toggling out of
  `display: none`, so a brand-new toast being appended to the list
  qualifies on its own.
- The exit removal is the classic two-phase technique instead — flag the
  toast `closing`, let its CSS transition play, then actually drop it from
  the array after a `setTimeout` matched to that transition's duration.
  There's no discrete native toggle to hook into here the way `<dialog>`'s
  `close` event or a popover's `toggle` event give `Dialog`/`ContextMenu`
  their removal timing for free, since a toast is just a plain array
  entry with no browser-native open/closed state of its own.
- Hovering a toast pauses its auto-dismiss timer, restarting it with the
  full `duration` on mouse-leave rather than precisely tracking and
  resuming the remaining time. That's a deliberate, minor simplification
  — it means hovering briefly then leaving resets the countdown a little
  more generously than the strictest reading of "paused" would, which
  errs toward not dismissing a message out from under someone reading it
  rather than the reverse.
- Reusing an `id` across `toast()` calls updates that toast in place
  instead of stacking a duplicate, supporting a "Loading…" → "Done!"
  pattern as one continuous notification rather than two. This mirrors
  Sonner's real-world API shape deliberately: for the one component here
  that's an imperative function rather than a set of composable elements,
  following an established, widely-used API design is worth more than
  inventing a new shape from scratch, the same instinct behind borrowing
  the WAI-ARIA APG patterns verbatim for every ARIA-role-driven component
  in this library.
- Swipe-to-dismiss isn't included in this pass — a real gap next to mature
  toast libraries, and a genuinely separate chunk of pointer-gesture
  handling from anything else here, so it's a deliberate scope cut in the
  same spirit as `ContextMenu`'s submenus or `Select`'s typeahead, not an
  oversight. The exit animation is a plain fade in place (no directional
  slide) specifically so it doesn't visually imply a swipe affordance that
  isn't actually implemented.

## Toggle

- A distinct primitive from `Switch`, not a restyled version of it: a
  toggle button is for a toolbar-style on/off *action* (bold/italic
  formatting, a view filter) rather than a persistent form value, so it
  renders a native `<button aria-pressed>` instead of `Switch`'s
  `<input type="checkbox" role="switch">`. Per WAI-ARIA, a button with
  `aria-pressed` already *is* a complete toggle button — unlike every
  other state-driven control in this library, there's no role to
  recategorize (a `<button>`'s implicit role is already right) and no
  native form element being restyled underneath; it's just a `<button>`
  with one attribute carrying both the accessibility state and, via
  Tailwind's built-in `aria-pressed:` variant, the pressed styling too —
  the same "let the real attribute drive the look" approach `Input`'s
  `aria-invalid:` and `Checkbox`'s `checked:` use.
- Tracks `pressed` with its own `useState`, unlike `Checkbox`/`Switch`,
  which defer their controlled/uncontrolled `checked` to the native
  `<input>` itself. A plain `<button>` has no built-in notion of a
  persistent pressed state the way a checkbox input does, so there's no
  native mechanism here to defer to in the first place.
- `size="icon"` (matching `Button`'s own icon-size variant exactly) is
  included from the start rather than treated as an add-on, since a
  `Toggle`'s single most common real shape — a lone icon in a formatting
  toolbar — is an icon-only button, not one with a visible text label.

## Tooltip

- Hover- and focus-triggered, not click-triggered — the one thing that
  most separates this from `ContextMenu`/`DropdownMenu`/`Select`. It also
  never receives focus itself, never traps focus, and — unlike every
  other popover-based component in this library — does **not** lock
  background scroll while open: a tooltip is a transient hint alongside
  whatever you're already doing, not something you step into the way a
  menu or a modal is, so treating it as if it were would be actively
  wrong, not just unnecessary.
- Focus shows the tooltip immediately; hover waits `delayDuration`
  (default `300`ms). This is deliberate, not an inconsistency: focus is a
  discrete, deliberate action a keyboard user took, where a mouse passing
  over incidentally on its way elsewhere is exactly what the hover delay
  exists to absorb.
- `TooltipTrigger` renders a plain `<span tabIndex={0}>`, not a `<button>`
  — unlike every other Trigger in this library. A tooltip's trigger is
  often something with no click behavior at all (a truncated label, a
  status icon, a piece of defined text mid-sentence), and claiming button
  semantics for content that does nothing on click/Enter/Space would
  misdescribe it. The `tabIndex` is what makes it focusable at all, which
  is what satisfies the WAI-ARIA requirement that a tooltip be reachable
  by keyboard, not mouse hover alone.
- `TooltipContent` is a native popover (`popover="manual"`, not `"auto"`)
  — top-layer rendering (escaping a scrolling ancestor's `overflow:hidden`
  the way `ContextMenu`'s does) still comes from the browser, but light-
  dismiss doesn't, since `"auto"`'s outside-click/Escape handling isn't
  the right mechanism for how a tooltip actually needs to close (on
  mouse-leave, on blur, and yes still on Escape and a scroll — just
  triggered by this component's own code instead of the browser's).
  `showPopover()` is still deferred a frame via `requestAnimationFrame`,
  the same as `ContextMenu` — verified directly that it's not strictly
  necessary for a hover/focus-triggered open the way it is for
  `ContextMenu`'s `contextmenu`-triggered one (there's no competing native
  handling of a `mouseenter`/`focus` event the way there is for
  `contextmenu`), but kept anyway for consistency with the one proven
  opening sequence this library uses for every popover.
- `TooltipContent` also portals into `document.body` — the second
  component here to do that, after `Toast`, and for a different reason.
  Discovered directly, not anticipated: wrapping a `<Tooltip>` around a
  word inside a `<p>` (a completely ordinary use — annotating a term
  mid-sentence) produced a real React warning, `<p> cannot contain a
  nested <div>`, because `TooltipContent`'s `<div>` landed as a literal
  DOM descendant of the `<p>` it was written inside, regardless of being
  visually promoted out of the page via `position: fixed` and the popover
  top layer — HTML content-model validity is about where an element
  *sits in the tree*, not where it's *drawn*. A portal is the only fix
  that addresses that at the place it's actually wrong; CSS positioning
  was never going to touch it, no matter how thoroughly.
- Position is computed once, at show time — not tracked continuously — so
  it won't follow the trigger if the page scrolls. Rather than reposition
  on every scroll event (real complexity for a transient element that's
  fine to just go away), scrolling dismisses the tooltip instead, the
  same trade-off `Toast`'s hover-pause makes in the other direction:
  simple and honest about what it does, over precise and complex.
- No `TooltipProvider`-style shared "skip the delay if you were just
  looking at another tooltip" behavior (Radix's Tooltip has this). Each
  `Tooltip` manages its own delay timer independently. A real, nameable
  UX polish being left out, not an oversight — deliberately scoped the
  same way `ContextMenu` leaves out submenus and `Select` leaves out
  typeahead.
