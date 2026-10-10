---
pubDatetime: 2026-09-01T04:00:00Z
title: 第 1 讲：写一篇普通文章
course: site-usage-guide
order: 1
draft: false
tags:
  - 指南
description: 文件放哪、frontmatter 怎么写、什么时候会发布——写文章需要的全部知识。
---

每一篇文章就是 `src/content/posts/` 目录下的一个 markdown 文件（`.md` 或 `.mdx`）。文件名就是文章的 URL，所以**用英文或拼音命名**，比如 `my-first-note.md` 会发布到 `/posts/my-first-note/`。标题中文没问题，但文件名别用中文。

## frontmatter

每篇文章开头需要一段 YAML frontmatter，完整的字段如下：

```yaml
---
pubDatetime: 2026-09-01T02:00:00Z # 必填，发布时间
title: 文章标题 # 必填
description: 一两句话的摘要。 # 必填，会显示在列表和搜索结果里
featured: false # 可选，true 会出现在首页「精选」
draft: true # 可选，true 为草稿，不会发布
tags: # 可选，默认 [others]
  - 随笔
modDatetime: 2026-09-02T01:00:00Z # 可选，修改时间，有它才会显示「更新于」
course: site-usage-guide # 可选，归属的课程 slug（写讲义用，见第 2 讲）
order: 1 # 可选，课程内讲次（见第 2 讲）
---
```

## 正文

正文就是标准 markdown：二、三级标题会自动生成阅读页的**本文目录**，不必手写 `Table of contents` 才能使用侧栏。已有的正文内嵌目录仍可保留；标题带锚点，代码块带复制按钮和语言标签，支持 callout 提示块。

课程讲义还会显示按讲次排列的**课程导航**，底部通过“上一讲／下一讲”继续阅读同一课程。窄屏时导航收进抽屉，可以在阅读中随时展开。

## 发布流程

```bash
npm run dev      # 本地预览 http://localhost:4321
npm run build    # 构建并做类型检查，发布前跑一遍
```

推送到 GitHub 后，Actions 会自动构建并发布到 GitHub Pages。把 `draft` 设为 `true` 或者不推送，就是"还没写完"。

> [!TIP]
> 一个文件一篇文，命名见名知意，`description` 认真写——它是首页、搜索和分享卡片上的门面。
