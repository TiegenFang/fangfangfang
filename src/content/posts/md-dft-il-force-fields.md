---
author: Tiegen Fang
pubDatetime: 2026-09-05T04:00:00Z
title: 第 4 讲：力场谱系——固定电荷、极化、粗粒化与 ReaxFF
description: 固定电荷、极化（Drude 振子、诱导偶极自洽、可变电荷均衡）、粗粒化与 ReaxFF 反应性力场四条路线各自的机制、额外代价与失效边界，force matching 在力场谱系中的位置，附一张按问题类型选力场的总决策表。
course: md-dft-ionic-liquid
order: 4
tags:
  - 分子动力学
  - 离子液体
draft: false
---

第 3 讲把运动方程、系综与长程静电求解器按标准做法搭好了。剩下的问题是：**势能 $U$ 写得对不对。** classical MD 全部的质量只来自力场，其余都是通用工程。这一讲把离子液体常用的四条路线摆开——固定电荷、极化、粗粒化、ReaxFF 反应性力场——再补一条从 DFT 走向力场的参数化方法 force matching，它同时是第 5 讲机器学习势函数的直接前身。

## 1 固定电荷力场：一个表达式说清它的世界观

$$
U = \sum_{\text{bonds}} k_b (b-b_0)^2
  + \sum_{\text{angles}} k_\theta(\theta-\theta_0)^2
  + \sum_{\text{dihedrals}} \frac{V_n}{2}\left[1+\cos(n\phi-\gamma)\right]
  + \sum_{i<j}\left[\frac{q_i q_j}{4\pi\varepsilon_0 r_{ij}} + 4\epsilon_{ij}\left(\left(\frac{\sigma_{ij}}{r_{ij}}\right)^{12}-\left(\frac{\sigma_{ij}}{r_{ij}}\right)^{6}\right)\right]
\tag{4.1}
$$

各项符号与单位：$k_b$ 键伸缩力常数（$\mathrm{kcal\,mol^{-1}\,\text{Å}^{-2}}$），$b$、$b_0$ 瞬时键长与平衡键长（$\text{Å}$）；$k_\theta$ 角弯曲力常数（$\mathrm{kcal\,mol^{-1}\,rad^{-2}}$），$\theta$、$\theta_0$ 瞬时键角与平衡键角（rad）；$V_n$ 二面角势垒幅值（$\mathrm{kcal\,mol^{-1}}$），$n$ 周期性（无量纲整数），$\phi$ 二面角（rad），$\gamma$ 相位（rad）；$q_i$ 原子 $i$ 的部分电荷（以基本电荷 $e$ 为单位）；$r_{ij}$ 原子间距（$\text{Å}$）；$\epsilon_{ij}$ 是 Lennard-Jones 势阱深度（$\mathrm{kcal\,mol^{-1}}$）、$\sigma_{ij}$ 是其直径参数（$\text{Å}$），混合规则通常用 Lorentz–Berthelot 几何/算术平均；$\varepsilon_0$ 真空介电常数（$\mathrm{C^2\,J^{-1}\,m^{-1}}$）。实际代码里库仑常数被折进一个数值因子（$332.06371\ \mathrm{kcal\,\text{Å}\,mol^{-1}\,e^{-2}}$），所以式 (4.1) 的静电项写作 $q_iq_j/r_{ij}$ 即可。

三条 OPLS/AA 与 GAFF 谱系在离子液体上的参数化惯例值得写明，因为它们都是**拟合工程而非物理原理**：

1. $q_i$ 不是量子力学可观测量。它是把分子静电势（ESP）拟合到原子中心点电荷的产物（RESP 流程），再约束到分子总电荷。惯用拟合水平是 HF/6-31G\*。
2. 二面角项与 1-4 原子对（同一键角两端的原子）的非键作用要额外乘缩放因子，否则烷基链的构象分布会系统性跑偏。
3. **离子液体多一条：把离子电荷整体缩放到 $\pm0.7\text{–}0.9e$。** 这就是第 3 讲第 5 节引入的经验补丁，其作用是补偿式 (4.1) 里缺失的相互作用极化。

## 2 固定电荷为什么在离子液体上系统性失效

