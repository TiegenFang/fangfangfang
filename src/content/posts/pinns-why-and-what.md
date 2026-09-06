---
pubDatetime: 2026-09-04T09:00:00Z
title: 第 1 讲：为什么需要 PINNs
course: pinns
order: 1
draft: false
tags:
  - PINNs
  - 科学计算
description: PINNs 的形式化定义、与传统离散化和神经算子的定位差异，以及正问题、反问题、数据同化三种使用模式。
---

这一讲只做一件事：把 PINNs 放回数值方法的坐标系里，说清它**是什么、不是什么、什么时候有增量价值**。原始定义见 Raissi、Perdikaris 与 Karniadakis 2019 年的论文 [1]，领域全景见 Karniadakis 等 2021 年的综述 [2]。

## Table of contents

## 形式化定义

给定一个偏微分方程问题：

$$
\mathcal{N}[u;\lambda](x,t) = 0, \qquad (x,t) \in \Omega \times [0,T]
$$

$$
\mathcal{B}[u](x,t) = g(x,t), \qquad (x,t) \in \partial\Omega \times [0,T]
$$

其中 $\mathcal{N}$ 是含未知参数 $\lambda$ 的微分算子，$\mathcal{B}$ 是边界（与初始）算子。可能还有一组观测数据 $\{(x_i, t_i, u_i^{\mathrm{obs}})\}$。

**PINNs 的做法是：取一个神经网络 $u_\theta(x,t)$ 作为试函数，把方程残差变成可微的损失函数，用梯度下降最小化它。** 网络以坐标 $(x,t)$ 为输入、以解 $u$ 为输出；参数 $\theta$（以及可能的 $\lambda$）是优化变量。没有任何网格，没有任何离散化——导数通过自动微分对连续坐标直接求得。

这个定义里有三个容易滑过去的要点，后面每一讲都会回到它们：

1. **学的是「一个解」，不是「一族解」。** 换一组参数、换一组边界，就要重训。这条决定了第 5 讲的选型判据，也是它与神经算子的根本分界。
2. **物理以软约束形式进入。** 方程只在采样点上被要求近似满足，而不是像离散化那样在结构上保证。于是「损失小」与「解对」之间存在gap，第 3 讲专门处理这个 gap。
3. **数据与物理可以共存于同一个损失。** 这是 PINNs 相对纯数据驱动方法的正则化来源，也是相对传统求解器的增量价值所在。

## 与四类方法的定位对比

| 维度           | 传统离散化（FVM/FEM/FDM） | 纯数据驱动 surrogate   | 神经算子（FNO/DeepONet） | PINNs                    |
| -------------- | ------------------------- | ---------------------- | ------------------------ | ------------------------ |
| 是否需网格     | 是                        | 否（但需训练数据网格） | 否                       | **否**                   |
| 学习对象       | 不求解学习，直接离散      | 参数→解的映射          | **解算子**（一族解）     | **单个解**               |
| 数据需求       | 无                        | 大量高保真样本         | 大量参数–解对            | 可为零，或少量稀疏数据   |
| 反问题能力     | 弱（需伴随或迭代）        | 无                     | 弱                       | **强（参数进优化变量）** |
| 外推能力       | 由方程保证，域内可靠      | **差（仅训练分布内）** | 差（仅训练参数族内）     | 差（仅训练域内）         |
| 多工况评估成本 | 每工况一次求解            | 一次前向               | **一次前向**             | 每工况重训               |

读这张表的正确方式是从右往左找「谁做不到」：

- 传统离散化做不到**无网格**与**把稀疏测量自然融入解**。
- 纯数据驱动做不到**外推**与**零样本**：它只在训练分布内有效。
- 神经算子做不到**单点高精度反演**：它学的是算子，精度受训练族限制。
- PINNs 做不到**多工况快速评估**：这是它最贵的短板。

神经算子的两个代表是 DeepONet [3] 与 Fourier Neural Operator [4]。它们与 PINNs 是**互补而非替代**：第 4 讲会把 PI-DeepONet 这类把物理约束注入算子学习的混血方案单独列出来。

