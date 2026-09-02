![CI](https://github.com/neelamkhan123/component-library/actions/workflows/ci.yml/badge.svg)

# component-library

Monorepo for **[neelam-ui](./packages/ui)** — an accessible React
component library — and its documentation site.

> [!NOTE]
> The package was renamed from `@neelamkhan21/ui` to `neelam-ui`. The old
> name is deprecated but remains on the registry, so existing installs are
> unaffected.

```
packages/ui     the published npm package (46 components) + Storybook
apps/docs       the documentation site (Next.js App Router + MDX),
                including the /blocks gallery of composed screens
```

## Getting started

```bash
npm install                      # installs every workspace
npm run build                    # build the library (apps/docs consumes its dist)
npm run dev                      # docs site at localhost:3000
```

## Scripts

Run from the repository root:

| Script | What it does |
| --- | --- |
| `npm run dev` | Docs site at `localhost:3000` |
| `npm run storybook` | Storybook at `localhost:6006` |
| `npm run build` | Build the library package |
| `npm run build:docs` | Build the library, then export the docs site to `apps/docs/out` |
| `npm run test` | Unit + a11y tests (vitest + jest-axe) |
| `npm run test-storybook` | axe-core over every story |
| `npm run changeset` | Record a release note |
| `npm run release` | Build and publish the package |

Anything scoped to one workspace also works directly:
`npm run <script> -w neelam-ui` or `-w docs`.

## How the docs site consumes the library

`apps/docs` depends on `neelam-ui` as a workspace package and imports
its **built** `dist`, exactly as an outside consumer does — including the
Tailwind `@source` scan of the compiled output. That means the site dogfoods
the real published surface rather than a privileged internal path, but it also
means **the library must be built before the docs will pick up a change**:

```bash
npm run build -w neelam-ui    # or `npm run build -w neelam-ui -- --watch`
```

Three files under `apps/docs/lib` are generated at build time and git-ignored:

- `props.generated.json` — prop tables extracted from the library's own TSDoc
- `examples.generated.ts` — the demo registry, pairing each example component
  with its verbatim source
- `blocks.generated.ts` — the same, for the multi-component blocks on `/blocks`

`npm run gen -w docs` rebuilds all three; `prebuild` and `predev` run it for
you.

## Adding documentation for a component

1. Write a demo at `apps/docs/examples/<slug>-demo.tsx` (it needs its own
   `"use client"` — the library ships no directives of its own).
2. Run `npm run gen -w docs`.
3. Reference it from the component's page with
   `<ComponentPreview name="<slug>-demo" />`.

`npm run scaffold -w docs` creates a page for any component in the registry
that does not have one yet, and never touches an existing page.

## Adding a block

Blocks are the whole-screen compositions on `/blocks` — a dashboard, a
sign-in screen, a pricing table — built from the same published components.

1. Write it at `apps/docs/blocks/<slug>.tsx`, self-contained and with its own
   `"use client"`. Keep it copy-pasteable: nothing from `@/` and no token the
   library doesn't ship, since a reader is meant to paste it into their app.
2. Register it in `apps/docs/lib/blocks.ts` — title, description, category,
   the components it uses, and the height of its preview frame.
3. Run `npm run gen -w docs`. The index, the full-width page, the command
   menu, and the home page pick it up from the registry.

## License

MIT © Neelam Khan — see [LICENSE](./packages/ui/LICENSE).