先看定量参照。气相水分子偶极矩 $1.855\ \mathrm{D}$（$1\ \mathrm{D} = 0.20819\ e\!\cdot\!\text{Å}$），而凝聚相中邻近分子的电场把它诱导增强约 30–50%。固定电荷模型的处理方式是**一次性吸收**：常用的三 site 水模型直接把偶极矩设成约 $2.35\ \mathrm{D}$，把液相平均场"烤"进参数里。这个技巧在环境电场均匀的体系中成立得很好。

**离子液体不是均匀环境。** 它是纯离子体系，没有溶剂稀释这层缓冲：以最常用的 $\ce{[emim][BF4]}$（1-ethyl-3-methylimidazolium tetrafluoroborate，文献亦作 EMI-BF4）为例，一个阳离子最近的配位壳层就是几个 $\ce{[BF4]-}$，局部电场达到 $10^{9}\ \mathrm{V/m}$ 量级（回指第 6 讲对成锥临界场强 $E_c$ 的量级估算），并且从体相到表面、从第一配位层到第二层变化剧烈。极化响应是一个**局域量**，而缩放电荷是一个**全局常数**——用一个常数去顶替一个随位置与组成变化的函数，误差的方向是可预测的：

- 静电被高估 ⇒ 离子对与团簇结合过深 ⇒ 正负离子关联过强；
- 关联过强直接压在输运上：**扩散系数偏低、黏度偏高**（可以差到数量级），且这种偏差与第 3 讲的慢弛豫问题纠缠在一起，很容易被误读成"模拟还没平衡"；若再拿这些 $D$ 去套第 3 讲式 (3.14) 的 Nernst–Einstein 关系反推电导率，还会因为忽略反离子的协同运动而**高估 $30$–$60\%$**，且这个误差会等比例传进第 6 讲的电流标度律；
- 结合过深同时抬高相变温度：**熔点与玻璃化温度系统偏高**，长时间模拟里 IL 常常过冷而不结晶；
- 而**结构性质看起来很好**。RDF 的主峰位由几何堆积与电荷中性决定，对势能面陡度不敏感——这正是该错误能在文献里存活二十年的原因 [1]。

> [!WARNING]
> 本课最重要的判断之一：**极化力场是离子液体的默认选择，不是高级选项。** 理由不是"精度高一档"，而是固定电荷的物理假设（环境响应可被单个常数吸收）在纯离子体系上原理上不成立。电荷缩放在体相里常常"看起来对"，因为体相环境相对均匀；一旦体系出现界面、自由表面、纳米液滴、强电场——也就是本课程第 6、7 讲的全部对象——缩放常数就失去了标定依据。这一结论在综述与专门的迁移率研究前后一致 [1][2]。

## 3 极化力场的三条技术路线

三条路线的共同点：引入一个随环境即时响应的自由度。区别在**响应住在哪**。

**路线 A：Drude 振子。** 在可极化原子上挂一个带负电荷的谐振子（shell 粒子），核壳相对位移 $\Delta\boldsymbol r$ 产生偶极矩。极化率由谐振子的电荷与弹簧常数决定：

$$
\alpha_{\mathrm D} = \frac{q_{\mathrm D}^{2}}{k_{\mathrm D}}
\tag{4.2}
$$

其中 $q_{\mathrm D}$ 是 Drude 粒子电荷（$e$，取负值），$k_{\mathrm D}$ 是弹簧力常数（$\mathrm{kcal\,mol^{-1}\,\text{Å}^{-2}}$），$\alpha_{\mathrm D}$ 是各向同性极化率（$\mathrm{\text{Å}^{3}}$，换算关系 $\alpha[\mathrm{\text{Å}^3}] = 332.06\,q_{\mathrm D}^2[\mathrm{e^2}]/k_{\mathrm D}[\mathrm{kcal\,mol^{-1}\,\text{Å}^{-2}}]$）。常见做法是固定 $q_{\mathrm D}$、调 $k_{\mathrm D}$ 使 $\alpha_{\mathrm D}$ 复现目标原子或官能团的实验极化率。代价：多出一类轻粒子自由度，必须用双恒温器把 Drude 粒子的"电子温度"钳在约 $1\ \mathrm{K}$，否则振子被加热、极化发散。这条路线在生物与电解质体系上的成熟参数化生态，其发展史与液相验证有专门综述 [3]；**离子液体上的可迁移极化力场 CL&Pol 走的也是这条路**——在已有的固定电荷模型上加可极化位点，再按官能团转移参数 [4]，其后续扩展把同一套参数规则推广到电解质、质子型离子液体与深度共晶溶剂 [5]。

