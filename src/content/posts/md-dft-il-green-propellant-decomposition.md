---
author: Tiegen Fang
pubDatetime: 2026-09-05T07:00:00Z
title: 第 8 讲：离子液体作燃料——HAN 与 ADN 的催化分解与反应性模拟
description: 硝酸羟胺与二硝酰胺铵的质子转移引发机理、表面 DFT 势垒经 TST 与 Langmuir–Hinshelwood 覆盖度接到催化床设计参数的完整桥接，以及 ReaxFF、含能离子液体自燃与多模式推进的证据边界。
course: md-dft-ionic-liquid
order: 8
tags:
  - 第一性原理
  - 分子动力学
  - 离子液体
  - 绿色推进剂
draft: false
---

前两讲讲的是离子液体在电场下**怎么被发射出去**；这一讲讲它在催化剂上**怎么被烧掉**。同一种工质、同一套 DFT 与 MD 工具箱、两个方向的能量耦合——这正是多模式微推进的物理基础。而本讲的主产物只有一件东西：一条从 $\Delta E^{\ddagger}$ 走到催化床尺寸、每一步都有公式的链条。

## Table of contents

## 0 术语消歧：三个缩写与三种「MD」

- **HAN**：hydroxylammonium nitrate，硝酸羟胺，$\ce{NH3OH+ NO3-}$——羟铵阳离子与硝酸根组成的离子盐，工程形态是水溶液。**检索必须展开全称**，缩写 HAN 会大量误命中人名、地名与网络术语。
- **ADN**：ammonium dinitramide，二硝酰胺铵，$\ce{NH4N(NO2)2}$，即 $\ce{NH4+ N(NO2)2-}$。与核酸语境下的 ADN 缩写无关。
- **EIL**：energetic ionic liquid，含能离子液体——阴离子或阳离子自身携带氧化/还原当量（$\ce{NO3-}$、$\ce{N(NO2)2-}$、$\ce{[DCA]-}$，后者为 dicyanamide 二氰胺根 $\ce{N(CN)2-}$），于是整个液体同时是燃料和氧化剂。

三种「MD」在本讲同时出现，必须严格区分：

| 名称                  | 势能来源   | 键能否断裂       | 本课程出现处     | 本讲出现处                                |
| --------------------- | ---------- | ---------------- | ---------------- | ----------------------------------------- |
| classical MD          | 经验力场   | 否               | 第 3、4、6、7 讲 | 液相结构与热物性（第 1、5 节）            |
| AIMD / ab initio MD   | 每步算 DFT | 可以，但代价极高 | 第 2、7、8 讲    | 氢促进 ADN 分解（第 4 节）                |
| reactive MD（ReaxFF） | 键级经验势 | 是               | 第 4、8 讲       | HAN 电场驱动分解、ADN 含水体系（第 4 节） |

> [!WARNING]
> **推进剂文献里的 QMD 指 quantum molecular dynamics = ReaxFF 类反应性 MD，不是 quantum dynamics（量子动力学）。** 它不含核量子效应、不做含时波包传播、也不是路径积分。读到本讲第 5 节那篇 2010 年标题带「Quantum Molecular Dynamics」的 hypergolic 文献时，按 ReaxFF 理解，否则会完全误判它的方法与结论强度。

## 1 绿色单组元推进剂的化学底

**HAN** $\ce{NH3OH+ NO3-}$：氧化剂（$\ce{NO3-}$）与燃料（$\ce{NH3OH+}$）在分子水平上已经预混在同一套离子里，工程上按 40–95 wt% 的水溶液使用，含水率是配方的一级自由度 [1]。**ADN** $\ce{NH4N(NO2)2}$：氧化性铵盐，阳离子端是燃料当量、阴离子端是氧化剂，常温为固体，纯度与含水对其稳定性影响很大，实际使用时与燃料或离子液体燃料配成推进剂 [2]。

与肼类的取舍要诚实：$\ce{N2H4}$ 与 MMH 的比冲与密度比冲并不逊于 HAN/ADN 配方，绿色替代的真实驱动力是**毒性与操作成本**——肼类剧毒且被列为致癌物，需要全套防护工装与地面设施，而 HAN/ADN 可以在普通洁净间加注 [1][2]。但「绿色」是相对的：两者本身仍是强氧化剂，与可燃物接触即构成事故源项，且分解主产物 $\ce{N2O}$ 的百年尺度增温潜势是 $\ce{CO2}$ 的数百倍，还会带出 $\ce{NO_x}$。

## 2 分解机理：一切都从一次质子转移开始

这是团簇级 DFT 能提供、而宏观动力学拟合原理上提供不了的信息。

$$
\ce{NH3OH+ + NO3- <=> NH2OH + HNO3}
\tag{8.1}
$$

