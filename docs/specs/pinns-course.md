# Spec：PINNs 课程「物理信息神经网络 —— 从数学骨架到燃烧与电水动力学」

状态：待确认 → 实施
课程 slug：`pinns`
承载位置：`src/content/courses/pinns.md` + `src/content/posts/pinns-*.md`（8 讲）
定位：深度综述 + 数学推导，面向研究生及以上读者，术语可用英文原词

---

## 1. 目标与非目标

### 目标

- 让读者建立 PINNs 的完整方法论认知：**定义 → 数学骨架 → 训练病态 → 变体谱系 → 能力边界**。
- 给出**燃烧**与**电水动力学（EHD）**两个应用方向的独立深度章节，含具体控制方程与损失函数设计。
- 每条关键论断带**可核验出处**（DOI 或 arXiv 编号），文末附参考文献。

### 非目标

- 不提供完整可运行代码仓库。最多给不超过 15 行的损失函数伪代码或关键片段，不追求可执行。
- 不做「燃烧 + EHD 耦合建模」的专门章节。**两者并重但各自独立**——现有文献中该耦合交集近乎为空（详见 §7）。
- 不做纯科普。公式不回避，直觉解释服务于公式而非替代公式。
- 不追求文献穷尽。每讲参考文献控制在 8–20 条，优先奠基文献与代表性应用。

---

## 2. 技术前置（阻塞项，必须先做）

**站点当前不支持数学渲染。** `package.json` 无 `remark-math` / `rehype-katex` / `katex`，`package-lock.json` 中 `katex` 出现 0 次，`node_modules` 下三个包均未安装；`astro.config.ts:39-58` 的 markdown 管线只挂了 `remarkToc`、`remarkCollapse`、`rehypeCallouts`。本课程的核心是数学推导，此项不完成则第 2–7 讲全部无法写。

### 根因：上游模板本身不内置 KaTeX（已核验）

**不是本地漏装，是 astro-paper 上游的设计决定。**

- 上游 `satnaing/astro-paper` 的 `package.json` 共 28 个依赖，数学相关（`katex` / `remark-math` / `rehype-katex` / `mathjax`）为 **0**。markdown 相关只有 `@astrojs/mdx`、`@astrojs/markdown-remark`、`rehype-callouts`、`remark-collapse`、`remark-toc`、`@shikijs/transformers`——与本仓库一致。
- 上游 issue **#150**「suggestion: support latex math expressions using remark-math and rehype-katex」已**关闭**，结论是不内置、改为提供教程。
- 上游提供官方教程 `src/content/posts/how-to-add-latex-equations-in-blog-posts.md`（作者 Alberto Perdomo，最后更新 2025-03-22）。**本仓库在中文定制时把这篇教程删掉了**，所以本地看不到它——它是本节的权威依据。

### 任务（基于上游官方四步，已按本仓库 Astro 7 结构适配）

**1. 安装依赖 —— 必须 pin katex 到 0.16.x**

```bash
npm install remark-math rehype-katex katex@^0.16.0
```

> [!WARNING]
> **不要写 `npm install katex`（不带版本）。** 批次 0 实测踩中：`rehype-katex@7.0.1` 把 `katex: "^0.16.0"` 声明为**普通 dependency 而非 peerDependency**，而 `^0.16.0` 在 0.x 语义下不允许 0.18.x。直接装会得到顶层 `katex@0.18.5` + `rehype-katex` 内嵌 `katex@0.16.47` 两份副本（`npm ls katex` 可见），**实际执行渲染的是内嵌的 0.16.x**，而 `import "katex/dist/katex.min.css"` 加载的是顶层 0.18.x 的 CSS——正是上面 WARNING 描述的版本错配失效模式。
> 装 `katex@^0.16.0` 后 npm 去重为单份 `0.16.47`，`npm ls katex` 应显示 `deduped`。装完务必用 `npm ls katex` 确认只有一份。

**2. 挂载插件 —— 注意 API 形式与上游教程不同**

上游教程写的是旧版顶层数组形式（`markdown.remarkPlugins` / `markdown.rehypePlugins`）。本仓库用的是 **Astro 7 的 `markdown.processor: unified({...})`**（`astro.config.ts:39-46`），插件必须挂在 `unified()` 内部，挂到 `markdown` 顶层不会生效：

```ts
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

markdown: {
  processor: unified({
    remarkPlugins: [
      remarkMath, // 须在 remarkToc 之前，保证目录里的公式先被解析
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [rehypeCallouts, rehypeKatex],
  }),
  // shikiConfig 不变
}
```

`rehypeCallouts` 与 `rehypeKatex` 的先后顺序需实测一次：确认 callout 块（`> [!NOTE]`）内的公式能正常渲染。

**3. 引入 KaTeX 样式 —— 推荐打包器，理由与上游教程不同**

上游教程第 3 步用 CDN：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" />
```

> [!WARNING]
> **照抄这个 CDN 链接有已知风险。** CDN 是绝对 URL，字体从 jsdelivr 加载，**天然不受本站 `base: "/fangfangfang"` 子路径影响**——所以「CDN 在子路径下会出问题」这个担忧是不成立的。真正的风险是**版本错配**：链接固定在 `katex@0.15.2`，而 `npm install katex` 装的是 0.16.x，CSS 与 JS 版本不一致会导致部分字形渲染成方框。上游 issue **#509**（`\neq`、`\not` 渲染为方框）**至今仍是 open 状态**，而该 issue 下唯一报告「无法复现」的用户用的正是 `katex ^0.16.21` + `rehype-katex ^7.0.1` + `remark-math ^6.0.0` 的一致版本组合。

**本仓库采用打包器方案**，版本天然与所装 katex 一致且离线可用：

```astro
---
// src/layouts/Layout.astro，与现有 import "@/styles/global.css" 并列
import "katex/dist/katex.min.css";
---
```

代价是 KaTeX 字体文件会经 Vite 处理并以站点相对路径输出，**必须验证在 `/fangfangfang/` 子路径下字体 URL 被正确加上 base 前缀**（见验收）。

**4. 修复独立公式的主题配色 —— 上游教程第 4 步，不可省略**

上游 issue **#412**：**列表外**的 block equation 颜色被固定在 `#374151`，不随明暗主题变化；列表内的则正常。不修这一步，**深色模式下独立公式会变成暗灰色几乎不可见**——本课程每讲都有大量 `$$...$$` 独立公式，属于必踩。