## 三种使用模式

**正问题。** 方程与参数全已知，求 $u$。这是 PINNs 最弱的位置——传统求解器在这里又快又准，PINNs 没有增量价值，除非几何复杂到网格生成成本压倒一切。

**反问题。** 方程形式已知但参数 $\lambda$ 未知（扩散系数、反应速率、边界热流……）。把 $\lambda$ 与 $\theta$ 一起优化：

$$
\min_{\theta,\lambda}\ \mathcal{L}_r(\theta,\lambda) + \mathcal{L}_d(\theta)
$$

传统方法做反问题需要伴随方程或外层迭代，实现成本高；PINNs 把反问题降格成「多优化几个标量」。这是它最干净的优势。

**数据同化。** 有稀疏、噪声、异构的测量（不同传感器、不同分辨率、不同物理量），要重建全场。数据项 $\mathcal{L}_d$ 与残差项 $\mathcal{L}_r$ 共同约束解，测量的不确定性由权重表达：某路传感器噪声大，就把它的 $\lambda_d$ 调小，让方程在该区域多说话、数据少说话。异构的含义是测量可以不是同一个量——温度点测量、速度剖面、积分型光学信号（如第 6 讲的碳烟辐射积分）可以放进同一个损失，只要能把它们写成对 $u_\theta$ 的泛函。传统求解器要接这类数据需要专门设计观测算子与同化框架（4D-Var、卡尔曼族），PINNs 把它们统一成加权均方。第 6 讲的火焰重建、第 7 讲的场重建都属于这一类。

三种模式对应三种不同的损失权重结构，也对应三种不同的失败模式。写任何 PINNs 工作之前先问自己属于哪一种——很多「PINNs 不work」的报告，其实是拿正问题的配置去做反问题的期待。

## 一个最小例子：Burgers 方程

用 1D viscous Burgers 方程把定义落到具体形式：

$$
\frac{\partial u}{\partial t} + u\frac{\partial u}{\partial x} - \nu\frac{\partial^2 u}{\partial x^2} = 0
$$

取网络 $u_\theta(x,t)$，残差为

$$
r_\theta(x,t) = \frac{\partial u_\theta}{\partial t} + u_\theta\frac{\partial u_\theta}{\partial x} - \nu\frac{\partial^2 u_\theta}{\partial x^2} \tag{1.1}
$$

三个导数全部由自动微分对输入 $(x,t)$ 求得，**没有截断误差**——这是 PINNs 与有限差分的本质差别：离散化的导数误差随网格步长 $O(\Delta x^p)$，而自动微分的导数是机器精度下的精确链式法则（代价是计算图膨胀，见第 2 讲）。损失：

$$
\mathcal{L}(\theta) = \frac{1}{N_r}\sum_{i=1}^{N_r} \lvert r_\theta(x_i,t_i)\rvert^2 + \frac{1}{N_b}\sum_{j=1}^{N_b}\lvert u_\theta(x_j,t_j) - g_j\rvert^2 \tag{1.2}
$$

第一项在域内随机配点上评估方程（式 (1.1) 的均方），第二项在边界与初始点上评估条件。整个方法就是式 (1.2) 这两项。后面七讲的全部内容，都是在回答「这两行为什么经常不够，以及怎么办」。

## 方法谱系：从 Ritz 到 PINNs

PINNs 不是凭空出现的。把试函数代入加权残差或能量泛函、再优化试函数系数，是 Ritz–Galerkin 家族做了上百年的事；有限元就是它取分片多项式基的版本。PINNs 只做了两处替换：**基函数换成神经网络**（基不再局部支撑、不再由网格决定），**系数优化换成对残差配点的随机梯度**（不再组装全局刚度矩阵）。

这两处替换各拿走一样东西、各给回一样东西。拿走的是有限元的两个支柱：插值误差的先验估计（Céa 引理一族），以及稀疏线性代数带来的可扩展性。给回的是无网格的几何自由，以及反问题的自然表述——系数优化里多放几个变量就是反演，不需要伴随方程。

