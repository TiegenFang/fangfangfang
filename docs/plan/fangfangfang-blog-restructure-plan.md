# 「方寸之间」个人博客扩展与重构 Plan

2026-10-07 场景更新：本文涉及 `GardenScene` 的计划已由 [雨夜街角方案](../specs/rainy-convenience-store.md) 取代，其他内容结构规划继续保留。

> 项目仓库  
> https://github.com/TiegenFang/fangfangfang
>
> 当前站点  
> https://tiegenfang.github.io/fangfangfang/
>
> 主要视觉参考  
> https://github.com/heiehiehi/XinghuisamaBlogs
>
> 文档定位  
> 本文用于指导 `fangfangfang` 后续博客扩展。  
> 核心任务是新增 Projects 与 Gallery。  
> 同时调整首页与导航结构。  
> 目标不是迁移模板。  
> 目标是在现有 Astro 架构上完成渐进式升级。

---

## 1. 改造目标

当前站点已经具有明确的个人风格。  
现有内容主要集中于 Blog、Courses、Tags、About 和 Archive。

后续改造的核心目标是：

1. 保留现有 Astro 技术栈。
2. 保留「方寸之间」的视觉识别。
3. 保留首页 GardenScene。
4. 新增 Projects 页面。
5. 新增 Gallery 页面。
6. 重构首页信息架构。
7. 简化一级导航。
8. 将站点从个人博客升级为个人数字主页。
9. 强化科研、软件、课程和影像之间的联系。
10. 保持 GitHub Pages 静态部署能力。

最终站点定位建议为：

> **方寸之间  
> Personal Digital Garden & Research Portfolio**

站点不再只表达“我写了什么”。

还应表达：

- 我在研究什么
- 我做过什么
- 我正在做什么
- 我如何组织知识
- 我记录了哪些影像
- 我有哪些公开项目

---

## 2. 改造原则

### 2.1 保留现有技术骨架

现有项目使用 Astro。

当前主要技术包括：

- Astro 7
- Tailwind CSS 4
- Astro Content Collections
- MDX
- Pagefind
- Sharp
- Three.js
- GitHub Pages

不建议迁移到 Next.js。

`XinghuisamaBlogs` 主要用于参考：

- 信息架构
- Projects 页面设计
- Gallery 页面设计
- 卡片交互
- 页面层次
- 视觉组织方式

不建议直接复制其完整技术栈。

---

### 2.2 采用渐进式扩展

改造应尽量避免一次性重写。

优先新增独立模块。

推荐顺序：

```text
Projects
↓
Gallery
↓
Homepage
↓
Navigation
↓
Visual Refinement
↓
Optional Features
```

每一步都应保持现有 Blog 和 Courses 正常运行。

---

### 2.3 保持「方寸之间」的视觉语言

当前站点已经形成独立视觉特征。

主要特点可以概括为：

```text
Paper
+
Editorial
+
Whitespace
+
Fine Borders
+
Photography
+
Restrained Motion
```

XinghuisamaBlogs 的主要视觉语言为：

```text
Glassmorphism
+
Blur
+
Indigo Glow
+
Rounded Cards
+
Motion
```

最终建议：

```text
70% 方寸之间
+
30% XinghuisamaBlogs
```

可以借鉴：

- Projects Matrix
- Gallery Album
- Masonry Layout
- Lightbox
- Search
- Filter
- Hover Animation
- Page Transition

不建议大量使用：

- 紫色发光
- 强毛玻璃
- 大面积渐变背景
- 浮动式复杂导航
- 手机端旋转轮盘导航
- 过多动画

---

# 3. 最终信息架构

## 3.1 一级导航

建议从当前导航逐步调整为：

```text
BLOG
COURSES
PROJECTS
GALLERY
ABOUT
```

工具类入口继续使用图标。

```text
Archive
Search
Theme
```

不建议继续将 Tags 作为一级导航。

Tags 应属于 Blog 内部的信息组织方式。

---

## 3.2 页面结构

最终页面结构建议如下：

```text
/
├── blog
├── courses
├── projects
├── gallery
├── about
├── archives
├── search
└── tags
```

其中：

