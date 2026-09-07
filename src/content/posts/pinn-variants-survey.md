---
pubDatetime: 2026-09-07T01:31:27Z
title: PINN 变体谱系：一份可核验的深度调研
draft: false
tags:
  - PINNs
  - 科学计算
  - 文献综述
description: 按训练轴、表示轴、对象轴三条正交轴梳理 PINN 与其 19 类变体：定义、架构、治哪种病、优缺点与适用判据；150 条文献全部经 arXiv / Crossref / OpenAlex 接口回查。
---

> 撰写日期 2026-09-06。全部参考文献由 arXiv / Crossref / OpenAlex 接口逐条回查后自动渲染生成，未经接口确认的条目一律不收录；凡机制描述超出摘要原文的部分，文末「证据边界」一节逐级标注了事实来源。
> 覆盖 19 类方法及其祖先与并发工作，正文引用 150 条已核验文献。

## Table of contents

---

## 0. 怎么读这份报告

PINN 变体数量已经大到「按时间线罗列」失去信息量。本报告用**三条相互正交的轴**给每个方法定位，因为一个变体通常只动一条轴，其余部分照抄 PINN——知道它动哪条轴，就知道它能带来什么、不能带来什么。

| 轴                 | 问题                             | 两端                                                     | 典型手段                                                           |
| ------------------ | -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| **轴 I：训练轴**   | 为什么训不动？                   | 固定采样 / 固定权重 ↔ 自适应采样 / 自适应权重 / 频率先验 | 配置点重采样、损失加权与学习率退火、Fourier 特征输入编码           |
| **轴 II：表示轴**  | 用什么基函数逼近解？             | 全局 MLP 点态配点 ↔ 局部基 / 弱形式 / 网格结构           | 变分与能量形式、径向基、有限基与域分解、卷积、KAN、与 FEM/FVM 融合 |
| **轴 III：对象轴** | 学的是「一个解」还是「解算子」？ | 单解 ↔ 参数化解族（算子）                                | DeepONet、FNO、PINO                                                |

三条轴可以自由组合：FBPINN 是轴 II，SAM 是轴 I，两者同时用不冲突。判据也简单：

- **轴 I 的方法不改变解的表示能力上限**，只改变能不能训到那个上限；
- **轴 II 的方法改变的是「损失里出现几阶导数、残差是点态还是积分、基函数是全局还是局部」**，直接决定适定性、代价与间断处理能力；
- **轴 III 的方法改变的是问题的提法本身**：从「给我这个 IC/BC 的解」变成「给我这个 PDE 族的解算子」，代价是通常需要解样本数据。

一个贯穿全报告的判断：**2019 年 PINN 之后的绝大多数变体，不是在提升「精度」，而是在各自修一个具体的失效模式。**因此每一节都按「治哪种病 → 药方 → 新副作用」写，而不是按「谁更先进」写。

---

## 1. 前史（1998–2018）：想法早就有，缺的是三样东西

用神经网络逼近微分方程解不是 2017 年的新事。

**Lagaris–Likas–Fotiadis 1998** 已经给出了完整框架：用一个「合适泛函形式」把边界条件解析地嵌进网络输出，剩余的自由部分用网络表达，再用残差最小二乘训练 [1]。今天被称作「硬约束试函数」「无网格配点」的做法，其原型在这里就有。

2018 年出现两条与 PINN 并行、后来独立发展的支线：

- **DGM（Sirignano–Spiliopoulos）**：对非线性抛物型方程用 min-max 形式，并给出网络宽度趋于无穷时收敛到粘性解的证明，明确针对高维与时变问题 [2]。
- **随机表示线（E–Han–Jentzen）**：把高维抛物型 PDE 与 BSDE 耦合求解 [3]，随后 Han–Jentzen–E 给出可实际运行的算法，宣称能解数百乃至上千维非线性 PDE [4]。**这条线解决的是维数灾难，走的是概率表示，和 PINN 的自动微分残差完全不共用机制。**
- **变分线（E–Yu）**：Deep Ritz 方法——不最小化残差，而最小化能量泛函，于是损失里只出现一阶导数 [5]。它是本报告第 5 节整个「能量法族」的源头。

**为什么这三条线在 2019 年之前没成气候，而 PINN 成了？**PINN 补上的不是数学，而是三件工程与叙事条件：自动微分框架成熟（TF/Theano 时代）；同时覆盖正问题与**反问题**（把 PDE 参数当可训练变量，与观测数据拼在同一个损失里）[6]；以及「无网格、可微、连续表示」这个对实验科学足够有吸引力的表述方式。Mishra–Molinaro 随后补上了泛化误差与先验误差估计的理论外壳 [7]。

---

## 2. PINN 本体：定义、架构与它真正的能力边界

**定义。** 以待求场 $u_\theta(x,t)$（神经网络）为未知量，把 PDE 残差、初边条件残差、可用观测数据残差加权求和为损失，用梯度下降联合优化参数 $\theta$。标准形式：

$$
\mathcal L=\underbrace{\frac{1}{N_r}\sum_i\lVert \mathcal N[u_\theta](x_i,t_i)\rVert^2}_{\text{PDE 残差（配点，无网格）}}+\underbrace{\frac{1}{N_b}\sum_j\lVert \mathcal B[u_\theta](s_j)\rVert^2}_{\text{初边条件}}+\lambda\underbrace{\frac{1}{N_d}\sum_k\lVert u_\theta(X_k)-u_k\rVert^2}_{\text{可选数据项}}
$$

**架构。** 全连接 MLP（模板级配置为 tanh 激活、约 8×50），**输入是自变量坐标本身**，不是网格索引。这一点是 PINN 与一切网格型网络方法（第 6、7 节）的分水岭：解被表示为一个连续可微函数，而不是网格上的自由度向量。

**分类归属。** 轴 III 上的「单解」端；轴 II 上的「强形式点态残差 + 全局基」端；轴 I 上通常用固定均匀 / 拉丁超方采样与手工权重。

**提出目的与真实优势。**

1. **反问题与数据同化是它的主场，不是副产品。** 把未知系数、源项、界面位置塞进 $\theta$，同一个损失同时给正问题的解和参数辨识 [6]。传统方法要靠伴随或优化外循环才能做的事，在这里是同一次训练。
2. **无网格 → 复杂几何与高维不需要生成网格**；配套的泛化误差与先验误差估计见 [7]。
3. **解天然连续可微**，可求任意点导数，可嵌进更大流程做端到端优化；与流动可视化等实测数据直接对接 [8]。
4. **实现门槛极低**：几十行代码 + 自动微分库；工程侧由 DeepXDE 等库固化下来 [9]。

**缺点与失效模式（这是变体谱系的真正起因）。**

| 病             | 表现                                           | 机理                                 | 对应变体族                           |
| -------------- | ---------------------------------------------- | ------------------------------------ | ------------------------------------ |
| 谱偏置         | 低频先学、高频学不进                           | NTK 谱衰减                           | Fourier 特征 [10]、[11]              |
| 梯度病态       | 边界项梯度量级 ≫ 残差项，损失景观条件数差      | 多目标项尺度失衡 [12]                | 归一化梯度下降、加权/退火            |
| 训练难度可表征 | 复杂对流、KdV、反应扩散上「学不到该学的物理」  | 目标函数落在 NTK 低特征值子空间 [13] | N-TKDE、函数分解、课程式             |
| 因果性违背     | 时间相关问题上「先未来后过去」也能压低全局损失 | 损失对时间不可分 [14]                | 因果加权、时间分解                   |
| 规模/薄结构    | 薄层、边界层、大域高频时精度塌                 | 全局基带宽不足                       | 域分解 [15]、局部基 [16]             |
| 高阶导数代价   | 四阶及以上方程 AD 成本与条件数爆炸             | 残差里出现 $u_{xxxx}$                | 弱形式 / 能量法 [17]、[18]           |
| 间断与激波     | 点态残差在间断处无意义                         | 强形式要求解足够光滑                 | 守恒形式与离散域 [19]、嵌入间断 [20] |
| 多工况成本     | 换一组 IC/BC 就要重训                          | 学的是单解                           | 算子学习 [21]、[22]、[23]            |
| 无收敛保证     | 「像 FEM 但没 FEM 的定理」                     | 无一致性/稳定性框架                  | 与经典离散化融合 [24]、[25]          |

最后两行值得单独强调：**PINN 的误差里，占主导的通常是优化误差与表示误差，而不是离散误差**——这意味着不能照搬 FEM 的收敛直觉。能不能「打过 FEM」本身是有实证对照的问题，[26] 给出了带条件限制的否定性结论。

---

## 3. 轴 I：训练轴变体

### 3.1 自适应配置点（治「点撒错了地方」）

**定义。** 保持 PINN 的损失形式与网络不变，只改变配点 $\{x_i\}$ 的分布规则，使残差大的区域自动获得更多点。

**提出目的。** 均匀随机采样把点数按体积分配，而误差按残差分布；对边界层、剪切层、高曲率区，均匀采样在数学上就是错的分配。

**谱系与代表工作。**

- **非自适应 vs 自适应采样的系统对照**：[27] 是目前最完整的一组比较，把残差驱动的自适应加密（RAR / 动态残差加密 DRR）与非自适应基线放在同一基准上评。
- **自适应点移动 + 自适应损失权重联用**：[28] 同时动「点的位置」和「各项权重」，说明这两条轴在实践中会互相掩盖效果。
- **残差注意力**：[29] 用注意力式机制把权重集中到高残差区，可视为「软加密」。
- **密度自适应采样、核密度自适应配点**：[30]、[31]。
- **能量均衡式采样**：[32]（残差均衡分布）、[33]（分区能量重要性采样）。
- **时间方向的自适应**：[34] 把自适应机制与均匀/非均匀时间域分解结合。

**架构层面**没有新东西——网络照旧，新增的是「点的重采样算子」。**分类**属轴 I。

**优点。** 与任何加权/架构方案正交可叠加；对高梯度区、奇异角点收益直接；实现成本低。

**缺点与新副作用。** (1) 每若干步要评估全场残差，开销不可忽略；(2) 引入新超参（加密阈值、加密周期、单次加密点数），这些超参本身会决定成败；(3) 自适应采样会**改变噪声结构**——点的位置依赖当前解，残差估计不再独立同分布，理论保证更薄；(4) [27] 这类对照研究本身说明：相当一部分「自适应收益」在同预算比较下会缩水。

**适用性。** 解的误差局部性强（边界层、局部载荷、奇异角）→ 值得用；解全域都难（高频全域、刚性化学）→ 自适应采样帮不上，那属于轴 II/频率先验的问题。

### 3.2 损失加权与学习率退火（治「多项损失互相打架」）

**定义。** PINN 损失是多目标求和，各项量级、曲率、梯度尺度差若干个数量级。这一族方法把权重 $w_k$ 变成训练过程中的动态量。

**提出动机与机理起点。** [12] 用 NTK 语言把问题说清：边界残差与 PDE 残差的梯度量级差导致损失景观条件数极差，直接给出**归一化梯度下降**作为 remedy——这是「加权不是玄学而是尺度问题」的出处。[13] 进一步把「训练难度」量化为 NTK 特征分解，并提出**函数分解**：把目标函数按 NTK 特征基拆开，为难学的低特征值分量单开损失项（N-TKDE）。

**代表方法谱系。**

| 方法                                            | 权重从哪来                                           | 出处                                       |
| ----------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| 归一化梯度下降（NGD）                           | 各项梯度尺度归一                                     | [12]                                       |
| N-TKDE / 函数分解                               | NTK 特征谱 + 分量级损失                              | [13]                                       |
| 多目标损失平衡（含递归有界平衡 ReLoBRaLo 一类） | 训练动力学实测、递归更新                             | [35]                                       |
| 自 adaptive 权重 SAM                            | 把多目标写成约束优化，权重取拉格朗日乘子并按规则更新 | [36]                                       |
| 残差衰减率均衡权重                              | 以各项残差下降速率为平衡目标，兼用于 DeepONet        | [37]                                       |
| 学习率退火（GAR 类思想）                        | 按梯度统计逐项退火，而非手工调                       | 〔本报告未能经接口确认其原始论文，见 §12〕 |
| 因果加权                                        | 时间累积损失做指数衰减权重                           | [14]                                       |
| NTK 收敛性诊断                                  | 不做加权，用 NTK 谱解释「为什么某个权重管用」        | [38]                                       |
| 时间一致性损失                                  | 把相邻时间步一致性作为附加约束                       | [39]                                       |
| 优化器本身的选择                                | 权重之外更大的变量：LBFGS vs Adam 及其调度           | [40]                                       |

**优点。** 完全不动架构、迁移成本低；对刚性、多尺度、多目标耦合问题收益常常是决定性的。
**缺点。** ① 超参与调度周期增加，且各方法在不同基准上排序不一致——**这是本族最实的问题：公开结果常常是「在作者选的算例上更好」**；② 加权会牺牲某一项的精度（例如把权重推向 PDE 残差，边界误差上升）；③ 理论解释互相冲突（NTK 一套、约束优化一套、经验启发一套）。
**适用判据。** 出现「损失各项下降速度差异悬殊」「某一项几乎不降」「换种子结果天差地别」这三种症状之一，就先做本族；先做 [40] 意义上的优化器与调度消融，再上自适应权重，否则分不清收益来源。

### 3.3 傅里叶特征 PINN（FF-PINN）与频率先验（治「学不进高频」）

**定义。** 把网络输入替换为随机 Fourier 特征映射 $\gamma(x)=[\cos(2\pi Bx),\sin(2\pi Bx)]$，$B$ 的尺度 $\sigma$ 是可调超参。$x\to u_\theta(x)$ 变成 $\gamma(x)\to u_\theta(\gamma)$。

**提出目的。** [10] 用 NTK 证明：标准 MLP 的 NTK 对低频主导，因而**原理上**学不好低维域里的高频函数；输入端做 Fourier 特征等价于改变核的谱，从而把可学频带往上推。这不是「技巧」而是改核。

**PINN 侧的成体系化。** [11] 把 FF 编码、tanh 激活、基于 NTK 的输入缩放、以及自适应频率损失（SA-FLM）串成一套可操作的四步流程，并明确区分「训练病态」与「用户外行选择」两类失败来源——**这份是 FF-PINN 的工程定义文档**。

**同族旁支。** 周期激活 SIREN [41]（同一动机，改激活而非改输入）；小波型多尺度 PINN [42]；核函数型网络 [43]；谱偏置的理论框架与「核—任务对齐」[44]；面向 PINN 与算子学习的谱偏置分析与缓解指南 [45]；动量对谱偏置的影响 [46]。

