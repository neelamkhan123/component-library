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

## Aspect Ratio

- `ratio` is a plain number, applied via the native CSS `aspect-ratio`
  property through inline `style` rather than a Tailwind `aspect-[...]`
  class — a caller-supplied _continuous_ value (any ratio, not a fixed set
  of variants) is exactly what `style` is for, the same reasoning
  `Progress`'s fill width and `Sidebar`'s panel width are set inline.
- The value is written as `` `${ratio} / 1` ``, not the bare number —
  discovered directly from this component's own tests: jsdom accepts
  `aspect-ratio: 16/9` (the explicit ratio syntax) but silently drops the
  entire declaration for a bare `aspect-ratio: 1.777...` (no slash), even
  though a real browser accepts both. Confirmed in real Chromium that the
  bare form does render correctly there — this is purely a gap in jsdom's
  `aspect-ratio` grammar validation, not a real-browser bug — but writing
  the explicit `/ 1` form is valid everywhere and costs nothing, so there's
  no reason to depend on a real browser's more lenient parsing when a
  strictly-valid string works in both.
- No default `object-fit`/`<img>` handling baked in — a caller supplies
  their own media as `children`, styled `absolute inset-0 h-full w-full
object-cover` (the exact technique `AvatarImage` already uses to fill
  `Avatar`'s own fixed-size box). Baking an `<img>` slot directly into
  `AspectRatio` would coincidentally solve the single most common case at
  the cost of not fitting video, a map embed, or anything else shaped like
  "content that should be clipped to a ratio" — a deliberate cut in the
  same spirit as `Attachment` leaving out a lightbox.

## Attachment

- Written alongside `Bubble` and `Message`, for someone building a chat
  UI — a purpose named directly rather than left implicit, since it
  explains a few choices below that a generic "file display" component
  wouldn't need to make.
- Forwards its ref to a plain `<div>` unconditionally, never to the `<a>`
  that appears inside it when `url` is given. `Attachment` renders two
  structurally different things (an image wrapped in a link, or a file
  row optionally wrapped in one) depending on props, and a `forwardRef`
  can only ever point at one fixed element type — making that type an `<a>`
  when a `url` happens to be present and a `<div>` otherwise would mean
  the ref's own type depended on a prop's value, which isn't expressible
  without an unsound cast. Keeping the outer element a `<div>` in every
  case, with the real link nested inside it when there is one, sidesteps
  that entirely instead of reaching for one.
- The interactive element is a real `<a href>` — `download` for a file,
  `target="_blank"` for an image — not a `<div>` with an `onClick`. Worth
  knowing, and noted directly in the prop docs rather than left to be
  discovered: browsers only honor the `download` attribute for same-origin
  URLs (or ones a CORS response explicitly permits); for anything else,
  clicking a file attachment opens it in a new tab instead of downloading
  it, which is exactly what `target="_blank"` on the same link falls back
  to doing.
- `type` (`"image"` or `"file"`) is explicit, not inferred from the URL —
  deliberately, even though guessing from a file extension is possible.
  Real attachment URLs are routinely extension-less (signed cloud-storage
  links, API endpoints), so inference would be right often enough to seem
  reliable and then fail unpredictably on exactly the URLs a real chat
  backend tends to produce — an explicit, always-correct prop beats a
  usually-correct guess here.
- No upload/download progress state, and no image lightbox (clicking an
  image just opens it at full size in a new tab). Both are genuinely
  separate features — progress needs to represent an in-flight operation
  this component has no visibility into, and a proper lightbox is close
  to its own small component — so both are deliberate scope cuts for this
  pass, the same spirit as `ContextMenu`'s submenus or `DataTable`'s
  filtering.
- `onRemove` is the one prop that changes an image attachment's whole
  layout: given it, the full-size linked photo becomes a small captioned
  thumbnail (name and size below it, like a composer's upload picker)
  with no `<a>` at all. That's deliberate rather than incidental — a
  pending upload isn't something to click through to full size yet, and
  the two states (posted vs. staged) never coexist for the same
  attachment, so branching on `onRemove` avoids a separate `variant` prop
  that would just track the same distinction `url`/`onRemove` already
  makes.
- The remove button is a sibling of the `<a>`, never nested inside it,
  even on the file row where both sit in the same flex container — an
  interactive element inside another interactive element is invalid HTML
  and produces unpredictable activation behavior, the same reason
  `SelectSeparator` lost its ARIA role earlier rather than nesting roles
  that don't support each other.
- No dedicated "attachment group" wrapper for laying out several pending
  uploads side by side — a plain `flex gap-3` around a few `Attachment`s
  does it, the same choice `Bubble` and `Message` already made for
  stacking a conversation instead of shipping a list component around a
  single child type.

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

## Badge

- Renders a plain `<span>`, not a `<button>` — a badge is informational (a
  count, a tag, a state label), not an action, the same non-interactive
  default `Card` and `Avatar` themselves take. Nothing stops a caller
  nesting a `Badge` inside something clickable when they genuinely need
  that, but it isn't the default.
- `variant` reuses `Button`'s own vocabulary — `default`/`secondary`/
  `outline`/`destructive` — for a consistent visual language between the
  two rather than inventing a parallel one, minus `ghost`/`link`, which are
  about interaction states (hover/focus feedback on something clickable) a
  static badge doesn't have.
- No built-in dismiss button in this pass. `Attachment`'s `onRemove` is the
  established pattern to reach for if a caller needs a removable badge (a
  filter chip) — it wasn't duplicated into `Badge` speculatively, the same
  restraint `Progress`/`Skeleton` show not pre-building for a need nothing
  yet in this library has.

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

## Bubble

- Self-aligning: an `"outgoing"` `Bubble` applies its own `margin-left:
auto` rather than expecting a wrapping layout component to position it.
  This was a deliberate choice for approachability, not just economy — the
  intended audience for this one (see `Attachment`'s entry) includes
  someone building their first chat UI, and a plain `flex flex-col` of
  bare `Bubble`s already looks like a working conversation with nothing
  else to learn first. `Message` exists for when an avatar, sender name,
  or timestamp is also needed, not because `Bubble` requires it.
- No ARIA role beyond what a plain `<div>` already has. A chat bubble is
  visual content, not a distinct interactive widget the way `role="alert"`
  or `role="status"` mark `Toast`'s notifications as — reading it is just
  reading the page, which native document flow and each bubble's own text
  content already handle correctly on their own.

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

## Data Table

- Built _on_ `Table` (for markup/styling) and `Pagination` (for page
  controls) rather than reinventing either — the same "compose what
  already exists" instinct behind `DropdownMenu` building on `ContextMenu`.
  Sorting is the one piece of real logic that's new here.
- Deliberately scoped to sorting and pagination — no filtering, global
  search, row selection, or column resizing/reordering. A fully-featured
  data grid is a genuinely different, much larger component: shadcn/ui's
  own docs are explicit that they don't ship one at all, pointing instead
  to a headless table library (TanStack Table) for anyone who needs the
  full feature set. This library has taken on no new runtime dependency
  for any other component, and sorting plus pagination cover the large
  majority of "I just want a nicer table" needs on their own — the same
  kind of bounded, honest scope as `ContextMenu` leaving out submenus or
  `Select` leaving out typeahead, just declared up front rather than
  discovered by omission.
- `DataTableColumn<T>`'s `key` is typed as `keyof T & string`, not a bare
  `string` — a column referencing a key that doesn't exist on the row type
  is a compile error and gets autocomplete, rather than a silently-`undefined`
  cell discovered at runtime. The one place this can't stay fully type-safe
  is the sort comparison itself: a column's value type isn't statically
  known to be sortable (`string | number`), so reading it for comparison
  needs one explicit, narrow cast — `sortValue` exists specifically so a
  column whose displayed value isn't sortable on its own (a formatted date
  string, say) can supply a real comparable value instead of fighting that
  cast.
- Sort state cycles ascending → descending → unsorted (a third click clears
  it), not a two-state toggle — returning to the original data order is
  itself useful, and is what most real table implementations that support
  click-to-sort actually do.
- A sortable header's clickable control is a `<button>` _inside_ the
  `<th>`, not the `<th>` itself — a `<th>` isn't natively interactive, so
  this is the same interactive-element-inside-a-non-interactive-container
  approach `ContextMenuItem`/`AccordionTrigger` use elsewhere. `aria-sort`
  (`"ascending"`/`"descending"`/`"none"`) is set on the `<th>` per the
  WAI-ARIA table-sorting convention, not on the inner button.
- No `onRowClick`/clickable-row support in this pass. Making a `<tr>`
  properly keyboard-accessible as a unit needs either real interactive
  elements inside its cells or promoting the whole table to `role="grid"`
  with its own roving-tabindex/arrow-key model — meaningfully more
  machinery than a `cell?: (row) => ReactNode` slot already provides a
  perfectly good escape hatch for (wrap your own cell content in a
  `<button>`/`<a>` if a row needs to navigate somewhere).

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
- jsdom (used by every `*.test.tsx` file, including this one) doesn't
  implement `HTMLDialogElement.showModal()`/`.close()` at all — a known
  upstream gap (jsdom/jsdom#3294) — even though it does support the
  reflected `open` attribute. `vitest.setup.ts` polyfills both onto
  `HTMLDialogElement.prototype` for the whole `unit` test project, since
  `Drawer` sits on this same native `<dialog>` foundation and would hit the
  identical gap. Worth knowing separately: this project's jsdom tests were
  scaffolded but never actually wired into `vitest.config.ts` (the project
  entry was left commented out from the initial Storybook init) until this
  was noticed while verifying an unrelated `Attachment` change — every
  `*.test.tsx` in the repo, this one included, had never actually run
  before. All were fixed and are now genuinely green; see `vitest.setup.ts`
  and the `Drawer` section above for the two real bugs that surfaced once
  they finally ran.

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
- `side="top"` was documented and unit-tested from early on but the actual
  `cva` variant was missing — undetected because `*.test.tsx` files were
  excluded from `tsconfig.json`'s typecheck and, separately, the jsdom
  project in `vitest.config.ts` was never wired into `projects` (see the
  `vitest.config.ts`/`vitest.setup.ts` note below), so neither a type error
  nor a failing test ever surfaced it. Implemented now, with a `Top` story
  added alongside `Right`/`Left`/`Bottom`.
- The per-`side` "pins flush against that edge" test asserts the
  `cva`-generated positioning classes (`inset-x-0 top-0`, etc.) rather than
  `getBoundingClientRect()` — jsdom has no layout engine, so a rect read
  there is always all-zero regardless of the actual CSS. The
  Storybook/Chromium project's stories render the real thing for real
  layout; the jsdom test can only meaningfully check the mechanism that
  produces it.

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
  content's measured size fed back into which _side_ to open on, not just
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

## Message

- Written alongside `Bubble` and `Attachment` (see those entries) — the
  third piece of the same chatbox-building trio.
- Owns the row's _layout_ only — avatar placement, alignment, the sender/
  timestamp line — and takes its content as children rather than
  rendering a `Bubble` internally. The same layout-versus-content split
  `Card`'s `CardHeader` and `Dialog`'s `DialogHeader` draw for their own
  families, chosen here for the same reason: it's what lets a "burst" of
  several quick `Bubble`s, or a `Bubble` alongside an `Attachment`, sit
  under one avatar and timestamp without `Message` needing to know
  anything about either of those components. A version that rendered a
  `Bubble` internally would be one line shorter to use for the single-
  bubble case and unable to express either of those without a second,
  bubble-less variant.
- `avatar` is a plain `ReactNode` slot, not a `size` prop forwarded to an
  internal `Avatar`. `Message` has no way to safely inject props into
  arbitrary children (that's what a `cloneElement`-based API would
  attempt, and it's fragile against whatever the child actually turns out
  to be), so instead of a narrow, `Avatar`-specific integration, any
  avatar — sized however the caller wants, or not an `Avatar` at all — is
  equally well supported by just being handed the slot directly. The
  `Avatar` composed into the stories uses `size="sm"`, which reads as the
  natural chat-appropriate scale, but that's a documentation choice, not
  something `Message` enforces.
- `sender`/`timestamp` are also plain `ReactNode`, not a `Date` with
  built-in formatting. Timestamp formatting (relative "2m ago" vs. an
  absolute time, locale, 12- vs. 24-hour) is a real design decision every
  chat app makes differently, and baking in one formatting opinion would
  mean fighting it in every app that made a different one — passing
  already-formatted content (a plain string, or a real `<time dateTime>`
  for correct semantics, entirely up to the caller) sidesteps having an
  opinion here at all.

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
  piece of this component that _isn't_ purely presentational, because it's
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

## Popover

- Built almost entirely on `Select`'s own proven plumbing — native popover,
  `requestAnimationFrame`-deferred `showPopover()`, viewport-clamped
  below-trigger positioning, the native `toggle` event as the single source
  of truth for closing and returning focus to the trigger — reused wholesale
  rather than reinvented, since none of it is specific to a listbox. What's
  actually different is narrow: `PopoverContent` holds arbitrary content, not
  a fixed set of options, so there's no roving-focus `onKeyDown`, no
  `aria-selected`, no owned-option-element structure at all.
- `role="dialog"`, not `role="menu"`/`"listbox"` — nothing about a popover's
  content is a predictable, ownable set of items the way `ContextMenu`'s or
  `Select`'s is, so there's no equivalent structure to declare. Unlike
  `DialogContent`, no title is required: `Dialog` is modal and demands
  orientation from whoever it just interrupted; a popover is lighter-weight
  and usually self-evident from whatever was clicked to open it (an avatar
  clicked for a profile card already says what the card is).
- On open, focus moves to the first focusable descendant found via a
  generic selector (links, enabled form controls, non-negative `tabindex`),
  falling back to the panel itself (`tabIndex={-1}`) when nothing focusable
  exists — necessarily a generic search, unlike `SelectContent` resuming
  focus on a specific already-known option, since `PopoverContent`'s
  contents aren't a fixed, typed shape the way an option list is.
- No `align`/flip-to-the-opposite-side placement, and no separate
  `PopoverAnchor` for positioning relative to something other than the
  trigger — the same deliberate scope cut `DropdownMenu` already makes for
  its own identical positioning question, for the same reason: the
  viewport clamp already gets most of the practical benefit, and true
  flipping needs the content's measured size fed back into which side to
  open on, not just where to clamp to.
- `PopoverClose` calls the native `hidePopover()` on `PopoverContent`
  rather than updating state directly, funneling every closure path
  (Escape, an outside click, this button) through the one `toggle` event
  and its one `onOpenChange` call — the same reasoning `DialogClose` calls
  `close()` on the native `<dialog>` instead of setting state itself.

## Progress

- Rendered as `<div role="progressbar">` with `aria-valuenow`/`-min`/`-max`
  wrapping a plain width-driven fill `<div>`, not the native `<progress>`
  element — the one place in this library a native form control exists but
  is deliberately passed over. `Switch`/`Checkbox` can style the native
  input directly because the box itself _is_ the whole visual; `<progress>`
  draws its fill inside vendor-prefixed pseudo-elements
  (`::-webkit-progress-value`, `::-moz-progress-bar`, with no equivalent in
  every engine), which render inconsistently and can't be reached with a
  plain Tailwind class the way everything else in this library is styled.
  A `role="progressbar"` div is the same pattern Radix's (and by extension
  shadcn's) Progress primitive uses, for the identical reason.
- `value` is optional, not defaulted to `0` — omitting it renders an
  indeterminate state (`aria-valuenow` absent entirely, per the ARIA spec's
  own definition of indeterminate, plus a pulsing full-width fill) for
  progress that genuinely has no known percentage yet, e.g. a file upload
  before the server reports byte counts.
- The indeterminate fill uses Tailwind's stock `animate-pulse` rather than a
  sliding-stripe animation. A sliding stripe needs a custom `@keyframes`
  block, which would be the first one anywhere in this codebase — everything
  else (`Dialog`, `Drawer`, `ContextMenu`, `Toast`, ...) animates via
  `@starting-style`/`transition-discrete` tied to real state changes, never
  a looping keyframe animation independent of state. Reaching for the stock
  utility instead of introducing that first bit of infrastructure for one
  component is the same deliberate-scope-cut spirit as `Attachment` skipping
  a lightbox.
- `max` defaults to `100`, not `1` the way the native `<progress>` element
  does — matching Radix/shadcn's Progress and the near-universal mental
  model of "progress is a percentage" rather than the native element's
  easy-to-forget default.
- `value` is clamped to `[0, max]` before being written to `aria-valuenow`
  and turned into a fill width, so an out-of-range value from a caller
  (e.g. a byte count briefly exceeding a stale total) can't produce a
  fill wider than the track or an `aria-valuenow` outside the range
  `aria-valuemin`/`aria-valuemax` promise assistive tech.

## RadioGroup

- `RadioGroupItem` renders a real `<input type="radio">`, restyled with
  `appearance-none`, the same treatment `Checkbox` gives its own input —
  but radio inputs get _more_ out of that choice than checkboxes do:
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

## Resizable

- The handle originally sized its cross axis with `h-full`/`w-full`
  (`height`/`width: 100%`) — reported by a user as "I don't see any
  vertical line separators", and confirmed with real Chromium (Playwright
  against a running Storybook, not just the automated suite — the same
  direct-verification approach `ContextMenu`'s original popover-timing bug
  needed) to render only ~16px tall inside a 162px-tall group, i.e. shrunk
  to fit just its grip icon instead of spanning the panels beside it. Cause:
  `ResizablePanelGroup`'s own height is intrinsic (sized to its panels'
  content, not an explicit value), and a percentage measured against an
  indefinite containing block resolves as `auto` per CSS2.1 §10.5 — but
  that `auto` doesn't reliably get flexbox's stretch treatment the way an
  actually-unset height would. Fixed by using `self-stretch` instead, which
  stretches to the flex line's cross size directly and never goes through
  percentage resolution at all. Worth remembering for any future flex-item
  sizing in this codebase, not just here.
- `ResizablePanelGroup` originally defaulted to `h-full w-full`. Fixing the
  bullet above surfaced a second, more serious bug the same way: the
  `Vertical` story's dragging didn't move anything, even though `Resizable`'s
  own unit tests (which stub `getBoundingClientRect` — see below) all
  passed. Direct Chromium inspection (again Playwright against a running
  Storybook) showed the drag math itself was correct — the handle's
  `flex-basis` percentage was updating in the DOM exactly as intended — but
  nothing visibly moved, because the group's real height had silently
  reverted to content-driven sizing (both panels always exactly matched
  their own inner content's height, regardless of the percentage set on
  either). Cause: `Vertical`'s own `h-80` className, meant to give the
  group the definite height its children's percentage `flex-basis` needs to
  resolve against, was silently losing to the component's built-in
  `h-full`. Which of two same-specificity classes wins is decided by their
  order in Tailwind's _generated stylesheet_, not by the order they appear
  in a `className` string — and `.h-full` happened to be emitted after
  `.h-80`. With no definite ancestor height above it either, `height: 100%`
  then degraded to `auto` per the same CSS2.1 §10.5 rule as the bullet
  above, and every descendant's percentage `flex-basis` failed right along
  with it — not just cosmetically stuck, but functionally inert: no
  percentage placed on any panel could ever resolve, so no drag or keypress
  could ever visibly do anything, no matter how correct the JS computing it
  was. Fixed by dropping `h-full` from the default entirely and keeping
  only `w-full` — `w-full` never had a competing override to lose to in
  either story, and it's `width`, not `height`, that's virtually always
  wanted immediately regardless of orientation; a `direction="vertical"`
  group instead _needs_ to be told its height by the caller, which now
  reaches the element uncontested. Recorded directly in `ResizablePanelGroup`'s
  own doc comment so a future reader doesn't reach for a competing default
  again. The general lesson — this library's plain string-concatenation
  `mergeClassNames` has no `tailwind-merge`-style override resolution, so a
  component's own default Tailwind class can silently outrank a consumer's
  override of the _same CSS property_ depending on unrelated build/scan
  order — applies anywhere a component ships a same-property default a
  caller might reasonably want to replace, not just here.
- A `ResizableHandle` resizes only its immediate previous and next sibling,
  reading and writing their sizes straight off the DOM by adjacency — the
  same reasoning `Carousel` reads its slides from
  `containerRef.current.children` rather than a separate id/registration
  system. There's no group-wide context tracking every panel's size,
  because a handle never needs to know about panels it isn't between; the
  only thing panels put in context is the group's `orientation`, needed
  purely for which CSS properties/keys to read (`width`/`height`,
  `clientX`/`clientY`, `ArrowLeft`/`ArrowRight` vs `ArrowUp`/`ArrowDown`).
- Panel resizing is applied by writing `flexGrow`/`flexShrink`/`flexBasis`
  directly onto the panel DOM nodes during `pointermove`, not through React
  state re-rendered every frame — a drag can fire many times a second, and
  nothing about a resize needs a re-render (no other part of the tree reads
  a panel's current size back). This is the same trade-off `Carousel` makes
  calling `scrollIntoView` directly rather than animating a controlled
  `scrollLeft` through state.
- `minSize`/`maxSize` live on each `ResizablePanel` as `data-*` attributes,
  read back by whichever handle ends up adjacent to it, rather than passed
  down through context or read from a prop on the handle itself — a handle
  shouldn't need to be told what its neighbors' constraints are; it should
  just ask them, the same spirit as reading DOM adjacency instead of an
  id system.
- Constraint solving only ever considers the two panels adjacent to the
  dragged/keyboard-activated handle — dragging a handle in a 3+ panel group
  never cascades a resize past its immediate neighbors. This is a
  deliberate scope cut, not an oversight: true cascading (where shrinking
  one panel below its neighbor's capacity ripples further down the group)
  needs a whole-group solver, and two-neighbor resizing is what every
  common "sidebar + content" or "N-pane split" layout actually needs — the
  same "handle the common case, cut the rest" call `DropdownMenu` makes
  skipping flip-to-opposite-side placement.
- `ResizableHandle` is `role="separator"`, focusable, and resizable with
  the arrow keys (a step per press) and Home/End (jump to the resolved
  min/max) — the WAI-ARIA window splitter pattern. Dragging is one input
  method for the same underlying resize, not a separate parallel feature,
  so both paths go through the same `applyDelta` clamping logic; keyboard
  interaction isn't a lesser-effort afterthought bolted on top of a
  pointer-only implementation.
- `aria-valuenow`/`-min`/`-max` are required on a focusable separator from
  first render, not only after the first drag — axe caught this directly:
  setting them lazily inside the drag/keydown handlers left a freshly
  mounted, never-yet-touched handle failing `aria-required-attr`. Fixed
  with a `useLayoutEffect` that measures neighbors once at mount and
  applies a zero-delta "resize" purely to populate those attributes,
  reusing `applyDelta`'s clamping instead of re-deriving the bounds math
  a second time.
- No persistence (e.g. to `localStorage`), no imperative resize API, and no
  double-click-to-reset-to-`defaultSize` — all genuinely separate features
  a caller can layer on top (persistence in particular is trivially a
  `defaultSize` computed from whatever a caller already reads/writes), the
  same "no upload progress, no lightbox" scope-cut spirit as `Attachment`.
- Verified this component's own tests need `getBoundingClientRect()`
  stubbed to reflect committed inline styles (not fixed values) in
  `Resizable.test.tsx` — jsdom has no layout engine, so without that a
  second interaction in the same test (e.g. two consecutive keypresses)
  would always measure the _initial_ render instead of the result of the
  first interaction, unlike a real browser. Same underlying jsdom
  limitation `Drawer`'s pinned-edge test hit, addressed the same way:
  assert what the mechanism actually produces rather than something jsdom
  fundamentally can't compute.

## Select

- Not built on a native `<select>` — the one place in this library where
  the usual "restyle the real native element" approach (`Checkbox`,
  `RadioGroup`, `Input`) doesn't hold up: most browsers don't let CSS
  reach the open dropdown's own `<option>` list at all (padding, hover
  color, radius are outside its control), so getting the sleek, consistent
  look the rest of this library has means a trigger button plus a popup
  listbox instead.
- Not built _on_ `ContextMenu` either, unlike `DropdownMenu`. It draws on
  the exact same proven techniques (native popover, `requestAnimationFrame`-
  deferred `showPopover()`, scroll lock, roving keyboard focus via real DOM
  focus) — but as a fresh, self-contained implementation, because a
  listbox's semantics (`role="listbox"`/`"option"`, `aria-selected`, a
  persistent single selection) differ from a menu's (`role="menu"`/
  `"menuitem"`, activate-and-close) enough that reusing `ContextMenu`'s
  components directly would mean parameterizing their roles and item
  selectors to serve a second, meaningfully different pattern — more
  indirection than the reuse would actually save. `DropdownMenu` reuses
  `ContextMenu` precisely because it _is_ structurally identical (same
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

## Separator

- Renders a native `<hr>`, which already carries an implicit `separator`
  role — a meaningful (non-`decorative`) instance needs no ARIA of its own
  beyond `aria-orientation` for the vertical case, since the role's implied
  default orientation is horizontal and `<hr>`'s own name and semantics
  are, too. Layering `aria-orientation="vertical"` on top of that implicit
  role is legitimate per the ARIA spec (author-supplied refinement of
  native semantics), the same spirit as adding behavior on top of the
  native `<dialog>` element rather than treating "native" as all-or-nothing.
- `decorative` (whether this is purely visual rather than a meaningful
  break between sections) defaults to `true` — most separators in a real
  UI divide visually related things (two toolbar buttons, a card's header
  from its body) rather than marking a genuine thematic shift worth
  announcing, the same bias `BreadcrumbSeparator` and `CarouselDots` already
  take for their own purely-decorative marks. `decorative`, not `true`,
  hides it from assistive tech via `aria-hidden`, rather than the reverse.
- `orientation="vertical"` stretches with `self-stretch`, not `h-full` —
  directly informed by the real bug found in `Resizable`: a percentage
  height can't resolve against a flex container whose own height is
  intrinsic rather than an explicit value, while `self-stretch` sidesteps
  percentage resolution entirely. Outside a flex row (`self-stretch` only
  does anything inside one), a vertical separator has no height to stretch
  to and needs one set explicitly via `className` — a known, disclosed
  limitation, not a silent one.

## Sidebar

- `SidebarProvider` renders the outer flex row wrapper itself, not just
  context — unlike `Dialog` (whose provider holds only context, since
  `DialogContent` promotes itself to the native top layer and isn't a
  normal layout sibling of anything), a docked `Sidebar` and the page's
  main content genuinely are ordinary flex siblings that need a shared row
  container. Composition is `<SidebarProvider><Sidebar>...</Sidebar><main
className="flex-1">...</main></SidebarProvider>`, with no `SidebarInset`
  wrapper for that `<main>` — an ordinary element with `flex-1` does it,
  the same "don't ship a wrapper around a single plain child" call
  `Bubble`/`Message` made not needing a list component to stack in.
- `Sidebar` sets its width via inline `style`, not a Tailwind `w-*` class —
  directly informed by a real bug just found in `Resizable`: which of two
  equal-specificity classes wins is decided by their order in the
  _generated_ stylesheet, not by anything in a `className` string, so a
  component's own default class can silently outrank a caller's override of
  the same CSS property. Width is exactly the kind of value a `Sidebar`
  caller commonly wants to change, so it's a `width` prop applied via
  `style`, which has no such ambiguity, rather than a `w-64` default a
  caller would have to fight.
- The open-state width collapse (`overflow-hidden`, `transition-[width]`
  down to `0`) lives on the `<aside>` itself, but its children sit inside an
  inner `<div>` held at a _constant_ width instead of collapsing with it —
  otherwise header/nav text would visibly reflow and wrap mid-transition as
  the outer width crosses down toward `0`. This costs one extra wrapper
  `<div>`, deliberately, for a purely cosmetic-during-animation reason.
- Collapsed, the `<aside>` is also marked `inert` (React 19's native
  support for the HTML attribute) — still present and shrinking for the
  transition, but unreachable by keyboard or assistive tech the instant it
  collapses, not just once fully invisible. Same problem `Dialog`/`Drawer`
  solve by fully removing their content from the accessibility tree on
  close, solved the same immediate-state-change-with-a-lagging-visual-transition
  way, just via `inert` instead of `close()`.
- `SidebarTrigger` is deliberately not rendered inside `Sidebar` itself in
  any story — a trigger placed inside the panel it collapses would become
  unreachable (thanks to that same `inert`) the moment it's needed most.
  It belongs in the caller's own page header, wired to the same state via
  `useSidebar()` if a caller needs a custom trigger `SidebarTrigger` itself
  doesn't cover — the same relationship `useDialog()` has to `DialogTrigger`.
- `SidebarMenuButton` renders a native `<a>`, the same call `BreadcrumbLink`
  makes and for the same reason: sidebar entries overwhelmingly represent
  real, distinct pages, arguably even more consistently than a breadcrumb
  trail does. This is the opposite call `PaginationLink` makes rendering a
  `<button>`, deliberately, because whether changing pages should navigate
  genuinely varies by app there — both choices stand, for different
  components, for reasons specific to each.
- `SidebarGroupLabel` is plain presentational text, not wired to its
  `SidebarGroup` as an accessible heading/region pair (no `aria-labelledby`,
  no `role="group"`) — a deliberate simplicity cut, the same spirit as
  `BreadcrumbSeparator` staying decorative rather than modeling a whole
  extra relationship for what a sighted user already reads as "this line is
  a heading for the list below it."
- No mobile auto-collapse-to-an-overlay behavior, no viewport-width
  detection, no cookie/`localStorage` persistence of open state, no
  keyboard shortcut, and no icon-only collapsed mode (collapsing goes all
  the way to hidden, not to a slim icon rail) — all genuinely separate
  features a caller can layer on top (an overlay variant, in particular, is
  just composing `Drawer` for narrow viewports rather than `Sidebar`
  reimplementing it), the same "no upload progress, no lightbox" scope-cut
  spirit as `Attachment`. Likewise, a caller wanting a _draggable_ sidebar
  width should reach for `Resizable` (`ResizablePanelGroup` wrapping
  `Sidebar` and the main content as `ResizablePanel`s) rather than `Sidebar`
  growing its own drag logic — resizing by dragging is `Resizable`'s job,
  not something worth a second implementation here.

## Skeleton

- Always `aria-hidden="true"` — a skeleton is a visual stand-in with
  nothing for assistive tech to read, the same treatment
  `BreadcrumbSeparator`'s and `CarouselDots`' own decorative marks get.
  That deliberately leaves announcing the *loading* state itself
  unhandled: a screen with several `Skeleton`s should wrap them in one
  `role="status"` region with a single accessible label, not have every
  individual skeleton announce redundantly on its own — and only the
  caller knows how many there'll be or what the loading region as a whole
  represents, the same reason `DataTable` doesn't try to own filtering it
  can't see enough context to get right. The `role="status"` pattern is
  shown directly in a story rather than left to be discovered.
- No default size — a text line, an avatar circle, and a card block are
  all shaped completely differently, so a default would be wrong as often
  as it's right. Every instance is sized with `className`, the same
  "the caller knows the shape, this component doesn't guess" restraint
  `Progress` takes leaving its own width to fill its container rather than
  picking a fixed one.
- `motion-reduce:animate-none` drops the pulse for `prefers-reduced-motion`
  users, the same treatment every other animation in this library gets
  (`Dialog`'s transitions, `Progress`'s indeterminate fill). Color alone
  (a gray block) still reads as "this is loading" without needing motion.

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

## Table

- Renders a native `<table>`, restyled — row/column/header associations
  and a screen reader's table-navigation commands all come from the
  browser, nothing about that reimplemented here. Purely presentational,
  like `Breadcrumb`/`Pagination`: no state to coordinate, just styled
  wrappers around `<thead>`/`<tbody>`/`<tfoot>`/`<tr>`/`<th>`/`<td>`/
  `<caption>`.
- `Table` wraps the `<table>` itself in a horizontally scrolling `<div>`.
  A table's columns don't reflow the way text wraps — without the
  wrapper, a wide table on a narrow viewport would overflow the page
  itself rather than scrolling in place, the same category of problem
  `Carousel`'s content strip solves with `overflow-x-auto`, just applied
  to a table instead of a set of slides.
- `TableHead` defaults `scope="col"` — the native attribute that lets
  assistive tech announce which column a data cell belongs to when
  navigating the table, easy to forget by hand and free to default here
  since the overwhelming majority of `<th>`s in a typical table _are_
  column headers. `scope="row"` is still available by passing it
  explicitly, for the (rarer) row-header case.
- `TableCaption` renders a native `<caption>` — the correct, native way to
  give a table an accessible name/summary, the same non-optional-name
  reasoning `DialogTitle` gets for dialogs, except here the browser
  already has a purpose-built element for it rather than needing
  `aria-labelledby` wired up by hand. `caption-bottom` (set on `Table`,
  since `caption-side` is a property of the table, not the caption)
  positions it below the table rather than the browser's above-table
  default, matching where most real designs put a table's caption.
- See `DataTable`'s own entry for the sortable, paginated layer built on
  top of these primitives, and for why that layer stops well short of a
  full data grid.

## Tabs

- Arrow keys move focus _and_ switch the active tab together —
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
  toggle button is for a toolbar-style on/off _action_ (bold/italic
  formatting, a view filter) rather than a persistent form value, so it
  renders a native `<button aria-pressed>` instead of `Switch`'s
  `<input type="checkbox" role="switch">`. Per WAI-ARIA, a button with
  `aria-pressed` already _is_ a complete toggle button — unlike every
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
  _sits in the tree_, not where it's _drawn_. A portal is the only fix
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
