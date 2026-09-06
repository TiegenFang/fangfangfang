---
author: Tiegen Fang
pubDatetime: 2026-09-05T05:00:00Z
title: 第 5 讲：机器学习势函数——用 DFT 精度跑 MD 尺度
description: 机器学习势函数如何在 DFT 精度与 MD 尺度之间两头兼得，离子液体特有的两个硬问题（过渡态构型不在平衡训练集里、局部描述符表达不了长程库仑），以及外推检测与主动学习。
course: md-dft-ionic-liquid
order: 5
tags:
  - 机器学习势函数
  - 离子液体
draft: false
---

AIMD 的势能面质量够好，但一把只到几百个原子、几皮秒；classical MD 的尺度够大，但势能面好不好完全取决于第 4 讲那套经验参数。机器学习势函数（machine learning interatomic potential, MLIP）的野心是**同时拿到这两头的性质**：用 DFT 数据训练一个足够有表达力的函数形式，然后在 MD 里以接近经典力场的成本评估它。这一讲说清它凭什么做得到、代价换在哪里，以及离子液体特有的两个硬问题。

## Table of contents

## 1 成本–精度定位：MLIP 站在哪

下表的数量级是本课程的估计，用来定位而不是用来比较论文；具体倍率强烈依赖实现与体系。

| 方法                       | 势能来源                | 键能否断裂         | 典型体系规模                | 典型时间尺度                          | 单步相对成本           |
| -------------------------- | ----------------------- | ------------------ | --------------------------- | ------------------------------------- | ---------------------- |
| 团簇 DFT（第 2 讲）        | 电子结构                | 可以               | $10\text{–}100$ 原子        | 无动力学                              | $10^{3}\text{–}10^{5}$ |
| AIMD                       | 每步解 Kohn–Sham        | 可以               | $10^2\text{–}10^3$ 原子     | $1\text{–}50\ \mathrm{ps}$            | $10^{3}\text{–}10^{4}$ |
| ReaxFF（reactive MD）      | 键级经验势 + 电荷均衡   | **可以**           | $10^{4}\text{–}10^{5}$ 原子 | $100\ \mathrm{ps}\text{–}\mathrm{ns}$ | $10^{1}\text{–}10^{2}$ |
| classical MD（第 3、4 讲） | 固定电荷/极化经验力场   | 不可以             | $10^{5}\text{–}10^{7}$ 原子 | $\mathrm{ns}\text{–}\mu\mathrm{s}$    | 1                      |
| **MLIP**                   | 从 DFT 数据学到的势能面 | **取决于训练数据** | $10^{3}\text{–}10^{5}$ 原子 | $\mathrm{ns}\text{–}\mu\mathrm{s}$    | $10^{0}\text{–}10^{2}$ |

两点必须提前钉牢。第一，**MLIP 不自动是反应性的**：没有反应路径上的训练数据，它和固定拓扑的经典力场一样断不了键。第二，谱系是连续的——第 4 讲式 (4.5) 的 force matching 已经给出"用 DFT 的力当训练标签"这套模板 [1]，MLIP 保留数据侧、只换掉函数形式。所以本讲与第 4 讲的真正分界线只有一条：**函数形式由谁决定。**

## 2 基本构造：原子分解加对称性约束

所有现代 MLIP 都建立在同一个分解上：

$$
E = \sum_{i=1}^{N_{\text{atom}}} \varepsilon_i(\mathbf d_i),
\qquad
\mathbf d_i = \mathcal D\big(\{\mathbf r_j : r_{ij} < r_c\}\big)
\tag{5.1}
$$

$E$ 总势能（$\mathrm{eV}$ 或 $\mathrm{kcal\,mol^{-1}}$）；$\varepsilon_i$ 第 $i$ 个原子的**原子化能量贡献**（同上单位），由一个小网络给出；$\mathbf d_i$ 原子 $i$ 的**局部环境描述符**（无量纲或 $\text{Å}^{-n}$，取决于定义）；$\mathcal D$ 描述符构造算子；$r_c$ 截断半径（$\text{Å}$，典型 $5\text{–}10\ \text{Å}$）；$N_{\text{atom}}$ 原子数。力由自动微分给出，$\mathbf F_i = -\partial E/\partial \mathbf r_i$（$\mathrm{eV\,\text{Å}^{-1}}$）。