式 (8.1) 两侧同为 $\ce{N2H4O4}$、净电荷均为 0，质量与电荷双双平衡。一次质子从羟铵阳离子迁到硝酸根，就把一个纯离子体系变成了**含中性活性分子的混合体系**：$\ce{NH2OH}$ 与 $\ce{HNO3}$ 各自走上独立的分解通道，例如

$$
\ce{2NH2OH -> N2 + 2H2O + H2},\qquad \ce{4HNO3 -> 4NO2 + 2H2O + O2}
$$

总包则按选择性不同有若干写法，$\ce{N2}$ 通道 $\ce{NH3OHNO3 -> N2 + 2H2O + O2}$，$\ce{N2O}$ 通道 $\ce{2NH3OHNO3 -> 2N2O + 4H2O + O2}$（两条均已配平）。对气相 HAN 小团簇的理论计算给出的关键结论是：质子确实可以在 $\ce{NH3OH+}$ 与 $\ce{NO3-}$ 之间迁移，且该迁移的势垒对团簇尺寸与配位数高度敏感 [3]；水溶液体系的分子模拟与动力学建模把这条引发步接进了总包机理 [4]；电喷雾串联质谱配合分子动力学进一步在真实液相环境中确认了质子转移与解离通道的共存 [5]。

ADN 完全同构：

$$
\ce{NH4N(NO2)2 <=> NH3 + HN(NO2)2}
\tag{8.2}
$$

随后是骨架的 $\ce{N-N}$ 与 $\ce{N-O}$ 断裂：阴离子侧 $\ce{N(NO2)2- -> N2O + NO3-}$（电荷 $-1$ 守恒），中性酸侧 $\ce{HN(NO2)2 -> N2O + HNO3}$，生成的 $\ce{NH3}$ 与 $\ce{HNO3}$ 复合为 $\ce{NH4NO3}$ 再分解为 $\ce{N2O + 2H2O}$，总包 $\ce{NH4N(NO2)2 -> 2N2O + 2H2O}$。气相 ADN 团簇的质子转移计算 [6] 与第一性原理升华机理研究 [7] 指向同一件事：**升华与分解的入口都是中性分子对，而不是完整离子对**——离子对要额外付一份晶格能。

> [!NOTE]
> 宏观 TGA/Arrhenius 拟合只能给你一个总包 $E_a$ 与一个总包速率，它无法分辨引发步究竟是质子转移还是 $\ce{N-O}$ 均裂。这条分辨能力是本讲全部下游价值的来源：不知道决速步是什么，式 (8.6) 以后的覆盖度就无从写起。

## 3 DFT 侧：表面催化分解与本讲的桥接链条

### 3.1 两个描述符

表面 DFT 交给下游的只有两个数。吸附能

$$
E_{\text{ads}} = E_{\text{slab+adsorbate}} - E_{\text{slab}} - E_{\text{adsorbate}}
\tag{8.3}
$$

（负值表示放热吸附，单位 eV 每吸附单元），以及基元步势垒

$$
\Delta E^{\ddagger} = E_{\text{TS}} - E_{\text{IS}}
\tag{8.4}
$$

其中 TS 为过渡态、IS 为该步初态，两者都在同一表面上，单位 eV。

HAN 的表面 DFT 基座只有一项工作：$\ce{NH3OH+ NO3-}$ 在 Pd(100) 与 Ir(100) 两个表面上的吸附构型、吸附能与分解路径过渡态 [8]。**本讲不代抄其中的数值**——具体吸附能与各基元步势垒须回原文查表；这里要说的是它的方法学位置：它是把式 (8.3)(8.4) 这两个描述符交给推进剂方向的唯一公开来源，且只覆盖两个 (100) 面。

ADN 侧则给出了这条链的完整范本：Cu(111) 上的第一性原理微观动力学模拟，从吸附能与各基元步势垒出发，联立位点平衡，输出表观分解速率与表面覆盖度分布 [9]。

### 3.2 链条：五步，每步一个式子

**第一步：势垒 → 位点速率常数。** 沿用第 2 讲建立的过渡态理论（TST）：

$$
k_{\text{TST}}(T) = \frac{k_{\text{B}}T}{h}\,\frac{Q^{\ddagger}}{Q_{\text{R}}}\,\exp\!\left(-\frac{\Delta E^{\ddagger}}{k_{\text{B}}T}\right)
\tag{8.5}
$$

