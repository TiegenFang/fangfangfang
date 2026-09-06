---
title: 我的第一个相册
description: 一句话介绍这个相册，会显示在相册详情页和列表卡片上。
date: 2026-09-06
category: Life
cover: ./starter/cover.webp
draft: true
photos:
  - src: ./starter/cover.webp
    caption: 封面照片的说明
  - src: ./starter/01.webp
    caption: 竖幅照片的说明
  - src: ./starter/02.webp
    caption: 横幅照片的说明
---

这是一个**草稿相册**，用来演示影像系统的用法；它不会发布，占位图只有灰底色块。

## 怎么发布一个真相册

1. 把本文件复制并重命名为相册的英文/拼音 slug，例如 `tsinghua-autumn.md`——文件名即 URL。
2. 在 `src/content/gallery/` 下新建同名文件夹（如 `tsinghua-autumn/`），把照片放进去；封面命名 `cover`，其余按 `01`、`02`……编号。照片用 WebP/JPEG，长边 1600–2400px 即可，Astro 构建时会自动压缩出多档尺寸并生成懒加载。
3. 修改 frontmatter：`title`、`description`、`date`、`category`（建议 Campus / Travel / Laboratory / Life / Cats，可自拟）、`cover` 和 `photos` 列表（`caption` 可选）。
4. 相册至少要有一张照片（`photos` 不少于 1 项）；列表卡片的「照片叠放」效果会自动用前 3 张照片。
5. 把 `draft: true` 改成 `false` 再构建发布——导航里的「影像」入口会在有已发布相册后自动出现，没有相册时不会显示空栏目。
6. 删除本说明章节。
