---
author: Tiegen Fang
pubDatetime: 2026-09-05T01:00:00Z
title: 第 6 讲：电喷雾 I——锥射流、场蒸发与离子发射的分子图像
description: Taylor 锥与 cone-jet 标度律在离子液体上何处成立、何处失效；Rayleigh 极限与场蒸发势垒四项的逐项量级，以及从表面张力、电导率、黏度到发射电流、液滴尺寸与比冲的具体桥接。
course: md-dft-ionic-liquid
order: 6
tags:
  - 分子动力学
  - 离子液体
  - 微推进
draft: false
---

这一讲讲清楚一件事：**连续介质的 cone-jet 标度律能告诉你「会抽出多大电流」，但它原理上说不出「发射出去的是什么东西」。** 而后者恰恰是离子液体微推进的命门——发射裸离子还是发射一团 $\ce{[emim]2[BF4]+}$ 聚集体，直接决定比冲、推力密度和羽流对卫星表面的污染。分子动力学在这里补的不是精度，而是标度律原理上覆盖不到的那部分信息。本讲的方法论骨架来自 Luedtke、Landman 等人把纳米射流、电喷雾与离子场蒸发放进同一个「模拟 + 实验」框架的特征性工作 [1]。

离子液体（ionic liquid, IL）在本文指室温熔融盐。正文统一用方括号式命名，如 $\ce{[emim][BF4]}$（1-ethyl-3-methylimidazolium tetrafluoroborate，文献亦作 EMI-BF4）；引用文献标题时保留其原写法。

## 连续介质给出的第一张图

导电液体在强电场下形成尖锥、锥尖射出一条细 jet、jet 再破碎成带电液滴——这就是 cone-jet 模式，电喷雾最稳定、工程上最有用的工作模式。G. I. Taylor 对**理想导电**液体的静电解给出锥面半角

$$
\theta = 49.3^\circ
\tag{6.1}
$$

即全角 $98.8^\circ$。它是一个纯静电结果：要求锥面为等势面，解拉普拉斯方程得到的超越方程有一对共轭根，取物理解即得 [2]。三个量决定实际形态：毛细时间 $\tau_c = (\rho R^{3}/\gamma)^{1/2}$（惯性–表面张力时间）、电荷弛豫时间

$$
\tau_e = \frac{\varepsilon}{\sigma}
\tag{6.2}
$$

以及电 Bond 数 $Bo_e = \varepsilon_0 E^{2} R/\gamma$。其中 $R$ 为特征曲率半径、$\rho$ 为密度、$\gamma$ 为表面张力、$\sigma$ 为电导率、$\varepsilon = \varepsilon_r\varepsilon_0$ 为液体介电常数、$E$ 为外加电场强度。$Bo_e \gtrsim 1$ 是成锥的最低要求，等价于临界场强 $E_c \sim (\gamma/\varepsilon_0 R)^{1/2}$。

cone-jet 的电流与液滴直径由静电、表面张力与流量三者定住，标度形式为 [3]

$$
I = C_I\left(\gamma\,\sigma\,Q\right)^{1/2}, \qquad r_d = C_d\left(\frac{\varepsilon_0\,Q}{\sigma}\right)^{1/3}
\tag{6.3}
$$

| 符号            | 含义                                                  | 单位                                  |
| --------------- | ----------------------------------------------------- | ------------------------------------- |
| $I$             | cone-jet 发射电流                                     | $\mathrm{A}$                          |
| $Q$             | 体积流量（供液速率）                                  | $\mathrm{m^3/s}$                      |
| $\gamma$        | 气–液表面张力                                         | $\mathrm{N/m}$                        |
| $\sigma$        | 液体电导率                                            | $\mathrm{S/m}$                        |
| $\varepsilon_0$ | 真空介电常数                                          | $\mathrm{F/m}$，$8.854\times10^{-12}$ |
| $r_d$           | 射出液滴半径（jet 半径同量级）                        | $\mathrm{m}$                          |
| $C_I,\ C_d$     | 无量纲系数，$O(1)$，随 $\varepsilon_r$ 与操作模式变化 | 无量纲                                |

