---
pubDatetime: 2026-09-04T09:50:00Z
title: 第 6 讲：燃烧中的 PINNs
course: pinns
order: 6
draft: false
tags:
  - PINNs
  - 科学计算
  - 燃烧
description: 反应流控制方程、刚性化学源项、薄火焰面与 spectral bias 的正面冲突；附 1D 稳态预混层流火焰从方程到损失函数的完整推导。
---

燃烧是检验 PINNs 成色最苛刻的场地之一：它同时命中第 3 讲列出的两大病态——**刚性源项**与**多尺度薄结构**。这一讲先把反应流方程组写全，再梳理现有文献把 PINNs 用在了哪些位置，最后用一个 1D 稳态预混层流火焰，把「方程 → 无量纲化 → 损失函数 → 采样 → 诊断」整条链路走一遍。综述性骨架可参考两篇近期综述 [1][2]。

## Table of contents

## 反应流控制方程组

含化学反应的可压缩流动由四组方程闭合。连续性、动量、组分输运与能量：

$$
\frac{\partial \rho}{\partial t} + \nabla\cdot(\rho\mathbf{u}) = 0
$$

$$
\frac{\partial (\rho\mathbf{u})}{\partial t} + \nabla\cdot(\rho\mathbf{u}\mathbf{u}) = -\nabla p + \nabla\cdot\boldsymbol{\tau}
$$

$$
\frac{\partial (\rho Y_k)}{\partial t} + \nabla\cdot(\rho Y_k\mathbf{u}) = -\nabla\cdot\mathbf{J}_k + \dot{\omega}_k, \qquad k = 1,\dots,N_s
$$

$$
\frac{\partial (\rho E)}{\partial t} + \nabla\cdot\big((\rho E + p)\mathbf{u}\big) = -\nabla\cdot\mathbf{q} + \nabla\cdot(\boldsymbol{\tau}\cdot\mathbf{u})
$$

符号定义：

| 符号                | 含义                | 说明                                                                               |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| $\rho$              | 密度                | $\mathrm{kg/m^3}$                                                                  |
| $\mathbf{u}$        | 速度矢量            | $\mathrm{m/s}$                                                                     |
| $p$                 | 压力                | $\mathrm{Pa}$                                                                      |
| $\boldsymbol{\tau}$ | 黏性应力张量        | Newton 流体                                                                        |
| $Y_k$               | 第 $k$ 组分质量分数 | 满足 $\sum_k Y_k = 1$                                                              |
| $\mathbf{J}_k$      | 第 $k$ 组分扩散通量 | 多组分形式或 Fick 简化                                                             |
| $\dot{\omega}_k$    | 第 $k$ 组分化学源项 | $\mathrm{kg/(m^3\cdot s)}$，见下节                                                 |
| $E$                 | 总比能              | $E = e + \lvert\mathbf{u}\rvert^2/2$                                               |
| $\mathbf{q}$        | 热通量              | $\mathbf{q} = -\lambda\nabla T + \sum_k h_k\mathbf{J}_k$，辐射与 Dufour 项通常舍去 |
| $h_k$               | 第 $k$ 组分比焓     | 含生成焓                                                                           |
| $N_s$               | 组分数              | 详细机理可达数百                                                                   |

状态方程与平均摩尔质量：

$$
p = \frac{\rho R T}{\bar{W}}, \qquad \bar{W} = \left(\sum_{k=1}^{N_s}\frac{Y_k}{M_k}\right)^{-1}
$$

对 PINNs 实现而言，$\sum_k Y_k = 1$ 这条约束**不会自动满足**：网络独立输出每个 $Y_k$，残差损失只管方程不管约束。要么作为额外损失项，要么硬约束（只输出 $N_s - 1$ 个组分，最后一个由 $1 - \sum$ 得到）。本节推导采用后者，更干净。

## 化学源项与刚性

Arrhenius 形式的组分源项：

$$
\dot{\omega}_k = M_k \sum_{r=1}^{N_r}\left(\nu''_{kr} - \nu'_{kr}\right)\left[k_{f,r}\prod_{j=1}^{N_s} C_j^{\nu'_{jr}} - k_{b,r}\prod_{j=1}^{N_s} C_j^{\nu''_{jr}}\right] \tag{6.1}
$$