式 (5.1) 立刻引出对称性要求。势能是标量，所以对任意旋转 $R$ 与平移 $\mathbf t$ 必须满足

$$
E(R\Omega + \mathbf t) = E(\Omega)
\qquad\Longrightarrow\qquad
\mathbf F_i(R\Omega) = R\,\mathbf F_i(\Omega)
\tag{5.2}
$$

$\Omega$ 表示一组原子构型。**左边的不变性是设计要求，右边的矢量等变性是它的自动推论**——只要能量真的写成旋转不变量并用自动微分求力，力的变换性质就无需额外约束。这一条是"不变性能量 + 梯度给力"架构优于"直接回归每个力分量"架构的根本原因，也是力标签能省下大量训练数据的几何原因（式 (5.4) 与第 3 节）。

实现上分两代。第一代把 $\mathbf d_i$ 显式写成人设计的对称函数（Behler–Parrinello 型原子描述符 [2]），标量、便宜、但表达力受人工函数族限制。第二代用**消息传递**在图上学习 $\mathbf d_i$：

$$
\mathbf h_i^{\,(l+1)} = \mathbf h_i^{\,(l)} + \sum_{j\in\mathcal N(i)} f^{(l)}\!\left(\mathbf h_i^{\,(l)},\,\mathbf h_j^{\,(l)},\,\phi_{ij}\right),
\qquad
\phi_{ij} \;\xrightarrow{\;R\;}\; \mathrm D^{(l)}(R)\,\phi_{ij}
\tag{5.3}
$$

$\mathbf h_i^{(l)}$ 第 $l$ 层节点特征；$\mathcal N(i)$ 截断半径内的邻居集合；$f^{(l)}$ 可学习的更新函数；$\phi_{ij}$ 边特征（球谐张量，阶 $l$）；$\mathrm D^{(l)}(R)$ 是旋转 $R$ 的 $l$ 阶 Wigner-D 表示矩阵（无量纲）。式 (5.3) 第二式就是**等变性**的定义：特征按不可约表示基变换，而不是被强行压成不变量。代价是保留 $m$ 分量带来的额外计算与内存。

| 架构家族                | 对称性处理                 | 代表                                                            |
| ----------------------- | -------------------------- | --------------------------------------------------------------- |
| 人工对称函数 + 神经网络 | 不变（人设计的标量描述符） | Behler–Parrinello [2]、GAP/sGDML 一系（核势，本讲不引具体文献） |
| 图消息传递，标量特征    | 不变（学出的标量描述符）   | SchNet [3]、ANI [4]                                             |
| 原子对分布矩阵表示      | 不变（以原子对为基）       | DeepMD 一系 [5]                                                 |
| 高阶等变消息传递        | **等变（球谐张量特征）**   | MACE [6]                                                        |

> [!WARNING]
> **检索用词必须按本领域的索引习惯。** 离子液体文献里这条技术线被登记为 **equivariant machine learning interatomic potentials** 或 **neural-network interatomic potential**，**不是按框架品牌名索引的**。实测以「具体框架名 + ionic liquid」组合检索会零命中，而用「machine learning interatomic potential + ionic liquid」才有结果——本讲第 4 节核心文献的标题用的正是这个用词。本讲因此以**方法类别**为叙事主线；上表只是给读者一张"这些品牌是什么关系"的地图，不要把它当作检索词表。

## 3 训练目标：力标签为什么比能量标签重要得多

$$
\mathcal L = w_E\left|E-E^{*}\right|^{2} + w_F\left\|\mathbf F-\mathbf F^{*}\right\|^{2} + w_S\left\|\boldsymbol\sigma-\boldsymbol\sigma^{*}\right\|^{2}
\tag{5.4}
$$

$E$、$E^{*}$ 预测能与 DFT 参考能（$\mathrm{eV}$）；$\mathbf F$、$\mathbf F^{*}$ 预测力与 DFT 的 Hellmann–Feynman 力（$\mathrm{eV\,\text{Å}^{-1}}$），$\lVert\cdot\rVert$ 对全部 $3N_{\text{atom}}$ 个分量求和；$\boldsymbol\sigma$、$\boldsymbol\sigma^{*}$ 预测与参考的应力张量（$\mathrm{eV\,\text{Å}^{-3}}$，换算 $1\ \mathrm{eV\,\text{Å}^{-3}} = 160.2\ \mathrm{GPa}$）；$w_E,w_F,w_S$ 权重（需按单位配平，实践中用能量/原子与力/分量的 RMSE 分别监控而不是只看 $\mathcal L$）。上标 $*$ 一律指 DFT 标签。

