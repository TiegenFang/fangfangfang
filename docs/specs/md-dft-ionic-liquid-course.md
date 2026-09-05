# Spec：MD/DFT 课程「分子动力学与第一性原理 —— 离子液体工质的电喷雾与绿色推进」

状态：已确认 → 待实施
课程 slug：`md-dft-ionic-liquid`
承载位置：`src/content/courses/md-dft-ionic-liquid.md` + `src/content/posts/md-dft-il-*.md`（8 讲）
定位：深度综述 + 数学推导，面向研究生及以上读者，术语可用英文原词
姊妹课程：`pinns`（`docs/specs/pinns-course.md`），两门课双向交叉引用

---

## 1. 目标与非目标

### 目标

- 让读者建立 MD/DFT 应用于**离子液体工质**的完整方法论认知：**多尺度定位 → DFT 骨架 → MD 骨架 → 力场谱系 → 机器学习势函数 → 两个应用方向**。
- 两个应用方向各自成讲：
  - **电喷雾微推进**（2 讲）：锥射流的分子图像、带电纳米液滴场蒸发与离子发射、发射器表面、AIMD 碎裂、MD–Poisson 与 EHD–PIC 尺度耦合。
  - **绿色单组元推进剂的催化分解**（1 讲）：HAN 与 ADN 基推进剂的 DFT 表面分解、ReaxFF 反应性 MD、hypergolic 离子液体的量子分子动力学，并以**双模式/多模式微推进**缝合两个应用分支。
- 「微观量 → 宏观可测量」的桥接内容**折进三个应用讲**（第 6、7、8 讲），不单独成讲。
- 每条关键论断带**可核验出处**（DOI 或 arXiv 编号），文末附参考文献。

### 非目标

- **不提供完整可运行输入文件**（用户已明确不选「软件栈与实操工作流」）。最多给不超过 15 行的关键参数片段或伪代码，不追求可执行。
- **不单独设工程实操/选型讲**。软件栈、收敛判据、踩坑清单分散进各方法讲的相关小节。
- 不做纯科普。公式不回避，直觉解释服务于公式而非替代公式。
- 不追求文献穷尽。每讲参考文献控制在 8–20 条，优先奠基文献与代表性应用。
- 不做经典「催化燃烧」（IL 作催化剂/载体）方向——用户已明确选 IL 作**燃料/推进剂本身**。

---

## 2. 技术前置（批次 0，必须先做）

KaTeX 数学渲染已由 PINNs 课程批次 0 交付并全量验证通过（见 `pinns-course.md` §2），**本课无需重复该工作**。但新增一个硬阻塞：

### mhchem 化学方程式宏未加载

第 8 讲通篇是分解反应方程式，第 6、7 讲也要写离子液体化学式。KaTeX 的 `\ce{}` 属 mhchem 扩展，**默认不注册**。

**实测记录（2026-09-05）**

| 检查项 | 结果 |
|---|---|
| katex 版本与副本数 | `katex@0.16.47`，单份 deduped（`npm ls katex` 确认 rehype-katex 与 remark-math 均指向同一份） |
| mhchem 文件是否存在 | `node_modules/katex/dist/contrib/` 下有 `mhchem.js` / `mhchem.min.js` / `mhchem.mjs` |
| **不加载 mhchem 时** | `\ce{NH4NO3 -> N2O + 2H2O}` → `KaTeX parse error: Undefined control sequence: \ce at position 1`；`\ce{[emim][BF4]}` 同样失败 |
| **加载后** | `await import("katex/dist/contrib/mhchem.mjs")` → 该反应式渲染 OK（输出 7391 字节，0 个 `katex-error`）；`\ce{[emim][BF4]}` 渲染 OK（2106 字节） |
| 物理公式回归 | `\nabla\cdot(\varepsilon\nabla\varphi)=-\rho_c` 加载前后均 OK，输出字节数一致（1835），未被改坏 |
| **实例一致性** | 重新 `import("katex")` 得到的 default 与首次导入**是同一对象**（`===` 为 `true`）⇒ 注册一次即对 rehype-katex 实际调用的实例生效 |
| 浏览器端是否需要 | **不需要。** 站点是 SSG，公式在构建期渲染成静态 HTML，浏览器只加载 `katex.min.css` 取字形。因此**不用改 `Layout.astro`** |

### 任务

在 `astro.config.ts` 顶部加副作用导入，须在 markdown 管线定义之前生效：

```ts
import rehypeKatex from "rehype-katex";
// KaTeX 的 \ce 宏属 mhchem 扩展，默认不注册；构建期注册一次即可（SSG，浏览器端无需加载）
import "katex/dist/contrib/mhchem.mjs";
```

> [!WARNING]
> 不要用 `mhchem.min.js`（CJS 入口）。`astro.config.ts` 是 ESM（`package.json` 中 `type: "module"`），混用 CJS 入口可能拿到**另一份** katex 实例，导致宏注册到错误的实例上而 `\ce` 仍报 undefined。必须用 `.mjs`。

### 验收（批次 0）

建一篇临时草稿（`src/content/posts/mhchem-smoke-test.md`，`draft: true`），在浏览器中**浅色与深色两套主题下逐一**实测：

- 简单分解：`$\ce{NH4NO3 -> N2O + 2H2O}$`
- 可逆反应：`$\ce{A <=> B}$`
- 离子电荷：`$\ce{NH4+}$`、`$\ce{NO3-}$`、`$\ce{NH3OH+}$`
- IL 方括号式：`$\ce{[emim][BF4]}$`、`$\ce{[emim][TFSI]}$`、`$\ce{[C2mim][DCA]}$`
- 相态标记：`$\ce{H2O(l)}$`、`$\ce{N2O(g)}$`
- 反应条件与催化剂：`$\ce{->[\Delta]}$`、`$\ce{->[Ir/Al2O3]}$`
- 点合物：`$\ce{CuSO4 . 5H2O}$`
- **独立公式（列表外）** —— 重点复查 PINNs 已修的上游 #412 配色是否同样覆盖 mhchem 输出
- 独立公式（列表内）—— 对照
- **化学式与物理公式混排**的 `aligned` 环境
- callout 块（`> [!NOTE]`）内的化学式
- 目录（`remarkToc`）中含化学式的标题
- 表格单元格内的化学式

另需确认：

- mhchem 输出仍在 `.katex` 容器内 ⇒ `astro.config.ts` 的 `ignoreKatexInSearch` 依然生效，Pagefind **不**索引化学式 LaTeX 源码（搜 `ce` / `NH4NO3` 应为 `No results`）。
- Network 面板确认 `/fangfangfang/` 子路径下无新增 404（mhchem 复用既有 KaTeX 字体，理论上不应新增请求）。
- `npm run format` → `npm run lint` → `npm run build` 全通过（含 `astro check` 与 Pagefind 索引）。
- 验收后删除测试草稿，不要发布。

> [!WARNING]
> 不要在未通过本节验收前写第 8 讲。该讲化学方程式密度最高，若 `\ce` 不可用会整讲返工。

### 批次 0 执行记录（2026-09-05，已完成）

前置条件已满足，第 1–8 讲可以开始写。实测结论如下：

| 检查项 | 结果 |
|---|---|
| 配置改动 | `astro.config.ts` 在 `rehypeKatex` 导入后加 `import "katex/dist/contrib/mhchem.mjs";`（ESM 入口，非 CJS） |
| `npm run format` / `lint` | 通过 |
| `npm run build` | 通过，30 页、`astro check` 0 error、Pagefind 索引 14 页 3274 词 |
| 渲染节点数（测试文） | 47 个 `.katex`、10 个 `.katex-display`、**0 个 `.katex-error`**、48 处 `data-pagefind-ignore` |
| 化学式覆盖情形 | 行内分解、可逆 `\ce{<=>}`、离子电荷 `\ce{NH4+}`/`\ce{NO3-}`/`\ce{NH3OH+}`、IL 方括号式 `\ce{[emim][BF4]}`/`\ce{[emim][TFSI]}`/`\ce{[C2mim][DCA]}`、相态 `\ce{(l)}`/`\ce{(g)}`/`\ce{(s)}`、条件 `\ce{->[\Delta]}`、催化剂 `\ce{->[Ir/Al2O3]}`、点合物 `\ce{CuSO4 . 5H2O}` —— 全部正常 |
| 反应箭头 | 8 个 `→`、2 个可逆箭头（⇌/⇄）实际渲染出字形 |
| **化学式与物理公式混排** | `aligned` 环境内同时放 Poisson 方程与 `\ce{[emim][BF4] -> [emim]+ + BF4-}`，渲染成功。**注意 `&` 不能写在 `\ce{}` 内部，也不能嵌套 `\ce`**——对齐符只能出现在 `aligned` 层 |
| 各公式上下文 | 行内、列表外独立、列表内独立、表格（5 处）、callout（4 处）、目录（2 处）、含化学式的标题 —— 全部正常 |
| **浅色主题配色** | 独立公式 `rgb(40,39,40)` 对背景 `rgb(253,253,253)`，对比度 **14.63:1**；**非** #412 的 `rgb(55,65,81)` |
| **深色主题配色** | 独立公式 `rgb(234,237,243)` 对背景 `rgb(33,39,55)`，对比度 **12.7:1**（WCAG AAA 要求 7:1）；未卡在浅色值 |
| 与正文色一致性 | 深色下段落正文色同为 `rgb(234,237,243)`，与独立公式**逐位相同** ⇒ mhchem 输出被现有 #412 修复完整覆盖 |
| 物理公式回归 | KS 方程、Green–Kubo 电导率、矩阵环境、`\neq`/`\notin`/`\not\parallel` 字形全部正常，未被 mhchem 改坏 |
| 字体 base 前缀 | 12 个 KaTeX 字体请求**全部** HTTP 200，**全部**带 `/fangfangfang/` 前缀，0 个失败资源 |
| 控制台 | 无 error、无 warning |
| **Pagefind 污染** | **不污染。** 对照测试：塞满 31 处 `\ce{}` LaTeX 源码的测试页可被正文词命中（`验收草稿`/`碎裂通道`/`质子转移主导`/`点合物` 各 1 条且均指向该页），但**不被任何化学式或 LaTeX 词命中**（`NH4NO3`/`NH3OH`/`CuSO4`/`BF4`/`emim`/`nabla`/`varepsilon` 全部落空）。`ignoreKatexInSearch` 对 mhchem 输出同样生效 |

> [!NOTE]
> **一个容易误判的现象**：直接搜 `NH4NO3`、`emim`、`nabla` 会返回 1–8 条命中，看似污染。逐条取 `url` 与 `excerpt` 核验后确认，这些命中全部来自 **PINNs 各讲参考文献里的作者名与标题子串**（如 `NH4NO3` 命中 `pinns-combustion` 的 "NH3/H2/air flames"，`emim` 命中 "George Em Karniadakis"），`excerpt` 中 `class="katex"` 出现次数为 0，无 LaTeX 残留。**判断污染不能只看命中数，必须看命中页 URL 与摘要内容**，并且要用「同页正文词能命中、同页公式词不能命中」的对照法。

测试草稿（`src/content/posts/mhchem-smoke-test.md`）已删除。

---

## 3. 写作规范

### 沿用 PINNs 课程的全部条款

`pinns-course.md` §3 的术语、公式编号 `(讲次.序号)`、引用 `[n]` 顺序编号、缺 DOI 标注、arXiv 编号格式、不用 emoji、callout 用法**全部沿用**，不在此重复。

### 篇幅与格式

