---
author: Tiegen Fang
pubDatetime: 2026-09-05T03:00:00Z
title: 第 3 讲：MD 骨架——系综、长程静电与输运量
description: 时间步上限怎么定、恒温恒压器如何污染输运量、Ewald 三项与 tin-foil 边界条件为什么必须显式声明，以及 Nernst–Einstein 电导率为什么会把离子液体高估四成到一倍。另附 ±0.8e 缩放在强电场下必然失效的原因。
course: md-dft-ionic-liquid
order: 3
tags:
  - 分子动力学
  - 离子液体
draft: false
---

第 2 讲把力交给了 DFT，代价是百原子、几十 ps。这一讲把力换成解析表达式，换取三到六个数量级的尺度，然后立刻面对一个问题：**换来的尺度里，哪些量是真的，哪些是算法伪迹。** 本讲有四条硬结论——静电不能截断、Langevin 恒温会毁掉输运量、"平衡了 1 ns" 对离子液体通常等于没平衡、Nernst–Einstein 电导率系统性偏高。四条都会给出可算的判据。

**术语先钉死。** 本讲讲的是 **classical MD**：势能 $U$ 由经验力场给出（第 4 讲），原子拓扑固定，**键不会断裂**。它不同于第 2 讲的 AIMD（每步算 DFT，键可以断），也不同于 reactive MD（ReaxFF 类键级势，键按设计断裂）。本课程三种方法不得混用。

## 1 运动方程与积分

$$
m_i\ddot{\mathbf r}_i = -\nabla_i U(\mathbf r_1,\dots,\mathbf r_N),\qquad i=1,\dots,N
\tag{3.1}
$$

$m_i$ 第 $i$ 个原子质量（$\mathrm{kg}$ 或 $\mathrm{u}$）、$\mathbf r_i$ 位置、$\nabla_i$ 对第 $i$ 个原子坐标的梯度、$U$ 势能面（第 4 讲的力场解析式）。$N$ 个二阶方程等价于 $6N$ 个一阶方程，相空间体积元 $\mathrm d\Gamma=\mathrm d\mathbf r^N\mathrm d\mathbf p^N$。

数值积分用 velocity-Verlet：

$$
\begin{aligned}
\mathbf r_i(t+\Delta t) &= \mathbf r_i(t) + \mathbf v_i(t)\,\Delta t + \frac{\mathbf f_i(t)}{2m_i}\,\Delta t^2\\[2pt]
\mathbf v_i\!\left(t+\tfrac{\Delta t}{2}\right) &= \mathbf v_i(t) + \frac{\mathbf f_i(t)}{2m_i}\,\Delta t\\[2pt]
\mathbf f_i(t+\Delta t) &= -\nabla_i U\big(\mathbf r(t+\Delta t)\big)\\[2pt]
\mathbf v_i(t+\Delta t) &= \mathbf v_i\!\left(t+\tfrac{\Delta t}{2}\right) + \frac{\mathbf f_i(t+\Delta t)}{2m_i}\,\Delta t
\end{aligned}
\tag{3.2}
$$

$\mathbf f_i$ 是第 $i$ 个原子受力。式 (3.2) 是**辛**（保相体积）且**时间可逆**的算法，局部截断误差 $O(\Delta t^3)$、全局轨道误差 $O(\Delta t^2)$，总能量在定长轨迹上只作有界振荡而不单调漂移——这是长时间积分能做统计平均的前提。第 2 讲的 BOMD 用的也是它，只是 $\mathbf f$ 的来源换成一次 SCF。

**时间步上限由最快振动决定，不是由"看起来稳不稳"决定。** 经验规则是 $\Delta t \lesssim T_{\text{vib}}/10$，$T_{\text{vib}}$ 为最短振动周期。离子液体里的候选模式：

| 运动                           | 典型波数                      | 周期 $T_{\text{vib}}=c/\tilde\nu$ | 允许 $\Delta t$ |
| ------------------------------ | ----------------------------- | --------------------------------- | --------------- |
| 芳环/烷基 $\ce{C-H}$ 伸缩      | $\sim 3000\ \mathrm{cm^{-1}}$ | 11 fs                             | 1.1 fs          |
| $\ce{CH2}$ 剪式弯曲            | $\sim 1450\ \mathrm{cm^{-1}}$ | 23 fs                             | 2.3 fs          |
| $\ce{BF4-}$ 的 $\ce{B-F}$ 伸缩 | $\sim 1050\ \mathrm{cm^{-1}}$ | 32 fs                             | 3.2 fs          |
| 离子间平移（晶格/溶剂化壳）    | $\sim 50\ \mathrm{cm^{-1}}$   | 0.67 ps                           | 不限            |

所以"含 C–H 的离子液体用 1 fs"就是表第一行除以 10。把氢约束进刚性分子（SHAKE/RATTLE/SETTLE）后最快模式退到第二行，$\Delta t$ 才能给到 2 fs——这是文献里 2 fs 的由来，不是自由参数。