**路线 B：诱导偶极自洽。** 不增加自由度，而是给位点各向异性极化张量 $\boldsymbol\alpha_i$，每个 MD 步迭代求解

$$
\boldsymbol\mu_i = \boldsymbol\alpha_i\left(\mathbf E_i^{0} + \sum_{j\neq i}\mathbf T_{ij}\boldsymbol\mu_j\right),
\qquad
\mathbf T_{ij}=\frac{1}{4\pi\varepsilon_0}\left[\frac{3\hat{\mathbf r}_{ij}\hat{\mathbf r}_{ij}-\mathbf I}{r_{ij}^{3}}\right]
\tag{4.3}
$$

符号：$\boldsymbol\mu_i$ 位点 $i$ 的诱导偶极矩（$e\!\cdot\!\text{Å}$ 或 D）；$\boldsymbol\alpha_i$ 极化张量（$\mathrm{\text{Å}^{3}}$）；$\mathbf E_i^0$ 除去 $i$ 自身之外所有固定电荷与永久多极产生的电场（$\mathrm{V\,\text{Å}^{-1}}$，$1\ \mathrm{V\,\text{Å}^{-1}} = 10^{10}\ \mathrm{V/m}$）；$\mathbf T_{ij}$ 偶极–偶极作用张量（$\mathrm{\text{Å}^{-3}}$，含库仑常数）；$\hat{\mathbf r}_{ij}$ 单位矢量（无量纲）、$\mathbf I$ 单位张量。收敛判据取相对残差 $\max_i \lVert\boldsymbol\mu_i^{(n+1)}-\boldsymbol\mu_i^{(n)}\rVert / \lVert\boldsymbol\mu_i^{(n)}\rVert < 10^{-6}$，典型十几到几十步。式 (4.3) 逐点偶极在 $r_{ij}\to0$ 时发散（所谓 dipole catastrophe），必须配 Thole 型阻尼函数把短程相互作用软化——这是诱导偶极路线的实现核心，不是可选修饰。极化能对号入座为 $U_{\text{pol}}=\sum_i \tfrac{1}{2}\boldsymbol\mu_i\cdot\boldsymbol\alpha_i^{-1}\cdot\boldsymbol\mu_i$（$\mathrm{kcal\,mol^{-1}}$）。这条路线的代表是把永久多极与诱导偶极同时展开到原子位点的 AMOEBA [6]，以及针对离子液体做参数化的 AMOEBA-IL 系列 [7]。

**路线 C：可变电荷 / 电荷均衡。** 偶极不动、电荷动：每步按电负性均衡解一次线性方程组，让电荷随环境重分配，

$$
\chi_a + \sum_b J_{ab}q_b + \varphi_a^{\text{ext}} = \lambda,
\qquad \sum_b q_b = Q_{\text{tot}}
\tag{4.4}
$$

$\chi_a$ 原子 $a$ 的气相电负性（eV）、$J_{ab}$ 硬化核/库仑核（$\mathrm{eV\,e^{-2}}$，对角元为原子硬化度）、$\varphi_a^{\text{ext}}$ 其余原子在 $a$ 处的电势（V）、$\lambda$ 为强制总电荷守恒 $Q_{\text{tot}}$（$e$）的 Lagrange 乘子（eV·$e^{-1}$）。它捕捉的是电荷转移与环境极化的粗粒版本，代价低于 A、B，但无法给出各向异性的多极响应。

| 路线           | 响应住在哪         | 代表力场                            | 额外代价（相对固定电荷） | 数值要求                                        | 适用                                      |
| -------------- | ------------------ | ----------------------------------- | ------------------------ | ----------------------------------------------- | ----------------------------------------- |
| A Drude 振子   | 附加的核–壳粒子    | 经典 Drude 极化力场 [3]、CL&Pol [4] | 约 2–3×                  | 双恒温器钳电子温度；时间步受振子限制            | 参数化生态成熟，电解质/生物/IL 均已成体系 |
| B 诱导偶极自洽 | 位点上的偶极矢量   | AMOEBA [6]、AMOEBA-IL [7]           | 约 3–5×                  | 每步 SCF 迭代至残差 $10^{-6}$；Thole 阻尼       | 高精度、需要多极展开的体系                |
| C 可变电荷均衡 | 重新分配的标量电荷 | QEq 类、ReaxFF 的电荷模块           | 约 2–4×                  | 每步解 $N\times N$ 线性系统（可用多重网格加速） | 组成/界面多变、需含电荷转移的体系         |