| 符号                        | 含义                                                | 单位              | 说明                                                                                                                       |
| --------------------------- | --------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| $k_{\text{B}},h$            | Boltzmann 常数、Planck 常数                         | —                 | $k_{\text{B}}T/h = 6.2\times10^{12}\ \mathrm{s^{-1}}$（300 K）、$1.25\times10^{13}$（600 K）、$2.5\times10^{13}$（1200 K） |
| $Q^{\ddagger},Q_{\text{R}}$ | 过渡态与反应物的配分函数（去平动/振动已按惯例分离） | —                 | 本讲取比值 $\approx 1$，即忽略熵修正                                                                                       |
| $\Delta E^{\ddagger}$       | 式 (8.4) 的电子能势垒                               | eV                | 三档示例见下                                                                                                               |
| $k_{\text{TST}}$            | 单位点一级速率常数                                  | $\mathrm{s^{-1}}$ | 严格说应是 $\Delta G^{\ddagger}$；用 $\Delta E^{\ddagger}$ 就把熵因子塞进了 $Q^{\ddagger}/Q_{\text{R}}$                    |

在 600 K（$k_{\text{B}}T = 0.0517\ \mathrm{eV}$）下，**每 $0.119\ \mathrm{eV}$ 换一个数量级**。

**第二步：速率常数 → 表面覆盖度。** Langmuir–Hinshelwood 给出第 $i$ 种吸附质的覆盖度

$$
\theta_i = \frac{K_i p_i}{1+\sum_j K_j p_j},\qquad K_i = K_i^{0}\exp\!\left(-\frac{\Delta H_{\text{ads},i}}{k_{\text{B}}T}\right)
\tag{8.6}
$$

$\theta_i$ 为第 $i$ 种吸附质的覆盖度（无量纲，$0\le\theta_i\le1$）、$p_i$ 为分压（bar）、$K_i$ 为吸附平衡常数（$\text{bar}^{-1}$，由 van't Hoff 式给出，$K_i^{0}$ 为其指前因子、$\Delta H_{\text{ads},i}<0$ 为放热吸附焓）、分母是位点守恒。解离吸附（如 $\ce{O2}$ 占两个位）须把该项换成 $(K_j p_j)^{1/2}$，即压力平方根律。取 $\Delta G_{\text{ads}} = -0.6\ \mathrm{eV}$、600 K，则 $K \approx \exp(11.6) \approx 1.1\times10^{5}\ \text{bar}^{-1}$：$p = 10^{-5}$ bar 时 $\theta = 0.52$，$10^{-3}$ bar 时 $\theta = 0.99$，推进剂床内 $p$ 达 $10^{0}\text{–}10^{1}$ bar 时 $\theta_A \to 1$。**这个饱和结果本身就是设计信息**：床内动力学是零级而不是第一级，且式 (8.6) 里真正有牙齿的抑制项不是水，而是强吸附的碎片（表面 O、OH、NO）。

**第三步：覆盖度 → 表观速率。** 单位几何表面面积的转化通量与单位床体积的表观速率

$$
R'' = \Gamma_s\,\theta_{\text{A}}\,k_{\text{TST}},\qquad r_{\text{app}} = R''\,a_m
\tag{8.7}
$$

$R''$ 为单位几何表面面积的反应通量（$\mathrm{mol\,m^{-2}\,s^{-1}}$，乘摩尔质量 $\ce{NH3OHNO3} = 96\ \mathrm{g/mol}$ 即得质量通量）、$r_{\text{app}}$ 为单位床体积的表观分解速率（$\mathrm{mol\,m^{-3}\,s^{-1}}$）。$\Gamma_s$ 为表面位点密度（$\mathrm{m^{-2}}$）：以面心立方 (100) 平台计，$a \approx 0.384\ \mathrm{nm}$ 给出 $\Gamma_s = 1/a^{2} \approx 6.8\times10^{18}\ \mathrm{m^{-2}}$；$a_m$ 为单位床体积的活性金属面积（$\mathrm{m^{2}/m^{3}_{bed}}$）。$a_m$ 由负载与分散度决定：5 wt% Ir、washcoat 占床质量 20%、骨架密度 $580\ \mathrm{kg/m^3}$、分散度 20%（对应粒径 $\approx 5.5\ \mathrm{nm}$、比表面 $\approx 51\ \mathrm{m^2/g}$）给出 $a_m \approx 3\times10^{5}\ \mathrm{m^2/m^3}$。

**第四步：DFT 势垒 ↔ 实验表观活化能。** 低覆盖极限下把式 (8.6) 代入 (8.7)，$R'' \propto K_Ap_A\exp(-\Delta E^{\ddagger}/k_{\text{B}}T)$，于是

$$
E_a^{\text{app}} = \Delta E^{\ddagger} + \Delta H_{\text{ads}},\qquad \theta_A \ll 1;\qquad E_a^{\text{app}} \approx \Delta E^{\ddagger},\qquad \theta_A \to 1
\tag{8.8}
$$