"力比能量重要"有三层论证，一层比一层硬：

1. **信息量。** 一个构型给 1 个能量数、给 $3N_{\text{atom}}$ 个力分量。一个 64 对 $\ce{[emim][BF4]}$（文献亦作 EMI-BF4）的盒子里，阳离子 $\ce{[C6H11N2]+}$ 占 19 个原子、阴离子 $\ce{[BF4]-}$ 占 5 个，即每对 24 个原子，$N_{\text{atom}} = 1536$——1 个能量标签对 4608 个力分量。
2. **动力学感受的是梯度。** MD 的轨迹由 $\nabla E$ 决定。一个能量上 RMSE 为 $\delta E$ 的势，若这个误差被摊在特征位移 $\delta R$ 上，等效的力误差量级就是 $\delta E/\delta R$。取 $\delta E = 1\ \mathrm{kcal\,mol^{-1}}$、$\delta R = 0.05\ \text{Å}$，得到 $20\ \mathrm{kcal\,mol^{-1}\,\text{Å}^{-1}}$ 的等效力误差——这在势能面上是灾难性的。成熟 MLIP 的实际指标因此必须按原子摊薄：每原子能量 RMSE 约 $1\text{–}5\ \mathrm{meV}$、力 RMSE 约 $20\text{–}60\ \mathrm{meV\,\text{Å}^{-1}}$ 才算可用。
3. **只训能量会让势能面在训练点之间变得极不平滑。** 能量标签对梯度的约束几乎是零信息量，插值出来的曲面会振荡；MD 一旦走到振荡区，能量守恒立刻破掉。应力项 $w_S$ 则管密度与状态方程——不训它，液相密度会漂，而密度直接进第 6 讲的标度律。

数据集要覆盖的构型空间因此是**显式设计对象**：多温度（至少两个温度的 AIMD 轨迹）、多密度（拉伸/压缩形变）、多组成（若最终要模拟混合物）、以及构象多样性（烷基链的顺反构象、离子对的配位几何）。只从单一 300 K 短 AIMD 轨迹采样的势，其可靠区间就只有那个温度的那个密度附近。

## 4 离子液体上的迁移性：本讲核心

熔盐与离子液体的 MLIP 工作已经给出可用的正面证据，但结论要点是**迁移性而非架构**：

- 熔盐体系上已有专门构造"稳健"神经网络势的工作，用覆盖宽温度区间的 DFT 数据训练，把 NN 势推到常规 MD 尺度上去复现液相结构、密度与自扩散 [7]。这条线的意义在于证明**纯离子/强库仑体系并不是 MLIP 的禁区**。
- 离子液体上等变 MLIP 的系统检验把"架构精度"与"迁移性"分开评估 [8]。要点是：**架构不是瓶颈，训练集的构型覆盖才是。** 在训练分布内，等变 MLIP 能给出与 AIMD 一致量级的受力与结构；一旦把温度、密度或离子种类推到训练集之外，误差是迅速放大而不是平缓退化。
- 温度迁移性有专门的负面证据与解法：在单一温度训练的有效模型到其他温度会系统性失效，图神经网络路线的处理办法是把温度作为显式输入、学自由能面而非势能面 [9]。对全原子 MLIP，等价的做法是多温度训练集。**用 350 K 训练的势跑 450 K 的 IL，密度与扩散会同时偏掉，而且内部一致性检查发现不了。**

| 训练集要素 | 必须覆盖什么                          | 不覆盖的后果                                   |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| 温度       | 目标温度上下各至少一档 AIMD           | 密度/扩散整体漂移（式 (5.4) 无应力项时更严重） |
| 密度与形变 | 拉伸、剪切、压缩                      | 状态方程与弹性响应失真；表面张力不可信         |
| 组成       | 每种离子对、共溶剂（水/醇）单独与混合 | 混合物发射行为外推失控（第 6、7 讲）           |
| 构象       | 烷基链顺反、配位几何的所有基态        | RDF 次级峰与纳米空区结构错                     |
| 反应坐标   | 见第 5 节，必须专门采样               | 断键与质子转移完全不可用                       |

## 5 外推检测与主动学习

