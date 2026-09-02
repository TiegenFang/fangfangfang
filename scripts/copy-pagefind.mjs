/**
 * 把构建产物中的 Pagefind 索引复制回 public/，
 * 这样 `astro dev` 本地开发时 /pagefind 也可用（搜索功能需要）。
 * 用 Node 实现以兼容 Windows（模板原为 `cp -r`）。
 */
import { cpSync } from "node:fs";

cpSync("dist/pagefind", "public/pagefind", { recursive: true });
