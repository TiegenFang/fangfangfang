---
author: Tiegen Fang
pubDatetime: 2026-09-05T06:00:00Z
title: 第 7 讲：电喷雾 II——发射器表面、AIMD 碎裂与 MD–Poisson 尺度耦合
description: 离子液体在金属发射器表面的 DFT 吸附与功函数移动如何改写起始电压；加速与碰撞中的碎裂通道与荷质比账；MD 与 Poisson 区的界面条件逐条写全；电荷缩放在强电场下为什么必然失效。
course: md-dft-ionic-liquid
order: 7
tags:
  - 第一性原理
  - 分子动力学
  - 离子液体
  - 微推进
draft: false
---

第 6 讲留下的账没结清。实测比冲 $\sim2000\ \mathrm{s}$，而单个 $\ce{[emim]+}$ 在 $5\ \mathrm{kV}$ 下的理论上限是它的近五倍。第 6 讲把这笔差额折到了**质量份额**上：只要 $1.6\%$ 的电流以 $10\ \mathrm{nm}$ 液滴形式发射，这部分就带走 $84\%$ 的质量（等效荷质比约为裸单体的 $1/22$），并据此断言**这是物种与质量的问题，不是效率的问题**。

本讲处理这个化学问题的三个下游环节：发射器表面（离子液体趴在金属上，功函数变了，起始电压跟着变）、加速途中的碎裂（分子被打碎成什么，荷质比账怎么改）、以及尺度耦合（纳米尺度的发射事件怎么喂给微米尺度的场求解器，电场怎么回到分子头上）。第三条技术上最硬，界面条件会被逐条写出来。

先划清方法边界：**第 1 节是 DFT（静态、表面），第 2 节是 AIMD（每步算电子结构、键能断），第 3–4 节是 classical MD 与连续介质/粒子网格的耦合。** classical MD 的固定拓扑意味着它原则上看不见第 2 节的碎裂——这条分界线本讲反复使用。

## 1 发射器表面：一层吸附膜改写的不是电流，是阈值

离子液体电喷雾的发射器是金属（Pt、W、Au 涂层微针阵列、导电玻璃毛细管）。第 6 讲把液面当自由表面处理，真实边界却是**固—液界面**：离子液体润湿金属、在金属上排布成层，这层结构既决定供液，也决定电子能不能从金属隧穿出来。

**DFT 给出的吸附图景。** 咪唑类离子液体在 Pt(111) 上的吸附构型、吸附能与界面电荷转移被系统算过 [1]。这类计算交出三样东西：吸附构型（咪唑环平躺还是烷基链立起）交给 classical MD 当壁面势；吸附能 $E_{\text{ads}}$ 决定润湿与发射器寿命；界面电荷转移 $\Delta q$（金属与吸附层之间净迁移的电子数）决定功函数移动。同一支问题也用过 classical MD——壁面附着力与浸润行为 [2]，以及把纳米液滴同时放进固体表面与外电场的模拟 [3]。分工很清楚：**MD 给结构与附着力，给不出 $\Delta q$——固定电荷力场里电荷是被钉死的常数，「界面向电荷转移」这个量在模型中根本不存在。** 这是第 4 讲「固定电荷为什么在离子液体上系统性失效」在一个具体场合的再现。

**功函数：从 $\Delta q$ 到起始电压。** 吸附层若带垂直于表面的净偶极，金属功函数就会移动，Helmholtz 关系给出移动量

$$
\Delta\phi = -\frac{N_\Gamma\,\mu_\perp}{\varepsilon_0}
\tag{7.1}
$$

$N_\Gamma$ 为单位面积的偶极子数（$\mathrm{m^{-2}}$）、$\mu_\perp$ 为偶极矩的垂直分量（$\mathrm{C\cdot m}$）、$\varepsilon_0$ 为真空介电常数。反算一次就有量级感：取致密单层 $N_\Gamma = 1.5\times10^{19}\ \mathrm{m^{-2}}$（金属表面原子面密度量级），要产生 $\Delta\phi = 0.5\ \mathrm{V}$ 的移动只需

$$
\mu_\perp = \frac{\varepsilon_0\,\Delta\phi}{N_\Gamma}
= \frac{8.854\times10^{-12} \times 0.5}{1.5\times10^{19}}
= 2.95\times10^{-31}\ \mathrm{C\cdot m} \approx 0.09\ \mathrm{D}
$$

（$1\ \mathrm{D} = 3.336\times10^{-30}\ \mathrm{C\cdot m}$。）**0.09 D 远小于 $\ce{[emim]+}$ 自身的偶极矩**：伏特级数的功函数移动不需要多大的净电荷重排，只需要它有序地站在垂直方向上。反过来说，任何把界面电荷分布算错的力场，都会把 $\Delta\phi$ 算错一整档。

**移动了多少才算多？** 电子场致发射对 $\phi$ 是指数依赖而非线性依赖，倍数在第 5.1 节算出：功函数每压低 $0.5\ \mathrm{eV}$，同场强下的电子电流约升一个数量级。工程含义直接：**加电后先看到离子发射还是先漏出电子电流，取决于那层吸附膜**。漏出的电子中和正离子束，比冲与束流品质一起受损，而它由表面状态（清洗、预处理、累积工作时长）控制——不写进模型，就只能归因成「实验重复性差」。

> [!NOTE]
> 本节不给出 $E_{\text{ads}}$、$\Delta q$、$\Delta\phi$ 的数值：[1] 支持「这些量可被 DFT 定量给出」，本讲未从该文摘取数字；式 (7.1) 的算术只是把功函数变化换算成偶极面密度的独立核账。

## 2 AIMD 下的推进剂碎裂

第 6 讲把 MD 与实验室测量放进同一个对照框架 [4]，本节处理那个框架里只有电子结构方法能承担的一环。

