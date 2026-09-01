import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  // Two themes, both emitted as CSS variables, so the same build output can
  // render light or dark without re-highlighting on the client.
  theme: { light: "github-light-default", dark: "github-dark-default" },
  keepBackground: false,
  // Block only. Setting an inline default makes rehype-pretty-code tokenise
  // every `backticked` word in the prose and wrap it in a code figure, which
  // picks up the figure layout rules and turns inline code into a block.
  defaultLang: { block: "tsx" },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // The site is fully static — no server runtime — so it can be dropped on
  // the same S3 bucket + CloudFront distribution that serves Storybook today.
  output: "export",
  images: { unoptimized: true },
  // `@neelamkhan21/ui` is a workspace symlink whose published entry is ESM.
  // Transpiling it keeps Next from treating the linked package as an opaque
  // external, which is what breaks `dark:` class output and RSC boundaries.
  transpilePackages: ["@neelamkhan21/ui"],
};

export default withMDX(nextConfig);
