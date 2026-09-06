---
pubDatetime: 2026-09-06T06:00:00Z
title: 第 3 讲：发布一个相册
course: site-usage-guide
order: 3
draft: false
tags:
  - 指南
description: 影像栏目的运作方式——建相册目录、放照片、写 frontmatter，以及「影像」导航入口的显示条件。
---

影像栏目由**相册**组成：一个 markdown 文件代表一个相册，相册详情页用瀑布流展示照片，点开任意一张有灯箱（左右切换、ESC 关闭）。仓库里的 `src/content/gallery/starter.md` 是一份带说明的草稿模板，本文是它的展开版。

## 建一个相册

每个相册是 `src/content/gallery/` 下的一对文件：**一个 md 文件 + 一个同名照片文件夹**。

```text
src/content/gallery/
├── tsinghua-autumn.md        ← 相册条目（文件名即 URL）
└── tsinghua-autumn/
    ├── cover.webp            ← 封面
    ├── 01.webp
    ├── 02.webp
    └── 03.webp
```

文件名用英文或拼音（比如 `tsinghua-autumn.md` 发布到 `/gallery/tsinghua-autumn/`），照片放进同名文件夹，封面命名 `cover`。

## frontmatter

```yaml
---
title: 清华园 · 秋
description: 一句话介绍，显示在详情页和列表卡片上。
date: 2026-09-01
category: Campus
cover: ./tsinghua-autumn/cover.webp
draft: false
photos:
  - src: ./tsinghua-autumn/cover.webp
    caption: 二校门
  - src: ./tsinghua-autumn/01.webp
    caption: 晚照
---
```

几个字段的行为：

- **photos** 至少要有一张；`caption` 可选，显示在瀑布流缩略图和灯箱里。
- **影像列表卡片有照片叠放效果**，会自动取相册前 3 张照片；不足 3 张的空位用素色纸层补位。
- **category** 建议从 `Campus / Travel / Laboratory / Life / Cats` 里选，也可以自拟，显示为 `年份 · 分类`。
- 照片建议 WebP 或 JPEG，长边 1600–2400px 就够——构建时 Astro 会自动压缩出多档尺寸并懒加载，原图不必手动压缩。

## 「影像」入口什么时候出现

一级导航里的「影像」是**条件显示**的：只有存在至少一个 `draft: false` 的相册，入口才会出现。所以你在草稿阶段随便建文件，都不会把空栏目暴露给访客；写好、改成 `draft: false` 再构建发布，入口自动就位。

`draft: true` 的相册也不会生成任何可访问的页面——这一点和文章的行为一致。

## 灯箱

相册详情页点任意照片打开灯箱：`←` `→` 方向键或两侧按钮翻页（相邻照片会预加载），`ESC` 或点击遮罩关闭。翻页时自动清除已关闭的图，避免后台继续下载。