$$
k_{f,r} = A_r\, T^{\beta_r}\exp\!\left(-\frac{E_{a,r}}{R\,T}\right)
$$

其中 $C_j = \rho Y_j / M_j$ 为摩尔浓度，$\nu'_{kr}, \nu''_{kr}$ 为第 $r$ 个反应中组分 $k$ 的反应物/产物化学计量数，$A_r, \beta_r, E_{a,r}$ 为指前因子、温度指数与活化能。式 (6.1) 的双线性结构（正逆反应之差）是刚性的代数来源：两项各自巨大、差值很小，残差对 $T$ 的导数因此被放大。

**刚性的来源有两层。** 一是指数温度敏感：$\exp(-E_a/RT)$ 使源项在火焰面温度区间内变化数个量级。二是时间尺度分离：自由基（H、O、OH）的生成消耗时间尺度约 $10^{-9}\sim10^{-6}\ \mathrm{s}$，而燃料整体消耗约 $10^{-4}\sim10^{-3}\ \mathrm{s}$，跨 3–6 个量级。

对 PINNs 的直接后果：残差损失 $\mathcal{L}_r$ 中，源项主导的组分方程残差幅值可比连续性方程大若干个量级。若不做归一化，梯度下降会把全部容量花在压自由基残差上，其余方程被牺牲。这是第 3 讲「多目标梯度冲突」在燃烧里的具体形态，也是 CRK-PINN 这类工作专门处理反应动力学常微分方程组的动机 [3]；用 PINNs 加速化学动力学计算 [4] 与用 DeepONet 学习化学源项算子 [5] 则是绕开刚性的两条替代路线。

## 火焰面与特征尺度：spectral bias 的正面冲突

层流预混火焰有两个特征量。层流火焰速度 $S_L$ 与热火焰厚度：

$$
\delta_L \sim \frac{\alpha_u}{S_L}, \qquad \alpha_u = \frac{\lambda_u}{\rho_u c_{p,u}} \tag{6.2}
$$

以甲烷/空气为例 $S_L \approx 0.4\ \mathrm{m/s}$、$\alpha_u \approx 2\times10^{-5}\ \mathrm{m^2/s}$，得 $\delta_L \approx 5\times10^{-5}\ \mathrm{m}$。而计算域或实验视场通常 $L \sim 10^{-2}\sim10^{-1}\ \mathrm{m}$，于是：

$$
\frac{L}{\delta_L} \sim 10^2 \sim 10^3
$$

火焰面是一个**薄层**。第 3 讲讲过 spectral bias：网络优先拟合低频分量，锐利的高梯度结构最难学。$L/\delta_L$ 达到两三个量级时，均匀采样的 PINNs 会把火焰面抹成一个过宽的过渡区——残差标量看着不大，但温度剖面的锋面位置与梯度全错。层流火焰结构与湍流燃烧 regimes 的经典处理见教材 [6][7][8]。

无量纲的刚性度量是 Damköhler 数，化学时间尺度与对流时间尺度之比：

$$
Da = \frac{\delta_L / S_L}{\tau_{\mathrm{chem}}} \tag{6.3}
$$

$\tau_{\mathrm{chem}}$ 跨量级意味着式 (6.3) 跨量级，与上一节的源项刚性是同一件事的两个侧面。湍流下还需 Karlovitz 数等判断火焰面是否仍存；涉及湍流统计量提取与闭合的工作见 [9]，中文综述见 [10]。

**这就是燃烧 PINNs 的核心矛盾：问题最有价值的结构（锋面）恰好是方法最弱的地方。** 后面所有工程手段——锋面加密采样、源项归一化、域分解——都是在围绕这个矛盾做补偿。

## 应用地图

现有文献大致落在六个位置。

**化学动力学加速。** 把刚性源项的求解从隐式积分换成网络评估：CRK-PINN 直接求解反应动力学常微分方程组 [3]；用 PINNs 替代化学动力学计算以加速 [4]；以及走算子路线、用 DeepONet 学习源项映射 [5]。这一类不求解全场，只替换最贵的那一项。

