---
author: Tiegen Fang
pubDatetime: 2026-09-05T08:00:00Z
title: 第 1 讲：多尺度链条——离子液体工质为什么必须下到原子尺度
description: 从离子对到推力器性能的五层尺度链条；连续介质模型在离子液体电喷雾与绿色推进剂分解上失效的三个具体理由；DFT、classical MD、AIMD 与 ReaxFF 各自的不可替代性与代价；以及贯穿全课的五个系统性失效模式。
course: md-dft-ionic-liquid
order: 1
tags:
  - 离子液体
  - 分子动力学
  - 第一性原理
  - 微推进
draft: false
---

这门课要回答的不是「MD 和 DFT 是什么」，而是一个更具体的问题：**当我手里有一套离子液体工质，宏观模型已经给不出我要的东西时，下到原子尺度究竟能多拿到什么、要付出什么、以及拿到的微观量怎么变回工程上能用的数。**

这一讲先把这条链条整体摊开。后面七讲里，第 2–5 讲造工具，第 6–8 讲用工具。

## Table of contents

## 1 连续介质给了什么，没给什么

电喷雾微推进与液体推进剂的宏观描述相当成熟：Taylor 的导电液体锥解给出 $49.3^\circ$ 的锥半角，Gañán-Calvo 一系的标度分析给出锥射流电流与流量的幂律关系，Rayleigh 判据给出带电液滴的裂变极限。工程上这些非常够用。

但它们全部建立在三个假设上：**介质连续、物性恒定、响应是统计平均的**。离子液体工质在这三条上同时逼近边界。于是问题变成：哪些量是这三条假设原则上表达不了的？

答案是三类，分别对应本课程的两个应用方向：

- **发射物种的分布**。标度律告诉你「发多大电流」，永远说不出「发的是裸离子还是 $\ce{[emim]2[BF4]+}$ 团簇」。而这个分布直接决定比冲与羽流自污染。
- **决速步的化学身份**。分解反应的决速步可能是一次质子转移，也可能是一个键的断裂。宏观热分析给出的表观活化能是多步混合的产物——HAN 分解的表观活化能随含水率与压力条件大幅变动，综述文献里这个数值本身就分散得很厉害 [1]。
- **强非均匀场区的静电响应**。锥尖是曲率半径纳米量级的地方，而离子液体的电荷屏蔽长度是亚纳米量级。那里「$\varepsilon$ 取体常数值」这句话已经不成立。

## 2 多尺度链条全图

这张表是全课的地图。读任何一讲时都可以回到这里确认「我现在在哪一层，要交给下一层什么」。

| 尺度                                      | 对象                            | 方法                      | 输出量                                       | 这些量往上交给谁                       |
| ----------------------------------------- | ------------------------------- | ------------------------- | -------------------------------------------- | -------------------------------------- |
| $0.1\text{–}1\ \mathrm{nm}$               | 离子对、氢键网络、前线轨道      | DFT                       | 结合能、电荷分布、极化率、振动频率           | 力场参数化（第 4 讲）、势垒（第 8 讲） |
| $1\text{–}10\ \mathrm{nm}$                | 体相液体、纳米液滴、界面双电层  | classical MD / AIMD       | $\gamma$、$\eta$、$\sigma$、$\rho$、结构因子 | 锥射流标度律（第 6 讲）                |
| $10\ \mathrm{nm}\text{–}1\ \mu\mathrm{m}$ | 发射器表面、Taylor 锥、羽流近场 | MD–Poisson 耦合 / EHD–PIC | 离子发射通量、能量分布、碎裂通道             | 推力器性能模型（第 7 讲）              |
| 反应坐标方向                              | 分解过渡态、表面吸附与反应      | DFT 过渡态搜索 / ReaxFF   | $\Delta E^{\ddagger}$、吸附能、速率常数      | 微观动力学与催化床（第 8 讲）          |
| 宏观                                      | 推力器内流场与任务性能          | continuum CFD / 电路模型  | 推力、比冲、效率、寿命                       | 任务设计                               |

注意第三行的位置：它是**原子尺度与连续介质的接缝**，也是这门课最容易被糊弄过去、而恰恰最要紧的一层。

ADN 那一支的分子模拟与数值计算进展综述 [2] 就是把这条链的上下两端放在一起讨论的，值得当作链条如何闭合的样板来读。

## 3 三个「必须下到原子尺度」的量级论证

抽象地说「要下尺度」没有意义。下面三个论证是可检查的。

### 3.1 存储能力与离子总数的悬殊比

取 $\ce{[emim][BF4]}$，摩尔质量 $198\ \mathrm{g/mol}$、密度约 $1150\ \mathrm{kg/m^3}$，则每对离子的体积为