> [!WARNING]
> **约束会改变温度的算法。** 瞬时温度由能量均分给出
>
> $$
> k_{\mathrm B}T = \frac{1}{N_f}\sum_i m_i\left\lvert\mathbf v_i\right\rvert^2
> \tag{3.3}
> $$
>
> $N_f$ 是**未被约束的自由度个数**，$k_{\mathrm B}$ 为 Boltzmann 常数。刚性分子每增加一个约束就少一个自由度：一个 3 原子分子加 3 个约束（两键一角）后 $N_f = 9-3 = 6$，而代码若仍按 $3N=9$ 归一，同一份动能会被报成 $2/3$ 的温度，恒温器于是持续注入能量，**实际温度比设定值高 50%**。用刚性离子做 IL 模拟时这一项必须逐行确认，它不会被任何收敛测试发现。

## 2 系综、恒温恒压与"平衡了多久"

正则系综里任何相函数 $A$ 的期望

$$
\langle A\rangle = \frac{1}{Z_{NVT}}\int \frac{\mathrm d\Gamma}{h^{3N}N!}\,A(\Gamma)\,e^{-\beta H(\Gamma)},\qquad
Z_{NVT}=\int\frac{\mathrm d\Gamma}{h^{3N}N!}e^{-\beta H},\qquad \beta=\frac{1}{k_{\mathrm B}T}
\tag{3.4}
$$

$h$ 为 Planck 常数、$N!$ 是全同粒子计数、$\beta$ 为逆温度。NVE 是 $\beta\to$ 固定总能的微正则极限；NPT 再多积一次体积，$Z_{NPT}=\int \mathrm dV\,Z_{NVT}(V)\,e^{-\beta P_{\text{ext}}V}$，密度 $\rho_m = Nm/\langle V\rangle$ 因此是**系综平均**而不是输入参数。

**Nosé–Hoover（推荐用于输运量）[1][2]。** 引入一个额外的摩擦变量 $\xi$ 及其 fictitious 惯量 $Q$：

$$
\dot{\mathbf r}_i = \frac{\mathbf p_i}{m_i},\qquad
\dot{\mathbf p}_i = \mathbf f_i - \xi\,\mathbf p_i,\qquad
\dot\xi = \frac{1}{Q}\left(\sum_i\frac{\left\lvert\mathbf p_i\right\rvert^2}{m_i} - N_f k_{\mathrm B}T_0\right)
\tag{3.5}
$$

$\mathbf p_i$ 为动量、$T_0$ 为目标温度、$Q$ 的单位是作用量（$\mathrm{J\,s}$）。扩展系统的守恒量 $H'=\sum_i|\mathbf p_i|^2/2m_i+U+Q\xi^2/2+N_fk_{\mathrm B}T_0\xi$ 取代真实哈密顿量，真实正则分布来自对 $(\mathbf p,\xi)$ 的正确加权。要点是**它不产生随机力，动量与角动量严格守恒**。单个 $\xi$ 对刚性/多尺度系统遍历性不足，实际用 $M$ 级 Nosé–Hoover 链（NHC），并把阻尼时间设成远慢于结构弛豫（见下）。

**Langevin（此处是陷阱）。**

$$
m_i\dot{\mathbf v}_i = \mathbf f_i - m_i\gamma\mathbf v_i + \sqrt{2m_ik_{\mathrm B}T\gamma}\;\boldsymbol\eta_i(t)
\tag{3.6}
$$

$\gamma$ 为摩擦系数（$\mathrm{s^{-1}}$）、$\boldsymbol\eta_i$ 为高斯白噪声（$\langle\eta_{i\alpha}(t)\eta_{j\beta}(t')\rangle=\delta_{ij}\delta_{\alpha\beta}\delta(t-t')$）。噪声逐项注入动量，**总动量不守恒**。于是应力自相关函数与电流自相关函数都被人为的随机冲量污染——第 4 节的 $\eta$、$\sigma$ 全废。副作用还有"帮你更快平衡"：$\gamma$ 越大越像过阻尼运动，慢模式被强行拉平，看到的收敛是人为的。**规则：平衡阶段可以短用 Langevin 探路，生产阶段与一切输运量测量用 NVE 或 NHC 弱耦合 NVT。**

**Parrinello–Rahman [3]。** 把晶胞矩阵 $\mathbf h\in\mathbb R^{3\times3}$（列向量为三条棱）升格为动力学变量，赋予质量 $W$，由内部压力张量与外压之差驱动。它比"只涨不缩"的各向同性标度恒温压器多出三条可独立松弛的剪切分量，对**各向异性体系（界面、表面、纳米液滴）是必需品**。内压用维里表达：

$$
P_{\alpha\beta} = \frac{1}{V}\left(\sum_i m_iv_{i\alpha}v_{i\beta} + \sum_i r_{i\alpha}f_{i\beta}\right)
\tag{3.7}
$$