```text
Blog
```

负责非系统化写作。

```text
Courses
```

负责系统化知识。

```text
Projects
```

负责展示科研、软件和长期项目。

```text
Gallery
```

负责影像记录。

```text
About
```

负责个人信息与研究方向。

---

# 4. 首页重构

## 4.1 首页角色

首页应从“文章入口页”变成“个人主页”。

访问者应该在十秒内理解四件事：

1. 你是谁
2. 你研究什么
3. 你做过什么
4. 站点里有什么

---

## 4.2 推荐首页结构

```text
Hero
↓
GardenScene
↓
Explore
↓
Featured Projects
↓
Recent Writing
↓
Footer
```

---

## 4.3 Hero

建议继续保留：

```text
你好，我是 Tiegen Fang
```

副标题可以调整为更完整的个人定位。

示例：

```text
Research, computation, propulsion,
and a few things beyond the laboratory.
```

或者使用中文：

```text
记录科研、计算、推进，以及实验室之外的一些事情。
```

下方保留：

- GitHub
- Scholar
- Email
- RSS

如果后续增加 ORCID，也可以放在这里。

---

## 4.4 GardenScene

GardenScene 应继续作为首页视觉中心。

这是当前站点最具有辨识度的部分之一。

建议：

- 不删除
- 不大幅改写
- 保持交互
- 保持二校门、小猫和树木构成
- 可增加极弱的视差
- 移动端继续提供静态 fallback

GardenScene 可以承担站点的情绪表达。

Projects 和 Courses 则承担信息表达。

---

## 4.5 Explore

GardenScene 下方新增 Explore。

推荐四个入口：

```text
PROJECTS
GALLERY
COURSES
BLOG
```

布局建议：

```text
┌────────────────┐ ┌────────────────┐
│ PROJECTS       │ │ GALLERY        │
│                │ │                │
│ Research &     │ │ Photography &  │
│ Software       │ │ Moments        │
└────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│ COURSES        │ │ BLOG           │
│                │ │                │
│ Structured     │ │ Notes &        │
│ Learning       │ │ Thoughts       │
└────────────────┘ └────────────────┘
```

四类入口应使用不同的视觉表达。

Projects 强调信息。

Gallery 强调图像。

Courses 强调体系。

Blog 强调文字。

---

## 4.6 Featured Projects

首页增加精选项目。

数量建议：

```text
3
```

最多：

```text
4
```

不建议首页显示全部项目。

卡片建议采用更接近科研 Portfolio 的形式。

```text
01

IONIC LIQUID
ELECTROSPRAY

Multi-scale modeling of
electrospray emission.

MD · CFD · Experiment

→ Explore Project
```

项目编号可以作为视觉元素。

---

## 4.7 Recent Writing

保留当前 Recent Posts。

建议降低视觉权重。

首页主要逻辑应该变成：

```text
个人身份
↓
视觉识别
↓
项目与内容入口
↓
最近写作
```

而不是：

```text
个人身份
↓
最近文章
```

---

# 5. Projects 模块

## 5.1 Projects 的定位

Projects 不应该只是 GitHub 仓库列表。

它应该展示：

- 科研项目
- 软件项目
- 数据分析工具
- 可视化项目
- 课程项目
- 实验平台
- 长期研究主题

---

## 5.2 Projects 分类

建议初始分类为：

```text
Research
Software
Visualization
Courses
Experiments
Others
```

早期也可以只启用前三类。

---

## 5.3 Projects 页面结构

```text
PROJECTS

Research, software and experiments.

[ Search Projects ]

[ All ] [ Research ] [ Software ] [ Visualization ]

┌──────────────────────────┐
│ Project 01               │
│                          │
│ Description              │
│                          │
│ MD  LAMMPS  Electrospray │
└──────────────────────────┘

┌──────────────────────────┐
│ Project 02               │
└──────────────────────────┘
```

桌面端建议：

```text
2 Columns
```

移动端：

```text
1 Column
```

---

## 5.4 推荐首批项目

可以优先整理：

### Research

```text
Ionic Liquid Electrospray MD
```

```text
Porous Emitter Electrospray
```