> [!NOTE]
> 式 (6.3) 的电流部分常被写成 $I\propto(Q\sigma/\varepsilon_0)^{1/2}$ 的样子。按量纲检查，由 $Q,\sigma,\gamma,\varepsilon_0$ 唯一能拼出的电流量是 $(\gamma\sigma Q)^{1/2}$——$\varepsilon_0$ 只能进无量纲系数 $C_I$。做量级估计用哪个写法都行，但要报出「$10\ \mathrm{nA}$ 还是 $1\ \mu\mathrm{A}$」这类结论，量纲必须写对。

这套标度律有三条成立前提：**连续介质**（液滴远大于分子）、**物性恒定**（$\gamma$、$\sigma$、$\varepsilon$ 取体相值）、**流量足够大**（不贴近最小电流极限）。三条在纳米锥尖上会同时开始松动——这正是本讲后半部分的主题。

## 离子液体为什么必须换个说法

常规电喷雾（ESI-MS 那一支）用挥发性溶剂加支持电解质：液滴射出后溶剂蒸发、电荷重新分配，最后走到 Coulomb explosion 或留下一颗干粒子。**离子液体没有这条路径**——它本身就是盐，没有溶剂可以蒸发掉，射出的物种就是它在液相里的物种：裸离子与中性或带电的聚集体，例如

$$
\ce{[emim]+},\qquad \ce{[BF4]-},\qquad \ce{[emim]2[BF4]+},\qquad \ce{[emim][BF4]2-}
$$

发射物种的分布由此不再是「蒸发历史的副产品」，而**直接由液面上的离子–离子结合能决定**，这才把问题推到原子尺度 [4]。工程回报也很直接：没有中性溶剂蒸发意味着没有沉积污染，纯离子束的荷质比高意味着比冲高一个量级——这是 IL 适合微推进的根本原因。

物性数量级（室温 $\ce{[emim][BF4]}$ 的典型实验值；MD 模型也以这些值为拟合目标 [1][10]）：

| 物性         | 符号            | 典型量级                                        | 与水之比           |
| ------------ | --------------- | ----------------------------------------------- | ------------------ |
| 密度         | $\rho$          | $1.15\text{–}1.25\times10^{3}\ \mathrm{kg/m^3}$ | 1.15               |
| 表面张力     | $\gamma$        | $28\text{–}35\ \mathrm{mN/m}$                   | 0.4                |
| 电导率       | $\sigma$        | $0.1\text{–}0.5\ \mathrm{S/m}$                  | 远低于电解质水溶液 |
| 黏度         | $\eta$          | $28\text{–}60\ \mathrm{mPa\cdot s}$             | 30–60              |
| 相对介电常数 | $\varepsilon_r$ | $10\text{–}15$                                  | 0.15               |

有两点反直觉的推论。第一，电导率虽比水溶液低几个量级，电荷弛豫时间却极短：取 $\varepsilon_r = 12$、$\sigma = 0.15\ \mathrm{S/m}$，式 (6.2) 给 $\tau_e = 12\times8.854\times10^{-12}/0.15 = 0.71\ \mathrm{ns}$；而 $R = 1\ \mu\mathrm{m}$ 锥尖的毛细时间 $\tau_c = (\rho R^3/\gamma)^{1/2} = 0.20\ \mu\mathrm{s}$。**$\tau_c/\tau_e \sim 300$：液体在电喷雾的时间尺度上来得及把电荷输到表面，因而表现接近理想导体**——这反过来解释了式 (6.1) 的 $49.3^\circ$ 为什么在离子液体上依然近似成立。

第二，高黏度不是可以忽略的细节。Ohnesorge 数 $Oh = \eta/(\rho\gamma R)^{1/2}$（无量纲）在 $R = 1\ \mu\mathrm{m}$ 时约 $5.1$，$R = 100\ \mathrm{nm}$ 时约 $16$——**$Oh \gg 1$，离子液体的 cone-jet 处于黏性主导区**，无粘标度律在这个区需要修正，这也是实测电流指数常低于 $1/2$ 的原因之一。

## Rayleigh 极限：一颗纳米液滴带得下多少电荷

半径 $R_d$ 的球形液滴，静电能与表面能竞争，可携带的净电荷上限为 [5]

$$
Q_{\max} = 8\pi\left(\varepsilon_0\,\gamma\,R_d^{3}\right)^{1/2}
\tag{6.4}
$$