> [!WARNING]
> 一个容易误记的点：**CL&Pol 的电荷是固定的**——用原子电荷增量法分配、不按环境重分配，极化全部由挂在原子上的 Drude 型可极化位点承担（LAMMPS 实现即 `fix drude`，氢以外原子各挂一个）[4][5]。它常被与电荷均衡路线混为一谈。同理，ReaxFF 的电荷走路线 C，所以它同时踩在极化路线与反应性路线上（第 6 节）。

粗粒化不在上表里，因为它不是"把极化补回来"的路线，而是"把自由度删掉"的路线。

## 4 粗粒化：拿结构换时间

做法是把一整个基团或一段烷基链合并成一个相互作用珠，离子对则常简化为带电珠（甚至把阳离子的头基与尾链分成不同珠子）。时间尺度上推 **2–3 个数量级**的来源有两个，量级相当：粒子数下降使非键对数按 $N^2$ 缩减；势能面变平（抹掉了高频振动与内转动）使可用时间步从 $1\ \mathrm{fs}$ 提到数 $\mathrm{fs}$。于是微米尺度的自组装、相分离与界面动力学变得可及 [8]。

代价同样明确：氢键方向性、局部配位结构、以及一切依赖原子位置机理的量都不再存在。其有效性与所拟合的参考模型或实验自由能绑定，换组成就要重做。

> [!WARNING]
> **边界：粗粒化不适用于发射器表面与场蒸发问题。** 第 6 讲场蒸发势垒的四项拆解——内聚能、团簇化结合能、电场做功、镜像修正——全部由具体的离子种类、配位几何与表面第一层的化学决定；把烷基链折成一颗珠子，恰好抹掉了要问的东西。粗粒化能给你锥尖之外几微米处的相行为，给不了"哪个离子先离开液面"。第 7 讲讨论发射器表面时会回指这条边界。

## 5 force matching：从 DFT 到力场的桥，也是第 5 讲的前身

参数化力场还有一条完全自下而上的路：不去拟合实验量，而是拟合第一性原理给出的**力**。

$$
\{\boldsymbol\theta\}=\arg\min_{\boldsymbol\theta}\;
\frac{1}{N_{\text{train}}}\sum_{k=1}^{N_{\text{train}}}\sum_{i=1}^{N_{\text{atom}}}
\left\|\mathbf F_{i,k}^{\text{FF}}(\boldsymbol\theta)-\mathbf F_{i,k}^{\text{DFT}}\right\|^{2}
\tag{4.5}
$$

$\boldsymbol\theta$ 待定的力场参数向量（电荷、$\epsilon$、$\sigma$，若采用极化模型还包括 $\alpha$）；$\mathbf F_{i,k}^{\text{FF}}$ 与 $\mathbf F_{i,k}^{\text{DFT}}$ 分别为第 $k$ 个构型上原子 $i$ 的经典力与 DFT Hellmann–Feynman 力，单位 $\mathrm{kcal\,mol^{-1}\,\text{Å}^{-1}}$（等价地 $\mathrm{eV/\text{Å}}$，$1\ \mathrm{eV/\text{Å}} = 23.06\ \mathrm{kcal\,mol^{-1}\,\text{Å}^{-1}}$）；$N_{\text{atom}}$ 体系的原子数、$N_{\text{train}}$ 来自 AIMD 轨迹的构型数。构型必须从 AIMD 采样，否则拟合点落在真实液相不会去的地方。

为什么拟力而不拟能量：一个构型只给一个能量数，却给 $3N_{\text{atom}}$ 个力分量；能量曲面的**斜率**才是动力学感受到的东西。这条谱系在室温离子液体上从一开始就是极化的——force matching 拟合出的有效力场把多体极化以参数形式吸收进去了 [9]；同期也有把第一性原理信息直接做成刚性分子力场的工作 [10]。

