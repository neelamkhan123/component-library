![CI](https://github.com/neelamkhan123/component-library/actions/workflows/ci.yml/badge.svg)

# component-library

Monorepo for **[@neelamkhan21/ui](./packages/ui)** — an accessible React
component library — and its documentation site.

```
packages/ui     the published npm package (46 components) + Storybook
apps/docs       the documentation site (Next.js App Router + MDX)
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
`npm run <script> -w @neelamkhan21/ui` or `-w docs`.

## How the docs site consumes the library

`apps/docs` depends on `@neelamkhan21/ui` as a workspace package and imports
its **built** `dist`, exactly as an outside consumer does — including the
Tailwind `@source` scan of the compiled output. That means the site dogfoods
the real published surface rather than a privileged internal path, but it also
means **the library must be built before the docs will pick up a change**:

```bash
npm run build -w @neelamkhan21/ui    # or `npm run build -w @neelamkhan21/ui -- --watch`
```

Two files under `apps/docs/lib` are generated at build time and git-ignored:

- `props.generated.json` — prop tables extracted from the library's own TSDoc
- `examples.generated.ts` — the demo registry, pairing each example component
  with its verbatim source

`npm run gen -w docs` rebuilds both; `prebuild` and `predev` run it for you.

## Adding documentation for a component

1. Write a demo at `apps/docs/examples/<slug>-demo.tsx` (it needs its own
   `"use client"` — the library ships no directives of its own).
2. Run `npm run gen -w docs`.
3. Reference it from the component's page with
   `<ComponentPreview name="<slug>-demo" />`.

`npm run scaffold -w docs` creates a page for any component in the registry
that does not have one yet, and never touches an existing page.

## License

MIT © Neelam Khan — see [LICENSE](./packages/ui/LICENSE).