**流场与标量场重建（数据同化型）。** 从稀疏、噪声的实验测量重建全场：从稀疏数据高分辨重建湍流火焰 [11]；旋转爆震燃烧室（RDE）流场重建 [12]；无预训练地从点测量获取高保真多物理场 [13]；从多点标量测量提取湍流统计量与闭合 [9]。这一类是 PINNs 相对传统求解器优势最明显的位置——传统求解器没有「把测量塞进解里」的自然接口。

**参数化代理模型。** 在工况参数空间上建 surrogate：参数化多维预混燃烧的 PINNs 代理 [14]；用伪时间推进的 PINNs 处理多维预混与非预混 [15]。注意第 5 讲的判据：若目标是**多工况快速评估**，神经算子比 PINNs 更合适；这里的 PINNs 代理仍需逐工况训练或依赖参数化扩展。

**与既有燃烧模型耦合。** PINNs 与 flamelet/progress-variable 模型耦合以容纳详细机理 [16]。思路是把高维化学降到低维流形，让网络只学流形上的低维场，绕开刚性。

**诊断量与标记发现。** 预混 $\mathrm{NH_3/H_2}$/空气火焰放热率标记的数据驱动发现 [17]；层流碳烟火焰中碳烟温度与体积分数场预测 [18]。

**其他燃烧物理。** 燃烧室热声相互作用学习 [19]；非炭化材料瞬态燃烧的预测 [20]。燃料点火与火焰性质的机器学习全景见 [21]。

## 完整推导：1D 稳态预混层流火焰

选这个问题做完整推导，因为它同时命中刚性源项与薄火焰面两个核心难点，且方程可以写全、无量纲化可以做干净。

### 方程与边界

稳态、平面、绝热、自由传播的 1D 预混火焰。连续性方程积分得质量通量为常数：

$$
m = \rho u = \text{const}
$$

**关键简化：把 $m$ 当作一个可学习标量，而不是学习 $\rho(x), u(x)$ 两个场。** 连续性方程由此精确满足，不需要对应损失项，也消掉了两个未知函数。组分与能量方程（Fick 扩散简化，多组分扩散的取舍见文末说明）：

$$
m\frac{dY_k}{dx} + \frac{dJ_k}{dx} = \dot{\omega}_k, \qquad J_k = -\rho D_k\frac{dY_k}{dx}
$$

$$
m c_p \frac{dT}{dx} = \frac{d}{dx}\left(\lambda\frac{dT}{dx}\right) - \sum_k J_k c_{p,k}\frac{dT}{dx} - \sum_k h_k \dot{\omega}_k
$$

边界取截断域 $x \in [0, L]$：未燃侧 Dirichlet，已燃侧零梯度 Neumann：

$$
x = 0:\quad T = T_u,\quad Y_k = Y_{k,u}
$$

$$
x = L:\quad \frac{dT}{dx} = 0,\quad \frac{dY_k}{dx} = 0
$$

### 平移不变性与锚定：最容易漏的一项

自由传播的稳态火焰具有**平移不变性**：若 $(T, Y_k)(x)$ 是解，则 $(T, Y_k)(x - x_0)$ 对任意 $x_0$ 也是解。损失景观因此存在一个平坦方向，梯度下降可以让火焰在域内漂移而不增加残差。

这不是理论洁癖：漏掉锚定时，训练得到的锋面位置每次运行都不同，$S_L$（即 $m/\rho_u$）的估计随之漂移，结果不可复现。修复方式是加一个锚定条件，例如规定锋面中点温度出现在指定位置 $x_a$：

$$
T(x_a) = T_a, \qquad T_a = T_u + \tfrac{1}{2}(T_{ad} - T_u)
$$

对应一项锚定损失 $\mathcal{L}_a$。这是燃烧 PINNs 相对通用 PINNs 教程多出来的一个必备项。

### 无量纲化

取热火焰厚度与绝热温升为基准：