```text
PINNs for Electrospray Multiphysics
```

```text
Dual-mode Ionic Liquid Propulsion
```

### Software

```text
LAMMPS Analysis Toolkit
```

```text
Electrospray Data Dashboard
```

```text
Experimental Data Processing Tools
```

### Courses

```text
PINNs Course
```

```text
Agent Learning Course
```

```text
MD and DFT Learning Notes
```

---

# 6. Projects 数据模型

推荐使用 Astro Content Collections。

新增：

```text
src/content/projects/
```

不要直接使用单一 `projects.ts` 管理全部项目。

这样后续项目内容可以直接使用 Markdown 或 MDX。

推荐 frontmatter：

```yaml
---
title: Ionic Liquid Electrospray MD Platform
description: Molecular dynamics framework for ionic liquid electrospray.
category: Research
status: Active
pubDatetime: 2026-08-01
updatedDatetime: 2026-09-01

tags:
  - Molecular Dynamics
  - LAMMPS
  - Electrospray
  - Ionic Liquid

cover: ./cover.webp

repo:
paper:
demo:

featured: true
draft: false
---
```

---

## 6.1 Project 字段建议

基础字段：

```text
title
description
category
status
pubDatetime
tags
featured
draft
```

链接字段：

```text
repo
paper
demo
website
```

可选字段：

```text
cover
updatedDatetime
collaborators
institution
```

---

## 6.2 Project 状态

建议统一为：

```text
Active
Completed
Paused
Archived
```

页面上可以显示小型状态标签。

---

# 7. Projects 文件结构

建议：

```text
src/
├── components/
│   └── project/
│       ├── ProjectCard.astro
│       ├── ProjectGrid.astro
│       ├── ProjectFilter.astro
│       └── ProjectMeta.astro
│
├── content/
│   └── projects/
│       ├── electrospray-md.md
│       ├── pinns-electrospray.md
│       └── ...
│
└── pages/
    └── projects/
        ├── index.astro
        └── [slug].astro
```

---

# 8. Gallery 模块

## 8.1 Gallery 定位

Gallery 不只是“照片墙”。

它应该是站点中的视觉档案。

建议名称继续使用：

```text
Gallery
```

中文可使用：

```text
光影
```

或者：

```text
影像
```

导航建议仍使用英文 `Gallery`。

---

## 8.2 Gallery 分类方式

推荐按主题分类。

```text
Campus
Travel
Laboratory
Life
Cats
```

另一种方案是按照年份。

```text
2026
2025
2024
```

更推荐主题作为一级分类。

年份作为 metadata。

---

## 8.3 Gallery 首页

Gallery 首页只展示 Album。

不直接铺开全部照片。

示意：

```text
GALLERY

Images, places and fragments of time.

[ Search ]

┌──────────────┐
│              │
│   COVER      │
│              │
└──────────────┘
Tsinghua · Autumn
2026 · 12 Photos
```

---

# 9. Gallery Album 卡片

可以借鉴 XinghuisamaBlogs 的照片叠放效果。

结构：

```text
Back Photo
rotate +6deg

Middle Photo
rotate -3deg

Cover Photo
rotate 0deg
```

hover：

```text
Cover
translateY -4px

Back
rotate +10deg

Middle
rotate -6deg
```

动效要轻。

避免明显弹跳。

---

# 10. Gallery Album 详情

进入相册后使用 Masonry。

推荐：

```text
Desktop
4 Columns

Tablet
2 to 3 Columns

Mobile
1 Column
```

每张照片支持：

- Lazy Loading
- Caption
- Lightbox
- Keyboard Navigation
- ESC Close
- Previous
- Next

---

# 11. Gallery 数据模型

推荐新增：

```text
src/content/gallery/
```

每个 Markdown 文件代表一个 Album。

例如：

```text
src/content/gallery/
├── tsinghua-autumn.md
├── laboratory.md
├── beijing.md
└── cats.md
```

推荐 frontmatter：

```yaml
---
title: Tsinghua · Autumn
description: Early autumn around Tsinghua campus.
date: 2026-09-01
category: Campus
cover: ./cover.webp
featured: true

photos:
  - src: ./01.webp
    caption: Second Gate
  - src: ./02.webp
    caption: Evening light
---
```