取 $\gamma = 30\ \mathrm{mN/m}$、$\rho = 1150\ \mathrm{kg/m^3}$、单个离子对质量 $m_{\text{pair}} = 3.29\times10^{-25}\ \mathrm{kg}$（$\ce{[emim][BF4]}$，$197.9\ \mathrm{g/mol}$），把「液滴装得下多少离子对」与「装得下多少净电荷」摆在一起：

| 液滴半径          | $Q_{\max}$                       | 折合基本电荷数 | 内含离子对数 | 每净电荷对应离子对 |
| ----------------- | -------------------------------- | -------------- | ------------ | ------------------ |
| $2\ \mathrm{nm}$  | $1.16\times10^{-18}\ \mathrm{C}$ | 7.2            | 117          | 16                 |
| $5\ \mathrm{nm}$  | $4.58\times10^{-18}\ \mathrm{C}$ | 28.6           | 1833         | 64                 |
| $10\ \mathrm{nm}$ | $1.30\times10^{-17}\ \mathrm{C}$ | 80.8           | 14670        | 182                |
| $20\ \mathrm{nm}$ | $3.66\times10^{-17}\ \mathrm{C}$ | 229            | 117300       | 512                |

（基本电荷 $e = 1.602\times10^{-19}\ \mathrm{C}$。）

**这张表是理解离子液体电喷雾的钥匙。** $10\ \mathrm{nm}$ 液滴里有一万四千多个离子对，却只装得下 81 个净电荷——平均每 182 对离子摊一个净电荷；半径缩到 $2\ \mathrm{nm}$，比例立刻升到 16:1，体系已经在「离子发射」与「液滴发射」的边界上。**尺度越小，把电荷存在液滴里越不划算，电荷越倾向以单个离子的形式直接离面。** 这就是纯离子发射模式在纳米锥尖占优的物理原因，也解释了 MD 为什么天然选纳米液滴：那不只是算力妥协，而是唯一能同时看到「液滴携带电荷」与「电荷带着液滴走」两种状态的窗口。

液面上的三条出路可以直接按判据排开：

| 通道           | 判据                                              | 连续介质描述             | MD 提供的增量                              |
| -------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------ |
| 锥面形变、射流 | $Bo_e \gtrsim 1$                                  | 界面力平衡               | 曲率半径达 nm 量级时 $\gamma$ 不再是体相值 |
| 离子场蒸发     | 式 (6.5) 的 $\Delta G$ 降到 $k_{\mathrm B}T$ 量级 | 只能当边界条件           | 发射事件离散化，可给物种分布               |
| 库仑裂变       | $Q > Q_{\max}$（式 6.4）                          | 判据明确，但无碎片尺寸谱 | 给出子液滴尺寸与电荷的实际分布             |

## 场蒸发：一个离子究竟怎样离开液面

把表面离子搬到气相需要跨过的势垒，通常拆成四项 [1]：

$$
\Delta G = E_{\text{coh}} + E_{\text{solv}} - q\,\Delta\varphi - \frac{q^{2}}{8\pi\varepsilon_0 R_{\text{drop}}}
\tag{6.5}
$$

| 项                                          | 含义                                                                                           | 单位          | 量级与讨论                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| $E_{\text{coh}}$                            | 内聚能：离子摆脱同类离子构成的液体局部结构的代价                                               | $\mathrm{eV}$ | IL 是纯库仑体系，这是势垒主体，常取 $\sim1\ \mathrm{eV}$ 量级                                            |
| $E_{\text{solv}}$                           | 溶剂化项；IL 语境下即**团簇化/配位结合能**——离子被周围异号离子部分屏蔽，电荷重新局域化要付代价 | $\mathrm{eV}$ | 符号依参考态而变；式 (6.5) 采「把液相能级抬到气相参考」的写法                                            |
| $q\,\Delta\varphi$                          | 外电场在一个分子尺度跃迁距离上对电荷 $q$ 做的功                                                | $\mathrm{eV}$ | 唯一可被工程控制的项，见下                                                                               |
| $q^{2}/(8\pi\varepsilon_0 R_{\text{drop}})$ | 镜像电荷修正：把离子从介电体中拉出时界面感应的镜像势                                           | $\mathrm{eV}$ | 很小；$R_{\text{drop}} = 10\ \mathrm{nm}$、$q=e$ 时 $1.15\times10^{-20}\ \mathrm{J} = 0.07\ \mathrm{eV}$ |