**优点。** 对高频、振荡解、长域上多周期共存的问题收益巨大且一次性；可与域分解叠加（先降带宽再局部化）。
**缺点。** ① $\sigma$ 是新的强敏感超参：太小退化回低频偏置，太大直接过拟合到配点；② 它改的是**先验**，不保证 PDE 残差被压低；③ 对局部化特征（裂纹尖端、边界层）不如局部基或域分解对症；④ 参数量随特征维度线性上升。
**适用性。** 全域高频（波动、声学、周期结构）→ FF 优先；局部薄结构 → 域分解 / 局部基优先；两者都有 → FF + FBPINN 组合。

---

## 4. 轴 II：变分与能量族（治「高阶导数、低正则解、本构结构」）

这一族是 PINN 变体里**内部差异最大**的一族，因为它同时动了「损失用什么泛函」和「解需要多光滑」两件事。按目标函数来源分三层：

| 层                                 | 目标函数来源       | 代表                                | 需要能量结构？ | 最高导数阶 |
| ---------------------------------- | ------------------ | ----------------------------------- | -------------- | ---------- |
| 弱形式（Galerkin/Petrov–Galerkin） | 残差对测试函数投影 | VPINN [17]、hp-VPINN [47]           | 否             | 降一阶     |
| 能量极小（位能）                   | 总势能泛函         | DEM [18]、Mixed DEM [48]、DLEM [49] | 是             | 通常一阶   |
| 互补能 / 混合能                    | 余能或双能原理     | DCEM [50]                           | 是             | 通常一阶   |

**4.1 VPINN：Petrov–Galerkin 化的 PINN。** 试空间取神经网络空间、测试空间取 Legendre 多项式，残差改为积分形式 [17]。好处有两个方向：一是**降低导数阶**（分部积分把 $u_{xx}$ 换成 $u_x$ 与测试函数导数），二是残差从 L² 点态惩罚变成投影，对低正则解更宽容。hp-VPINN 进一步把域切成单元（h）并使用分片多项式测试函数（p），显式借 FEM 的 hp 自适应经验 [47]；
**代价：** 需要数值积分（Gauss quadrature 成为新超参）、需要选测试函数族、边界项处理变复杂；Berrone 一组工作专门研究「四积方式与测试函数选择」以及免求积的 MF-VPINN [51]，并在另一篇里研究如何解析地强加 Dirichlet 条件 [52]——**这两篇是本族最实用的工程参考。**

**4.2 DEM（深度能量法）。** 由 [18] 提出，面向有限变形超弹性：网络输出位移场，训练目标是**总势能**（应变能 − 外力功）在 Gauss 积分点上取极小。DLEM 把它明确写成「自洽、无网格、不需要 FEM 生成训练数据」的三维版本 [49]。

- **提出目的**：固体力学里 PINN 的强形式残差需要二阶导（非线性本构下还要对变形梯度二次求导），条件数差；而连续介质力学天然有能量泛函可用。
- **实质优势**：① 只需一阶导数（[48] 摘要把这列为 DEM 的显著优势）；② **力边界条件作为自然边界条件自动出现在能量里**，不需要惩罚项；③ 能量可按材料区域相加 → 多材料/异质问题写起来自然；④ 直接从应变能函数出发，不必把本构推成强形式 PDE。
- **失效模式**：本征要求问题有变分结构（保守、自伴、准静态最顺）；非保守载荷、一般对流占优问题没有能量可最小化。更关键的是精度层面：**[48] 明确指出 DEM 与 PINN 共同的毛病是把应力集中与位移集中「平均掉」了**；[53] 与 [54] 分别给出了精度改进与失效机理的系统分析（后者标题即「深度能量法中的失效机理与解决」）。

**4.3 Mixed DEM（混合深度能量法）。** [48]。**注意「混合」的确切含义，不要按经典 FEM 的混合元理解。** 按全文取证：

- 网络是**单网络多输出**：2 个位移分量 + 4 个第一 Piola–Kirchhoff 应力分量；
- 目标仍是**对位移场的势能泛函 $\Pi(\hat\varphi)$ 取极小**（argmin，不是鞍点），另加三项 MSE：本构残差、位移边界、面力边界；其中位移边界条件由解析构造先验满足；
- 应力不是独立变分场，而是通过**本构残差** $\hat P(X,\Theta)=P(\hat F(X,\Theta))$ 训出来的。原文并未出现 Hu–Washizu / Hellinger–Reissner / 三场 / 体积锁定的表述。
- **它治的病**：DEM/PINN 平均掉应力集中；把应力作为独立输出并强制本构一致，集中特征才复现得出来。作者自陈的局限：仅准静态 2D、用可压缩 Neo-Hookean（未触及近不可压锁定），三维与时间相关留作未来工作。
- **算例规模**：2D 有限应变超弹性三例（单轴、局部面力、含圆孔梁），训练点规模 10⁴–10⁵，网络 6×60；FEM 仅作 ground truth。

一句话：**Mixed DEM 是「位移–应力双输出 + 本构残差」的混合式损失，不是混合变分原理。**把它当混合元来讲是常见的二次文献讹传。

**4.4 DEM 扩展族（按「修哪个毛病」排）。**

| 扩展                           | 修什么                                                           | 出处       |
| ------------------------------ | ---------------------------------------------------------------- | ---------- |
| 精度改进（能量评估、界面处理） | DEM 精度低于 FEM                                                 | [53]       |
| GNN 骨干 + 形函数式梯度计算    | MLP 骨干难处理不规则域、代价高                                   | [55]       |
| 拓扑优化中的自伴灵敏度         | 不必为密度更新再训一个网络：灵敏度直接用位移场表达               | [56]       |
| 黏弹性/三维                    | 扩展到率相关材料，免 FEM 数据                                    | [49]       |
| 互补能形式 DCEM                | 位能与余能两原理互补，适配不同边界条件类型                       | [50]       |
| 热弹性、压电                   | 换能能密度即换问题，验证「能量形式通用性」                       | [57]、[58] |
| 板壳 DEM                       | 高阶厚度方向导数与位移假设                                       | [59]       |
| 几何感知 DEM                   | 结构力学构件几何先验入网                                         | [60]       |
| 嵌入间断 DEDEM                 | 裂纹面位移跳跃，标准网络逼近间断函数代价高、精度低               | [20]       |
| 扩展 XDEM                      | 现有 DEM 需裂纹附近密集配点、稳定性差、离散/连续断裂模型各做各的 | [61]       |
| 失效机理分析                   | 把 DEM 失败模式说清并给解法                                      | [54]       |
| 弱形式高维分数阶 Deep Ritz     | 分数阶算子的 Deep Ritz 变体                                      | [62]       |

**4.5 本族小结。** 如果你的问题来自**连续介质力学、有明确能量密度、且需要一阶以上导数**，能量法族优先于强形式 PINN；如果**需要反问题（本参辨识）**，注意能量法的损失里数据项如何与能量项共存是未完全解决的问题，PINN 框架在反问题上仍然更成熟。混合 DEM 与 DCEM 的定位差别就在「应力是独立输出还是从位移导出」。

---

## 5. 轴 II（续）：局部基、域分解与架构替换

### 5.1 物理信息径向基网络 PIRBN（治「全局基的带宽不够」）

**定义。** 用**单层**径向基网络替代深层 MLP 来表示解：$u_\theta(x)=\sum_{j=1}^{d}a_j\,\phi(\lVert x-c_j\rVert;b_j)$，损失仍是 PINN 的强形式残差 + 边界残差 [16]。

**提出目的（这条最容易被讲错）。** 作者的依据是一条 NTK 观察：**PINN 训完之后实际上表现为局部逼近器**，但训练过程本身很难把它训成局部逼近器。PIRBN 直接从「局部基」出发，让局部性在整个训练过程中始终成立。

**架构事实（全文取证）。**

- 中心 $c_j$ **在训练中固定**，均匀铺在域内并在边界外侧补 4–10 个神经元；**可学习的只有幅值 $a_j$ 与宽度/形状参数 $b_j$**。
- 基函数个数与采样密度耦合确定：影响区取 $[c-3/b,\,c+3/b]$，$n=\tfrac{3}{2}\tfrac{1}{b\,\Delta x}+1$；$b$ 过大时「控制不住采样点之间的区域」。随机中心明显更差，作者建议均匀高斯中心。
- 边界条件**弱加**（惩罚项），没有能量泛函、没有 Gauss 求积、无网格。
- 局限是作者自陈的：**只能单层**，「单纯加深会丢掉局部逼近性质」。
- 对照对象是 Dong & Li 一类的域分解多网络方案，作者主张「原来需要域分解或多层 PINN 才能解的问题，现在用单层 PIRBN 就能解」——**注意：正文未把 FBPINN 作为对照。**

**优点。** 局部自适应分辨率、参数少、训练稳定，对长域高频与病态时间窗有效（算例含 1D 非线性弹簧 $x\in[0,100]$、2D 波动方程、1D+时间扩散、粘弹性 Poiseuille 流动）。
**缺点。** 基函数规模随维度与精度需求上升（求和式不保证稀疏）；宽度–密度耦合是新的调参负担；单层结构限制了对高维、多尺度耦合问题的表达；反问题能力未被验证。
**适用性。** 低维（≤3 空间维 + 时间）、强局部特征、长域高频 → 很合；高维参数空间、复杂几何共形 → 不合适。
**同族。** RBF 网络的物理信息建模与反问题 [63]、[64]；RBF–微分求积混合 [65]；**FE-PIRBN** 在 PIRBN 上加特征增强，专攻高频电磁散射 [66]；核函数型网络 [43]。

### 5.2 域分解族（治「规模、并行、多尺度」）

**共同定义。** 把计算域（空间或时间）剖分成子域，每子域一个网络，子域之间用界面连续性/通量条件耦合。

**演进顺序与各自动机。**

1. **并行 PINN / 空间分解**：[67] 与 [68] 解决的是「单网络扛不住大域」与「可并行」。
2. **XPINN**：广义时空域分解框架，子域独立网络 + 界面传输条件 [69]。
3. **cPINN**：面向**守恒律**，在离散子域上强制通量守恒而非仅解连续 [19]——弱解在间断点不满足点态方程，这是关键区别。
4. **FBPINN（有限基 PINN）**：解写成 $u=\sum_i \varphi_i(x)\,N_i(x)$，$\varphi_i$ 是定义在**重叠**子域上的固定「有限基」窗函数（单位分解），$N_i$ 是各自的小网络 [15]。动机是显式的：加性分解保证可分性，每个子网络只需覆盖局部频带 → 谱偏置压力被局部化。
5. **FBPINN = Schwarz 域分解**：[70] 把它严格对应到经典 Schwarz 迭代，于是数十年的 DDM 收敛理论可直接引用——**这是本族最重要的一次「理论收编」**。
6. **多重网格化**：多水平域分解架构，明确借鉴 two-level / multigrid DDM [71]。
7. **随机特征与多保真**：ELM/随机特征替代子网络 [72]；多保真域分解网络与算子 [73]。
8. **时间方向**：Parareal 式时间分解 PPINN [74]；自 adaptive 与均匀/非均匀时间域分解结合 [34]；初始化增强 + 域分解 [75]；双自适应域分解 DADD-PINN [76]。
9. **换基**：有限基 KAN（FBKAN）把子网络换成 KAN [77]。

**优点。** 并行、局域化频带、可按几何与材料分区、大域上更稳。
**缺点。** ① 界面条件是**新增的软约束**：连续性与通量守恒靠惩罚项，界面积点密度与耦合权重是新超参；② 单位分解窗函数会「抹平」跨界面的源项；③ 成本随子域数上升，批处理效率下降；④ 切分不当时收益被界面误差吃掉。
**适用性。** 几何或材料天然分区（装配体、多部件）、大域、含薄层/局部特征 → 值得；小域光滑问题 → 纯开销。

### 5.3 基于卷积神经网络的 PINN（治「坐标网络的推理成本与结构化数据」）

**定义。** 用卷积（常配循环）结构替代全连接坐标网络，解以**网格场**形式表示，物理残差仍以损失惩罚形式加入。

**两条常被混为一谈的动机线。**

- **(a) 可解释算子线**：PDE-Net 让卷积核**参数化微分算子**，目标是「从数据学出 PDE」并保持可解释性 [78]。
- **(b) 效率与结构线**：全连接坐标网络把 $(x,y,t)$ 当输入，时空分辨率一高，参数与访存就失控，且初边条件要逐点施加。PhyCRNet 明确针对这两点 [79]；NSFnets 面向不可压 N–S 的结构化求解网络 [80]；球面问题有专门的物理信息卷积网络 [81]。

**代表工作。**

| 方法                           | 结构                                 | 针对问题                       | 出处                       |
| ------------------------------ | ------------------------------------ | ------------------------------ | -------------------------- |
| PDE-Net                        | 卷积核=微分算子（含对称/反对称约束） | 学方程、可解释                 | [78]                       |
| BDCEN / PC-DeepVOP / PC-DrNets | 卷积编码–解码 + 贝叶斯/自回归        | 代理建模、不确定性、动力学推进 | [82]、[83]、[84]           |
| NSFnets                        | 结构化 PINN + 多阶段                 | 不可压 N–S 正/反问题           | [80]                       |
| PhyCRNet                       | CNN + ConvLSTM                       | 时空 PDE、免逐点 IC/BC、推理快 | [79]                       |
| PICNN 超分辨/去噪              | CNN + 物理约束                       | 从粗或噪数据重建流场           | [85]                       |
| 两相流 PICNN                   | CNN + 水平集对流                     | 界面追踪                       | [86]                       |
| 潜/输出双路 PICNN-LSTM         | 卷积 + LSTM，无监督                  | 无配对数据下解 PDE             | [87]                       |
| f-PICNN                        | 滤波算子入网                         | 时空域约束自动满足             | [88]                       |
| 图卷积 / 有限差分图网络        | GCN / 图                             | 非结构网格、块结构网格         | [89]〔仅预印本记录〕、[90] |

**优点。** 推理成本与分辨率近似线性（权重共享 + 规则访存）；天然吃网格/图像数据，可做超分辨与重建；卷积即固定差分模板，便于施加局部守恒；易做多状态批量训练。
**缺点。** **丢掉无网格这一 PINN 核心优势**——需要规则网格或结构化标注，复杂几何要么掩膜要么重投影；平移等变≠旋转等变；感受野有限，长程信息靠堆层；反问题不再自然（PDE 参数与网络权重的对应被卷积打散）；训练通常需要解的场数据。
**适用性。** 有可信网格数据 / 需要实时高分辨率场输出 / 重建与超分辨 → 用；需要严格无网格或反问题 → MLP 型 PINN 或能量法族。