---

# 12. Gallery 文件结构

```text
src/
├── components/
│   └── gallery/
│       ├── AlbumCard.astro
│       ├── AlbumGrid.astro
│       ├── GalleryGrid.astro
│       └── Lightbox.astro
│
├── content/
│   └── gallery/
│       ├── tsinghua-autumn.md
│       └── ...
│
└── pages/
    └── gallery/
        ├── index.astro
        └── [slug].astro
```

---

# 13. Header 改造

当前 Header 已经支持：

- Desktop Navigation
- Mobile Navigation
- Search
- Archive
- Theme
- i18n

因此只需要调整链接。

推荐：

```text
Blog
Courses
Projects
Gallery
About
```

右侧图标：

```text
Archive
Search
Theme
```

Tags 从导航删除。

Tags 页面继续保留。

---

# 14. 移动端导航

不建议复制 XinghuisamaBlogs 的旋转轮盘。

原因：

- 交互成本较高
- 与当前视觉语言差异较大
- 维护复杂
- 无障碍支持更困难
- 导航本身不应成为视觉主角

继续使用当前移动菜单。

可以进行小幅优化：

- 增加 Projects
- 增加 Gallery
- 增加 active state
- 增加非常轻的展开动画

---

# 15. Content Collections 扩展

当前：

```text
posts
courses
pages
```

改为：

```text
posts
courses
projects
gallery
pages
```

建议在：

```text
src/content.config.ts
```

增加：

```text
projects
gallery
```

---

# 16. i18n 扩展

当前站点已经有 i18n。

因此新增页面时不要直接将文本写死在 Header。

需要增加：

```text
nav.projects
nav.gallery
```

首页增加：

```text
home.explore
home.projects
home.gallery
home.courses
home.blog
```

Projects 增加：

```text
projects.title
projects.description
projects.search
projects.all
```

Gallery 增加：

```text
gallery.title
gallery.description
gallery.search
gallery.photos
```

---

# 17. Search 策略

现有 Pagefind 继续保留。

建议第一阶段：

```text
Global Search
```

继续只负责站点总体搜索。

Projects 页面使用本地筛选。

Gallery 页面使用本地筛选。

---

## 17.1 Projects 搜索

搜索字段：

```text
title
description
tags
category
```

---

## 17.2 Gallery 搜索

搜索字段：

```text
album title
description
category
caption
```

第一阶段可以只搜索 Album。

照片 caption 搜索可以后续增加。

---

# 18. 视觉规范

## 18.1 圆角

不要使用过大的圆角。

建议：

```text
Cards
12px to 16px

Buttons
8px to 12px

Tags
6px
```

避免所有元素都采用 `rounded-3xl`。

---

## 18.2 阴影

默认不使用强阴影。

建议：

```text
border
+
very soft shadow
```

hover 时增加一点阴影。

---

## 18.3 动画

建议动画时长：

```text
150ms
to
300ms
```

Gallery Album 可以：

```text
300ms
to
450ms
```

避免超过 700ms 的常规 hover。

---

## 18.4 动画原则

默认只允许：

```text
translate
opacity
scale
rotate
```

不要使用复杂连续动画。

需要支持：

```text
prefers-reduced-motion
```

---

# 19. 页面宽度

当前博客文章宽度可以继续保持较窄。

Projects 和 Gallery 需要更宽。

建议：

```text
Article
max-width about 760px

Homepage
max-width about 1100px

Projects
max-width about 1100px

Gallery
max-width about 1280px
```

因此不要强制所有页面共用一个内容宽度。

---

# 20. 图片策略

Gallery 图片需要控制仓库体积。

建议：

```text
Original Photos
不要直接进入 Git 仓库

Web Images
WebP or AVIF
```

推荐 Gallery 长边：

```text
1600px
to
2400px
```

封面：

```text
1200px
to
1600px
```

缩略图：

```text
600px
to
900px
```

继续使用 Astro Assets 和 Sharp。

---

# 21. SEO

Projects 和 Gallery 都需要独立 metadata。

Projects：