真正管事的是第三项。设离子穿越的特征距离为 $d$（取一个分子尺度，$0.5\ \mathrm{nm}$），电场功为 $eEd$：

| 电场 $E$                                            | $eEd$（$d = 0.5\ \mathrm{nm}$） |
| --------------------------------------------------- | ------------------------------- |
| $10^{8}\ \mathrm{V/m}$（$0.1\ \mathrm{V/nm}$）      | 0.05 eV                         |
| $10^{9}\ \mathrm{V/m}$（$1\ \mathrm{V/nm}$）        | 0.50 eV                         |
| $3\times10^{9}\ \mathrm{V/m}$（$3\ \mathrm{V/nm}$） | 1.50 eV                         |

单个表面位点的发射速率按过渡态形式写

$$
\Gamma = \nu\,\exp\!\left(-\frac{\Delta G}{k_{\mathrm B}T}\right)
\tag{6.6}
$$

$\nu$ 为表面离子垂直液面方向的尝试频率（取振动频率 $\sim10^{12}\ \mathrm{s^{-1}}$）、$k_{\mathrm B}$ 为 Boltzmann 常数、$T$ 为温度（$300\ \mathrm{K}$ 时 $k_{\mathrm B}T = 0.0259\ \mathrm{eV}$）。于是 $\Delta G = 1.0/0.5/0.2\ \mathrm{eV}$ 分别给 $\Gamma = 1.6\times10^{-5}/4.0\times10^{-3}/0.44\ \mathrm{s^{-1}}$：**势垒每降低 $0.3\ \mathrm{eV}$，发射速率提高约 5 个数量级（$e^{0.3/0.0259} \approx 1.1\times10^{5}$）。** 这张表只能读作灵敏度，不能直接当电流——绝对速率还要乘表面位点密度：一颗 $5\ \mathrm{nm}$ 半径的半球液面面积 $2\pi R_{\text{drop}}^{2} = 1.6\times10^{-16}\ \mathrm{m^2}$，按每个离子对占 $0.25\ \mathrm{nm^2}$ 得 $6\times10^{2}$ 个位点。反过来做这道算术很有用：要输出 $2\ \mathrm{nA}$（$1.2\times10^{10}$ 个一价离子每秒），每位点速率需 $2\times10^{7}\ \mathrm{s^{-1}}$，对应 $\Delta G \approx 0.3\ \mathrm{eV}$。**有效势垒必须被场压到 $0.3\ \mathrm{eV}$ 量级，电喷雾才会「开」。** 这就是阈值行为的分子来源：发射电流对电压是 Boltzmann 型敏感，不是幂律敏感。

顺带澄清一个常被混淆的点：**场蒸发（ion field evaporation）发射的是单体离子或小团簇，不是液滴；它发生在锥尖液面，而不是 jet 破碎之后。** 两条通道在同一根射流上共存，谁主导是式 (6.5) 与式 (6.4) 的竞争。这一区分在 MD 里可以直接数出来：对带电纳米液滴的离子抽取模拟把「哪个离子、在多大场下、以多大动能离面」逐事件记录了下来 [6]；$\ce{[emim][TFSI]}$（1-ethyl-3-methylimidazolium bis(trifluoromethylsulfonyl)imide）液滴在固面与外场中的演化给出了同一图像的另一套独立验证 [7]。

## MD 怎么做，以及会在哪里出错

**建模对象。** 把整个 Taylor 锥模拟出来不现实：锥尖曲率半径是纳米量级，锥的可见部分是微米量级，跨越三个数量级。文献的标准做法是截取一颗带电纳米液滴（$10^{3}$–$10^{5}$ 对离子）加外场，看它形变、发射、裂变。这一支从对液滴施加几何约束的约束动力学起步 [8]，逐步走到自由演化的大体系与混合工质 [9][11]。