$$
\frac{1.72\times10^{-4}\ \mathrm{m^3/mol}}{6.022\times10^{23}\ \mathrm{mol^{-1}}}
= 2.9\times10^{-28}\ \mathrm{m^3}
\qquad\Longrightarrow\qquad
n \approx 3.5\ \text{对}/\mathrm{nm^3}
\tag{1.1}
$$

一个半径 $10\ \mathrm{nm}$ 的液滴因此含有约 $1.4\times10^{4}$ 对离子。而它能携带的净电荷上限由 Rayleigh 判据给出：

$$
Q_{\max}=8\pi\left(\varepsilon_0\gamma R^{3}\right)^{1/2}
$$

取 $\ce{[emim][BF4]}$ 的表面张力 $\gamma\approx46\ \mathrm{mN/m}$、$R=10\ \mathrm{nm}$，则 $\varepsilon_0\gamma R^{3}=8.85\times10^{-12}\times0.046\times10^{-24}\approx4.1\times10^{-37}$，开方得 $6.4\times10^{-19}$，再乘 $8\pi$ 得 $Q_{\max}\approx1.6\times10^{-17}\ \mathrm{C}$——**约 100 个基本电荷**。（$\gamma$ 本身从哪来、算得准不准，是第 6 讲的内容。）

**裂变极限只动用了离子总数的约 $0.7\%$**（$100 / 1.4\times10^{4}$），仍比「所有离子都参与」低两个数量级以上。这意味着液滴里的电荷分布不是「少量杂质离子均匀稀释在溶剂里」那种图像——绝大多数离子是结构性的、彼此强关联的，而那一点点可动电荷决定了整个发射行为。连续介质把电荷当连续密度场处理，在这个比例下丢掉的不是精度，是定性图像。

### 3.2 单根发射器的通量远超一个模拟盒子的存量

$10\ \mathrm{nA}$ 的束流对应

$$
\frac{10\times10^{-9}\ \mathrm{A}}{1.602\times10^{-19}\ \mathrm{C}}
\approx 6\times10^{10}\ \text{个一价离子}/\mathrm{s}
\tag{1.2}
$$

即平均每 $17\ \mathrm{ps}$ 就有一个离子离开。而一个 $10\ \mathrm{nm}$ 液滴总共只有一万多个离子对——照这个速率 **$0.2\ \mu\mathrm{s}$ 就发空了**。

这条账有两个用途。它一方面说明 MD 里看到的发射事件是真实的（时间尺度对得上），另一方面警告：**单次纳米液滴模拟描述的是一个正在耗尽的极端非平衡片段，不是一个稳态发射过程的样本。** 把它的统计直接当作发射器稳态行为，是不成立的。

### 3.3 屏蔽长度与锥尖曲率半径同量级

离子液体的特征屏蔽长度在亚纳米量级（数对离子间距）。发射锥尖的曲率半径从几十纳米到微米不等——也就是说，**在锥尖最要紧的那一小块区域里，双电层厚度与几何曲率半径之比达到 $10^{-2}$ 而不是 $10^{-5}$**。连续介质里「界面相对宏观几何无限薄」这个隐含前提，在这里开始漏水。

## 4 四种原子尺度方法的不可替代性与代价

| 方法                  | 势能来源   | 键能否断裂     | 典型体系规模            | 可达时间尺度                          | 独有能力                            | 主要代价                 |
| --------------------- | ---------- | -------------- | ----------------------- | ------------------------------------- | ----------------------------------- | ------------------------ |
| DFT（静态）           | 电子结构   | 沿反应坐标扫描 | $10^1\text{–}10^2$ 原子 | 不适用                                | 过渡态、电荷转移、电子密度、光谱    | 无温度、无时间演化       |
| AIMD                  | 每步解 DFT | 可以           | $10^2\text{–}10^3$ 原子 | $10\text{–}100\ \mathrm{ps}$          | 有限温度下的成键/断键，无需预设参数 | 贵到无法看稀有事件       |
| classical MD          | 经验力场   | 否（拓扑固定） | $10^5\text{–}10^8$ 原子 | $\mathrm{ns}\text{–}\mu\mathrm{s}$    | 统计力学平均、输运系数、大尺度结构  | 势能面质量完全取决于力场 |
| reactive MD（ReaxFF） | 键级经验势 | 是             | $10^3\text{–}10^5$ 原子 | $100\ \mathrm{ps}\text{–}\mathrm{ns}$ | 燃烧/分解这类多步反应网络           | 参数化难，训练集外推失控 |

计算成本的粗对照：DFT 对角化标度约 $O(N^3)$；AIMD 的代价近似为「原子数三次方 × 步数」，因此把 AIMD 推到 $10^4$ 原子、$10\ \mathrm{ns}$ 在常规资源上不现实；ReaxFF 相对同规模 classical MD 通常贵约 $50$ 倍量级。

