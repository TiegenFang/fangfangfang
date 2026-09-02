---
pubDatetime: 2026-09-01T05:00:00Z
title: 第 2 讲：为课程写讲义
course: site-usage-guide
order: 2
draft: false
tags:
  - 指南
description: 课程页怎么建、讲义怎么归属到课程、讲次怎么排——课程栏目的运作方式。
---

这个站点的「课程」是成体系的内容：一门课一个页面，页面里有课程简介和按讲次排列的讲义列表。它由两部分组成——**课程条目**和**讲义文章**。

## 开一门新课

在 `src/content/courses/` 下新建一个 markdown 文件，文件名就是课程 slug（同样用英文或拼音），比如 `site-usage-guide.md`：

```yaml
---
pubDatetime: 2026-09-01T03:00:00Z # 必填，课程列表按它排序
title: 课程名 # 必填
description: 一句话说清这门课讲什么。 # 必填
draft: false # 可选，true 为草稿
---
```

正文部分写课程简介：这门课适合谁、能学到什么、有没有前置知识。不用列讲义——讲义列表是自动生成的。

## 写讲义

讲义就是普通文章：放在 `src/content/posts/`，frontmatter 里加两个字段就归属到了课程：

```yaml
course: site-usage-guide # 对应课程文件的文件名（不含 .md）
order: 1 # 讲次，数字越小越靠前；不写就按发布时间排
```

讲义会同时出现在课程页和博客列表里——它既是课的一讲，也是一篇正常的文章，有标签、能搜索、进归档。

## 两点约定

1. **课程改名 slug 时**，要同步修改归属它的讲义的 `course` 字段，课程页才能列出它们。
2. **讲义和课程是多对一**：一篇文章只能属于一门课；一门课的讲义数量不限。

> [!NOTE]
> 学完了？把这门课（`src/content/courses/site-usage-guide.md`）和这两篇讲义删掉，开始写你自己的内容。
