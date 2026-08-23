![CI](https://github.com/neelamkhan123/component-library/actions/workflows/ci.yml/badge.svg)

# @neelamkhan21/ui

An accessible React component library, built with a focus on keyboard
navigation, focus management, and ARIA correctness.

📦 **[npm package](https://www.npmjs.com/package/@neelamkhan21/ui)**

## Installation

```bash
npm install @neelamkhan21/ui
```

React 18+ and `react-dom` 18+ are peer dependencies.

## Usage

```tsx
import { Button, Dialog } from '@neelamkhan21/ui';
```

Components are styled with Tailwind CSS v4 utility classes and ship no
stylesheet of their own, so the consuming app needs Tailwind v4 with the
package included as a source:

```css
@import "tailwindcss";
@source "../node_modules/@neelamkhan21/ui/dist";
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

## Notable decisions

See [DECISIONS.md](./DECISIONS.md) for the full per-component reasoning
behind specific accessibility choices.

## Development

```bash
npm install
npm run dev              # Storybook at localhost:6006
npm run test             # unit + a11y tests (vitest + jest-axe)
npm run test-storybook   # axe-core run over every story
npm run lint             # eslint
npm run build            # build the package
```

## License

MIT © Neelam Khan — see [LICENSE](./LICENSE).

The published bundle inlines `class-variance-authority` (Apache-2.0) and
`lucide-react` (ISC); their notices are reproduced in
[THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).