> [!WARNING]
> **有限尺度效应必须显式讨论，不能当精度问题糊过去。** 模拟盒子的 $R_{\text{drop}}$ 直接出现在式 (6.5) 的镜像项与式 (6.4) 的 Rayleigh 极限里；真实锥尖的离子数在 $10^{8}$ 以上，比模拟大三个数量级以上。把 $5\ \mathrm{nm}$ 液滴的结论搬到 $1\ \mu\mathrm{m}$ 锥尖，是**尺度外推**而不是模拟结果。规范做法是报告发射场强随 $R_{\text{drop}}^{-1}$ 或 $R_{\text{drop}}^{-3/2}$ 的标度关系再外推 [6][9]；而式 (6.4) 本身在 $R_d \lesssim 2\ \mathrm{nm}$（只剩百来个离子对）时已越出自己的连续介质假设。

**电场的施加方式是一个非物理的自由度。** 两种做法：加均匀外场（不显式画电极），或放显式电极并自洽解 Poisson 方程。前者省事但丢掉了电极的镜像响应，而镜像响应正是式 (6.5) 的第四项——等于人为删掉自己打算算的东西。把 MD 与三维 Poisson 求解器耦合是更干净的路线（第 7 讲详述），代价是算力。

**力场决定一切。** 这是本讲与第 3、4 讲的接口，也是近一批工作反复验证的结论：相互作用势的选取会显著移动发射阈值场 [10]，混合工质的组分配比则改变发射物种谱 [11]。三条具体的因果链：

- 固定电荷力场把部分电荷缩放到 $\pm0.8e$（第 3 讲第 5 节的经验补丁）会**系统性压低 $E_{\text{coh}} + E_{\text{solv}}$**，于是式 (6.5) 前两项被低估、发射场强被低估；
- 极化缺失在锥尖这种强非均匀场区后果最重——那里的屏蔽与体相完全不同，而 $\pm0.8e$ 恰恰是从体相平均里标定出来的；
- 电导率若用 Nernst–Einstein 关系估计会高估约四成到一倍（第 3 讲第 4 节），而 $\sigma$ 以 $1/2$ 次幂进式 (6.3)：**高估四成会把电流高估约 18%，高估一倍会把电流高估约 41%**——误差照单全收地传到宏观预测上。

**时间尺度与拓扑是硬边界。** 固定拓扑的 classical MD 里键不会断。所以 $\ce{[emim]+}$ 会不会脱烷基、$\ce{[BF4]-}$ 会不会解离出 $\ce{HF}$，classical MD 原则上答不了——那是第 7 讲 AIMD 的任务，不是把 classical MD 跑得更久就能换来的信息。

## 桥接：从 $\gamma$、$\sigma$、$\eta$ 到电流、液滴直径与比冲

链条是：**模拟给出物性 → 物性代入标度律 → 标度律给出电流与液滴直径 → 发射物种的荷质比给出比冲与推力。**

**第一步，物性输入。** 平衡态 MD 给 $\gamma$、$\eta$、$\sigma$、$\rho$（第 3 讲）。$\sigma$ 必须用 Green–Kubo 集体电流，且平衡时间要按 IL 的慢弛豫标准检查；$\gamma$ 用压力张量积分法。**不能用 Nernst–Einstein 的 $\sigma$**，理由见上一节的误差传播。

**第二步，电流与直径。** 取 $\gamma = 30\ \mathrm{mN/m}$、$\sigma = 0.15\ \mathrm{S/m}$、单发射器流量 $Q = 1\times10^{-16}\ \mathrm{m^3/s}$（约 $6\times10^{-3}\ \mathrm{nL/min}$，发射器阵列的实际工作点），$C_I = 3.1$、$C_d = 2$ 代入式 (6.3)：

$$
I = 3.1\left(0.030\times0.15\times10^{-16}\right)^{1/2} = 2.1\ \mathrm{nA}
$$

$$
r_d = 2\left(\frac{8.854\times10^{-12}\times10^{-16}}{0.15}\right)^{1/3} = 3.6\ \mathrm{nm}
$$