**能量账：一次碰撞可用的内能比一根键多三个数量级。** 电荷为 $e$ 的离子穿过 $5\ \mathrm{kV}$ 间隙得 $5\ \mathrm{keV}$ 动能；它撞上静止的中性粒子，可用来激发内部自由度的质心系能量是

$$
E_{\text{avail}} = \frac{m_2}{m_1+m_2}\,E_{\text{lab}}
\tag{7.2}
$$

$m_1$、$m_2$ 为入射与靶粒子质量、$E_{\text{lab}}$ 为实验室系动能。等质量对撞取一半，即 $2.5\ \mathrm{keV}$。化学键离解能在 $3$–$6\ \mathrm{eV}$（C–N 约 $3\ \mathrm{eV}$，B–F 约 $5\ \mathrm{eV}$），**可用内能比打断一根键多五百到八百倍**。所以问题从来不是「会不会碎」，而是「碎成哪几块、各占多少」。

这也决定了碎落在哪里。平均自由程 $\lambda = (n\sigma)^{-1}$，碰撞截面取 $\sigma \sim 10^{-18}\ \mathrm{m^2}$（约 $1\ \mathrm{nm^2}$）。以喷流根部 $r = 1\ \mu\mathrm{m}$ 处 $n \sim 10^{24}\ \mathrm{m^{-3}}$ 为起点，按自由分子膨胀取 $n \propto r^{-2}$，得 $\lambda(r) = 10^{6}\,r^{2}$：$r = 1\ \mu\mathrm{m}$ 处 $\lambda$ 与 $r$ 相当（碰撞刚好重要），$r = 10\ \mu\mathrm{m}$ 处已增至 $0.1\ \mathrm{mm}$，$r = 1\ \mathrm{mm}$ 处达 $1\ \mathrm{m}$，超过整个电极间隙。**这是数量级估算，不是测量值，但结论是稳的：碰撞碎裂只发生在尖端附近微米量级的近场，羽流一旦膨胀就绝碰撞。** 加速前后因此是两个不同的窗口：加速前碎的只走过部分电压降，直接损失比冲；加速后碎的继承母离子速度但电荷变了，造成能谱展宽与发散。

**通道清单与质量账。** $\ce{[emim][BF4]}$ 最直接的断裂位置是 $\ce{BF4-}$ 的 B–F 键与 $\ce{[emim]+}$ 侧链的 C–N 键：

$$
\ce{BF4- -> BF3 + F-}
\tag{7.3}
$$

$$
\ce{C8H14N2+ -> C6H9N2+ + C2H5}
\tag{7.4}
$$

$$
\ce{C8H14N2+ -> C7H11N2+ + CH3}
\tag{7.5}
$$

式 (7.4)(7.5) 脱除的中性碎片 $\ce{C2H5}$、$\ce{CH3}$ 是自由基，此处不标自旋符号。配平可直接核：$\ce{C8H14N2+}$ 式量 $8\times12.011 + 14\times1.008 + 2\times14.007 = 138.21\ \mathrm{u}$，$\ce{C6H9N2+}$（$109.15\ \mathrm{u}$）加 $\ce{C2H5}$（$29.06\ \mathrm{u}$）恰好回到 $138.21$；$\ce{BF4-}$（$86.80\ \mathrm{u}$）分成 $\ce{BF3}$（$67.81\ \mathrm{u}$）加 $\ce{F-}$（$19.00\ \mathrm{u}$）。放出的 $\ce{F-}$ 遇含氢碎片生成 $\ce{HF}$——这是 IL 电喷雾羽流腐蚀性与沉积物的主要来源之一，也是它与「干净」的纯离子图像之间最大的落差。

哪条通道占主导、产物内能怎么分布，只能由 AIMD 算；用 AIMD 系统研究 $\ce{[emim][BF4]}$（文献亦写作 EMI-BF4）推进剂在电喷雾推力器中碰撞致碎裂的工作已出现 [5]。**为什么必须是 AIMD**：碎裂不止是断键，还有断裂瞬间的电荷重分配——$\ce{C8H14N2+}$ 断成 $\ce{C6H9N2+} + \ce{C2H5}$ 时正电荷落在哪一块由电子结构决定。固定拓扑的 classical MD 里这件事原则上不发生；ReaxFF 能断键，电荷却仍由经验规则给。**只有电子结构方法同时给出断键位置与产物带电状态**，而带电状态正是荷质比账的输入。

> [!WARNING]
> **文献集中度声明（本节）。** 上述命题目前核验到的直接文献只有 [5] 一条（2026 年 _J. Chem. Phys._，被引 1 次），是单一团队的近期结果，**不是学界共识**。本讲只从标题与书目信息确认「这类计算已能做、做的是碰撞致碎裂」；式 (7.3)–(7.5) 的通道清单与质量账是本讲自己按原子量配的，分支比、阈能等定量结论一概未取自该文。引用本节请读原文。

**碎裂对性能意味着什么。** 把质量账接到第 6 讲式 (6.7) 上（$v_e = (2qV/m)^{1/2}$、$I_{\text{sp}} = v_e/g_0$，$V = 5\ \mathrm{kV}$）。**本表所有式量一律由化学式重算**（$\ce{C8H14N2+} = 138.21\ \mathrm{u}$ 等），因此与第 6 讲桥接表里为示意所取的单体质量相差约一成，不影响任何结论：