$E_a^{\text{app}}$ 为实验 Arrhenius 拟合给出的表观活化能（$\mathrm{eV}$ 每分子，乘 $96.5$ 换成 $\mathrm{kJ/mol}$）。两个极限的区别是本讲最容易踩的地方：**低覆盖时表观活化能比 DFT 势垒低一份吸附焓，饱和时它就直接等于势垒。**

> [!WARNING]
> **参考态陷阱。** 式 (8.8) 说明文献里号称「同一个」的 $E_a$ 至少混着三种参考态：气相分子、吸附态、以及自由能 vs 电子能。$\Delta H_{\text{ads}}$ 的量级是 $0.5\text{–}1.5\ \mathrm{eV}$，也就是 $50\text{–}150\ \mathrm{kJ/mol}$——比多数实验表观活化能的整个跨度还大。把 DFT 的 $\Delta E^{\ddagger}$ 与 TGA 拟合的 $E_a$ 直接对比，得到「催化机理不对」的结论，多数时候只是没对齐参考态。

**第五步：表观速率 → 催化床设计参数。** 覆盖度饱和时用零级形式，转化率与床长线性：

$$
X_0 = \frac{R''\,a_m\,L}{u\,c_{\text{A,in}}},\qquad X = 1-\exp(-Da)\ \ (\theta_{\text{A}}\ll1),\qquad Da = \frac{R''a_mL}{uc_{\text{A,in}}}
\tag{8.9}
$$

$X$（或零级形式的 $X_0$）为转化率（无量纲，注意零级形式可以算出 $X_0 > 1$，其倒数即给出完全转化所需床长）、$L$ 床长（m）、$u$ 表观速度（$\mathrm{m/s}$）、$c_{\text{A,in}}$ 入口摩尔浓度（$\mathrm{mol/m^3}$）、$Da$ 为 Damköhler 数（无量纲）。注意两个极限**不能混用**：$\theta_A \to 1$ 时速率与压力无关，$X_0$ 随 $L$ 线性增长而非指数趋近 1；写成一级指数式会系统性把起活温度估偏几十 K。

跑一遍数字。床：$p = 30\ \mathrm{bar}$、$T = 600\ \mathrm{K}$ ⇒ 总浓度 $c = p/k_{\text{B}}T = 601\ \mathrm{mol/m^3}$（入口以推进剂蒸气为主，取 $c_{\text{A,in}} \approx c$）；$u = 1.5\ \mathrm{m/s}$、$L = 5\ \mathrm{mm}$（5 mm 口径。由此确定的质量通量 $G = u\,c_{\text{A,in}}M = 1.5\times601\times0.096 \approx 87\ \mathrm{kg\,m^{-2}\,s^{-1}}$，空速 $u/L = 300\ \mathrm{s^{-1}} = 1.1\times10^{6}\ \mathrm{h^{-1}}$——远高于化工反应器习惯，这是推进剂床的常态）。

| $\Delta E^{\ddagger}$ | $k_{\text{TST}}$(600 K)            | $R''$                                            | $X_0$ | 完全转化所需床长                    |
| --------------------- | ---------------------------------- | ------------------------------------------------ | ----- | ----------------------------------- |
| $1.2\ \mathrm{eV}$    | $1.0\times10^{3}\ \mathrm{s^{-1}}$ | $1.2\times10^{-2}\ \mathrm{mol\,m^{-2}\,s^{-1}}$ | 0.019 | $\approx 26\ \mathrm{cm}$（不实际） |
| $1.0\ \mathrm{eV}$    | $5.0\times10^{4}\ \mathrm{s^{-1}}$ | $0.56\ \mathrm{mol\,m^{-2}\,s^{-1}}$             | 0.93  | $\approx 5.4\ \mathrm{mm}$          |
| $0.8\ \mathrm{eV}$    | $2.4\times10^{6}\ \mathrm{s^{-1}}$ | $27\ \mathrm{mol\,m^{-2}\,s^{-1}}$               | 45    | $\approx 0.11\ \mathrm{mm}$         |

**这就是本讲的落点：$0.2\ \mathrm{eV}$ 的势垒差，等价于三个数量级的床长差，或等价于约 $115\ \mathrm{K}$ 的起活温度代价**（要把 1.2 eV 那一档拉回 $X_0 = 0.93$，需把床温从 600 K 提到约 715 K）。反过来说，一旦 $X_0$ 接近或超过 1，瓶颈就转移到传热与传质（床内放热、液膜蒸发、入口钝化），此时再算更准的势垒对设计没有边际收益——这个判据本身就是桥接链条最有用的产出。

### 3.3 催化剂侧的证据现状