本仓库的 prose 类名是 **`.app-prose`** 而非上游的 `.prose`（见 `src/styles/typography.css:5`，用于 `posts/[...slug]/index.astro:141`、`courses/[slug]/index.astro:49`、`about.astro:31`），选择器须相应改写，并嵌进已有的 `@layer base { .app-prose { ... } }` 结构中：

```css
/* src/styles/typography.css，@layer base 内 .app-prose 嵌套块中 */
.katex-display {
  @apply text-foreground;
}
```

**5. Pagefind 污染 —— 已确认存在，已修复**

批次 0 实测证实污染**不是假设而是事实**：KaTeX 的 MathML `<annotation encoding="application/x-tex">` 携带完整 LaTeX 源码，Pagefind 会把它当正文索引。用探针文实测：搜 `nabla` 能命中页面，且搜索摘要直接显示 `⋅E=ρcε0\nabl...` 这类原始 LaTeX；搜 `varepsilon` 显示 `rho_c}{`。渲染层的数学符号（∇、ω）同样会漏进摘要。

**修复方式**：在 `rehypePlugins` 末尾追加本地插件 `ignoreKatexInSearch`（见 `astro.config.ts`），手工递归 hast 树，给每个顶层 `.katex` 容器加 `data-pagefind-ignore` 属性。Pagefind 会跳过带该属性的元素。

- 只匹配 `className` 精确等于含 `"katex"` 的节点，**不匹配** `katex-mathml` / `katex-html` / `katex-display` 等子类名，因此每个公式恰好打一个标记。
- 命中后不再下钻，避免重复标记。
- **不用 `rehype-katex` 的 `output: "html"` 方案**：它虽能去掉 MathML（从而去掉 LaTeX 源码），但渲染层的 ∇、ω 等符号仍会进索引和摘要；且会牺牲 MathML 对屏幕阅读器的无障碍价值。`data-pagefind-ignore` 两者兼得。
- 修复后实测：搜 `nabla` 返回 `No results`；搜正文特征词仍正常命中，摘要在公式处干净截断。

代价：公式内容不可被搜索。可接受——按公式检索本身没有意义。

### 验收

- `npm run build` 通过（含 `astro check` 与 Pagefind 索引构建）。
- `npm run lint`、`npm run format:check` 通过（CI 顺序：lint → format:check → build）。
- 建一篇临时测试草稿，**在浏览器中实测**以下全部情形，且**浅色与深色两套站点主题下逐一检查**：
  - 行内公式 `$E = mc^2$`、`$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$`
  - 独立公式（**列表外**）——重点验 #412 的颜色修复
  - 独立公式（**列表内**）——对照，确认未被改坏
  - `aligned` 多行方程组（Maxwell 方程形式）——第 6、7 讲方程组的实际写法
  - **`\neq` 与 `\not`**——验 #509 的字形缺失是否复现
  - `\nabla`、`\partial`、`\sum`、`\prod`、`\varepsilon`、`\rho`、矩阵环境——本课程高频符号
  - callout 块（`> [!NOTE]`）内的公式
  - 目录（`remarkToc`）中含公式的标题
- Network 面板确认 `/fangfangfang/` 子路径下 KaTeX 字体文件无 404（若走打包器方案，此项为硬性检查）。
- 搜索页实测：公式不被 Pagefind 索引成乱码摘要。

> [!WARNING]
> 不要在未通过本节验收前开始写任何一讲。写完 8 讲再改管线，会同时暴露明暗主题配色、字体路径、callout 冲突三类问题，返工成本极高。
> 测试草稿验收后删除，不要发布。

### 批次 0 执行记录（2026-09-04，已完成）

前置条件已满足，第 1–8 讲可以开始写。实测结论如下：

| 检查项 | 结果 |
|---|---|
| 安装版本 | `katex@0.16.47`（单份，已 dedupe）、`remark-math@6.0.0`、`rehype-katex@7.0.1` |
| `npm ls katex` | 顶层 0.16.47，rehype-katex 与 micromark-extension-math 均 `deduped` |
| `npm run lint` / `format:check` | 通过 |
| `npm run build` | 通过，含 `astro check`（0 error）与 Pagefind 索引 |
| 渲染节点数 | 测试文 63 个 `.katex`、13 个 `.katex-display`、0 个 `.katex-error` |
| 字体 base 前缀 | 构建 CSS 中 59 个 KaTeX 字体 URL **全部**带 `/fangfangfang/` 前缀；60 个字体文件全部 HTTP 200 |
| 配色覆盖编译结果 | `.app-prose .katex-display,.app-prose .katex{color:var(--foreground)}` |
| **#412 列表外独立公式配色** | 浅色 `rgb(40,39,40)` / 深色 `rgb(234,237,243)`，均等于正文色，**非** `#374151` |
| 深色对比度 | 公式对背景 `rgb(33,39,55)` 为 **12.7:1**（WCAG AAA 要求 7:1）；若未修 #412 将约 1.5:1 |
| 浅色对比度 | 公式对背景 `rgb(253,253,253)` 为 **14.63:1** |
| **#509 字形缺失** | `\neq`（U+2260）、`\notin`（U+2209）、`\not\parallel`（U+2226）均正常渲染，无方框 |
| 各公式上下文 | 行内、列表外独立、列表内独立、表格、callout、目录、标题——7 类全部正常且颜色一致 |
| 目录内公式 | 目录为 `<details>`（summary 为 "Open Table of contents"），含 13 链接、3 个 `.katex`，标题公式正确渲染 ⇒ `remarkMath` 排在 `remarkToc` 前生效 |
| callout 内公式 | NOTE / WARNING 块内行内与独立公式均渲染 ⇒ `rehypeCallouts` 与 `rehypeKatex` 顺序无冲突 |
| 代码块保护 | `pre`/`code` 内 0 个 `.katex`，`$` 保持字面；`\$` 转义正常 |
| **Pagefind 污染** | 确认存在：KaTeX MathML annotation 的 LaTeX 源码被索引，搜 `nabla` 命中且摘要显示原始 LaTeX |
| **Pagefind 修复** | `ignoreKatexInSearch` 插件给 3/3 顶层 `.katex` 加 `data-pagefind-ignore`；修复后搜 `nabla` 为 `No results`，正文词仍命中且摘要无公式残留 |
| 控制台 | 无报错、无 404 |

测试草稿（`src/content/posts/katex-smoke-test.md`）与验收截图已删除，重建后 14 页、不含测试页。

---

## 3. 写作规范

### 术语