```text
title
description
ogImage
canonicalURL
```

Gallery：

```text
title
description
cover
canonicalURL
```

项目详情页面建议使用：

```text
Project Title | Tiegen Fang
```

Gallery：

```text
Album Title | Gallery | Tiegen Fang
```

---

# 22. 可访问性

新增模块必须继续满足：

- 键盘访问
- alt text
- aria-label
- focus outline
- reduced motion
- Lightbox ESC close
- 图片 lazy loading
- 合理 heading 层级

不要因为视觉动画降低可访问性。

---

# 23. 性能目标

Gallery 是最容易引入性能问题的页面。

建议目标：

```text
LCP < 2.5 s

CLS < 0.1
```

需要：

- Lazy Loading
- Responsive Images
- WebP or AVIF
- Width and Height
- 避免一次加载全部高清原图
- 首页 Gallery 只加载封面
- Album 页面才加载照片

---

# 24. 第一阶段

## Phase 1 · Projects

目标：

新增完整 Projects 系统。

任务：

- 修改 content.config.ts
- 创建 projects collection
- 创建 ProjectCard
- 创建 ProjectGrid
- 创建 projects/index.astro
- 创建 projects/[slug].astro
- 增加 Projects 导航
- 增加 Projects i18n
- 建立 3 个示例项目

验收：

- `/projects` 可以访问
- 项目可以从 Markdown 创建
- 支持分类
- 支持搜索或筛选
- 支持项目详情
- 移动端正常
- GitHub Pages 正常

---

# 25. 第二阶段

## Phase 2 · Gallery

目标：

建立 Album + Masonry + Lightbox。

任务：

- 创建 gallery collection
- 创建 AlbumCard
- 创建 AlbumGrid
- 创建 GalleryGrid
- 创建 Lightbox
- 创建 gallery/index.astro
- 创建 gallery/[slug].astro
- 加入 Gallery 导航
- 加入 Gallery i18n
- 创建 2 个示例 Album

验收：

- `/gallery` 可以访问
- Album 可以通过 Markdown 创建
- Album 可以显示 cover
- Album 详情支持 Masonry
- 图片支持 Lightbox
- 移动端正常
- 图片 lazy load 正常

---

# 26. 第三阶段

## Phase 3 · Homepage

目标：

将首页升级为个人主页。

任务：

- 保留 Hero
- 保留 GardenScene
- 增加 Explore
- 增加 Featured Projects
- 重构 Recent Writing
- 调整 section spacing
- 调整首页宽度
- 增强 Projects 和 Gallery 入口

验收：

首页可以清晰回答：

```text
Who
What
Projects
Writing
Gallery
```

---

# 27. 第四阶段

## Phase 4 · Navigation

任务：

将导航调整为：

```text
Blog
Courses
Projects
Gallery
About
```

工具入口：

```text
Archive
Search
Theme
```

Tags 不再显示在 Header。

验收：

- Desktop 不拥挤
- Mobile 不溢出
- Active state 正确
- i18n 正常

---

# 28. 第五阶段

## Phase 5 · Visual Refinement

统一：

- Border
- Radius
- Typography
- Card spacing
- Hover
- Motion
- Image treatment

重点检查：

```text
Homepage
Projects
Gallery
Courses
Blog
About
```

确保它们属于同一个设计系统。

---

# 29. 第六阶段

## Phase 6 · Optional Features

等核心架构稳定后再考虑。

候选功能：

### Now

展示：

```text
Reading
Researching
Building
Learning
```

推荐程度：

```text
High
```

---

### Uses

展示：

- Hardware
- Software
- Research Tools
- Development Tools

推荐程度：

```text
Medium
```

---

### Friends

友情链接。

推荐程度：

```text
Medium
```

---

### Moments

类似短动态。

推荐程度：

```text
Low
```

原因：

维护成本较高。

---

### Music

推荐程度：

```text
Low
```

与当前站点主线关联较弱。

---

# 30. 不建议近期加入的内容

暂不建议：

```text
Music Player
复杂 Friends System
完整 CMS
独立后台
AI Chat
复杂 Dashboard
动态数据库
登录系统
```

原因：