选择性同样被表面改写：HAN 离子液体在催化作用下 NO 生成显著增强 [10]，说明真实体系是**分支网络**而不是单一 $k$；把一个总包 $E_a$ 套在多个通道上是宏观拟合的常规做法，也是它在未测工况外推失败的原因。把 HAN 与咪唑类离子液体燃料共混，分解起始行为与产物分布都会随配比移动——[11] 研究的就是这一类配方，这也是本讲第 6 节双模式工质的化学基础。实验侧的对照来自直流点火研究：HAN 基离子液体推进剂在电流作用下可以直接点火 [12]，与下一节的电场分解模拟构成同一图景的两端。单原子催化剂是最近的一条降低势垒路径：原子分散 Fe 用于含能铵盐，被报为能打破其分解势垒，并给出热解机理与释氧策略 [13]。

## 4 反应性 MD 侧：ReaxFF 的时间演化

DFT 给的是 0 K 上单个基元步的势垒；真实分解是 $10^{3}\text{–}10^{6}$ 个原子在 ns–µs 内跑完整个反应网络。classical MD 拓扑固定、断不了键；AIMD 能断但只到 ps 与数百原子。ReaxFF 用连续键级换取尺度（第 4 讲第 6 节），键级定义为

$$
BO_{ij} = \exp\!\left[-\left(\frac{r_{ij}}{r_0}\right)^{p}\right]
\tag{8.10}
$$

$r_{ij}$ 原子间距、$r_0$ 平衡键长、$p$ 为经验参数（第 4 讲已给出全式与参数化流程）。键级不是 0 就是 1 的世界没有过渡态，所以**ReaxFF 的势垒是被拟合出来的，不是被求解出来的**——这决定了它的可信区间只能在训练集覆盖的构型内谈。对 HAN/ADN 这类同时含 $\ce{N-O}$、$\ce{N-N}$、$\ce{O-H}$ 与质子转移多通道的体系，训练集必须显式包含引发步构型、全部主产物、以及高温高密度反应区，缺一处就在该处失控。

**HAN 基离子液体的电场驱动分解**是本讲与第 6、7 讲的真正交点 [14]：那里电场只是驱动力（压低第 6 讲式 (6.5) 的场蒸发势垒、决定发射物种），到这里电场成为**化学变量**——它改变引发步的选择、驱动离子迁移与碰撞、并在 ns 尺度上改写产物分布。形式上，电场对一个带电/极性反应势垒的最低阶贡献是 Stark 项

$$
\Delta E^{\ddagger}(\mathbf{E}) = \Delta E^{\ddagger}(0) - \Delta\boldsymbol{\mu}\cdot\mathbf{E} - \tfrac{1}{2}\,\Delta\alpha\,E^{2}
\tag{8.11}
$$

$\Delta\boldsymbol{\mu}$ 为过渡态与初态的偶极差（$\mathrm{C\cdot m}$）、$\Delta\alpha$ 极化率差（$\mathrm{C\cdot m^{2}\cdot V^{-1}}$）。取 $\Delta\mu \approx 5\ \mathrm{D} = 1.67\times10^{-29}\ \mathrm{C\cdot m}$、$E = 3\times10^{9}\ \mathrm{V/m}$（第 6 讲锥尖量级），线性项给出 $5\times10^{-20}\ \mathrm{J} \approx 0.3\ \mathrm{eV}$——按 $0.119\ \mathrm{eV}$ 一个数量级的换算，相当于 600 K 下速率提高约两个数量级。**电场在这类体系里不是微扰**；而场越强，固定电荷与电荷缩放的力场越不可信（第 3、7 讲的矛盾在此复现）。

ADN 侧两条：ReaxFF 考察含水量对热分解的影响 [15]——水同时是质子载体与自由基猝灭剂，模拟给出的是速率随含水量的**趋势**，不能当成定量的抑制百分比搬运；AIMD 给出氢促进 ADN 分解的原子图像 [16]，其中氢把 $\ce{N-O}$ 变成好的离去基团，这类电子重排是 ReaxFF 给不出的。

## 5 Hypergolic 离子液体：本讲最薄的一节

含能离子液体与硝酸接触无需外部点火即可着火（hypergolic）。原子尺度的直接文献只有两条：一条 QMD 反应性模拟 [17]（此处的 QMD 即第 0 节定义的 ReaxFF 类反应性 MD，不是量子动力学），一条 classical MD 热物性 [18]。其中 [17] 的类型是 **DTIC 技术报告，无期刊版、未经同行评审**（Crossref 可解析，`type=report`，按本课程规矩标注 `[技术报告]`）。

引发化学仍与式 (8.1)(8.2) 同构——第一步是硝酸给质子：

$$
\ce{N(CN)2- + HNO3 -> HN(CN)2 + NO3-}
$$

