import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
// KaTeX 的 \ce 化学方程式宏属 mhchem 扩展，默认不注册；构建期注册一次即可。
// 必须用 ESM 入口：本仓库是 type: module，CJS 入口可能解析到另一份 katex 实例，
// 导致宏注册失效。站点是 SSG，公式在构建期渲染成静态 HTML，浏览器端无需加载。
import "katex/dist/contrib/mhchem.mjs";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

type HastNode = {
  type?: string;
  properties?: { className?: string[]; dataPagefindIgnore?: string };
  children?: HastNode[];
};

// KaTeX 的 MathML <annotation> 携带 LaTeX 源码、渲染层携带数学符号，二者都会被
// Pagefind 索引并在搜索摘要里显示为乱码。给 .katex 容器加 data-pagefind-ignore，
// 保留 MathML 的无障碍价值，同时让搜索索引保持干净。
const ignoreKatexInSearch = () => (tree: HastNode) => {
  const walk = (node: HastNode) => {
    const cls = node.properties?.className;
    if (node.type === "element" && cls?.includes("katex")) {
      node.properties!.dataPagefindIgnore = "";
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
};

export default defineConfig({
  site: config.site.url,
  base: "/fangfangfang",
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["zh"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        // 必须排在 remarkToc 之前，标题中的公式才能被目录正确收集
        remarkMath,
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts, rehypeKatex, ignoreKatexInSearch],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