$$
x^* = \frac{x}{\delta_L}, \qquad \theta = \frac{T - T_u}{T_{ad} - T_u}, \qquad y_k = \frac{Y_k}{Y_{k,u}}, \qquad \delta_L = \frac{\alpha_u}{S_L}
$$

代入组分方程（利用 $m = \rho_u S_L$ 与 $D_k/\alpha_u = 1/\mathrm{Le}_k$）：

$$
\frac{dy_k}{dx^*} - \frac{1}{\mathrm{Le}_k}\frac{d^2 y_k}{dx^{*2}} = Da_k\,\hat{\omega}_k
$$

其中 $\mathrm{Le}_k = \alpha_u / D_k$ 为 Lewis 数，$\hat{\omega}_k$ 为量级 $O(1)$ 的归一化源项，系数

$$
Da_k = \frac{\delta_L / S_L}{\tau_{\mathrm{chem},k}}
$$

即第 3 节的 Damköhler 数按组分展开。能量方程同法：

$$
\frac{d\theta}{dx^*} - \frac{d^2\theta}{dx^{*2}} + \left(\sum_k \frac{c_{p,k}Y_{k,u}}{c_p}\frac{1}{\mathrm{Le}_k}\frac{dy_k}{dx^*}\right)\frac{d\theta}{dx^*} = \sum_k q_k\, \hat{\omega}_k
$$

$$
q_k = -\frac{h_k Y_{k,u}}{c_p (T_{ad} - T_u)}
$$

括号项为组分扩散携带的焓通量，$\mathrm{Le}_k \approx 1$ 且 $c_{p,k}$ 相近时常常舍去；保留它更忠实，舍去它更稳定——这是一个应当显式记录而非默认的选择。

无量纲化后检查量级：导数项 $O(1)$，源项系数 $Da_k$ 跨 3–6 个量级。**量级不对齐没有消失，只是被集中暴露到了 $Da_k$ 上**——这正是下一节权重的依据。

### 损失函数逐项

未知量为 $\theta(x^*)$、$\{y_k(x^*)\}_{k=1}^{N_s-1}$（最后一个组分由 $\sum_k Y_k = 1$ 硬约束给出）与标量 $m$。总损失：

$$
\mathcal{L} = \lambda_T \mathcal{L}_T + \sum_{k=1}^{N_s-1}\lambda_k \mathcal{L}_k + \lambda_u \mathcal{L}_u + \lambda_b \mathcal{L}_b + \lambda_a \mathcal{L}_a \tag{6.4}
$$

$$
\mathcal{L}_k = \frac{1}{N_r}\sum_{i=1}^{N_r}\left|\frac{dy_k}{dx^*} - \frac{1}{\mathrm{Le}_k}\frac{d^2y_k}{dx^{*2}} - Da_k\,\hat{\omega}_k\right|^2_{x^*_i}
$$

$$
\mathcal{L}_T = \frac{1}{N_r}\sum_{i=1}^{N_r}\left|\frac{d\theta}{dx^*} - \frac{d^2\theta}{dx^{*2}} + \left(\sum_k \frac{c_{p,k}Y_{k,u}}{c_p}\frac{1}{\mathrm{Le}_k}\frac{dy_k}{dx^*}\right)\frac{d\theta}{dx^*} - \sum_k q_k \hat{\omega}_k\right|^2_{x^*_i}
$$

$$
\mathcal{L}_u = \theta(0)^2 + \sum_k \big(y_k(0) - 1\big)^2, \qquad \mathcal{L}_b = \left|\frac{d\theta}{dx^*}\right|^2_{L^*} + \sum_k \left|\frac{dy_k}{dx^*}\right|^2_{L^*}
$$

$$
\mathcal{L}_a = \big(\theta(x^*_a) - \tfrac{1}{2}\big)^2
$$

每一项与一个方程或一个条件一一对应：$\mathcal{L}_k$ 对组分方程，$\mathcal{L}_T$ 对能量方程，$\mathcal{L}_u, \mathcal{L}_b$ 对两组边界，$\mathcal{L}_a$ 对锚定。连续性方程无对应项，因为 $m$ 为标量时它精确成立。

### 源项归一化与权重