- 沿用 `CONTEXT.md` 词汇表：**课程 / 讲义 / 讲次**。
- 「物理信息神经网络」首次出现给英文全称 Physics-Informed Neural Networks (PINNs)，之后统一用 PINNs。
- 英文术语保留原词并在首次出现时给中文对照：spectral bias（谱偏置）、stiff source term（刚性源项）、collocation point（配点）。
- **EHD 歧义必须显式消解**：本课程 EHD 一律指 electrohydrodynamics（电水动力学），不是 elastohydrodynamic（弹流润滑）、也不是 electro-hydraulic（电液）。首次出现时明确声明。

### 公式

- 行内 `$...$`，独立公式 `$$...$$`。
- 关键公式编号，格式 `(讲次.序号)`，如 `(2.3)`；正文引用写作「式 (2.3)」。
- 所有方程组必须**写全符号定义**：符号、物理含义、单位或无量纲化基准。不允许出现未定义的符号。

### 引用

- 正文用方括号编号 `[n]`，按讲内出现顺序编号。
- 每讲文末「参考文献」小节，格式：`[n] 作者. 题名. 期刊/会议, 年份. DOI 或 arXiv 编号.`
- **缺 DOI 的中文期刊文献**：标注「DOI 未获取（CNKI 收录）」并给全 作者 + 题名 + 期刊 + 年份。**严禁编造 DOI。** 已确认空气动力学学报、推进技术、力学学报、液压与气动、中国腐蚀与防护学报、中国电力的 DOI 注册在 CNKI 体系，Crossref 与 OpenAlex 均无覆盖。
- arXiv 预印本给 `arXiv:YYMM.NNNNN`，不写 DOI。

### 篇幅与格式

- 每讲正文 2500–4500 中文字；第 6、7 讲可放宽到 5000 字。
- 对比性内容优先用表格（变体对比、库对比、优缺点清单）。
- 不用 emoji。
- 可用站点已支持的 callout（`> [!NOTE]` / `> [!WARNING]`）标注踩坑与前提。

### frontmatter

每讲必填：`pubDatetime`、`title`（格式 `第 N 讲：标题`）、`description`、`course: pinns`、`order: N`、`tags`、`draft`。

标签体系（新增，与既有「随笔」「指南」并列）：`PINNs`、`科学计算`、`燃烧`、`电水动力学`。第 1–5、8 讲用 `PINNs` + `科学计算`；第 6 讲加 `燃烧`；第 7 讲加 `电水动力学`。

---

## 4. 课程页规格

文件：`src/content/courses/pinns.md`

```yaml
---
pubDatetime: <首讲发布日>T09:00:00Z
title: 物理信息神经网络：从数学骨架到燃烧与电水动力学
description: PINNs 的定义、训练病态、变体谱系与能力边界，以及在燃烧与电水动力学两个方向的具体方程与损失设计。
draft: false
---
```

正文写课程简介（讲义列表自动生成，不要手写）：

- **适合谁**：有 PDE 数值方法基础、想了解科学机器学习能否替代/补充传统求解器的研究生与工程师。
- **前置知识**：偏微分方程基础、神经网络反向传播、至少接触过一种 CFD 方法。不要求熟悉 PyTorch。
- **能学到什么**：能自己写出一个具体 PDE 问题的完整 PINNs 损失函数；能判断某个问题该不该用 PINNs；知道各变体分别解决什么病态。
- **课程结构说明**：前 5 讲是方法学主干，第 6、7 讲是两个独立应用方向，第 8 讲是工程实践。第 6、7 讲无先后依赖，可按兴趣跳读。

---

## 5. 分讲规格

文件名一律 `src/content/posts/pinns-*.md`（英文 slug，符合 AGENTS.md 约定）。

---

### 第 1 讲 · 为什么需要 PINNs

**slug**：`pinns-why-and-what.md`

**必须覆盖**

1. PINNs 的形式化定义。给定 PDE 算子 $\mathcal{N}[u;\lambda](x,t)=0$ 于 $\Omega\times[0,T]$，边界算子 $\mathcal{B}[u]=g$，观测数据 $u_{\text{obs}}$；PINNs 取神经网络 $u_\theta(x,t)$ 为试函数，把方程残差转为可微损失，用梯度下降最小化。
2. 与四类方法的定位对比表：传统离散化（FVM/FEM/FDM）、纯数据驱动 surrogate、神经算子（FNO/DeepONet）、PINNs。对比维度：是否需网格、学习对象是「单个解」还是「解算子」、对数据量需求、反问题能力、外推能力、多工况评估成本。
3. 三种使用模式：正问题求解、反问题（未知参数 $\lambda$ 辨识）、数据同化（融合稀疏异构测量）。
4. **关键区分**：PINNs 学的是「一个解」，神经算子学的是「一族解的算子」。这条决定了第 8 讲的选型判据。

**必备公式**：PDE 残差形式、自动微分求 $\partial u_\theta/\partial t$ 与 $\partial^2 u_\theta/\partial x^2$ 的计算图说明。

**文献需求**：Raissi/Perdikaris/Karniadakis 2019 *J. Comput. Phys.* 原始论文（**当前缺失，须补**）；Karniadakis et al. 2021 *Nature Reviews Physics* 综述（**缺失，须补**）；已有 arXiv:2410.13228《From PINNs to PIKANs》可用。

**验收**：读者能复述 PINNs 定义并说明它与神经算子的区别；对比表至少 4 方法 × 5 维度。

---

### 第 2 讲 · PINNs 的数学骨架：损失函数逐项拆解

**slug**：`pinns-mathematical-anatomy.md`

**必须覆盖**

1. 总损失结构 $\mathcal{L}(\theta)=\lambda_r\mathcal{L}_r+\lambda_b\mathcal{L}_b+\lambda_i\mathcal{L}_i+\lambda_d\mathcal{L}_d$，逐项拆解：
   - $\mathcal{L}_r=\frac{1}{N_r}\sum_i\left|\mathcal{N}[u_\theta;\lambda](x_i,t_i)\right|^2$，配点采样策略（均匀 / LHS / 自适应）。
   - $\mathcal{L}_b$、$\mathcal{L}_i$：边界与初始条件项，采样点数远少于残差点时的失衡问题。
   - $\mathcal{L}_d$：观测数据项，噪声水平与权重关系。