同一工况下的质量收支更能说明问题。供液质量流率 $\dot m_{\text{feed}} = Q\rho = 1.15\times10^{-13}\ \mathrm{kg/s}$；$2.1\ \mathrm{nA}$ 的裸离子束只有 $1.3\times10^{10}$ 个离子每秒，合 $\dot m = 2.4\times10^{-15}\ \mathrm{kg/s}$，**即只吃掉供液的 2%**。同样这 $2.1\ \mathrm{nA}$ 若改由 $10\ \mathrm{nm}$ 的 Rayleigh 带电液滴携带（每滴 $81e$、$4.8\times10^{-21}\ \mathrm{kg}$），则需要 $1.6\times10^{8}$ 滴每秒、$\dot m = 7.8\times10^{-13}\ \mathrm{kg/s}$，**是供液的 6.8 倍——这个工作点在质量上根本撑不起来**。结论很重要：纯离子模式下发射是**表面过程**，电流与流量在质量上并不绑定；式 (6.3) 把两者绑在一起的前提是「电荷随液体一起走」。这条前提什么时候破，正是 MD 与连续介质模型的分界线 [1]。

**第三步，推力与比冲。** 电荷 $q$、质量 $m$ 的物种被束压 $V_b$ 加速：

$$
v_e = \left(\frac{2qV_b}{m}\right)^{1/2},\qquad
F = I\left(\frac{2mV_b}{q}\right)^{1/2} = \dot m\,v_e,\qquad
I_{\text{sp}} = \frac{F}{\dot m\,g_0} = \frac{v_e}{g_0}
\tag{6.7}
$$

$v_e$ 为有效排气速度、$\dot m$ 为喷质量流率（$\mathrm{kg/s}$）、$F$ 为推力（$\mathrm{N}$）、$g_0 = 9.80665\ \mathrm{m/s^2}$ 为标准重力加速度（比冲以「秒」为单位正是来自这个约定）。取 $\ce{[emim]+}$（$m = 111.1\ \mathrm{u} = 1.84\times10^{-25}\ \mathrm{kg}$，$q = e$，$1\ \mathrm{u} = 1.661\times10^{-27}\ \mathrm{kg}$）、$V_b = 5\ \mathrm{kV}$，得 $v_e = 9.3\times10^{4}\ \mathrm{m/s}$、$I_{\text{sp}} = 9500\ \mathrm{s}$、$F/I = 0.107\ \mathrm{N/A}$，即 $2.1\ \mathrm{nA}$ 给 $0.22\ \mathrm{nN}$。

**第四步，落点：为什么实测比冲只有 $10^{3}$–$3\times10^{3}\ \mathrm{s}$。** 式 (6.7) 里唯一的化学旋钮是荷质比。把三类真可能发射的物种摆开（$V_b = 5\ \mathrm{kV}$，液滴电荷取式 (6.4) 的 Rayleigh 上限）：

| 发射物种                     | 质量                              | 电荷  | $v_e$                           | $I_{\text{sp}}$ | $F/I$     |
| ---------------------------- | --------------------------------- | ----- | ------------------------------- | --------------- | --------- |
| $\ce{[emim]+}$               | $1.84\times10^{-25}\ \mathrm{kg}$ | $1e$  | $9.3\times10^{4}\ \mathrm{m/s}$ | 9500 s          | 0.107 N/A |
| $\ce{[emim]2[BF4]+}$         | $5.12\times10^{-25}\ \mathrm{kg}$ | $1e$  | $5.6\times10^{4}\ \mathrm{m/s}$ | 5700 s          | 0.064 N/A |
| $R_d = 10\ \mathrm{nm}$ 液滴 | $4.82\times10^{-21}\ \mathrm{kg}$ | $81e$ | $5.2\times10^{3}\ \mathrm{m/s}$ | 530 s           | 1.93 N/A  |

裸离子与团簇之间只差 $\sqrt{m_2/m_1}$，即 1.7 倍；**真正把比冲打到三位数的是液滴通道**——而液滴通道的 $F/I$ 反而高 18 倍。「高比冲」与「高推力密度」在同一个工质上直接对冲，工作点选哪边取决于任务（长期姿态微调要比冲，快速机动要推力）。式 (6.7) 对单一物种成立；实际束流是多物种叠加，此时比冲是**按质量流率加权**的速度平均：

$$
\dot m_\alpha = I_\alpha\frac{m_\alpha}{q_\alpha},\qquad
I_{\text{sp}} = \frac{\sum_\alpha \dot m_\alpha\, v_{e,\alpha}}{g_0\sum_\alpha \dot m_\alpha},\qquad
\sum_\alpha I_\alpha = I
\tag{6.8}
$$