### 5.4 Kolmogorov–Arnold 型网络（KINN 与 PIKAN 一族）

**先讲基座。** KAN 把 MLP 的「节点上固定激活 + 边上可学权重」翻转成「边上可学单变量函数（样条参数化）、无线性权重」，依据 Kolmogorov–Arnold 表示定理；作者宣称在精度与可解释性（可提符号式）上优于 MLP [91]。其后的立场文把 KAN 定位为「连接 symbolist 科学与 connectionist AI」的桥梁，用于相关特征辨识、模块结构发现与符号公式发现 [92]。

**KINN。** [93] 把 KAN 作为物理信息框架的基座求解正/反问题（标题即「Kolmogorov–Arnold-Informed Neural Network: … based on Kolmogorov–Arnold Networks」）。
**命名歧义提醒**：KINN 这一缩写并非唯一归属；另有工作用同一缩写指代 Kolmogorov–Arnold 表示的物理驱动方法，但本次三源检索**未确认**其可引用条目，故不进入正文。引用 KINN 时应给完整出处而非缩写。

**同族与近亲。** KAN-ODE（动力学与隐物理学习）[94]；Chebyshev 基 PI-KAN（流体）[95]；网格依赖 PI-KAN 的自适应训练 [96] 与深层 PI-KAN 训练 [97]；弱形式演化 KAN [98]；系统综述 [99]、[100]；优化器选择对 PINN/KAN 的影响 [40]。

**优点。** 低维光滑问题上以更少参数达更高精度；符号回归与可解释性是真实附加值；样条网格天然提供局部可调分辨率。
**缺点。** 多变量张量积使成本随输入维度急剧上升；样条网格带来训练不稳定与网格调度新问题 [96]；作为 PDE 求解器的精度优势并非在所有基准上稳定复现——[99] 与 [40] 都提示结论对基准与优化器高度敏感。
**适用性。** 2D/3D + 时间的低维输入、需要可解释本构或公式发现 → 值得一试；高维参数空间、大规模并行 → MLP + 域分解仍更稳。

---

## 6. 与经典离散化融合的一族

共同点：**承认纯神经表示没有经典格式的定理，于是把一致性/守恒性/网格结构请回来**，同时保留可微性。

### 6.1 离散化增强型 PINN（这一名称不对应单一方法）

**必须说明的检索事实。** 以 discretization-enhanced /「离散化增强」为词，在 arXiv、Crossref、OpenAlex 三源**均无同名方法的精确命中**（复核口径见 §12）。可核验的现实是：它是一个**伞状类别**，指「用经典离散格式替代或增强自动微分来构造残差」的一批工作。已确认成员：

| 做法                    | 替代了什么                                  | 声称的收益                                    | 出处                  |
| ----------------------- | ------------------------------------------- | --------------------------------------------- | --------------------- |
| DT-PINN（无网格离散）   | 用高阶 RBF-FD 型离散代替 AD 求空间导        | 训练显著加速，尤其高阶导                      | [24]                  |
| FD-PINN                 | 残差改用有限差分                            | 驱动方腔高 Re 下壁面/角区精度提升、二次涡复现 | [101]；另一实现 [102] |
| 混合 FD + PINN          | 复杂几何用 FD、局部用网络                   | 复杂域可解                                    | [103]                 |
| 简化有限体积 + 残差修正 | 通量差商残差                                | 守恒性 + 快                                   | [104]                 |
| 梯度增强 PINN           | 把残差推到更高阶导并作为增广项              | 训练保真度                                    | [105]                 |
| 拟微分增强 PINN         | 同样的增强搬到 Fourier 空间（乘傅里叶变量） | 频域可控的增强                                | [106]                 |
| 核自适应离散策略        | 离散/核与训练协同                           | 采样与格式联合设计                            | [107]                 |
| 时间离散 / 逐步推进     | 时间方向用格式而非全局损失                  | 因果性、稳定性                                | [108]、[109]          |
| 与气体动理学格式结合    | 离散速度/碰撞格式                           | 稀薄气体流动                                  | [110]                 |
| 生成模型 + 离散化       | 离散化生成模型                              | 三维湍流                                      | [111]                 |
| 「用哪种求导」本身      | AD 与 FD 的系统比较                         | 成本/精度权衡                                 | [112]                 |

**优点。** 残差评估成本可控（避免高阶 AD）；守恒与单调性可通过格式设计保证；与既有求解器代码复用。
**缺点。** 网格/模板回来了 → 无网格优势部分丧失；近边与不规则边界的差分要特殊处理；增强项引入新权重，问题回到 §3.2；AD-PINN 的收敛结论不能直接搬到 FD 变体。

### 6.2 物理编码有限元网络 PEFEN 与可微有限元 DFEM

同一研究线（Xi Wang、Zhen-Yu Yin 等）的两次推进，**机制不同，不要混用**：

- **PEFEN** [113]：把有限元的**结构**编码进神经网络本身，网络不再是黑箱全局函数，而具有可解释的「单元–节点」构造；标题声明的对象是集中特征与多材料异质的超弹性问题。推广包括不连续异质多孔介质与多层地层渗流 [114]，以及时空抛物型动力学 + 不连续异质的卷积注意力版本 [115]。
  定位：**「NN 形状的 FEM」**——用自由度组织方式换取可解释性与对局部特征的分辨率。
- **DFEM** [25]：**基于 Galerkin 离散化的可微有限元法**，保留 FEM 的 Galerkin 结构与一致性，同时让整个求解过程可微；标题声明的对象是「多维异质工程结构的快速而精确的反分析」。
  定位：**「可微的 FEM」**——目的不是免网格，而是把反问题/参数辨识做成端到端梯度问题。
- 相邻工作：把 Galerkin 弱形式残差与隐式 Euler 时间离散注入算子学习损失的 **FOL** [116]；用形函数基构造硬约束的 Wachspress 超限插值 [117]；预训练 + 热启动的 FEM 框架 [118]。

**优点。** 守恒性、可解释性、与既有 FEM 生态兼容；反问题在梯度意义上更「正规」（目标由 Galerkin 弱形式给出，而非点态残差加权和）。
**缺点。** 需要网格 → 失去无网格优势；实现复杂度接近两个领域之和；**该系列多数关键论文在付费墙内，接口未返回摘要**，本报告只描述其声明的对象与问题域，机制细节需对照原文。

### 6.3 可微分求解器支线（常被误认为 PINN 变体）

DiffTaichi 把物理模拟写成可微程序 [119]；可微 FEM 求解器直接做拓扑优化 [120]。**区别在于：解仍由离散格式给出，神经网络只出现在本构/参数/目标里**，因此严格说属「代理 + 可微管线」。列在此处是为了避免选型混淆：信任网格求解器且要端到端反问题 → 走这条；要无网格与解的连续可微表示 → 走 PINN 族。

---

## 7. 轴 III：算子学习——学解算子而不是学单解

**定义。** 学习映射 $\mathcal G:a\mapsto u$，$a$ 属于某个函数空间（入口系数、源项、初始条件），$u$ 是解场。一次训练、多工况推理。

### 7.1 两大基座架构

- **DeepONet**：Branch 编码输入函数在传感器处的取值，Trunk 编码输出基函数，输出 $\sum_i b_i(a)\,t_i(x)$；理论依据是算子的万能逼近定理 [21]。**需要成对的输入–输出解数据**（通常由经典求解器生成）。
- **FNO**：谱卷积层——FFT → 截断模态上乘可学习 Fourier 乘子 → iFFT，叠加逐点线性与激活 [22]。关键性质是**离散化不变性**：训练分辨率与推理分辨率可以不同。

### 7.2 物理约束如何注入

| 方法                   | 机制                                         | 解决什么                             | 出处                  |
| ---------------------- | -------------------------------------------- | ------------------------------------ | --------------------- |
| PI-DeepONet            | DeepONet + 物理残差，Branch/Trunk 解耦两阶段 | 减少对成对解数据的依赖               | [121]（期刊版 [122]） |
| PI-DeepONet 长时间积分 | 参数演化方程的算子推进                       | 长时程漂移与误差累积                 | [123]（期刊版 [124]） |
| 可分离 PI-DeepONet     | 输入/输出分支可分离结构                      | 物理信息机器学习的维数灾难           | [125]                 |
| 变分 PI-DeepONet       | 弱形式 + 算子                                | 裂纹路径等自由边界问题               | [126]                 |
| **PINO**               | **粗分辨率数据 + 高分辨率 PDE 约束**，谱求导 | 数据稀缺下学算子、跨几何与跨参数泛化 | [23]（期刊版 [127]）  |
| 传输算子学习           | 条件分布漂移下学习                           | 训练/部署条件不一致                  | [128]                 |
| Laplace 神经算子       | Laplace 域参数化                             | 宽频、多尺度动力学                   | [129]                 |
| 潜空间算子             | 自编码潜空间中学算子                         | 大系统实时预测                       | [130]、[131]          |
| 分解式 FNO             | 域分解思想进 FNO                             | 大规模参数化 PDE                     | [132]                 |
| PI 深层算子网络        | PINN 与 DeepONet 的统一表述                  | 概念收编                             | [133]                 |

**PINO 的定位值得单列。** 它的实质不是「把 PINN 塞进 FNO」，而是**把物理残差放到算子的训练目标上**：一次优化同时约束整个输入函数族在高分辨率下的残差，因此可以只用粗分辨率数据 + 高分辨率物理约束来训练 [23]。代价是**必须已知 PDE 形式**，且求导依赖谱算子（非周期问题需要额外处理）。

### 7.3 与 PINN 的关系：互补，不是替代

- 换工况就重训一次可接受 → PINN 族；需要成千上万次实时评估（设计寻优、控制、贝叶斯反演采样）→ 算子族。
- 反问题：PINN 天然；算子学习需额外构造（把未知参数纳入输入分支）。
- 数据：PINN 可零数据纯物理；算子族几乎总要数据，物理约束是省数据的杠杆 [121]。

### 7.4 「基于能量的模型：算子学习 + 离散化」

清单里这一项，可核验的最贴切对应是**能量一致算子（ENO）**：以能量守恒/耗散结构为约束学习 Hamiltonian 与耗散型 PDE 的解算子，作者明确指出现有算子学习方法「仍难以学到遵守物理定律的动力学」[134]。相邻的是把弱形式（Galerkin 离散）注入算子损失的 FOL [116] 与变分 PI-DeepONet [126]。

**这一名称本身有歧义。** 它可能出自某份综述的分类而非某篇具体论文；本文不把不确定的类别名硬安到某篇论文上，若需追查具体出处，按来源核对即可。

---

## 8. 零散但常被点名的几类

**8.1 PFNN。** 可核验的 PFNN 是 **Sheng–Yang 的 penalty-free neural network**：边界/初值条件用解析构造精确满足，损失中**不含惩罚项** [135]。PFNN-2 引入重叠域分解，把适用面从自伴问题扩展到非自伴时间相关方程，同时保留对光滑性约束与本质边界条件的精确处理 [136]。全文取证给出三条免惩罚机制：紧支撑测试函数的弱形式（Neumann 作为自然项进入）、spline 乘积构成的 length factor 使 Dirichlet/初值/界面值由构造精确成立、两子网络分阶段训练（任一子损失都不含惩罚项）；算例为 L 形域各向异性对流扩散、Allen–Cahn（至 49 子域）、南极轮廓非线性对流扩散（至 42 子域）、三维黏性 Burgers（至 32 子域）。
**一个常见的混淆：PFNN 有时被展开成「物理场神经网络」，这与 penalty-free 的原义不符。**若你见到的是「物理场」义项，本次三源检索未找到可核验的同名方法（§12），建议以原始出处为准再核一次。

**8.2 分数阶与非局部。** fPINN 把微分算子换成分数阶导数，残差评估变成非局部积分 [137]；nPINN 面向参数化非局部 Laplacian，处理非局部相互作用（peridynamics 一类）[138]。适用：反常扩散、非局部损伤。

**8.3 不确定性量化。** aPINN 用对抗（GAN 式）框架给 PINN 加不确定性 [139]；B-PINNs 用贝叶斯框架与变分推断，把观测噪声和先验显式纳入 [140]。区分要讲清：贝叶斯 PINN 的「多解」来自后验采样，ensemble 的「多解」来自训练随机性，两者不能混为一谈。

**8.4 随机表示线（不是 PINN 变体但常被并表）。** FBSNN 把 PDE 与正倒向随机方程联立，用网络学控制与价值函数 [141]；与 [4]、[3] 同属「靠概率表示破维数灾难」，与 PINN 的确定性残差机制完全不同。

**8.5 综述与分类锚点。** 方法学全景 [100]（其自身按「架构、自适应加密、域分解、自适应权重与激活函数」分类，与本报告轴 I/II 基本一致）、SciML 综述 [142]、流体侧综述 [143]、PIML 总纲 [144]、按「物理引导 / 物理信息 / 物理编码」三分的框架 [145]、交叉领域综述 [146]、与 FEM 的正面对照 [26]、工具链 [9]。

---

## 9. 发展历程：四代分段

**第一代（1998–2018）想法期。** ANN 试函数与边界解析嵌入 [1] → 能量与变分形式 [5]、[18] → 概率表示破维数灾难 [3]、[4] → 卷积与贝叶斯代理 [78]、[82]、min-max 的 DGM [2]。

**第二代（2019–2021）框架期。** PINN 定型 [147]、[148]、[6]、[8]；几乎同时出现弱形式 [17]、[47]、分数阶 [137]、域分解 [69]、[19]、时间并行 [74]、免惩罚 [135]；算子学习同期成熟 [21]、[22]、[121]。固体力学侧则独立发展出 DEM [18]。

**第三代（2021–2023）病理期。** 主旋律是「把失败讲清楚再修」：梯度病态 [12]、失效模式与 NTK 诊断 [13]、多目标平衡 [35]、自 adaptive 权重 [36]、因果性 [14]、频率先验从 CV 进入 PINN [10]→[11]、局部基 [16]、有限基与其 DDM 理论收编 [15]、[70]、能量法的集中特征与精度 [48]、[53]、PINO [23]。