2. **自动微分机制**：为什么 $\partial^2 u/\partial x^2$ 可以精确求而不引入截断误差；与有限差分离散的本质差别；计算图膨胀与二阶导的成本。
3. **软约束 vs 硬约束**：硬约束试函数构造 $u_\theta = g(x) + \ell(x)\,\hat{N}(x;\theta)$，其中 $\ell(x)$ 满足齐次边界条件。给出 1D Dirichlet 与 Neumann 的具体 $\ell$ 构造，讨论高维与复杂几何下的困难。
4. **无量纲化**：$x^*=x/L,\ t^*=t/T,\ u^*=u/U$。说明为什么这一步不是可选项——残差各项量级不对齐会导致损失权重失效。给出量级估算示例。
5. 损失权重方案：固定 $\lambda$ / 自适应（为第 3 讲铺垫，此处只提概念）。
6. 优化器两段式惯例：Adam 粗调 → L-BFGS 精调，及其原因。

**必备公式**：完整总损失、硬约束试函数、无量纲化变换、L-BFGS 与 Adam 的适用阶段说明。

**文献需求**：Raissi 2019；硬约束方法（**缺失，须补**）；无量纲化实践（**缺失，须补**）。

**验收**：给定一个新 PDE 问题，读者能独立写出全部损失项并完成无量纲化。这是全课程的核心能力目标。

---

### 第 3 讲 · 训练为什么难：病态诊断与对策

**slug**：`pinns-training-pathologies.md`

**必须覆盖**

1. **多目标梯度冲突**：$\nabla_\theta\mathcal{L}_r$ 与 $\nabla_\theta\mathcal{L}_b$ 量级可差数个数量级，导致边界条件被牺牲。给出诊断方法（分项梯度范数监控）。
2. **NTK 视角**：$\Theta_{ij}=\langle\nabla_\theta u_\theta(x_i),\nabla_\theta u_\theta(x_j)\rangle$；各损失项对应的 NTK 特征值谱失衡 ⇒ 收敛速率差异 ⇒ 某些项欠拟合。对应解法：NTK-based weighting。
3. **Spectral bias**：网络优先学低频分量，高频难拟合。**直接后果：火焰面、激波、薄边界层这类锐利结构是 PINNs 的天然弱项**——此处显式前引第 6 讲。对策：Fourier features / RFF、positional encoding、Tancik 随机傅里叶映射。
4. **刚性源项**：化学动力学时间尺度跨 6–8 个数量级，源项残差主导总损失，其余项被淹没。**前引第 6 讲的核心难点。**
5. **因果性违背与时间推进失败**：全域同时拟合时间依赖问题时，网络可能在早期时间未收敛时就「猜」后期解。对策：causal training / 时间推进式训练、dPINN、课程学习。
6. **采样不足**：残差配点在低残差区聚集 ⇒ 假收敛。对策：RAR、RAR-D、残差自适应重采样、边界加密。
7. 对策汇总表：病态现象 / 诊断指标 / 对策 / 代价 / 适用问题类型。

**文献需求**：本节文献**当前全部缺失**，须重检索。关键目标：Wang/Yu/Perdikaris 的 NTK 与梯度病理论文、McClenny & Braga-Neto 的 self-adaptive weights、Krishnapriyan 的 causal training、Tancik 的 Fourier features、Lu 的 RAR。

**验收**：读者能对一次失败训练给出诊断路径（看分项损失曲线 → 看梯度范数 → 看残差空间分布 → 选对策），而非盲目调超参。

---

### 第 4 讲 · 变体全景：一张分类图谱

**slug**：`pinns-variants-taxonomy.md`

**必须覆盖**——按「解决什么问题」分类，不按时间线罗列：

1. **域分解类**
   - XPINN：子域独立网络 + 界面连续性/残差条件；解决大规模域与并行训练；代价是界面条件引入新超参。
   - cPINN：面向守恒律，界面处通量守恒；适合激波与间断。
   - dPINN：时间方向域分解，逐段推进；解决长时间积分的因果性问题。
2. **弱形式/变分类**
   - Deep Ritz：把 PDE 转为能量泛函极小化；仅适用于有变分结构的问题（椭圆型），不适用于一般演化方程。
   - VPINN：变分形式 + 测试函数；降低对高阶导数的依赖。
   - wPINN：弱解形式，专门处理守恒律与激波（熵解）。
3. **架构替换类**
   - fPINN：分数阶导数。
   - PI-DeepONet / FNO：学习解算子而非单个解，支持多工况快速评估——**与 PINNs 是互补而非替代**。
   - PIKAN：Kolmogorov–Arnold 网络替换 MLP（arXiv:2410.13228 已覆盖）。
4. **不确定性量化类**
   - B-PINN：HMC 或 VI 得后验；ensemble；MC dropout。说明 PINNs 单次训练的解**不是唯一解**，多种子方差必须报告。
5. **多保真度类**：融合低保真模型输出与少量高保真数据。

**必备产物**：一张主对比表 —— 变体 / 针对的病态 / 新增超参 / 额外计算代价 / 典型适用场景 / 不适用场景。

**文献需求**：Jagtap & Karniadakis 的 XPINN、cPINN、dPINN 原始论文；Deep Ritz（E & Yu）；wPINN；**当前全部缺失，须补**。arXiv:2410.13228 可作为骨架性综述。

**验收**：给定一个问题描述（几何规模、是否含间断、是否需多工况、是否需不确定性），读者能选出 1–2 个候选变体并说出理由。

---

### 第 5 讲 · 优点与缺点的诚实清单

**slug**：`pinns-strengths-and-limits.md`

**必须覆盖**

1. **优势**（每条给出成立条件，不写成无条件赞美）
   - 无网格：复杂几何、高维问题、移动边界。
   - 反问题与参数辨识：把未知参数纳入优化变量，这是传统求解器做不到的。
   - 稀疏、异构、多源数据融合：不同传感器、不同分辨率的数据可共用一个损失。
   - 自动微分给出全场导数量（热流、应力、梯度），无需额外后处理。
   - 物理约束的正则化效应：小样本下优于纯数据驱动。
2. **劣势**（每条尽量给量化范围，标注文献出处）
   - **精度上限**：典型相对 $L_2$ 误差在 $10^{-2}\sim10^{-3}$ 量级，而谱方法/高阶 FVM 可达 $10^{-8}$ 以下。凡需要工程精度的场景，PINNs 不合格。
   - **训练成本与扩展性**：每个新工况需重训；成本不随问题规模良性增长。
   - **外推能力差**：解域外、参数域外均不可靠。
   - **超参与采样敏感**：权重、配点数、边界点数、学习率、优化器切换时机——组合爆炸。
   - **可复现性差**：随机种子影响显著，文献中大量结果只报告单次运行的最优值。
   - **对刚性与多尺度天然吃亏**：spectral bias + 刚性源项双重打击（详见第 3 讲）。
   - **无收敛性理论保证**：损失趋零不等于解收敛到真解。
