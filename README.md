# 方寸之间

Tiegen Fang 的个人博客，基于 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT）搭建：记录课程、分享知识与个人介绍。

- 线上地址：<https://tiegenfang.github.io/fangfangfang/>
- 技术栈：Astro 7 + Tailwind CSS 4 + Pagefind，界面为中文

## 常用命令

```bash
npm install       # 首次安装依赖
npm run dev       # 本地预览 http://localhost:4321
npm run build     # 类型检查 + 构建到 dist/（发布前跑一遍）
npm run preview   # 预览构建产物
npm run og        # 站点标题/简介变更后重新生成分享卡片 public/default-og.jpg
```

## 怎么写内容

站内有一门现成的教程——**《方寸之间使用指南》**（`src/content/courses/site-usage-guide.md`），看完就能上手。速查版：

| 内容     | 位置                                  | 关键 frontmatter                           |
| -------- | ------------------------------------- | ------------------------------------------ |
| 普通文章 | `src/content/posts/<英文文件名>.md`   | `title`、`description`、`pubDatetime`      |
| 课程讲义 | 同上（就是普通文章）                  | 再加 `course: <课程slug>`、`order: <讲次>` |
| 课程条目 | `src/content/courses/<英文文件名>.md` | `title`、`description`、`pubDatetime`      |
| 关于页   | `src/content/pages/about.md`          | `title`                                    |

- 文件名即 URL，用英文或拼音；`draft: true` 表示草稿，不会发布。
- 推送到 GitHub 后自动构建发布，无需手动部署。
- 示例课程和两篇讲义是给你看的说明书，学会后可整组删除。

## 部署说明

- 仓库 `TiegenFang/fangfangfang` → GitHub Pages 子路径 `https://tiegenfang.github.io/fangfangfang/`。
- 部署由 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 完成（push 到 `main` 触发）。首次部署后，到仓库 **Settings → Pages** 确认 Source 为 **GitHub Actions**。
- 站点地址、标题、作者等在 [`astro-paper.config.ts`](astro-paper.config.ts) 里改；子路径同时配置在 [`astro.config.ts`](astro.config.ts) 的 `base`（当前为 `/fangfangfang`）。
- **想换成 `tiegenfang.github.io` 根域名？** 把仓库改名为 `TiegenFang.github.io`，然后：`astro.config.ts` 里删掉 `base`、`astro-paper.config.ts` 里 `url` 改为 `https://tiegenfang.github.io/`，文章内写过的子路径链接同步替换。
- ⚠️ markdown 正文里的站内链接请勿以 `/` 开头硬写（Astro 不会为其添加 base 前缀），站内导航请依赖菜单，或使用完整 URL。

## 去掉了模板的哪些东西

- 动态 OG 图（`features.dynamicOgImage: false`）：模板的 satori 字体不含中文字形，中文标题会渲染成空白，改为静态分享卡 `public/default-og.jpg`（`npm run og` 重新生成）。若以后想启用动态 OG，需先给 satori 配置中文字体，并从模板仓库恢复 `src/pages/og.png.ts`。
- 分享按钮（分享到 WhatsApp/X 等对中文读者意义不大）：`shareLinks: []`。
- 模板自带英文示例文章、Docker 相关文件与社区文件（issue 模板等）。

主题本身的文档见 [AstroPaper README](https://github.com/satnaing/astro-paper#readme)。