MLIP 的可靠性检查不靠人眼看，靠**模型分歧**：

$$
u_i = \left[\frac{1}{M-1}\sum_{m=1}^{M}\left\|\mathbf F_i^{(m)}-\bar{\mathbf F}_i\right\|^{2}\right]^{1/2},
\qquad \bar{\mathbf F}_i = \frac{1}{M}\sum_{m=1}^{M}\mathbf F_i^{(m)}
\tag{5.5}
$$

$u_i$ 原子 $i$ 的**力不确定性**（$\mathrm{eV\,\text{Å}^{-1}}$），$M$ 是集成成员数（不同初始化或不同训练子集，$M\sim5\text{–}20$），$\bar{\mathbf F}_i$ 集成平均力。$u_i$ 超过阈值（相对训练力 RMSE 的若干倍）就触发一次 DFT 打标并把新构型加回训练集——这就是主动学习闭环：

```
D0 ← 覆盖目标温度/密度的初始 AIMD 构型
repeat
  训练 M 个势 {V_m} on D_t
  用集成跑 MD，记录 u_i（式 5.5）
  挑出 u_i 最大的 N 个片段
  D_t+1 ← D_t ∪ DFT 单点(能量, 力, 应力) on 这些片段
until 验证集力 RMSE 收敛 且 外推率 < 阈值
```

（这是伪代码，不是任何软件的可运行输入。）

> [!WARNING]
> **离子液体的第一个特殊困难：分解反应的过渡态构型在平衡态训练集中根本不存在。** AIMD 在 300–400 K 跑几十万步也不会自己越过 $\ce{N-O}$ 断裂或质子转移的势垒，因此这些区域零训练数据、$u_i$ 又只能在已访过的构型上算——外推检测在"从未去过"的地方是瞎的。反应性 MLIP 必须**专门采样反应路径**：约束几何扫描、NEB / climbing-image、元动力学偏置采样，或高温短时 AIMD 事后筛选。**这正是第 4 讲 ReaxFF 训练集覆盖度问题 [10] 的原样搬迁**，换了参数化方法并不会消失。

## 6 长程静电与电荷：局部描述符装不下纯库仑体系

第二个特殊困难更结构性。离子液体没有中性溶剂把电场屏蔽掉，静电能是一个跨越整个模拟盒的**集体量**：一个离子感受到的势由所有反离子共同决定，且 Ewald 求和的收敛方式本身依赖边界条件（第 3 讲）。而式 (5.1) 的 $\mathbf d_i$ 只看 $r_c < 10\ \text{Å}$ 的邻居——两个局部环境相同、远处荷电分布不同的构型，在描述符层面**完全无法区分**。后果不是平均误差变大，而是**表面、界面与有限尺寸体系（正是第 6 讲的纳米液滴）上误差最大**，以及偶极/电荷涨落的长波部分被整段丢掉。

常见处理是在能量里显式做长短程分裂，把长程交给一个电荷模型：

$$
E = E^{\text{MLIP}}_{\text{SR}}\big(\{\mathbf d_i\}\big)
  + \sum_{i<j}\frac{q_i q_j\,\mathrm{erf}(\kappa r_{ij})}{4\pi\varepsilon_0 r_{ij}}
  + E_{\text{self}} + E_{\text{recip}}
\tag{5.6}
$$

$E^{\text{MLIP}}_{\text{SR}}$ 网络给出的短程能（$\mathrm{eV}$，隐含 $\mathrm{erfc}(\kappa r)$ 部分的库仑与全部交换/色散）；$\kappa$ 长短程分离参数（$\mathrm{\text{Å}^{-1}}$，取 $0.3\text{–}1.0$，与 $r_c$ 匹配）；$q_i$ 原子 $i$ 的有效电荷（$e$）；$E_{\text{self}}$ 自能修正（$\mathrm{eV}$）消掉实空间高斯项的自作用；$E_{\text{recip}}$ 互易空间项（$\mathrm{eV}$）由 Poisson 求解器给出。**关键在于 $q_i$ 从哪来**，这是当前几条路线的分歧点：