$v_{i\alpha}$、$r_{i\alpha}$、$f_{i\beta}$ 分别是第 $i$ 个原子速度与位置及受力的 $\alpha,\beta$ 分量。第一项是动能（理想气体）贡献、第二项是维里贡献。IL 的强静电使维里项主导，而**非对角分量的收敛比标量压强慢得多**——只看密度收敛就宣布平衡是不够的。

**IL 特有的头号系统性错误：平衡时间。** 黏度 $30$–$100\ \mathrm{cP}$（$=30$–$100\ \mathrm{mPa\cdot s}$）的体系，其结构弛豫时间可以直接从扩散系数反推：把一次"逃出势箱"当作一个结构事件，特征时间

$$
\tau_\alpha \sim \frac{d^2}{6D}
\tag{3.8}
$$

$d$ 为分子尺度（取离子直径 $0.5\ \mathrm{nm}$）、$D$ 为扩散系数。咪唑类室温离子液体 $D\sim5\times10^{-12}\ \mathrm{m^2/s}$，于是

$$
\tau_\alpha \sim \frac{(5\times10^{-10}\ \mathrm m)^2}{6\times5\times10^{-12}\ \mathrm{m^2/s}} = 8.3\times10^{-9}\ \mathrm s\approx 8\ \mathrm{ns}
$$

（式 (3.8) 的前置因子随维度约定与"一次结构事件"取几个分子直径而变，可在 $2$–$10$ 倍内移动，数量级结论不变。）**也就是说：一段 1 ns 的轨迹平均只覆盖约 $1/8$ 个结构弛豫事件，体系连一次完整的重排都没走完。** 文献中大量"1 ns NPT 后开始测量"的结果，其密度、黏度与电导率都还在瞬态上 [4]。ADN 这类含能盐的熔点与液相性质之所以要用长时间变温胞模拟来定，正是因为相平衡比单相密度慢一个量级 [5]。

> [!NOTE]
> **可操作的收敛判据（本讲给的是量级，不是文献值）。** (i) 生产长度 $t_{\text{prod}}\gtrsim 10\,\tau_\alpha$，对 $D\sim5\times10^{-12}\ \mathrm{m^2/s}$ 即 $\gtrsim 80\ \mathrm{ns}$；(ii) 对密度、$P_{\alpha\beta}$、$D$、$\eta$ 各做**对半分割**与**加倍时长**两组检验，任何一项移动 $>5\%$ 判为未收敛；(iii) 均方位移必须先进入 $\langle r^2\rangle\propto t$ 的线性区再取斜率，且拟合窗口右移后斜率变化 $<10\%$；(iv) 报告 $\tau_\alpha$ 的估计方式，让读者能复核。一个只写"simulated for 1 ns"的 IL 输运系数结果，按本讲判据应当直接视为未收敛。

## 3 长程静电：本讲的核心

离子液体是**纯库仑体系**：没有溶剂稀释，每个离子整体带 $\pm e$ 的整数电荷，位点上的部分电荷也常在 $0.3$–$0.8e$ 之间。$1/r$ 是慢衰减核，其点阵求和**条件收敛**——求和顺序（更准确地说，外部求和区域的**形状**）会改变结果。Ewald 求和 [6] 把这个条件收敛的级数拆成三个各自绝对收敛的部分：