| 物种                          | 式量 $/\mathrm{u}$ | 电荷 $/e$ | $v_e\ /\ \mathrm{km/s}$ | $I_{\text{sp}}\ /\ \mathrm{s}$ |
| ----------------------------- | ------------------ | --------- | ----------------------- | ------------------------------ |
| $\ce{[emim]+}$                | 138.2              | 1         | 83.6                    | 8520                           |
| $\ce{C6H9N2+}$（式 7.4 产物） | 109.2              | 1         | 94.0                    | 9590                           |
| $\ce{BF4-}$                   | 86.8               | 1         | 105.5                   | 10760                          |
| $\ce{[emim]2[BF4]+}$          | 363.2              | 1         | 51.5                    | 5260                           |
| 中性 $\ce{BF3}$、$\ce{C2H5}$  | —                  | 0         | 不被加速                | —                              |

注意一个反直觉的结果：**小的带电碎片比冲更高**。碎裂真正吃掉比冲走三条路——把质量交给不带电的中性碎片（只贡献 $\dot m$ 不贡献 $F$）、在加速之前发生（只走过部分电压降）、以及带电团簇本身（表里 $\ce{[emim]2[BF4]+}$ 那一行，不需碎裂就已砍掉四成 $I_{\text{sp}}$）。第 6 讲的荷质比账把这三条混在一起，本讲把它们拆开，因为**控制手段完全不同**。

三条路也不能线性相加。第 6 讲式 (6.8) 的混合比冲是按**质量流率**加权的，于是「电流里只有一点点重物种」这种在束流测量中几乎看不见的份额，会在质量与动量收支里占绝对多数。碎裂的产物恰恰是这种物种：一根 $\ce{C-N}$ 键断裂放出的中性 $\ce{C2H5}$ 不带电、不被加速，却实打实地加进 $\dot m$。**这就是为什么比冲的损失在电流监测上完全无迹可寻，只能靠羽流质谱与原子尺度模拟去追。**

## 3 MD–Poisson 耦合：界面条件写全

「耦合」这两个字不构成方法，界面条件才构成。下面把两侧方程与两个方向的传递各自写出来。

**两侧的控制方程。** 连续区（$\Omega_{\text{out}}$，微米—毫米尺度的引出与加速区）解 Poisson 方程

$$
\nabla\cdot\left(\varepsilon\nabla\varphi\right) = -\rho_c,\qquad \mathbf E = -\nabla\varphi
\tag{7.6}
$$

$\varphi$ 电势（$\mathrm{V}$）、$\rho_c$ 空间电荷密度（$\mathrm{C/m^3}$）、$\varepsilon$ 介电常数（真空中取 $\varepsilon_0$）。分子区（$\Omega_{\text{MD}}$，锥尖附近纳米尺度、$10^3$–$10^5$ 对离子）解牛顿方程，每个离子额外受连续区场的作用：

$$
m_i\ddot{\mathbf r}_i = -\nabla_i U\left(\mathbf r_1,\dots,\mathbf r_N\right) + q_i\,\mathbf E^{\text{in}}\left(\mathbf r_i,t\right)
\tag{7.7}
$$

$U$ 为经验力场总势能（第 4 讲）、$q_i$ 为模型电荷。**式 (7.7) 右端第一项里 MD 粒子之间的库仑作用照旧由 MD 内部的长程求解器（Ewald/PME，第 3 讲）负责，式 (7.6) 的 $\rho_c$ 只描述 MD 区之外的连续电荷**——这条分工是避免重复计入的前提。

**下传之一：电荷密度。** MD 粒子若需出现在连续区（例如羽流中的离子），沉积到网格：

$$
\rho_c(\mathbf x) = \sum_{i} q_i\,S\left(\mathbf x - \mathbf r_i\right),\qquad \int S(\mathbf x)\,\mathrm d\mathbf x = 1
\tag{7.8}
$$

$S$ 是形状函数（assignment / cloud-in-cell），把点电荷抹进网格胞。$\int S = 1$ 是总电荷守恒的数学表达，不是数值技巧。

**下传之二：发射通量。** 一个离子在 $t_k$ 时刻穿过界面 $\Gamma$（MD 区外边界，面积 $A_\Gamma$）是离散事件，而连续区只接受边界上的电流密度。转换靠**在时间窗 $\tau$ 内做统计平均**：

$$
j_n(t_0) = \frac{e\,\dot N_\Gamma}{A_\Gamma}
= \frac{e}{A_\Gamma\,\tau}\sum_{k \in \{k \mid t_0 < t_k < t_0+\tau\}} \varsigma_k,\qquad
\frac{\delta j_n}{j_n} = \frac{1}{\sqrt{N_{\text{cross}}}}
\tag{7.9}
$$

$\varsigma_k = \pm 1$ 携带离子符号、$\dot N_\Gamma$ 为穿越率、$N_{\text{cross}}$ 为窗口内事件总数（右端相对误差来自泊松计数）。$j_n$ 作为 Neumann 型边界条件进入连续区的电荷守恒方程（$\mathbf J\cdot\mathbf n|_\Gamma = j_n$）。

**这个平均窗口就是耦合的真正代价。** 取第 6 讲桥接一节给出的单发射器电流 $I = 2.1\ \mathrm{nA}$：真实穿越率 $I/e = 1.3\times10^{10}\ \mathrm{s^{-1}}$，而 MD 盒子里总共只有 $10^4$–$10^5$ 对离子——按真实发射率跑，盒子撑不过一微秒就蒸干了。所以 MD 里的发射率必然被人为放大（或盒子被人为缩小，第 6 讲的有限尺寸问题 [6]），$\tau$ 与真实工况之间**不存在等比换算**。反过来，一段 $1\ \mathrm{ns}$ 轨迹上若只统计到 50 次穿越，$\delta j_n/j_n = 1/\sqrt{50} = 14\%$；这 $14\%$ 经式 (7.9) 直接进入场解，再经第 6 讲的 Boltzmann 型敏感性放大回发射率。**耦合不是免费把两侧拼起来，它是把一侧的统计噪声如实转交给另一侧。**