**第四代（2024–2026）融合与专业化期。** 三件事同时发生：① **与经典离散化合体**——PEFEN [113]、DFEM [25]、FOL [116]、FFV-PINN [104]、FD/拟微分增强一系 [101]、[106]；② **换基**——KAN 系全面进场 [91]、[93]、[97]、[98]；③ **针对专门失效模式的专业修补**——断裂的间断嵌入与扩展 [20]、[61]，DEM 失效机理 [54]，算子的维数灾难 [125]，能量一致算子 [134]，以及把「优化器选择」本身当作方法学变量 [40]。

一个判断：**轴 I 的边际收益在 2023 年后明显下降**（各方法在不同基准上互有胜负、缺乏统一评判体系），而**轴 II 与轴 III 的融合正在成为主流**——「精度、守恒、可微、可解释」这四件事，只有在带结构离散化的框架里才可能同时拿到。

---

## 10. 选型决策表

| 症状 / 需求                          | 首选族                     | 具体候选                    | 通常不该选                       |
| ------------------------------------ | -------------------------- | --------------------------- | -------------------------------- |
| 有观测数据 + 要反演材料参数/源项     | PINN 本体（+ 贝叶斯）      | [6]、[140]                  | 纯监督算子                       |
| 训练不动、各项残差量级悬殊           | 轴 I 加权                  | [12] → [35] → [36]、[37]    | 一上来就换架构                   |
| 时间相关、后段拟合崩坏               | 因果加权 + 时间分解        | [14]、[74]、[34]            | 单纯加深网络                     |
| 解含高频 / 振荡                      | 频率先验，必要时叠加域分解 | [11]、[10]、[71]            | 盲目加大网络                     |
| 局部集中特征（孔边、局部载荷、界面） | 能量法族 + 自适应配点      | [48]、[27]、[29]            | 全域均匀采样                     |
| 含裂纹 / 间断 / 激波                 | 间断嵌入或守恒形式         | [20]、[61]、[19]、[149]     | 强形式点态残差                   |
| 四阶及以上方程（板壳、相场）         | 变分 / 能量                | [17]、[18]、[59]            | MLP 强形式                       |
| 大域 / 几何或材料分区 / 要并行       | 域分解                     | [69]、[15]、[76]            | 单网络硬扛                       |
| 需要实时高分辨率场 / 重建            | 卷积族                     | [79]、[85]、[88]            | MLP 型 PINN                      |
| 多工况 / 设计寻优 / 控制             | 算子学习                   | [22]、[21]、数据稀缺时 [23] | 每个工况重训 PINN                |
| 要求守恒性与可解释本构               | 与离散化融合               | [25]、[113]、[104]、[116]   | 纯软约束                         |
| 想从数据里「读出公式」               | KAN 族                     | [91]、[92]、[94]            | MLP                              |
| 边界条件精度不够                     | 硬约束构造                 | [135]、[52]、[117]          | 继续加大权重                     |
| 高维（空间维 ≫ 3）                   | 概率表示线                 | [4]、[3]、[141]             | PINN（配点需求随维数灾难性增长） |

---

## 11. 谱系总表（轴 × 病 × 代价）

| 方法                | 年        | 动的轴 | 治的病               | 新增超参              | 额外代价   | 仍需网格 | 反问题难易 |
| ------------------- | --------- | ------ | -------------------- | --------------------- | ---------- | -------- | ---------- |
| PINN                | 2019      | 基线   | —                    | 权重、配点数          | —          | 否       | 易         |
| 自适应配置点        | 2022–     | I      | 点分布错配           | 加密阈值/周期         | 残差评估   | 否       | 易         |
| 加权 / 退火 / 因果  | 2020–     | I      | 多目标尺度失衡       | 更新规则、衰减率      | 低         | 否       | 易         |
| FF-PINN             | 2020/2023 | I      | 谱偏置               | Fourier 尺度 $\sigma$ | 输入维度↑  | 否       | 易         |
| VPINN / hp-VPINN    | 2019/2021 | II     | 高阶导数、低正则解   | 测试函数阶、求积规则  | 求积       | 部分     | 易         |
| DEM                 | 2019      | II     | 高阶导数、本构结构   | 能量密度实现、积分点  | 求积       | 部分     | 中         |
| Mixed DEM           | 2021      | II     | 集中特征被平均       | 本构残差权重          | 输出维度↑  | 部分     | 中         |
| DCEM / DEDEM / XDEM | 2023–     | II     | 互补能适配、裂纹间断 | 间断/裂纹几何参数     | 实现复杂度 | 部分     | 中         |
| PIRBN               | 2023      | II     | 全局基带宽不足       | 宽度 $b$、基个数      | 基数↑      | 否       | 未验证     |
| XPINN / cPINN       | 2020      | II     | 规模 / 守恒律        | 界面积点、耦合权重    | 子域数↑    | 否       | 易         |
| FBPINN              | 2021/23   | II     | 多尺度 + 规模        | 基个数、重叠宽度      | 子网络数↑  | 否       | 易         |
| CNN-PINN            | 2018/2021 | II     | 推理成本、结构化     | 网格分辨率            | 需场数据   | 是       | 中         |
| KINN / PIKAN        | 2024      | II     | 精度与可解释         | 样条网格阶            | 高维成本↑  | 否       | 易         |
| DT / FD / FFV-PINN  | 2022–     | II     | AD 成本、守恒性      | 模板阶数、格式参数    | 近边处理   | 部分     | 易         |
| PEFEN               | 2024      | II     | 可解释 + 集中特征    | 单元/节点构造         | 需网格     | 是       | 易         |
| DFEM                | 2025      | II     | 反问题精度 + 一致性  | 离散格式              | 需网格     | 是       | 易         |
| DeepONet            | 2021      | III    | 多工况成本           | 传感器位置、基维数    | 需解数据   | 是       | 需构造     |
| FNO                 | 2021      | III    | 分辨率泛化           | 保留模态数            | 需解数据   | 半       | 需构造     |
| PINO                | 2021/24   | III    | 数据稀缺下学算子     | 分辨率组合、物理权重  | 需已知 PDE | 半       | 部分       |
| PFNN                | 2021      | II     | 惩罚项带来的误差     | 构造式 BC 的解析部件  | 逐例构造   | 否       | 易         |

（「仍需网格」指是否需要网格或结构化栅格；「反问题难易」指把 PDE 未知参数塞进同一次训练的顺手程度。）

---

## 12. 证据边界与待核验清单

**事实来源分三级，正文措辞已按级别收紧。**

1. **全文级**（取到正文并核对表述）：Mixed DEM [48]、PIRBN [16]、PFNN-2 [136]。这三条的架构细节（中心是否可学、损失项构成、免惩罚机制、作者自陈局限、算例规模）来自原文语句。
2. **摘要级**：正文引用的条目中 72 条取到了实质摘要。凡正文出现「作者声称 / 摘要指出」的句子，止于此级。
3. **标题级——机制属领域共识**：接口未返回摘要，但方法本身被反复复现（PINN 本体 [6]、DeepONet [21]、XPINN [69]、cPINN [19]、hp-VPINN [47]、因果加权 [14]、SAM [36]、[27] 等）。对这些只作标题与公共知识可支撑的描述。
4. **标题级——机制描述属于推断，用前必须回原文**：PEFEN 系列 [113]、[114]、[115]、DFEM [25]、FE-PIRBN [66]、FFV-PINN [104]、DEM 精度与失效 [53]、[54]、残差注意力 [29]、配点移动 [28]、核自适应离散 [107]。这些条目的**对象与问题域由标题确定**，但 §5–§6 关于实现机制的叙述是依据同类方法的推断。
5. **未经同行评审**：[32]、[33]（SSRN 预印本）、[89]（ASME posted-content）；KINN 正文引期刊版 [93]，其预印本版为 [150]。

**已按宽口径复核、确认「不存在可核验同名条目」的两项**（不是单次窄查询的假零命中）：

- 「离散化增强型 PINN / discretization-enhanced PINN」：三源无同名方法 → 按伞状类别处理（§6.1）。
- 「物理场神经网络 PFNN」：可核验的 PFNN 为 penalty-free（§8.1）；「物理场」义项未找到可引用条目。

**按记忆构造检索式但未获接口确认、因此一律未进入正文与参考文献的条目**：学习率退火（GAR 类）原始论文、Self-Adaptive Collocation（SAC）、EnergyPINN、PB-Net、KAPINN、另一支同名 KINN、Deep Latent Models、S&PINN、BaPP-NN、Prados 多保真框架、神经算子逼近理论基础、FNO 期刊版、E–Yu 的 arbitrary deep energy methods。需要哪一条，给出出处我可逐条补查。

**仍需人工看全文的高风险论断。**

1. Mixed DEM 的「混合」是否在后续版本中被改写成真正的混合变分原理——本报告的否定结论只针对 [48] 本身。
2. PEFEN 的具体网络构造（节点–神经元对应关系、自由度耦合方式）。
3. DFEM 与 PEFEN 的分工边界（本报告按「可微 FEM 求解器」vs「FEM 形状的 NN」区分，依据为标题与二次文献）。
4. PINO 论文中的数据效率与加速倍率数字（摘要级，未逐项复核）。
5. PIRBN 与 FBPINN 的关系：PIRBN 正文并未对照 FBPINN（全文取证确认），任何「PIRBN 就是有限基方法」的说法都没有原文依据。
6. KAN/KINN 的精度优势是否在你的问题上成立：[40]、[99] 均提示结论高度依赖基准与优化器选择。

