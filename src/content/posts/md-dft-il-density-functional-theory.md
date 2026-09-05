---
author: Tiegen Fang
pubDatetime: 2026-09-05T02:00:00Z
title: 第 2 讲：DFT 骨架——Kohn–Sham 方程、泛函层级与色散校正
description: 从 Kohn–Sham 方程的每一项讲起，说明 Jacob's ladder 每一级对离子液体的具体后果、色散校正为什么是必选项而非可选项，以及算离子对结合能时绕不开的基组叠加误差与 counterpoise 校正。
course: md-dft-ionic-liquid
order: 2
tags:
  - 第一性原理
  - 离子液体
draft: false
---

这一讲把 DFT 的形式语言逐项拆开：每个符号是什么意思、每个近似会把离子液体的结果往哪个方向推、以及**哪些偏差在这个体系上属于原则性错误而不是精度问题**。按课程约定不补量子力学基础，Kohn–Sham 方程直接给出。

先立一个结论，第 3、4 节把它拆开证明：**对离子液体，色散校正和 counterpoise 校正不是精度优化，而是正误分界。**

## 1 Hohenberg–Kohn 与 Kohn–Sham 构造

Hohenberg–Kohn 两条定理的内容是：基态密度 $\rho(\mathbf r)$（给定粒子数 $N_e$）唯一决定外势 $v_{\text{ext}}(\mathbf r)$（至多差一个常数），因而决定体系全部基态性质；并且存在普适泛函 $F[\rho]$，使总能量泛函在 $\int\rho\,\mathrm d\mathbf r = N_e$ 约束下取变分极小即得基态。**它保证存在，不给出形式**——$F[\rho]$ 里未知的那一块就是交换关联。

Kohn–Sham 的处理是把相互作用电子气映射到一个**非相互作用的参考系**，用后者精确重建密度：

$$
\left[-\frac{1}{2}\nabla^2 + v_{\text{eff}}(\mathbf r)\right]\phi_i(\mathbf r) = \varepsilon_i\phi_i(\mathbf r)
\tag{2.1}
$$