3. **判据：何时不该用 PINNs**
   - 需要工程精度 ⇒ 用传统求解器。
   - 需要多工况快速评估 ⇒ 用神经算子（FNO/DeepONet），不要用 PINNs。
   - 方程已知、有成熟求解器、且不需要反演参数或融合数据 ⇒ PINNs 无增量价值。
   - 刚性化学动力学主导、且时间尺度跨度极大 ⇒ 谨慎，优先考虑算子分裂或专用方法。
4. **判据：何时该用 PINNs**
   - 反问题 / 参数辨识 / 源项反演。
   - 数据同化：有稀疏实验测量，需要重建全场。
   - 几何复杂到网格生成成本高，且精度要求不高。
   - 机理发现：从数据反推未知项。

**必备产物**：一张「场景 → 推荐方法」决策表。

**文献需求**：arXiv:2410.13228、Karniadakis 2021 NRP（**缺失，须补**）；B 路燃烧文献中的精度报告可作量化依据（已有）。

**验收**：这一讲要能挡住「PINNs 万能」的过度宣传。读者读完应能说出具体的**不适用**场景，而不只是优点。

---

### 第 6 讲 · 燃烧中的 PINNs

**slug**：`pinns-combustion.md`

**材料状态：最充足。** 现有 25 条 PINNs × 燃烧文献，其中 12 条有真 DOI，2 篇综述可直接作骨架。

**必须覆盖**

1. **反应流控制方程组**（完整写出，逐符号定义）
   - 连续性、动量（含黏性应力）、能量（含热传导、辐射项取舍、Dufour/Soret 取舍说明）。
   - 组分输运：$\partial(\rho Y_k)/\partial t+\nabla\cdot(\rho Y_k\mathbf{u})=-\nabla\cdot\mathbf{J}_k+\dot{\omega}_k$，扩散通量 $\mathbf{J}_k$ 的多组分形式与简化（Fick）形式差别。
   - 状态方程与 $\sum_k Y_k=1$ 约束（**这是 PINNs 实现上的一个坑：约束不自动满足，需作为额外损失项或硬约束处理**）。
2. **化学源项与刚性**
   - Arrhenius 形式 $\dot{\omega}_k=M_k\sum_r(\nu''_{kr}-\nu'_{kr})\left[k_{f,r}\prod_j C_j^{\nu'_{jr}}-k_{b,r}\prod_j C_j^{\nu''_{jr}}\right]$。
   - 刚性来源：活化能温度敏感性 + 自由基时间尺度极短。给出量级估计，说明为什么 $\mathcal{L}_r$ 会被源项主导。
   - 对策：源项单独归一化、算子分裂、对源项用不同权重、隐式处理。
3. **火焰面与特征尺度**
   - 层流火焰速度 $S_L$、火焰厚度 $\delta_L\sim\alpha/S_L$、Damköhler 数、Karlovitz 数。
   - **关键难点**：火焰面是薄层，$L/\delta_L$ 可达 $10^2\sim10^3$ ⇒ spectral bias 直接命中（回指第 3 讲）。这是燃烧 PINNs 的核心矛盾，必须讲透。
4. **应用地图**（基于已有文献梳理，每条给出处）
   - PINN 与 flamelet/progress-variable 模型耦合
   - CRK-PINN（再生核）求解燃烧问题
   - PINN 加速化学动力学计算
   - DeepONet 加速燃烧化学（算子学习路线，对照第 4 讲）
   - 从稀疏实验测量高分辨重建湍流火焰
   - 旋转爆震燃烧室（RDE）流场重建
   - 碳烟温度与体积分数场预测
   - 热声相互作用学习
   - 预混火焰放热率标记的数据驱动发现
   - PINN 辅助实验测量设计
   - 参数化多维预混火焰代理模型
   - 湍流燃烧 PINNs
   - 骨架综述：arXiv:2509.03347《Physics-informed machine learning for combustion: A review》、arXiv:2604.25617《AI-Powered Surrogate Modelling for Multiscale Combustion》
5. **完整推导案例（本讲重点，约占 1/3 篇幅）**
   - 选定问题：**1D 稳态预混层流火焰**（反应–扩散–对流），理由：刚性源项 + 薄火焰面两个核心难点都命中，且方程可写全、无量纲化可做干净。
   - 交付内容：完整方程组 → 无量纲化 → 硬约束或软约束边界处理 → 损失函数全部项显式写出 → 源项归一化方案 → 配点采样策略（火焰面区域加密）→ 预期失败模式与诊断。
   - 次选（若篇幅允许，作为对照）：RDE 流场重建，展示「数据同化型」PINNs 的损失设计差异。

**文献需求**：现有 25 条中，[12] arXiv:2509.03347、[27] arXiv:2604.25617 为综述骨架；[6][7][10][11][17][18][20][21][22][23][24][25][35][36][38] 有真 DOI 可直接引用。需补：层流火焰与刚性化学的经典教材级出处（Peters / Law / Poinsot & Veynante）。

**验收**：本讲的完整推导案例必须自洽——所有符号有定义、无量纲化前后方程等价、损失项与方程一一对应。读者应能照此为其他燃烧问题改写。

---

### 第 7 讲 · 电水动力学中的 PINNs

**slug**：`pinns-ehd.md`

**材料状态：空白，需重检索。** 详见 §7。

**必须覆盖**

1. **术语消歧（开篇即做）**：EHD = electrohydrodynamics。与 elastohydrodynamic（弹流润滑）、electro-hydraulic（电液传动）无关。说明为什么这个缩写在检索中大量误命中。
2. **EHD 控制方程组**（完整写出，逐符号定义）
   - 电势 Poisson：$\nabla\cdot(\varepsilon\nabla\varphi)=-\rho_c$（椭圆型）。
   - 电荷守恒：$\partial\rho_c/\partial t+\nabla\cdot\mathbf{J}=S$，电流密度 $\mathbf{J}=\rho_c\mathbf{u}+b\rho_c\mathbf{E}-D\nabla\rho_c$（对流 + 迁移 + 扩散，双曲–抛物混合型）。
   - 动量：$\rho\left(\partial\mathbf{u}/\partial t+\mathbf{u}\cdot\nabla\mathbf{u}\right)=-\nabla p+\mu\nabla^2\mathbf{u}+\rho_c\mathbf{E}+\mathbf{f}_{\text{diel}}$（抛物型），其中介电体力项 $\mathbf{f}_{\text{diel}}$ 的两种常见形式（$\nabla\varepsilon$ 项与电致伸缩项）及取舍。
   - $\mathbf{E}=-\nabla\varphi$ 的耦合关系。