| 处理方式                     | 机制                                                  | 额外代价                                      | 残留问题                                                             |
| ---------------------------- | ----------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| 固定经验电荷 + MLIP 短程     | $q_i$ 为常数（第 4 讲路线）                           | 约 1.2–1.5×                                   | 电荷不响应环境，界面与强场下退回固定电荷的全部毛病                   |
| 电荷均衡/可变电荷            | 每步解第 4 讲式 (4.4) 的线性系统                      | 约 2–4×                                       | 均衡参数本身要拟 DFT，转移性未知                                     |
| 直接从能量力学习电荷与长程项 | 网络预测 $q_i$ 与长程相互作用，训练标签仍只有能量与力 | 约 2–4× + 需 Poisson/Ewald                    | 目前最干净的一条，但在纯 IL 体系上的验证还很新 [11]                  |
| 加大截断半径                 | 把 $r_c$ 推到 $10\text{–}12\ \text{Å}$ 以上           | 邻居数按 $r_c^{3}$ 增、成对计算量按 $r_c^{6}$ | 只是推迟问题：库仑是 $1/r$，永远截不干净                             |
| 放弃粒子基表示               | 学一个**经典密度泛函**，非局域性由构造保证            | 与 MD 完全不同的求解器                        | 拿不到原子轨迹，因此给不了 RDF 与碎裂通道，只给密度分布与热力学 [12] |

最后一行值得单独注意：它不是"更好的 MLIP"，而是**换掉问题表述**——IL 的长程库仑在粒子基局域描述符里是先天困难，而在密度泛函框架里是天然项。两条路线能回答的问题集合不重叠：第 6、7 讲要的是原子轨迹与逐次发射事件，那就只有粒子基路线能用。

## 7 与 PINNs 课程的对照：学的是函数、解、还是解算子