**上传：连续场 → MD 受力。** 三件事，缺一条都会算错。其一，解式 (7.6) 得 $\varphi$，取负梯度作为 $\mathbf E^{\text{in}}$。其二，**扣除自洽项**：MD 区自己的电荷在 MD 内部已用 Ewald 算过，原样回喂就是把那部分库仑作用算两遍。正确写法是把总势分解为

$$
\varphi = \varphi^{\text{ext}} + \varphi^{\text{cont}} + \varphi^{\text{self}}
$$

依次对应电极电位、连续区空间电荷、MD 粒子自身贡献；**回喂给 MD 的是 $-\nabla(\varphi^{\text{ext}}+\varphi^{\text{cont}})$，不含 $\varphi^{\text{self}}$**。其三，界面 $\Gamma$ 上两侧解必须拼接：

$$
\begin{aligned}
\varphi^{\text{in}}\big|_\Gamma &= \varphi^{\text{out}}\big|_\Gamma \\[3pt]
\left(\varepsilon\,\partial_n\varphi\right)\big|_{\Gamma^+} - \left(\varepsilon\,\partial_n\varphi\right)\big|_{\Gamma^-} &= -\sigma_\Gamma
\end{aligned}
\tag{7.10}
$$

电势连续、法向电位移跳变等于界面自由面电荷 $\sigma_\Gamma$（无面电荷时该项为零）。第二式是 Gauss 定律的界面积分形态，保证「穿过 $\Gamma$ 的电通量变化 = 在 $\Gamma$ 处新出现的电荷」，正好与式 (7.9) 的通量守恒配对。合成一个循环：

```text
给定界面 Γ、平均窗口 τ、电极电位 V(t)
loop:
    MD 推进 N 步（dt = 1 fs），记录穿过 Γ 的离子编号与时刻
    N_cross ← τ 内事件数；  j_Γ ← e·N_cross /(A_Γ·τ)      # 下传，式 (7.9)
    ρ_grid  ← Σ q_i S(x - r_i)（Ω_MD 外的电荷）           # 下传，式 (7.8)
    solve ∇·(ε∇φ) = -ρ_c，边界含 j_Γ 与 V(t)              # 式 (7.6)(7.10)
    E_in ← -∇(φ_ext + φ_cont)，显式剔除 φ_self            # 上传
    把 q_i·E_in 加入式 (7.7) 的受力，继续 MD
```

这条路线在离子液体电喷雾上有显式实现 [7]：MD 提供界面电荷密度与发射通量，三维 Poisson 求解器提供电场。顺带一个常被忽略的好处：**电极是显式存在的，所以第 6 讲「MD 怎么做，以及会在哪里出错」一节里被均匀外场做法人为删掉的镜像响应项——式 (6.5) 的第四项——在这里自动回来了。**

> [!NOTE]
> 上面是此类耦合的**通用界面条件**，实现细节（网格与插值阶数、迭代与子循环结构、$\tau$ 的选取、电极是否显式建模）以 [7] 原文为准。本讲给的是守恒要求与判据，不是某个求解器的说明书。