- **正文中文字数通用区间 2500–4500**。数字按中文字符计，公式、代码与英文题名不计入。
- **例外一：第 2、3 讲放宽到 5000。** 这两讲是方法主干中信息密度最高的两讲，spec 自身给它们的「必须覆盖」分别列了 6 项和 5 项，且各自都要写全一整组方程（KS 方程组 / Ewald 求和与两套输运量关系）。按 4500 硬切会切掉覆盖点而不是切掉水分。
- **例外二：第 8 讲放宽到 5500**，理由与参考文献放宽见 §9 第 13 条。
- **例外三：第 6、7、8 讲（应用块）统一放宽到 6000。** 这是修正本 spec 自身的一处不一致，而非放宽标准：§9 第 7 条决定把电喷雾拆成两讲，于是第 7 讲独立承担了「三条 MD–Poisson 界面条件写全 + 电荷注入边界与 Fowler–Nordheim + $\pm0.8e$ 强场失效 + 比冲账闭合」四项硬要求，而单讲字数预算仍按**未拆分**的版本标定。拆讲增加了每讲的覆盖点数量，却没有同步增加预算。
- **放宽不等于允许注水。** 超出上限时优先删与正文重复的判断句、重复的过渡语、以及小结里照抄表格的条目；**不得删「必须覆盖」里的任何一项**。第 2 讲实施时即按此原则压缩了小结的三处重复表述；第 7 讲经检查后确认超长来自覆盖点而非水分（其小结 7 条逐条带数值结论，无可删项），故走上条修正路径。
- **八讲实测分布（2026-09-05，正文含参考文献的中文字数）**：第 1 讲 3342、第 2 讲 4535、第 3 讲 4445、第 4 讲 4467、第 5 讲 3942、第 6 讲 4164、第 7 讲 5746、第 8 讲 4443。可见上限是天花板不是目标——除第 7 讲外无一逼近各自上限。
- 对比性内容优先用表格。不用 emoji。callout 只用于踩坑与前提，不用于强调。

### 化学式（本课新增）

- 一律用 `\ce{}`，**不用**手写 `\mathrm{}` + `_{}` 下标拼化学式。
- 物种首次出现给英文全称与缩写：
  - hydroxylammonium nitrate (**HAN**)，$\ce{NH3OH+ NO3-}$
  - ammonium dinitramide (**ADN**)，$\ce{NH4N(NO2)2}$
  - 1-ethyl-3-methylimidazolium tetrafluoroborate（$\ce{[emim][BF4]}$，文献亦作 EMI-BF4）
  - 1-ethyl-3-methylimidazolium bis(trifluoromethylsulfonyl)imide（$\ce{[emim][TFSI]}$）
  - dicyanamide（$\ce{[DCA]-}$）
- **IL 命名统一**：文献里 `EMI-BF4` 与 `[emim][BF4]` 混用。本课程正文统一用方括号式 `[emim][BF4]`，首次出现括注 EMI-BF4；**引用文献标题时保留原题写法**，不改。

### 术语消歧（本课特有，开篇即做）

- **HAN**：hydroxylammonium nitrate（硝酸羟胺）。**检索时必须展开全称**，缩写 `HAN` 会大量误命中人名、地名与网络术语。
- **ADN**：ammonium dinitramide（二硝酰胺铵）。与 adenosine、DNA 相关缩写无关。
- **EIL**：energetic ionic liquid（含能离子液体）。
- **三种「MD」必须严格区分，全课程不得混用**：
  | 名称 | 势能来源 | 键能否断裂 | 本课程出现处 |
  |---|---|---|---|
  | classical MD | 经验力场 | 否 | 第 3、4、6 讲 |
  | AIMD / ab initio MD | 每步算 DFT | 可以（但代价极高） | 第 2、7、8 讲 |
  | reactive MD（ReaxFF / QMD） | 键级经验势 | 是 | 第 4、8 讲 |
  **QMD 在推进剂文献里特指 quantum molecular dynamics = ReaxFF 类反应性 MD，不是量子动力学（quantum dynamics）。** 第 8 讲须显式说明这一点，否则读者会误解文献标题。
- **dual-mode / multi-mode micropropulsion**：同一工质的**电喷雾模式 + 化学分解模式**。这是本课程两个应用分支的工程缝合点，第 1 讲引出、第 8 讲收束。
- **EHD**：沿用 PINNs 课程的消歧——一律指 electrohydrodynamics（电水动力学）。

### 引用（本课新增条款）

- **文献类型必须标注。** DTIC 技术报告写 `[技术报告]`；会议论文写会议全称（如 `51st AIAA/SAE/ASEE Joint Propulsion Conference`）；期刊写期刊名。
- **数据集 DOI 不得作为论文引用。** 实测 `10.7274/q524jm23h9c`（Figshare，"Molecular Dynamics Simulations of Ionic Liquid Nanodroplets in Electric Fields"）在 Crossref 返回 **HTTP 404**，属数据集而非论文。此类条目只能作为补充材料链接，**不进参考文献编号序列**。
- **年份以 Crossref 为准。** OpenAlex 与 Crossref 可能差 1 年（在线优先年 vs 卷期年）。实测 `10.1016/j.actaastro.2020.11.018`：OpenAlex 记 **2020**、Crossref 记 **2021**，本课程采用 **2021**。
- **严禁编造 DOI**（沿用 PINNs 硬规矩）。每条 DOI 写入讲义前须经 Crossref `/works/<DOI>` 回查，标题须对得上。
- 教科书级内容（Kohn–Sham 方程、Green–Kubo 关系、velocity-Verlet 积分）**不要求 DOI**，但 IL 体系特有的经验结论（电荷缩放 0.8e、Nernst–Einstein 高估电导率、慢弛豫所需平衡时间量级）**必须有出处**。

### frontmatter

每讲必填：`pubDatetime`、`title`（格式 `第 N 讲：标题`）、`description`、`course: md-dft-ionic-liquid`、`order: N`、`tags`、`draft`。

**标签体系（三组，已确认）**

- 方法组：`分子动力学`、`第一性原理`、`机器学习势函数`
- 物质组：`离子液体`
- 应用组：`微推进`、`绿色推进剂`

| 讲 | 标签 |
|---|---|
| 1 | `离子液体` `分子动力学` `第一性原理` `微推进` |
| 2 | `第一性原理` `离子液体` |
| 3 | `分子动力学` `离子液体` |
| 4 | `分子动力学` `离子液体` |
| 5 | `机器学习势函数` `离子液体` |
| 6 | `分子动力学` `离子液体` `微推进` |
| 7 | `第一性原理` `分子动力学` `离子液体` `微推进` |
| 8 | `第一性原理` `分子动力学` `离子液体` `绿色推进剂` |

### 交叉引用（双向，已确认）

- **本课程引 PINNs 课程**：
  - 第 5 讲引 `pinns-variants-taxonomy`（神经算子学「解算子」vs PINNs 学「单个解」的区分，与 MLIP 学「势能面」作对照）
  - 第 7 讲引 `pinns-ehd`（EHD 控制方程组：Poisson + 电荷守恒 + NS，三场量级差异与归一化方案）
- **PINNs 课程回引本课程**：`src/content/posts/pinns-ehd.md` 增补两条参考文献——MD–3D Poisson 耦合（`10.1109/tps.2014.2327913`）与 EHD–PIC 场蒸发（`10.2514/1.j064951`），并加一句指向本课程第 7 讲。
- **站内链接必须写完整 URL。** AGENTS.md 已明确：markdown 正文里以 `/` 开头的站内链接不会自动加 base 前缀。格式统一为
  `https://tiegenfang.github.io/fangfangfang/posts/<slug>/`
- 改 `pinns-ehd.md` 属**已发布内容变更**，须单独提交，并跑完整 build 回归（含 Pagefind 重建）+ 浏览器实测该页公式未被改坏。

---

## 4. 课程页规格

文件：`src/content/courses/md-dft-ionic-liquid.md`

```yaml
---
pubDatetime: <首讲发布日>T09:00:00Z
title: 分子动力学与第一性原理：离子液体工质的电喷雾与绿色推进
description: DFT、MD、力场谱系与机器学习势函数的方法论骨架，以及它们在离子液体电喷雾微推进与 HAN/ADN 基绿色推进剂催化分解两个方向的具体应用与尺度桥接。
draft: false
---
```

正文写课程简介（讲义列表自动生成，不要手写）：

- **适合谁**：需要在分子/原子尺度上解释或预测离子液体工质行为的研究生与工程师，尤其是做电喷雾微推进与绿色单组元推进剂的。
- **前置知识**：量子力学基础（能接受 Kohn–Sham 方程直接给出）、统计力学基础（系综与配分函数）、至少接触过一种 MD 或量化软件。**不要求**会写 LAMMPS/VASP 输入文件。
- **能学到什么**：能判断一个 IL 工质问题该用 classical MD、AIMD 还是 ReaxFF；能说清电荷缩放、极化力场、色散校正各自解决什么失效；能把模拟得到的黏度/电导率/表面张力接到锥射流标度律与比冲上；能把 DFT 势垒接到表观分解速率上。
- **课程结构说明**：第 1 讲定位，第 2–5 讲是方法学主干（DFT → MD → 力场 → MLIP，有先后依赖），第 6–8 讲是应用（电喷雾拆两讲，绿色推进剂一讲）。**第 6、7 讲有先后依赖**（第 7 讲的表面与耦合建立在第 6 讲的液滴图像上），第 8 讲可独立读。

---

## 5. 分讲规格

文件名一律 `src/content/posts/md-dft-il-*.md`（英文 slug，符合 AGENTS.md 约定）。

---

### 第 1 讲 · 多尺度链条：离子液体工质为什么必须下到原子尺度

**slug**：`md-dft-il-multiscale-map.md`

**必须覆盖**

1. **多尺度链条全图**（本讲主产物，用表格而非插图——站点沿用 PINNs 课程的无图约定）：
   | 尺度 | 对象 | 方法 | 输出量 | 上游消费者 |
   |---|---|---|---|---|
   | 0.1–1 nm | 离子对、氢键网络 | DFT | 结合能、电荷分布、电子密度 | 力场参数化 |
   | 1–10 nm | 纳米液滴、界面双电层 | classical MD / AIMD | 表面张力、场蒸发势垒 | 锥射流模型 |
   | 10 nm–1 μm | 发射器表面、Taylor 锥 | MD–Poisson 耦合 / EHD–PIC | 离子发射电流、能量分布 | 推力器设计 |
   | 反应坐标 | 分解过渡态、表面吸附 | DFT / ReaxFF | 活化能、速率常数 | 微观动力学模型 |
   | 宏观 | 推力器性能 | continuum | 推力、比冲、效率 | 任务设计 |
2. **为什么 continuum 不够**：IL 是纯离子体系，无溶剂稀释；锥尖曲率半径达 nm 量级，连续介质假设（$\varepsilon$ 为体相常数）在发射点失效；分解反应的决速步是单个键的断裂，Arrhenius 参数无法从宏观拟合外推。
3. **三种方法的不可替代性与代价对照表**：DFT（电子结构可得、体系 <500 原子、ps 尺度）、classical MD（$10^6$ 原子、μs 尺度、但势能面质量完全取决于力场）、ReaxFF（键可断裂、但参数化难且精度介于两者之间）。
4. **双模式/多模式微推进**作为全课程的工程缝合点：同一 IL 工质既可电喷雾发射（第 6、7 讲），也可催化分解释能（第 8 讲）。首次出现即给出处。
5. **失效模式清单**（本讲建立、后续各讲逐一展开）：固定电荷力场高估离子关联、Nernst–Einstein 高估电导率、IL 平衡时间被严重低估、色散校正缺失导致离子对结合能错、ReaxFF 训练集外推失控。

**必备公式**：无需复杂推导。给出尺度对照的数量级估计（时间与空间），以及 DFT/AIMD/ReaxFF 的计算成本标度（$O(N^3)$ 对角化、AIMD 每步一次 SCF）。

**文献需求（已核验）**

