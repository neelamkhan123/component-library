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

// Empty everywhere that matters today: the site is served from the root of
// neelamui.com, and from the root in local development. The variable is kept
// because basePath is baked in at build time and cannot be applied at deploy
// time, so serving from a sub-path again would otherwise mean a code change.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // The dev-only Next.js badge in the bottom-left corner. It sits over the
  // page while working on it and never ships, so nothing but the local view
  // changes here.
  devIndicators: false,
  // The site is fully static — no server runtime — so it can be dropped on
  // the same S3 bucket + CloudFront distribution that serves Storybook today.
  output: "export",
  images: { unoptimized: true },
  // `neelam-ui` is a workspace symlink whose published entry is ESM.
  // Transpiling it keeps Next from treating the linked package as an opaque
  // external, which is what breaks `dark:` class output and RSC boundaries.
  transpilePackages: ["neelam-ui"],
};

export default withMDX(nextConfig);