> [!NOTE]
> 把式 (4.5) 和力场谱系的关系说穿：式 (4.5) 的函数形式（键 + 角 + 二面角 + 点电荷 + LJ）是**人预先写死的**，DFT 数据只能在其中调系数。写死的形式装不下的物理，拟合得再好也装不进去。**把"人写死函数形式"换成"让网络自己从力数据里学函数形式"，得到的就是第 5 讲的机器学习势函数。** 谱系是连续的，第 4 与第 5 讲的差别只在参数化那一侧。

## 6 ReaxFF：让键能断，代价是训练集统治一切

**先把定位钉牢。** ReaxFF 属 **reactive MD**：势能仍然是**经验**键级势，只是不再固定拓扑。它**每步不解 Kohn–Sham 方程，不是 ab initio，也不是量子力学方法**（第 2 讲的 AIMD 才是）；推进剂文献里 QMD 一词常指这类反应性 MD，第 8 讲会专门澄清术语。

它的核心是一个由核间距连续决定的键级：

$$
BO_{ij}=\exp\!\left[-\left(\frac{r_{ij}}{r_0}\right)^{p}\right]
\tag{4.6}
$$

$r_{ij}$ 核间距（$\text{Å}$）、$r_0$ 该元素对的参考键长（$\text{Å}$）、$p$ 无量纲衰减指数；$BO_{ij}\in(0,1]$，$r_{ij}\to0$ 时趋于 1（满键），$r_{ij}$ 拉大时连续趋于 0（键断）。原子 $i$ 的总键级 $BO_i=\sum_{j\neq i}BO_{ij}$（无量纲）用来判定配位数与杂化：断键不再是"事件"，而是 $BO$ 连续衰减的自然结果，键能、角能、共轭能项全部按 $BO$ 的幂次加权。静电部分则按路线 C 每步重解电荷均衡（式 (4.4)）。

参数化流程是它的真正难点：几十个反应参数分成十余组，全部拟合到**量子化学数据集**（键离解曲线、反应能、质子/氢转移能垒、分子构型扫描）加上少量凝聚相量（状态方程、内聚能），并按需引入表面与吸附数据 [11][12]。训练集的**覆盖度**要求是硬指标：反应物、中间体、所有想得到的产物分支、以及至少沿反应坐标的约束扫描点都要有数据。Depew 等人对 HAN 热分解的 ReaxFF 工作就是范本——论文主体是训练集的构成与覆盖范围，而不是一句"参数已优化" [12]。

> [!WARNING]
> **ReaxFF 的主要风险是训练集之外的外推失控。** 键级势没有物理原理保证未训练区域的势能合理：温度、压力或化学计量一变，产物分布就可能整体跑偏，而且**不会报错**——模拟照常稳定跑完，给出的自由基种类与产物比例却完全是外推。第 5 讲会把同一个问题（平衡态训练数据里没有过渡态构型）原样搬到机器学习势函数上。用 ReaxFF 报告分解产物时，必须同时报告训练集覆盖了哪些物种与哪些构型区。

## 7 选型总表

这是本讲的主产物。用法：找到你的问题那一行，读最后一列——**知道失效模式比知道该选什么更重要。**