**与本站 PINNs 课程第 4 讲的两处口径差异。** 站内讲义[《变体全景：一张分类图谱》](https://tiegenfang.github.io/fangfangfang/posts/pinns-variants-taxonomy/)的参考文献中，DeepONet 与 fPINN 用的是 arXiv 预印本编号，而本报告确认其期刊条目分别为 Nature Machine Intelligence [21] 与 SIAM Journal on Scientific Computing [137]；第 4 讲把 dPINN 标注为「原始论文经检索暂无可核验标识符」，本报告确认了同类时间分解工作的期刊条目 PPINN [74]。建议统一到接口确认过的版本。

---

## 参考文献[1] I.E. Lagaris、A. Likas、D.I. Fotiadis. Artificial neural networks for solving ordinary and partial differential equations. IEEE Transactions on Neural Networks, 1998. DOI: 10.1109/72.712178.

[2] Justin Sirignano、Konstantinos Spiliopoulos. DGM: A deep learning algorithm for solving partial differential equations. Journal of Computational Physics, 2018. DOI: 10.1016/j.jcp.2018.08.029.
[3] Weinan E、Jiequn Han、Arnulf Jentzen. Deep Learning-Based Numerical Methods for High-Dimensional Parabolic Partial Differential Equations and Backward Stochastic Differential Equations. Communications in Mathematics and Statistics, 2017. DOI: 10.1007/s40304-017-0117-6.
[4] Jiequn Han、Arnulf Jentzen、Weinan E. Solving high-dimensional partial differential equations using deep learning. Proceedings of the National Academy of Sciences, 2018. DOI: 10.1073/pnas.1718942115.
[5] Weinan E、Bing Yu. The Deep Ritz method: A deep learning-based numerical algorithm for solving variational problems. arXiv 预印本, 2017. arXiv:1710.00211.
[6] M. Raissi、P. Perdikaris、G.E. Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics, 2019. DOI: 10.1016/j.jcp.2018.10.045.
[7] Siddhartha Mishra、Roberto Molinaro. Estimates on the generalization error of Physics Informed Neural Networks (PINNs) for approximating PDEs. arXiv 预印本, 2020. arXiv:2006.16144.
[8] Maziar Raissi、Alireza Yazdani、George Em Karniadakis. Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations. Science, 2020. DOI: 10.1126/science.aaw4741.
[9] Lu Lu、Xuhui Meng、Zhiping Mao、George E. Karniadakis. DeepXDE: A deep learning library for solving differential equations. arXiv 预印本, 2019. DOI: 10.1137/19M1274067; arXiv:1907.04502.
[10] Matthew Tancik、Pratul P. Srinivasan、Ben Mildenhall、Sara Fridovich-Keil、Nithin Raghavan、Utkarsh Singhal 等（共 9 位）. Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains. arXiv 预印本, 2020. arXiv:2006.10739.
[11] Sifan Wang、Shyam Sankaran、Hanwen Wang、Paris Perdikaris. An Expert's Guide to Training Physics-informed Neural Networks. arXiv 预印本, 2023. arXiv:2308.08468.
[12] Sifan Wang、Yujun Teng、Paris Perdikaris. Understanding and mitigating gradient pathologies in physics-informed neural networks. arXiv 预印本, 2020. arXiv:2001.04536.
[13] Aditi S. Krishnapriyan、Amir Gholami、Shandian Zhe、Robert M. Kirby、Michael W. Mahoney. Characterizing possible failure modes in physics-informed neural networks. NeurIPS 2021, 2021. arXiv:2109.01050.
[14] Sifan Wang、Shyam Sankaran、Paris Perdikaris. Respecting causality for training physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 2024. DOI: 10.1016/j.cma.2024.116813.
[15] Ben Moseley、Andrew Markham、Tarje Nissen-Meyer. Finite Basis Physics-Informed Neural Networks (FBPINNs): a scalable domain decomposition approach for solving differential equations. arXiv 预印本, 2021. DOI: 10.1007/s10444-023-10065-9; arXiv:2107.07871.
[16] Jinshuai Bai、Gui-Rong Liu、Ashish Gupta、Laith Alzubaidi、Xi-Qiao Feng、YuanTong Gu. Physics-informed radial basis network (PIRBN): A local approximating neural network for solving nonlinear PDEs. arXiv 预印本, 2023. DOI: 10.1016/j.cma.2023.116290; arXiv:2304.06234.
[17] E. Kharazmi、Z. Zhang、G. E. Karniadakis. Variational Physics-Informed Neural Networks For Solving Partial Differential Equations. arXiv 预印本, 2019. arXiv:1912.00873.
[18] Vien Minh Nguyen-Thanh、Xiaoying Zhuang、Timon Rabczuk. A deep energy method for finite deformation hyperelasticity. European Journal of Mechanics - A/Solids, 2020. DOI: 10.1016/j.euromechsol.2019.103874.
[19] Ameya D. Jagtap、Ehsan Kharazmi、George Em Karniadakis. Conservative physics-informed neural networks on discrete domains for conservation laws: Applications to forward and inverse problems. Computer Methods in Applied Mechanics and Engineering, 2020. DOI: 10.1016/j.cma.2020.113028.
[20] Luyang Zhao、Qian Shao. DEDEM: Discontinuity Embedded Deep Energy Method for solving fracture mechanics problems. arXiv 预印本, 2024. arXiv:2407.11346.
[21] Lu Lu、Pengzhan Jin、Guofei Pang、Zhongqiang Zhang、George Em Karniadakis. Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. Nature Machine Intelligence, 2021. DOI: 10.1038/s42256-021-00302-5.
[22] Zongyi Li、Nikola Kovachki、Kamyar Azizzadenesheli、Burigede Liu、Kaushik Bhattacharya、Andrew Stuart 等（共 7 位）. Fourier Neural Operator for Parametric Partial Differential Equations. arXiv 预印本, 2020. arXiv:2010.08895.
[23] Zongyi Li、Hongkai Zheng、Nikola Kovachki、David Jin、Haoxuan Chen、Burigede Liu 等（共 8 位）. Physics-Informed Neural Operator for Learning Partial Differential Equations. arXiv 预印本, 2021. arXiv:2111.03794.
[24] Ramansh Sharma、Varun Shankar. Accelerated Training of Physics-Informed Neural Networks (PINNs) using Meshless Discretizations. arXiv 预印本, 2022. arXiv:2205.09332.
[25] Xi Wang、Zhen-Yu Yin、Wei Wu、He-Hua Zhu. Differentiable finite element method with Galerkin discretization for fast and accurate inverse analysis of multidimensional heterogeneous engineering structures. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2025.117755.
[26] Tamara G Grossmann、Urszula Julia Komorowska、Jonas Latz、Carola-Bibiane Schönlieb. Can physics-informed neural networks beat the finite element method?. IMA Journal of Applied Mathematics, 2024. DOI: 10.1093/imamat/hxae011.
[27] Chenxi Wu、Min Zhu、Qinyang Tan、Yadhu Kartha、Lu Lu. A comprehensive study of non-adaptive and residual-based adaptive sampling for physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 2023. DOI: 10.1016/j.cma.2022.115671.
[28] Jie Hou、Ying Li、Shihui Ying. Enhancing PINNs for solving PDEs via adaptive collocation point movement and adaptive loss weighting. Nonlinear Dynamics, 2023. DOI: 10.1007/s11071-023-08654-w.
[29] Sokratis J. Anagnostopoulos、Juan Diego Toscano、Nikolaos Stergiopulos、George Em Karniadakis. Residual-based attention in physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 2024. DOI: 10.1016/j.cma.2024.116805.
[30] Guoquan Wu、Keerthana Vellayappan、Yao Shi、Zhe Wu. Adaptive Weighting and Collocation in Physics-Informed Neural Networks for Chemical Process Modeling. Industrial & Engineering Chemistry Research, 2026. DOI: 10.1021/acs.iecr.6c00048.
[31] Abhishek Sharma、Deobrat Singh. KDE-adaptive collocation sampling for Physics-Informed Neural Networks: A controlled evaluation of quantum augmentation. Journal of Computational Science, 2026. DOI: 10.1016/j.jocs.2026.102948.
[32] Yayi Hu、Yunqing Huang、Nianyu Yi. Residual Equidistribution Driven Adaptive Sampling algorithm for Physics Informed Neural Networks. 预印本, 2026. DOI: 10.2139/ssrn.6352079.〔未经同行评审：posted-content〕
[33] Jingwen Yu、Michael Zhengmeng Hou、Zhenan He、Jizhe Zhou、Wentao Feng、Jiancheng Lv. DREIS-PINN: Dynamic Regional Energy-based Importance Sampling for Physics-informed Neural Networks. 预印本, 2026. DOI: 10.2139/ssrn.7014098.〔未经同行评审：posted-content〕
[34] Wei Hu、Chao Dong、Shaolong Zheng、Hongyu Wu、Yi Cheng. Integrating self-adaptive mechanism with uniform and nonuniform time-domain decomposition for training physics-informed neural networks. Computer Physics Communications, 2026. DOI: 10.1016/j.cpc.2026.110391.
[35] Rafael Bischof、Michael Kraus. Multi-Objective Loss Balancing for Physics-Informed Deep Learning. Computer Methods in Applied Mechanics and Engineering, 439, 117914, 2025, 2021. DOI: 10.1016/j.cma.2025.117914; arXiv:2110.09813.
[36] Levi D. McClenny、Ulisses M. Braga-Neto. Self-adaptive physics-informed neural networks. Journal of Computational Physics, 2023. DOI: 10.1016/j.jcp.2022.111722.
[37] Wenqian Chen、Amanda A. Howard、Panos Stinis. Self-adaptive weights based on balanced residual decay rate for physics-informed neural networks and deep operator networks. Journal of Computational Physics, 2025. DOI: 10.1016/j.jcp.2025.114226.
[38] Salah A. Faroughi、Farinaz Mostajeran. Neural Tangent Kernel Analysis to Probe Convergence in Physics-informed Neural Solvers: PIKANs vs. PINNs. arXiv 预印本, 2025. arXiv:2506.07958.
[39] Sukirt Thakur、Maziar Raissi、Harsa Mitra、Arezoo M. Ardekani. Temporal consistency loss for physics-informed neural networks. Physics of Fluids, 2024. DOI: 10.1063/5.0211398.
[40] Elham Kiyani、Khemraj Shukla、Jorge F. Urbán、Jérôme Darbon、George Em Karniadakis. Optimizing the optimizer for physics-informed neural networks and Kolmogorov-Arnold networks. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2025.118308.
[41] Vincent Sitzmann、Julien N. P. Martel、Alexander W. Bergman、David B. Lindell、Gordon Wetzstein. Implicit Neural Representations with Periodic Activation Functions. arXiv 预印本, 2020. arXiv:2006.09661.
[42] Himanshu Pandey、Anshima Singh、Ratikanta Behera. An efficient wavelet-based physics-informed neural network for multiscale problems. Neural Networks, 2026. DOI: 10.1016/j.neunet.2026.108860.
[43] Zhuojia Fu、Wenzhi Xu、Shuainan Liu. Physics-informed kernel function neural networks for solving partial differential equations. Neural Networks, 2024. DOI: 10.1016/j.neunet.2024.106098.
[44] Inbar Seroussi、Asaf Miron、Zohar Ringel. Spectral-bias and kernel-task alignment in physically informed neural networks. Machine Learning: Science and Technology, 2024. DOI: 10.1088/2632-2153/ad652d.
[45] Siavash Khodakarami、Vivek Oommen、Nazanin Ahmadi Daryakenari、Maxim Beekenkamp、George Em Karniadakis. Spectral bias in physics-informed and operator learning: Analysis and mitigation guidelines. arXiv 预印本, 2026. arXiv:2602.19265.
[46] Ghazal Farhani、Alexander Kazachek、Boyu Wang. Momentum Diminishes the Effect of Spectral Bias in Physics-Informed Neural Networks. arXiv 预印本, 2022. arXiv:2206.14862.
[47] Ehsan Kharazmi、Zhongqiang Zhang、George E.M. Karniadakis. hp-VPINNs: Variational physics-informed neural networks with domain decomposition. Computer Methods in Applied Mechanics and Engineering, 2021. DOI: 10.1016/j.cma.2020.113547.
[48] Jan N. Fuhg、Nikolaos Bouklas. The mixed deep energy method for resolving concentration features in finite strain hyperelasticity. arXiv 预印本, 2021. DOI: 10.1016/j.jcp.2021.110839; arXiv:2104.09623.
[49] Diab W. Abueidda、Seid Koric、Rashid Abu Al-Rub、Corey M. Parrott、Kai A. James、Nahil A. Sobh. A deep learning energy method for hyperelasticity and viscoelasticity. arXiv 预印本, 2022. DOI: 10.1016/j.euromechsol.2022.104639; arXiv:2201.08690.
[50] Yizheng Wang、Jia Sun、Timon Rabczuk、Yinghua Liu. DCEM: A deep complementary energy method for solid mechanics. Int J Numer Methods Eng. 2024;e7585, 2023. DOI: 10.1002/nme.7585; arXiv:2302.01538.
[51] Stefano Berrone、Moreno Pintore. Meshfree Variational-Physics-Informed Neural Networks (MF-VPINN): An Adaptive Training Strategy. Algorithms, 2024. DOI: 10.3390/a17090415.
[52] S. Berrone、C. Canuto、M. Pintore、N. Sukumar. Enforcing Dirichlet boundary conditions in physics-informed neural networks and variational physics-informed neural networks. Heliyon, 2023. DOI: 10.1016/j.heliyon.2023.e18820.
[53] Charul Chadha、Junyan He、Diab Abueidda、Seid Koric、Erman Guleryuz、Iwona Jasiuk. Improving the accuracy of the deep energy method. Acta Mechanica, 2023. DOI: 10.1007/s00707-023-03691-3.
[54] Xi Wang、Jidong Zhao、Zhen-Yu Yin、Xiaoying Zhuang. Failure mechanisms and resolution in deep energy method. International Journal of Mechanical Sciences, 2026. DOI: 10.1016/j.ijmecsci.2026.111278.
[55] Junyan He、Diab Abueidda、Seid Koric、Iwona Jasiuk. On the use of graph neural networks and shape-function-based gradient computation in the deep energy method. arXiv 预印本, 2022. DOI: 10.1002/nme.7146; arXiv:2207.07216.
[56] Junyan He、Shashank Kushwaha、Charul Chadha、Seid Koric、Diab Abueidda、Iwona Jasiuk. Deep energy method in topology optimization applications. arXiv 预印本, 2022. DOI: 10.1007/s00707-022-03449-3; arXiv:2207.03072.
[57] Kuan-Chung Lin、Kuo-Chou Wang、Cheng-Hung Hu. Investigating deep energy method applications in thermoelasticity. Engineering Analysis with Boundary Elements, 2024. DOI: 10.1016/j.enganabound.2023.12.012.
[58] Kuan-Chung Lin、Cheng-Hung Hu、Kuo-Chou Wang. Innovative deep energy method for piezoelectricity problems. Applied Mathematical Modelling, 2024. DOI: 10.1016/j.apm.2023.11.006.
[59] Zhongmin Huang、Linxin Peng. An improved plate deep energy method for the bending, buckling and free vibration problems of irregular Kirchhoff plates. Engineering Structures, 2024. DOI: 10.1016/j.engstruct.2023.117235.
[60] Thi Nguyen Khoa Nguyen、Thibault Dairay、Raphaël Meunier、Christophe Millet、Mathilde Mougeot. Geometry-aware framework for deep energy method: an application to structural mechanics with hyperelastic materials. Computer Physics Communications, Volume 316, November 2025, 109757, 2024. DOI: 10.1016/j.cpc.2025.109757; arXiv:2405.03427.
[61] Yizheng Wang、Yuzhou Lin、Somdatta Goswami、Luyang Zhao、Huadong Zhang、Jinshuai Bai 等（共 11 位）. Towards Unified AI-Driven Fracture Mechanics: The Extended Deep Energy Method (XDEM). arXiv 预印本, 2025. arXiv:2511.05888.
[62] Juan Yang. Deep Ritz method for solving high-dimensional fractional differential equations. Engineered Science, 2022. DOI: 10.30919/es8d789.
[63] V. I. Gorbachenko、D. A. Stenkin. Physics-Informed Radial Basis-Function Networks. Technical Physics, 2023. DOI: 10.1134/s1063784223050018.
[64] Dmitry Stenkin、Vladimir Gorbachenko. Mathematical Modeling on a Physics-Informed Radial Basis Function Network. Mathematics, 2024. DOI: 10.3390/math12020241.
[65] Y. Xiao、L. M. Yang、Y. J. Du、Y. X. Song、C. Shu. Radial basis function-differential quadrature-based physics-informed neural network for steady incompressible flows. Physics of Fluids, 2023. DOI: 10.1063/5.0159224.
[66] Huajian Zhang、Chao Li、Rui Xia、Xinhai Chen、Tiaojie Xiao、Xiao-Wei Guo 等（共 7 位）. FE-PIRBN: Feature-enhanced physics-informed radial basis neural networks for solving high-frequency electromagnetic scattering problems. Journal of Computational Physics, 2025. DOI: 10.1016/j.jcp.2025.113798.
[67] Khemraj Shukla、Ameya D. Jagtap、George Em Karniadakis. Parallel Physics-Informed Neural Networks via Domain Decomposition. arXiv 预印本, 2021. arXiv:2104.10013.
[68] Long Nguyen、Maziar Raissi、Padmanabhan Seshaiyer. Efficient Physics Informed Neural Networks Coupled with Domain Decomposition Methods for Solving Coupled Multi-physics Problems. Lecture Notes in Mechanical Engineering, 2022. DOI: 10.1007/978-981-16-7857-8_4.
[69] Ameya D. Jagtap、George Em Karniadakis. Extended Physics-Informed Neural Networks (XPINNs): A Generalized Space-Time Domain Decomposition Based Deep Learning Framework for Nonlinear Partial Differential Equations. Communications in Computational Physics, 2020. DOI: 10.4208/cicp.oa-2020-0164.
[70] Victorita Dolean、Alexander Heinlein、Siddhartha Mishra、Ben Moseley. Finite basis physics-informed neural networks as a Schwarz domain decomposition method. arXiv 预印本, 2022. arXiv:2211.05560.
[71] Victorita Dolean、Alexander Heinlein、Siddhartha Mishra、Ben Moseley. Multilevel domain decomposition-based architectures for physics-informed neural networks. arXiv 预印本, 2023. DOI: 10.1016/j.cma.2024.117116; arXiv:2306.05486.
[72] Samuel Anderson、Victorita Dolean、Ben Moseley、Jennifer Pestana. ELM-FBPINNs: An Efficient Multilevel Random Feature Method. arXiv 预印本, 2024. arXiv:2409.01949.
[73] Alexander Heinlein、Amanda A. Howard、Damien Beecroft、Panos Stinis. Multifidelity domain decomposition-based physics-informed neural networks and operators for time-dependent problems. arXiv 预印本, 2024. arXiv:2401.07888.
[74] Xuhui Meng、Zhen Li、Dongkun Zhang、George Em Karniadakis. PPINN: Parareal physics-informed neural network for time-dependent PDEs. Computer Methods in Applied Mechanics and Engineering, 2020. DOI: 10.1016/j.cma.2020.113250.
[75] Chenhao Si、Ming Yan. Initialization-enhanced physics-informed neural network with domain decomposition (IDPINN). Journal of Computational Physics, 2025. DOI: 10.1016/j.jcp.2025.113914.
[76] Yunkang Xiong、Hongyu Wei、Zhiying Ma、Zhihong Ding、Yaxin Peng. DADD-PINN: Dual Adaptive Domain Decomposition Physics-Informed Neural Networks. Mathematics, 2026. DOI: 10.3390/math14040744.
[77] Amanda A. Howard、Bruno Jacob、Sarah Helfert、Alexander Heinlein、Panos Stinis. Finite basis Kolmogorov-Arnold networks: domain decomposition for data-driven and physics-informed problems. arXiv 预印本, 2024. arXiv:2406.19662.
[78] Zichao Long、Yiping Lu、Xianzhong Ma、Bin Dong. PDE-Net: Learning PDEs from Data. arXiv 预印本, 2017. arXiv:1710.09668.
[79] Pu Ren、Chengping Rao、Yang Liu、Jianxun Wang、Hao Sun. PhyCRNet: Physics-informed Convolutional-Recurrent Network for Solving Spatiotemporal PDEs. 2022, 2021. DOI: 10.1016/j.cma.2021.114399; arXiv:2106.14103.
[80] Xiaowei Jin、Shengze Cai、Hui Li、George Em Karniadakis. NSFnets (Navier-Stokes flow nets): Physics-informed neural networks for the incompressible Navier-Stokes equations. Journal of Computational Physics, 2021. DOI: 10.1016/j.jcp.2020.109951.
[81] Guanhang Lei、Zhen Lei、Lei Shi、Chenyu Zeng、Ding-Xuan Zhou. Solving PDEs on Spheres with Physics-Informed Convolutional Neural Networks. arXiv 预印本, 2023. arXiv:2308.09605.
[82] Yinhao Zhu、Nicholas Zabaras. Bayesian deep convolutional encoder–decoder networks for surrogate modeling and uncertainty quantification. Journal of Computational Physics, 2018. DOI: 10.1016/j.jcp.2018.04.018.
[83] Yinhao Zhu、Nicholas Zabaras、Phaedon-Stelios Koutsourelakis、Paris Perdikaris. Physics-constrained deep learning for high-dimensional surrogate modeling and uncertainty quantification without labeled data. Journal of Computational Physics, 2019. DOI: 10.1016/j.jcp.2019.05.024.
[84] Nicholas Geneva、Nicholas Zabaras. Modeling the dynamics of PDE systems with physics-constrained deep auto-regressive networks. Journal of Computational Physics, 2020. DOI: 10.1016/j.jcp.2019.109056.
[85] Han Gao、Luning Sun、Jian-Xun Wang. Super-resolution and denoising of fluid flow using physics-informed convolutional neural networks without high-resolution labels. Physics of Fluids, 2021. DOI: 10.1063/5.0054312.
[86] Zhao Zhang、Xia Yan、Piyang Liu、Kai Zhang、Renmin Han、Sheng Wang. A physics-informed convolutional neural network for the simulation and prediction of two-phase Darcy flows in heterogeneous porous media. Journal of Computational Physics, 2023. DOI: 10.1016/j.jcp.2023.111919.
[87] Arda Mavi、Ali Can Bekar、Ehsan Haghighat、Erdogan Madenci. An unsupervised latent/output physics-informed convolutional-LSTM network for solving partial differential equations using peridynamic differential operator. Computer Methods in Applied Mechanics and Engineering, 2023. DOI: 10.1016/j.cma.2023.115944.
[88] Biao Yuan、He Wang、Ana Heitor、Xiaohui Chen. f-PICNN: A physics-informed convolutional neural network for partial differential equations with space-time domain. Journal of Computational Physics, 2024. DOI: 10.1016/j.jcp.2024.113284.
[89] Han Gao、Jianxun Wang. Physics-Informed Graph Convolutional Neural Networks: A Unified Framework for Solving PDE-Governed Forward and Inverse Problems. 2021. DOI: 10.1115/1.0004979v.
[90] Yiye Zou、Tianyu Li、Lin Lu、Jingyu Wang、Shufan Zou、Laiping Zhang 等（共 7 位）. Finite-difference-informed graph network for solving steady-state incompressible flows on block-structured grids. Physics of Fluids 36 (10) 2024, 2024. DOI: 10.1063/5.0228104; arXiv:2406.10534.
[91] Ziming Liu、Yixuan Wang、Sachin Vaidya、Fabian Ruehle、James Halverson、Marin Soljačić 等（共 8 位）. KAN: Kolmogorov-Arnold Networks. arXiv 预印本, 2024. arXiv:2404.19756.
[92] Ziming Liu、Max Tegmark、Pingchuan Ma、Wojciech Matusik、Yixuan Wang. Kolmogorov-Arnold Networks Meet Science. Physical Review X, 2025. DOI: 10.1103/4t7t-v19l.
[93] Yizheng Wang、Jia Sun、Jinshuai Bai、Cosmin Anitescu、Mohammad Sadegh Eshaghi、Xiaoying Zhuang 等（共 8 位）. Kolmogorov–Arnold-Informed neural network: A physics-informed deep learning framework for solving forward and inverse problems based on Kolmogorov–Arnold Networks. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2024.117518.
[94] Benjamin C. Koenig、Suyong Kim、Sili Deng. KAN-ODEs: Kolmogorov–Arnold network ordinary differential equations for learning dynamical systems and hidden physics. Computer Methods in Applied Mechanics and Engineering, 2024. DOI: 10.1016/j.cma.2024.117397.
[95] Chunyu Guo、Lucheng Sun、Shilong Li、Zelong Yuan、Chao Wang. Physics-informed Kolmogorov–Arnold network with Chebyshev polynomials for fluid mechanics. Physics of Fluids, 2025. DOI: 10.1063/5.0284999.
[96] Spyros Rigas、Michalis Papachristou、Theofilos Papadopoulos、Fotios Anagnostopoulos、Georgios Alexandridis. Adaptive Training of Grid-Dependent Physics-Informed Kolmogorov-Arnold Networks. IEEE Access, 2024. DOI: 10.1109/access.2024.3504962.
[97] Spyros Rigas、Fotios Anagnostopoulos、Michalis Papachristou、Georgios Alexandridis. Training deep physics-informed Kolmogorov–Arnold networks. Computer Methods in Applied Mechanics and Engineering, 2026. DOI: 10.1016/j.cma.2026.118761.
[98] Bongseok Kim、Jiahao Zhang、Guang Lin. Weak-form evolutionary Kolmogorov–Arnold Networks for solving partial differential equations. Computer Methods in Applied Mechanics and Engineering, 2026. DOI: 10.1016/j.cma.2026.119065.
[99] Salah A. Faroughi、Farinaz Mostajeran、Amin Hamed Mashhadzadeh、Shirko Faroughi. Kolmogorov-Arnold networks for data-driven, physics-informed, and deep-operator learning: a review, synthesis, and new analysis. Neural Networks, 2026. DOI: 10.1016/j.neunet.2026.108791.
[100] Juan Diego Toscano、Vivek Oommen、Alan John Varghese、Zongren Zou、Nazanin Ahmadi Daryakenari、Chenxi Wu 等（共 7 位）. From PINNs to PIKANs: Recent Advances in Physics-Informed Machine Learning. arXiv 预印本, 2024. arXiv:2410.13228.
[101] Nityananda Roy、Robert Dürr、Andreas Bück、S. Sundar. Finite difference physics-informed neural networks enable improved solution accuracy of the Navier-Stokes equations. arXiv 预印本, 2024. arXiv:2501.00014.
[102] Kart Leong Lim、Rahul Dutta、Mihai Rotaru. Physics Informed Neural Network using Finite Difference Method. 2022 IEEE International Conference on Systems, Man, and Cybernetics (SMC), 2022. DOI: 10.1109/smc53654.2022.9945171.
[103] Zixue Xiang、Wei Peng、Weien Zhou、Wen Yao. Hybrid Finite Difference with the Physics-informed Neural Network for solving PDE in complex geometries. arXiv 预印本, 2022. arXiv:2202.07926.
[104] Chang Wei、Yuchen Fan、Jian Cheng Wong、Chin Chun Ooi、Heyang Wang、Pao-Hsiung Chiu. FFV-PINN: A fast physics-informed neural network with simplified finite volume discretization and residual correction. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2025.118139.
[105] Shuning Lin、Yong Chen. Gradient-enhanced physics-informed neural networks based on transfer learning for inverse problems of the variable coefficient differential equations. arXiv 预印本, 2023. arXiv:2305.08310.
[106] Andrew Gracyk. Pseudo-differential-enhanced physics-informed neural networks. arXiv 预印本, 2026. arXiv:2602.14663.
[107] Yan Ma、Wei Li. Kernel-Adaptive Discretization Strategies for Physics-Informed Neural Networks: A Comprehensive Framework for Optimal Solution of Fredholm Integral Equations. Journal of Nonlinear Mathematical Physics, 2026. DOI: 10.1007/s44198-026-00450-5.
[108] Hongwei Guo、Zhen-Yu Yin. A novel physics-informed deep learning strategy with local time-updating discrete scheme for multi-dimensional forward and inverse consolidation problems. Computer Methods in Applied Mechanics and Engineering, 2024. DOI: 10.1016/j.cma.2024.116819.
[109] Carmine Valentino、Giovanni Pagano、Dajana Conte、Beatrice Paternoster、Francesco Colace、Mario Casillo. Step-by-step time discrete Physics-Informed Neural Networks with application to a sustainability PDE model. Mathematics and Computers in Simulation, 2025. DOI: 10.1016/j.matcom.2024.10.043.
[110] Linying Zhang、Wenjun Ma、Qin Lou、Jun Zhang. Simulation of rarefied gas flows using physics-informed neural network combined with discrete velocity method. Physics of Fluids, 2023. DOI: 10.1063/5.0156404.
[111] Amirhossein Khademi、Erfan Salari、Steven Dufour. Simulation of 3D turbulent flows using a discretized generative model physics-informed neural networks. International Journal of Non-Linear Mechanics, 2025. DOI: 10.1016/j.ijnonlinmec.2024.104988.
[112] Maciej J. Mikulski、Tadeusz Uhl. Derivative Computation in PINNs: Automatic Differentiation, Finite Differences and Beyond. arXiv 预印本, 2026. arXiv:2608.11020.
[113] Xi Wang、Zhen-Yu Yin. Interpretable physics-encoded finite element network to handle concentration features and multi-material heterogeneity in hyperelasticity. Computer Methods in Applied Mechanics and Engineering, 2024. DOI: 10.1016/j.cma.2024.117268.
[114] Xi Wang、Wei Wu、He-Hua Zhu. Solving fluid flow in discontinuous heterogeneous porous media and multi-layer strata with interpretable physics-encoded finite element network. Journal of Rock Mechanics and Geotechnical Engineering, 2025. DOI: 10.1016/j.jrmge.2024.10.025.
[115] Xi Wang、Zhen-Yu Yin. Physics-encoded convolutional attention network for forward and inverse analysis of spatial-temporal parabolic dynamics considering discontinuous heterogeneity. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2025.118025.
[116] Yusuke Yamazaki、Ali Harandi、Mayu Muramatsu、Alexandre Viardin、Markus Apel、Tim Brepols 等（共 8 位）. A finite element-based physics-informed operator learning framework for spatiotemporal partial differential equations on arbitrary domains. Engineering with Computers, 2024. DOI: 10.1007/s00366-024-02033-8.
[117] N. Sukumar、Ritwick Roy. A Wachspress-based transfinite formulation for exactly enforcing Dirichlet boundary conditions on convex polygonal domains in physics-informed neural networks. Computational Mechanics, 2026. DOI: 10.1007/s00466-026-02789-4.
[118] Yizheng Wang、Zhongkai Hao、Mohammad Sadegh Eshaghi、Cosmin Anitescu、Xiaoying Zhuang、Timon Rabczuk 等（共 7 位）. Pretrain finite element method: A pretraining and warm-start framework for PDEs via physics-informed neural operators. Journal of the Mechanics and Physics of Solids, 2026. DOI: 10.1016/j.jmps.2026.106682.
[119] Yuanming Hu、Luke Anderson、Tzu-Mao Li、Qi Sun、Nathan Carr、Jonathan Ragan-Kelley 等（共 7 位）. DiffTaichi: Differentiable Programming for Physical Simulation. arXiv 预印本, 2019. arXiv:1910.00935.
[120] Liang Chen、Herman M. H. Shen. Topology Optimization through Differentiable Finite Element Solver. arXiv 预印本, 2020. arXiv:2009.10072.
[121] Sifan Wang、Hanwen Wang、Paris Perdikaris. Learning the solution operator of parametric partial differential equations with physics-informed DeepOnets. arXiv 预印本, 2021. arXiv:2103.10974.
[122] Sifan Wang、Hanwen Wang、Paris Perdikaris. Learning the solution operator of parametric partial differential equations with physics-informed DeepONets. Science Advances, 2021. DOI: 10.1126/sciadv.abi8605.
[123] Sifan Wang、Paris Perdikaris. Long-time integration of parametric evolution equations with physics-informed DeepONets. arXiv 预印本, 2021. arXiv:2106.05384.
[124] Sifan Wang、Paris Perdikaris. Long-time integration of parametric evolution equations with physics-informed DeepONets. Journal of Computational Physics, 2023. DOI: 10.1016/j.jcp.2022.111855.
[125] Luis Mandl、Somdatta Goswami、Lena Lambers、Tim Ricken. Separable physics-informed DeepONet: Breaking the curse of dimensionality in physics-informed machine learning. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2024.117586.
[126] Somdatta Goswami、Minglang Yin、Yue Yu、George Em Karniadakis. A physics-informed variational DeepONet for predicting crack path in quasi-brittle materials. Computer Methods in Applied Mechanics and Engineering, 2022. DOI: 10.1016/j.cma.2022.114587.
[127] Zongyi Li、Hongkai Zheng、Nikola Kovachki、David Jin、Haoxuan Chen、Burigede Liu 等（共 8 位）. Physics-Informed Neural Operator for Learning Partial Differential Equations. ACM / IMS Journal of Data Science, 2024. DOI: 10.1145/3648506.
[128] Somdatta Goswami、Katiana Kontolati、Michael D. Shields、George Em Karniadakis. Deep transfer operator learning for partial differential equations under conditional shift. Nature Machine Intelligence, 2022. DOI: 10.1038/s42256-022-00569-2.
[129] Qianying Cao、Somdatta Goswami、George Em Karniadakis. Laplace neural operator for solving differential equations. Nature Machine Intelligence, 2024. DOI: 10.1038/s42256-024-00844-4.
[130] Katiana Kontolati、Somdatta Goswami、George Em Karniadakis、Michael D. Shields. Learning nonlinear operators in latent spaces for real-time predictions of complex dynamics in physical systems. Nature Communications, 2024. DOI: 10.1038/s41467-024-49411-w.
[131] Sharmila Karumuri、Lori Graham-Brady、Somdatta Goswami. Physics-informed latent neural operator for real-time predictions of time-dependent parametric PDEs. Computer Methods in Applied Mechanics and Engineering, 2026. DOI: 10.1016/j.cma.2025.118599.
[132] Kangjie Li、Wenjing Ye. D-FNO: A decomposed Fourier neural operator for large-scale parametric partial differential equations. Computer Methods in Applied Mechanics and Engineering, 2025. DOI: 10.1016/j.cma.2025.117732.
[133] Somdatta Goswami、Aniruddha Bora、Yue Yu、George Em Karniadakis. Physics-Informed Deep Neural Operator Networks. Computational Methods in Engineering & the Sciences, 2023. DOI: 10.1007/978-3-031-36644-4_6.
[134] Yusuke Tanaka、Takaharu Yaguchi、Tomoharu Iwata、Naonori Ueda. Neural Operators Meet Energy-based Theory: Operator Learning for Hamiltonian and Dissipative PDEs. arXiv 预印本, 2024. arXiv:2402.09018.
[135] Hailong Sheng、Chao Yang. PFNN: A penalty-free neural network method for solving a class of second-order boundary-value problems on complex geometries. Journal of Computational Physics, 2021. DOI: 10.1016/j.jcp.2020.110085.
[136] Hailong Sheng、Chao Yang. PFNN-2: A Domain Decomposed Penalty-Free Neural Network Method for Solving Partial Differential Equations. arXiv 预印本, 2022. arXiv:2205.00593.
[137] Guofei Pang、Lu Lu、George Em Karniadakis. fPINNs: Fractional Physics-Informed Neural Networks. SIAM Journal on Scientific Computing, 2019. DOI: 10.1137/18m1229845.
[138] G. Pang、M. D'Elia、M. Parks、G.E. Karniadakis. nPINNs: Nonlocal physics-informed neural networks for a parametrized nonlocal universal Laplacian operator. Algorithms and applications. Journal of Computational Physics, 2020. DOI: 10.1016/j.jcp.2020.109760.
[139] Yibo Yang、Paris Perdikaris. Adversarial uncertainty quantification in physics-informed neural networks. Journal of Computational Physics, 2019. DOI: 10.1016/j.jcp.2019.05.027.
[140] Liu Yang、Xuhui Meng、George Em Karniadakis. B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data. Journal of Computational Physics, 2021. DOI: 10.1016/j.jcp.2020.109913.
[141] Maziar Raissi. Forward–Backward Stochastic Neural Networks: Deep Learning of High-Dimensional Partial Differential Equations. Peter Carr Gedenkschrift, 2023. DOI: 10.1142/9789811280306_0018.
[142] Salvatore Cuomo、Vincenzo Schiano Di Cola、Fabio Giampaolo、Gianluigi Rozza、Maziar Raissi、Francesco Piccialli. Scientific Machine Learning Through Physics–Informed Neural Networks: Where we are and What’s Next. Journal of Scientific Computing, 2022. DOI: 10.1007/s10915-022-01939-z.
[143] Shengze Cai、Zhiping Mao、Zhicheng Wang、Minglang Yin、George Em Karniadakis. Physics-informed neural networks (PINNs) for fluid mechanics: a review. Acta Mechanica Sinica, 2021. DOI: 10.1007/s10409-021-01148-1.
[144] George Em Karniadakis、Ioannis G. Kevrekidis、Lu Lu、Paris Perdikaris、Sifan Wang、Liu Yang. Physics-informed machine learning. Nature Reviews Physics, 2021. DOI: 10.1038/s42254-021-00314-5.
[145] Salah A. Faroughi、Nikhil M. Pawar、Célio Fernandes、Maziar Raissi、Subasish Das、Nima K. Kalantari 等（共 7 位）. Physics-Guided, Physics-Informed, and Physics-Encoded Neural Networks and Operators in Scientific Computing: Fluid and Solid Mechanics. Journal of Computing and Information Science in Engineering, 2024. DOI: 10.1115/1.4064449.
[146] Chuizheng Meng、Sam Griesemer、Defu Cao、Sungyong Seo、Yan Liu. When physics meets machine learning: a survey of physics-informed machine learning. Machine Learning for Computational Science and Engineering, 2025. DOI: 10.1007/s44379-025-00016-0.
[147] Maziar Raissi、Paris Perdikaris、George Em Karniadakis. Physics Informed Deep Learning (Part I): Data-driven Solutions of Nonlinear Partial Differential Equations. arXiv 预印本, 2017. arXiv:1711.10561.
[148] Maziar Raissi、Paris Perdikaris、George Em Karniadakis. Physics Informed Deep Learning (Part II): Data-driven Discovery of Nonlinear Partial Differential Equations. arXiv 预印本, 2017. arXiv:1711.10566.
[149] Elsa Cardoso-Bihlo、Alex Bihlo. Exactly conservative physics-informed neural networks and deep operator networks for dynamical systems. Neural Networks, 2025. DOI: 10.1016/j.neunet.2024.106826.
[150] Yizheng Wang、Jia Sun、Jinshuai Bai、Cosmin Anitescu、Mohammad Sadegh Eshaghi、Xiaoying Zhuang 等（共 8 位）. Kolmogorov–Arnold-Informed Neural Network: A Physics-Informed Deep Learning Framework for Solving Pdes Based on Kolmogorov–Arnold Networks. 预印本, 2024. DOI: 10.2139/ssrn.4868150.〔未经同行评审：posted-content〕

---

## 附录 A　本报告引用条目按年份排序

| 年份 | 题名                                                                                                                                                                         | 第一作者                       | 编号  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----- |
| 1998 | Artificial neural networks for solving ordinary and partial differential equations                                                                                           | I.E. Lagaris 等                | [1]   |
| 2017 | Deep Learning-Based Numerical Methods for High-Dimensional Parabolic Partial Differential Equations and Backward Stochastic Differential Equations                           | Weinan E 等                    | [3]   |
| 2017 | PDE-Net: Learning PDEs from Data                                                                                                                                             | Zichao Long 等                 | [78]  |
| 2017 | Physics Informed Deep Learning (Part I): Data-driven Solutions of Nonlinear Partial Differential Equations                                                                   | Maziar Raissi 等               | [147] |
| 2017 | Physics Informed Deep Learning (Part II): Data-driven Discovery of Nonlinear Partial Differential Equations                                                                  | Maziar Raissi 等               | [148] |
| 2017 | The Deep Ritz method: A deep learning-based numerical algorithm for solving variational problems                                                                             | Weinan E 等                    | [5]   |
| 2018 | Solving high-dimensional partial differential equations using deep learning                                                                                                  | Jiequn Han 等                  | [4]   |
| 2018 | DGM: A deep learning algorithm for solving partial differential equations                                                                                                    | Justin Sirignano 等            | [2]   |
| 2018 | Bayesian deep convolutional encoder–decoder networks for surrogate modeling and uncertainty quantification                                                                   | Yinhao Zhu 等                  | [82]  |
| 2019 | DiffTaichi: Differentiable Programming for Physical Simulation                                                                                                               | Yuanming Hu 等                 | [119] |
| 2019 | Variational Physics-Informed Neural Networks For Solving Partial Differential Equations                                                                                      | E. Kharazmi 等                 | [17]  |
| 2019 | DeepXDE: A deep learning library for solving differential equations                                                                                                          | Lu Lu 等                       | [9]   |
| 2019 | fPINNs: Fractional Physics-Informed Neural Networks                                                                                                                          | Guofei Pang 等                 | [137] |
| 2019 | Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations                      | M. Raissi 等                   | [6]   |
| 2019 | Adversarial uncertainty quantification in physics-informed neural networks                                                                                                   | Yibo Yang 等                   | [139] |
| 2019 | Physics-constrained deep learning for high-dimensional surrogate modeling and uncertainty quantification without labeled data                                                | Yinhao Zhu 等                  | [83]  |
| 2020 | Topology Optimization through Differentiable Finite Element Solver                                                                                                           | Liang Chen 等                  | [120] |
| 2020 | Modeling the dynamics of PDE systems with physics-constrained deep auto-regressive networks                                                                                  | Nicholas Geneva 等             | [84]  |
| 2020 | Conservative physics-informed neural networks on discrete domains for conservation laws: Applications to forward and inverse problems                                        | Ameya D. Jagtap 等             | [19]  |
| 2020 | Extended Physics-Informed Neural Networks (XPINNs): A Generalized Space-Time Domain Decomposition Based Deep Learning Framework for Nonlinear Partial Differential Equations | Ameya D. Jagtap 等             | [69]  |
| 2020 | Fourier Neural Operator for Parametric Partial Differential Equations                                                                                                        | Zongyi Li 等                   | [22]  |
| 2020 | PPINN: Parareal physics-informed neural network for time-dependent PDEs                                                                                                      | Xuhui Meng 等                  | [74]  |
| 2020 | Estimates on the generalization error of Physics Informed Neural Networks (PINNs) for approximating PDEs                                                                     | Siddhartha Mishra 等           | [7]   |
| 2020 | A deep energy method for finite deformation hyperelasticity                                                                                                                  | Vien Minh Nguyen-Thanh 等      | [18]  |
| 2020 | nPINNs: Nonlocal physics-informed neural networks for a parametrized nonlocal universal Laplacian operator. Algorithms and applications                                      | G. Pang 等                     | [138] |
| 2020 | Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations                                                                                       | Maziar Raissi 等               | [8]   |
| 2020 | Implicit Neural Representations with Periodic Activation Functions                                                                                                           | Vincent Sitzmann 等            | [41]  |
| 2020 | Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains                                                                                      | Matthew Tancik 等              | [10]  |
| 2020 | Understanding and mitigating gradient pathologies in physics-informed neural networks                                                                                        | Sifan Wang 等                  | [12]  |
| 2021 | Multi-Objective Loss Balancing for Physics-Informed Deep Learning                                                                                                            | Rafael Bischof 等              | [35]  |
| 2021 | Physics-informed neural networks (PINNs) for fluid mechanics: a review                                                                                                       | Shengze Cai 等                 | [143] |
| 2021 | The mixed deep energy method for resolving concentration features in finite strain hyperelasticity                                                                           | Jan N. Fuhg 等                 | [48]  |
| 2021 | Physics-Informed Graph Convolutional Neural Networks: A Unified Framework for Solving PDE-Governed Forward and Inverse Problems                                              | Han Gao 等                     | [89]  |
| 2021 | Super-resolution and denoising of fluid flow using physics-informed convolutional neural networks without high-resolution labels                                             | Han Gao 等                     | [85]  |
| 2021 | NSFnets (Navier-Stokes flow nets): Physics-informed neural networks for the incompressible Navier-Stokes equations                                                           | Xiaowei Jin 等                 | [80]  |
| 2021 | Physics-informed machine learning                                                                                                                                            | George Em Karniadakis 等       | [144] |
| 2021 | hp-VPINNs: Variational physics-informed neural networks with domain decomposition                                                                                            | Ehsan Kharazmi 等              | [47]  |
| 2021 | Characterizing possible failure modes in physics-informed neural networks                                                                                                    | Aditi S. Krishnapriyan 等      | [13]  |
| 2021 | Physics-Informed Neural Operator for Learning Partial Differential Equations                                                                                                 | Zongyi Li 等                   | [23]  |
| 2021 | Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators                                                                          | Lu Lu 等                       | [21]  |
| 2021 | Finite Basis Physics-Informed Neural Networks (FBPINNs): a scalable domain decomposition approach for solving differential equations                                         | Ben Moseley 等                 | [15]  |
| 2021 | Learning the solution operator of parametric partial differential equations with physics-informed DeepONets                                                                  | Sifan Wang 等                  | [122] |
| 2021 | PhyCRNet: Physics-informed Convolutional-Recurrent Network for Solving Spatiotemporal PDEs                                                                                   | Pu Ren 等                      | [79]  |
| 2021 | PFNN: A penalty-free neural network method for solving a class of second-order boundary-value problems on complex geometries                                                 | Hailong Sheng 等               | [135] |
| 2021 | Parallel Physics-Informed Neural Networks via Domain Decomposition                                                                                                           | Khemraj Shukla 等              | [67]  |
| 2021 | Learning the solution operator of parametric partial differential equations with physics-informed DeepOnets                                                                  | Sifan Wang 等                  | [121] |
| 2021 | Long-time integration of parametric evolution equations with physics-informed DeepONets                                                                                      | Sifan Wang 等                  | [123] |
| 2021 | B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data                                                                      | Liu Yang 等                    | [140] |
| 2022 | A deep learning energy method for hyperelasticity and viscoelasticity                                                                                                        | Diab W. Abueidda 等            | [49]  |
| 2022 | Scientific Machine Learning Through Physics–Informed Neural Networks: Where we are and What’s Next                                                                           | Salvatore Cuomo 等             | [142] |
| 2022 | Finite basis physics-informed neural networks as a Schwarz domain decomposition method                                                                                       | Victorita Dolean 等            | [70]  |
| 2022 | Momentum Diminishes the Effect of Spectral Bias in Physics-Informed Neural Networks                                                                                          | Ghazal Farhani 等              | [46]  |
| 2022 | Deep transfer operator learning for partial differential equations under conditional shift                                                                                   | Somdatta Goswami 等            | [128] |
| 2022 | A physics-informed variational DeepONet for predicting crack path in quasi-brittle materials                                                                                 | Somdatta Goswami 等            | [126] |
| 2022 | On the use of graph neural networks and shape-function-based gradient computation in the deep energy method                                                                  | Junyan He 等                   | [55]  |
| 2022 | Deep energy method in topology optimization applications                                                                                                                     | Junyan He 等                   | [56]  |
| 2022 | Physics Informed Neural Network using Finite Difference Method                                                                                                               | Kart Leong Lim 等              | [102] |
| 2022 | Efficient Physics Informed Neural Networks Coupled with Domain Decomposition Methods for Solving Coupled Multi-physics Problems                                              | Long Nguyen 等                 | [68]  |
| 2022 | Accelerated Training of Physics-Informed Neural Networks (PINNs) using Meshless Discretizations                                                                              | Ramansh Sharma 等              | [24]  |
| 2022 | PFNN-2: A Domain Decomposed Penalty-Free Neural Network Method for Solving Partial Differential Equations                                                                    | Hailong Sheng 等               | [136] |
| 2022 | Hybrid Finite Difference with the Physics-informed Neural Network for solving PDE in complex geometries                                                                      | Zixue Xiang 等                 | [103] |
| 2022 | Deep Ritz method for solving high-dimensional fractional differential equations                                                                                              | Juan Yang 等                   | [62]  |
| 2023 | Physics-informed radial basis network (PIRBN): A local approximating neural network for solving nonlinear PDEs                                                               | Jinshuai Bai 等                | [16]  |
| 2023 | Enforcing Dirichlet boundary conditions in physics-informed neural networks and variational physics-informed neural networks                                                 | S. Berrone 等                  | [52]  |
| 2023 | Improving the accuracy of the deep energy method                                                                                                                             | Charul Chadha 等               | [53]  |
| 2023 | Multilevel domain decomposition-based architectures for physics-informed neural networks                                                                                     | Victorita Dolean 等            | [71]  |
| 2023 | Physics-Informed Radial Basis-Function Networks                                                                                                                              | V. I. Gorbachenko 等           | [63]  |
| 2023 | Physics-Informed Deep Neural Operator Networks                                                                                                                               | Somdatta Goswami 等            | [133] |
| 2023 | Enhancing PINNs for solving PDEs via adaptive collocation point movement and adaptive loss weighting                                                                         | Jie Hou 等                     | [28]  |
| 2023 | Solving PDEs on Spheres with Physics-Informed Convolutional Neural Networks                                                                                                  | Guanhang Lei 等                | [81]  |
| 2023 | Gradient-enhanced physics-informed neural networks based on transfer learning for inverse problems of the variable coefficient differential equations                        | Shuning Lin 等                 | [105] |
| 2023 | An unsupervised latent/output physics-informed convolutional-LSTM network for solving partial differential equations using peridynamic differential operator                 | Arda Mavi 等                   | [87]  |
| 2023 | Self-adaptive physics-informed neural networks                                                                                                                               | Levi D. McClenny 等            | [36]  |
| 2023 | Long-time integration of parametric evolution equations with physics-informed DeepONets                                                                                      | Sifan Wang 等                  | [124] |
| 2023 | Forward–Backward Stochastic Neural Networks: Deep Learning of High-Dimensional Partial Differential Equations                                                                | Maziar Raissi 等               | [141] |
| 2023 | DCEM: A deep complementary energy method for solid mechanics                                                                                                                 | Yizheng Wang 等                | [50]  |
| 2023 | An Expert's Guide to Training Physics-informed Neural Networks                                                                                                               | Sifan Wang 等                  | [11]  |
| 2023 | A comprehensive study of non-adaptive and residual-based adaptive sampling for physics-informed neural networks                                                              | Chenxi Wu 等                   | [27]  |
| 2023 | Radial basis function-differential quadrature-based physics-informed neural network for steady incompressible flows                                                          | Y. Xiao 等                     | [65]  |
| 2023 | Simulation of rarefied gas flows using physics-informed neural network combined with discrete velocity method                                                                | Linying Zhang 等               | [110] |
| 2023 | A physics-informed convolutional neural network for the simulation and prediction of two-phase Darcy flows in heterogeneous porous media                                     | Zhao Zhang 等                  | [86]  |
| 2024 | Residual-based attention in physics-informed neural networks                                                                                                                 | Sokratis J. Anagnostopoulos 等 | [29]  |
| 2024 | ELM-FBPINNs: An Efficient Multilevel Random Feature Method                                                                                                                   | Samuel Anderson 等             | [72]  |
| 2024 | Meshfree Variational-Physics-Informed Neural Networks (MF-VPINN): An Adaptive Training Strategy                                                                              | Stefano Berrone 等             | [51]  |
| 2024 | Laplace neural operator for solving differential equations                                                                                                                   | Qianying Cao 等                | [129] |
| 2024 | Physics-Guided, Physics-Informed, and Physics-Encoded Neural Networks and Operators in Scientific Computing: Fluid and Solid Mechanics                                       | Salah A. Faroughi 等           | [145] |
| 2024 | Physics-informed kernel function neural networks for solving partial differential equations                                                                                  | Zhuojia Fu 等                  | [43]  |
| 2024 | Can physics-informed neural networks beat the finite element method?                                                                                                         | Tamara G Grossmann 等          | [26]  |
| 2024 | A novel physics-informed deep learning strategy with local time-updating discrete scheme for multi-dimensional forward and inverse consolidation problems                    | Hongwei Guo 等                 | [108] |
| 2024 | Multifidelity domain decomposition-based physics-informed neural networks and operators for time-dependent problems                                                          | Alexander Heinlein 等          | [73]  |
| 2024 | Finite basis Kolmogorov-Arnold networks: domain decomposition for data-driven and physics-informed problems                                                                  | Amanda A. Howard 等            | [77]  |
| 2024 | An improved plate deep energy method for the bending, buckling and free vibration problems of irregular Kirchhoff plates                                                     | Zhongmin Huang 等              | [59]  |
| 2024 | KAN-ODEs: Kolmogorov–Arnold network ordinary differential equations for learning dynamical systems and hidden physics                                                        | Benjamin C. Koenig 等          | [94]  |
| 2024 | Learning nonlinear operators in latent spaces for real-time predictions of complex dynamics in physical systems                                                              | Katiana Kontolati 等           | [130] |
| 2024 | Innovative deep energy method for piezoelectricity problems                                                                                                                  | Kuan-Chung Lin 等              | [58]  |
| 2024 | Investigating deep energy method applications in thermoelasticity                                                                                                            | Kuan-Chung Lin 等              | [57]  |
| 2024 | KAN: Kolmogorov-Arnold Networks                                                                                                                                              | Ziming Liu 等                  | [91]  |
| 2024 | Geometry-aware framework for deep energy method: an application to structural mechanics with hyperelastic materials                                                          | Thi Nguyen Khoa Nguyen 等      | [60]  |
| 2024 | Physics-Informed Neural Operator for Learning Partial Differential Equations                                                                                                 | Zongyi Li 等                   | [127] |
| 2024 | Adaptive Training of Grid-Dependent Physics-Informed Kolmogorov-Arnold Networks                                                                                              | Spyros Rigas 等                | [96]  |
| 2024 | Finite difference physics-informed neural networks enable improved solution accuracy of the Navier-Stokes equations                                                          | Nityananda Roy 等              | [101] |
| 2024 | Spectral-bias and kernel-task alignment in physically informed neural networks                                                                                               | Inbar Seroussi 等              | [44]  |
| 2024 | Mathematical Modeling on a Physics-Informed Radial Basis Function Network                                                                                                    | Dmitry Stenkin 等              | [64]  |
| 2024 | Neural Operators Meet Energy-based Theory: Operator Learning for Hamiltonian and Dissipative PDEs                                                                            | Yusuke Tanaka 等               | [134] |
| 2024 | Temporal consistency loss for physics-informed neural networks                                                                                                               | Sukirt Thakur 等               | [39]  |
| 2024 | From PINNs to PIKANs: Recent Advances in Physics-Informed Machine Learning                                                                                                   | Juan Diego Toscano 等          | [100] |
| 2024 | Respecting causality for training physics-informed neural networks                                                                                                           | Sifan Wang 等                  | [14]  |
| 2024 | Kolmogorov–Arnold-Informed Neural Network: A Physics-Informed Deep Learning Framework for Solving Pdes Based on Kolmogorov–Arnold Networks                                   | Yizheng Wang 等                | [150] |
| 2024 | Interpretable physics-encoded finite element network to handle concentration features and multi-material heterogeneity in hyperelasticity                                    | Xi Wang 等                     | [113] |
| 2024 | A finite element-based physics-informed operator learning framework for spatiotemporal partial differential equations on arbitrary domains                                   | Yusuke Yamazaki 等             | [116] |
| 2024 | f-PICNN: A physics-informed convolutional neural network for partial differential equations with space-time domain                                                           | Biao Yuan 等                   | [88]  |
| 2024 | DEDEM: Discontinuity Embedded Deep Energy Method for solving fracture mechanics problems                                                                                     | Luyang Zhao 等                 | [20]  |
| 2024 | Finite-difference-informed graph network for solving steady-state incompressible flows on block-structured grids                                                             | Yiye Zou 等                    | [90]  |
| 2025 | Exactly conservative physics-informed neural networks and deep operator networks for dynamical systems                                                                       | Elsa Cardoso-Bihlo 等          | [149] |
| 2025 | Self-adaptive weights based on balanced residual decay rate for physics-informed neural networks and deep operator networks                                                  | Wenqian Chen 等                | [37]  |
| 2025 | Neural Tangent Kernel Analysis to Probe Convergence in Physics-informed Neural Solvers: PIKANs vs. PINNs                                                                     | Salah A. Faroughi 等           | [38]  |
| 2025 | Physics-informed Kolmogorov–Arnold network with Chebyshev polynomials for fluid mechanics                                                                                    | Chunyu Guo 等                  | [95]  |
| 2025 | Simulation of 3D turbulent flows using a discretized generative model physics-informed neural networks                                                                       | Amirhossein Khademi 等         | [111] |
| 2025 | Optimizing the optimizer for physics-informed neural networks and Kolmogorov-Arnold networks                                                                                 | Elham Kiyani 等                | [40]  |
| 2025 | D-FNO: A decomposed Fourier neural operator for large-scale parametric partial differential equations                                                                        | Kangjie Li 等                  | [132] |
| 2025 | Kolmogorov-Arnold Networks Meet Science                                                                                                                                      | Ziming Liu 等                  | [92]  |
| 2025 | Separable physics-informed DeepONet: Breaking the curse of dimensionality in physics-informed machine learning                                                               | Luis Mandl 等                  | [125] |
| 2025 | When physics meets machine learning: a survey of physics-informed machine learning                                                                                           | Chuizheng Meng 等              | [146] |
| 2025 | Initialization-enhanced physics-informed neural network with domain decomposition (IDPINN)                                                                                   | Chenhao Si 等                  | [75]  |
| 2025 | Step-by-step time discrete Physics-Informed Neural Networks with application to a sustainability PDE model                                                                   | Carmine Valentino 等           | [109] |
| 2025 | Solving fluid flow in discontinuous heterogeneous porous media and multi-layer strata with interpretable physics-encoded finite element network                              | Xi Wang 等                     | [114] |
| 2025 | Differentiable finite element method with Galerkin discretization for fast and accurate inverse analysis of multidimensional heterogeneous engineering structures            | Xi Wang 等                     | [25]  |
| 2025 | Kolmogorov–Arnold-Informed neural network: A physics-informed deep learning framework for solving forward and inverse problems based on Kolmogorov–Arnold Networks           | Yizheng Wang 等                | [93]  |
| 2025 | Physics-encoded convolutional attention network for forward and inverse analysis of spatial-temporal parabolic dynamics considering discontinuous heterogeneity              | Xi Wang 等                     | [115] |
| 2025 | Towards Unified AI-Driven Fracture Mechanics: The Extended Deep Energy Method (XDEM)                                                                                         | Yizheng Wang 等                | [61]  |
| 2025 | FFV-PINN: A fast physics-informed neural network with simplified finite volume discretization and residual correction                                                        | Chang Wei 等                   | [104] |
| 2025 | FE-PIRBN: Feature-enhanced physics-informed radial basis neural networks for solving high-frequency electromagnetic scattering problems                                      | Huajian Zhang 等               | [66]  |
| 2026 | Kolmogorov-Arnold networks for data-driven, physics-informed, and deep-operator learning: a review, synthesis, and new analysis                                              | Salah A. Faroughi 等           | [99]  |
| 2026 | Pseudo-differential-enhanced physics-informed neural networks                                                                                                                | Andrew Gracyk 等               | [106] |
| 2026 | Integrating self-adaptive mechanism with uniform and nonuniform time-domain decomposition for training physics-informed neural networks                                      | Wei Hu 等                      | [34]  |
| 2026 | Residual Equidistribution Driven Adaptive Sampling algorithm for Physics Informed Neural Networks                                                                            | Yayi Hu 等                     | [32]  |
| 2026 | Physics-informed latent neural operator for real-time predictions of time-dependent parametric PDEs                                                                          | Sharmila Karumuri 等           | [131] |
| 2026 | Spectral bias in physics-informed and operator learning: Analysis and mitigation guidelines                                                                                  | Siavash Khodakarami 等         | [45]  |
| 2026 | Weak-form evolutionary Kolmogorov–Arnold Networks for solving partial differential equations                                                                                 | Bongseok Kim 等                | [98]  |
| 2026 | Kernel-Adaptive Discretization Strategies for Physics-Informed Neural Networks: A Comprehensive Framework for Optimal Solution of Fredholm Integral Equations                | Yan Ma 等                      | [107] |
| 2026 | Derivative Computation in PINNs: Automatic Differentiation, Finite Differences and Beyond                                                                                    | Maciej J. Mikulski 等          | [112] |
| 2026 | An efficient wavelet-based physics-informed neural network for multiscale problems                                                                                           | Himanshu Pandey 等             | [42]  |
| 2026 | Training deep physics-informed Kolmogorov–Arnold networks                                                                                                                    | Spyros Rigas 等                | [97]  |
| 2026 | KDE-adaptive collocation sampling for Physics-Informed Neural Networks: A controlled evaluation of quantum augmentation                                                      | Abhishek Sharma 等             | [31]  |
| 2026 | A Wachspress-based transfinite formulation for exactly enforcing Dirichlet boundary conditions on convex polygonal domains in physics-informed neural networks               | N. Sukumar 等                  | [117] |
| 2026 | Failure mechanisms and resolution in deep energy method                                                                                                                      | Xi Wang 等                     | [54]  |
| 2026 | Adaptive Weighting and Collocation in Physics-Informed Neural Networks for Chemical Process Modeling                                                                         | Guoquan Wu 等                  | [30]  |
| 2026 | DADD-PINN: Dual Adaptive Domain Decomposition Physics-Informed Neural Networks                                                                                               | Yunkang Xiong 等               | [76]  |
| 2026 | DREIS-PINN: Dynamic Regional Energy-based Importance Sampling for Physics-informed Neural Networks                                                                           | Jingwen Yu 等                  | [33]  |
| 2026 | Pretrain finite element method: A pretraining and warm-start framework for PDEs via physics-informed neural operators                                                        | Yizheng Wang 等                | [118] |