3. **无量纲数**：电雷诺数、电对流数、Coulomb 数、电 Rayleigh 数、迁移率与扩散的相对重要性。给出各自物理意义与典型量级。
4. **PINNs 实现的核心难点（本讲重点）**
   - **三场量级差异巨大**：电场 $\sim\text{kV/cm}$、电荷密度 $\sim\text{C/m}^3$、流速 $\sim\text{m/s}$、压力 $\sim\text{Pa}$。若不分别归一化，损失函数会被电场项完全主导。这是 EHD-PINNs 与一般多物理场 PINNs 最大的区别，必须给出具体归一化方案与量级估算表。
   - **方程类型混合**：Poisson 椭圆、电荷守恒双曲–抛物、NS 抛物。三者收敛速率不同 ⇒ 训练竞争（回指第 3 讲多目标梯度冲突）。
   - **强耦合**：$\rho_c$ 同时出现在 Poisson 右端与动量源项，$\mathbf{u}$ 同时出现在电荷对流与动量方程。耦合迭代 vs 联合求解的取舍。
   - 界面与边界条件：电极边界（Dirichlet 电势 vs 电荷注入边界）、绝缘壁、无穷远截断。电荷注入边界条件是非线性的（Fowler–Nordheim / 空间电荷限制发射），需专门讨论。
5. **应用面**（按 `docs/paper/track-C.md` 实测可得性排序，2026-09-04 修正）
   - 电喷雾 / EHD 打印 / 原子化（9 条，最充足；但全为数据驱动过程建模，无 PDE 求解）
   - EHD 泵 / 单极圆管流基准（6 条，含 ANN 回归与分数阶配点网络）
   - 电荷输运 / Poisson–Nernst–Planck / 电动（5 条，**唯一能直接支撑损失函数设计的一支**）
   - EHD 对流与热管理（2 条）
   - 离子风 / 电晕（2 条；arXiv 侧 `ionic wind` / `ion wind` 命中为 0，比原预期薄）
   - 电流体不稳定性（leaky dielectric）：仅 1 条间接命中
   - **介电泳：0 条 ML/PINNs 命中，降级处理**——控制方程可写出（$\mathbf{f}_{\text{diel}}$ 项），但引用非 ML 的标度律文献作依据并显式声明无 ML 文献支撑
6. **完整推导案例（本讲重点，约占 1/3 篇幅）**
   - 选定问题：**稳态单极 EHD 流**，以「圆管离子拖曳流」经典基准为对照谱系（ZAMM 1999 解析 → ISRN 2012 → J. Electrostatics 2014 → 神经进化 → PINN vs FEM 2026）。理由：方程可写全、有解析解可对拍、三场量级差异与强耦合难点齐全，且有 PINN-vs-FEM 对照结论可作预期结果参照。原选「自由场离子风」构型**无直接 PINN 文献**，弃用。
   - 交付内容：完整方程组（Poisson + 电荷守恒 + NS，含 $\mathbf{J}$ 三项）→ 由尺度推导无量纲数（不直接断言规范名）→ 量级估算表 → 损失函数全部项 → 权重方案（引刚性 PNP 基准与多物理场 NTK 理论论证自适应/预条件的必要性）→ 电极与电荷注入边界处理 → 预期失败模式。
7. **诚实声明**：若重检索后 PINNs × EHD 直接文献仍不足，本节须明确标注哪些内容是「基于 EHD 数值模拟文献 + PINNs 通用方法论的合理外推」，哪些有直接文献支撑。**不得把外推伪装成综述结论。**

**文献需求**：**已交付**（`docs/paper/track-C.md`，2026-09-04）。第一层 9 条 + 第二层 25 条 = 34 条有效命中（33 条已验证），不触发降级条件。参考文献优先保留（track-C §6.3）：Computers & Fluids 2024 NPN 框架（10.1016/j.compfluid.2024.106421）、刚性 PNP 基准（arXiv:2606.04125）、DeepM&Mnet（10.1016/j.jcp.2021.110296，**须标注为算子学习而非残差 PINN**）、LSTM-PINN 稳态 EHD（arXiv:2512.21614）、EHD 激波型基准套件（arXiv:2603.21227）、电荷边界层 RA-PINN（arXiv:2604.20881）、PINN vs FEM（arXiv:2510.14310）、多物理场耦合 NTK 理论（arXiv:2605.23391）、EPINN 动态 PNP（arXiv:2402.01768）、EHD 微系统综述（10.1007/s11831-024-10147-x）、Melcher–Taylor 1969（10.1146/annurev.fl.01.010169.000551）、Castellanos 标度律（10.1088/0022-3727/36/20/023）。**S18（Sabir 2018）DOI 待核验，不得写入参考文献。** 第一层 9 条中 4 条出自同一团队（Ze Tao / Fujun Liu）的近期预印本，引用时须说明集中度，不得写成学界共识。

**验收**：归一化方案与量级估算表必须给出具体数字（哪怕是数量级估计），不能停留在「应当归一化」的空话。完整推导案例的三场损失项必须与三个方程一一对应。

---

### 第 8 讲 · 工程实践与选型指南

**slug**：`pinns-engineering-practice.md`

**必须覆盖**

1. **库对比表**：DeepXDE、NVIDIA PhysicsNeMo（曾名 Modulus / SimNet）、NeuroDiffEq、IDRLnet、SciANN、PINNacle（基准套件）。对比维度：后端、API 抽象层次、是否支持域分解/变体、是否支持批训练与多 GPU、文档与社区活跃度、许可证、适合的问题规模。
2. **采样策略**：均匀 / LHS / 边界加密 / RAR / RAR-D / 残差自适应。给出各自适用场景与配点数量级建议。
3. **优化实践**：Adam → L-BFGS 两段式、学习率调度（cosine / exponential decay / ReduceLROnPlateau）、批大小与全批的取舍、迭代数量级。
4. **验证与误差度量**：相对 $L_2$ 误差、$L_\infty$、残差场的空间分布可视化（**残差均匀小才算收敛，局部尖峰说明欠拟合**）、与解析解或高保真 CFD 的逐点对比、跨随机种子的均值与方差（必须报告，单次运行结果无意义）。
5. **复现清单**：随机种子、配点坐标（存文件而非重新生成）、全部权重超参、迭代数与早停判据、硬件与训练时长、库版本。
6. **常见踩坑**（每条给症状 + 根因 + 处理）
   - 漏做无量纲化 → 损失某项恒为主导
   - 边界配点太少 → 边界条件不满足但残差很小
   - 残差配点集中在低残差区 → 假收敛
   - 早停指标选错（看总损失而非分项）
   - 报告单次运行最优结果 → 不可复现
   - 用 PINNs 做多工况评估 → 应该用神经算子
   - 训练集与测试集配点同源 → 误差被低估