| 问题类型                             | 推荐力场类别                                       | 理由                                                                     | 已知失效模式                                                              |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 体相结构（RDF、纳米空区、氢键网络）  | 固定电荷 + 电荷缩放即可用                          | 主峰位由几何与电中性决定，对陡度不敏感                                   | 结论随力场翻转而不报错；烷基链长依赖被单点拟合掩盖                        |
| 体相输运（$D$、$\eta$、$\sigma$）    | 极化力场（A 或 B 路线）为默认                      | 输运量直接受势能面陡度与离子关联控制（第 2 节）                          | 2–5× 成本；慢弛豫下仍需数十 ns 平衡（第 3 讲）                            |
| 混合物、多组分与深度共晶体系         | 可迁移的极化力场（CL&Pol 及其电解质/质子型扩展）   | 参数按官能团转移，不必逐体系重拟合 [4][5]                                | 缺验证数据的阳离子家族；水/醇共存时氢键网络精度未定                       |
| 电极界面、双电层、表面吸附           | 极化，路线 C（可变电荷）优先                       | 屏蔽程度随位置剧变，体相标定的缩放常数失效                               | 金属侧镜像响应无经典对应物；界面电容定量偏差常见                          |
| 发射器表面与场蒸发（第 6、7 讲）     | 极化力场，并在目标场强下重新验证；必要时 AIMD/MLIP | $10^{9}\ \mathrm{V/m}$ 下缩放电荷无标定依据，$E_{\text{coh}}$ 直接进势垒 | 极化灾难需 Thole 阻尼；现有极化力场几乎未在 $10^{9}\ \mathrm{V/m}$ 标定过 |
| 长时自组装、相分离、液滴融合         | 粗粒化                                             | 时间尺度上推 2–3 数量级                                                  | 丢失氢键方向性与局部结构；**不适用于 nm 尺度机理**（第 4 节）             |
| 热分解、催化分解、质子转移与键断裂   | ReaxFF（reactive MD）                              | 唯一能在 MD 尺度上连续改变拓扑、且对含能体系有参数集的路线               | 训练集外推失控；势垒高度与产物分布对参数极敏感 [11][12]                   |
| 反应路径 + 需要 DFT 级精度、体系不大 | AIMD（第 2 讲）或 MLIP（第 5 讲）                  | 电子结构直接给出电荷重分配与成键                                         | ps 尺度与百原子量级（AIMD）；训练集覆盖度（MLIP）                         |

**三个算例。**

_体相黏度。_ 目标是给第 6 讲的 cone-jet 标度律提供 $\eta$。选极化力场（路线 A/B），因为 $\eta$ 是陡度敏感的输运量；已知失效模式是收敛——离子液体的 $\eta$ 需要数十 ns 平衡，用式 (4.3) 的自洽极化再把成本乘 3–5 倍，很多人因此退回"固定电荷 + 缩放"，然后拿一个偏高一倍的 $\eta$ 去代标度律。

_纳米液滴在电场中的发射。_ 选极化力场，并额外做一件事：在**目标场强本身**下验证极化响应，而不是相信体相标定。已知失效模式是第 6 讲场蒸发势垒里的镜像电荷项在经典模型中根本没有对应物；用粗粒化会连"发射的是哪个离子"都答不出。

_HAN 基推进剂的热分解产物分布。_ 选 ReaxFF。已知失效模式是外推：产物里出现一个训练集中没有的含氮中间体时，它的生成率没有任何可信度。这一类体系的极化力场结构研究已经存在 [13]，但结构信息不能替代反应拓扑——两者是互补而不是替代关系，第 8 讲会同时用到。

## 8 三个接口

1. **向上**：极化力场是第 6、7 讲全部输运量与发射阈值的前提；缩放电荷在强电场下失效这点，第 7 讲第 5 节专门摊开。
2. **向旁**：粗粒化的适用边界（第 4 节的 WARNING）在第 7 讲讨论发射器表面时会被直接引用。
3. **向前**：式 (4.5) 的 force matching 是第 5 讲的起点。谱系是"把函数形式交出去"，而不是"换一套数据"。

## 关于标识符的说明

本讲十三条参考文献已逐条经 Crossref `/works/<DOI>` 回查，题名、年份、卷与页以核验表（`docs/paper/track-md-dft.md`）及其「奠基文献补全」小节为准，本讲**没有**无标识符的条目。核验中改掉了三处易错点：**（a）** Drude 路线引的是 Lemkul、Huang、Roux 与 MacKerell 的发展史综述 [3]（_Chem. Rev._, **2016**）；spec 点名的 2013 年 Drude 参数化论文署名经回查不符，不以其为引；**（b）** AMOEBA 的原始文献是 Ren 与 Ponder 面向**水模型**的 _J. Phys. Chem. B_ 2003 一文 [6]，面向离子液体的多极/极化分支是另一条线 [7]；**（c）** ReaxFF 的原始文献是 van Duin 等人 _J. Phys. Chem. A_ **2001** 的烃类一文 [11]。电荷缩放 $\pm0.8e$ 在本讲只作为「约定 + 早期实施文献」使用（归属断言的限度见第 3 讲），经验结论与极化对照依据 [1][2]。不编造标识符。

## 参考文献

