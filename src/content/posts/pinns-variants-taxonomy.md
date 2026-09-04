---
pubDatetime: 2026-09-04T09:30:00Z
title: 第 4 讲：变体全景：一张分类图谱
course: pinns
order: 4
draft: false
tags:
  - PINNs
  - 科学计算
description: 按「解决什么病态」而非时间线分类：域分解、弱形式与变分、架构替换、不确定性量化、多保真度五族变体，附主对比表。
---

PINNs 的变体多到容易迷失。这一讲不按发表顺序罗列，而是按**每个变体治哪种病**分成五族。读完应当能面对一个新问题说出「我需要哪一族」，而不是「我听说有个新变体」。

## 族一：域分解——治规模与薄结构

**XPINN。** 把 $\Omega$ 切成若干子域，每个子域一个独立网络，子域间用界面处的连续性条件与残差条件耦合 [1]。收益有二：大问题拆小（可并行），以及每个子网络的频率负担变轻——薄层只落在一个子域里，spectral bias 的压力局部化。关于 XPINN 何时真正改善泛化、何时反而更差，有专门的分析工作 [1]。代价是界面条件引入新超参（界面配点密度、耦合权重），切分不当会把这些超参变成新的失败源。

**cPINN。** 面向守恒律的域分解：界面处强制**通量守恒**而非仅解连续 [2]。这是处理激波与间断的关键——普通 PINNs 在间断处残差无意义（弱解不满足点态方程），cPINN 把守恒形式放到界面上才使离散有意义。适用：含激波的可压缩流、双曲守恒律。不适用：椭圆型光滑问题（无通量跳跃，白付界面代价）。

**时间域分解（dPINN 类）。** 把 $[0,T]$ 分段、逐段推进，段间传递末端状态作为下一段初值，即 dPINN 一族的做法。动机是第 3 讲病态五的因果性违背：分段后信息只能按时间方向流动。代价是误差沿段累积，且失去全局并行性。dPINN 原始论文经检索暂无可核验标识符（见文末说明），此处作方法描述。

## 族二：弱形式与变分——治高阶导数与间断

**Deep Ritz。** 不走残差，而走能量泛函：把椭圆型边值问题写成变分问题 $\min_u E[u]$，用网络参数化 $u$ 直接最小化 $E$ [3]。收益：残差里不再出现二阶导（能量只含一阶导），自动微分成本减半、条件数改善。限制很硬：**只适用于有变分结构的问题**。一般演化方程、对流主导问题没有能量泛函，Deep Ritz 无从谈起。

**VPINN。** 变分形式 + 测试函数：把方程投影到一组测试函数上，残差变成积分形式 [4]。比 Deep Ritz 适用范围宽（不要求能量结构），比点态残差对低正则解更友好。代价是要选测试函数族并数值积分。

**wPINN。** 弱解形式，专门处理守恒律的**熵解** [5]。思路是把测试函数也放进优化（min-max），使网络逼近满足熵条件的弱解而非任意弱解。适用：激波、间断。代价是 min-max 训练比单目标更不稳定。

三者的共同动机：**点态残差要求解足够光滑，而真实解常常不够。** 当你的问题有间断或低正则性，先想这一族。

## 族三：架构替换——治表达力与算子学习

**fPINN。** 把微分算子换成分数阶导数，处理反常扩散 [6]。分数阶导数是非局部的，残差评估需要积分而非局部自动微分，成本结构完全不同。

**PI-DeepONet 与 FNO。** 这两者严格说是**神经算子**而非 PINNs 变体：学的是参数到解的映射算子，一次训练多工况评估 [7][8]。PI-DeepONet 把物理残差注入 DeepONet 的训练损失 [9]，是「算子学习 + 物理约束」的混血。何时选它们而非 PINNs：需要参数扫描或多工况实时评估时（第 5 讲决策表）。

**PIKAN。** 用 Kolmogorov–Arnold 网络（可学习单变量函数叠加）替换 MLP 作为基函数 [10]。宣称在若干基准上以更少参数达到 comparable 精度；作为新架构，其优势边界仍在被检验，选型时以基准复现为准而非论文宣称。

## 族四：不确定性量化——治「解不唯一」的错觉