（电荷 $-1$ 守恒、原子守恒）。差别在于硝酸大过量且处于强氧化环境，有机阳离子与二氰胺根的氧化在毫秒内放热失控，宏观表现即着火延迟极短。**这条链条上「质子转移 → 氧化放热 → 着火延迟」的定量对应关系目前没有原子尺度证据支撑**，第 5 节的全部内容都应读作可检验假设。

> [!WARNING]
> 本节 2 条文献、1 条非同行评审。任何把本节写成「hypergolic IL 机理已被模拟阐明」的说法都是过度声称，包括本节自己的措辞。

## 6 收束：多模式微推进

把第 6、7、8 讲叠在同一个工质上：**它在电场下发射离子**（第 6、7 讲：场蒸发、团簇选择性、比冲 $10^{3}$–$3\times10^{3}\ \mathrm{s}$），**它在催化剂上释放化学能**（本讲：质子转移引发、表面零级分解，化学模式比冲 $150$–$220\ \mathrm{s}$ 量级 [1]）。前者高比冲低推力，后者推力高几个数量级——同一根毛细管、同一箱液体，两套物理，这就是 dual-mode；再加上第三类能量耦合（直流电场点火 [12]、微波点火 ADN 基离子液体推进剂 [19]）即为 multi-mode。咪唑类离子液体的双模式评估 [20] 与含能离子液体单组元的多模式电喷雾演示 [21] 是这条线的工程出处；最新的走向是把本讲的机理与势垒变成**可批量计算的描述符**，用分解起始温度、比冲与阈值场强反推分子结构的计算高通量筛选范式 [22]。

双模式不是免费的。张力直接写在本讲两节里：电喷雾要求场只改**物理**（低含水、少杂质、不腐蚀发射极），而催化分解希望场与含水都改**化学**；$\ce{[BF4]-}$ 水解产 $\ce{HF}$ 会同时毒化催化剂和啃掉发射器。配方的最优点在两个模式之间被拉扯——这正是 [20][22] 这类评估与筛选工作存在的理由。

## 7 与 continuum 燃烧模型的分工（边界声明）

