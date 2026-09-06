---
pubDatetime: 2026-09-04T10:00:00Z
title: 第 7 讲：电水动力学中的 PINNs
course: pinns
order: 7
draft: false
tags:
  - PINNs
  - 科学计算
  - 电水动力学
description: EHD 三场耦合方程组、由尺度推导的无量纲数、四个 PINNs 实现难点的直接文献佐证，以及稳态单极 EHD 流的完整损失函数推导。
---

电水动力学（electrohydrodynamics, EHD）研究电场驱动流体运动与空间电荷输运的耦合。它对 PINNs 提出的挑战比燃烧更尖锐：三个场的量纲与量级差异巨大，且方程类型混合（椭圆 + 双曲-抛物 + 抛物）。学科定位与界面力学源头见 Melcher–Taylor 的经典综述 [1]，微系统计算方法综述见 [2]。

## Table of contents

## 术语消歧：EHD 有三个同名缩写

本课程中 EHD **一律指 electrohydrodynamics**：电场作用于空间电荷产生 Coulomb 体力，驱动流体运动；或反过来，流体运动输运电荷改变电场。以下三类文献在检索中大量误命中，但物理机制完全不同：

- **elastohydrodynamic（弹流润滑）**：摩擦学里接触区的弹性变形与润滑膜。典型误命中是一篇用 PINN 做 sCO2 循环密封设计的论文 [3]——标题自带「Elasto-Hydrodynamic (EHD)」缩写，摘要却与电场零关系。
- **electro-hydraulic（电液传动）**：液压伺服系统。中文文献「基于物理信息神经网络的电液执行器建模方法」（《液压与气动》，DOI 未获取，CNKI 收录）[4] 即此类；它在原检索文件里得分第二高，实际 C 路价值为零。
- **electro-magnetohydrodynamic（EMHD，磁流体）**：外加电磁场下的导电流体，机制是 Lorentz 力而非空间电荷的 Coulomb 力 [5]。

另有一类边界案例值得记住：用 PINN 做静电感应信号反演的粉尘浓度监测，机制是静电感应传感而非电场驱动流动，也不属于 EHD（原检索文件 idx 42）。**做这个方向的检索时，检索词必须写全 electrohydrodynamic，并人工核对摘要是否出现空间电荷输运或 $\rho_c\mathbf{E}$ 体力。**

## EHD 控制方程组

单极（unipolar）电荷模型下的三场耦合系统：

$$
\nabla\cdot(\varepsilon\nabla\varphi) = -\rho_c, \qquad \mathbf{E} = -\nabla\varphi
$$

$$
\frac{\partial \rho_c}{\partial t} + \nabla\cdot\mathbf{J} = S, \qquad \mathbf{J} = \rho_c\mathbf{u} + b\,\rho_c\mathbf{E} - D\nabla\rho_c
$$

$$
\rho_m\left(\frac{\partial \mathbf{u}}{\partial t} + \mathbf{u}\cdot\nabla\mathbf{u}\right) = -\nabla p + \mu\nabla^2\mathbf{u} + \rho_c\mathbf{E} + \mathbf{f}_{\text{diel}}, \qquad \nabla\cdot\mathbf{u} = 0
$$

| 符号                       | 含义           | 典型量级（空气电晕 / 介电液体）                                     |
| -------------------------- | -------------- | ------------------------------------------------------------------- |
| $\varphi$                  | 电势           | $\varphi_0 \sim 10^4\ \mathrm{V}$                                   |
| $\mathbf{E}$               | 电场强度       | $\sim 10^6\ \mathrm{V/m}$                                           |
| $\rho_c$                   | 空间电荷密度   | $10^{-3}\ \mathrm{C/m^3}$ / $\sim 1\ \mathrm{C/m^3}$                |
| $\varepsilon$              | 介电常数       | $\varepsilon_0$ / $\varepsilon_r\varepsilon_0,\ \varepsilon_r\sim2$ |
| $b$                        | 离子迁移率     | $10^{-4}\ \mathrm{m^2/(V\cdot s)}$ / $10^{-8}$                      |
| $D$                        | 电荷扩散系数   | $2\times10^{-5}\ \mathrm{m^2/s}$ / $10^{-9}$                        |
| $\mathbf{J}$               | 电流密度       | 对流 + 迁移 + 扩散三项                                              |
| $\rho_m, \mu$              | 流体密度、黏度 | 空气 $1.2,\ 1.8\times10^{-5}$                                       |
| $\mathbf{f}_{\text{diel}}$ | 介电体力       | 见下                                                                |