单次 PINNs 训练给出一个点估计，但损失景观的多模性意味着**不同初始化会落在不同解上**。把这种不确定性量化出来有三条路：

**B-PINN。** 贝叶斯框架：对 $\theta$ 置先验，用 HMC 或变分推断求后验 $p(\theta \mid \text{data})$，预测给出分布而非点 [11]。对噪声数据的反问题尤其合适——后验宽度直接反映数据信息量。代价是采样成本高一个量级。

**Ensemble。** 训 $K$ 个不同种子的网络，用样本方差估计不确定性。便宜、无理论保证，但实践中常常够用，且天然给出第 8 讲要求的多种子统计。

**MC dropout。** 推理时开 dropout 多次前向。最便宜，校准性最差。

选型：要发表级的不确定性陈述用 B-PINN；要工程级的误差棒用 ensemble；MC dropout 只作快速 sanity check。

## 族五：多保真度——治高保真数据贵

低保真模型（粗网格、简化物理）便宜但不准，高保真数据准但少。多保真度 PINNs 用两个网络：一个学低保真解，一个学「低保真到高保真的修正」，高保真数据只约束修正网络 [12]。收益是高保真样本需求大幅下降。适用：有可信低保真模型且高保真昂贵的场景（DNS vs RANS、实验 vs 模拟）。

## 主对比表

| 变体                      | 针对的病态   | 新增超参           | 额外代价          | 适用           | 不适用              |
| ------------------------- | ------------ | ------------------ | ----------------- | -------------- | ------------------- |
| XPINN [1]                 | 规模、薄结构 | 界面配点、耦合权重 | 界面条件调参      | 大域、局部薄层 | 小问题              |
| cPINN [2]                 | 间断/激波    | 界面通量权重       | 守恒形式推导      | 双曲守恒律     | 光滑椭圆问题        |
| 时间域分解                | 因果性违背   | 段数、段长         | 误差累积          | 长时间积分     | 稳态问题            |
| Deep Ritz [3]             | 高阶导数成本 | 无                 | 需变分结构        | 椭圆型         | 演化/对流主导       |
| VPINN [4]                 | 低正则解     | 测试函数族         | 数值积分          | 宽于 Deep Ritz | 点态信息 crucial 时 |
| wPINN [5]                 | 间断/熵解    | min-max 平衡       | 训练不稳定        | 激波           | 光滑问题            |
| fPINN [6]                 | 反常扩散     | 分数阶阶数         | 非局部积分        | 反常输运       | 整数阶问题          |
| PI-DeepONet [9] / FNO [8] | 多工况成本   | 算子架构           | 需参数–解对训练集 | 参数扫描       | 单工况高精度        |
| B-PINN [11]               | 不确定性     | 先验、采样数       | 成本高一个量级    | 噪声反问题     | 快速原型            |
| 多保真度 [12]             | 高保真数据贵 | 修正网络结构       | 需低保真模型      | 有可信低保真   | 无低保真模型        |

## 怎么选：三个问题加一个算例

三个问题按顺序问，每个问题的答案只决定一族：

1. **解有间断或低正则吗？** 有 → 族二或 cPINN。没有 → 跳过。
2. **需要多工况评估吗？** 需要 → 族三的算子路线。不需要 → 跳过。
3. **域大或有局部薄层吗？** 有 → XPINN。没有 → 标准 PINNs 加第 3 讲的对策。

不确定性是横切关注点：任何一族都可以叠加族四。多保真度是数据策略，同样横切。

**算例。** 问题描述：二维可压缩流过一个带后缘激波的翼型；需要在 40 个来流马赫数上各给一份流场；实验只有 3 个马赫数的稀疏压力测量；预算一台单卡 GPU。

- 问题 1：有激波 → 间断。候选族二/cPINN。但注意：cPINN 要求你把激波位置作为子域界面或至少知道它大致在哪；若激波位置随马赫数移动且未知，cPINN 的界面条件会变成移动边界问题。退而选 wPINN 的弱形式，或接受标准 PINNs + 激波区加密（精度要求不高时）。
- 问题 2：40 个工况 → **这是决定性问题**。逐工况训 40 次 PINNs 在单卡上不现实。转向族三：用 PI-DeepONet 或 FNO 学马赫数到流场的算子，3 组实验测量作为数据项注入。激波的存在意味着算子学习的训练集必须覆盖激波位置的变化范围，否则外推失败（第 5 讲判据）。
- 问题 3：域不大、薄层是边界层而非求解目标 → 不触发 XPINN。

