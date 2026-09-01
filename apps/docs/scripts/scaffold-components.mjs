// Creates a component page for anything in the registry that doesn't have one
// yet. Existing pages are never touched, so hand-written prose is safe — this
// can be re-run after adding a component to the library.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = join(root, "app", "docs", "components");
const props = JSON.parse(readFileSync(join(root, "lib", "props.generated.json"), "utf8"));

// Parsed out of lib/nav.ts rather than imported, so this stays a plain .mjs
// script with no TypeScript loader in the chain.
const navSource = readFileSync(join(root, "lib", "nav.ts"), "utf8");
const entries = [...navSource.matchAll(/^\s*c\((.+)\),\s*$/gm)].map((match) => {
  const [name, slug, title, description, group] = match[1]
    .match(/"(?:[^"\\]|\\.)*"/g)
    .map((value) => JSON.parse(value));
  return { name, slug, title, description, group };
});

/** Every export whose props belong to this component's family, base first. */
function relatedExports(name) {
  return Object.keys(props)
    .filter((key) => key === name || key.startsWith(name))
    .sort((a, b) => (a === name ? -1 : b === name ? 1 : a.localeCompare(b)));
}

let created = 0;
let skipped = 0;

for (const component of entries) {
  const dir = join(pagesDir, component.slug);
  const file = join(dir, "page.mdx");

  if (existsSync(file)) {
    skipped += 1;
    continue;
  }

  const related = relatedExports(component.name);
  const tables = related.length
    ? related
        .map((name) => `### ${name}\n\n<PropsTable name="${name}" />`)
        .join("\n\n")
    : `<PropsTable name="${component.name}" />`;

  const body = `export const metadata = {
  title: ${JSON.stringify(component.title)},
  description: ${JSON.stringify(component.description)},
};

<PageHeader
  title=${JSON.stringify(component.title)}
  description=${JSON.stringify(component.description)}
  componentName=${JSON.stringify(component.name)}
/>

<Callout variant="note" title="Documentation in progress">
  The API reference below is generated from the library's own source, so it is
  accurate and current. The prose, examples, and keyboard table on this page are
  still placeholders — see the component's
  [Storybook entry](https://df22wszov2zdy.cloudfront.net) for working examples
  in the meantime.
</Callout>

<ComponentPreview name="${component.slug}-demo" />

## Usage

\`\`\`tsx
import { ${related.length ? related.join(", ") : component.name} } from "neelam-ui";
\`\`\`

{/* TODO: replace with a real usage snippet. */}

## Examples

{/* TODO: add examples. Create apps/docs/examples/${component.slug}-demo.tsx,
    run \`npm run gen\`, then reference it with:
    <ComponentPreview name="${component.slug}-demo" /> */}

## Keyboard

{/* TODO: fill in this component's keyboard interactions. */}

<KeyboardTable
  shortcuts={[
    { keys: "Tab", description: "Moves focus to the component." },
  ]}
/>

## Accessibility

{/* TODO: describe the ARIA pattern, roles, and focus behaviour. */}

## API reference

${tables}
`;

  mkdirSync(dir, { recursive: true });
  writeFileSync(file, body);
  created += 1;
}

console.log(`scaffold-components: ${created} created, ${skipped} already written`);