分子模拟交付给连续介质的是三样东西：机理（哪些步）、速率参数（$A$ 与 $E_a$，或本讲的 $\Delta E^{\ddagger}/\Delta H_{\text{ads}}$）、以及输运物性。燃烧波结构、两相喷雾、推力器内流场与湍流燃烧**不在本课程的范围内**，那是姊妹课程处理连续介质多物理场的第 6 讲：[第 6 讲：燃烧中的 PINNs](https://tiegenfang.github.io/fangfangfang/posts/pinns-combustion/)。

不过交接前该做一次量级体检。层流燃烧速度的 Zeldovich 估计

$$
S_u \sim \left(\frac{\alpha}{\tau_{\text{rxn}}}\right)^{1/2},\qquad \tau_{\text{rxn}} = \frac{1}{k_{\text{TST}}(T)}
\tag{8.12}
$$

$S_u$ 为层流燃烧速度（$\mathrm{m/s}$）、$\alpha = \lambda/(\rho c_p)$ 为热扩散率（$\mathrm{m^2/s}$）、$\tau_{\text{rxn}}$ 为反应时间（s）。HAN 基液体取 $\alpha \approx 5\times10^{-8}\ \mathrm{m^2/s}$：用 $T = 600\ \mathrm{K}$、$k = 5\times10^{4}\ \mathrm{s^{-1}}$（即上表 $1.0\ \mathrm{eV}$ 那一档）得 $S_u \approx 5\ \mathrm{cm/s}$，与液体单组元推进剂 deflagration 的常见量级一致；把同一档势垒推到 1200 K，$k = 1.6\times10^{9}\ \mathrm{s^{-1}}$ 会给出 $S_u \approx 9\ \mathrm{m/s}$，落在凝聚态推进剂实测区间之外两个数量级——**说明高温下瓶颈已不在化学**，而在蒸发、两相雾化与传热。这类「什么时候该停止用动力学说话」的判断，正是本讲与连续介质模型的分工线。

## 诚实声明

1. **hypergolic 含能离子液体的原子尺度文献只有 2 条**，其中 [17] 是 DTIC 技术报告、非同行评审。第 5 节不构成机理共识，只构成一个有出处的研究缺口。
2. **HAN 的表面 DFT 基座非常小**：只有 [8] 一篇 _Surface Science_ 工作（2016，被引 21），且只覆盖 Pd(100) 与 Ir(100) 两个面。本讲只描述它的研究范围与两个描述符的定义，**没有搬运它的任何数值**；不要把第 3.1 节读成「HAN 表面势能面已被标定」。
3. **ADN 的两条关键计算文献都很新且很低引**：Cu(111) 微观动力学 [9]（2024，被引 2）与单原子 Fe [13]（2025，被引 5）。它们与 HAN 侧不构成同一套催化剂谱系，把 Cu(111) 的结论搬到 $\ce{Ir/Al2O3}$ 蜂窝床是没有依据的。
4. **第 3.2 节的数值链条是量级演示**：$\Delta E^{\ddagger}$ 三档、$\Delta G_{\text{ads}} = -0.6\ \mathrm{eV}$、$a_m$、$u$、$L$ 全是为跑通链条设定的示例值，不是任何文献的测量结果。换成文献实测值，算法不变但结论数量级会变——真正可迁移的是式 (8.5)–(8.9) 的**结构**与「$0.12\ \mathrm{eV}$ 换一个数量级」「$0.2\ \mathrm{eV}$ 换三个数量级床长」这类换算关系。
5. **对极新条目的描述限于其题名与主题所声明的范围**。[14]（_Fuel_，Crossref 卷期年 2027）等 2024 年后的低引工作，本讲未逐项复算其数值，涉及具体产物分布与速率的地方一律用「趋势」「范围」措辞。

## 小结

1. HAN 与 ADN 的分解都**从一次质子转移开局**（式 (8.1)(8.2)）：$\ce{NH3OH+ + NO3- <=> NH2OH + HNO3}$、$\ce{NH4N(NO2)2 <=> NH3 + HN(NO2)2}$。这是团簇 DFT 独有、宏观动力学拟合原理上给不出的信息。
2. 桥接链条五步走通：$\Delta E^{\ddagger}$ →（8.5）TST →（8.6）LH 覆盖度 →（8.7）$R''$ 与 $r_{\text{app}}$ →（8.8）表观 $E_a$ →（8.9）床长/起活温度。**每 $0.119\ \mathrm{eV}$ 换一个数量级**，$0.2\ \mathrm{eV}$ 等于三个数量级的床长差。
3. 推进剂床内 $\theta_A \to 1$，动力学是**零级**；零级与一级形式混用会把起活温度估偏几十 K。表观速率一旦够快，瓶颈立刻交给传热传质。
4. $\Delta E^{\ddagger}$ 与实验 $E_a$ 的比较必须先对齐参考态，$\Delta H_{\text{ads}}$ 一项就有 $50\text{–}150\ \mathrm{kJ/mol}$。
5. ReaxFF（文献里的 QMD）用键级势换尺度，**势垒是拟合来的**；电场在 HAN 基 IL 里是化学变量而非纯驱动力，式 (8.11) 给出 $0.3\ \mathrm{eV}$ 量级的 Stark 压低。
6. 同一工质：电场下发射离子（第 6、7 讲）、催化下释放化学能（本讲）——这就是多模式微推进，也是本课程的收束点。

## 参考文献

[1] Wai Siong Chai, Kean How Cheah, Ming-Hsun Wu, Kai Seng Koh 等. A review on hydroxylammonium nitrate (HAN) decomposition techniques for propulsion application. Acta Astronautica, 2022. DOI: 10.1016/j.actaastro.2022.04.011.

[2] Qiangqiang Lu, Fuyao Chen, Lei Xiao, Junqing Yang 等. Advances in the molecular simulation and numerical calculations of the green high-energy oxidant ADN. Materials Today Communications, 2022. DOI: 10.1016/j.mtcomm.2022.103699.

[3] Saman Alavi, Donald L. Thompson. Hydrogen bonding and proton transfer in small hydroxylammonium nitrate clusters: A theoretical study. The Journal of Chemical Physics, 2003. DOI: 10.1063/1.1593011.

[4] Kaiqiang Zhang, Stefan T. Thynell. Thermal Decomposition Mechanism of Aqueous Hydroxylammonium Nitrate (HAN): Molecular Simulation and Kinetic Modeling. The Journal of Physical Chemistry A, 2018. DOI: 10.1021/acs.jpca.8b05351.

[5] Wenjing Zhou, Jianbo Liu, Steven D. Chambreau, Ghanshyam L. Vaghjiani. Structures, proton transfer and dissociation of hydroxylammonium nitrate (HAN) revealed by electrospray ionization tandem mass spectrometry and molecular dynamics simulations. Physical Chemistry Chemical Physics, 2022. DOI: 10.1039/d2cp01571d.

[6] Saman Alavi, Donald L. Thompson. Proton transfer in gas-phase ammonium dinitramide clusters. The Journal of Chemical Physics, 2003. DOI: 10.1063/1.1535439.

[7] R. S. Zhu, Hui-Lung Chen, M. C. Lin. Mechanism and Kinetics for Ammonium Dinitramide (ADN) Sublimation: A First-Principles Study. The Journal of Physical Chemistry A, 2012. DOI: 10.1021/jp307714d.

[8] Sourav Banerjee, Sharath A. Shetty, M.N. Gowrav, Charlie Oommen 等. Adsorption and decomposition of monopropellant molecule HAN on Pd(100) and Ir(100) surfaces: A DFT study. Surface Science, 2016. DOI: 10.1016/j.susc.2016.05.005.

[9] Qingqing Yang, Jianfa Chen, Zihao Yao, Shengwei Deng 等. First principles based microkinetic simulations of ammonium dinitramide decomposition on Cu(111). Materials Today Communications, 2024. DOI: 10.1016/j.mtcomm.2024.110974.

[10] Steven D. Chambreau, Denisia M. Popolan-Vaida, Ghanshyam L. Vaghjiani, Stephen R. Leone. Catalytic Decomposition of Hydroxylammonium Nitrate Ionic Liquid: Enhancement of NO Formation. The Journal of Physical Chemistry Letters, 2017. DOI: 10.1021/acs.jpclett.7b00672.

[11] Steven P. Berg, Joshua L. Rovey. Decomposition of Monopropellant Blends of Hydroxylammonium Nitrate and Imidazole-Based Ionic Liquid Fuels. Journal of Propulsion and Power, 2013. DOI: 10.2514/1.b34584.

[12] Xucan Chen, Yong Tang, Zhaopu Yao, Jiankun Zhuo 等. Experimental investigations on the direct current ignition characteristics of hydroxylammonium nitrate-based ionic liquid propellant. Proceedings of the Combustion Institute, 2024. DOI: 10.1016/j.proci.2024.105342.

[13] Qiangqiang Lu, Yong Kou, Lei Xiao, Jiahao Yu 等. Breaking the energetic ammonium salts decomposition barrier: atomically dispersed Fe catalysts unveil the pyrolysis mechanisms and oxygen release strategies. Journal of Catalysis, 2025. DOI: 10.1016/j.jcat.2025.116357.

[14] Yang-Bin Zhang, Hong-Meng Li, Guo-Xiu Li, Bao-Zhi Jin 等. ReaxFF molecular dynamics study of electric field-driven decomposition in HAN-based ionic liquid propellants. Fuel, 2027. DOI: 10.1016/j.fuel.2026.140763.

[15] Tao Zeng, Rongjie Yang, Dinghua Li, Jianmin Li 等. Reactive Molecular Dynamics Study on the Effect of H2O on the Thermal Decomposition of Ammonium Dinitramide. Propellants, Explosives, Pyrotechnics, 2020. DOI: 10.1002/prep.201900309.

[16] Ling-hua Tan, Jian-hua Xu, Lei Shi, Xu-ran Xu 等. Hydrogen Promoted Decomposition of Ammonium Dinitramide: an ab initio Molecular Dynamics Study. Chinese Journal of Chemical Physics, 2018. DOI: 10.1063/1674-0068/31/cjcp1708161.

[17] Debasis Sengupta, J. V. Cole. Quantum Molecular Dynamics Simulation of Hypergolic Reactions Between an Energetic Ionic Liquid and Nitric Acid. [技术报告] DTIC, 2010. DOI: 10.21236/ada522002.

[18] Justin B. Hooper, Grant D. Smith, Dmitry Bedrov. Thermophysical properties of energetic ionic liquids/nitric acid mixtures: Insights from molecular dynamics simulations. The Journal of Chemical Physics, 2013. DOI: 10.1063/1.4819903.

[19] Jian Cheng, Jinle Cao, Fuwei Li, Zehua Zhang 等. Microwave controlled ignition and combustion characteristics of ADN-based ionic liquid propellant with fast response and environmental friendliness. Chemical Engineering Journal, 2023. DOI: 10.1016/j.cej.2023.144412.

[20] Steven P. Berg, Joshua L. Rovey. Assessment of Imidazole-Based Ionic Liquids as Dual-Mode Spacecraft Propellants. Journal of Propulsion and Power, 2013. DOI: 10.2514/1.b34341.

[21] Steven P. Berg, Joshua Rovey, Benjamin Prince, Shawn Miller 等. Electrospray of an Energetic Ionic Liquid Monopropellant for Multi-Mode Micropropulsion Applications. 51st AIAA/SAE/ASEE Joint Propulsion Conference, 2015. DOI: 10.2514/6.2015-4011.

[22] Shehan M. Parmar, Orion Cohen, Kristin A. Persson, Ghanshyam L. Vaghjiani 等. Multimode propellant discovery: a computational high-throughput screening paradigm. Journal of Electric Propulsion, 2026. DOI: 10.1007/s44205-025-00174-6.