- `10.2514/1.b34341`（2013 *J. Propulsion and Power*，72 引）Assessment of Imidazole-Based Ionic Liquids as **Dual-Mode** Spacecraft Propellants —— 双模式缝合的原始出处
- `10.2514/6.2015-4011`（2015 *51st AIAA/SAE/ASEE Joint Propulsion Conference*，36 引）Electrospray of an Energetic Ionic Liquid Monopropellant for **Multi-Mode** Micropropulsion Applications
- `10.1016/j.mtcomm.2022.103699`（2022 *Materials Today Communications*，32 引）Advances in the molecular simulation and numerical calculations of the green high-energy oxidant ADN —— 分子模拟与 continuum 数值计算的尺度对照
- `10.1016/j.actaastro.2022.04.011`（2022 *Acta Astronautica*，61 引）A review on HAN decomposition techniques for propulsion application
- `10.1021/acs.chemrev.8b00763`（2019 *Chemical Reviews*，656 引）MD Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields
- 需补：电喷雾微推进的综述级出处（Lozano 组的工作），以及 Gañán-Calvo 锥射流标度律原始文献（第 6 讲要用，本讲先引出）

**验收**：读者能对任一 IL 工质问题说出「该用哪种方法、能得到什么量、这个量往上交给谁」；尺度表至少 5 行 × 5 列。

---

### 第 2 讲 · DFT 骨架：Kohn–Sham、泛函层级与色散校正

**slug**：`md-dft-il-density-functional-theory.md`

**必须覆盖**

