# 修改日志

「方寸之间」——Tiegen Fang 的个人博客（Astro 7 + Tailwind 4 + Pagefind，中文界面，GitHub Pages 子路径 `/fangfangfang`）。

本文件记录站点结构与内容层面的变更，按时间倒序。提交粒度的细节见 `git log`；内容写作约定见 `AGENTS.md`，各课程的完整规格见 `docs/specs/`。

---

## 2026-09-06 · 首页信息架构、Projects 与影像系统

### 新增

- **首页信息架构升级。** 新增课程入口区（课程名 + 讲次数 + 一句简介，置于景窗与精选之间）；讲义卡片增加所属课程徽标（`courses` 集合新增 `shortTitle` 字段：MD 与 DFT / PINNs / 使用指南）；Hero 增加定位副标题；简介、社交链接与景窗的留白收紧，删去与导航重复的入口段落。
- **Projects 模块。** 新增 `projects` 内容集合（category / status / repo / featured 等字段，见 ADR 0002），`/projects` 列表页（Research / Software / Learning 本地分类筛选，1100px 宽版式）与项目详情页；首批 8 个真实项目条目（Research 3、Software 3、Learning 2，描述依据各仓库 README）；一级导航加入「项目」，i18n 中英文案补齐。
- **Gallery 影像系统。** 新增 `gallery` 集合（一个 markdown 一个相册，照片与 md 同目录，Astro 多档尺寸 + 懒加载）；相册卡片照片叠放效果（前 3 张照片 6°/−3° 叠放，hover 展开，300ms，支持 reduced-motion）；相册详情页 CSS columns 瀑布流与原生 `<dialog>` 灯箱（左右切换、ESC / 遮罩关闭、题注）；「影像」导航项仅在有已发布相册时出现；附 `starter` 草稿相册作为写相册的模板与说明。
- 展示型页面引入 `wide-layout`（1100px）宽版式，`Main` 组件支持 `wide` 属性。
- 站点定位升级为个人数字主页：`CONTEXT.md` 更新定位并新增「项目」「相册」「影像」词条；新增 ADR 0002（Projects 用独立内容集合，Gallery 同模式预留）；收录重构计划文档 `docs/plan/`。

### 修正

- 一级导航移除「标签」，标签页保留（restructure plan §13）。
- `projects` 与 `gallery` 详情页的 `getStaticPaths` 过滤 `draft: true`，草稿不再生成可访问页面。
- astro check 暴露的类型与弃用问题：`HTMLAttributes` 改从 `astro/types` 引入、`z.string().url()` 弃用改 `z.url()`。

### 验证

- 浏览器实测：首页明暗两套主题与 390px 移动端布局；`/projects` 分类筛选（aria-pressed 与卡片显隐联动）；项目详情页版式；相册卡片叠放与 hover；灯箱开图、题注与控制按钮。
- 构建产物核对：无已发布相册时导航不渲染「影像」；草稿相册不生成页面（`dist/gallery/` 仅剩 index.html）。
- `npm run lint`、`npm run format:check`、`npm run build`（astro check 74 文件 0 error，Pagefind 索引 30 页）全部通过。

---

## 2026-09-06 · 全站讲义目录（TOC）

### 新增

- **16 篇课程讲义全部加上可折叠目录。** 模板的 `remarkToc` + `remarkCollapse`（`astro.config.ts`）此前一直配置着，但没有任何文章包含 `## Table of contents` 标题去触发它，因此目录从未渲染——这是一个空转的配置。现在 PINNs 八讲与 MD/DFT 八讲全部补上该标题，渲染为 `<details><summary>Open Table of contents</summary>…` 的折叠列表，含三级子章节。
- 新增 `cite.py`（上一节引入，此处一并说明）：逐条回查讲义全部 DOI 的工具，`verify` 子命令做双向标题比对，`emit` 从 Crossref 元数据产出文献行。

### 修正

- **三处含行内公式的章节标题导致目录锚点失效。** `## 桥接：从 $\gamma$、$\sigma$、$\eta$ 到…`、`## 5 电荷缩放 $\pm0.8e$…`、`## 5 电荷注入边界，以及 $\pm0.8e$ …` 三处，remark-toc 对标题纯文本生成的 slug 与标题元素的 `id` 不一致，点击无跳转。改为在标题里用中文词与 Unicode `±`，公式退回正文。

### 验证

- 构建产物逐页扫描：**16 篇讲义的目录全部生成，每条锚点都能在页面内找到对应 `id`（0 失配）**。
- 浏览器实测第 6 讲：8 条目录链接、0 缺失目标、原失效的「桥接」条目可定位、折叠展开与滚动正常、271 个公式节点 0 个渲染错误。
- `npm run format:check`、`npm run lint`、`npm run build`（含 `astro check` 与 Pagefind）全部通过，44 页、0 error。

---

## 2026-09-05 · 第二门课程：分子动力学与第一性原理

### 新增