$I_\alpha$ 为物种 $\alpha$ 携带的电流（$\mathrm{A}$）、$\dot m_\alpha$ 为其质量流率（$\mathrm{kg/s}$）、$v_{e,\alpha}$ 由式 (6.7) 给出。**加权用的是 $\dot m$ 而不是 $I$**，后果非常直接：用上面那张表算，只要有 $1.6\%$ 的电流以 $10\ \mathrm{nm}$ 液滴形式发射，这部分就带走 $84\%$ 的质量，比冲立刻从 $9500\ \mathrm{s}$ 落到 $2000\ \mathrm{s}$；电流份额升到 $5\%$，只剩约 $1000\ \mathrm{s}$。等价地，实测 $2000\ \mathrm{s}$ 对应的等效荷质比是裸离子的 $0.21^{2} \approx 1/22$——团簇只解释其中 1.7 倍，剩下的全压在「极少量、极大质量」的物种上。**比冲损失首先是一个质量份额问题，而不是效率问题。**

> [!WARNING]
> 把式 (6.8) 的权重写成电流份额 $\xi_\alpha$ 是这个方向推导里最容易犯的一步：它给出的「混合比冲」永远接近裸离子值，于是液滴通道的影响被系统性吞掉，实测与理论的差距会被误读成电压利用率问题。判据很简单——比冲的定义里出现的是 $\dot m$，任何多物种平均都必须跟着它走。
>
> 顺带排除另一个常见担忧：束流受不受空间电荷限制？按 Child–Langmuir 形式 $J_{\text{CL}} = \frac{4}{9}\varepsilon_0(2q/m)^{1/2}V_b^{3/2}/d^{2}$（$d$ 为加速间隙），$\ce{[emim]+}$、$5\ \mathrm{kV}$、$d = 1\ \mathrm{mm}$ 给 $J_{\text{CL}} \approx 1.8\times10^{3}\ \mathrm{A/m^2} = 0.18\ \mathrm{A/cm^2}$，而单发射器 $2\ \mathrm{nA}$ 摊在纳米锥尖上的等效流密度远在这条线之外。**nA 级离子束不受空间电荷限制**，比冲的账不能算到它头上。

回扣第 3 节那张表：锥尖尺度越小、可存电荷越少，工作点越靠近裸离子发射，比冲越高。**把发射器从微米锥尖推向纳米锥尖，本质是拿 $q/m$ 换比冲**；而「哪些团簇在什么场强下会碎成什么」这类问题，标度律完全无从回答。

## 小结

1. 式 (6.1)–(6.3) 这套连续介质图像在离子液体上**依然近似成立**，理由很具体：$\tau_e \approx 0.7\ \mathrm{ns}$ 比毛细时间快两个多数量级，液体在发射时间尺度上接近理想导体。
2. 但它原理上给不出发射物种分布，而分布决定比冲。$10\ \mathrm{nm}$ 液滴只能带 81 个净电荷、内含 $1.5\times10^{4}$ 对离子——纳米尺度上电荷宁可单独离面。
3. 场蒸发势垒由式 (6.5) 四项组成，只有 $q\Delta\varphi$ 可被工程调节；$10^{8}\to10^{9}\ \mathrm{V/m}$ 让 $eEd$ 从 $0.05$ 到 $0.5\ \mathrm{eV}$，按式 (6.6) 就是近 8 个数量级（$e^{0.45/0.0259} \approx 4\times10^{7}$）。**发射电流对电压是指数敏感。**
4. MD 必须交代的三个坑：$R_{\text{drop}}$ 的有限尺度外推、均匀场对镜像项的破坏、力场（电荷缩放与极化缺失）对发射阈值的系统性移动。
5. 桥接链条落到具体数字：$Q = 10^{-16}\ \mathrm{m^3/s}$ → $I \approx 2.1\ \mathrm{nA}$、$r_d \approx 3.6\ \mathrm{nm}$ → $F \approx 0.22\ \mathrm{nN}$（$5\ \mathrm{kV}$、裸离子）→ $I_{\text{sp}}$ 上限 $9500\ \mathrm{s}$。而式 (6.8) 的权重是质量流率：**$1.6\%$ 的电流走 $10\ \mathrm{nm}$ 液滴通道，就带走 $84\%$ 的质量，把比冲拖到 $2000\ \mathrm{s}$。** 比冲损失首先是物种与质量份额问题，其次才是效率问题。