> [!NOTE]
> 表里第三行与第四行有一条容易被忽略的区别：classical MD 和 reactive MD 都是经典力学，但**前者拓扑固定、因此原理上不可能给出任何化学机理**；后者允许断键、代价是势能面变成一套经验参数。离子液体电喷雾里问「$\ce{[BF4]-}$ 会不会解离出 $\ce{HF}$」，用 classical MD 得到「不会」是拓扑假设的结论，不是物理的结论。

第 2–5 讲会按 DFT → MD → 力场 → 机器学习势函数的顺序展开这四种方法。机器学习势函数之所以值得单开一讲，是因为它正是冲着这张表里「AIMD 精度 + classical MD 尺度」这个缺口去的——而离子液体这个体系对它的挑战（长程静电、反应路径构型缺失）恰好最尖锐。

## 5 两个应用分支其实是同一台机器

到这里必须交代课程的结构逻辑。**电喷雾微推进与绿色推进剂分解，不是两个并列的课题，而是同一台推力器的两个工作模式。**

dual-mode 提法的来源是对咪唑类离子液体作为「既可电喷雾、又可化学分解」工质的一族系统评估 [3]：这类工质加高压就能出离子束，产生微牛级推力与高比冲；进催化床分解释热，则产生毫牛级推力与较低比冲——同一杯液体，两种推力机制。含能离子液体单组元推进剂的电喷雾特性随后被单独实验考察过 [4]，多模式方案的计算高通量筛选也已出现 [7]。

> [!NOTE]
> 多模式微推进系统**已在立方星上做过在轨性能验证**，这一点在推进文献里常被引用。但本课程目前只检索到该报告的机构库版本（Digital Commons – Utah State University），**未取得可核验的 DOI**，因此此处只作事实性提及、不列编号引用。这不影响本讲任何论证：本课程依赖的是「同一工质存在两种工作模式」这一物理事实，而不是某一次在轨演示。

这条线之所以对本课程重要，是因为它让两个应用分支**共用同一套上游知识**：

- 共用工质本身，所以体相结构、输运性质、力场选择是共享的（第 3、4 讲）；
- 共用表面——电喷雾的发射器材料与催化分解的催化剂载体都涉及离子液体在固体表面的吸附（第 7 讲用 DFT 算发射器表面，第 8 讲用 DFT 算 HAN 在 $\ce{Pd(100)}$、$\ce{Ir(100)}$ 上的吸附与分解 [5]，两者是同一套方法）；
- 共用强电场这个变量——分解可以在无场条件下热引发，也可以在电场下引发，后者恰好把两个分支焊在一起：HAN 基离子液体推进剂在电场驱动下的分解已被 ReaxFF 分子动力学直接研究过 [6]。

也就是说，第 6–7 讲处理的「电场把离子从液面拽出来」，与第 8 讲处理的「电场改变分解路径」，在物理上是同一个场作用在同一个界面上的两件事。多模式推进剂的计算高通量筛选范式 [7] 则代表这条线正在从「一次算一个问题」走向「按性能指标批量算工质」——它的输入正是本课程前几讲造的那些工具。

## 6 贯穿全课的五个失效模式

这门课的一个隐含主张是：**原子尺度模拟的产出，可靠性取决于你有没有排除下面五个坑。** 每个都会在某一讲被具体展开。

| 失效模式                        | 症状                             | 根因                                                            | 展开处        |
| ------------------------------- | -------------------------------- | --------------------------------------------------------------- | ------------- |
| 电荷缩放到 $\pm0.8e$ 被当成物理 | 发射阈值场偏低、离子对结合能偏低 | 它是补偿缺失极化的经验补丁，强场下必然失效                      | 第 3、4、7 讲 |
| 用 Nernst–Einstein 算电导率     | 系统性高估四成到一倍             | 假设离子独立运动，忽略正负离子强关联                            | 第 3、6 讲    |
| 平衡时间不足                    | 密度/黏度看起来「收敛」          | IL 黏度 $30\text{–}60\ \mathrm{mPa\cdot s}$，弛豫慢一至两个量级 | 第 3 讲       |
| 色散校正缺失                    | 烷基链分层结构错、离子对结合能错 | 标准 GGA 不含 London 色散                                       | 第 2 讲       |
| ReaxFF 训练集外推               | 产物分布看似合理但不可信         | 键级势对训练集外构型无约束                                      | 第 4、8 讲    |

极化力场这一支的存在本身就是对这些失效的系统性回应；用极化力场模拟离子液体与电解质的方法论综述 [8] 把这条路线的现状、代价与适用边界讲得比较完整，本课程第 4 讲以它为骨架。

## 7 与姊妹课程的分工

