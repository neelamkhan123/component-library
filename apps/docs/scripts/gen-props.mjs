// Extracts prop tables straight from the library's TSDoc so the docs can't
// drift from the source. Output is consumed by <PropsTable />, which renders
// a placeholder for any component this fails to resolve.
//
// Two passes, because neither alone covers the library:
//   1. react-docgen-typescript — good at default values, which it reads out
//      of destructuring initialisers, but it silently skips any component
//      whose props are destructured with a rename (`{ value: valueProp }`),
//      which is how most of the compound roots here are written.
//   2. A direct TypeScript-checker pass over the `<Name>Props` interface,
//      filling in every component pass 1 dropped.
import { readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import docgen from "react-docgen-typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const uiSrc = join(root, "..", "..", "packages", "ui", "src", "components");
const outFile = join(root, "lib", "props.generated.json");

/** These must be real enum members — they are handed to ts.createProgram. */
const compilerOptions = {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  esModuleInterop: true,
  skipLibCheck: true,
  strict: true,
};

const files = [];
for (const dir of readdirSync(uiSrc)) {
  const file = join(uiSrc, dir, `${dir}.tsx`);
  if (existsSync(file)) files.push(file);
}

const isLocal = (fileName) => fileName && !fileName.includes("node_modules");
const sortProps = (props) =>
  props.sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

// ---------------------------------------------------------------- pass 1
const parser = docgen.withCompilerOptions(compilerOptions, {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // Without this every component inherits ~250 DOM attributes from
  // HTMLAttributes and the table becomes unreadable.
  propFilter: (prop) => {
    if (prop.declarations?.some((d) => !isLocal(d.fileName))) return false;
    return isLocal(prop.parent?.fileName ?? "local");
  },
});

const result = {};

for (const item of parser.parse(files)) {
  // cva variant factories and helpers sit alongside the components and are
  // picked up as if they were components; real components are capitalised.
  if (!item.displayName || !/^[A-Z]/.test(item.displayName)) continue;

  const props = sortProps(
    Object.values(item.props ?? {}).map((prop) => ({
      name: prop.name,
      type: prop.type?.name ?? "unknown",
      required: Boolean(prop.required),
      defaultValue: prop.defaultValue?.value ?? null,
      description: (prop.description ?? "").trim(),
    })),
  );

  if (props.length) result[item.displayName] = props;
}

// ---------------------------------------------------------------- pass 2
const program = ts.createProgram(files, compilerOptions);
const checker = program.getTypeChecker();

/** Reads `{ a, b: renamed, c = 5 }` in a component's signature into name -> default. */
function defaultsFromSignature(sourceFile, componentName) {
  const defaults = {};
  ts.forEachChild(sourceFile, (node) => {
    const name = ts.isFunctionDeclaration(node)
      ? node.name?.text
      : ts.isVariableStatement(node)
        ? node.declarationList.declarations[0]?.name?.getText(sourceFile)
        : undefined;
    if (name !== componentName) return;

    const fn = ts.isFunctionDeclaration(node)
      ? node
      : node.declarationList.declarations[0]?.initializer;
    // forwardRef(...) wraps the real render function one call deep.
    const signature =
      fn && ts.isCallExpression(fn) ? fn.arguments[0] : fn;
    const param = signature?.parameters?.[0];
    if (!param || !ts.isObjectBindingPattern(param.name)) return;

    for (const element of param.name.elements) {
      // `propertyName` is set only when the binding renames the prop, in
      // which case it — not `name` — is the public prop name.
      const propName = (element.propertyName ?? element.name).getText(sourceFile);
      if (element.initializer) {
        defaults[propName] = element.initializer.getText(sourceFile);
      }
    }
  });
  return defaults;
}

for (const file of files) {
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) continue;

  ts.forEachChild(sourceFile, (node) => {
    const isTypeDeclaration =
      ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
    if (!isTypeDeclaration) return;

    // A `<Name>Props` type documents the component `<Name>`. Any *other*
    // exported type is documented under its own name — `ToastOptions` and
    // `DataTableColumn` are part of the public API and get their own table,
    // but neither is a component's props, so neither ends in `Props`.
    const isPropsType = node.name.text.endsWith("Props");
    const isExported = node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isPropsType && !isExported) return;

    const componentName = isPropsType
      ? node.name.text.replace(/Props$/, "")
      : node.name.text;
    if (result[componentName]) return; // pass 1 already covered it

    const type = checker.getTypeAtLocation(node.name);
    const defaults = defaultsFromSignature(sourceFile, componentName);

    const props = sortProps(
      checker
        .getPropertiesOfType(type)
        .filter((symbol) =>
          symbol.declarations?.some((d) => isLocal(d.getSourceFile().fileName)),
        )
        .map((symbol) => {
          const declaration = symbol.declarations?.[0];
          const propType = checker.getTypeOfSymbolAtLocation(
            symbol,
            declaration ?? node,
          );
          return {
            name: symbol.getName(),
            type: checker
              .typeToString(propType)
              .replace(/ \| undefined$/, ""),
            required: !(symbol.flags & ts.SymbolFlags.Optional),
            defaultValue: defaults[symbol.getName()] ?? null,
            description: ts.displayPartsToString(
              symbol.getDocumentationComment(checker),
            ).trim(),
          };
        }),
    );

    if (props.length) result[componentName] = props;
  });
}

writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log(
  `gen-props: ${Object.keys(result).length} component(s) from ${files.length} source file(s)`,
);