- **课程 `md-dft-ionic-liquid`：课程页 + 8 讲。** 「离子液体工质的电喷雾与绿色推进」，教学顺序为多尺度定位 → DFT → MD → 力场谱系 → 机器学习势函数 → 电喷雾 I → 电喷雾 II → HAN/ADN 绿色推进剂。
- **KaTeX 启用 mhchem**（`astro.config.ts` 增加 `import "katex/dist/contrib/mhchem.mjs"`），`\ce{}` 化学式与反应方程全站可用。站点是 SSG，浏览器端无需加载该扩展。必须用 `.mjs` 入口：本仓库为 `type: module`，CJS 入口可能注册到另一份 katex 实例导致宏失效。
- **引用校验产物**：`docs/paper/track-md-dft.md`（59 条应用文献逐条 Crossref 回查）、`track-md-dft-foundational.md`（18 类奠基文献补全）、`track-md-dft-authors.json`（权威作者/卷页/年份缓存）。八讲合计 **104 个不同 DOI，0 未解析、0 标题不符**。

### 变更

- **两门课程建立双向交叉引用。** 本课程第 5、7、8 讲分别指向 `pinns-variants-taxonomy`、`pinns-ehd`、`pinns-combustion`；`pinns-ehd.md` 反向增补 [21][22] 两条非 PINNs 数值路线（MD–3D Poisson 耦合、EHD–PIC 场蒸发）并指向本课程第 7 讲。站内链接一律写完整 URL——本仓库 markdown 中以 `/` 开头的链接不会被加上 base 前缀。

### 修正（实施过程中查出）

- **第 7 讲把 `[emim]+` 写成 C8H14N2+（138 u）**，实际为 C6H11N2+ = 111.2 u，整张荷质比表失准；按正确式量重算两条碎裂通道与全表速度、比冲（单体 5 kV → 93.2 km/s → 9500 s，与第 6 讲一致）。
- **AMOEBA 原始文献的 DOI 是 404 死链**：`10.1021/jp0278152` 在 Crossref 与 doi.org 均返回 404，真实注册串为 `10.1021/jp027815+`（Crossref 200；doi.org 的 403 是出版社拒绝爬虫，属解析成功）。并确立判读纪律：**404 = 标识符不存在，403 = 标识符有效但被反爬拦截，不得因 403 改串**。
- **Nernst–Einstein 电导率高估幅度**从早期未经核验的「30–60%」统一改写为与各讲离子有效分数表自洽的「四成到一倍」，误差传递值同步更正。
- **spec 初稿的锥射流电流标度律量纲不成立**：`I ∝ (Qσ/ε₀)^{1/2}` 开方得 `m^{1.5}·s^{-1}`，不是电流；正确形式为 `I ∝ (γσQ)^{1/2}`，`ε₀` 只能进入无量纲系数。
- 三处年份按 Crossref 更正（2021 / 2013 / 2015），并确立**DOI 串内嵌的年份一律不作为判年依据**。
- 两处单位排版：`10^\circ`、`2 \mu m` 等指数与单位的间距写法经浏览器实测修正。

### 已知偏离与局限

- 第 7 讲成稿 6162 中文字、第 3 讲 4601 字，超出原定 4500 上限；分别在 spec §9.14 与 §8 显式记录理由（覆盖点驱动，非注水），可推翻。
- 未逐页做浅色/深色双主题截图，由「全页面 0 个 `katex-error`」加第 7、8 讲与 `pinns-ehd` 的抽查覆盖。

---

## 2026-09-04 · 第一门课程：物理信息神经网络

### 新增

- **课程 `pinns`：课程页 + 8 讲。** 「从数学骨架到燃烧与电水动力学」。
- **KaTeX 数学渲染接入**（`remark-math` + `rehype-katex` + katex 样式），为所有含公式的内容铺路。`katex` 必须 pin 在 `^0.16.0`：`rehype-katex@7` 把它声明为普通 dependency，直接装新版会产生两份副本、CSS 与渲染器错配导致字形变方框。
- **`ignoreKatexInSearch` rehype 插件**：KaTeX 的 MathML `<annotation>` 携带 LaTeX 源码，会被 Pagefind 索引并在搜索摘要里显示为乱码；该插件给每个顶层 `.katex` 容器加 `data-pagefind-ignore`，既清索引又保留 MathML 的无障碍价值。
- 文献检索记录 `docs/paper/track-A.md`、`track-C.md`；`docs/agents/` 下的 issue tracker、triage 标签与领域文档约定。

### 修正

- 参考文献逐条之间补空行，使每条独立成段（CommonMark 原先把连续的 `[n]` 行合并为一个段落）。
- NVIDIA 框架按现名 **PhysicsNeMo** 列出，并补充 SimNet → Modulus → PhysicsNeMo 的命名谱系。

---

## 2026-09-03 · 建站与工具链

### 新增

- 基于 **astro-paper** 模板搭建中文个人博客「方寸之间」。
- 领域词汇表 `CONTEXT.md` 与架构决策记录 `docs/adr/`；内容分文章 / 课程 / 页面三个集合，schema 以 `src/content.config.ts` 为准。

### 变更

- 合并上游模板初始提交，保留本地中文定制版本。
- **动态 OG 图禁用**（`features.dynamicOgImage: false`）：模板自带的 satori 字体不含中文字形，中文标题会渲染成空白，改用静态分享卡 `public/default-og.jpg`；站点标题或简介变更后需重跑 `npm run og`。

### 修正

- 同步 `package-lock.json` 与 `package.json`，修复 CI 的 `npm ci` 失败。

---

## 2026-09-02

- 仓库初始化。
