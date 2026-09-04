# AGENTS.md

「方寸之间」——Tiegen Fang 的个人博客，基于 astro-paper 模板（Astro 7 + Tailwind 4 + Pagefind，中文界面），部署于 GitHub Pages 子路径。领域词汇表在根目录 `CONTEXT.md`（文章/课程/讲义/讲次），架构决策记录在 `docs/adr/`——涉及领域概念的输出请沿用词汇表用词。

## Agent skills

### Issue tracker

Issue 记录在本仓库的 GitHub Issues，通过 `gh` CLI 读写。见 `docs/agents/issue-tracker.md`。

### Triage labels

使用默认的五个分类标签：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文布局：根目录一个 `CONTEXT.md` + `docs/adr/`。见 `docs/agents/domain.md`。

## 内容写作约定

- 内容分三个集合，字段 schema 以 `src/content.config.ts` 为准：文章 `src/content/posts/`、课程 `src/content/courses/`、页面 `src/content/pages/`。
- 新文章必填 `title`、`description`、`pubDatetime`；`draft: true` 的文章不发布。
- 文件名即 URL，用英文或拼音命名。
- 课程讲义就是普通文章，另加 frontmatter `course`（值为课程 slug）与可选 `order`（讲次，升序）。`course` 是 slug 软引用：课程文件改名后须同步修改归属讲义的 `course` 字段。

## 关键注意事项

- 子路径部署：站点在 `https://tiegenfang.github.io/fangfangfang/`，base 前缀配置在 `astro.config.ts`（当前 `/fangfangfang`）。markdown 正文里以 `/` 开头的站内链接不会被自动加上 base 前缀——站内跳转用完整 URL 或站点菜单。
- 动态 OG 图已禁用（`astro-paper.config.ts` 中 `features.dynamicOgImage: false`）：模板 satori 字体不含中文字形，中文标题会渲染成空白。改用静态分享卡 `public/default-og.jpg`，站点标题/简介变更后运行 `npm run og` 重新生成。若要恢复动态 OG，需先给 satori 配置中文字体，并从模板仓库取回 `src/pages/og.png.ts`。
- `npm run build` 内含 `astro check` 类型检查和 Pagefind 索引构建；改动 TypeScript 后请跑一遍完整 build 验证。
- CI（`.github/workflows/ci.yml`）按 `npm run lint` → `npm run format:check` → `npm run build` 顺序检查；提交前运行 `npm run format`（prettier）避免格式被打回。