$$
v_{\text{eff}}(\mathbf r) = v_{\text{ext}}(\mathbf r) + \int\frac{\rho(\mathbf r')}{|\mathbf r-\mathbf r'|}\,\mathrm d\mathbf r' + v_{\text{xc}}[\rho](\mathbf r)
\tag{2.2}
$$

$$
\rho(\mathbf r) = \sum_i f_i\left\lvert\phi_i(\mathbf r)\right\rvert^2,\qquad
E[\rho] = T_{\mathrm s}[\rho] + \int v_{\text{ext}}\rho\,\mathrm d\mathbf r + E_{\mathrm H}[\rho] + E_{\mathrm{xc}}[\rho]
\tag{2.3}
$$

$$
v_{\text{xc}}[\rho](\mathbf r) = \frac{\delta E_{\mathrm{xc}}[\rho]}{\delta\rho(\mathbf r)}
\tag{2.4}
$$

**符号表。**

| 符号              | 含义                                                                                                 | 单位 / 量纲                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| $\phi_i$          | 第 $i$ 个 Kohn–Sham 轨道（单电子空间函数）                                                           | 无量纲归一：$\int\lvert\phi_i\rvert^2\mathrm d\mathbf r = 1$ |
| $\varepsilon_i$   | 第 $i$ 个轨道本征值（**不是**真实单粒子能级，除 HOMO 外无严格物理解释）                              | $E_{\mathrm h}$                                              |
| $f_i$             | 占据数，闭层 Restricted 方案下取 $0$ 或 $2$                                                          | 无量纲                                                       |
| $\rho$            | 电子密度                                                                                             | $a_0^{-3}$，且 $\int\rho\,\mathrm d\mathbf r = N_e$          |
| $v_{\text{ext}}$  | 外势，Born–Oppenheimer 下即核的 Coulomb 吸引                                                         | $E_{\mathrm h}$                                              |
| $E_{\mathrm H}$   | 经典 Hartree 自排斥 $\frac{1}{2}\iint\rho\rho/                                                       | \mathbf r-\mathbf r'                                         | $   | $E_{\mathrm h}$ |
| $T_{\mathrm s}$   | 非相互作用参考系的动能，**唯一被精确知道的一项**                                                     | $E_{\mathrm h}$                                              |
| $E_{\mathrm{xc}}$ | 交换关联能：真实动能减 $T_{\mathrm s}$，再加全部非经典势能；**形式未知**，DFT 的全部近似都压在这一项 | $E_{\mathrm h}$                                              |

**原子单位制说明。** 式 (2.1)–(2.4) 全部写在原子单位（a.u.）下：$\hbar = m_e = e = 4\pi\varepsilon_0 = 1$，因此动能算符前面的 $\hbar^2/2m_e$ 消失、库仑势里的 $e^2/4\pi\varepsilon_0$ 也消失，只剩 $1/r$。换算：能量 $1\ E_{\mathrm h} = 27.2114\ \mathrm{eV} = 4.360\times10^{-18}\ \mathrm J$，长度 $1\ a_0 = 0.529177\ \text{Å}$。读文献时要盯住单位——$1\ E_{\mathrm h} = 2625.5\ \mathrm{kJ/mol}$，差三个半数量级，$E_{\mathrm{xc}}$ 报 Hartree、结合能报 kJ/mol 是常见排版，把两者搞混会把"化学精度"当成千分之一的噪声。

式 (2.1) 要**自洽迭代**求解：猜 $\rho$ → 组 $v_{\text{eff}}$ → 解本征问题 → 由式 (2.3) 更新 $\rho$ → 回到第二步，直到密度（或总能量）变化小于阈值。这个 SCF 循环就是第 5 节 AIMD 的成本来源：**每个 MD 步要跑一遍完整的 SCF。**

> [!NOTE]
> 轨道能 $\varepsilon_{\text{HOMO}}$ 在精确泛函下等于电离能（Janak 定理 + 空渐近势）。用 GGA 算 HOMO 能去估垂直电离能，误差常有 $1\ \mathrm{eV}$ 量级——这是自相互作用误差的直接后果，不是网格太粗。

## 2 交换关联泛函层级：Jacob's ladder

层级按"泛函看见什么"划分，代价与对离子液体的后果并列：

| 层级                 | $E_{\mathrm{xc}}$ 的输入                        | 代表               | 相对 LDA 成本 | 对离子液体的具体后果                                          |
| -------------------- | ----------------------------------------------- | ------------------ | ------------- | ------------------------------------------------------------- |
| LDA                  | 只 $\rho$                                       | Perdew–Zunger 81   | 1×            | 系统性过结合，烷基链塌得太紧；密度偏高、体积模量偏大          |
| GGA                  | $\rho,\ \nabla\rho$                             | PBE [1]            | 1–2×          | 离子对结合能**偏低**、电荷转移**偏高**；烷基链区几乎无吸引    |
| meta-GGA             | $\rho,\ \nabla\rho,\ \nabla^2\rho$（或 $\tau$） | SCAN、r²SCAN       | 2×            | 对氢键与中等强度相互作用明显改善，但用于熔体仍有争议          |
| hybrid               | 混入精确（HF）交换                              | B3LYP、PBE0、HSE06 | 3–10×         | 结合能与电子结构改善；平面波实现昂贵，$\mathrm{k}$ 点求和爆炸 |
| 双杂化 double hybrid | 再加二阶微扰相关                                | B2PLYP             | 30×+          | 团簇级基准可以用，液相模拟跑不动                              |

GGA 的标准写法是把均匀电子气的**每项电子交换能**乘一个**增强因子**：

$$
E_{\mathrm x}^{\mathrm{GGA}}[\rho] = \int \rho(\mathbf r)\,\varepsilon_{\mathrm x}^{\mathrm{hom}}(\rho)\,F^{\mathrm x}(s)\,\mathrm d\mathbf r,\qquad
s(\mathbf r) = \frac{\left\lvert\nabla\rho(\mathbf r)\right\rvert}{2\left(3\pi^2\right)^{1/3}\rho^{4/3}(\mathbf r)}
\tag{2.5}
$$

其中 $\varepsilon_{\mathrm x}^{\mathrm{hom}} = -\tfrac34(3/\pi)^{1/3}\rho^{1/3}$ 是均匀电子气每项电子的交换能，$s$ 是**约化密度梯度**（无量纲，$\rho$ 单位 $a_0^{-3}$ 时分子分母量纲相消），$F^{\mathrm x}(s)$ 是待定的增强因子，PBE 的具体形式见 [1]。$s$ 的物理意义是"密度在一个电子 Fermi 波长内变化多少"：金属/盐的离子实核心区 $s\gg1$，共价键与氢键区 $s\sim0.1$–$1$。**GGA 的所有信息都在 $F^{\mathrm x}$ 的形状里，而它的形状是拟合出来的**——这就是为什么换一个泛函结论会动。

hybrid 的定义就是式 (2.5) 的交换部分按比例 $a$ 换成精确交换：

$$
E_{\mathrm{xc}}^{\mathrm{hyb}} = a\,E_{\mathrm x}^{\mathrm{HF}} + (1-a)\,E_{\mathrm x}^{\mathrm{GGA}} + E_{\mathrm c}^{\mathrm{GGA}}
\tag{2.6}
$$

$a$ 无量纲，PBE0 取 $a=0.25$，B3LYP 的 HF 交换份额约 $0.20$。HSE06 进一步把 $1/r$ 拆成短程与长程两段（用 $\mathrm{erf}(\omega r)/r$ 与 $\mathrm{erfc}(\omega r)/r$，$\omega$ 为 range-separation 参数，单位 $a_0^{-1}$，标准值 $0.11\ \mathrm{Å}^{-1}$），只对短程混 HF 交换——于是平面波实现里 HF 交换的六维积分被大幅削减，成本从"不可用"变成"很贵"。

**对离子液体的判断**：精确交换抬高带隙、修正自相互作用，因此**降低**GGA 对离子对之间虚假电荷转移的高估；代价是 $E_{\mathrm x}^{\mathrm{HF}}$ 在周期体系里对 $\mathbf k$ 网格与截断能极其敏感。**不要**把分子的杂化泛函结论直接搬到固体表面/液体盒子——那两边收敛性完全不同。

## 3 色散校正：离子液体的必选项

离子液体的每个阳离子都带烷基链。链与链之间的相互作用**几乎没有静电成分**（两个阳离子在链段区域的净电荷同号、相互排斥），偶极–偶极也小，吸引项基本只有 London 色散——瞬时密度涨落诱导的瞬时偶极相互作用，指数衰减为 $r^{-6}$。而 GGA 的 $E_{\mathrm{xc}}$ 是**局域或半局域**密度泛函，原理上不含这种跨区域的关联涨落，于是完全看不见它。

补法一：经验色散校正（DFT-D 家族）[2][3]

$$
E_{\text{disp}} = -\sum_{A>B}\frac{C_6^{AB}}{r_{AB}^{6}}f_{\text{damp},6}(r_{AB}) - \sum_{A>B}\frac{C_8^{AB}}{r_{AB}^{8}}f_{\text{damp},8}(r_{AB})
\tag{2.7}
$$

$$
f_{\text{damp},n}(r_{AB}) = \left\{1 + 6^{-1}\left(\frac{s_{r,n}\,R_0^{AB}}{r_{AB}}\right)^{\alpha_n}\right\}^{-1}
\tag{2.8}
$$

| 符号                 | 含义                                                                                                | 单位 / 量纲                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| $A,B$                | 原子指标，求和 $A>B$ 保证每对只算一次                                                               | —                                                            |
| $r_{AB}$             | 原子间距离                                                                                          | $a_0$ 或 Å（务必与 $R_0$ 同单位）                            |
| $C_6^{AB},C_8^{AB}$  | 两-body 色散系数（leading 与次级项）                                                                | $C_6$：$E_{\mathrm h}a_0^{6}$；$C_8$：$E_{\mathrm h}a_0^{8}$ |
| $f_{\text{damp},n}$  | 阻尼函数，$r\to\infty$ 时 $\to1$（恢复纯 $r^{-n}$），$r\to0$ 时 $\to0$（避免与 DFT 相关能重复计算） | 无量纲                                                       |
| $R_0^{AB}$           | 参考半径，零阻尼方案取两原子共价半径之和                                                            | Å                                                            |
| $s_{r,n},\ \alpha_n$ | 标度参数与阻尼指数，$\alpha_6=14,\ \alpha_8=16$ 为固定值                                            | 无量纲                                                       |

$C_6^{AB}$ 的关键设计是**依赖局域化学环境**：D3 从自由原子的 $C_6^{AA}$ 出发，用原子的配位数（coordination number）做插值修正，再用组合规则拼出异核对；D4 进一步把 $C_6$ 做成随原子电荷与更完整几何信息变化，并引入由密度推出的**many-body**（Axilrod–Teller 型）项。这对离子液体是实质差别——同一个 F 原子在 $\ce{[BF4]-}$、在 $\ce{[TFSI]-}$ 的 $\ce{-CF3}$ 端、在气相 $\ce{HF}$ 里，其可极化性完全不同，固定 $C_6$ 无法表达。

补法二：非局域泛函 [4]

$$
E_{\mathrm{nl}}[\rho] = \frac{1}{2}\iint \rho(\mathbf r)\,\phi(\mathbf r,\mathbf r')\,\rho(\mathbf r')\,\mathrm d\mathbf r\,\mathrm d\mathbf r'
\tag{2.9}
$$

$\phi$ 是标度后的 pairing kernel（无量纲标度函数 $f$ 依赖约化密度梯度），单位与 $E_{\mathrm{nl}}$ 匹配为 $E_{\mathrm h}a_0^{-6}$。vdW-DF [4] 与后来的 optB86b-vdW、rev-vdW-DF2 属于这一族：**色散被做进泛函本身**，因此是自洽的、受力解析，并且天然包含多体效应。

两条路线的取舍：

|                  | DFT-D（式 2.7–2.8）                                  | 非局域 vdW（式 2.9）                 |
| ---------------- | ---------------------------------------------------- | ------------------------------------ |
| 是否自洽影响轨道 | 否（后处理，能量与力可解析但势能面是"贴"上去的）     | 是                                   |
| 额外成本         | 可忽略（$O(N^2)$ 原子对求和）                        | 明显（两次非局域积分，需 FFT）       |
| 多体色散         | D3/D4 部分含                                         | 含（通过 $\rho$ 的乘积形式）         |
| 已知问题         | 键长变化时 $C_6$ 响应弱；过渡金属/强离域体系参数化差 | 对氢键体系有过结合倾向；泛函选择敏感 |
| 适合做什么       | 团簇、势能面扫描、结合能基准                         | 液相/表面、需要一致应力与声子        |

Zahn 与 Kirchner 对一系列离子对与团簇做的系统验证是本节的直接依据 [2]：结论的形状是——**未加色散校正的纯 GGA 显著低估离子对与中性团簇的结合能，加上两-body 色散校正后与更高级方法（MP2 级）的符合大幅改善；而色散校正并不能顺带修好基组叠加误差。** 换句话说，第 3 节解决"吸引不够"，第 4 节解决"账面有水分"，两件事都要做。

> [!WARNING]
> 看到"我们用 PBE 算了这个离子液体"而没有交代色散处理，可以直接判定为**结论未定**。缺色散不是"偏保守"，而是**烷基链区的层状纳米结构（第 1 讲讲的极性/非极性分离）在原理上不可能出现**——那是纯 GGA 与实测最直观的定性不符。

## 4 基组、赝势与 BSSE

|                       | 平面波 + 赝势                                      | 高斯型基组                              |
| --------------------- | -------------------------------------------------- | --------------------------------------- |
| 代表软件栈            | VASP、CP2K、Quantum ESPRESSO                       | Gaussian、ORCA、NWChem                  |
| 基组完备性            | 由截断能 $E_{\mathrm{cut}}$ 单参数控制，收敛性干净 | 加极化/弥散函数才改善，基组叠加误差固有 |
| 超胞 / $\mathbf k$ 点 | 原生支持，适合液相与表面                           | $\Gamma$-only 分子或团簇                |
| HF 交换               | 昂贵（需精确交换的 $\mathbf k$ 求和）              | 便宜                                    |
| 离子液体典型用法      | 体相液体、AIMD、表面吸附                           | 气相离子对、团簇、反应路径              |

平面波路线里，$\mathbf G$ 为倒格矢、$\mathbf k$ 为布里渊区波矢，动能上限给出截断判据 $\frac{1}{2}\lvert\mathbf G + \mathbf k\rvert^2 \le E_{\mathrm{cut}}$（a.u.）。**收敛判据必须打在能量差上，不是总能量上**：对离子液体，取离子对结合能 / 相对构型能差变化 $<1\ \mathrm{kJ/mol}$（约 $4\times10^{-4}\ E_{\mathrm h}$）作为收敛标准，而不是"总能量到 $10^{-6}\ E_{\mathrm h}$"——后者是 SCF 电子步的迭代阈值，两回事，混用是本领域最常见的表述错误。

**含 F、S、B 时的赝势选择。** 这几个元素的"外层"其实分得很开：F 的 $2s2p$ 是价电子，但 $2s$ 能级偏深；S 的 $3s3p$ 为价、$2p$ 半芯；B 只有 $2s2p$。规则是：

- $\ce{[BF4]-}$、$\ce{[PF6]-}$ 这类含氟阴离子：**选把 F 的 $2s$ 也当价电子处理的赝势**（常标 `_s` / semicore）。只把 $2p^5$ 当价电子会让 F 的 Pauli 排斥偏软，键长系统偏短、振动频率偏高。
- 含硫阴离子（$\ce{[TFSI]-}$）：优先选带 S 的 $2p$ 半芯或至少带 d 极化修正的方案；同时确认赝势文档给出的**推荐 $E_{\mathrm{cut}}$ 与 PAE（pseudo-atom overlap）判据**，PAE 随 $E_{\mathrm{cut}}$ 饱和才算赝势可靠。
- 有任何过渡金属（发射器表面 Pt，第 7 讲）：必须显式检查半芯态与磁学处理。
- 用 GPAW/CP2K 的 GTH 或 VASP 的 PAW 数据集时，把数据集名字写进方法部分——"用了 PBE" 不构成可复现描述。

**BSSE 与 counterpoise。** 用高斯基组算两个碎片 $A$、$B$ 的结合能，会遇到一个纯粹的记账问题：在复合物 $AB$ 的几何下，$A$ 的基函数不仅包括自己的，还可以"借用" $B$ 的基函数，于是 $E_A$ 被人为降低。这就是**基组叠加误差（basis-set superposition error, BSSE）**。Boys 与 Bernardi 提出的 counterpoise 校正 [5] 定义了三套能量，全部在**复合物的几何**下计算，只有基组集合不同：

$$
\begin{aligned}
E_{\text{bind}}^{\text{raw}} &= E_{AB}^{AB} - E_A^{A} - E_B^{B} \\
E_{\text{bind}}^{\text{CP}} &= E_{AB}^{AB} - E_A^{AB} - E_B^{AB} \\
\text{BSSE} &= \left(E_A^{AB} - E_A^{A}\right) + \left(E_B^{AB} - E_B^{B}\right) \ge 0
\end{aligned}
\tag{2.10}
$$

$E_X^{Y}$ 读作"碎片 $X$ 用基组 $Y$ 算出的能量"；$E_B^{AB}$ 意味着 $B$ 的核与电子保留、但把 $A$ 的所有基函数以**幽灵原子**（ghost function，只有基函数、没有核与电子）形式留在原地。三者关系是 $E_{\text{bind}}^{\text{CP}} = E_{\text{bind}}^{\text{raw}} + \text{BSSE}$，即**不做校正的结合能太负、吸引力被高估**。

数量级感受：离子对是**满电荷、短接触**的体系，两碎片各自有一整套高角基函数可借，BSSE 达到几十 $\mathrm{kJ/mol}$ 完全正常；加弥散函数（$+$ / $++$）会先加大 BSSE 再改善结合能，两者不是同向变化。**这就是为什么"小基组、不做 counterpoise"是离子液体 DFT 里最常见的错误**：误差既有符号（过量吸引）又有幅值，而且随基组变化不单调，靠"我用了更大的基组"不能自动修好。若用平面波路线，BSSE 在原则上不存在（基组完备），代价是必须用超胞并承担镜像相互作用修正——那是另一笔账。

## 5 AIMD 的两条路线

**先划清边界。** 本节说的是 **AIMD（ab initio MD）**：力由每一步的 DFT 给出，键**可以**断裂，但势能面无经验参数。它不同于第 3 讲的 classical MD（固定拓扑经验力场，键不断裂），也不同于 reactive MD（ReaxFF，键级式经验势，第 4 讲）。三种 MD 的成本与尺度对照：

|              | classical MD  | AIMD          | reactive MD (ReaxFF) |
| ------------ | ------------- | ------------- | -------------------- |
| 每步势能来源 | 力场解析式    | 完整 SCF      | 键级经验势           |
| 典型原子数   | $10^4$–$10^7$ | $10^2$–$10^3$ | $10^4$–$10^6$        |
| 可达时间     | ns–μs         | 10–100 ps     | ps–ns                |
| 键断裂       | 否            | 是            | 是                   |
| 化学精度来源 | 人工参数化    | 泛函选择      | 训练集覆盖度         |

AIMD 内部两条实现路线：

**Born–Oppenheimer MD（BOMD）。** 每步只解式 (2.1) 的基态（电子被"瞬时"跟着核走），核的运动用标准 Verlet 类积分。代价是每步一次完整 SCF；好处是轨迹保守于真实的基态势能面，系综性质干净，时间步可给 $0.5$–$1\ \mathrm{fs}$（含 H 的 IL 用 $0.5\ \mathrm{fs}$ 稳妥）。

**Car–Parrinello MD（CPMD）。** 把轨道本身升格为动力学变量，用扩展拉格朗日量：

$$
\mathcal L = \sum_i \frac{1}{2}\mu\left\lvert\dot\phi_i\right\rvert^2 - E_{\mathrm{KS}}[\{\phi_i\}] + \sum_{ij}\Lambda_{ij}\left(\left\langle\phi_i\middle\vert\phi_j\right\rangle - \delta_{ij}\right)
\tag{2.11}
$$

$\mu$ 是**人工的**电子 fictitious mass（单位 $m_e$，无量纲倍数的写法在文献里也常见，注意它不是电子真实质量），$\Lambda_{ij}$ 是保持轨道正归一化的 Lagrange 乘子矩阵（$E_{\mathrm h}$），$E_{\mathrm{KS}}$ 是式 (2.3) 的泛函。轨道在 $\mu$ 的惯性下围绕瞬时 Born–Oppenheimer 极小做快速振动，只要不把能量漏进电子自由度，时间平均就落在基态面上。这要求

$$
\Delta t \ll \omega_{\max}^{-1},\qquad \omega_{\max} \propto \left(\frac{\Delta\varepsilon_{\text{gap}}}{\mu}\right)^{1/2}
$$

$\Delta\varepsilon_{\text{gap}}$ 是 HOMO–LUMO 间隔（$E_{\mathrm h}$）。于是 $\mu$ 越大越容易把电子频率压低、允许大时间步，但同时更容易被核运动激发（绝热性破坏）。工程折中就是 **CPMD 需要 $\Delta t \sim 0.1\ \mathrm{fs}$**，比 BOMD 小 5–10 倍；换来的收益是每步只需一步或几步 SCF 更新，总成本在早年的代码栈上远低于完全收敛的 BOMD。今天 GPU/平面波效率提升后，多数 IL 工作走 BOMD；CPMD 仍有一个 BOMD 没有的困难：**电子自由度不热化**，NVT/NPT 恒温恒压需要额外给电子假质量 thermostat，否则长时间轨迹的动能分布会漂移。

室温离子液体的 AIMD 谱系从这里起步：Del Pópolo、Lynden-Bell 与 Kohanoff 首次把一个室温离子液体整体放进第一性原理分子动力学 [6]，证明了液相的电荷涨落、瞬时偶极与氢键网络可以**从轨迹里读出来**而不是当作力场输入。Bhargava 与 Balasubramanian 把这条路线用于 $\ce{[bmim][PF6]}$ 以及它与 $\ce{CO2}$ 的混合物，给出了气相红外与中子散射可比对的 $\ce{[PF6]-}$ 配位结构 [7]。这类工作的共同边界要诚实说清：**盒子百把个离子、轨迹几十 ps**，足以回答结构与电子重分配，不足以给出扩散系数与黏度——那是第 3 讲的战场，而且那里的误差主要来自平衡时间，不是来自电子结构。

## 6 离子液体体系的 DFT 验证基准

拿到一个泛函 + 校正 + 基组的组合，先跑这四项基准，再谈新结论。

| 基准量                                         | 怎么算                          | 能对上实验吗            | 系统性偏差方向                                                                                                                                       |
| ---------------------------------------------- | ------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 气相离子对结合能 $E_{\text{bind}}^{\text{CP}}$ | 式 (2.10)，做 CP 校正           | 与 MP2/CCSD(T) 基准可比 | 纯 GGA **低估**（缺色散）；小基组不做 CP **高估**（BSSE）；两错可能部分抵消——抵消不是正确                                                            |
| 液相 RDF $g_{\alpha\beta}(r)$ 与结构因子       | AIMD 轨迹的偏对分布             | 中子/X 射线衍射可比     | GGA 下烷基链区峰形偏弱（缺色散 $\Rightarrow$ 纳米 segregation 不明显）；加色散后主峰位置与衍射数据基本重合，改善最明显的是**峰强与次壳层**，不是峰位 |
| 质量密度 $\rho_m$                              | NPT AIMD 的盒平均（第 3 讲）    | 直接可比                | 纯 GGA 系统性偏低（体积过大、链区松散）；非局域 vdW 或 DFT-D 路线偏差明显更小；这是**最便宜也最容易被拿来冒充验证**的量                              |
| 扩散系数 $D$                                   | 第 3 讲的 Einstein 均方位移关系 | 可与 PFG-NMR 比         | **不要用 AIMD 的 $D$ 做验证**：ps 级轨迹的 MSD 远未进扩散区，值普遍偏低一个数量级以上，偏差来自采样长度而非泛函                                      |

前两项是 DFT 的**内在**验证，第三项是热力学弱验证，第四项是 DFT 原理上验证不了的东西。把这四项分清的判据，就是本讲的验收目标：**给定 $\ce{[emim][BF4]}$ 的离子对结合能问题**——它是 1-ethyl-3-methylimidazolium tetrafluoroborate（文献亦作 EMI-BF4）——你应当能回答：高斯基组路线、meta-GGA 或 hybrid 加 D3/D4 色散校正、**必须**做 counterpoise、预期偏差方向是"不校正则太负（BSSE）或不校正则太浅（缺色散）"，并且知道这个数不能拿去验液相扩散。

**通向第 8 讲的一个特例。** 含能离子液体的团簇 DFT 给出了宏观动力学给不出的信息：$\ce{NH3OH+ NO3-}$（hydroxylammonium nitrate, HAN）小团簇里氢键网络与质子转移的双势阱 [8]，以及气相 $\ce{NH4N(NO2)2}$（ammonium dinitramide, ADN）团簇中同类的质子转移路径 [9]。两篇的共同结论是**基态能量面上质子住在阴离子一侧还是阳离子一侧取决于团簇尺寸与泛函**，这正是第 8 讲"分解由质子转移起始"的第一性原理依据。注意：这两项是团簇计算，不是表面催化。

最后建立第 8 讲要用的那座桥。DFT 能给的是 $0\ \mathrm K$ 的势垒高度 $\Delta E^{\ddagger}$，实验给的是表观速率常数，中间靠过渡态理论（TST）连接：

$$
k = \frac{k_{\mathrm B}T}{h}\,\frac{Q^{\ddagger}}{Q_{\mathrm R}}\,\exp\!\left(-\frac{\Delta E^{\ddagger}}{k_{\mathrm B}T}\right)
\tag{2.12}
$$

$k_{\mathrm B}$ Boltzmann 常数（$\mathrm{J/K}$）、$T$ 温度（$\mathrm K$）、$h$ Planck 常数（$\mathrm{J\,s}$，注意 $k_{\mathrm B}T/h$ 在 $300\ \mathrm K$ 约 $6.2\times10^{12}\ \mathrm s^{-1}$，就是第 6 讲指前因子的量级来源）、$Q^{\ddagger}$ 过渡态配分函数**扣除反应坐标那一个虚频模式**、$Q_{\mathrm R}$ 反应物配分函数（同温同体积，两者之比无量纲）、$\Delta E^{\ddagger}$ 为电子能垒（$\mathrm{J/mol}$，通常用 $E^{\ddagger}_{\mathrm{elec}}$ 而非 $\Delta G$，若换 $\Delta G^{\ddagger}$，则配分函数比要相应改成含标准态浓度校正的形式）。**式 (2.12) 里最容易被忽略的是 $Q^{\ddagger}/Q_{\mathrm R}$ 而不是指数项**：$\Delta E^{\ddagger}$ 差 $10\ \mathrm{kJ/mol}$ 是 $50\times$，但熵项被忘掉是 $10^2$–$10^6$ 倍的系统偏差，而且方向总是"低估速率"。

## 7 小结

1. DFT 的全部未知压在 $E_{\mathrm{xc}}[\rho]$ 一项上（式 2.3–2.4）；层级（式 2.5–2.6）换的是「泛函看见什么」，每换一级对离子液体的后果**具体且单向**：纯 GGA 低估结合能、高估电荷转移。
2. **色散校正是必选项**：烷基链区的吸引在物理上只有 London 色散，半局域泛函原理上看不见（式 2.7–2.9）。缺校正 $\Rightarrow$ 纳米尺度相分离消失，是定性错误。
3. **算离子对结合能必须做 counterpoise**（式 2.10）：BSSE 的符号是「结合能太负」、幅值几十 $\mathrm{kJ/mol}$，只靠加大基组而不做校正，收敛既不单调也不可控。
4. AIMD 两条路线的差别是 $\mu$ 与时间步（式 2.11）：CPMD $\sim0.1\ \mathrm{fs}$、BOMD $0.5$–$1\ \mathrm{fs}$；两者都只能到百原子、几十 ps，因此**不能**用 AIMD 的扩散系数做验证。
5. 四项基准中只有结合能与 RDF 算内在验证，密度是弱验证，扩散系数不在 DFT 的验证范围内。
6. 式 (2.12) 是 DFT 通向速率的唯一出口，第 8 讲全程使用它；注意熵项与虚频剔除。

下一讲离开电子结构，把力场交给经典 MD：长程静电怎么算、平衡多久才算够，以及 Nernst–Einstein 电导率为什么会骗人。

## 参考文献

[1] John P. Perdew, Kieron Burke, Matthias Ernzerhof. Generalized Gradient Approximation Made Simple. Physical Review Letters, 1996. DOI: 10.1103/PhysRevLett.77.3865.

[2] Stefan Zahn, Barbara Kirchner. Validation of Dispersion-Corrected Density Functional Theory Approaches for Ionic Liquid Systems. The Journal of Physical Chemistry A, 2008, 112: 8430–8435. DOI: 10.1021/jp805306u.

[3] Stefan Grimme, Jens Antony, Stephan Ehrlich, Helge Krieg. A consistent and accurate ab initio parametrization of density functional dispersion correction (DFT-D) for the 94 elements H–Pu. The Journal of Chemical Physics, 2010. DOI: 10.1063/1.3382344.

[4] M. Dion, H. Rydberg, E. Schröder, D. C. Langreth, B. I. Lundqvist. Van der Waals Density Functional for General Geometries. Physical Review Letters, 2004. DOI: 10.1103/PhysRevLett.92.246401.

[5] S. F. Boys, F. Bernardi. The calculation of small molecular interactions by the differences of separate total energies. Some procedures with reduced errors. Molecular Physics, 1970. DOI: 10.1080/00268977000101561.

[6] Mario G. Del Pópolo, Ruth M. Lynden-Bell, Jorge Kohanoff. Ab Initio Molecular Dynamics Simulation of a Room Temperature Ionic Liquid. The Journal of Physical Chemistry B, 2005, 109: 5895–5902. DOI: 10.1021/jp044414g.

[7] B. L. Bhargava, Sundaram Balasubramanian. Insights into the Structure and Dynamics of a Room-Temperature Ionic Liquid: Ab Initio Molecular Dynamics Simulation Studies of 1-<i>n</i>-Butyl-3-methylimidazolium Hexafluorophosphate ([bmim][PF<sub>6</sub>]) and the [bmim][PF<sub>6</sub>]−CO<sub>2</sub> Mixture. The Journal of Physical Chemistry B, 2007, 111: 4477–4487. DOI: 10.1021/jp068898n.

[8] Saman Alavi, Donald L. Thompson. Hydrogen bonding and proton transfer in small hydroxylammonium nitrate clusters: A theoretical study. The Journal of Chemical Physics, 2003, 119: 4274–4282. DOI: 10.1063/1.1593011.

[9] Saman Alavi, Donald L. Thompson. Proton transfer in gas-phase ammonium dinitramide clusters. The Journal of Chemical Physics, 2003, 118: 2599–2605. DOI: 10.1063/1.1535439.

> [!NOTE]
> 以上九条已逐条经 Crossref `/works/<DOI>` 回查，年份、卷、页以 Crossref 为准。[1][3][4][5] 为教科书级奠基文献（PBE、DFT-D3、vdW-DF、counterpoise），DOI 于 2026-09-05 核验轮次补齐（见 `docs/paper/track-md-dft.md`「奠基文献补全」）。
>
> 需要说明：**本讲的定量结论不依赖这四条的拟合系数**。式 (2.5)–(2.10) 里它们只以定义与函数形式出场；本讲写出的每个数字（$27.2114\ \mathrm{eV}$、$0.11\ \text{Å}^{-1}$、$6.2\times10^{12}\ \mathrm{s^{-1}}$、HF 交换份额 $0.25$ 与 $0.20$）都取自原子常数或泛函定义本身。