本课程与[物理信息神经网络：从数学骨架到燃烧与电水动力学](https://tiegenfang.github.io/fangfangfang/courses/pinns/)的分工是一条清晰的界尺：

- **那门课在连续介质尺度上求解多物理场方程**——已知控制方程，要求解，或者从稀疏测量反演参数与源项。
- **本课程在原子尺度上生成机理与参数**——不知道控制方程里的输运系数、反应速率、界面通量该怎么取，从物质的电子结构与分子结构把它们算出来。

两者有实打实的接缝。电喷雾的下游是电水动力学（electrohydrodynamics，即电致流体动力学；此处 EHD 不指弹流润滑，也不指电液传动）：Poisson 方程、电荷守恒方程与 Navier–Stokes 方程的三场耦合，既是那门课第 7 讲的核心，也是本课第 7 讲 MD–Poisson 耦合的下游消费者。把两侧接起来，才是一条从电子结构到推力的完整链条。

## 8 小结

1. 连续介质标度律在离子液体上**不是不准，而是原理上表达不了**发射物种分布、决速步化学身份、以及强非均匀场区的静电响应这三类信息。
2. 三笔可检查的量级账说明为什么必须下到原子尺度：$10\ \mathrm{nm}$ 液滴里有约 $1.4\times10^{4}$ 对离子却只能带约 8 个电荷；$10\ \mathrm{nA}$ 束流对应每 $17\ \mathrm{ps}$ 发射一个离子；屏蔽长度与锥尖曲率半径之比达 $10^{-2}$。
3. 四种方法各有独占能力，选型的依据是「要回答的问题需不需要断键、需不需要电子结构」，而不是「哪个更先进」。
4. 电喷雾与绿色推进剂分解是同一台双模式推力器的两个模式，共用工质、共用表面、共用强电场这个变量。
5. 五个失效模式是全课的暗线。任何一次原子尺度模拟结果，先拿这张表过一遍再决定信不信。

下一讲开始造工具，先看密度泛函理论：为什么标准 GGA 在离子液体上会同时错在两处，以及色散校正与基组叠加误差这两件事必须先做对。

## 参考文献

[1] Wai Siong Chai, Kean How Cheah, Ming-Hsun Wu, Kai Seng Koh, Dashan Sun, Hua Meng. A review on hydroxylammonium nitrate (HAN) decomposition techniques for propulsion application. Acta Astronautica, 2022, 196: 194-214. DOI: 10.1016/j.actaastro.2022.04.011.

[2] Qiangqiang Lu, Fuyao Chen, Lei Xiao, Junqing Yang, Yubing Hu, Guangpu Zhang, Fengqi Zhao, Yinglei Wang, Wei Jiang, Gazi Hao. Advances in the molecular simulation and numerical calculations of the green high-energy oxidant ADN. Materials Today Communications, 2022, 31: 103699. DOI: 10.1016/j.mtcomm.2022.103699.

[3] Steven P. Berg, Joshua L. Rovey. Assessment of Imidazole-Based Ionic Liquids as Dual-Mode Spacecraft Propellants. Journal of Propulsion and Power, 2013, 29: 339-351. DOI: 10.2514/1.b34341.

[4] Steven P. Berg, Joshua Rovey, Benjamin Prince, Shawn Miller, Raymond Bemish. Electrospray of an Energetic Ionic Liquid Monopropellant for Multi-Mode Micropropulsion Applications. 51st AIAA/SAE/ASEE Joint Propulsion Conference [会议论文], 2015. DOI: 10.2514/6.2015-4011.

[5] Sourav Banerjee, Sharath A. Shetty, M.N. Gowrav, Charlie Oommen, Atanu Bhattacharya. Adsorption and decomposition of monopropellant molecule HAN on Pd(100) and Ir(100) surfaces: A DFT study. Surface Science, 2016, 653: 1-10. DOI: 10.1016/j.susc.2016.05.005.

[6] Yang-Bin Zhang, Hong-Meng Li, Guo-Xiu Li, Bao-Zhi Jin, Meng-Kun Hu, Ji-Hong Feng. ReaxFF molecular dynamics study of electric field-driven decomposition in HAN-based ionic liquid propellants. Fuel, 2027, 429: 140763. DOI: 10.1016/j.fuel.2026.140763.

[7] Shehan M. Parmar, Orion Cohen, Kristin A. Persson, Ghanshyam L. Vaghjiani, Jesse G. McDaniel, Richard E. Wirz. Multimode propellant discovery: a computational high-throughput screening paradigm. Journal of Electric Propulsion, 2026, 5: 1. DOI: 10.1007/s44205-025-00174-6.

[8] Dmitry Bedrov, Jean-Philip Piquemal, Oleg Borodin, Alexander D. MacKerell, Benoît Roux, Christian Schröder. Molecular Dynamics Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields. Chemical Reviews, 2019, 119: 7940-7995. DOI: 10.1021/acs.chemrev.8b00763.