电流密度 $\mathbf{J}$ 的三项分别对应流体输运、电场迁移、浓度扩散。介电体力在介电常数非均匀时为 Korteweg–Helmholtz 形式：

$$
\mathbf{f}_{\text{diel}} = -\frac{1}{2}\mathbf{E}\cdot\mathbf{E}\,\nabla\varepsilon + \nabla\!\left(\frac{1}{2}\rho_m \mathbf{E}\cdot\mathbf{E}\,\frac{\partial\varepsilon}{\partial\rho_m}\right)
$$

第二项为电致伸缩（electrostriction），不可压缩流体中常舍去；第一项只在 $\varepsilon$ 有梯度处（界面、温度梯度区）非零。**均匀介电的单极模型里 $\mathbf{f}_{\text{diel}}=0$，Coulomb 力 $\rho_c\mathbf{E}$ 是唯一的电-力耦合通道**——这是本讲推导案例的情形。

方程类型：Poisson 是**椭圆**（全场瞬时耦合），电荷守恒是**双曲-抛物混合**（迁移项双曲、扩散项抛物），NS 是**抛物**。三者收敛特性不同，这是后面训练竞争的结构根源。两相或界面问题还需 leaky-dielectric 模型与界面 Maxwell 应力 [6][7]。

同一套方程组在电喷雾微推进里还有两条**非 PINNs** 的数值路线，值得与本讲的连续介质求解对照：一条是把显式离子与三维 Poisson 网格求解器耦合，电荷密度由分子动力学统计得到、电场由泊松解回喂给粒子 [21]；另一条是用电水动力学–粒子网格（PIC）方法直接模拟锥尖的场蒸发 [22]。两者的原子尺度细节（力场选择、离子发射事件、发射器表面吸附）见姊妹课程[《分子动力学与第一性原理：离子液体工质的电喷雾与绿色推进》第 7 讲](https://tiegenfang.github.io/fangfangfang/posts/md-dft-il-electrospray-surface-coupling/)。那门课处理的是连续介质假设在纳米锥尖失效的部分——本讲的 $\varepsilon$ 取体相常数这一前提，在那里是要被质疑的对象。

## 无量纲数：由尺度推导

取特征尺度 $d$（电极间距）、$\varphi_0$（施加电压）、$\rho_0$（注入电荷密度），并以**迁移速度**为速度尺度 $u_0 = b\varphi_0/d$，压力尺度 $p_0 = \rho_m u_0^2$，时间尺度 $t_0 = d/u_0$。代入后三个方程变为：

$$
\nabla^{*2}\varphi^* = -C\,\rho_c^*, \qquad C = \frac{\rho_0 d^2}{\varepsilon\varphi_0} \tag{7.1}
$$

$$
\frac{\partial \rho_c^*}{\partial t^*} + \nabla^*\cdot(\rho_c^*\mathbf{u}^*) - \nabla^*\cdot(\rho_c^*\nabla^*\varphi^*) - \frac{1}{Fe}\nabla^{*2}\rho_c^* = 0, \qquad Fe = \frac{b\varphi_0}{D} \tag{7.2}
$$

$$
\frac{\partial \mathbf{u}^*}{\partial t^*} + \mathbf{u}^*\cdot\nabla^*\mathbf{u}^* = -\nabla^* p^* + \frac{1}{Re}\nabla^{*2}\mathbf{u}^* + Co\,\rho_c^*\mathbf{E}^* \tag{7.3}
$$

$$
Re = \frac{\rho_m u_0 d}{\mu}, \qquad Co = \frac{\rho_0\varphi_0}{\rho_m u_0^2} = C\cdot\frac{\varepsilon\varphi_0^2/d^2}{\rho_m u_0^2}
$$

四个数的物理意义：$C$ 是空间电荷自场与外场之比（耦合强度）；$Fe$ 是迁移与扩散之比（电 Péclet 数）；$Re$ 是惯性与黏性之比；$Co$ 是 Coulomb 力与惯性力之比，且可写成 $C$ 乘以「电应力尺度 / 动压尺度」。

**与文献规范名的对应。** 本讲由尺度直接推出这四个数，是为了让推导可复核；文献中它们另有惯用名：$C$ 常称 **Coulomb 数**或耦合参数；$Fe$ 在 EHD 文献里常写作**电 Reynolds 数** $Re_E = u_0 d/D$ 或迁移-扩散比；涉及浮力与电场共同驱动的对流（EHD 强化传热）时还会出现**电 Rayleigh 数**

$$
Ra_E = \frac{\rho_c E_0 d^3}{\mu D_e} \tag{7.4}
$$

（电荷 buoyancy 对黏性-扩散的比，$D_e$ 为相应扩散系数），它决定电对流是否失稳 onset [6]。读文献时先核对作者的定义式再套用结论——同一符号在不同论文里可以差一个 $C$ 因子。标度律与无量纲组的系统讨论见 [6]。

**量级估算（空气电晕，$d=1\ \mathrm{cm}$、$\varphi_0=10\ \mathrm{kV}$、$\rho_0=10^{-3}\ \mathrm{C/m^3}$）：**

| 量                   | 表达式                              | 数值                      |
| -------------------- | ----------------------------------- | ------------------------- |
| $u_0 = b\varphi_0/d$ | 迁移速度尺度                        | $\sim 10^2\ \mathrm{m/s}$ |
| $C$                  | $\rho_0 d^2/(\varepsilon\varphi_0)$ | $\sim 1$                  |
| $Fe$                 | $b\varphi_0/D$                      | $\sim 5\times10^4$        |
| $Re$                 | $\rho_m u_0 d/\mu$                  | $\sim 7\times10^4$        |
| $Co$                 | $\rho_0\varphi_0/(\rho_m u_0^2)$    | $\sim 10^{-3}$            |

**同一个 $Co$ 在介电液体里是 $O(1)$**（$b$ 小四个量级使 $u_0\sim0.1\ \mathrm{m/s}$，$\rho_0$ 大三个量级）。这意味着 Coulomb 力与惯性的相对重要性是**工况依赖**的：空气中电场主要克服黏性，液体中电场直接主导惯性。写损失函数前必须先算这张表——它决定哪一项会主导残差。标度律的系统讨论见 [6]。

## PINNs 实现的四个核心难点（均有直接文献）

**一、三场量级差异。** 刚性 Poisson–Nernst–Planck 系统的首个 data-free PINN 基准给出了量化结论：电荷密度前因子造成极端系数比，电双层强加锐利边界层，而 spectral bias 与多任务损失失衡共同限制精度 [8]。这与第 3 讲的病态三、病态一在 EHD 里的具体形态完全对应。稳态单极构型的残差式 PINN 求解亦已有尝试，包括以 LSTM 骨干捕捉空间长程相关、以缓解陡梯度下 MLP 收敛失败的工作 [9]。五场（加温度）统一算子表述的工作把场数进一步扩到五 [10]。

**二、方程类型混合导致训练竞争。** 二维稳态 EHD 的基准套件明确指出：电荷密度、速度、电势的强非线性耦合会诱发锐利过渡层、交叉锋面与多尺度结构，标准 MLP-PINN 在这些结构上过平滑 [11]。椭圆项全场耦合、双曲项沿特征传播、抛物项扩散——三者的 NTK 谱不同，收敛速率不同（回指第 3 讲病态二）。

**三、强耦合。** $\rho_c$ 同时出现在 Poisson 右端与动量源项，$\mathbf{u}$ 同时出现在电荷对流与动量方程。多物理场 PINN 的 NTK 理论证明：标准核的谱半径随耦合强度 $\gamma$ 以 $\Omega(\gamma^2)$ 增长，单靠逆梯度范数损失平衡**无法**可靠阻止精度退化；块对角 Gauss–Newton 预条件可把界降到与 $\gamma$ 无关，且任何对角预条件器都做不到 [12]。这是「耦合迭代 vs 联合求解」取舍目前最硬的理论依据。无数据联合训练 Nernst–Planck + Poisson + NS 三方程的实现见 [13]——它是本讲方程组逐一对应的唯一 PINN 模板。

**四、电极与电荷注入边界。** 电极附近存在指数型电荷边界层，常规 PINN 能捕捉光滑全局动力学，但在解析锐利电荷边界层或突变界面时出现数值扩散与畸变 [14]。注入边界条件值得单独讨论，因为它有三种常见形式，凸性完全不同：

- **均匀注入**：$\rho_c = \rho_0$ 于发射极。Dirichlet、线性、最稳定；物理上对应注入饱和的情形。推导案例采用它。
- **场致发射（Fowler–Nordheim 型）**：$\rho_c$ 或电流密度随局部场强指数增长，$J \propto E^2 \exp(-B/E)$。对 $\theta$ 高度非凸：场强的微小过估会被指数放大成电荷过估，再经 Poisson 反馈回场强——正反馈使边界损失景观出现尖谷。
- **空间电荷限制发射**：注入电流由鞘层空间电荷自洽限制（Child–Langmuir 型 $J \propto \varphi^{3/2}/d^2$）。非线性但温和，且自带负反馈（电荷越多越抑制注入），比 Fowler–Nordheim 好训。

实现上的选择：均匀注入直接用 Dirichlet 数据项；后两种要么把注入律写成边界残差项并接受非凸（配合多起点重启），要么把它**外置**——先用解析鞘层模型算出注入通量再作为 Dirichlet 给定，把非凸性移出优化循环。岩土电渗固结的工作对比了软约束、门控与硬约束边界编码在陡梯度界面的表现，方法可迁移但领域不同（多孔介质而非自由流体）。

## 应用面（按文献可得性排序）

- **电喷雾 / EHD 打印 / 原子化**：文献最充足（9 条），但几乎全是数据驱动的过程建模（喷雾模式分类、液滴直径回归、打印质量视觉监测），**不是 PDE 求解**。Taylor cone–jet 的数据驱动代理模型是少数例外，且同时覆盖 leaky-dielectric 不稳定性 [7]。
- **EHD 泵 / 单极圆管流基准**：6 条。柔性 EHD 泵的压力-流量预测用 Kolmogorov–Arnold 网络并提取符号公式 [15]，与第 4 讲 PIKAN 形成 EHD 侧呼应；经典圆管离子拖曳基准有完整的非 ML 解法谱系 [16]。
- **电荷输运 / PNP / 电动**：5 条，**唯一能直接支撑损失函数设计的一支** [13][8][17]。
- **EHD 对流与热管理**：2 条（EHD 干燥、热溶质浮力对流的 ANN 预测）。
- **离子风 / 电晕**：2 条，且 arXiv 侧 `ionic wind` / `ion wind` 检索命中为 **0**——比直觉薄得多。
- **电流体不稳定性（leaky dielectric）**：仅 1 条间接命中 [7]。
- **介电泳**：ML/PINNs 口径下 **0 命中**。控制方程里的 $\mathbf{f}_{\text{diel}}$ 项可以写出，但没有机器学习文献支撑；此处改引非 ML 的标度律 [6]，并显式声明这一缺口。

## 完整推导：稳态单极 EHD 流

选稳态单极构型：发射极注入单极电荷，Coulomb 力拖曳流体形成离子风/EHD 泵流。以「圆管离子拖曳流」经典基准为对照谱系——它有解析解与多种数值解可对拍 [16]，且 2026 年已有 PINN 与 FEM 的系统对比 [18]。

### 方程与未知量

稳态下时间导数为零。未知场：$\varphi^*, \rho_c^*, \mathbf{u}^*, p^*$。三个方程的无量纲残差：

$$
r_P = \nabla^{*2}\varphi^* + C\,\rho_c^*
$$

$$
r_C = \nabla^*\cdot(\rho_c^*\mathbf{u}^*) - \nabla^*\cdot(\rho_c^*\nabla^*\varphi^*) - \frac{1}{Fe}\nabla^{*2}\rho_c^*
$$

$$
r_M = \mathbf{u}^*\cdot\nabla^*\mathbf{u}^* + \nabla^* p^* - \frac{1}{Re}\nabla^{*2}\mathbf{u}^* - Co\,\rho_c^*\nabla^*\varphi^*
$$

$$
r_D = \nabla^*\cdot\mathbf{u}^*
$$

注意 $r_C$ 中迁移项 $-\nabla^*\cdot(\rho_c^*\nabla^*\varphi^*)$ 展开后含 $\nabla\rho_c\cdot\nabla\varphi + \rho_c\nabla^2\varphi$，而 $\nabla^2\varphi$ 又等于 $-C\rho_c$——**残差里出现 $\rho_c$ 的二次项与两个一阶导的乘积**。这类非线性乘积型高阶混合导数会让自动微分计算图迅速膨胀；用 Bell 多项式组织混合导数可避免嵌套图 [19]，也是第 2 讲「二阶导成本」论点在 EHD 里的放大版。

### 边界条件

- 发射极：$\varphi^* = 1$（Dirichlet）；电荷注入 $\rho_c^* = 1$（均匀注入模型）或场依赖的非线性注入律。
- 收集极：$\varphi^* = 0$；$\rho_c^*$ 出流（零梯度）。
- 绝缘壁：$\partial\varphi^*/\partial n = 0$，$\rho_c^*$ 零通量，$\mathbf{u}^* = 0$（无滑移）。
- 压力：取一点锚定 $p^*=0$（压力只以梯度出现，否则损失景观有平坦方向——与第 6 讲的平移不变性同源）。

### 损失函数逐项

$$
\mathcal{L} = \lambda_P\mathcal{L}_P + \lambda_C\mathcal{L}_C + \lambda_M\mathcal{L}_M + \lambda_D\mathcal{L}_D + \lambda_B\mathcal{L}_B \tag{7.5}
$$

$$
\mathcal{L}_P = \frac{1}{N}\sum_i \lvert r_P(x_i)\rvert^2, \quad \mathcal{L}_C = \frac{1}{N}\sum_i \lvert r_C(x_i)\rvert^2, \quad \mathcal{L}_M = \frac{1}{N}\sum_i \lVert r_M(x_i)\rVert^2, \quad \mathcal{L}_D = \frac{1}{N}\sum_i \lvert r_D(x_i)\rvert^2
$$

$\mathcal{L}_B$ 汇集上述四组边界与压力锚定。每一项与一个方程或条件一一对应。

### 权重：为什么固定权重在这里必然失败

无量纲化已经让**每个方程内部**平衡，但方程**之间**的残差量级仍不同：$r_C$ 含 $1/Fe \sim 10^{-5}$ 的扩散项与 $O(1)$ 的迁移项，$r_M$ 含 $1/Re \sim 10^{-5}$ 的黏性项与 $Co \sim 10^{-3}$ 的 Coulomb 项。刚性 PNP 基准的结论是：这种系数比加上电双层薄层，使固定权重下的多任务损失失衡直接限制精度；其平衡残差衰减率（BRDR）方案与 NTK 对齐 [8]。动态 PNP 的工作用最大似然估计逐次迭代自动分配损失权重并重采样 [17]。耦合强度高的构型还应考虑块对角 Gauss–Newton 预条件 [12]。

实践顺序：先按各残差项的**初始幅值倒数**设固定权重做预热，再切自适应权重；若耦合强（$C \gtrsim 1$ 且 $Co \gtrsim 1$，即液体工况），直接上预条件优化器。

### 配点与预期失败模式

电极邻域（电荷边界层厚度 $\sim$ 德拜长度量级）与交叉锋面处加密配点；其余区域均匀。失败模式对照表：

| 症状                   | 根因                             | 诊断                      | 处理                              |
| ---------------------- | -------------------------------- | ------------------------- | --------------------------------- |
| 电极附近电荷剖面被抹平 | 指数型电荷边界层 + spectral bias | 残差场在电极邻域尖峰      | 电极邻域加密、硬约束边界编码 [14] |
| 某一场收敛、另两场停滞 | 椭圆/双曲/抛物收敛速率不同       | 分项损失与梯度范数        | 自适应权重 [8][17]                |
| 耦合增强后整体精度退化 | NTK 谱半径随 $\gamma$ 增长       | 对比不同 $C$ 下的误差曲线 | 块对角 GN 预条件 [12]             |
| 交叉锋面过平滑         | 强非线性耦合诱发锐利过渡层       | 与基准算例逐点对比        | 对照基准套件选架构 [11]           |
| 压力场漂移             | 压力只以梯度出现                 | 检查锚定残差              | 补压力锚定项                      |

预期结果参照：PINN 与 FEM 在该经典问题上的对比显示，PINN 在有限训练数据下即有良好表现，而 FEM 的精度靠细化网格换取 [18]——但这是单一问题的结论，不要外推为「PINNs 在 EHD 上优于 FEM」。

## 诚实声明

三点必须向读者交代。第一，**DeepM&Mnet 不是残差式 PINN**：它是 DeepONet 神经算子加跨场数据同化框架，不以 PDE 残差作损失；引用它是因为它以电对流为基准且学术分量高，用于对照第 4 讲的算子路线，**不能作为「PINNs 求解 EHD」的证据** [20]。第二，第一层直接命中中有四条出自同一团队的连续预印本（LSTM-PINN → 基准套件 → 残差注意力两篇），均为 2025-12 至 2026-04 的近期工作、被引极低；它们构成本讲难点论证的主线，但**是单一研究线的产出，不是学界共识**。第三，介电泳与离子风两个应用面在 ML 口径下文献近乎为空，本讲对它们的处理是「方程可写出、ML 文献缺失」，而非综述结论。

## 小结

EHD 对 PINNs 的要求可以浓缩为三件事：先算无量纲数表确定谁主导残差，再按方程类型混合的预期做权重与预条件，最后把配点砸在电荷边界层上。它与燃烧共享 spectral bias 与多任务失衡两个病态，但多了一个独有难点——**耦合强度本身会改变方法的收敛性质** [12]，这是其他单物理场问题里没有的。

## 参考文献

[1] J. R. Melcher, G. I. Taylor. Electrohydrodynamics: A Review of the Role of Interfacial Shear Stresses. Annual Review of Fluid Mechanics, 1969. DOI: 10.1146/annurev.fl.01.010169.000551.

[2] Christian Narváez-Muñoz 等. Computational ElectroHydroDynamics in microsystems: A Review of Challenges and Applications. Archives of Computational Methods in Engineering, 2024. DOI: 10.1007/s11831-024-10147-x.

[3] Mohammad Towhidul Islam Rimon 等. A Design Study of an Elasto-Hydrodynamic Seal for sCO2 Power Cycle by Using Physics Informed Neural Network. ASME Power Applied R&D 2023. DOI: 10.1115/power2023-108802.（误匹配反面例子）

[4] 林子彦, 李晓明. 基于物理信息神经网络的电液执行器建模方法. 液压与气动, 2026. DOI: 未获取（CNKI 收录）.（误匹配反面例子）

[5] Muhammad Shoaib 等. Design of neural networks for Darcy–Forchheimer viscous fluid subjected to electro-magnetohydrodynamic and thermal impacts. Waves in Random and Complex Media, 2023. DOI: 10.1080/17455030.2023.2290656.（误匹配反面例子）

[6] A. Castellanos, A. Ramos, A. González, N. G. Green, H. Morgan. Electrohydrodynamics and dielectrophoresis in microsystems: scaling laws. Journal of Physics D: Applied Physics, 2003. DOI: 10.1088/0022-3727/36/20/023.

[7] Sílvio Cândido, José C. Páscoa. Data-driven surrogate modelling of multistage Taylor cone–jet dynamics. Physics of Fluids, 2024. DOI: 10.1063/5.0205454.

[8] David Pankaczy, Conrard Giresse Tetsassi Feugmo. A Systematic Benchmark of Physics-Informed Neural Network Architectures for the Stiff Poisson-Nernst-Planck System: Adaptive Loss Weighting and Multi-Scale Resolution. arXiv, 2026. arXiv:2606.04125.

[9] Ze Tao, Ke Xu, Fujun Liu. LSTM-PINN: An hybrid method for prediction of steady-state electrohydrodynamic flow. Journal of Computational Physics, 2026. arXiv:2512.21614.

[10] Yuqing Zhou, Ze Tao, Fujun Liu. Residual Attention Physics-Informed Neural Networks for Robust Multiphysics Simulation of Steady-State Electrothermal Energy Systems. arXiv, 2026. arXiv:2603.23578.

[11] Chao Lin, Ze Tao, Fujun Liu. A Unified Benchmark Study of Shock-Like Problems in Two-Dimensional Electrohydrodynamic Flow Based on LSTM-PINN. arXiv, 2026. arXiv:2603.21227.

[12] Youngjae Park, Jaemin Kim, Junghwa Hong. Coupling-Robust Accuracy in Multiphysics Physics Informed Neural Networks via Kronecker-Preconditioned Optimization. arXiv, 2026. arXiv:2605.23391.

[13] Runze Sun, Hyogu Jeong, Jiachen Zhao 等. A physics-informed neural network framework for multi-physics coupling microfluidic problems. Computers & Fluids, 2024. DOI: 10.1016/j.compfluid.2024.106421.

[14] Baitong Zhou, Ze Tao, Ke Xu 等. High-Fidelity Reconstruction of Charge Boundary Layers and Sharp Interfaces in Electro-Thermal-Convective Flows via Residual-Attention PINNs. arXiv, 2026. arXiv:2604.20881.

[15] Yanhong Peng, Yuxin Wang, Fangchao Hu 等. Predictive modeling of flexible EHD pumps using Kolmogorov–Arnold Networks. Biomimetic Intelligence and Robotics, 2024. arXiv:2405.07488.

[16] Najeeb Alam Khan 等. ISRN Computational Mathematics, 2012. DOI: 10.5402/2012/341069. 与 S.E. Ghasemi 等. Journal of Electrostatics, 2014. DOI: 10.1016/j.elstat.2013.11.005.（圆管基准解法谱系）

[17] Xujia Huang, Fajie Wang, Benrong Zhang, Hanqing Liu. Enriched Physics-informed Neural Networks for Dynamic Poisson-Nernst-Planck Systems. arXiv, 2024. arXiv:2402.01768.

[18] Mara Martinez, B. Veena S. N. Rao, S. M. Mallikarjunaiah. Numerical approximation of electrohydrodynamics model: a comparative study of PINNs and FEM. Physica Scripta, 2026. arXiv:2510.14310.

[19] Fumihiro Imoto. Computing high-order mixed derivatives in physics-informed neural networks using multi-index Bell polynomials. arXiv, 2026. arXiv:2609.03768.

[20] Shengze Cai, Zhicheng Wang, Lu Lu, Tamer A. Zaki, George Em Karniadakis. DeepM&Mnet: Inferring the electroconvection multiphysics fields based on operator approximation by neural networks. Journal of Computational Physics, 2021. DOI: 10.1016/j.jcp.2021.110296.（算子学习路线，非残差 PINN）

[21] Arnaud Borner, Deborah A. Levin. Coupled Molecular Dynamics—3-D Poisson Simulations of Ionic Liquid Electrospray Thrusters. IEEE Transactions on Plasma Science, 2015. DOI: 10.1109/tps.2014.2327913.（MD–Poisson 耦合路线，非 PINNs；DOI 前缀含 2014 为投稿年，Crossref 出版年为 2015）

[22] Yipeng Fan, Guangqing Xia, Chong Chen, Bohan Xia 等. Field Evaporation Simulation in Electrospray Thrusters Using Electrohydrodynamics–Particle-in-Cell Method. AIAA Journal, 2025. DOI: 10.2514/1.j064951.（EHD–PIC 场蒸发路线，非 PINNs；单条低引工作，不代表学界共识）