**文献需求**：各库的原始论文/文档；PINNacle 基准论文（**须补**）。

**验收**：读者拿到一个新问题，能按本节完成「选库 → 定采样 → 定优化流程 → 定验证指标 → 写复现清单」的全流程。

---

## 6. 里程碑与发布顺序

| 批次 | 内容 | 前置 | 状态 |
|---|---|---|---|
| **0** | 技术前置：KaTeX 数学渲染（§2） | 无 | **已完成（2026-09-04）**，实测记录见 §2 |
| **1** | 课程页 + 第 6 讲（燃烧） | 批次 0 | **已完成**：`courses/pinns.md` + `posts/pinns-combustion.md`，18 条引用全部来自已审计 JSON 的真 DOI/arXiv |
| **2** | 第 1–5 讲（方法学主干） | 批次 0 | **已完成**：5 讲全部写出；引用经 arXiv API / Crossref 逐条核验；XPINN 原始论文 DOI 已由 A 路重检索补得并回查（`10.4208/cicp.oa-2020-0164`），**待核验项清零** |
| **3** | 第 7 讲（EHD） | 批次 0 + C 路检索 | **已完成**：按 track-C 实测（34 条有效命中，不降级）写成综述+推导混合式；应用面按可得性重排、介电泳降级为非 ML 标度律引证、推导案例改为稳态单极 EHD 流、DeepM&Mnet 标注为算子学习、单团队集中度已声明 |
| **4** | 第 8 讲（工程实践） | 批次 0 | **已完成**：6 条库/基准引用经 arXiv API 核验；NVIDIA 框架按现名 PhysicsNeMo 列出，并以该研究线早期 SimNet 论文（arXiv:2012.07938）为方法源头出处、注明 SimNet → Modulus → PhysicsNeMo 谱系 |

**为什么先发第 6 讲**：材料现成（25 条文献、2 篇综述、12 条真 DOI），可以最快跑通「数学渲染 → 写作规范 → 引用格式 → build 验证」的完整链路，暴露问题后再批量写方法学五讲。教学顺序仍是 1→8，`order` 字段按教学顺序固定，发布顺序由 `pubDatetime` 控制。

每批次交付后运行：`npm run format` → `npm run lint` → `npm run build`，并在 dev server 浏览器中实测公式渲染。

---

## 7. 文献现状与重检索计划

来源：`docs/paper/papers_1788510570245.json`（49 条，已审计）。

### 现状

| 类别 | 条数 | 状态 |
|---|---|---|
| 有出版商/学会真 DOI | 30 | 可直接引用 |
| arXiv 预印本 | 8 | 编号已全部经 arXiv API 核验通过（标题与日期对应） |
| 两者皆无（中文期刊） | 11 | Crossref 仅补到 1 条（`10.3788/cjl241440`，《中国激光》）；其余 10 条 Crossref 只返回同词根误匹配，OpenAlex 零命中。**原因：这些刊的 DOI 注册在 CNKI 体系，未进 Crossref/OpenAlex。本课程按 §3 引用规范标注「DOI 未获取」，不再追补。** |

### 该文件不可直接使用的三个原因

1. **`score` 是检索相似度分，不是相关性分，且与文件自带的 `reason` 结论完全反向。** 得分最高的三条（烧蚀材料 79.9 / 电液执行器 79.8 / 生物质气化 79.5），其 `reason` 自己写的是「三个约束均未满足」「完全不符」「整体不相关」。**不得用 score 排序。**
2. **原查询用了四重合取**：C1(PINN变体) ∧ C2(燃烧) ∧ C3(EHD) ∧ C4(燃烧-EHD耦合)。要求单篇论文同时满足四条，该交集在文献中近乎为空 ⇒ **31/49 条被自身评估判为不相关**，大量可用文献被误杀。而本课程按 §1 已明确**不做 C4 耦合章节**，该查询比实际需求窄了一个量级。
3. **术语误匹配**：「电液执行器」= electro-hydraulic（液压）、「Elasto-Hydrodynamic」= 弹流润滑、静电感应粉尘监测、LBM/Darcy–Forchheimer 均被 EHD 误命中。重检索时必须做 EHD 消歧（见 §3、第 7 讲）。

### 分路覆盖情况

| 路线 | 支撑讲次 | 现有命中 | 判断 |
|---|---|---|---|
| **A 路** 方法学与变体 | 第 1–5、8 讲 | 有效仅 2 条：arXiv:2410.13228《From PINNs to PIKANs》、B-PINN | **严重缺料。** 缺 Raissi 2019 原始论文、Karniadakis 2021 NRP、NTK/梯度病理、XPINN、cPINN、dPINN、Fourier features、Deep Ritz、VPINN、wPINN、PI-DeepONet/FNO、硬约束试函数、self-adaptive weights、causal training、RAR |
| **B 路** PINNs × 燃烧 | 第 6 讲 | 25 条，12 条有真 DOI，含 2 篇综述 | **充足。** 以此为种子做引文扩展即可 |
| **C 路** PINNs × EHD | 第 7 讲 | **0 条** | **空白。** 必须重检索 |

### 重检索计划（三路独立查询，取消 C4 耦合约束）

**A 路**（支撑第 1–5、8 讲，优先级最高）
- 检索词组：`physics-informed neural networks` + {`variants`, `extended`, `domain decomposition`, `conservative`}; `neural tangent kernel PINN gradient pathology`; `spectral bias Fourier features PDE`; `self-adaptive weights PINN`; `causal training PINN time-dependent`; `residual-based adaptive sampling`; `hard boundary constraint PINN`; `physics-informed Kolmogorov-Arnold`
- 必须命中的奠基文献（作为硬性验收项）：Raissi, Perdikaris & Karniadakis 2019 *JCP*；Karniadakis et al. 2021 *Nature Reviews Physics*；Jagtap & Karniadakis XPINN；E & Yu Deep Ritz；Wang, Yu & Perdikaris NTK 视角；Tancik et al. Fourier features；McClenny & Braga-Neto self-adaptive；Krishnapriyan et al. causal training。