三者都是"用神经网络替代昂贵计算"，但学习目标与外推性质完全不同。姊妹课程 [第 4 讲：变体全景](https://tiegenfang.github.io/fangfangfang/posts/pinns-variants-taxonomy/) 把 PINNs 的变体按"治哪种病态"分了族；那里的分类尺度放到本讲同样有效，因为**这三者治的根本不是同一种病**。

MLIP 学的是**势能面**：一个从 $3N$ 维坐标到标量的函数 $E(\Omega)$，与具体工况、时间、边界无关——训练好一个 $\ce{[emim][BF4]}$ 的势，300 K 和 450 K、体相和液滴都用它。PINNs 学的是**一个特定 PDE 在特定边界条件下的解** $u(x,t)$：换来流马赫数就要重新训练（除非走算子路线）。神经算子学的是**解算子**：参数函数到解函数的映射，一次训练、多工况评估。

外推性质因此三者各异：MLIP 的训练分布是**构型空间**，而构型可以被显式采样、残差可以被事后测量，所以式 (5.5) 的外推检测原理上成立（虽然对"从未去过"的反应区失效）；PINNs 在配点稀疏的区域残差本身失去约束力，网络的"自认为的残差"不能充当可信度指标；神经算子的失效方式通常是整体畸变——参数落在训练分布外时输出仍然光滑，因而更难靠自检发现。

**共同教训**：这三类方法的可信度都不是模型属性，而是**训练集属性**。本讲第 4、5 节与第 4 讲第 6 节的 ReaxFF 训练集问题，说的是同一件事。

## 8 该不该上 MLIP，以及上了之后必须做的两件事

**该上的信号**：需要 DFT 级精度（电荷转移、成键变化、氢键强度参与决定结果），同时需要经典 MD 的时间尺度（数十 ns 以上）或原子数（数千以上）；体系组成固定或可扩展成固定；有预算做主动学习闭环（几十到几百 GPU 小时的 DFT 打标是常态）。

**不该上的信号**：单点能垒与电子结构性质（直接算 DFT，第 2 讲）；只需要结构与输运的常规精度且已有验证过的极化力场（第 4 讲，直接用 CL&Pol 类，成本可低一到两个数量级）；纯粹的大尺度自组装（粗粒化，第 4 讲第 4 节）。

**上了之后必须额外做的两件事**，这两条是本讲的落点：

1. **反应路径采样。** 只要问题涉及断键、质子转移或分解（也就是第 7、8 讲的全部对象），平衡态 AIMD 数据不够，必须专门扫描反应坐标，并显式声明产物分布的可信度边界。
2. **长程静电处理。** 必须显式选择式 (5.6) 的一条路线并交代 $q_i$ 从哪来。一个只有短程描述符、没有长程项的 MLIP，在离子液体上连"远处有没有反离子"都分辨不出，不能用于表面、液滴与界面问题。

## 关于标识符的说明

本讲十二条已逐条回查（见 `docs/paper/track-md-dft.md` 及其「奠基文献补全」小节）：[1]、[7]–[12] 走 Crossref `/works/<DOI>`；[2] 的 Behler–Parrinello 描述符与 [3]–[6] 的四个架构分支走 Crossref 或 arXiv 编号回查，**其中 [3]、[5]、[6] 以 arXiv 编号为出处**（会议与期刊的注册串不唯一，编号本身可定位）。**GAP 与 sGDML 一系（确定性核势）在本讲只作为方法类别描述，未编号引用**：它们承担"不变量描述符的另一条实现路线"这一说明性角色，不是任何具体论断的出处，本讲不让它承担任何具体论断，故不编号引用。第 1 节的成本倍率表与第 3 节的精度容差是本课程的数量级估计而非文献论断，不带引用。不编造标识符。

## 参考文献

[1] Tristan G. A. Youngs, Mario G. Del Pópolo, Jorge Kohanoff. Development of Complex Classical Force Fields through Force Matching to ab Initio Data: Application to a Room-Temperature Ionic Liquid. The Journal of Physical Chemistry B, 2006, 110: 5697–5707. DOI: 10.1021/jp056931k.

[2] Jörg Behler, Michele Parrinello. Generalized Neural-Network Representation of High-Dimensional Potential-Energy Surfaces. Physical Review Letters, 2007, 98: 146401. DOI: 10.1103/PhysRevLett.98.146401.

[3] Kristof T. Schütt, Pieter-Jan Kindermans, Huziel E. Sauceda, Stefan Chmiela, Alexandre Tkatchenko, Klaus-Robert Müller. SchNet: A continuous-filter convolutional neural network for modeling quantum interactions. International Conference on Machine Learning, 2017. arXiv:1706.08566.

[4] Justin S. Smith, Olexandr Isayev, Adrian E. Roitberg. ANI-1: An extensible neural network potential with DFT accuracy at force field computational cost. Chemical Science, 2017, 8: 3192–3203. DOI: 10.1039/C6SC05720A.

[5] Han Wang, Linfeng Zhang, Jiequn Han, Weinan E. DeePMD-kit: A deep learning package for many-body potential energy representation and molecular dynamics. Computer Physics Communications, 2018. arXiv:1712.03641.

[6] Ilyes Batatia, Dávid Péter Kovács, Gregor N. C. Simm, Christoph Ortner, Gábor Csányi. MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields. Advances in Neural Information Processing Systems, 2022. arXiv:2206.07697.

[7] Qing-Jie Li, Emine Küçükbenli, Stephen Lam, Boris Khaykovich 等. Development of robust neural-network interatomic potential for molten salt. Cell Reports Physical Science, 2021, 2: 100359. DOI: 10.1016/j.xcrp.2021.100359.

[8] Zachary A. H. Goodwin, Malia B. Wenny, Julia H. Yang, Andrea Cepellotti 等. Transferability and Accuracy of Ionic Liquid Simulations with Equivariant Machine Learning Interatomic Potentials. The Journal of Physical Chemistry Letters, 2024, 15: 7539–7547. DOI: 10.1021/acs.jpclett.4c01942.

[9] Jurgis Ruza, Wujie Wang, Daniel Schwalbe-Koda, Simon Axelrod 等. Temperature-transferable coarse-graining of ionic liquids with dual graph convolutional neural networks. The Journal of Chemical Physics, 2020, 153: 164501. DOI: 10.1063/5.0022431.

[10] Daniel D. Depew, Joseph Wang, Shehan Parmar, Steven Chambreau 等. Thermal Decomposition of Hydroxylammonium Nitrate: ReaxFF Training Set Development for Molecular Dynamics Simulations. AIAA Propulsion and Energy 2019 Forum, 2019. DOI: 10.2514/6.2019-4367.

[11] Daniel S. King, Dongjin Kim, Peichen Zhong, Bingqing Cheng. Machine learning of charges and long-range interactions from energies and forces. Nature Communications, 2025, 16: 8763. DOI: 10.1038/s41467-025-63852-x.

[12] Anna T. Bui, Stephen J. Cox. Learning Classical Density Functionals for Ionic Fluids. Physical Review Letters, 2025, 134: 148001. DOI: 10.1103/physrevlett.134.148001.
