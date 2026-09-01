/*
 * Next does not ship an ambient declaration for plain `.css` imports, and
 * neither does `next-env.d.ts`. TypeScript 5.9 lets the side-effect import in
 * `app/layout.tsx` pass unchecked, but newer compilers — including the one
 * VS Code bundles — flag it as TS2882. Mirrors `packages/ui/src/styles.d.ts`.
 */
declare module "*.css" {
  const stylesheet: string;
  export default stylesheet;
}