$$
\sum_{i<j}\frac{q_iq_j}{r_{ij}}
=\underbrace{\frac{1}{2V}\sum_{\mathbf k\neq\mathbf 0}\frac{4\pi}{k^2}\,e^{-k^2/4\alpha}\left|\rho(\mathbf k)\right|^2}_{\text{倒空间}}
+\underbrace{\sum_{i<j,\mathbf n}{}'\,q_iq_j\,\frac{\mathrm{erfc}\!\left(\sqrt\alpha\,r_{ij\mathbf n}\right)}{r_{ij\mathbf n}}}_{\text{实空间}}
-\underbrace{\left(\frac{\alpha}{\pi}\right)^{1/2}\sum_i q_i^2}_{\text{自能}}
\tag{3.9}
$$

$\rho(\mathbf k)=\sum_i q_i e^{i\mathbf k\cdot\mathbf r_i}$ 是**电荷结构因子**、$\mathbf k=2\pi\mathbf m/L$（$\mathbf m\in\mathbb Z^3\setminus\{\mathbf 0\}$）为倒格矢、$\alpha$ 为 Ewald 分裂参数（量纲 $L^{-2}$，$\sqrt\alpha$ 叫收敛参数，典型 $\sqrt\alpha\,r_c\approx5$–$6.5$）、$r_{ij\mathbf n}=|\mathbf r_i-\mathbf r_j+\mathbf n L|$ 为含周期像的距离、撇号表示 $\mathbf n=\mathbf 0$ 时略去 $i=j$ 项。实空间项被 $\mathrm{erfc}$ 指数截短（典型 $r_c=1.0$–$1.2\ \mathrm{nm}$），倒空间项被高斯因子截短，自能项减去每个电荷与自身平滑高斯云的重复相互作用。**三项缺一不可**：少自能项则总能量随 $\alpha$ 漂移；少倒空间项则只剩短程屏蔽。

式 (3.9) 的 $\mathbf k=\mathbf 0$ 被显式剔除，这不是技术细节而是**一个物理选择**：剔除该项等价于用介电常数 $\varepsilon_{\text{out}}\to\infty$ 的导体包覆模拟盒（tin-foil 边界条件）。若要求真空边界（$\varepsilon_{\text{out}}=1$），必须补一项与盒子总偶极 $\mathbf M=\sum_iq_i\mathbf r_i$ 有关的表面项

$$
U_{\text{surf}} = \frac{1}{4\pi\varepsilon_0}\,\frac{2\pi}{(2\varepsilon_{\text{out}}+1)V}\left\lvert\mathbf M\right\rvert^2
\tag{3.10}
$$

$\varepsilon_{\text{out}}$ 为环境介电常数（无量纲）、$\varepsilon_0$ 为真空介电常数（式 (3.10) 后的数值估算用到 $1/4\pi\varepsilon_0=8.988\times10^{9}\ \mathrm{N\,m^2\,C^{-2}}$）。两个极限：$\varepsilon_{\text{out}}\to\infty$ 时 $U_{\text{surf}}\to0$（回到式 (3.9)）；$\varepsilon_{\text{out}}=1$ 时 $U_{\text{surf}}=|\mathbf M|^2/(6\varepsilon_0V)$。它有多大？取 $L=4\ \mathrm{nm}$ 的盒（约 250 对离子、$\sim6000$ 原子，$V=6.4\times10^{-26}\ \mathrm{m^3}$），把一对 $\pm0.8e$ 电荷分离一个盒长，$|\mathbf M|\approx0.8\times1.602\times10^{-19}\times4\times10^{-9}=5.1\times10^{-28}\ \mathrm{C\,m}$，则

$$
U_{\text{surf}} = \frac{(5.1\times10^{-28})^2\times8.988\times10^{9}\times2\pi}{3\times6.4\times10^{-26}} = 7.7\times10^{-20}\ \mathrm J = 0.48\ \mathrm{eV}\approx19\,k_{\mathrm B}T
$$

（此处为**量级估算**。）一次这样的分离就要付 $19\,k_{\mathrm B}T$，而式 (3.10) 惩罚的是**任何长波长的电荷分离**，离子液体的介电响应、双电层结构与集体电导恰恰由这类涨落构成。两种边界条件给出的是**两种不同的物理体系**，其静态介电常数可以差数倍。所以：任何 IL 静电求和都必须显式声明 $\mathbf k=\mathbf 0$ 项与 $\varepsilon_{\text{out}}$ 的处理方式——"用了 PME" 不构成可复现描述。

**PPPM / PME 的精度参数。** PME 用 B 样插值把 $\rho(\mathbf k)$ 投到规则网格、做 FFT、再插回粒子，成本从 Ewald 的 $O(N^2)$ 降到 $O(N^{3/2})$ 或 $O(N\log N)$。三个可调量：分裂参数 $\sqrt\alpha$、网格间距 $\Delta_g$、插值阶数 $\mathcal O$（B 样条阶数，常取 4–7）。它们共同决定一个**相对力误差目标**（如 `1e-5`）。三条 IL 专属注意：(i) 这个容差是**逐原子力**的相对误差，而 $\sigma$、$\eta$ 是涨落量，其误差按 $1/\sqrt{t}$ 慢收敛，因此求和精度至少要领先观测量一个量级——测电导率时取 $10^{-5}$ 而不是 $10^{-4}$；(ii) 网格加密会改变 $\langle|\mathbf M|^2\rangle$ 进而改变有效介电响应，必须做**网格无关性检验**并同时报告密度；(iii) 长程项与色散/短程项之间要检查重叠（第 4 讲的 Thole 阻尼同样管这里）。

> [!WARNING]
> **对离子液体，截断静电是致命错误，不是精度妥协。** 三条论证。
> (1) **能量不连续的量级。** 取 $q=0.8e$、$r_c=1.0\ \mathrm{nm}$，被硬截断的那一项本身就有
>
> $$
> \frac{(0.8e)^2}{4\pi\varepsilon_0 r_c}=\frac{332.06\times0.64}{10}\ \mathrm{kcal/mol}=21.3\ \mathrm{kcal/mol}=0.93\ \mathrm{eV}=36\,k_{\mathrm B}T
> $$
>
> （用到 $e^2/4\pi\varepsilon_0=332.06\ \mathrm{kcal\cdot mol^{-1}}\,\text{Å}$，这是单位换算而非测量值。）对照总量级：$\ce{[emim][BF4]}$ 的离子对数密度 $c=3.8\times10^{27}\ \mathrm{m^{-3}}$（由 $\rho_m=1.25\ \mathrm{g/cm^3}$、$M=196\ \mathrm{g/mol}$ 折出）给出 Wigner–Seitz 半径 $a=\left(3/4\pi c\right)^{1/3}=4.0\ \text{Å}$，于是每个离子的裸库仑耦合能 $\frac{1}{4\pi\varepsilon_0}\frac{(0.8e)^2}{a}=\frac{332.06\times0.64}{4.0}=53\ \mathrm{kcal/mol}=2.3\ \mathrm{eV}$，除以 $k_{\mathrm B}T=0.0259\ \mathrm{eV}$ 得耦合参数 $\Gamma\approx90$。截断处每一对跨过分界面的接触释放 $36\,k_{\mathrm B}T$，而整套库仑结合只有 $\sim90\,k_{\mathrm B}T$ 量级——截断误差是**总能量的四成**，不是微扰。
> (2) **它破坏的正是你要测的东西。** 电导率来自长波长的集体电荷输运（第 4 节的 $\mathbf J$）；截断把 $k\to0$ 的集体模式删掉了，你测到的是一个被人为短程化的模型。
> (3) **修不回来。** 平滑 switching 函数消掉力不连续，于是能量守恒了，但式 (3.9) 的倒空间项仍然不存在——**表面上的守恒掩盖了原理上的缺失**，这比不守恒更危险。同样，"加一个 long-range tail correction" 只对各向同性的 LJ 式平均场有效，对条件收敛的库仑和没有良好定义。

## 4 输运量：两条路线与一个会骗人的公式

**Green–Kubo** [7][8] 把输运系数写成流–流自相关的积分。剪切黏度与离子电导率分别是

$$
\eta = \frac{V}{k_{\mathrm B}T}\int_0^\infty\big\langle P_{\alpha\beta}(0)\,P_{\alpha\beta}(t)\big\rangle\,\mathrm dt,\qquad \alpha\neq\beta
\tag{3.11}
$$

$$
\sigma = \frac{1}{3Vk_{\mathrm B}T}\int_0^\infty\big\langle\mathbf J(0)\cdot\mathbf J(t)\big\rangle\,\mathrm dt,\qquad
\mathbf J(t)=\sum_{i}z_ie\,\mathbf v_i(t)
\tag{3.12}
$$

$P_{\alpha\beta}$ 为式 (3.7) 的非对角应力张量分量（无量纲化前的压强单位 $\mathrm{Pa}$）、$\mathbf J$ 是**电荷电流密度**（$\mathrm{C\,m^{-2}\,s^{-1}}$）、$z_i$ 为第 $i$ 个离子的形式电荷数（$\pm1$）。注意式 (3.12) 的求和**跨所有离子**，因此展开后含 $i\neq j$ 的交叉项——这正是式 (3.11)(3.12) 与下一节公式的本质差别。

**Einstein** 关系给扩散系数：

$$
D = \lim_{t\to\infty}\frac{1}{6t}\Big\langle\left\lvert\mathbf r_i(t)-\mathbf r_i(0)\right\rvert^2\Big\rangle
\tag{3.13}
$$

同一写法对 $\mathbf J$ 的积分位移 $\mathbf R_Q(t)=\int_0^t\mathbf J\,\mathrm dt'$ 也成立，即 $\sigma=\langle|\mathbf R_Q|^2\rangle/(6Vk_{\mathrm B}Tt)$——这是数值上比式 (3.12) 更稳的做法（不必截断一个振荡的自相关积分）。

**最省事也最常被人用的错误版本**：假设每个离子独立随机行走，则

$$
\sigma_{\text{NE}} = \frac{e^2}{k_{\mathrm B}T}\left(c_+z_+^2D_+ + c_-z_-^2D_-\right)
\tag{3.14}
$$

$c_\pm=N_\pm/V$ 为数密度（$\mathrm{m^{-3}}$）。式 (3.14) 的推导只用到了 $\langle\mathbf v_i(0)\cdot\mathbf v_j(t)\rangle=\delta_{ij}(\cdots)$，即**丢掉了全部正负离子交叉项**。而离子液体里每个阳离子都被阴离子包围、库仑耦合参数 $\Gamma=q^2/(4\pi\varepsilon_0 d k_{\mathrm B}T)\sim10^2$（$d$ 为离子间距；第 3 节末那两个 $36\,k_{\mathrm B}T$ 与 $90\,k_{\mathrm B}T$ 就是它的两个端点），"独立"这个假设根本不成立。把交叉项留回来，定义**distinct（集体）扩散系数** $D^{\mathrm d}$ 与示踪扩散系数 $D^{\mathrm s}$（两者单位同为 $\mathrm{m^2/s}$；$D^{\mathrm d}$ 衡量一个离子与**异号**离子群体速度的交叉关联），可以证明 [9][10]

$$
\sigma = \sigma_{\text{NE}}\left(1+\frac{D^{\mathrm d}}{D^{\mathrm s}}\right)
\tag{3.15}
$$

由于反号离子倾向于**同步**移动（携带净电荷为零的一对一起走），$D^{\mathrm d}<0$，于是 $\sigma<\sigma_{\text{NE}}$。

**看得见的算术。** 设比例为 $p$ 的离子与自己的反离子锁成中性对、以同一速度移动。式 (3.12) 的被测量是 $\mathbf R_Q=\sum_iz_i\Delta\mathbf r_i$：一个锁定的正负对贡献 $z_+\Delta\mathbf r+z_-\Delta\mathbf r=0$，**完全抵消**；只有未配对的 $(1-p)$ 份额贡献。故 $\sigma/\sigma_{\text{NE}}=1-p$，即**配对比例直接就是 Nernst–Einstein 的相对误差**。反过来读式 (3.15)，$\sigma_{\text{NE}}$ 高估 $30\%$ 对应 $D^{\mathrm d}/D^{\mathrm s}=-0.23$、高估 $60\%$ 对应 $-0.38$，也就是 $p\approx0.23$–$0.38$：每三个离子就有一个与反离子步调一致。对一个"处处是接触离子对"的体系，这个数毫不夸张——它是 IL 的常态而非例外。

> [!NOTE]
> **$30$–$60\%$ 这个区间的出处与限度。** 它是集体输运性质的 IL 分子动力学这一支文献反复给出的量级 [9][10]，本讲把它当作**设计判据**而非某个体系的实测值：具体倍数随温度、烷基链长与阴离子强烈变化，同一篇文章里不同温度点的偏离可以差数倍。可靠的用法是**永远同时报告 $D^{\mathrm s}$、$D^{\mathrm d}$ 与 $\sigma_{\text{NE}}/\sigma$**——这三个量都是模拟直接给出的，比值一旦显著低于 1 就说明体系处于强关联区，此时式 (3.14) 不可用，必须走式 (3.12) 的集体电流。这条判据直接决定第 6 讲锥射流电流预测的精度：$\sigma$ 进入电流标度律，$30\%$ 的电导率误差等比例传成 $30\%$ 的电流误差。

## 5 电荷缩放 $\pm0.8e$：一个必须知道边界的经验补丁

**做法。** 把气相（或团簇级 DFT）算出的部分电荷整体乘一个 $\lambda<1$：

$$
q_i = \lambda\,q_i^{\text{gas}},\qquad \lambda\approx0.7\text{–}0.9\ \ (\text{惯例取 }0.8)
\tag{3.16}
$$

**为什么"有效"。** 凝聚相里一个离子的电荷会诱导邻近离子的电子云与偶极重排，部分屏蔽它对外呈现的电场；把这份屏蔽折算成一个常数因子乘在电荷上，就得到一个不含极化项的力场。文献在 IL 与电解质上系统做过这件事：固定电荷加缩放能同时改善结构与扩散，而**未缩放的满电荷力场把离子关联算得过头、黏度偏高、扩散偏低、熔点偏高** [11][12][13]。

**为什么它不是物理。** 三点，本讲逐条给数量级。

1. **它只在一处被标定。** $\lambda$ 是对着零场的体相性质（密度、$\eta$、$\sigma$）拟合出的平均值，而它模拟的是线性响应——屏蔽强度取决于邻近粒子的可及性与取向。
2. **它缩放错了对象。** 令式 (3.16) 作用后，离子–离子库仑内聚按 $\lambda^2$ 变化，而外场对离子做的功 $q\,\Delta\varphi$ 只按 $\lambda$ 变化（第 6 讲式 (6.7) 的第三项）。两者不再同比，于是模型的**发射阈值场**被系统性移动：内聚降到 $\lambda^2$、驱动降到 $\lambda$，平衡点条件 $\lambda^2C=\lambda q_0Ed$ 给出 $E^{(\lambda)}=\lambda E^{(1)}$，即 $\lambda=0.8$ 会让临界场整体偏低 $20\%$。这个偏差在拟合它的体相数据里完全看不见，因为它不出现在零场可观测量上。
3. **强电场下屏蔽的载体本身消失了。** 屏蔽靠邻近离子**重排取向**，而取向是被热运动打散的。取离子固有偶极 $\mu\approx5\ \mathrm{D}=1.67\times10^{-29}\ \mathrm{C\,m}$，取向有序度由 Langevin 参数 $\xi_L=\mu E/k_{\mathrm B}T$ 决定：$\xi_L=1$ 的场强是

$$
E=\frac{k_{\mathrm B}T}{\mu}=\frac{4.14\times10^{-21}}{1.67\times10^{-29}}=2.5\times10^{8}\ \mathrm{V/m}=250\ \mathrm{MV/m}=250\ \mathrm{kV/mm}
$$

第 6 讲会看到锥尖局部场达到 $10^{9}\ \mathrm{V/m}$，那里 $\xi_L\approx4$——近邻偶极几乎全部排齐，可供进一步重排的余量趋于零，**屏蔽量被冻结，有效电荷回到接近气相值**。同样地，把接触离子对（$\sim0.5\ \mathrm{nm}$、$\varepsilon_r\approx12$）拆开需 $q^2/(4\pi\varepsilon_0\varepsilon_rd)=0.24\ \mathrm{eV}$，而 $10^{9}\ \mathrm{V/m}$ 的场在 $0.5\ \mathrm{nm}$ 上做功 $eEd=0.50\ \mathrm{eV}$，**场比热还强势，离子对被撕开而不是被屏蔽**。

> [!WARNING]
> **结论：式 (3.16) 与强电场问题在原理上不相容。** 一个零场标定的常数 $\lambda$ 无法表达"屏蔽随场消失"这一事实，而且它连第 2 条那种简单的场强平移都修不对。出路只有两条：用真正含极化自由度的力场（第 4 讲的 Drude 或诱导偶极路线），或让电荷随环境重分配（电荷平衡类）乃至由电子结构直接给出（第 5 讲的 MLIP + 学习电荷）。第 7 讲讨论发射器表面的电荷注入与场致发射时会把这个矛盾摊开——在那里，用 $\lambda=0.8$ 的力场算出的起始电压偏差不是误差，而是**方向性的错误**（正面讨论 $\lambda=0.7$–$0.8$ 何时不足、何时够用见 [14]）。

## 6 小结

1. $\Delta t$ 由最快振动定死：含 $\ce{C-H}$（$3000\ \mathrm{cm^{-1}}$，周期 11 fs）给 1 fs，约束氢后由 $1450\ \mathrm{cm^{-1}}$ 弯曲模式给 2 fs。约束体系必须按 $N_f$ 而非 $3N$ 算温度，否则实际温度高 50%。
2. Nosé–Hoover 守恒动量、可用于输运量；**Langevin 逐项注入随机动量，会同时污染 $\eta$ 与 $\sigma$**，只能用于探路。各向异性体系要 Parrinello–Rahman，并且要盯 $P_{\alpha\beta}$ 非对角分量。
3. 结构弛豫 $\tau_\alpha\sim d^2/6D\approx8\ \mathrm{ns}$（$D\sim5\times10^{-12}\ \mathrm{m^2/s}$、$d=0.5\ \mathrm{nm}$），**1 ns 的 IL 轨迹未平衡**。判据：$t_{\text{prod}}\gtrsim10\tau_\alpha$（即 $\gtrsim80\ \mathrm{ns}$），且加倍时长后各量移动 $<5\%$。
4. Ewald 三项（式 3.9）缺一不可；$\mathbf k=0$ 的剔除等价于选定 tin-foil 边界，换真空边界要补式 (3.10) 的表面项——**两者是不同的物理体系**。截断静电的误差是总能量的四成量级，smooth switching 修不掉。
5. $\sigma_{\text{NE}}$（式 3.14）丢掉全部离子交叉项；$\sigma=\sigma_{\text{NE}}(1+D^{\mathrm d}/D^{\mathrm s})$（式 3.15）。若比例为 $p$ 的离子与反离子锁成中性对同步移动，则 $\sigma/\sigma_{\text{NE}}=1-p$。IL 常见区间高估四成到一倍（$1-p\approx0.5$–$0.7$），对应 $D^{\mathrm d}/D^{\mathrm s}\approx-0.29$–$-0.5$。第 6 讲的电流标度律依赖这个数。
6. $\lambda=0.8$ 缩放是零场补丁：$\lambda^2$ 与 $\lambda$ 的不同标度让临界场平移 $20\%$；而在 $\xi_L=\mu E/k_{\mathrm B}T\gtrsim1$（$E\gtrsim250\ \mathrm{kV/mm}$）的场下屏蔽的载体本身被冻结，**补丁必然失效**。

第 4 讲把本讲反复回指的"力场"两个字打开：固定电荷的参数化惯例、极化三条路线的代价、粗粒化买到的时间尺度、force matching 这条通往第 5 讲的谱系，以及 ReaxFF 怎样让键断裂。

## 参考文献

[1] Shuichi Nosé. A unified formulation of the constant temperature molecular dynamics methods. The Journal of Chemical Physics, 1984. DOI: 10.1063/1.447334.

[2] William G. Hoover. Canonical dynamics: Equilibrium phase-space distributions. Physical Review A, 1985. DOI: 10.1103/physreva.31.1695.

[3] M. Parrinello, A. Rahman. Polymorphic transitions in single crystals: A new molecular dynamics method. Journal of Applied Physics, 1981. DOI: 10.1063/1.328693.

[4] Hongjun Liu, Edward J. Maginn. A molecular dynamics investigation of the structural and dynamic properties of the ionic liquid 1-n-butyl-3-methylimidazolium bis(trifluoromethanesulfonyl)imide. The Journal of Chemical Physics, 2011, 135: 124507. DOI: 10.1063/1.3643124.

[5] Gustavo F. Velardez, Saman Alavi, Donald L. Thompson. Molecular dynamics studies of melting and liquid properties of ammonium dinitramide. The Journal of Chemical Physics, 2003, 119: 6698–6708. DOI: 10.1063/1.1605380.

[6] P. P. Ewald. Die Berechnung optischer und elektrostatischer Gitterpotentiale. Annalen der Physik, 1921. DOI: 10.1002/andp.19213690304.

[7] Ryogo Kubo. Statistical-Mechanical Theory of Irreversible Processes. I. General Theory and Simple Applications to Magnetic and Conduction Problems. Journal of the Physical Society of Japan, 1957. DOI: 10.1143/JPSJ.12.570.

[8] Berk Hess. Determining the shear viscosity of model liquids from molecular dynamics simulations. The Journal of Chemical Physics, 2002. DOI: 10.1063/1.1421362.

[9] Kenneth R. Harris. Relations between the Fractional Stokes–Einstein and Nernst–Einstein Equations and Velocity Correlation Coefficients in Ionic Liquids and Molten Salts. The Journal of Physical Chemistry B, 2010. DOI: 10.1021/jp102687r.

[10] Anirban Mondal, Sundaram Balasubramanian. A Molecular Dynamics Study of Collective Transport Properties of Imidazolium-Based Room-Temperature Ionic Liquids. Journal of Chemical & Engineering Data, 2014, 59: 3061–3068. DOI: 10.1021/je500132u.

[11] José N. Canongia Lopes, Agílio A. H. Pádua. Molecular Force Field for Ionic Liquids Composed of Triflate or Bistriflylimide Anions. The Journal of Physical Chemistry B, 2004. DOI: 10.1021/jp0476545.

[12] Oleg Borodin. Polarizable Force Field Development and Molecular Dynamics Simulations of Ionic Liquids. The Journal of Physical Chemistry B, 2009, 113: 11463–11478. DOI: 10.1021/jp905220k.

[13] Dmitry Bedrov, Jean-Philip Piquemal, Oleg Borodin, Alexander D. MacKerell Jr. 等. Molecular Dynamics Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields. Chemical Reviews, 2019, 119: 7940–7995. DOI: 10.1021/acs.chemrev.8b00763.

[14] Zhaoxi Sun, Lei Zheng, Zuo-Yuan Zhang, Yalong Cong, Mao Wang, Xiaohui Wang, Jingjing Yang, Zhirong Liu 等. Molecular Modelling of Ionic Liquids: Situations When Charge Scaling Seems Insufficient. Molecules, 2023, 28: 800. DOI: 10.3390/molecules28020800.

> [!NOTE]
> **引用状态声明。**
> （一）十四条均已逐条经 Crossref `/works/<DOI>` 回查，年份以 Crossref 的 `issued` 为准。其中 [1][2][3][6][7][8][9][11] 八条是方法学奠基文献（恒温器、变胞恒压器、Ewald 求和、Green–Kubo 及其黏度实现、Nernst–Einstein 偏离关系、$\pm0.8e$ 缩放惯例），本讲只用它们指认方法与定义，不依赖其具体系数。核验中更正一处易错点：**变胞恒压器的原始文献是 Parrinello & Rahman 的 _J. Appl. Phys._ 1981 一文**，它常被误记为同作者 1980 年 PRL 短文或 1982 年 _J. Chem. Phys._ 的应变涨落一文。velocity-Verlet（式 3.2）、Einstein 关系（式 3.13）与 Langevin 方程（式 3.6）同属教科书级内容，只点名方法、不单列条目。
> （二）两条本课承重的经验结论各有出处：**式 (3.15) 的 Nernst–Einstein 偏离与 distinct diffusion coefficient 形式体系见 [9]，其在室温离子液体 MD 上的集体输运实现见 [10]**；**式 (3.16) 的 $\pm0.8e$ 只作为「约定 + 早期实施文献 [11]」给出——首倡者无法用开放接口坐实，本讲不作归属断言**；系统对照缩放与极化两种做法的是 [12]，综述骨架是 [13]，正面讨论该缩放何时不足的近作见 [14]，第 4 讲完整展开。
> （三）本讲的数字全是就地给出的量级推导——单位换算（$332.06\ \mathrm{kcal\,mol^{-1}}\,\text{Å}$）、能量均分（式 3.3 的 $N_f$ 陷阱）、或 Langevin / Stokes–Einstein 型估算，**不是文献实测值**；带 [n] 的文献结论只有 NE 偏离与满电荷力场的输运后果两条。