当前站点的核心优势是：

```text
Static
Fast
Simple
Maintainable
Git Based
```

不应为了功能数量破坏这一优势。

---

# 31. 推荐最终目录

```text
src/
├── assets/
│
├── components/
│   ├── project/
│   │   ├── ProjectCard.astro
│   │   ├── ProjectGrid.astro
│   │   ├── ProjectFilter.astro
│   │   └── ProjectMeta.astro
│   │
│   ├── gallery/
│   │   ├── AlbumCard.astro
│   │   ├── AlbumGrid.astro
│   │   ├── GalleryGrid.astro
│   │   └── Lightbox.astro
│   │
│   ├── Header.astro
│   ├── Footer.astro
│   ├── GardenScene.astro
│   └── ...
│
├── content/
│   ├── posts/
│   ├── courses/
│   ├── projects/
│   ├── gallery/
│   └── pages/
│
├── pages/
│   ├── index.astro
│   │
│   ├── posts/
│   ├── courses/
│   │
│   ├── projects/
│   │   ├── index.astro
│   │   └── [slug].astro
│   │
│   ├── gallery/
│   │   ├── index.astro
│   │   └── [slug].astro
│   │
│   ├── about.astro
│   ├── search.astro
│   ├── archives/
│   └── tags/
│
├── content.config.ts
└── config.ts
```

---

# 32. 推荐开发优先级

```text
P0
Projects
Gallery

P1
Homepage
Header

P2
Visual Refinement
Search
SEO
Performance

P3
Now
Uses
Friends
Moments
Music
```

---

# 33. 建议提交策略

每一个阶段单独提交。

示例：

```text
feat: add projects content collection
```

```text
feat: add projects index and detail pages
```

```text
feat: add gallery album system
```

```text
feat: add gallery lightbox
```

```text
refactor: restructure homepage sections
```

```text
refactor: simplify primary navigation
```

```text
style: unify portfolio card system
```

不要将全部改动放在一个 commit 中。

---

# 34. 建议分支

开发分支：

```text
feature/portfolio-expansion
```

子任务可以继续拆分：

```text
feature/projects
feature/gallery
feature/homepage
```

完成后再合并到：

```text
main
```

---

# 35. 最终验收清单

## Content

- [ ] Blog 正常
- [ ] Courses 正常
- [ ] Projects 正常
- [ ] Gallery 正常
- [ ] About 正常
- [ ] Archive 正常
- [ ] Search 正常

## Navigation

- [ ] Blog
- [ ] Courses
- [ ] Projects
- [ ] Gallery
- [ ] About
- [ ] Archive
- [ ] Search
- [ ] Theme

## Projects

- [ ] Content Collection
- [ ] Index
- [ ] Detail
- [ ] Category
- [ ] Tags
- [ ] Featured
- [ ] Search

## Gallery

- [ ] Albums
- [ ] Cover
- [ ] Masonry
- [ ] Caption
- [ ] Lightbox
- [ ] Lazy Loading

## Homepage

- [ ] Hero
- [ ] GardenScene
- [ ] Explore
- [ ] Featured Projects
- [ ] Recent Writing

## Engineering

- [ ] Astro build passes
- [ ] Astro check passes
- [ ] ESLint passes
- [ ] Pagefind works
- [ ] GitHub Pages deploy works
- [ ] Base path works
- [ ] Mobile works
- [ ] Dark mode works
- [ ] i18n works
- [ ] Reduced motion works

---

# 36. 最终目标

完成以上改造后，站点的核心结构应从：

```text
Personal Blog
```

升级为：

```text
Personal Digital Garden
+
Research Portfolio
+
Knowledge Base
+
Visual Archive
```

同时继续保留「方寸之间」当前最重要的三个特点：

```text
克制
个人化
可长期维护
```

整个改造的关键不是增加更多功能。

关键是建立更完整的信息层级。

Projects 用来回答：

> 我做了什么。

Courses 用来回答：

> 我系统整理了什么。

Blog 用来回答：

> 我在思考什么。

Gallery 用来回答：

> 我看见了什么。

GardenScene 和首页则负责回答：

> 这里是谁的空间。