理解这条谱系能防止两类误判。其一，把 PINNs 当「更准的有限元」：它不是，它没有误差理论，精度靠经验验证。其二，把 PINNs 当「全新范式」：它的数学骨架是经典的加权残差，新的是基函数与优化器；因此经典数值分析里关于配点、条件数、病态的直觉大多仍然适用，第 2、3 讲会反复用到。

## 反问题最小工作例：反演空间变化的扩散系数

把反问题落到一个能写完的例子。考虑 1D 热传导，扩散系数 $\lambda(x)$ 未知：

$$
\frac{\partial u}{\partial t} = \frac{\partial}{\partial x}\left(\lambda(x)\frac{\partial u}{\partial x}\right)
$$

传统路线要么写伴随方程，要么外层套一个优化循环、每步解一次正问题。PINNs 路线把 $\lambda$ 也参数化——可以是另一个网络 $\lambda_\phi(x)$，也可以是少数基函数的系数——与 $u_\theta$ 联合训练，损失为残差加少量内部温度测量。三个实践点决定成败：

1. **可辨识性。** 测量必须覆盖 $\lambda$ 敏感的区域。若传感器全放在温度几乎不变化的区段，反问题的后验是多模的，网络会给出一个光滑但错误的 $\lambda$，而且损失一样很小。这不是优化失败，是信息不足。
2. **参数化粒度。** 用全连接网络表示 $\lambda(x)$ 会过度光滑，反演分辨率被网络的低频偏好限制；用分段常数或低维基函数反而更稳。先问「我需要多细的 $\lambda$」，再选表示。
3. **噪声与权重。** 测量噪声水平决定 $\lambda_d$；设错会把噪声拟合进 $\lambda$，表现为反演曲线的高频抖动。

这个例子同时演示了第 5 讲的判据：若只要正问题解，PINNs 相对成熟求解器没有优势；一旦 $\lambda$ 未知且测量稀疏，PINNs 是**不需要伴随方程**的最简实现。

## 什么时候连定义本身都失效

式 (1.2) 的前提是解足够光滑、方程在点态意义下成立。三类问题会直接击穿这个前提：

- **间断解。** 激波、接触间断处导数不存在，点态残差无意义。需要弱形式或守恒形式的变体（第 4 讲的 wPINN、cPINN）。
- **不确定性不可忽略。** 单次训练给一个点估计，但损失景观多模时不同初始化落在不同解上。需要贝叶斯或集成框架（第 4 讲族四）。
- **离散事件与开关。** 接触、相变触发条件、控制逻辑这类非光滑事件无法写进可微残差，PINNs 目前没有干净的处理方式。

记住这三条边界，比记住 PINNs 的优点更重要：它们决定了哪些问题**不该**进入这门课后续的方法工具箱。变体与新架构的快速图谱见综述 [5]。

## 小结

PINNs 是用神经网络作试函数、用自动微分把 PDE 残差变成损失的无网格方法。它学单个解，物理以软约束进入，数据与方程可共用一个损失。它的增量价值集中在反问题与数据同化；它的短板是多工况评估与工程精度；它的定义在间断、强不确定与离散事件面前失效。记住这张定位表，第 5 讲会把它变成可操作的判据。

## 参考文献

[1] Maziar Raissi, Paris Perdikaris, George Em Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics, 2019. DOI: 10.1016/j.jcp.2018.10.045.

[2] George Em Karniadakis, Ioannis G. Kevrekidis, Lu Lu 等. Physics-informed machine learning. Nature Reviews Physics, 2021. DOI: 10.1038/s42254-021-00314-5.

[3] Lu Lu, Pengzhan Jin, George Em Karniadakis. DeepONet: Learning nonlinear operators for identifying differential equations based on the universal approximation theorem of operators. arXiv, 2019. arXiv:1910.03193.

[4] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli 等. Fourier Neural Operator for Parametric Partial Differential Equations. arXiv, 2020. arXiv:2010.08895.

[5] Juan Diego Toscano, Vivek Oommen, Alan John Varghese 等. From PINNs to PIKANs: Recent Advances in Physics-Informed Machine Learning. arXiv, 2024. arXiv:2410.13228.
