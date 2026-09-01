import { CodeBlock } from "@/components/code-block";
import { InstallTabs, type PackageManager } from "@/components/install-tabs";

const prefixes: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

export function InstallCommand({ packages = "@neelamkhan21/ui" }: { packages?: string }) {
  return (
    <InstallTabs
      blocks={
        Object.fromEntries(
          (Object.keys(prefixes) as PackageManager[]).map((manager) => [
            manager,
            <CodeBlock key={manager} code={`${prefixes[manager]} ${packages}`} lang="bash" />,
          ]),
        ) as Record<PackageManager, React.ReactNode>
      }
    />
  );
}