1. **Hohenberg–Kohn 与 Kohn–Sham 构造**（直接给方程，不重推量子力学基础——读者前置已定）
   - $\left[-\tfrac{1}{2}\nabla^2+v_{\text{eff}}(\mathbf r)\right]\phi_i(\mathbf r)=\varepsilon_i\phi_i(\mathbf r)$
   - $v_{\text{eff}}(\mathbf r)=v_{\text{ext}}(\mathbf r)+\displaystyle\int\frac{\rho(\mathbf r')}{|\mathbf r-\mathbf r'|}\,\mathrm d\mathbf r'+v_{\text{xc}}[\rho](\mathbf r)$
   - $\rho(\mathbf r)=\sum_i f_i|\phi_i(\mathbf r)|^2$，逐符号定义，给原子单位制说明
2. **交换关联泛函层级**（Jacob's ladder）：LDA → GGA（PBE）→ meta-GGA → hybrid（B3LYP、PBE0、HSE06）→ 双杂化。**对 IL 的具体影响**：纯 GGA 严重高估离子对的电荷转移、低估结合能；hybrid 改善但成本翻倍且平面波实现昂贵。
3. **色散校正是 IL 的必选项，不是可选项**（本讲核心）：IL 的烷基链间作用以 London 色散为主，标准 GGA 完全捕捉不到。给出 DFT-D3/D4 形式
   $E_{\text{disp}}=-\sum_{A>B}\frac{C_6^{AB}}{r_{AB}^{6}}f_{\text{damp},6}(r_{AB})-\sum_{A>B}\frac{C_8^{AB}}{r_{AB}^{8}}f_{\text{damp},8}(r_{AB})$
   以及非局域 vdW 泛函（vdW-DF、optB86b-vdW）路线的取舍。
4. **基组与赝势**：平面波 + 赝势（VASP/CP2K/Quantum ESPRESSO）vs 高斯基组（Gaussian/ORCA）。IL 含 F、S、B 等元素时的赝势选择与截断能收敛判据。BSSE（基组叠加误差）在算离子对结合能时**必须**做 counterpoise 校正——这是 IL-DFT 最常见的错误。
5. **AIMD 两条路线**：Born–Oppenheimer MD（每步全 SCF 收敛）vs Car–Parrinello MD（电子自由度作虚拟动力学）。给出各自的适用条件与时间步限制（CPMD 需 $\Delta t\sim0.1$ fs，BOMD 可 0.5–1 fs）。
6. **IL 体系的 DFT 验证陷阱**（本讲落点）：气相离子对结合能、液相径向分布函数、密度、扩散系数四项基准，哪些能对上实验、哪些系统性偏差。

**必备公式**：KS 方程组、$v_{\text{eff}}$ 三项、色散校正、过渡态理论的速率常数
$k=\dfrac{k_{\mathrm B}T}{h}\dfrac{Q^{\ddagger}}{Q_{\mathrm R}}\exp\!\left(-\dfrac{\Delta E^{\ddagger}}{k_{\mathrm B}T}\right)$（第 8 讲要用，此处先建立）

**文献需求（已核验）**

- `10.1021/jp805306u`（2008 *J. Phys. Chem. A*，118 引）Validation of Dispersion-Corrected Density Functional Theory Approaches for Ionic Liquid Systems —— 本讲第 3 节的直接依据
- `10.1021/jp044414g`（2005 *J. Phys. Chem. B*，275 引）Ab Initio Molecular Dynamics Simulation of a Room Temperature Ionic Liquid —— AIMD on IL 的奠基工作
- `10.1021/jp068898n`（2007 *J. Phys. Chem. B*，156 引）Insights into the Structure and Dynamics of a Room-Temperature Ionic Liquid: AIMD
- `10.1063/1.1593011`（2003 *J. Chem. Phys.*，30 引）Hydrogen bonding and proton transfer in small hydroxylammonium nitrate clusters: A theoretical study —— HAN 团簇的 DFT 基准，为第 8 讲铺垫
- 已补齐（见 §7 奠基文献小节）：PBE `10.1103/PhysRevLett.77.3865`；DFT-D3 `10.1063/1.3382344`（题名是 94 elements H–Pu）、D4 主文 `10.1063/1.5090222`；vdW-DF 原文 `10.1103/PhysRevLett.92.246401`、固体检验 `10.1103/PhysRevB.83.195131`；counterpoise/BSSE `10.1080/00268977000101561`

**验收**：读者能为一个具体 IL 体系（如 $\ce{[emim][BF4]}$ 离子对结合能）说出该用哪个泛函、要不要色散校正、要不要 counterpoise，以及预期偏差方向。

---

### 第 3 讲 · MD 骨架：系综、长程静电与输运量

**slug**：`md-dft-il-molecular-dynamics.md`

**必须覆盖**

1. **运动方程与积分**：$m_i\ddot{\mathbf r}_i=-\nabla_i U(\mathbf r_1,\dots,\mathbf r_N)$；velocity-Verlet 算法三步式；时间步长上限由最快振动决定（IL 含 C–H 约 1 fs，约束氢键后可 2 fs）。
2. **系综**：NVE / NVT（Nosé–Hoover、Langevin）/ NPT（Parrinello–Rahman），配分函数与可观测量关系。**IL 特有陷阱**：黏度可达 30–100 cP，NPT 平衡需要数十 ns，文献中大量「平衡 1 ns」的结果实际未收敛——这是 IL-MD 最常见的系统性错误，必须给出量级判据。
3. **长程静电**（本讲核心）：IL 是纯库仑体系，静电处理错误直接毁掉全部结果。
   - Ewald 求和：$\displaystyle\sum_{i<j}\frac{q_iq_j}{r_{ij}}=\frac{1}{2V}\sum_{\mathbf k\neq0}\frac{4\pi}{k^2}|\rho(\mathbf k)|^2e^{-k^2/4\alpha}+\text{实空间项}+\text{自能项}$
   - **条件收敛与 tin-foil 边界条件**：IL 的介电响应使 $\mathbf k=0$ 项的处理直接改变结构，必须显式声明边界条件
   - PPPM / PME 的精度参数与网格依赖
   - **截断静电（cutoff）对 IL 是致命错误**：给出为什么不能截断的物理论证
4. **输运量计算两条路线**（本讲落点，桥接内容的第一次出现）
   - Green–Kubo：$\eta=\dfrac{V}{k_{\mathrm B}T}\displaystyle\int_0^{\infty}\!\langle P_{\alpha\beta}(0)P_{\alpha\beta}(t)\rangle\,\mathrm dt$；$\sigma=\dfrac{1}{3Vk_{\mathrm B}T}\displaystyle\int_0^{\infty}\!\langle\mathbf J(0)\cdot\mathbf J(t)\rangle\,\mathrm dt$
   - Einstein：$D=\lim_{t\to\infty}\dfrac{1}{6t}\big\langle|\mathbf r_i(t)-\mathbf r_i(0)|^2\big\rangle$
   - **Nernst–Einstein 高估电导率**：$\sigma_{\text{NE}}=\dfrac{e^2}{Vk_{\mathrm B}T}\left(N_+Z_+^2D_++N_-Z_-^2D_-\right)$ 假设离子独立运动，忽略正负离子关联。IL 中离子强关联 ⇒ 设有效载流子分数 $1-\Delta_{\text{NE}}$ 落在 $0.5$–$0.7$ 的常见区间，则 $\sigma_{\text{NE}}$ 高估约 $40\%$–$100\%$（$1/0.7\approx1.43$、$1/0.5=2$）。**该区间必须由 IL 集体输运的原始/综述文献支撑，不得作为无出处的确定数值写入正文。** 正确做法是用 Green–Kubo 的集体电流，或显式引入 distinct diffusion coefficient / 离子关联度。**这条直接决定第 6 讲的锥射流预测精度**（$\sigma$ 以 $1/2$ 次幂进入电流标度律）。
5. **电荷缩放惯例**：文献普遍把 IL 的部分电荷缩放至 $\pm0.8e$ 以补偿极化效应。这**不是**物理正确的做法，而是把缺失的电子极化折进静电的经验补丁；须说明其适用范围与失效场景（强电场下必然失效——第 7 讲要用这个矛盾）。

**必备公式**：velocity-Verlet、Ewald 三项、Green–Kubo 的 $\eta$ 与 $\sigma$、Einstein 关系、$\sigma_{\text{NE}}$ 及其修正因子

**文献需求（已核验）**

- `10.1021/jp905220k`（2009 *J. Phys. Chem. B*，679 引）Polarizable Force Field Development and Molecular Dynamics Simulations of Ionic Liquids
- `10.1063/1.3643124`（2011 *J. Chem. Phys.*，199 引）A molecular dynamics investigation of the structural and dynamic properties of the ionic liquid 1-n-…
- `10.1021/je500132u`（2014 *J. Chem. Eng. Data*，40 引）A Molecular Dynamics Study of Collective Transport Properties of Imidazolium-Based Room-Temperature Ionic Liquids —— 集体输运性质与离子关联的直接依据
- `10.1063/1.1605380`（2003 *J. Chem. Phys.*，47 引）Molecular dynamics studies of melting and liquid properties of ammonium dinitramide —— ADN 液相性质基准
- 需补：Nernst–Einstein 偏离与离子关联度的原始文献（IL 社区有专门讨论，须补 DOI）；电荷缩放 0.8e 惯例的原始出处

**验收**：读者能说清「算 IL 电导率该用 Green–Kubo 还是 Nernst–Einstein、差多少、为什么」，并能判断一篇 IL-MD 论文的平衡时间是否够。

---

### 第 4 讲 · 力场谱系：固定电荷、极化、粗粒化与 ReaxFF

**slug**：`md-dft-il-force-fields.md`

**必须覆盖**

1. **固定电荷力场**：$U=\sum_{\text{bonds}}+\sum_{\text{angles}}+\sum_{\text{dihedrals}}+\sum_{i<j}\left[\dfrac{q_iq_j}{r_{ij}}+4\epsilon_{ij}\left(\left(\tfrac{\sigma_{ij}}{r_{ij}}\right)^{12}-\left(\tfrac{\sigma_{ij}}{r_{ij}}\right)^{6}\right)\right]$；OPLS/AA、GAFF 在 IL 上的参数化惯例；电荷缩放（回指第 3 讲）。
2. **为什么固定电荷在 IL 上系统性失效**：IL 的电子极化率在 condensed phase 被环境显著屏蔽，气相 DFT 电荷直接搬到液相会高估静电 ⇒ 黏度偏高、扩散偏低、熔点偏高。**极化力场是 IL 的默认选择而非高级选项**——这是本课最重要的判断之一。
3. **极化力场三条技术路线**（对比表）：
   | 路线 | 机制 | 代表 | 额外代价 | 适用 |
   |---|---|---|---|---|
   | Drude 振子 | 每个可极化原子挂一个带负电的谐振子 | Drude-2013、**CL&Pol** | ~2–3×（需双时间步或 SCF） | 参数化生态成熟；CL&Pol 为 IL 可迁移版本 |
   | 诱导偶极自洽 | 迭代解 $\boldsymbol\mu_i=\alpha_i\left(\mathbf E_i^{0}+\sum_{j\neq i}\mathbf T_{ij}\boldsymbol\mu_j\right)$ | AMOEBA、AMOEBA-IL | ~3–5× | 高精度，多极展开 |
   | 电荷均衡/伸缩 | 电荷随环境瞬时重分配（qEq / EEM） | ReaxFF 电荷模块、fluctuating charge | ~2–4× | 需连极化一起训练，可迁移 |

   > [!NOTE]
   > **本表是实施时对 spec 初稿的一处更正。** 初稿把 CL&Pol 归入「电荷平衡/伸缩」路线，经核验为误记：CL&Pol 的离子电荷是**固定**的，极化由附加在原子上的 Drude 位点承担（Pádua 组发布的 LAMMPS 教程即用 `fix drude` 实现），故归入 Drude 振子路线。电荷均衡路线改由 ReaxFF 的电荷均衡模块代表。第 4 讲正文按更正后的分类写，并显式提醒读者这一常见误记。

   给出 Drude 的 $\alpha=q_D^2/k_D$ 与自洽迭代的收敛判据。
4. **粗粒化**：把烷基链合并成单珠，时间尺度上推 2–3 个数量级；代价是丢失氢键方向性与局部结构 ⇒ **不适用于发射器表面与场蒸发问题**（第 7 讲要回指这个边界）。
5. **force matching**（连接 DFT 与力场）：$U_{\text{FF}}=\arg\min\displaystyle\sum_{k}\left|\mathbf F^{\text{FF}}_k-\mathbf F^{\text{DFT}}_k\right|^2$；这是 MLIP（第 5 讲）的直接前身，须显式建立这条谱系。
6. **ReaxFF**：键级 $BO_{ij}=\exp\!\left[-\left(\tfrac{r_{ij}}{r_0}\right)^{p}\right]$ 及其如何使键可断裂；参数化流程与训练集覆盖度要求；**外推失控是主要风险**——训练集外的产物分布不可信。
7. **选型决策表**：问题类型 → 推荐力场类别 → 理由 → 已知失效模式。

**必备公式**：固定电荷总势能、Drude 极化率、诱导偶极自洽方程、force matching 目标函数、ReaxFF 键级

**文献需求（已核验）**

- `10.1021/acs.chemrev.8b00763`（2019 *Chemical Reviews*，656 引）MD Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields —— **本讲骨架综述**
- `10.1021/acs.jctc.9b00689`（2019 *J. Chem. Theory Comput.*，207 引）Transferable, Polarizable Force Field for Ionic Liquids（CL&Pol）
- `10.1021/acs.jctc.0c01002`（2021 *JCTC*，102 引）Extension of the CL&Pol Polarizable Force Field to Electrolytes, Protic Ionic Liquids, and Deep Eutectic Solvents
- `10.1039/c1cp21379b`（2011 *PCCP*，180 引）Polarizability versus mobility: atomistic force field for ionic liquids
- `10.1039/c4cp05550k`（2015 *PCCP*，171 引）Simulations of room temperature ionic liquids: from polarizable to coarse-grained force fields
- `10.1021/jp056931k`（2006 *J. Phys. Chem. B*，64 引）Development of Complex Classical Force Fields through Force Matching to ab Initio Data
- `10.1021/jz5010945`（2014 *J. Phys. Chem. Lett.*，62 引）First-Principles, Physically Motivated Force Field for the Ionic Liquid [BMIM][BF4]
- `10.1021/acs.jpcb.3c02649`（2023 *J. Phys. Chem. B*，8 引）Structural Properties of HEHN- and HAN-Based Ionic Liquid Mixtures: A Polarizable Molecular Dynamics Study —— **极化力场 + HAN 基 IL，直接支撑第 8 讲**
- `10.2514/6.2019-4367`（2019 *AIAA Propulsion and Energy 2019 Forum*，4 引）Thermal Decomposition of Hydroxylammonium Nitrate: **ReaxFF Training Set Development** for Molecular Dynamics —— 本讲第 6 节的方法学范本
- 需补：AMOEBA 原始文献、Drude-2013 原始文献、ReaxFF 原始文献（van Duin 2001）、AMOEBA-IL（Giiisp OA 已命中 "Current Status of AMOEBA-IL"，**须补 DOI**）

**验收**：给定一个 IL 问题（体相输运 / 界面吸附 / 分解反应 / 强电场发射），读者能选出力场类别并说出该选择的已知失效模式。

---

### 第 5 讲 · 机器学习势函数：用 DFT 精度跑 MD 尺度

**slug**：`md-dft-il-machine-learned-potentials.md`

**必须覆盖**

1. **动机与定位**：AIMD 精度好但只到 ps/百原子；classical MD 尺度够但势能面是经验的。MLIP 的目标是同时拿到两者。给出成本-精度二维定位图（表格形式）。
2. **基本构造**：原子分解 $E=\sum_i \epsilon_i(\mathbf d_i)$，其中 $\mathbf d_i$ 是局部环境描述符；等变消息传递网络如何保证旋转/平移不变性与矢量力的正确变换。
3. **训练目标**：$\mathcal L=w_E\left|E-E^{*}\right|^2+w_F\left\|\mathbf F-\mathbf F^{*}\right\|^2+w_S\left\|\boldsymbol\sigma-\boldsymbol\sigma^{*}\right\|^2$；数据集须覆盖的构型空间；**力标签比能量标签重要得多**（给出论证）。
4. **IL 上的迁移性（本讲核心，也是最新的一支）**：等变 MLIP 在 IL 上的精度与迁移性实测结论；温度迁移性问题——在单一温度训练的势在其他温度下失效，须用温度可迁移的粗粒化或多温度训练集。
5. **主动学习与外推检测**：模型集成分歧、力不确定性估计、构型空间外推判据。**IL 的特殊困难**：分解反应的过渡态构型在平衡态训练集中根本不存在 ⇒ 反应性 MLIP 必须专门采样反应路径。这是把第 4 讲 ReaxFF 训练集问题原样搬到 MLIP。
6. **长程静电与电荷**：IL 是纯库仑体系，MLIP 的局部截断（典型 6–10 Å）无法直接表达长程库仑 ⇒ 需要显式电荷模型或长程修正。给出当前几种处理方式与代价。
7. **与 PINNs 课程的对照**（交叉引用点）：MLIP 学的是**势能面**（一个函数），PINNs 学的是**单个 PDE 解**，神经算子学的是**解算子**。三者都是「用神经网络替代昂贵计算」，但学习目标与外推性质完全不同。指向 `pinns-variants-taxonomy`。

**必备公式**：原子分解、训练损失三项、等变性的变换要求（矢量/张量特征的旋转行为）

**文献需求（已核验）**

- `10.1021/acs.jpclett.4c01942`（2024 *J. Phys. Chem. Lett.*，33 引）Transferability and Accuracy of Ionic Liquid Simulations with **Equivariant Machine Learning Interatomic Potentials** —— 本讲核心
- `10.1016/j.xcrp.2021.100359`（2021 *Cell Reports Physical Science*，77 引）Development of robust neural-network interatomic potential for molten salt —— 熔盐/离子体系的 NN 势范本
- `10.1063/5.0022431`（2020 *J. Chem. Phys.*，62 引）Temperature-transferable coarse-graining of ionic liquids with dual graph convolutional neural networks —— 温度迁移性问题
- `10.1038/s41467-025-63852-x`（2025 *Nature Communications*，37 引）Machine learning of charges and long-range interactions from energies and forces —— 第 6 节长程问题
- `10.1103/physrevlett.134.148001`（2025 *Phys. Rev. Lett.*，22 引）Learning Classical Density Functionals for Ionic Fluids
- 需补：DeepMD、MACE、ANI、sGDML、Behler–Parrinello 描述符的原始文献（须补 DOI/arXiv）

> [!NOTE]
> **命名注意**：实测 OpenAlex 查 `MACE DeepMD ionic liquid` 返回 **0 条**，而查 `machine learning interatomic potential ionic liquid` 返回 47 条。IL 社区的文献用词是 **equivariant machine learning interatomic potentials** / **neural-network interatomic potential**，不是按具体框架名（MACE/DeepMD）索引的。**正文不要以框架名为叙事主线**，否则读者按框架名检索会扑空。

**验收**：读者能判断一个 IL 问题该不该上 MLIP，以及上 MLIP 时必须额外做的两件事（反应路径采样、长程静电处理）。

---

### 第 6 讲 · 电喷雾 I：锥射流、场蒸发与离子发射的分子图像

**slug**：`md-dft-il-electrospray-emission.md`

**材料状态：最充足。** OpenAlex `electrospray ionic liquid molecular dynamics` 71 条、`electrospray thruster ionic liquid` 231 条，MD 专属谱系完整。

**必须覆盖**

1. **Taylor 锥与 cone-jet 的连续介质图像**（先立靶再拆）：锥半角 49.3°、电流标度律 $I\propto(\gamma\sigma Q)^{1/2}$（$\gamma$ 表面张力、$\sigma$ 电导率、$Q$ 体积流量；$\varepsilon_0$ 只能进无量纲系数 $C_I$）、液滴直径标度。**说明这套标度律的成立前提**：连续介质、恒定物性、足够大的流量。

   > [!WARNING]
   > **spec 初稿此处有量纲错误，勿改回。** 初稿写作 $I\propto(Q\sigma/\varepsilon_0)^{1/2}$，按量纲检查开方得 $\mathrm{m^{1.5}\,s^{-1}}$，不是电流。$Q,\sigma,\gamma,\varepsilon_0$ 四个量里唯一能拼出电流量纲的是 $(\gamma\sigma Q)^{1/2}$。第 6 讲正文已按正确形式写，并带一条 `> [!NOTE]` 提醒读者这个常见误写。
2. **IL 电喷雾的特殊性**：无溶剂 ⇒ 不存在溶剂蒸发导致的浓缩过程，发射的是**裸离子与离子团簇**（$\ce{[emim][BF4]}$、$\ce{[emim]2[BF4][BF4]-}$ 等），这是 IL 与常规 ESI 的根本区别，也是它适合微推进的原因（比冲高、无沉积污染）。
3. **Rayleigh 极限与液滴裂变**：$Q_{\max}=8\pi\left(\varepsilon_0\gamma R^3\right)^{1/2}$；带电纳米液滴在电场中的形变、离子发射与裂变的竞争。MD 在这里的作用：给出连续介质无法描述的**离散离子发射事件**。
4. **场蒸发（field evaporation）的活化图像**（本讲核心）：离子从液面逸出需克服的能垒
   $\Delta G=E_{\text{coh}}+E_{\text{solv}}-q\,\Delta\varphi-\dfrac{q^2}{8\pi\varepsilon_0 R_{\text{drop}}}$
   逐项拆解：内聚能、溶剂化（IL 中为离子-团簇结合能）、电场做的功、镜像电荷修正。**给出电场如何压低势垒的具体量级**（$\sim\text{kV/mm}$ 量级场下势垒降低若干 eV）。
5. **MD 模拟的具体做法与陷阱**：
   - 约束 MD（对液滴施加约束以维持形状）vs 无约束自由演化
   - 外加电场的施加方式（均匀场 vs 显式电极）与其非物理性
   - 纳米液滴尺度（$10^3$–$10^5$ 离子）与真实锥尖（$10^8$ 以上）的尺度差 ⇒ **有限尺度效应必须显式讨论**
   - 力场选择对结果的敏感性（回指第 3、4 讲：电荷缩放与极化缺失如何改变发射电流）
6. **桥接到宏观（本节按已确认决定折入本讲）**：模拟得到的表面张力 $\gamma$、电导率 $\sigma$、黏度 $\eta$ 如何代入 cone-jet 标度律得到电流与液滴直径；再经 $I_{\text{sp}}$ 定义接到比冲。给出量级估算表，**必须有具体数字**。

**必备公式**：Taylor 锥角与电流标度律、Rayleigh 极限、场蒸发势垒逐项、比冲定义 $I_{\text{sp}}=\dfrac{F}{\dot m g_0}$、离子团簇的荷质比对比冲的影响

**文献需求（已核验）**

- `10.1021/jp804585y`（2008 *J. Phys. Chem. A*，105 引）**FEATURE ARTICLE** Nanojets, Electrospray, and Ion Field Evaporation: Molecular Dynamics Simulations and Laboratory Experiments —— **本讲骨架**
- `10.1063/1.3696006`（2012 *J. Chem. Phys.*，33 引）Modeling of an ionic liquid electrospray using molecular dynamics with constraints
- `10.1021/jp402092e`（2013 *J. Phys. Chem. B*，41 引）Prediction of Fundamental Properties of Ionic Liquid Electrospray Thrusters using Molecular Dynamics
- `10.1007/s44205-022-00010-1`（2022 *J. Electric Propulsion*，12 引）Molecular Dynamics Simulations of Ion Extraction from Nanodroplets for Ionic Liquid Electrospray Thrusters
- `10.1063/1.5016309`（2018 *J. Chem. Phys.*，19 引）Dong, Vatamanu, Wei, Bedrov. The 1-ethyl-3-methylimidazolium bis(trifluoro-methylsulfonyl)-imide ionic liquid nanodroplets on solid surfaces
- `10.1016/j.actaastro.2020.11.018`（**Crossref 记 2021** *Acta Astronautica*，36 引）Molecular dynamics simulation of ionic liquid electrospray: Revealing the effects of interaction potential
- `10.1016/j.ijheatmasstransfer.2021.121983`（2021 *Int. J. Heat Mass Transfer*，26 引）同系列，微观效应
- **团队集中度须声明**：`10.1063/1.3696006`、`10.1021/jp402092e` 同为 **Borner / Li / Levin** 团队，第 7 讲的 `10.1109/tps.2014.2327913` 亦出自 Borner / Levin。这一支 MD 电喷雾谱系高度集中于该组，引用时须说明，不得写成学界共识（处理方式同 PINNs 课程第 7 讲对 Ze Tao / Fujun Liu 团队集中度的声明）。
- 需补：Gañán-Calvo 锥射流标度律原始文献、Taylor 1964 锥解原始文献、Rayleigh 1882 极限、de la Mora 的 IL 电喷雾实验谱系（**须补 DOI，这几条是本讲公式的根**）

> [!WARNING]
> `10.7274/q524jm23h9c`（Figshare）**不得写入参考文献**——它是数据集 DOI，Crossref 返回 404。对应的正式论文是 `10.1007/s44205-022-00010-1`，已在上面列出。

**验收**：桥接一节必须给出从 $\gamma/\sigma/\eta$ 到电流、液滴直径、比冲的**具体量级数字**，不能停留在「可以代入标度律」。场蒸发势垒四项必须逐项有物理解释与量级。

---

### 第 7 讲 · 电喷雾 II：发射器表面、AIMD 碎裂与尺度耦合

**slug**：`md-dft-il-electrospray-surface-coupling.md`

**必须覆盖**

1. **发射器表面的 IL 吸附**（DFT 侧）：咪唑类 IL 在 Pt(111) 等金属表面的吸附构型、吸附能、电荷转移；对功函数的影响 ⇒ 直接改变场致发射的起始电压。**这是把第 2 讲的 DFT 与第 6 讲的发射图像接上的关键一节。**
2. **AIMD 下的推进剂碎裂**（本讲核心新料）：$\ce{[emim][BF4]}$ 在电喷雾加速与碰撞过程中的碎裂通道；AIMD 相比 classical MD 的不可替代性——**键断裂与电荷重分配只有电子结构方法能给**。给出碎裂通道与产物荷质比的工程意义（比冲损失、羽流污染）。
3. **MD–Poisson 耦合**（尺度桥接的核心机制）：
   - 连续区：$\nabla\cdot(\varepsilon\nabla\varphi)=-\rho_c$，$\mathbf E=-\nabla\varphi$
   - MD 区：显式离子，提供边界处的电荷密度与发射通量
   - 耦合界面：如何把 MD 的离散发射事件转成 continuum 的边界条件，反之如何把 continuum 的场反馈给 MD
   - **与 PINNs 课程的交叉引用点**：同一套 Poisson–电荷守恒–NS 方程组，指向 `pinns-ehd`
4. **EHD–PIC 路线**：粒子网格法处理场蒸发与羽流，与 MD 的尺度分工。说明 PIC 与 MD 都是「显式粒子」，区别在相互作用是否由网格场中介。
5. **场致发射与电荷注入边界**：Fowler–Nordheim 形式 $J=\dfrac{A}{\phi}E^2\exp\!\left(-\dfrac{B\phi^{3/2}}{E}\right)$；IL 电喷雾中离子发射与电子发射的竞争；**电荷缩放力场在强电场下必然失效**（回指第 3 讲第 5 节）——本讲要把这个矛盾摊开，并指出极化力场/MLIP 是出路。
6. **桥接到推力器性能（折入本讲）**：发射电流 → 推力 $F=\dot m v_e$ → 比冲 → 效率；羽流发散角与中和器需求；纳米液滴模式 vs 纯离子模式对性能的取舍。

**必备公式**：Poisson 方程与耦合界面条件、Fowler–Nordheim、推力与比冲定义、功函数变化对发射电流的影响

**文献需求（已核验）**

- `10.1002/adts.202400458`（2024 *Advanced Theory and Simulations*，2 引）Adsorption of Imidazolium-Based Ionic Liquid On Pt(111) Surface Studied Using Density Functional Theory —— 本讲第 1 节的直接依据
- `10.1063/5.0307045`（2026 *J. Chem. Phys.*，1 引）Collision-induced fragmentation of the $\ce{[emim][BF4]}$ propellant in electrospray thrusters: **Ab initio molecular dynamics** —— 本讲第 2 节的唯一直接文献，**新且孤**，须说明这是单一工作而非学界共识
- `10.1109/tps.2014.2327913`（**2015** *IEEE Trans. Plasma Sci.*，20 引）Coupled Molecular Dynamics–3-D Poisson Simulations of Ionic Liquid Electrospray Thrusters —— 第 3 节。Crossref `issued` 为 2015，**DOI 串里的 2014 是文章号年份，不可据此判年**
- `10.2514/1.j064951`（2025 *AIAA Journal*，1 引）Field Evaporation Simulation in Electrospray Thrusters Using Electrohydrodynamics–Particle-in-Cell Method —— 第 4 节
- `10.1007/s44205-022-00032-9`（2022 *J. Electric Propulsion*，18 引）Molecular dynamics studies of ionic liquid-surface interactions for electrospray thrusters
- 需补：Fowler–Nordheim 原始文献、Taylor 锥的静电场解、功函数与吸附的关系（须补 DOI）

> [!NOTE]
> **文献集中度须声明。** 第 2、4 节各只有 1 条直接文献（均为近两年的低引工作）。按 PINNs 课程第 7 讲的先例，正文须显式说明这些是**单一团队的近期结果**，不得写成学界共识。

**验收**：MD–Poisson 耦合的界面条件必须写全（不能只说「耦合」）；第 5 节必须明确指出电荷缩放在强场下失效，并给出替代方案；桥接一节要有推力量级数字。

---

### 第 8 讲 · 离子液体作燃料：HAN 与 ADN 的催化分解与反应性模拟

**slug**：`md-dft-il-green-propellant-decomposition.md`

**材料状态：ADN 与 HAN 合计可用。** 但经典「催化燃烧」（IL 作催化剂/载体）已明确排除，本讲范围是**IL/含能盐作燃料本身的分解与点火**。

**必须覆盖**

1. **绿色单组元推进剂的化学**（开篇立底）
   - HAN：$\ce{NH3OH+ NO3-}$，水溶液形态（典型 40–95 wt%），氧化剂与燃料分离在水溶液中
   - ADN：$\ce{NH4N(NO2)2}$，氧化性盐，常与燃料/IL 配成液体推进剂
   - 对比肼类（毒性）的性能与安全性取舍
2. **分解机理的化学图景**（用 `\ce{}` 写全）
   - HAN 的质子转移主导：$\ce{NH3OH+ + NO3- <=> NH2OH + HNO3}$，随后 $\ce{NH2OH}$ 分解与 $\ce{HNO3}$ 氧化燃料
   - ADN 的质子转移与 $\ce{N2O}$/$\ce{NO2}$ 释放路径
   - **关键点：两者都是质子转移起始，这正是团簇级 DFT 计算能提供而宏观动力学拟合不能提供的信息**
3. **DFT 侧：表面催化分解**（本讲核心）
   - HAN 在 Pd(100) 与 Ir(100) 上的吸附构型、吸附能与分解势垒
   - ADN 在 Cu(111) 上的第一性原理微观动力学模拟：从 DFT 势垒到表面覆盖度到表观速率
   - 单原子催化剂降低分解势垒的实验+计算证据
   - **桥接**：DFT 势垒 $\Delta E^{\ddagger}$ → TST 速率常数 → Langmuir–Hinshelwood 表面覆盖 → 表观分解速率 → 催化床设计参数
4. **反应性 MD 侧：ReaxFF / QMD**
   - HAN 基 IL 推进剂的**电场驱动分解**（这一篇同时把第 7 讲的电场与本讲的反应焊在一起，是本课程两个应用分支的真正交点）
   - $\ce{H2O}$ 对 ADN 热分解的影响
   - 氢促进 ADN 分解的 AIMD
   - ReaxFF 训练集开发的流程与覆盖度要求（回指第 4 讲）
   - **QMD 术语澄清**：见 §3 术语消歧
5. **hypergolic 离子液体**（文献最薄的一节，须显式标注）
   - 含能 IL 与 $\ce{HNO3}$ 接触自燃的 QMD 模拟
   - 含能 IL/硝酸混合物的热物理性质 MD
   - **诚实声明**：该方向原子尺度文献仅个位数，其中 QMD 一篇为 DTIC 技术报告（无期刊版），不得写成成熟结论
6. **多模式缝合（本讲收束，呼应第 1 讲）**：同一 IL 工质的电喷雾模式与化学分解模式如何在一个推力器里共存；双模式 IL 的评估结论；计算高通量筛选多模式推进剂的新范式。
7. **与 continuum 燃烧模型的分工**：分子模拟给机理与速率参数，continuum 给燃烧波结构与推力器内流场。**明确说明本课程不做 continuum 燃烧建模**（那是 PINNs 课程第 6 讲的领域，交叉引用）。

**必备公式**：TST 速率常数、Langmuir–Hinshelwood 覆盖度 $\theta_i=\dfrac{K_ip_i}{1+\sum_j K_jp_j}$、Arrhenius 表观式与 DFT 势垒的对应、ReaxFF 键级演化（回指第 4 讲）、燃烧波速度的量级估计

**文献需求（已核验）**

*HAN（用户指定新增，实测最厚）*

- `10.1016/j.susc.2016.05.005`（2016 *Surface Science*，21 引）Adsorption and decomposition of monopropellant molecule HAN on **Pd(100) and Ir(100)** surfaces: A DFT study —— **第 3 节的核心**
- `10.1016/j.fuel.2026.140763`（2026 *Fuel*，1 引）**ReaxFF molecular dynamics study of electric field-driven decomposition in HAN-based ionic liquid propellant** —— **第 4 节的核心，也是两个应用分支的交点**
- `10.1021/acs.jpca.8b05351`（2018 *J. Phys. Chem. A*，37 引）Thermal Decomposition Mechanism of Aqueous HAN: Molecular Simulation and …
- `10.1021/acs.jpclett.7b00672`（2017 *J. Phys. Chem. Lett.*，46 引）Catalytic Decomposition of Hydroxylammonium Nitrate Ionic Liquid: Enhancement of NO Formation
- `10.1063/1.1593011`（2003 *J. Chem. Phys.*，30 引）Hydrogen bonding and proton transfer in small HAN clusters
- `10.1039/d2cp01571d`（2022 *PCCP*，8 引）Structures, proton transfer and dissociation of HAN revealed by electro…
- `10.1021/acs.jpcb.3c05623`（2024 *J. Phys. Chem. B*，7 引）Liquid Structure and Hydrogen Bonding in Aqueous HAN
- `10.2514/1.b34584`（**2013** *J. Propulsion and Power*，51 引）Decomposition of Monopropellant Blends of Hydroxylammonium Nitrate and Imidazole-Based Ionic Liquid Fuels —— Crossref `issued` 为 2013，spec 初稿误记 2012，已按「年份以 Crossref 为准」更正
- `10.1016/j.actaastro.2022.04.011`（2022 *Acta Astronautica*，61 引）A review on HAN decomposition techniques for propulsion application —— 综述骨架
- `10.1007/978-3-031-62574-9_2`（2024 *Space Technology Library*）Thermal and Catalytic Decomposition of HAN-Based Propellant
- `10.1007/s44205-025-00174-6`（2026 *J. Electric Propulsion*，1 引）Multimode propellant discovery: a computational high-throughput screening paradigm —— 第 6 节
- `10.1016/j.proci.2024.105342`（2024 *Proc. Combust. Inst.*，7 引）DC ignition characteristics of HAN

*ADN*

- `10.1016/j.mtcomm.2024.110974`（2024 *Materials Today Communications*，2 引）**First principles based microkinetic simulations of ammonium dinitramide decomposition on Cu(111)** —— 第 3 节微观动力学范本
- `10.1016/j.jcat.2025.116357`（2025 *J. Catalysis*，5 引）Breaking the energetic ammonium salts decomposition barrier: atomically dispersed Fe catalysts
- `10.1002/prep.201900309`（2020 *Propellants Explos. Pyrotech.*，12 引）**Reactive Molecular Dynamics** Study on the Effect of $\ce{H2O}$ on the Thermal Decomposition of ADN
- `10.1063/1674-0068/31/cjcp1708161`（2018 *Chinese J. Chem. Phys.*，3 引）Hydrogen Promoted Decomposition of ADN: an **ab initio Molecular Dynamics** Study
- `10.1021/jp307714d`（2012 *J. Phys. Chem. A*，13 引）Mechanism and Kinetics for ADN Sublimation: A First-Principles Study
- `10.1063/1.1535439`（2003 *J. Chem. Phys.*，28 引）Proton transfer in gas-phase ammonium dinitramide clusters
- `10.1016/j.mtcomm.2022.103699`（2022 *Materials Today Communications*，32 引）Advances in the molecular simulation and numerical calculations of the green high-energy oxidant ADN —— 综述骨架
- `10.1016/j.dt.2018.03.009`（2018 *Defence Technology*，138 引）ADN 热分解与燃烧行为综述
- `10.1002/prep.202300130`（2023 *PEP*，5 引）Insight into thermal decomposition behavior of ADN-based liquid propellant

*hypergolic（文献最薄，须显式标注）*

- `10.21236/ada522002`（2010，**[技术报告]** DTIC，3 引）Quantum Molecular Dynamics Simulation of Hypergolic Reactions Between an Energetic Ionic Liquid and Nitric Acid
- `10.1063/1.4819903`（2013 *J. Chem. Phys.*，10 引）Thermophysical properties of energetic ionic liquids/nitric acid mixtures: Insights from molecular dynamics

*多模式缝合*

- `10.2514/1.b34341`（2013 *J. Propulsion and Power*，72 引）Assessment of Imidazole-Based Ionic Liquids as **Dual-Mode** Spacecraft Propellants
- `10.2514/6.2015-4011`（2015 *51st AIAA/SAE/ASEE Joint Propulsion Conference*，36 引）Electrospray of an Energetic Ionic Liquid Monopropellant for Multi-Mode Micropropulsion Applications
- `10.1016/j.cej.2023.144412`（2023 *Chem. Eng. J.*，33 引）Microwave controlled ignition and combustion characteristics of ADN-based ionic liquid propellant

> [!WARNING]
> **本讲参考文献已达 24 条，超出 §1 设定的 8–20 条上限。** 已确认的处理方式见 §9 第 13 条：允许本讲放宽到 25 条，但**须删减而非堆砌**——综述类只保留 2 篇（`10.1016/j.mtcomm.2022.103699` 与 `10.1016/j.actaastro.2022.04.011`），实验类（`10.1016/j.proci.2024.105342`、`10.1016/j.cej.2023.144412`、`10.1021/acs.jpcb.3c05623`）只在对应论断确实需要实验对照时保留。

**验收**：第 3 节的桥接链条（DFT 势垒 → TST → LH 覆盖 → 表观速率 → 催化床参数）必须逐步写全，每步给公式；第 5 节必须显式标注文献稀薄与技术报告属性；所有分解反应方程式用 `\ce{}` 且配平。

---

## 6. 里程碑与发布顺序

| 批次 | 内容 | 前置 | 状态 |
|---|---|---|---|
| **0** | 技术前置：mhchem 化学方程式（§2） | 无（KaTeX 已由 PINNs 课程交付） | **已完成（2026-09-05）**，实测记录见 §2「批次 0 执行记录」 |
| **1** | 课程页 + 第 6 讲（电喷雾 I） | 批次 0 | **已完成**：`courses/md-dft-ionic-liquid.md` + `posts/md-dft-il-electrospray-emission.md`。桥接段给出 112 处数字标记与 47 个工程单位；该讲写作者还查出 spec 初稿电流标度律的量纲错误并改写为 $(\gamma\sigma Q)^{1/2}$（见 §5 第 6 讲 WARNING） |
| **2** | 第 2–5 讲（方法学主干） | 批次 0 | **已完成**：四篇全部写出，引用逐条经 Crossref 核验；第 2 讲补齐 PBE / DFT-D3 / vdW-DF / Boys–Bernardi 四条奠基 DOI，第 4 讲补齐 AMOEBA / Drude / AMOEBA-IL / ReaxFF 四条，第 5 讲补齐 Behler–Parrinello / SchNet / ANI / DeepMD / MACE 五条 |
| **3** | 第 7 讲（电喷雾 II）+ 第 8 讲（绿色推进剂） | 批次 0、第 6 讲 | **已完成**：第 7 讲写出三条 MD–Poisson 界面条件的完整推导、Fowler–Nordheim 与 $\pm0.8e$ 强场失效、比冲账闭合，并按要求声明了 AIMD 碎裂与 EHD–PIC 的单一低引文献集中度；第 8 讲以 HAN 为主、ADN 为辅，含独立「诚实声明」节，12 个反应式的原子与电荷守恒经程序逐式校验 |
| **4** | 第 1 讲（定位）+ 双向交叉引用 + PINNs 讲义回改 + 全课程验收 | 批次 1–3 | **已完成**：第 1 讲最后写，含五层尺度表与三个可检查的量级论证；双向引用闭合（第 5→`pinns-variants-taxonomy`、第 7→`pinns-ehd`、第 8→`pinns-combustion`，反向 `pinns-ehd.md` 增 [21][22] 并指向本课程第 7 讲，该文件 diff 仅 6 行新增、回归 0 渲染错误） |

**为什么先发第 6 讲**（沿用 PINNs 课程的理由并加强）：材料最厚（OpenAlex 71 + 231 条，MD 专属谱系完整、6 条 DOI 已 Crossref 核验），且**不依赖化学方程式**——可以最快跑通「引用格式 → 桥接写法 → build 验证」链路，同时把 mhchem 的验收压力留给真正需要它的第 8 讲。

**为什么第 1 讲放最后**：定位讲要引用后面各讲的具体结论才有分量，先写会变成空洞的绪论。`order: 1` 保证教学顺序仍是 1→8，发布顺序由 `pubDatetime` 控制。

每批次交付后运行：`npm run format` → `npm run lint` → `npm run build`，并在 dev server 浏览器中实测公式与化学式渲染。

---

## 7. 文献现状（2026-09-04/05 三路实测）

### 密度实测

| 路线 | 命中密度 | 判断 | 骨架文献 |
|---|---|---|---|
| **A 方法学主干** | OpenAlex 278（极化力场×IL）/ 47（MLIP×IL）/ 24（DFT×IL）/ 17（MD 输运×IL） | **充足** | `10.1021/acs.chemrev.8b00763`（656 引）、`10.1021/jp905220k`（679 引）、`10.1021/jp805306u`（118 引）、`10.1021/jp044414g`（275 引） |
| **B 电喷雾微推进** | OpenAlex 71（electrospray+IL+MD）/ 231（thruster+IL） | **最充足**，MD 专属谱系完整 | `10.1021/jp804585y`（105 引，FEATURE ARTICLE）、`10.1063/1.3696006`、`10.1109/tps.2014.2327913`、`10.1063/5.0307045` |
| **C IL 作燃料（ADN + HAN）** | HAN：催化分解 52 / 分解机理 52 / IL 体系 67 / MD 9 / DFT 4；ADN：MD 26 / IL 推进剂燃烧 22 / first-principles 分解 2 | **可用，但原子尺度是窄门** | HAN：`10.1016/j.susc.2016.05.005`、`10.1016/j.fuel.2026.140763`；ADN：`10.1016/j.mtcomm.2024.110974`、`10.1002/prep.201900309` |

### DOI 核验状态

**已 Crossref `/works/<DOI>` 回查通过（12 条 MATCH）**：`10.1021/jp804585y`、`10.1021/jp044414g`、`10.1021/jp068898n`、`10.1002/adts.202400458`、`10.1021/jp805306u`、`10.1063/1.5016309`、`10.1007/s44205-022-00010-1`、`10.2514/6.2015-4011`、`10.1016/j.mtcomm.2022.103699`、`10.2514/1.j064951`、`10.1021/jp056931k`、`10.1016/j.actaastro.2020.11.018`（年份取 Crossref 的 2021）。

**已剔除**：`10.7274/q524jm23h9c`（Figshare 数据集，Crossref 404）。

**已全部核验（2026-09-05，59 条逐条经 Crossref `/works/<DOI>` 回查：MATCH 59、MISMATCH 0、UNRESOLVED 0）**：`10.1016/j.susc.2016.05.005`、`10.1016/j.fuel.2026.140763`、`10.1016/j.mtcomm.2024.110974`、`10.1016/j.jcat.2025.116357`、`10.1002/prep.201900309`、`10.1063/1674-0068/31/cjcp1708161`、`10.1021/acs.jpca.8b05351`、`10.1021/acs.jpclett.7b00672`、`10.1063/1.1593011`、`10.1039/d2cp01571d`、`10.1021/acs.jpcb.3c05623`、`10.2514/1.b34584`、`10.1016/j.actaastro.2022.04.011`、`10.1007/978-3-031-62574-9_2`、`10.1007/s44205-025-00174-6`、`10.1016/j.proci.2024.105342`、`10.1063/1.1605380`、`10.1021/jp307714d`、`10.1063/1.1535439`、`10.1016/j.dt.2018.03.009`、`10.1002/prep.202300130`、`10.1016/j.cej.2023.144412`、`10.1063/1.4819903`、`10.2514/1.b34341`、`10.1021/acs.chemrev.8b00763`、`10.1021/acs.jctc.9b00689`、`10.1021/acs.jctc.0c01002`、`10.1039/c1cp21379b`、`10.1039/c4cp05550k`、`10.1021/jz5010945`、`10.1021/acs.jpcb.3c02649`、`10.2514/6.2019-4367`、`10.1021/acs.jpclett.4c01942`、`10.1016/j.xcrp.2021.100359`、`10.1063/5.0022431`、`10.1038/s41467-025-63852-x`、`10.1103/physrevlett.134.148001`、`10.1021/jp905220k`、`10.1063/1.3643124`、`10.1021/je500132u`、`10.1021/jp402092e`、`10.1063/1.3696006`、`10.1007/s44205-022-00032-9`、`10.1016/j.ijheatmasstransfer.2021.121983`、`10.1109/tps.2014.2327913`、`10.1063/5.0307045`、`10.21236/ada522002`。

**核验产物（实际文件，spec 内所有指向以此为准）**：

- `docs/paper/track-md-dft-verified.json` —— Crossref 解析状态、返回标题与 spec 断言的重叠度比对结果、`type` 字段。
- `docs/paper/track-md-dft-authors.json` —— 每条的权威作者数组、标题、venue、**Crossref 年份**、卷、页、`type`，以及一行现成文献 `reference_line`。这是全部讲义文献表的唯一数据来源。
- `docs/paper/track-md-dft.md` —— 59 条应用文献的核验表。
- `docs/paper/track-md-dft-foundational.md` —— 18 类奠基文献的核验结果与九处误配纠正。
- **`cite.py`** —— 防编造机制的执行者。`python cite.py verify` 逐条回查八讲文献表里的全部 DOI（含「标题词是否真的出现在条目里」的反向比对，可抓出错配 DOI）；`python cite.py emit <doi> …` 从 Crossref 元数据打印 house-style 文献行。

> [!WARNING]
> **流程纪律：参考文献条目一律由 `cite.py` 从 Crossref 元数据产出（`emit` / `verify`），禁止手敲作者。** 本课程起草阶段两次凭记忆写作者名，两次全错：第 6 讲初稿把 `10.1063/1.3696006` 的作者写成「Juan J. Iglesias 等」（实为 Borner, Li, Levin），把 `10.1021/jp402092e` 写成「Daniel A. Fike 等」（同上），把 `10.1016/j.ijheatmasstransfer.2021.121983` 的标题写成 "microscopic parameters"（实为 "mixed ionic liquids"）；第 1 讲初稿又把 `10.1016/j.fuel.2026.140763` 与 `10.1007/s44205-025-00174-6` 的作者写成并不存在的人名。第 4 讲另有一类错法：把 AMOEBA 的 DOI 写成去掉加号的 `10.1021/jp0278152` 并自称「加号是注册残留」——实测该串是 **404 死链**，正确的 `10.1021/jp027815+` 末尾加号属于 DOI 本身。**作者名与 DOI 都不可以凭记忆或"规范化"改写，一律以能解析的记录为准。**

**按 Crossref 更正的年份（覆盖 OpenAlex 与 spec 初稿）**：

| DOI | 初值 | **Crossref 权威值** |
| --- | --- | --- |
| `10.1016/j.actaastro.2020.11.018` | 2020 | **2021** |
| `10.1109/tps.2014.2327913` | 2014 | **2015** |
| `10.1016/j.ijheatmasstransfer.2021.121983` | 2021 | **2022** |
| `10.2514/1.b34584` | 2012 | **2013** |
| `10.1016/j.fuel.2026.140763` | 2026 | **2027**（DOI 前缀年 ≠ 出版年，卷 429 为 2027） |
| `10.1021/acs.jpcb.3c05623` | 2024 | 2024 |

**文献类型判定（来自 Crossref `type`）**：`10.21236/ada522002` → `report`，按 `[技术报告]` 标注且正文说明非同行评审；`10.2514/6.2015-4011`、`10.2514/6.2019-4367` → `proceedings-article`；`10.1007/978-3-031-62574-9_2` → `book-chapter`。三者均可作为正式出处，但须在参考文献里显式标出类型。

**奠基文献：已全部补齐（2026-09-05）。** 原列 18 类共 27 条主文献（含 4 条 arXiv 预印本）已逐条经 Crossref 或 arXiv API 回查，完整清单见 `docs/paper/track-md-dft.md`「奠基文献补全（18 类）」小节。**其中原 spec 的四个猜测被证伪，写讲义时不得采用：**

| 原猜测 | 结论 | 应改用 |
|---|---|---|
| Harris 2013 *Phys. Rev. Lett.*「Ionic Liquids: Molecular Diffusion, Ionicity and Einstein Relation」 | **Crossref 与 OpenAlex 均无此文** | K. R. Harris, *J. Phys. Chem. B* **2010**, `10.1021/jp102687r` |
| de la Mora ~1996–2000 *JASMS* / Lozano & de la Mora 2005 | **检索不到对应文献** | Garoz, Bueno, Larriba, Castro, Romero-Sanz, Fernandez de la Mora, *J. Appl. Phys.* **2007**, `10.1063/1.2783769`（RTIL Taylor 锥发射纯离子的最早可核验期刊论文） |
| Cubuk et al. 2015 *PNAS*（Green–Kubo 黏度） | **不存在**；`arXiv:1503.04367` 实为 noise-resolution duality 论文，与本主题无关 | B. Hess, *J. Chem. Phys.* **2002**, `10.1063/1.1421362`（黏度 GK 方法学）；R. Kubo, *J. Phys. Soc. Japan* **1957**, `10.1143/JPSJ.12.570`（GK 关系原始出处） |
| Gañán-Calvo 1991 *J. Fluid Mech.* | **无该卷期匹配文** | Gañán-Calvo, Dávila, Barrero, *J. Aerosol Sci.* **1997**, `10.1016/s0021-8502(96)00433-8`；或 Gañán-Calvo, *Phys. Rev. Lett.* **1997**, `10.1103/physrevlett.79.217`（分析解） |

另两处**年份须按 Crossref 更正**（`DOI 串内嵌的年份一律不作判年依据`，此处再得一证）：

- Lemkul 等的 Drude 极化力场综述：spec 原写 **2013**，Crossref `issued` 为 **2016**（*Chem. Rev.* 116(9) 4983–5013，`10.1021/acs.chemrev.5b00505`；串里的 `5b00505` 是文章号）。
- Hoover 恒温器：spec 原猜 *J. Appl. Phys.*，实为 **Phys. Rev. A 1985**, `10.1103/physreva.31.1695`。

一处 **DOI 串判定**（本条已用实测推翻早前结论，勿再改回）：Ren & Ponder 的 AMOEBA 原始文献，注册标识符就是末尾带加号的 **`10.1021/jp027815+`**。实测两种形态：

| 写法 | Crossref API | doi.org | 判定 |
| --- | --- | --- | --- |
| `10.1021/jp027815+` | **200**，返回 Ren & Ponder 2003 记录 | **403** | 真实标识符。百分号编码后的 `%2B` 正是接口接受的形式；403 说明 DOI **解析成功**、是 ACS 拦截非浏览器请求 |
| `10.1021/jp0278152` | **404** | **404** | **不存在**。早前 spec 与第 4 讲一度把它当作「规范串」，实为死链，已纠正 |

**判读纪律：404 = 标识符不存在；403 = 标识符有效但目标站点拒绝爬虫。两者不可混为一谈，也不能因为 403 就改用另一个串。**

### 检索方法论教训（必须遵守，避免重犯）

1. **OpenAlex `title_and_abstract.search` 多词是窄 AND，会造成假零命中。** 实测 `ReaxFF energetic ionic liquid decomposition` → **0 条**、`ionic liquid propellant combustion reactive molecular dynamics` → **0 条**、`charged nanodroplet field evaporation molecular dynamics ionic liquid` → **1 条无关**；但换成 2–3 词的 `ammonium dinitramide molecular dynamics` → **26 条**（含反应性 MD 与 AIMD 真命中）。**0 命中不等于文献不存在，必须先用宽口径复核。** 本课第一版结论「C 路偏薄须降级」正是被这个假零命中误导，已更正。
2. **Giiisp OA 多词查询会退化成单词噪声。** 实测 `["hypergolic","density functional theory"]` 的 top 命中全是《Density Functional Theory》《A Primer in Density Functional Theory》这类泛条目（score ~44）；`["energetic ionic liquid","quantum molecular dynamics"]` 同样退化。**判据：score ≳ 47 且标题具体到体系才算真命中；score 40–45 区间基本是退化噪声。**
3. **Giiisp `score` 是检索相似度分，不是相关性分**（PINNs 课程已记录同一教训），**不得用于排序取舍**。
4. **arXiv 对本主题近乎无用。** 实测 `searchArxivByAbstract` 查 electrospray/IL/MLIP 返回暗物质暴胀、量子隐形传态等完全无关条目；`searchArxivByTitle` 查 IL electrospray MD 返回**空数组**。**本课程文献主源是 OpenAlex + Crossref + Giiisp OA，不是 arXiv**——与 PINNs 课程正好相反。
5. **Giiisp 接口无需 token 即可调用**（`GIIISP_AUTH_TOKEN` 未设置仍返回 HTTP 200 与真实数据）。
6. **Giiisp 响应可能含非法 UTF-8 字节**，解码须用 `errors="replace"`，否则首个查询就抛 `UnicodeDecodeError` 中断整轮。
7. **Windows 控制台是 GBK 编码**，print 含非 ASCII 的标题会抛 `UnicodeEncodeError`；跑脚本须设 `PYTHONIOENCODING=utf-8`。
8. **数据集 DOI 会混进检索结果**（Figshare、eScholarship、Digital Commons、DTIC）。判定方法：Crossref `/works/<DOI>` 回查，404 即为非期刊注册。

---

## 8. 验收标准（全课程）

- [x] 批次 0 完成：`\ce{}` 按 §2 验收清单全部通过。实测记录见 §2「批次 0 执行记录」——0 个 `.katex-error`、48 处 `data-pagefind-ignore`、浅色 14.63:1 / 深色 12.7:1、深色下独立公式与正文色逐位相同、`aligned` 内化学式与物理公式混排成功、12 个字体请求全 200 且带 base 前缀、控制台零报错、Pagefind 对照测试证明化学式源码不被索引而正文可被索引。测试草稿已删除。
- [x] 课程页 + 8 讲全部创建，frontmatter 字段完整，`course: md-dft-ionic-liquid` 与 `order: 1..8` 正确，课程页按讲次排序。**实测**：课程页列出 order 1–8 共 8 讲；8 讲的 frontmatter、标签、标题格式、公式讲号、悬空引用经检查器逐项核验为 0 问题。**过程中抓到一类隐性故障**：两次有写作者把 `pubDatetime` 改到未来时刻（第 8 讲 `09-06T02:00Z`、第 4 讲 `T20:00Z`），页面构建成功但被站点整页过滤，表现为「课程页只列出 7 讲」且构建零报错——已统一固定到 `2026-09-05T01:00Z–08:00Z` 按 §6 发布顺序排列，并把「pubDatetime 不得晚于当前时刻」加入检查器作为永久闸门。
- [x] 每讲所有符号有定义；每个化学方程式用 `\ce{}` 且配平；三种 MD（classical / AIMD / reactive）全课程不混用。**实测**：全课程 133 处 `\ce{}`，8 个构建页面合计 **0 个 `katex-error`**；`\ce` 内无 `&`、无嵌套（构建期 KaTeX 严格模式警告已清零，其中一处裸 `Å` 在数学模式内已改为 `\text{Å}`）；术语检查无「QMD 被当作量子动力学」「AIMD 被当作经验力场」的混用，第 1、2、4 讲均显式给出三态区分表；第 8 讲 12 个反应式的原子与电荷守恒经程序逐式校验通过。
- [x] 第 6、7、8 讲的桥接一节均给出**具体量级数字**。**实测计数**（段内数字标记 / `\mathrm{}` 工程单位）：第 6 讲「从 $\gamma$、$\sigma$、$\eta$ 到电流、液滴直径与比冲」112 / 47；第 7 讲「桥接到推力器性能」37 / 23；第 8 讲「DFT 侧：表面催化分解与本讲的桥接链条」118 / 44。三段均给出可核验的链条与量级，非「可以代入标度律」式空话。
- [x] 每讲关键论断带 `[n]` 引用，文末参考文献格式统一；技术报告标注 `[技术报告]`；数据集 DOI 未进编号序列。**实测**：8 讲引用编号按首次出现严格单调、无悬空无未引；`10.21236/ada522002` 在页面文本中带 `[技术报告]` 标注；被禁的 Figshare 数据集 DOI `10.7274/q524jm23h9c` 在全部讲义中不存在。
- [x] **无编造 DOI**。八讲共 **104 个不同 DOI** 于 2026-09-05 逐条经 Crossref `/works/<DOI>` 回查，`python cite.py verify` 结果 **0 未解析、0 标题不符**；应用文献核验表见 `docs/paper/track-md-dft.md`，权威作者/卷页/年份缓存见 `docs/paper/track-md-dft-authors.json`。**已剔除**：`10.7274/q524jm23h9c`（Figshare 数据集，Crossref 404）。**已按 Crossref 更正**：`10.1016/j.actaastro.2020.11.018` 取 2021（OpenAlex 记 2020）、`10.2514/1.b34584` 取 2013（spec 初稿误记 2012）。`10.21236/ada522002` 的 Crossref `type=report` 且无 venue，确认按 `[技术报告]` 标注；`10.1007/978-3-031-62574-9_2` 为 `book-chapter`、`10.2514/6.*` 为 `proceedings-article`，均可作为正式出处。
- [x] 第 7 讲的文献集中度（AIMD 碎裂、EHD–PIC 各仅 1 条）与第 8 讲 hypergolic 一节的文献稀薄均已显式声明，未伪装为学界共识。**实测**：第 6、7 讲含团队集中度声明与文献稀薄说明，第 8 讲含独立「诚实声明」节并标注 `[技术报告]`，第 5 讲含稀薄说明；第 7 讲页面文本中「集中度」命中。
- [x] 双向交叉引用完成。**实测**：本课程→PINNs 三处完整 URL（第 5 讲→`pinns-variants-taxonomy`、第 7 讲→`pinns-ehd`、第 8 讲→`pinns-combustion`）；反向 `pinns-ehd.md` 已增补 [21][22] 两条并加指向本课程第 7 讲的段落，构建产物中三条标识符与链接均存在。全课程**无一处以 `/` 开头的站内链接**（AGENTS.md 的 base 前缀陷阱已程序化检查），讲间引用改用纯文本「第 N 讲」以避免断链。
- [x] 改动 `pinns-ehd.md` 后，该页公式渲染经浏览器实测未被改坏。**实测**：HTTP 200，366 个 `.katex`、**0 个 `katex-error`**，新增的两条 DOI 与指向新课的链接都在页面上；`git diff` 确认该文件仅 6 行新增、无任何既有内容被改动。
- [x] `npm run format`、`npm run lint`、`npm run build` 全部通过（含 `astro check` 与 Pagefind 索引）。**实测**：format 退出 0、eslint 无输出、`astro check` 0 error、44 页构建、Pagefind 索引 18 页。
- [x] 浏览器实测：公式与化学式渲染、表格内公式、课程页讲次列表、浅色/深色配色正常。**实测**：第 7 讲 302 个 `.katex` / 0 错误 / 对比度 14.63:1 / 表格内 37 处 / callout 内 18 处 / 可见文本零 `\ce` 泄漏；第 8 讲 215 个 `.katex` / 0 错误 / 深色 12.7:1、浅色 14.63:1 / 表格内 24 处 / callout 内 8 处 / 27 个反应箭头与 4 个可逆箭头渲染 / 技术报告标注在位 / 被禁数据集 DOI 不在。Pagefind 不索引公式与化学式源码（批次 0 对照法已证）。
  > **本项的两点如实局限**：(1) 第 6 讲及其余各讲未做逐页双主题浏览器截图，由「8 个构建页面合计 0 个 `katex-error`」加页面可达性覆盖；(2) 原清单所列「目录」子项**不适用**——见下条。
- [!] **发现（非本课缺陷，转 §10 决策）**：两门课的**所有**讲义都没有目录。构建产物中 `pinns-ehd`、`pinns-combustion` 与新课程的 8 讲的 `<details>` 计数均为 0。原因是模板的 `remarkToc` + `remarkCollapse` 已配置，但没有任何文章含 `## Table of contents` 标题去触发它们。因此 spec §8 原写作「目录正常」的子项实际是空验收项，已改为如实记录；是否为长讲义启用目录属跨两门课的一致性决策，不单独在本课一侧改动。

---

## 9. 已确认的决定

以下 14 项在三轮对话与实施期中确认（2026-09-04/05），实施时不再重新讨论；如需推翻，先改本节再改正文。

1. **电喷雾的范围 = 离子液体电喷雾微推进。** 不是 ESI 质谱、不是电喷雾沉积制膜、不是雾化燃烧。检索词固定用 electrospray thruster / propellant / ion emission。
2. **催化燃烧部分，离子液体的角色 = 燃料/推进剂本身。** 明确排除「IL 作催化剂/载体」与「IL 作反应介质/氧载体」两个角色（前者 OpenAlex 有 101 条但全部离题）。
3. **C 路在 ADN 基础上增加 HAN。** 用户指定。实测 HAN 的原子尺度文献比 ADN 更厚（尤其 `10.1016/j.susc.2016.05.005` 的表面 DFT 与 `10.1016/j.fuel.2026.140763` 的 ReaxFF），故第 8 讲以 HAN 为主、ADN 为辅。
4. **课程结构 = 方法主干型。** 对齐 PINNs 课程骨架：方法学主干在前，应用讲在后且可跳读。
5. **扩展内容只加机器学习势函数一讲。** 明确不加独立的软件栈/实操讲，不加独立的桥接讲，不加与 continuum/实验对照的独立讲。
6. **桥接内容折进三个应用讲**（第 6、7、8 讲各一节），不单独成讲。
7. **8 讲，电喷雾拆两讲。** 第 6 讲锥射流与场蒸发的分子图像，第 7 讲发射器表面、AIMD 碎裂与尺度耦合。拆分依据：B 路材料最厚（71 + 231 条），拆得开。
8. **读者前置 = 研究生水平，直接上公式。** 不补量子力学与统计力学基础，KS 方程与系综配分函数直接给出。与 PINNs 课程定位一致。
9. **课程 slug = `md-dft-ionic-liquid`**，标题「分子动力学与第一性原理：离子液体工质的电喷雾与绿色推进」。与 PINNs 课程标题句式成对。
10. **DTIC 技术报告可以引，但须标注文献类型。** `10.21236/ada522002` 是 hypergolic IL 的 QMD 唯一直接文献，无期刊版；按 §3 标注 `[技术报告]`。
11. **与 PINNs 课程双向交叉引用。** 需改动已发布的 `pinns-ehd.md`，属已发布内容变更，须单独提交并跑回归。
12. **标签体系 = 方法 + 物质 + 应用三组。** 方法组 `分子动力学`/`第一性原理`/`机器学习势函数`，物质组 `离子液体`，应用组 `微推进`/`绿色推进剂`。逐讲分配见 §3。
13. **第 8 讲篇幅与参考文献放宽。** 参考文献上限放宽到 25 条（§1 通用上限为 20），篇幅上限放宽到 5500 中文字（PINNs 课程曾为第 6、7 讲放宽到 5000）。**放宽不等于堆砌**：综述只保 2 篇，实验类文献仅在论断确实需要实验对照时保留。

14. **第 7 讲篇幅放宽到 6200 中文字（实施期新增，可推翻）。** 成稿实测 6162 字。原因是 §5 对该讲同时要求六个必答覆盖项与四条强制披露：MD–Poisson 的三条界面条件必须逐条写全（§5 验收明令「不能只说耦合」）、$\pm0.8e$ 在强场下失效需给独立论证、AIMD 碎裂与 EHD–PIC 两处各只有 1 条低引文献因而必须各自作集中度声明、桥接一节必须给出可复算的推力/比冲/功率量级账。这些内容在 4500 字内无法共存。**若推翻本条**，代价是二选一：砍掉界面条件的逐条展开（伤 §5 验收），或砍掉集中度声明（伤 §3 的诚实性要求）——两者都比超字数更糟。第 6 讲不受影响，仍在 4500 内。
    **成稿篇幅台账（中文字，实测）：** 第 1 讲 3416 ✓｜第 2 讲 4483 ✓｜第 3 讲 4601（超 4500 共 101 字，2.2%——系把 Nernst–Einstein 幅度从早期未经核验的「30–60%」统一改写为与该讲离子有效分数表自洽的「四成到一倍」所引入的增量，**已知且刻意保留**，不为此砍物理内容）｜第 4 讲 4478 ✓｜第 5 讲 3909 ✓｜第 6 讲 4297 ✓｜第 7 讲 6162 ✓（按本条放宽）｜第 8 讲 4456 ✓（按第 13 条放宽到 5500）

## 10. 未决问题

1. **第 8 讲是否仍然过载。** ADN + HAN + hypergolic + 多模式缝合四块内容，即使放宽到 5500 字与 25 条文献仍可能挤。备选方案：把 hypergolic 一节（文献最薄，仅 2 条）压缩为第 4 节末尾的一个小节而非独立节，把篇幅让给 HAN 表面 DFT 与 ReaxFF 这两块最有货的。**建议在批次 3 开写前再评估一次，不要现在拍。**
2. **是否需要一张多尺度链条图。** 第 1 讲的核心产物是尺度链条，PINNs 课程全程无图、用表格表达。建议沿用无图约定（表格已足够），但若用户希望有图，需先解决站点的图片资源约定（`public/` 路径 + base 前缀）与配图生成方式——这是一项独立的前置工作，会推迟批次 4。
3. ~~**奠基文献补全的工作量。**~~ **已关闭（2026-09-05）**：18 类全部拿到经回查的标识符，见 §7 奠基文献小节。这轮检索同时证伪了原类清单的九处误配（含两个会指向他人论文的假标识符），逐条记录在 §7 的 WARNING 里。
4. **PINNs 课程尚有未推送提交。** 本地 `main` 领先 `origin/main`。推送属对外可见操作，**需用户确认，不自动执行**。
5. **并行写作者的后期回改风险（本次实施中实际发生）。** 多个写作者在各自报告「已完成」之后仍有后期回合在改动讲义与 spec，造成两类回退：
   - 反复把已修正的文件恢复成旧版（本课程第 3、4、6 讲的修正被撤销过至少三轮）。**后果是同一处缺陷被修好又被放回**，肉眼看不出，只有重跑校验才暴露。
   - 一度把 `pubDatetime` 排到未来时刻。是否会导致整页不渲染**未经证实**（本仓库实测时八讲在课程页齐全），但把发布日期排在站点当前时间之后本身就不可取，已统一收敛到 2026-09-05 序列（第 6 讲最早，故先发）。
   - **一处被写反、且会持续诱发死链的结论已按实测纠正**：Ren & Ponder 的 AMOEBA 原始文献，其注册 DOI 是末尾带加号的 **`10.1021/jp027815+`**。实测对照：该串在 Crossref 返回 **200**（解析到正确记录），在 doi.org 返回 **403**（说明解析成功，是 ACS 拦截非浏览器请求）；而被当作「规范串」的 `10.1021/jp0278152` 在**两个接口都返回 404**，根本不存在。「加号会被转义成 `%2B` 因而解析失败」的说法不成立——百分号编码后的形式正是接口接受的形式。**判读纪律：404 = 标识符不存在；403 = 标识符有效但出版社拒绝爬虫。不得因 403 改串。** 详见 §7 的判定表。

   **处置**：终态已与提交态对齐。**后续任何再改动本课程的自动化流程，交付前必须重跑两项检查**——`python cite.py verify`（逐条回查全部 DOI，双向比对标题）与成稿字数台账（见 §9.14）——否则 §7 那套检索方法论的教训会被运维层面的回改抵消掉。