[1] Dmitry Bedrov, Jean-Philip Piquemal, Oleg Borodin, Alexander D. MacKerell 等. Molecular Dynamics Simulations of Ionic Liquids and Electrolytes Using Polarizable Force Fields. Chemical Reviews, 2019, 119: 7940–7995. DOI: 10.1021/acs.chemrev.8b00763.

[2] Vitaly Chaban. Polarizability versus mobility: atomistic force field for ionic liquids. Physical Chemistry Chemical Physics, 2011, 13: 16055. DOI: 10.1039/c1cp21379b.

[3] Justin A. Lemkul, Jing Huang, Benoît Roux, Alexander D. MacKerell. An Empirical Polarizable Force Field Based on the Classical Drude Oscillator Model: Development History and Recent Applications. Chemical Reviews, 2016, 116: 4983–5013. DOI: 10.1021/acs.chemrev.5b00505.（Crossref issued 年为 2016，非 2013；DOI 串里的 5b00505 是文章号）

[4] Kateryna Goloviznina, José N. Canongia Lopes, Margarida Costa Gomes, Agílio A. H. Pádua. Transferable, Polarizable Force Field for Ionic Liquids. Journal of Chemical Theory and Computation, 2019, 15: 5858–5871. DOI: 10.1021/acs.jctc.9b00689.

[5] Kateryna Goloviznina, Zheng Gong, Margarida F. Costa Gomes, Agílio A. H. Pádua. Extension of the CL&Pol Polarizable Force Field to Electrolytes, Protic Ionic Liquids, and Deep Eutectic Solvents. Journal of Chemical Theory and Computation, 2021, 17: 1606–1617. DOI: 10.1021/acs.jctc.0c01002.

[6] Pengyu Ren, Jay W. Ponder. Polarizable Atomic Multipole Water Model for Molecular Mechanics Simulation. The Journal of Physical Chemistry B, 2003, 107: 5933–5947. DOI: 10.1021/jp0278152.（Crossref 元数据里该 DOI 末尾带一个 `+` 属注册残留，写引用用规范串）

[7] Erik Antonio Vázquez-Montelongo, José Enrique Vázquez-Cervantes, G. Andrés Cisneros. Current Status of AMOEBA–IL: A Multipolar/Polarizable Force Field for Ionic Liquids. International Journal of Molecular Sciences, 2020. DOI: 10.3390/ijms21030697.

[8] Mathieu Salanne. Simulations of room temperature ionic liquids: from polarizable to coarse-grained force fields. Physical Chemistry Chemical Physics, 2015, 17: 14270–14279. DOI: 10.1039/c4cp05550k.

[9] Tristan G. A. Youngs, Mario G. Del Pópolo, Jorge Kohanoff. Development of Complex Classical Force Fields through Force Matching to ab Initio Data: Application to a Room-Temperature Ionic Liquid. The Journal of Physical Chemistry B, 2006, 110: 5697–5707. DOI: 10.1021/jp056931k.

[10] Eunsong Choi, Jesse G. McDaniel, J. R. Schmidt, Arun Yethiraj. First-Principles, Physically Motivated Force Field for the Ionic Liquid [BMIM][BF4]. The Journal of Physical Chemistry Letters, 2014, 5: 2670–2674. DOI: 10.1021/jz5010945.

[11] Adri C. T. van Duin, Siddharth Dasgupta, Francois Lorant, William A. Goddard. ReaxFF: A Reactive Force Field for Hydrocarbons. The Journal of Physical Chemistry A, 2001, 105: 9396–9409. DOI: 10.1021/jp004368u.

[12] Daniel D. Depew, Joseph Wang, Shehan Parmar, Steven Chambreau 等. Thermal Decomposition of Hydroxylammonium Nitrate: ReaxFF Training Set Development for Molecular Dynamics Simulations. AIAA Propulsion and Energy 2019 Forum, 2019. DOI: 10.2514/6.2019-4367.

[13] Shehan M. Parmar, Daniel D. Depew, Richard E. Wirz, Ghanshyam L. Vaghjiani. Structural Properties of HEHN- and HAN-Based Ionic Liquid Mixtures: A Polarizable Molecular Dynamics Study. The Journal of Physical Chemistry B, 2023, 127: 8616–8633. DOI: 10.1021/acs.jpcb.3c02649.