$Da_k$ 跨量级意味着各 $\mathcal{L}_k$ 的天然幅值跨量级。两种等价做法，任选其一并写进复现清单：

1. **残差内归一化**：把每个组分残差除以自身的 $Da_k$，即对 $\mathcal{L}_k$ 中的残差用 $r_k / Da_k$。所有残差变为 $O(1)$，权重可取统一值。
2. **权重外置**：保留原始残差，取 $\lambda_k \propto 1/Da_k^2$。

二者在数学上等价，差别只在数值条件。推荐第 1 种，因为它让「残差小」在所有组分上具有可比含义，诊断时不必再换算。

### 配点策略

锋面占据 $x^* \in [0, \sim 10]$，而域长 $L^* = L/\delta_L \sim 10^2\sim10^3$。均匀采样会把 99% 以上的配点浪费在锋面外的平缓区。两段式配方：

1. **预热阶段**：70% 配点落在 $x^* \in [0, 10]$ 内按对数间距分布（锋面与预热区梯度最大），30% 在 $[10, L^*]$ 均匀。边界点单独加密，$x^*=0$ 与 $x^*=L^*$ 各取不少于 50 点。
2. **自适应阶段**：预热收敛后按残差幅值做 RAR 式重采样，把新增配点投到残差最大的区域——通常正是锋面。

### 预期失败模式与诊断

| 症状                                       | 根因                   | 诊断动作                                                  | 处理                                               |
| ------------------------------------------ | ---------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| 温度剖面锋面过宽、梯度偏小，但边界残差很小 | spectral bias 抹平薄层 | 画残差场的空间分布，看锋面处是否尖峰                      | 锋面加密配点、Fourier features、或域分解（XPINN）  |
| 每次运行锋面位置不同，$S_L$ 估计漂移       | 平移不变性未锚定       | 检查 $\mathcal{L}_a$ 是否存在且收敛                       | 补锚定损失，或硬锚定（固定 $x=0$ 处某组分）        |
| 主要物种残差小，H/O/OH 残差大数个量级      | 源项刚性               | 分物种打印残差范数                                        | 按 $Da_k$ 归一化、分物种权重、或先解稳态化学再耦合 |
| 边界条件不满足但总损失很小                 | 边界项被残差项梯度淹没 | 监控分项梯度范数 $\lVert\nabla_\theta\mathcal{L}_u\rVert$ | 自适应权重、边界配点加密                           |
| 总损失很小但解不对                         | 假收敛                 | 与参考解逐点对比，而非只看标量损失                        | 画残差场；跨随机种子报告均值与方差                 |

最后一行值得单独强调：**标量损失趋零不等于解收敛**，在刚性问题里尤其如此。报告结果时给残差场的空间分布图，比给一个损失数字有信息量得多。

## 小结

燃烧对 PINNs 提出的三个要求——处理刚性源项、分辨薄火焰面、把稀疏测量融合进解——分别对应源项归一化、锋面加密采样与数据项设计。前两个是补偿性手段，治的是方法本身的病；第三个才是 PINNs 相对传统求解器的真实增量。写损失函数时记住四件事：$m$ 作标量让连续性精确成立、$\sum Y_k = 1$ 必须显式处理、锚定项不可省、$Da_k$ 归一化不可省。

## 参考文献

[1] Jiahao Wu, Xutun Wang, Yuxin Wu 等. Physics-informed machine learning for combustion: A review. arXiv, 2025. arXiv:2509.03347.

[2] Amirali Shateri, Zhiyin Yang, Yuying Yan 等. AI-Powered Surrogate Modelling for Multiscale Combustion: A Critical Review and Opportunities. arXiv, 2026. arXiv:2604.25617.

[3] Shihong Zhang, Chi Zhang, Bosen Wang. CRK-PINN: A physics-informed neural network for solving combustion reaction kinetics ordinary differential equations. Combustion and Flame, 2024. DOI: 10.1016/j.combustflame.2024.113647.

[4] Ahmed Almeldein, Noah Van Dam. Accelerating Chemical Kinetics Calculations With Physics Informed Neural Networks. Journal of Engineering for Gas Turbines and Power, 2023. DOI: 10.1115/1.4062654.

