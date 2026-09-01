![CI](https://github.com/neelamkhan123/component-library/actions/workflows/ci.yml/badge.svg)

# neelam-ui

An accessible React component library, built with a focus on keyboard
navigation, focus management, and ARIA correctness.

📖 **[Documentation](https://df22wszov2zdy.cloudfront.net/preview)** · 🧪 **[Storybook](https://df22wszov2zdy.cloudfront.net)**  
📦 **[npm package](https://www.npmjs.com/package/neelam-ui)**

> ⚠️ **This package was renamed.** It was previously published as
> `@neelamkhan21/ui`. If you are upgrading from that package, change your
> dependency and your imports:
>
> ```diff
> - import { Button } from "@neelamkhan21/ui";
> + import { Button } from "neelam-ui";
> ```
>
> ```diff
> - @source "../node_modules/@neelamkhan21/ui/dist";
> + @source "../node_modules/neelam-ui/dist";
> ```
>
> Nothing else changed — the component API is identical and versions carry
> straight over. `@neelamkhan21/ui` is deprecated but stays on the registry,
> so existing installs keep working and there is no deadline to move.

## Installation

```bash
npm install neelam-ui
```

React 18+ and `react-dom` 18+ are peer dependencies.

`Chart` is a shell around a plot you supply, not a charting engine — it
owns the caption, legend, validated series palette, reserved plot box, and
the accessible data table, and renders whatever you pass as children.
[Recharts](https://recharts.org) is an **optional** peer dependency, so
install it only if you want it:

```bash
npm install recharts
```

Nothing is bundled and nothing is imported from it, so consumers who don't
chart pay nothing.

## Usage

```tsx
import { Button, Dialog } from 'neelam-ui';
```

Components are styled with Tailwind CSS v4 utility classes and ship no
stylesheet of their own, so the consuming app needs Tailwind v4 with the
package included as a source:

```css
@import "tailwindcss";
@source "../node_modules/neelam-ui/dist";
```

## Accessibility approach

- **Semantic HTML first** — native elements are used wherever possible;
  custom ARIA widgets are only built where no native equivalent exists.
  `Dialog` is a real `<dialog>` with `showModal()`, so the focus trap,
  Escape-to-close, and top-layer stacking come from the browser.
- **Keyboard navigation** — every interactive component follows the
  [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)
  pattern for its widget type.
- **Focus management** — Dialog and Popover trap and restore focus on
  open/close. Focus-visible styling is preserved everywhere.
- **Reduced motion** — every transition is dropped under
  `prefers-reduced-motion` (WCAG 2.3.3).
- **Automated testing** — every Storybook story is checked against
  axe-core in CI via the Storybook test runner, so accessibility
  regressions fail the build before merge.

## Component keyboard reference

| Component | Keys |
|---|---|
| Dialog | `Escape` closes, `Tab`/`Shift+Tab` trapped inside |
| Dropdown Menu | Arrow keys navigate, `Enter`/`Space` selects, `Escape` closes |
| Tabs | Arrow keys switch tabs, `Home`/`End` jump to first/last |
| Accordion | `Enter`/`Space` toggles panel |
| Select | Arrow keys navigate, `Home`/`End` jump to first/last, `Escape` closes |
| Combobox | See [APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| Date Range Picker | Arrow keys move between presets, `Escape` closes, arrow keys navigate each calendar grid |
| Data Table | `Enter`/`Space` on a column header cycles sort, `Tab` reaches the filter box |

## Notable decisions

See [DECISIONS.md](./DECISIONS.md) for the full per-component reasoning
behind specific accessibility choices.

## Development

This package lives in a monorepo alongside its documentation site; see the
[repository README](../../README.md) for the full layout. Install once from the
repository root, then:

```bash
npm run storybook -w neelam-ui        # Storybook at localhost:6006
npm run test -w neelam-ui             # unit + a11y tests (vitest + jest-axe)
npm run test-storybook -w neelam-ui   # axe-core run over every story
npm run build -w neelam-ui            # build the package
```

The root package.json aliases the common ones, so `npm run test`,
`npm run storybook`, and `npm run build` work from the repository root too.

## License

MIT © Neelam Khan — see [LICENSE](./LICENSE).

The published bundle inlines `class-variance-authority` (Apache-2.0) and
`lucide-react` (ISC); their notices are reproduced in
[THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).