第 7 讲接这条链条的上下游：上游是发射器表面吸附如何改变起始电压（DFT），下游是 $\ce{[emim][BF4]}$ 在加速与碰撞中的碎裂（AIMD），以及把本讲的「加均匀场」换成真正的 MD–Poisson 自洽耦合。

## 参考文献

[1] W. D. Luedtke, Uzi Landman, Y.-H. Chiu, D. J. Levandier 等. Nanojets, Electrospray, and Ion Field Evaporation: Molecular Dynamics Simulations and Laboratory Experiments. The Journal of Physical Chemistry A, 2008. DOI: 10.1021/jp804585y.

[2] Geoffrey Ingram Taylor. Disintegration of water drops in an electric field. Proceedings of the Royal Society of London. Series A, 1964. DOI: 10.1098/rspa.1964.0151.

[3] A. M. Gañán-Calvo, J. Dávila, A. Barrero. Current and droplet size in the electrospraying of liquids. Scaling laws. Journal of Aerosol Science, 1997. DOI: 10.1016/s0021-8502(96)00433-8.（DOI 串里的 `96` 是投稿年，发表年为 1997）

[4] D. Garoz, C. Bueno, C. Larriba, S. Castro, I. Romero-Sanz, J. Fernandez de la Mora. Taylor cones of ionic liquids from capillary tubes as sources of pure ions: The role of surface tension and electrical conductivity. Journal of Applied Physics, 2007. DOI: 10.1063/1.2783769.

[5] Lord Rayleigh (J. W. Strutt). On the equilibrium of liquid conducting masses charged with electricity. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 1882. DOI: 10.1080/14786448208628425.

[6] Takaaki Enomoto, Shehan M. Parmar, Ryohei Yamada, Richard E. Wirz 等. Molecular Dynamics Simulations of Ion Extraction from Nanodroplets for Ionic Liquid Electrospray Thrusters. Journal of Electric Propulsion, 2022. DOI: 10.1007/s44205-022-00010-1.

[7] Dengpan Dong, Jenel P. Vatamanu, Xiaoyu Wei, Dmitry Bedrov. The 1-ethyl-3-methylimidazolium bis(trifluoro-methylsulfonyl)-imide ionic liquid nanodroplets on solid surfaces and in electric field: A molecular dynamics simulation study. The Journal of Chemical Physics, 2018. DOI: 10.1063/1.5016309.

[8] Arnaud Borner, Zheng Li, Deborah A. Levin. Modeling of an ionic liquid electrospray using molecular dynamics with constraints. The Journal of Chemical Physics, 2012. DOI: 10.1063/1.3696006.

[9] Arnaud Borner, Zheng Li, Deborah A. Levin. Prediction of Fundamental Properties of Ionic Liquid Electrospray Thrusters using Molecular Dynamics. The Journal of Physical Chemistry B, 2013. DOI: 10.1021/jp402092e.

[10] Jinrui Zhang, Guobiao Cai, Xuhui Liu, Bijiao He 等. Molecular dynamics simulation of ionic liquid electrospray: Revealing the effects of interaction potential models. Acta Astronautica, 2021. DOI: 10.1016/j.actaastro.2020.11.018.

[11] Weijie Zheng, Xuhui Liu, Jinrui Zhang, Yufeng Cheng 等. Molecular dynamics simulation of ionic liquid electrospray: Microscopic presentation of the effects of mixed ionic liquids. International Journal of Heat and Mass Transfer, 2022. DOI: 10.1016/j.ijheatmasstransfer.2021.121983.

> [!NOTE]
> **文献集中度与缺口声明。** 本讲 [8][9] 与第 7 讲的 MD–Poisson 耦合工作同出 Borner–Li–Levin / Borner–Levin 一条线，应读作一个团队的技术路线而非学界共识；[10][11] 亦为同一团队的系列工作。此外式 (6.1)、(6.4) 的原始出处（[2][5]）与 [3][4] 的题名和 DOI 尚未逐条经 Crossref 回查，按本博客的硬规矩一律标「待补」而不猜编号。所幸这几条只用到量级与幂次，不依赖具体系数，本讲的桥接结论不受影响。