**与 PINNs 那条线的分工。** 式 (7.6) 与姊妹课程 EHD 讲里的 Poisson 方程是同一个；那条线接着写电荷守恒 $\partial_t\rho_c + \nabla\cdot\mathbf J = S$ 与 Navier–Stokes，以及三个场巨大的量级差异与归一化方案，详见[《电水动力学中的 PINNs》](https://tiegenfang.github.io/fangfangfang/posts/pinns-ehd/)。两边共享的比看起来多，但方向相反：

|                 | PINNs 那条线                                    | 本讲这条线                                 |
| --------------- | ----------------------------------------------- | ------------------------------------------ |
| 未知量          | $\varphi,\rho_c,\mathbf u,p$ 作为函数被逼近     | 每个离子的轨迹 + 网格上的 $\varphi$        |
| $\rho_c$ 从哪来 | 电荷守恒方程的解                                | 式 (7.8) 的粒子沉积、式 (7.9) 的边界通量   |
| $\varepsilon$   | 取体相常数（前提）                              | 锥尖几纳米处该不该取体相值（被质疑的对象） |
| 发射边界        | 均匀注入 / Fowler–Nordheim / 空间电荷限制三选一 | MD 的事件列表：不是解析律，是一张统计表    |

## 4 EHD–PIC 路线：与 MD 的尺度分工

粒子网格法（particle-in-cell, PIC）与 MD 都用显式粒子，容易混为一谈。区别在相互作用由谁中介：

|                  | classical MD                     | PIC                                    |
| ---------------- | -------------------------------- | -------------------------------------- |
| 粒子间作用       | 显式两两势 $U$（键、色散、库仑） | 只通过网格上的平均场 $\mathbf E$       |
| 元粒子           | 一个真实离子                     | 一个宏粒子代表 $w$ 个真实离子          |
| 能否描述液体结构 | 能                               | 不能（无短程关联）                     |
| 时间步限制       | 最快振动，$\sim1\ \mathrm{fs}$   | 离子等离子体周期，$\gtrsim\mathrm{ns}$ |
| 可及尺度         | nm                               | μm–mm                                  |

PIC 为什么在羽流区站得住，一个数就能说清。羽流的离子 Debye 长度

$$
\lambda_D = \left(\frac{\varepsilon_0 k_{\mathrm B}T}{n e^2}\right)^{1/2}
\tag{7.11}
$$

$k_{\mathrm B}$ Boltzmann 常数、$T$ 温度、$e$ 基本电荷。取 $n = 10^{18}\ \mathrm{m^{-3}}$、$k_{\mathrm B}T = 1\ \mathrm{eV}$：$\lambda_D = \left(1.418\times10^{-30}/2.566\times10^{-20}\right)^{1/2} = 7.4\ \mu\mathrm{m}$。而 MD 必须解出溶剂化壳层，特征尺度 $0.5\ \mathrm{nm}$——**相差四个数量级**。PIC 的分辨率判据 $\Delta x \lesssim \lambda_D$ 取 $1\ \mu\mathrm{m}$ 即绰绰有余。**这就是尺度分工的物理依据而非算力分配：羽流里所有 $r \lesssim \lambda_D$ 以下的关联已被 Debye 屏蔽抹平，PIC 丢掉短程作用是无损的；液面上同样丢法却是致命的。** EHD–PIC 路线在电喷雾上的实现把连续介质与粒子网格接起来，直接处理锥尖场蒸发与羽流 [8]。

> [!WARNING]
> **文献集中度声明（本节）。** 这一路线上核验到的直接文献只有 [8] 一条（2025 年 _AIAA Journal_，被引 1 次，单一团队）。本讲的叙述是「尺度分工为什么成立」（式 (7.11) 的独立估算）加「它已被实现过一次」，**不构成对该方法成熟度或精度的评估**。

## 5 电荷注入边界，以及 $\pm0.8e$ 在强场下的必然失效

**Fowler–Nordheim 形式。** 金属—真空界面的电子场致发射 [9]

$$
J = \frac{A_{\text{FN}}}{\phi}E^2\exp\!\left(-\frac{B_{\text{FN}}\phi^{3/2}}{E}\right)
\tag{7.12}
$$

$J$ 电流密度（$\mathrm{A/m^2}$）、$\phi$ 功函数（$\mathrm{eV}$）、$E$ 界面局部场强（$\mathrm{V/m}$）、$A_{\text{FN}}$、$B_{\text{FN}}$ 为自由电子模型的普适常数（$B_{\text{FN}}\sim10^{10}\ \mathrm{V\,m^{-1}\,eV^{-3/2}}$ 量级）。敏感度全在指数上：取 $E = 5\times10^{9}\ \mathrm{V/m}$、$\phi$ 从 $5.6\ \mathrm{eV}$（Pt 量级的 handbook 值）降到 $4.6\ \mathrm{eV}$，指数 $B_{\text{FN}}\phi^{3/2}/E$ 从 $18.1$ 降到 $13.5$，同场强下电子电流升 $e^{4.6}\approx100$ 倍；降 $0.5\ \mathrm{eV}$ 则给约 $10$ 倍。第 1 节那两个数量级就是这一行算式。**吸附层 $\to\Delta\phi\to$ 指数因子 $\to$ 起始电压**，每一环都可算，唯独中间那环只能由 DFT 给。

**电荷缩放为什么必须失效。** 第 3 讲第 5 节的经验惯例——把离子电荷缩放到 $\pm0.8e$ 补偿缺失的极化——**在强电场区必然失效。这不是精度不够，是原理不对。** 三条独立论证。

_其一：电场对模型离子做功被系统性低估，误差可算。_ 模型里带 $0.8e$ 的离子移动 $d$，电场做功 $0.8e\,Ed$，真实值 $e\,Ed$。差额在 $E = 1\ \mathrm{GV/m}$、$d = 0.5\ \mathrm{nm}$ 下为

$$
0.2e \times \left(10^{9}\ \mathrm{V/m} \times 5\times10^{-10}\ \mathrm{m}\right)
= 0.2e \times 0.5\ \mathrm{V} = 0.10\ \mathrm{eV}
$$

第 6 讲式 (6.6) 证明发射速率对势垒是 Boltzmann 型的，$k_{\mathrm B}T = 0.0259\ \mathrm{eV}$，故 $\exp(0.10/0.0259) = \exp(3.9) \approx 50$。**光是电荷缩放这一项，就足以把同场强下预测的发射电流搬动近两个数量级。**（同时缩放还低估了内聚能 $E_{\text{coh}}$，两项误差符号相反，但每一项单独都是几十倍量级。）

_其二：$\pm0.8e$ 编码的是体相线性响应，而强场下取向响应早已饱和。_ 取咪唑阳离子偶极矩 $\mu \approx 5\ \mathrm{D}$（估计值），无量纲取向参数

$$
\xi = \frac{\mu E}{k_{\mathrm B}T}
= \frac{1.67\times10^{-29} \times 10^{9}}{4.12\times10^{-21}} \approx 4
\tag{7.13}
$$

Langevin 函数 $L(\xi) = \coth\xi - 1/\xi$ 在 $\xi = 4$ 取 $0.75$，而线性响应近似 $L \approx \xi/3$ 给出 $1.34$——**一个大于 1 的值，物理上不可能**。电荷缩放是把「周围离子的取向屏蔽」折进一个常数的补丁，它只在 $\xi \ll 1$ 的线性区成立；$\xi\approx4$ 时那个被折叠的响应已经饱和，常数是错的。

_其三：界面处缺失的响应形式不同。_ 金属电极上的离子感应的不是「周围离子的弱屏蔽」，而是近乎理想的镜像电荷，其势按 $1/(4z)$ 随离子—表面距离 $z$ 变化。体相拟合出的 $0.8$ 在这里既不是对的量级，也不是对的函数形式——**是符号意义上的错，不是数字意义上的偏。**

> [!NOTE]
> 有个常被误用的论证需要现场纠偏：「强场下电子极化很重要，所以要上极化力场」。按单分子电子极化率算，取极化体积 $\alpha_{\text{vol}} \approx 1.5\times10^{-29}\ \mathrm{m^3}$（即 $\alpha = 4\pi\varepsilon_0\alpha_{\text{vol}} \approx 1.7\times10^{-39}\ \mathrm{C\,m^2/V}$），极化能 $-\tfrac12\alpha E^2$ 在 $1\ \mathrm{GV/m}$ 下只有 $8\times10^{-22}\ \mathrm{J} \approx 5\times10^{-3}\ \mathrm{eV}$，比式 (7.13) 的取向项 $0.10\ \mathrm{eV}$ 小约二十倍。**这一场强下主导的非线性来自取向排列与界面镜像，不是电子云形变。** 极化力场仍然要做，但理由不是「电子极化能本身有多大」。

**出路。**

| 方案                                  | 机制                    | 修好上面哪条     | 代价与现状                                  |
| ------------------------------------- | ----------------------- | ---------------- | ------------------------------------------- |
| Drude 振子 / 诱导偶极力场 [10][11][12] | 可极化中心响应局域场    | 其三，以及内聚能 | 2–5 倍算力，需双时间步                      |
| 可变电荷（QEq / 电荷平衡）            | 电荷随环境重分配        | 其一、其三       | 需电极专项参数化                            |
| 第一性原理参数化固定电荷力场 [13]     | 参数直接来自 DFT        | 部分             | 仍修不了 $\xi\approx4$ 的饱和               |
| MLIP + 学习的电荷与长程项 [14][15]    | 从 DFT 能量力与电荷学习 | 原则上三条全覆盖 | 训练集必须含强场与表面构型（第 5 讲）       |
| AIMD                                  | 每步解电子结构          | 三条全对         | 只能到 nm/ps，给不了 $\mu\mathrm{A}$ 级统计 |

一句实话：**本讲核验到的 MD 与耦合工作 [3][6][7][16][17] 基本仍用固定电荷加缩放**，也就是说这个已知的系统性偏差是随结果一起交上去的。[16] 专门对比过相互作用势模型的选取对电喷雾模拟结果的影响并发现它会显著移动结果，从侧面支持这个担忧。出路在方法论上是清楚的，在实践上还没成为默认配置。

## 6 桥接到推力器性能

**电流、推力与比冲。** 对电荷 $q$、质量 $m$、加速电压 $V$ 的单物种束流（第 6 讲式 (6.7)；多物种时要换成式 (6.8) 的质量流率加权）：

$$
F = I\left(\frac{2mV}{q}\right)^{1/2},\qquad
\dot m = \frac{I\,m}{q},\qquad
I_{\text{sp}} = \frac{F}{\dot m\,g_0} = \frac{1}{g_0}\left(\frac{2qV}{m}\right)^{1/2}
\tag{7.14}
$$

$F$ 推力（$\mathrm{N}$）、$\dot m$ 质量流率（$\mathrm{kg/s}$）、$I$ 束流（$\mathrm{A}$）。发射物种不唯一，但第 6 讲给了一个可反推的锚点：实测 $I_{\text{sp}} \approx 2000\ \mathrm{s}$。把它代回式 (7.14) 解出**等效荷质比**（这一步是反演，不是测量）：

$$
\frac{m}{q} = \frac{2V}{(g_0 I_{\text{sp}})^{2}}
= \frac{2\times5000}{(9.807\times2000)^{2}}
= 2.6\times10^{-5}\ \mathrm{kg/C}
\;\Longleftrightarrow\; 2500\ \mathrm{u}/e
$$

再取 512 针阵列、单针 $20\ \mathrm{nA}$（即 $I = 10.2\ \mu\mathrm{A}$）、$V = 5\ \mathrm{kV}$（电功率 $51\ \mathrm{mW}$）：

| 量              | 表达式                   | 数值                                               |
| --------------- | ------------------------ | -------------------------------------------------- |
| $v_e$           | $(2qV/m)^{1/2}$          | $19.6\ \mathrm{km/s}$                              |
| $I_{\text{sp}}$ | $v_e/g_0$                | $2000\ \mathrm{s}$                                 |
| $F$             | $I\,m v_e/q$             | $5.2\ \mu\mathrm{N}$                               |
| $\dot m$        | $F/v_e$                  | $0.27\ \mu\mathrm{g/s}$（约 $0.95\ \mathrm{g/h}$） |
| 束流功率        | $\tfrac12\dot m v_e^{2}$ | $51\ \mathrm{mW}$                                  |

末行与电功率 $IV$ 相等，**这就是整条链自洽的检查**。纯单电荷（每个载流子带 $e$）束流的束流效率必然是 $100\%$，所以任何低于 $100\%$ 的账面数字必然来自中性份额、多重电荷或发散角——效率的账只能拆回第 2 节那三条机制里去。

**空间电荷限制不是当前工况的瓶颈。** 一维 Child–Langmuir 律给出极限电流密度

$$
J_{\text{CL}} = \frac{4}{9}\varepsilon_0\left(\frac{2q}{m}\right)^{1/2}\frac{V^{3/2}}{d^2}
\tag{7.15}
$$

$d$ 为电极间距。第 6 讲已用它排除过 nA 级单发射器的空间电荷限制，此处只补本讲真正要用的一句判据：**发射究竟是激活限制（式 (6.6) 的 Boltzmann 型）还是空间电荷限制（式 (7.15) 的幂律型），决定加大电压能换来什么。** 激活限制下电压几乎全额转成排气速度，也就是比冲；空间电荷限制下电压主要换来电流，比冲原地不动。两条曲线的斜率差着数量级，而工作点落在哪一侧取决于锥尖尺度与供液，不取决于想要哪个结果。判错侧的代价是把设计余量整段押错方向。

**发散与中和。** 轴向有效推力 $F_{\text{axial}} = F\langle\cos\theta\rangle$：等效半角 $10^\circ$/$20^\circ$/$30^\circ$ 分别损失 1.5% / 6.0% / 13.4%。纯离子模式的净电荷是硬约束：$10\ \mu\mathrm{A}$ 的正离子离开航天器，必须有等量电子回来，否则器体充电到足以把束流拉回来——所以它必须配电子中和器或反向双流，而发散角决定中和器与羽流的相互作用强度。团簇/液滴模式自带负离子，中和压力小，代价是比冲与污染：

|                          | 纯离子（场蒸发）模式                          | 含团簇/液滴模式                    |
| ------------------------ | --------------------------------------------- | ---------------------------------- |
| $I_{\text{sp}}$          | 高（单体上限 $\sim 8500\ \mathrm{s}$）        | 低（$\sim 2000\ \mathrm{s}$ 量级） |
| 中和需求                 | 强（必须配中和器/双流）                       | 弱（自带反离子）                   |
| 污染                     | 小，但碎裂给 $\ce{HF}$、$\ce{BF3}$ 等活性碎片 | 大（未加速中性团簇沉积）           |
| 主导机制                 | 第 6 讲式 (6.5) + 式 (7.14)                   | 第 6 讲式 (6.4) Rayleigh 裂变      |
| 对表面状态与力场的敏感度 | 极高（指数依赖）                              | 相对低                             |

## 7 小结

1. **发射器表面不是被动边界。** 式 (7.1) 说明 $0.5\ \mathrm{V}$ 的功函数移动只需 $0.09\ \mathrm{D}$ 的有效垂直偶极，而式 (7.12) 的指数放大把 $0.5\ \mathrm{eV}$ 变成约一个数量级、$1\ \mathrm{eV}$ 变成约两个数量级的电子电流。起始电压由表面状态决定。
2. **碎裂是能量过剩的问题。** 等质量对撞给出 $2.5\ \mathrm{keV}$ 可用内能，比一根键大五百倍，但按平均自由程估算碰撞窗口只覆盖尖端附近微米量级；产物带电状态只有 AIMD 能给 [5]，而它是荷质比账的输入。
3. **MD–Poisson 耦合的内容就是式 (7.8)(7.9)(7.10) 三条界面条件**：守恒的粒子—网格沉积、离散事件到边界电流密度的统计平均、回喂时剔除 $\varphi^{\text{self}}$。代价是统计噪声被转交并放大，不是接口工程量。
4. **PIC 与 MD 的分工由 Debye 长度定**：$7.4\ \mu\mathrm{m}$ 对 $0.5\ \mathrm{nm}$。羽流区丢短程作用无损，液面上致命。
5. **$\pm0.8e$ 在强电场下必然失效**：$0.10\ \mathrm{eV}$ 的每跳误差即 $50$ 倍电流偏差、$\xi\approx4$ 已入取向饱和区、界面镜像的函数形式与体相屏蔽不同。出路是极化/可变电荷力场与 MLIP，但现有电喷雾模拟仍普遍带着这个偏差。
6. **比冲账闭合。** 由第 6 讲实测 $I_{\text{sp}} = 2000\ \mathrm{s}$ 反推等效 $m/q \approx 2500\ \mathrm{u}/e$，代进 $10\ \mu\mathrm{A}$、$5\ \mathrm{kV}$ 得 $5.2\ \mu\mathrm{N}$、$0.95\ \mathrm{g/h}$、$51\ \mathrm{mW}$，束流功率与电功率相等；效率缺口只能来自中性份额、加速前碎裂与团簇发射，三者的控制手段分别是表面化学、近场密度和发射器尺度。

第 8 讲换一条支路：同一套离子液体工质不经电场发射，而是在催化剂上把化学能放出来。那一讲要用到本讲没用过的第三种 MD——ReaxFF 反应性分子动力学，它正是「键断了电荷落在哪」这个问题在经验势一侧的近似答案。

## 参考文献

[1] Arka Prava Sarkar, Sandeep K. Reddy. Adsorption of Imidazolium-Based Ionic Liquid On Pt(111) Surface Studied Using Density Functional Theory. Advanced Theory and Simulations, 2024, 8: 2400458. DOI: 10.1002/adts.202400458.

[2] Rafid Bendimerad, Elaine Petro. Molecular dynamics studies of ionic liquid-surface interactions for electrospray thrusters. Journal of Electric Propulsion, 2022, 1: 27. DOI: 10.1007/s44205-022-00032-9.

[3] Dengpan Dong, Jenel P. Vatamanu, Xiaoyu Wei, Dmitry Bedrov. The 1-ethyl-3-methylimidazolium bis(trifluoro-methylsulfonyl)-imide ionic liquid nanodroplets on solid surfaces and in electric field: A molecular dynamics simulation study. The Journal of Chemical Physics, 2018, 148: 193833. DOI: 10.1063/1.5016309.

[4] W. D. Luedtke, Uzi Landman, Y.-H. Chiu, D. J. Levandier, R. A. Dressler, S. Sok, M. S. Gordon. Nanojets, Electrospray, and Ion Field Evaporation: Molecular Dynamics Simulations and Laboratory Experiments. The Journal of Physical Chemistry A, 2008, 112: 9628-9649. DOI: 10.1021/jp804585y.

[5] Kevin D. Sampson, George Baffour Pipim, Daniel Depew, Jose Torres, Noah Tingey, Kylar Flynn, Anna I. Krylov, Joseph Wang. Collision-induced fragmentation of the EMI-BF4 propellant in electrospray thrusters: Ab initio molecular dynamics simulations. The Journal of Chemical Physics, 2026, 164: 164308. DOI: 10.1063/5.0307045.

[6] Takaaki Enomoto, Shehan M. Parmar, Ryohei Yamada, Richard E. Wirz, Yoshinori Takao. Molecular Dynamics Simulations of Ion Extraction from Nanodroplets for Ionic Liquid Electrospray Thrusters. Journal of Electric Propulsion, 2022, 1: 13. DOI: 10.1007/s44205-022-00010-1.

[7] Arnaud Borner, Deborah A. Levin. Coupled Molecular Dynamics—3-D Poisson Simulations of Ionic Liquid Electrospray Thrusters. IEEE Transactions on Plasma Science, 2015, 43: 295-304. DOI: 10.1109/tps.2014.2327913.

[8] Yipeng Fan, Guangqing Xia, Chong Chen, Bohan Xia, Chang Lu, Yajie Han. Field Evaporation Simulation in Electrospray Thrusters Using Electrohydrodynamics–Particle-in-Cell Method. AIAA Journal, 2025, 63: 2880-2891. DOI: 10.2514/1.j064951.

[9] R. H. Fowler, L. W. Nordheim. Electron emission in intense electric fields. Proceedings of the Royal Society of London. Series A, 1928, 119: 173-181. DOI: 10.1098/rspa.1928.0091.

[10] Dmitry Bedrov, Jean-Philip Piquemal, Oleg Borodin, Alexander D. MacKerell, Benoît Roux, Christian Schröder. Molecular Dynamics Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields. Chemical Reviews, 2019, 119: 7940-7995. DOI: 10.1021/acs.chemrev.8b00763.

[11] Oleg Borodin. Polarizable Force Field Development and Molecular Dynamics Simulations of Ionic Liquids. The Journal of Physical Chemistry B, 2009, 113: 11463-11478. DOI: 10.1021/jp905220k.

[12] Kateryna Goloviznina, José N. Canongia Lopes, Margarida Costa Gomes, Agílio A. H. Pádua. Transferable, Polarizable Force Field for Ionic Liquids. Journal of Chemical Theory and Computation, 2019, 15: 5858-5871. DOI: 10.1021/acs.jctc.9b00689.

[13] Eunsong Choi, Jesse G. McDaniel, J. R. Schmidt, Arun Yethiraj. First-Principles, Physically Motivated Force Field for the Ionic Liquid [BMIM][BF4]. The Journal of Physical Chemistry Letters, 2014, 5: 2670-2674. DOI: 10.1021/jz5010945.

[14] Daniel S. King, Dongjin Kim, Peichen Zhong, Bingqing Cheng. Machine learning of charges and long-range interactions from energies and forces. Nature Communications, 2025, 16: 8763. DOI: 10.1038/s41467-025-63852-x.

[15] Zachary A. H. Goodwin, Malia B. Wenny, Julia H. Yang, Andrea Cepellotti, Jingxuan Ding, Kyle Bystrom, Blake R. Duschatko, Anders Johansson 等. Transferability and Accuracy of Ionic Liquid Simulations with Equivariant Machine Learning Interatomic Potentials. The Journal of Physical Chemistry Letters, 2024, 15: 7539-7547. DOI: 10.1021/acs.jpclett.4c01942.

[16] Jinrui Zhang, Guobiao Cai, Xuhui Liu, Bijiao He, Weizong Wang. Molecular dynamics simulation of ionic liquid electrospray: Revealing the effects of interaction potential models. Acta Astronautica, 2021, 179: 581-593. DOI: 10.1016/j.actaastro.2020.11.018.

[17] Arnaud Borner, Zheng Li, Deborah A. Levin. Modeling of an ionic liquid electrospray using molecular dynamics with constraints. The Journal of Chemical Physics, 2012, 136: 124507. DOI: 10.1063/1.3696006.

## 参考文献

> [!NOTE]
> **无 DOI 条目的说明。** 本讲还有两处经典结果以书目信息给出、未附 DOI：吸附层偶极与功函数关系的 Helmholtz 形式（H. Helmholtz 一系经典电毛细工作）、空间电荷限制的 Child–Langmuir 律（C. D. Child，1911；I. Langmuir，1913）。两条均属教科书级内容，按本课程规范不强制附 DOI；Fowler–Nordheim 定律已核验到原始文献并列为 [9]，且**本讲的任何定量结论都不依赖它们的具体系数与修正项**：式 (7.12) 略去 Schottky 像力修正函数 $t(y)$、$v(y)$ 与隧穿概率细节，式 (7.15) 取一维平面极限。第 5.1 与 6.2 节用到的只是指数/幂次形式与量级，即使闭式 prefactor 有出入（$t$、$v$ 的典型修正幅度在 $20\%$ 以内），「$1\ \mathrm{eV}$ 功函数移动 $\Rightarrow$ 电子电流变化约两个数量级」与「激活限制还是空间电荷限制决定加压换来什么」这两个结论都不受影响。$B_{\text{FN}} \approx 6.83\times10^{9}\ \mathrm{V\,m^{-1}\,eV^{-3/2}}$ 一类常数是自由电子模型的标准教科书值，不是从 [9] 抄取的实测数据。
>
> **团队集中度声明。** 本讲没有一条直接文献来自多团队独立重复：[7][17] 同属 **Borner / Li / Levin** 一线（第 6 讲已标注过这支 MD 电喷雾谱系，本讲第 3 节的耦合方案亦出自该线）；[3] 属 **Vatamanu / Bedrov** 一线（与综述 [10] 同组）；[6] 为 Enomoto / Takao 与 Wirz 的合作；[16] 为 Zhang / Cai / Liu / He / Wang 一组；[2] 是两名作者的独立工作；[5] 与 [8] 已在第 2、4 节各自声明为单一团队的低引近期结果。因此第 3、5 节的论证建立在**若干彼此独立的团队各自的一次性产出**之上，不是全领域共识；特别是第 5 节「极化力场尚未成为电喷雾发射模拟的默认配置」这一判断，是本讲依据自身核验到的文献范围得出的观察，不来自任何一篇综述。