结论：算子路线 + 弱形式或激波区加密 + 数据项融合 3 组测量。**没有一个变体是「最新所以最好」选出来的**；三个问题各自排除了一大半选项。若把预算换成「只要 1 个马赫数、但要发表级误差棒」，答案会完全不同：标准 PINNs + B-PINN，族三直接出局。选型对问题描述的敏感度，远高于对文献新旧的敏感度。

## 关于标识符的说明

本讲全部参考文献均经 arXiv API 或 Crossref 回查；XPINN 原始方法论文最初未检索到标识符，后由 A 路重检索补得 DOI 并回查确认（见 [1]）。有两类内容**故意不附出处**：时间域分解与多保真度作为方法描述给出（前者的动机是第 3 讲病态五的因果性违背，后者的概念见第 1 讲算子路线讨论），因为它们在本讲是手法而非文献论断。经检索确认暂无可核验标识符、因而未引用的条目：dPINN 原始论文、RAR 原始论文、Modulus 的独立论文（第 8 讲以其前身 SimNet 为出处并注明）。不编造标识符。

## 参考文献

[1] Ameya D. Jagtap, George Em Karniadakis. Extended Physics-Informed Neural Networks (XPINNs): A Generalized Space-Time Domain Decomposition Based Deep Learning Framework. Communications in Computational Physics, 2020. DOI: 10.4208/cicp.oa-2020-0164. 泛化行为分析见 When Do Extended Physics-Informed Neural Networks (XPINNs) Improve Generalization? arXiv, 2021. arXiv:2109.09444.
[2] Ameya D. Jagtap, Ehsan Kharazmi, George Em Karniadakis. Conservative physics-informed neural networks on discrete domains for conservation laws. Computer Methods in Applied Mechanics and Engineering, 2020. DOI: 10.1016/j.cma.2020.113028.
[3] Weinan E, Bin Yu. The Deep Ritz method: A deep learning-based numerical algorithm for solving variational problems. Communications in Mathematics and Statistics, 2018. DOI: 10.1007/s40304-018-0127-z. arXiv:1710.00211.
[4] Ehsan Kharazmi, Zhongqiang Zhang, George Em Karniadakis. Variational Physics-Informed Neural Networks For Solving Partial Differential Equations. arXiv, 2019. arXiv:1912.00873.
[5] Tim De Ryck, Siddhartha Mishra, Roberto Molinaro. wPINNs: Weak Physics informed neural networks for approximating entropy solutions of hyperbolic conservation laws. arXiv, 2022. arXiv:2207.08483.
[6] Guofei Pang, Lu Lu, George Em Karniadakis. fPINNs: Fractional Physics-Informed Neural Networks. arXiv, 2018. arXiv:1811.08967.
[7] Lu Lu, Pengzhan Jin, George Em Karniadakis. DeepONet: Learning nonlinear operators for identifying differential equations based on the universal approximation theorem of operators. arXiv, 2019. arXiv:1910.03193.
[8] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli 等. Fourier Neural Operator for Parametric Partial Differential Equations. arXiv, 2020. arXiv:2010.08895.
[9] Sifan Wang, Hanwen Wang, Paris Perdikaris. Learning the solution operator of parametric partial differential equations with physics-informed DeepONets. Science Advances, 2021. DOI: 10.1126/sciadv.abi8605.
[10] Juan Diego Toscano, Vivek Oommen, Alan John Varghese 等. From PINNs to PIKANs: Recent Advances in Physics-Informed Machine Learning. arXiv, 2024. arXiv:2410.13228.
[11] Liu Yang, Xuhui Meng, George Em Karniadakis. B-PINNs: Bayesian Physics-Informed Neural Networks for Forward and Inverse PDE Problems with Noisy Data. arXiv, 2020. arXiv:2003.06097.
[12] 多保真度 PINNs 的概念与框架见 George Em Karniadakis 等. Physics-informed machine learning. Nature Reviews Physics, 2021. DOI: 10.1038/s42254-021-00314-5.