**B 路**（支撑第 6 讲）
- 以现有 25 条为种子做引文扩展（向前/向后引文），重点补：层流火焰速度 PINN、刚性化学源项处理、湍流燃烧闭合、实验数据同化。
- 补经典教材级出处：Peters《Turbulent Combustion》、Law《Combustion Physics》、Poinsot & Veynante。

**C 路**（支撑第 7 讲）
- **必须做 EHD 消歧**：检索词固定为 `electrohydrodynamic` / `electrohydrodynamics`，并显式排除 `elastohydrodynamic`、`electro-hydraulic`。
- 第一层（直接命中）：`electrohydrodynamic` + {`physics-informed`, `neural network`, `machine learning`, `deep learning`}
- 第二层（按子领域）：`electrospray machine learning`、`ionic wind neural network`、`Taylor cone simulation`、`charge transport Poisson coupling`、`dielectrophoresis surrogate`、`electrokinetic flow neural network`、`leaky dielectric`
- 第三层（放宽口径，**须在正文标注为外推**）：EHD 的数据驱动 / 代理模型 / 降阶方法（不限 PINNs），以及 PINNs 求解「椭圆 + 双曲 + 抛物」混合型多物理场耦合的一般性工作。
- 若三层合计有效命中 < 8 条，则第 7 讲调整为「EHD 的控制方程与数值难点 + PINNs 方法论迁移分析」，明确定位为**方法论迁移推演**而非文献综述，并在开篇声明。

---

## 8. 验收标准（全课程）

- [x] 批次 0 完成：KaTeX 渲染按 §2 验收清单全部通过，含浅色/深色两套主题、`/fangfangfang/` 子路径字体无 404、上游 #412（列表外独立公式配色）与 #509（`\neq` / `\not` 字形）两项已知 bug 已验证不复现、callout 内公式与目录内公式正常。实测数据见 §2「批次 0 执行记录」。
- [x] Pagefind 不索引公式：已确认污染存在并用 `ignoreKatexInSearch` 修复，搜 LaTeX 源码词无命中、正文词命中且摘要无公式残留。
- [x] 课程页 + 8 讲全部创建，frontmatter 字段完整，`course: pinns` 与 `order: 1..8` 正确，课程页能列出全部 8 讲并按讲次排序（构建产物 `dist/courses/pinns/index.html` 实测 1–8 顺序正确）。
- [x] 每讲所有符号有定义，无量纲化前后方程等价，损失项与方程一一对应。（经两轴自动评审复核；第 6、7 讲损失项与方程逐项对应，第 2 讲书写示范与第 8 讲复现示例提供可执行核对路径）
- [x] **自动评审闭环**：code-review 两轴评审（Standards / Spec）已执行。Standards 轴 0 硬违规；Spec 轴发现项（公式编号未执行、篇幅不足、引用缺作者/未按序、第 3 讲表缺两列、第 8 讲表缺维度与许可证、dPINN 交叉引用断裂、复现清单编辑残留、pubDatetime 倒置）已全部修复；公式编号 (N.M) 经浏览器实测渲染（第 2 讲 (2.1)–(2.5)），8 讲篇幅全部 ≥2500 中文字。
- [x] 每讲关键论断带 `[n]` 引用，文末参考文献格式统一（8 讲均含「参考文献」节，格式为「作者. 题名. 期刊/会议, 年份. DOI 或 arXiv.」）。
- [x] **无编造 DOI**。全部 DOI/arXiv 经 Crossref `/works/<DOI>` 或 arXiv `id_list` 回查；缺 DOI 的中文文献（第 7 讲 [3] 电液执行器）标注「DOI 未获取（CNKI 收录）」；track-C 的 S18 待核验条目未写入任何讲义。
- [x] 第 7 讲的外推内容明确标注，未伪装为综述结论（「诚实声明」节：DeepM&Mnet 为算子学习、单团队集中度、介电泳与离子风文献缺口）。
- [x] A 路 8 条奠基文献全部命中并有出处（track-A 8/8，且本仓库另行独立回查确认）。
- [x] `npm run format`、`npm run lint`、`npm run build` 全部通过（28 页、0 error）。
- [x] dev server 浏览器实测：第 6、7 讲公式渲染（120/106 个 `.katex`、0 个 `.katex-error`）、表格内公式（27/36 处）、目录、课程页讲次列表、浅色/深色配色均正常；Pagefind 不索引公式（§2 记录）。

---

## 9. 已确认的决定

以下三项在 spec 评审中确认，实施时不再重新讨论；如需推翻，先改本节再改正文。

1. **第 6、7 讲采用混合式写法**：先综述应用地图，再给一个代表性问题的完整推导（第 6 讲选 1D 稳态预混层流火焰，第 7 讲选稳态单极离子风）。两者都是「核心难点全部命中且方程能写全」的问题，选它们的理由见 §5 对应小节。
2. **保留 8 讲，不压缩。** 曾评估过 5 讲方案（第 3+4 讲合成「变体与训练技巧」、第 6+7 讲合成「燃烧与 EHD 应用」），否决理由：每讲篇幅会突破 4500 字上限；更关键的是第 6、7 讲合并后无法各自展开完整推导，而完整推导是本课程区别于普通综述的核心价值。发布节奏问题已由 §6 的批次划分解决——允许先发第 6 讲，也允许只发布到第 5 讲。
3. **不做「燃烧 + EHD 耦合」专题**（见 §1 非目标）。依据：现有 49 条检索结果中 C4 耦合方向命中为 0，该交集在文献中近乎为空；强行成章只能靠推演，与本课程「带可核验出处」的要求冲突。

## 10. 待拍板

**是否立即执行 §7 的三路重检索？**

- A 路（方法学，支撑第 1–5、8 讲）与 C 路（EHD，支撑第 7 讲）缺料是硬阻塞，不补则这六讲写不出带出处的内容。
- B 路（燃烧，支撑第 6 讲）材料已充足，可直接开工。
- 建议顺序：**批次 0（KaTeX 前置）→ B 路首发第 6 讲跑通全链路 → A/C 路重检索 → 第 1–5 讲 → 第 7、8 讲。**
  先发第 6 讲的理由见 §6：材料现成，能最快暴露数学渲染、写作规范、引用格式、build 验证四类问题。