[5] Anuj Kumar, Tarek Echekki. Combustion chemistry acceleration with DeepONets. Fuel, 2024. DOI: 10.1016/j.fuel.2024.131212.

[6] Chung K. Law. Combustion Physics. Cambridge University Press, 2006.

[7] Thierry Poinsot, Denis Veynante. Theoretical and Numerical Combustion. R. T. Edwards, 2nd ed., 2005.

[8] Norbert Peters. Turbulent Combustion. Cambridge University Press, 2000.

[9] Arsalan Taassob, Rishikesh Ranade, Tarek Echekki. Physics-Informed Neural Networks for Turbulent Combustion: Toward Extracting More Statistics and Closure from Point Multiscalar Measurements. Energy & Fuels, 2023. DOI: 10.1021/acs.energyfuels.3c02410.

[10] 安健, 陈宇轩, 苏星宇 等. 机器学习在湍流燃烧及发动机中的应用与展望. 清华大学学报(自然科学版), 2023. DOI: 10.16511/j.cnki.qhdxxb.2023.25.001.

[11] Shiyu Liu, Haiou Wang, Jacqueline H. Chen 等. High-resolution reconstruction of turbulent flames from sparse data with physics-informed neural networks. Combustion and Flame, 2024. DOI: 10.1016/j.combustflame.2023.113275.

[12] Wang Xutun, Wen Haocheng, Hu Tong 等. Flow-field reconstruction in rotating detonation combustor based on physics-informed neural network. Physics of Fluids, 2023. DOI: 10.1063/5.0154979.

[13] Shihong Zhang, Chi Zhang, Bosen Wang. A physics-informed neural network for aiding the acquisition of high-fidelity multiphysics fields in gas-phase combustion reacting flows without pre-training. Physics of Fluids, 2025. DOI: 10.1063/5.0284930.

[14] Kai Liu, Kun Luo, Yuzhou Cheng 等. Surrogate modeling of parameterized multi-dimensional premixed combustion with physics-informed neural networks for rapid exploration of design space. Combustion and Flame, 2023. DOI: 10.1016/j.combustflame.2023.113094.

[15] Zhen Cao, Kai Liu, Kun Luo 等. Surrogate modeling of multi-dimensional premixed and non-premixed combustion using pseudo-time stepping physics-informed neural networks. Physics of Fluids, 2024. DOI: 10.1063/5.0235674.

[16] Mengze Song, Xinzhou Tang, Jiangkuan Xing 等. Physics-informed neural networks coupled with flamelet/progress variable model for solving combustion physics considering detailed reaction mechanism. Physics of Fluids, 2024. DOI: 10.1063/5.0227581.

[17] Cheng Chi, Srijith Sreekumar, Dominique Thévenin. Data-driven discovery of heat release rate markers for premixed NH3/H2/air flames using physics-informed machine learning. Fuel, 2022. DOI: 10.1016/j.fuel.2022.125508.

[18] Qianlong Wang, Mingxue Gong, Alexis Matynia 等. Soot temperature and volume fraction field predictions via line-of-sight soot integral radiation equation informed neural networks in laminar sooting flames. Physics of Fluids, 2024. DOI: 10.1063/5.0245120.

[19] Sathesh Mariappan, Kamaljyoti Nath, George Em Karniadakis. Learning thermoacoustic interactions in combustors using a physics-informed neural network. Engineering Applications of Artificial Intelligence, 2023. arXiv:2401.00061.

[20] Mohamad Mahdi Mozafari Parsa, Amir Mahdi Tahsini. Predicting the transient burning of non-charring materials using physics-informed neural networks. Fire Safety Journal, 2025. DOI: 10.1016/j.firesaf.2025.104379.

[21] Cihat Emre Üstün, Rodolfo Da Silva Machado De Freitas, Ekenechukwu Chijioke Okafor 等. Machine Learning Applications for Predicting Fuel Ignition and Flame Properties: Current Status and Future Perspectives. Energy & Fuels, 2025. DOI: 10.1021/acs.energyfuels.5c02343.
