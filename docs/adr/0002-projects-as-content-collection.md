# 0002 — Projects 用独立内容集合，Gallery 同模式预留

日期：2026-09-06
状态：已采纳

## 背景

站点要从个人博客升级为个人数字主页，需要展示科研项目、软件工具与学习仓库。这是 ADR 0001 之后第二次扩展内容类型。可选方案：

- **A. 复用 posts 集合打标签**：零开发，但项目会混入文章时间线，且没有独立的列表/详情结构。
- **B. 单一 projects.ts 数据文件**：实现最快，但项目只能是结构化字段，写不了叙事正文，项目数量增长后维护性差。
- **C. 独立 projects 内容集合**：照 ADR 0001 的模式，每个项目一个 markdown，frontmatter 管结构化字段（title / description / category / status / pubDatetime / tags / repo / featured / draft），正文写叙事。

## 决策

采用 **C**。

- 分类先开 Research / Software / Learning 三类，Others 暂不启用。
- 收录边界为作品集级精选：以 GitHub 公开仓库为准（科研代码、xyzrender-webapp、学习仓库等约 6–8 个），个人小项目与 fork 不收。
- 项目与仓库是软引用：`repo` 字段存链接，项目页写故事，仓库作佐证。
- 影像（Gallery）暂缓实施，但确定沿用同一模式（gallery 集合，一个文件一个相册，照 restructure plan §11 的 schema）；照片素材由作者自行整理添加后再实施。
- 一级导航全中文：博客 / 课程 / 项目 / 关于，「影像」待模块上线时加入；标签降级到博客内部，标签页保留。

## 理由

- 项目需要「结构化字段 + 叙事正文」两者：B 给不了正文，A 破坏时间线语义并缺乏项目视图。
- 与 ADR 0001 同构（glob loader + zod schema），工程模式已被课程集合验证过，增量成本低；将来要加字段（如 demo、cover）只需改 schema，不推翻内容。
- Gallery 缓建的原因是内容而非架构：系统可以随时按 plan 的设计一次成型，先建空相册反而损伤站点信用。

## 后果

- `src/content.config.ts` 新增 projects schema；导航与 i18n 各加「项目」条目。
- 项目不出现在文章时间线，需要自己的列表与筛选设施（分类筛选在页面本地实现，第一阶段不进 Pagefind 全局搜索）。
- 讲义与项目是两种不同的内容单元：讲义回答「我系统教了什么」，项目回答「我做了什么」，不互相替代。
- Gallery 实施时照片字段的细节（src / caption 结构）以届时 schema 为准，本文只锁定集合模式。
