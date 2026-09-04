# C 路检索结果：PINNs × 电水动力学（electrohydrodynamics, EHD）

支撑讲次：第 7 讲 `pinns-ehd.md`
检索日期：2026-09-04
检索依据：`docs/specs/pinns-course.md` §7「C 路」三层检索计划
前置状态：`docs/paper/papers_1788510570245.json` 中 C 路命中 **0 条**（原查询为 C1∧C2∧C3∧C4 四重合取，且 EHD 缩写大量误匹配）。本文件为按三层计划重检索后的完整结果。

> [!WARNING]
> **术语口径（本文件全程遵守）**：EHD 一律指 **electrohydrodynamics（电水动力学／电流体）**——电场驱动流体运动、电荷输运与电流体不稳定性。
> **不含** elastohydrodynamic（弹流润滑，摩擦学）、**不含** electro-hydraulic（电液传动／液压）、**不含** electro-magnetohydrodynamic（EMHD 磁流体）。
> 误命中及排除理由见「四、被排除的误匹配」。

**验证方式标记说明**

| 标记 | 含义 |
|---|---|
| `arXiv API` | 用 `https://export.arxiv.org/api/query?id_list=<编号>` 回查，标题／作者／日期／类目逐条对上 |
| `Crossref DOI` | 用 `https://api.crossref.org/works/<DOI>` 直取，标题／作者／期刊／卷期页对上 |
| `doi.org 解析` | 用 `https://doi.org/<DOI>` 取 HTTP 重定向与 CSL 元数据。**arXiv 自身的 `10.48550/` DataCite DOI 必须走这条路**——它们不在 Crossref，直查会 404 |
| `OpenAlex` | `api.openalex.org` 命中并读取摘要（abstract_inverted_index 还原） |
| `待核验` | 仅在单一开放源出现且无法解析出 DOI／arXiv 编号，**不得直接写入讲义参考文献** |

---

## 一、第一层：PINNs × EHD 直接命中

**9 条。** 这一层是第 7 讲可直接作为综述骨架的文献。

### L1-1 LSTM-PINN：稳态 EHD 流的混合求解框架

- **标题**：LSTM-PINN: An hybrid method for prediction of steady-state electrohydrodynamic flow
- **作者**：Ze Tao, Ke Xu, Fujun Liu
- **年份／venue**：*Journal of Computational Physics* **548**, 114586（2026）；arXiv 预印本 2025-12-25
- **出处**：`arXiv:2512.21614` + DOI `10.1016/j.jcp.2025.114586`
- **验证方式**：arXiv API（`id_list` 回查，且 arXiv 元数据自带 `arxiv:doi` 字段）+ Crossref DOI 直取（JCP vol 548, art 114586，作者三人一致）
- **EHD 子问题与 PINNs 用法**：**稳态单极 EHD 流**——二维带电流体在外加电场下的稳态速度场。核心论点是标准 MLP-PINN 在陡梯度、复杂边界、强物理约束下会收敛失败与数值不稳定，改用 LSTM 骨干捕捉空间长程相关性。**这是与第 7 讲选定的「稳态单极离子风」推导案例最贴合的一篇。**

### L1-2 二维稳态 EHD 激波型问题的统一基准套件

- **标题**：A Unified Benchmark Study of Shock-Like Problems in Two-Dimensional Electrohydrodynamic Flow Based on LSTM-PINN
- **作者**：Chao Lin, Ze Tao, Fujun Liu
- **年份／venue**：arXiv 预印本，2026-03-22，类目 `physics.comp-ph`（未见期刊 DOI）
- **出处**：`arXiv:2603.21227`
- **验证方式**：arXiv API（`id_list` 回查，标题／作者／日期／类目一致）
- **EHD 子问题与 PINNs 用法**：明确指出 EHD 的困难在于**电荷密度、速度场、电势三者的强非线性耦合**会诱发锐利过渡层、交叉锋面与多尺度结构——**正是第 7 讲「方程类型混合 + 强耦合」两个核心难点的直接文献佐证**。提出统一四变量算子框架，构造 8 个含斜置／弯曲／相交锋面的基准算例，在完全相同的控制方程、源项、采样策略与损失形式下对比 Standard MLP-PINN、ResAtt-PINN、LSTM-PINN。**可直接用作第 7 讲「预期失败模式」一节的量化依据。**

### L1-3 RA-PINN：稳态电热多物理场系统的鲁棒模拟

- **标题**：Residual Attention Physics-Informed Neural Networks for Robust Multiphysics Simulation of Steady-State Electrothermal Energy Systems
- **作者**：Yuqing Zhou, Ze Tao, Fujun Liu
- **年份／venue**：arXiv 预印本，2026-03-24，类目 `cs.LG`, `physics.comp-ph`
- **出处**：`arXiv:2603.23578`
- **验证方式**：arXiv API（`id_list` 回查）+ OpenAlex（两条记录）+ `https://doi.org/10.48550/arxiv.2603.23578` 解析成功（HTTP 200 → `arxiv.org/abs/2603.23578`，CSL 元数据标题／作者／年份逐条对上）。**注意 `10.48550/` 前缀是 arXiv 的 DataCite DOI，注册在 DataCite 而非 Crossref，故 `api.crossref.org/works/<DOI>` 会返回 404——这不是 DOI 无效，须走 doi.org 或 DataCite 验真**
- **EHD 子问题与 PINNs 用法**：应用场景含 **electrohydrodynamic transport**、微流体能量收集器、电驱动热调节器。提出**统一五场算子表述**（速度、压力、电势、温度），用残差连接特征传播 + 注意力通道调制处理**强非线性场耦合、温度相关系数变化、复杂界面动力学**。**对第 7 讲「三场量级差异」难点有直接参考价值——它把场数从三扩到五。**

### L1-4 RA-PINN 重构电荷边界层与锐利界面

- **标题**：High-Fidelity Reconstruction of Charge Boundary Layers and Sharp Interfaces in Electro-Thermal-Convective Flows via Residual-Attention PINNs
- **作者**：Baitong Zhou, Ze Tao, Ke Xu, Fujun Liu, Xuan Fang
- **年份／venue**：arXiv 预印本，2026-04-12，类目 `physics.flu-dyn`
- **出处**：`arXiv:2604.20881`
- **验证方式**：arXiv API（`id_list` 回查）
- **EHD 子问题与 PINNs 用法**：**电极附近指数型电荷边界层**与集中电荷场。摘要直言常规 PINN 能捕捉光滑全局动力学，但在解析锐利电荷边界层或突变多相界面时出现**数值扩散与畸变**。**这是第 7 讲「电荷注入边界条件」与「spectral bias 命中薄层」两处论述的最佳直接引证**（可与第 3 讲谱偏置形成回指）。

### L1-5 EHD 模型的 PINNs 与 FEM 对比研究

- **标题**：Numerical approximation of electrohydrodynamics model: a comparative study of PINNs and FEM
- **作者**：Mara Martinez, B. Veena S. N. Rao, S. M. Mallikarjunaiah
- **年份／venue**：*Physica Scripta* **101**, 136002（2026）；arXiv 预印本 2025-10-16，类目 `math.NA`
- **出处**：`arXiv:2510.14310` + DOI `10.1088/1402-4896/ae51cd`
- **验证方式**：arXiv API + Crossref DOI 直取（Phys. Scr. vol 101, art 136002，作者三人一致）+ OpenAlex
- **EHD 子问题与 PINNs 用法**：**经典 EHD 问题**（即单极 EHD 圆管流一支）。采用 $L^2$ 型总损失函数，**明确声明不依赖任何精确解先验知识**；系统研究最优网络结构与超参配置；结论是 PINN 在有限训练数据下即有良好表现，而 FEM 精度需靠细化网格换取。**对第 7 讲「PINNs vs 传统求解器」的定位对比表直接可用**（可回指第 1 讲四类方法对比）。

### L1-6 电动力微流控多物理场耦合的 PINN 框架（NPN 方程组）

- **标题**：A physics-informed neural network framework for multi-physics coupling microfluidic problems
- **作者**：Runze Sun, Hyogu Jeong, Jiachen Zhao, Yixing Gou, Emilie Sauret, Zirui Li, Yuantong Gu
- **年份／venue**：*Computers & Fluids* **284**, 106421（2024），被引 39
- **出处**：DOI `10.1016/j.compfluid.2024.106421`（未见 arXiv 编号）
- **验证方式**：Crossref DOI 直取 + OpenAlex 摘要还原
- **EHD 子问题与 PINNs 用法**：**电渗流（EOF）、电迁移（Electromigration）、离子浓差极化（ICP）**。网络受 **Nernst–Planck + Poisson + Navier–Stokes（NPN）方程组**约束，**无需任何标注数据**训练。
- **为什么这条最关键**：NPN 正是第 7 讲 §5.2 要求写全的那套方程——**椭圆（Poisson）+ 双曲-抛物（电荷／离子守恒）+ 抛物（NS）的混合型强耦合三场系统**。这是目前找到的、与第 7 讲方程组结构**逐一对应**的 PINN 实现文献，可直接支撑「完整推导案例」的损失函数逐项设计。

### L1-7 DeepM&Mnet：电对流传热多物理场的算子逼近

- **标题**：DeepM&Mnet: Inferring the electroconvection multiphysics fields based on operator approximation by neural networks
- **作者**：Shengze Cai, Zhicheng Wang, Lu Lu, Tamer A. Zaki, George Em Karniadakis
- **年份／venue**：*Journal of Computational Physics* **436**, 110296（2021），被引 210；arXiv 预印本 2020-09-27
- **出处**：DOI `10.1016/j.jcp.2021.110296` + `arXiv:2009.12935`
- **验证方式**：arXiv API（含 `arxiv:doi` 字段）+ Crossref DOI 直取 + OpenAlex
- **EHD 子问题与 PINNs 用法**：**电对流（electroconvection）**——流场与电场、阳离子／阴离子浓度场耦合；小 Debye 长度下形成极陡边界层。以电对列为基准问题，预训练 DeepONet 分别预测各场，再做跨场数据同化，速度远超标准数值方法。
- **必须标注的口径警告**：**DeepM&Mnet 不是残差式 PINN，而是 DeepONet 神经算子 + 数据同化框架**，不以 PDE 残差作损失。归入第一层是因为它同时满足「真 EHD（电对流）」与「Karniadakis 团队的物理信息神经计算」两条，且被引量（210）远高于其余各条。**在第 7 讲引用时必须说明它属于「算子学习路线」，用于对照第 4 讲 PI-DeepONet／FNO，不能当作 PINNs 求解 EHD 的证据。**

### L1-8 电流体聚合物喷射打印动力学的物理信息贝叶斯学习

- **标题**：Physics-Informed Bayesian learning of electrohydrodynamic polymer jet printing dynamics
- **作者**：Athanasios Oikonomou, Theodoros Loutas, Dixia Fan, Alysia Garmulewicz, George Nounesis, Santanu Chaudhuri, Filippos Tourlomousis
- **年份／venue**：*Communications Engineering* **2**, 20（2023），被引 22；arXiv 预印本 2022-04-16
- **出处**：DOI `10.1038/s44172-023-00069-0` + `arXiv:2204.09513`
- **验证方式**：arXiv API + Crossref DOI 直取（Comms Eng vol 2, art 20，七位作者一致）+ OpenAlex
- **EHD 子问题与 PINNs 用法**：**E-jet printing（电流体喷印）射流动力学标定**。GPJet 三模块：机器视觉 + 物理建模 + ML，用高低保真数据闭环反馈做在线主动学习。
- **口径警告**：属**物理信息贝叶斯学习（physics-informed Bayesian learning）**，物理约束来自降阶物理模型与视觉特征，而非 PDE 残差配点。引用时应归为「EHD 的物理信息机器学习」，**不宜当作 PINN 求解 EHD 控制方程的实例**。

### L1-9 多指标 Bell 多项式计算 PINN 高阶混合导数（含五场 EHD 测试系统）

- **标题**：Computing high-order mixed derivatives in physics-informed neural networks using multi-index Bell polynomials
- **作者**：Fumihiro Imoto
- **年份／venue**：arXiv 预印本，2026-09-03，类目 `physics.comp-ph`, `physics.plasm-ph`
- **出处**：`arXiv:2609.03768`
- **验证方式**：arXiv API（`id_list` 回查）
- **EHD 子问题与 PINNs 用法**：数值测试**明确包含「a manufactured five-field electrohydrodynamic system」（人造五场电水动力学系统）**。方法是把多变量 Faà di Bruno 公式的前向递推与对参数的显式反传组织起来，Bell 多项式卷积表只算一次，避免嵌套计算图；单核 CPU 上对四输入求到七阶共 330 个混合导数及损失梯度，未出现嵌套实现的内存失败。
- **为什么对第 7 讲有用**：EHD 的 $\mathbf{J}=\rho_c\mathbf{u}+b\rho_c\mathbf{E}-D\nabla\rho_c$ 与介电体力项会展开出大量**非线性乘积型高阶混合导数**。这篇给出了自动微分成本与内存爆炸的量化证据与替代方案，**支撑第 7 讲「计算图膨胀」与第 2 讲「二阶导成本」的论述**。

---

## 二、第二层：子领域命中

**25 条**（24 条 DOI／arXiv 已验证，1 条待核验）。

> [!WARNING]
> **这一层的口径必须向读者交代清楚。** 下列多数条目是**数据驱动的 EHD 过程建模／ANN 回归**，而不是残差式 PINN 求解 EHD 控制方程。它们能支撑第 7 讲的「应用面」地图（§5.5），但**不能支撑「PINNs 如何写 EHD 损失函数」**。每条已注明其真实用法。

### 2.1 电喷雾 / EHD 原子化 / 电流体喷印（9 条）

| # | 标题 | 作者 | 年份／venue | DOI 或 arXiv | 验证 | 一句话说明 |
|---|---|---|---|---|---|---|
| S1 | Machine learning to empower electrohydrodynamic processing | Fanjin Wang, Moe Elbadawi, Scheilly Liu Tsilova, Simon Gaisford, Abdul W. Basit, Maryam Parhizkar | *Mater. Sci. Eng. C* **132**, 112553（2022），被引 39 | `10.1016/j.msec.2021.112553` | Crossref DOI + OpenAlex | ML 赋能 EHD 加工（电喷雾／电纺）的综述性入口，可作 §5.5「电喷雾」小节的开篇引证 |
| S2 | Machine Learning Assisted Spraying Pattern Recognition for Electrohydrodynamic Atomization System | Jinxin Wang, Tao Dong, Yongpan Cheng, Wei-Cheng Yan | *Ind. Eng. Chem. Res.* **61**, 8495–8503（2022），被引 27 | `10.1021/acs.iecr.1c04669` | Crossref DOI | EHD 原子化喷雾模式识别（分类，非求解 PDE）——对应 §5.5「电喷雾与 Taylor cone」 |
| S3 | Development of machine learning based droplet diameter prediction model for electrohydrodynamic atomization systems | Tao Dong, Jin-Xin Wang, Yong Wang, Guan-Hua Tang, Yongpan Cheng, Wei-Cheng Yan | *Chem. Eng. Sci.* **268**, 118398（2023），被引 30 | `10.1016/j.ces.2022.118398` | Crossref DOI | EHD 雾化液滴直径预测（回归代理模型） |
| S4 | Machine Learning-Informed Predictive Design and Analysis of Electrohydrodynamic Printing Systems | Sachin Kumar Singh, Nikhil Rai, Arunkumar Subramanian | *Adv. Eng. Mater.* **25**, 2300740（2023），被引 17 | `10.1002/adem.202300740` | Crossref DOI | EHD 打印系统的 ML 预测设计与分析 |
| S5 | Prediction of electrohydrodynamic printing behavior using machine learning approaches | Yizhou Lu, James Treadway, Prashant Ghimire, Yiwei Han, Samrat Choudhury | *Int. J. Adv. Manuf. Technol.* **136**, 4439–4454（2025），被引 11 | `10.1007/s00170-025-15064-2` | Crossref DOI | EHD 打印行为预测（工艺参数→输出映射） |
| S6 | In Situ Monitoring and Recognition of Printing Quality in Electrohydrodynamic Inkjet Printing via Machine Learning | Liangkui Jiang, Rayne Wolf, Khawlah Alharbi, Hantang Qin | *J. Manuf. Sci. Eng.* **146**, 110901（2024），被引 10 | `10.1115/1.4066124` | Crossref DOI | EHD 喷墨打印质量的原位监测与识别（视觉 ML） |
| S7 | Electrospray mode discrimination with current signal using deep convolutional neural network and class activation map | Man Jin Kim, Jin Yeong Song, Seok Hyeon Hwang, Dong Yong Park, Sang Min Park | *Sci. Rep.* **12**, 16281（2022），被引 18 | `10.1038/s41598-022-20352-y` | Crossref DOI + OpenAlex | 用**电流信号**做电喷雾模式判别（深度 CNN + CAM）。与 EHD 电荷输运量直接挂钩，是本子领域中最贴近物理的一条 |
| S8 | Electrohydrodynamic printing process monitoring by microscopic image identification | Jie Sun, Linzhi Jing, Xiaotian Fan, Xueying Gao, Yung C. Liang | *Int. J. Bioprinting* **5**, 164（2018），被引 31 | `10.18063/ijb.v5i1.164` | Crossref DOI + OpenAlex | EHD 打印过程的显微图像识别监测 |
| S9 | Machine Learning-Assisted E-jet Printing of Organic Flexible Biosensors | Mehran Abbasi Shirsavar, Mehrnoosh Taghavimehr, Lionel J. Ouedraogo, Mojan Javaherian, Nicole N. Hashemi, Farinaz Koushanfar, Reza Montazami | arXiv 预印本，2021-11-07，类目 `cs.LG`, `cs.ET` | `arXiv:2111.03985` | arXiv API | EHD-jet 打印电路电导率对喷嘴速度／墨水流率／电压的 ML 预测；K-NN 与随机森林最佳，AdaBoost 集成 87% |

### 2.2 Taylor cone（1 条，但价值极高）

- **标题**：Data-driven surrogate modelling of multistage Taylor cone–jet dynamics
- **作者**：Sílvio Cândido, José C. Páscoa
- **年份／venue**：*Physics of Fluids* **36**, 052102（2024），被引 10
- **出处**：DOI `10.1063/5.0205454`
- **验证方式**：Crossref DOI 直取 + OpenAlex 摘要还原
- **EHD 子问题**：**Taylor cone-jet（胶体推进器用的电流体射流）**，高电压下雾化失稳转为电喷雾。
- **方法与用法**：OpenFOAM 中 VOF + Maxwell 方程耦合不可压 NS，采用 **leaky-dielectric 模型**，界面同时受表面张力与 Maxwell 应力；先做庚烷液膜射流破碎的高保真模拟（1.53–7.0 nL/s，2.4–4.5 kV），再叠加 ML 模型**外推参数运行窗口**。
- **为什么重要**：这一条**同时命中 spec §7 第二层的三个检索词**——`Taylor cone + simulation/ML`、`leaky dielectric + ML`、以及 EHD 的数据驱动代理模型（第三层）。是第 7 讲 §5.5「电喷雾与 Taylor cone」与「电流体不稳定性（leaky dielectric）」两处的共用引证。

### 2.3 离子风 / 电晕放电（2 条）

| # | 标题 | 作者 | 年份／venue | DOI | 验证 | 一句话说明 |
|---|---|---|---|---|---|---|
| S11 | LSTM Neural Networks With Attention Mechanisms for Accelerated Prediction of Charge Density at Onset Condition of DC Corona Discharge | Yong Yi, Zhengying Chen, Rui Li | *IEEE Access* **10**, 124697–124704（2022），被引 4 | `10.1109/access.2022.3222269` | Crossref DOI + OpenAlex | **直流电晕起晕条件下的电荷密度**加速预测（LSTM + 注意力）。离子风／EHD 泵的物理上游正是电晕起晕与空间电荷产生，**这是 C 路中最贴近「单极离子风」电荷源项的一条 ML 文献** |
| S12 | Optimization of Ionic Wind Filtration Systems for Atmospheric Particulate Matter Removal: A Hybrid Numerical and Empirical Modeling Approach | Aleksandr Šabanovič, Jonas Matijošius | *Atmosphere* **17**, 435（2026），被引 3 | `10.3390/atmos17050435` | Crossref DOI + OpenAlex 摘要 | **离子风驱动静电除尘器**：静电场 + 层流 + 颗粒追踪的二维轴对称高保真模型（MAE 5.3% @ 20 kV, 0.5 m/s），再叠加基于物理指数衰减函数的非线性回归引擎（$R^2=0.98$）做实时性能预测；提出 Fate-based Steady-state Evaluation 消除长管道 Lagrangian 颗粒模拟的瞬态偏差（「flight time paradox」）。**注意：ML 部分是非线性回归而非神经网络** |

### 2.4 EHD 泵 / 单极 EHD 管道流基准问题（6 条）

> [!NOTE]
> **「EHD flow in a circular cylindrical conduit」（单极 EHD 圆管离子拖曳流）是 EHD 数值方法的经典基准问题**，谱系为：ZAMM 1999 解析解 → ISRN Comput. Math. 2012（DOI `10.5402/2012/341069`，Najeeb Alam Khan 等，已 Crossref 验证）→ *J. Electrostatics* 2014 最小二乘法（DOI `10.1016/j.elstat.2013.11.005`，S.E. Ghasemi 等，已 Crossref 验证）→ 2018 混合 NN+GA → 2021 神经进化 → 2026 PINN vs FEM（即 L1-5）。**第 7 讲若选此题作推导案例，这条谱系可直接充当「前人解法对照表」。**

| # | 标题 | 作者 | 年份／venue | DOI 或 arXiv | 验证 | 一句话说明 |
|---|---|---|---|---|---|---|
| S13 | Predictive modeling of flexible EHD pumps using Kolmogorov–Arnold Networks | Yanhong Peng, Yuxin Wang, Fangchao Hu, Miao He, Zebing Mao, Xia Huang, Jun Ding | *Biomimetic Intelligence and Robotics* **4**, 100184（2024）；arXiv 2024-05-13（v2 2024-08-27） | `arXiv:2405.07488` + DOI `10.1016/j.birob.2024.100184` | arXiv API（含 `arxiv:journal_ref` 与 `arxiv:doi`）+ Crossref DOI | **柔性 EHD 泵**的压力与流量预测；KAN（可学习样条激活）优于 MLP 与随机森林（MSE 分别为 12.186 与 0.001），并从 KAN 提取符号公式。**可与第 4 讲 PIKAN（arXiv:2410.13228）形成 EHD 侧的呼应** |
| S14 | Soft computing-based predictive modeling of flexible electrohydrodynamic pumps | Zebing Mao, Yanhong Peng, Chenlong Hu, Ruqi Ding, Yuhei Yamada, Shingo Maeda | *Biomimetic Intelligence and Robotics* **3**, 100114（2023），被引 51 | `10.1016/j.birob.2023.100114` | Crossref DOI（首轮 429，重试后成功） | S13 的前作，柔性 EHD 泵的软计算预测建模，被引量本子领域最高 |
| S15 | A Hybrid Metaheuristic Based on Neurocomputing for Analysis of Unipolar Electrohydrodynamic Pump Flow | Muhammad Fawad Khan, Muhammad Sulaiman, Carlos Andrés Tavera Romero, Ali Alkhathlan | *Entropy* **23**, 1513（2021） | `10.3390/e23111513` | Crossref DOI + OpenAlex | **单极 EHD 泵流**的神经计算 + 混合元启发式求解。**标题中的 unipolar 与第 7 讲选定的「稳态单极离子风」推导案例同属一类问题**，可作前人解法对照 |
| S16 | Numerical Analysis of Electrohydrodynamic Flow in a Circular Cylindrical Conduit by Using Neuro Evolutionary Technique | Naveed Ahmad Khan, Muhammad Sulaiman, Carlos Andrés Tavera Romero, Fawaz Khaled Alarfaj | *Energies* **14**, 7774（2021），被引 16 | `10.3390/en14227774` | Crossref DOI + OpenAlex | 上述经典圆管 EHD 基准问题的神经进化（ANN + 遗传算法）求解。**注意：这是把 EHD 化简为 ODE 边值问题后用 ANN 拟合，不是求解完整 PDE 系统** |
| S17 | Fejér-quadrature collocation neural network method for solving ψ-tempered fractional electrohydrodynamics flow model | Parisa Rahimkhani, Ehsan Arshid, Zahra Khoddami Maraghi | *Commun. Nonlinear Sci. Numer. Simul.* **153**, 109521（2026），被引 2 | `10.1016/j.cnsns.2025.109521` | Crossref DOI + OpenAlex | **分数阶 EHD 流模型**的 Fejér 求积配点神经网络法。**与第 4 讲 fPINN（分数阶导数）直接对应**，是 EHD 侧唯一命中的分数阶神经网络文献 |
| S18 | Electrohydrodynamic flow solution in ion drag in a circular cylindrical conduit using hybrid neural network and genetic algorithm | Mirza Muhammad Sabir 等 | 2018，OpenAlex 记录 source 为 DOAJ，被引 7 | **DOI 未解析出** | **待核验**（仅 OpenAlex 单源，无 DOI／arXiv 编号；Crossref `query.bibliographic` 只返回同题的 2012／1999／2014 三条非 ML 文献） | 圆管离子拖曳 EHD 流的混合 NN+GA 求解，是 S16 的前身。**按 spec §3「严禁编造 DOI」，此条不得写入讲义参考文献**；若需引用，先人工到 DOAJ／期刊站点取回原始出处 |

### 2.5 EHD 对流与热管理（2 条）

| # | 标题 | 作者 | 年份／venue | DOI | 验证 | 一句话说明 |
|---|---|---|---|---|---|---|
| S19 | Artificial neural network prediction of an electrohydrodynamic thermosolutal buoyancy-driven convection of NEPCMs-dielectric suspension | Tahar Tayebi, Amjad Ali Pasha, Mohd Danish, Mohammed K. Al Mesfer, Sana Qaiyum, M.K. Nayak, Nehad Ali Shah | *Int. Commun. Heat Mass Transfer* **169**, 109756（2025），被引 11 | `10.1016/j.icheatmasstransfer.2025.109756` | Crossref DOI + OpenAlex | **EHD 热溶质浮力对流**（含纳米封装相变材料-介电悬浮液）的 ANN 预测。对应第 7 讲 §5.5「离子风／EHD 泵与电子器件散热」 |
| S20 | Development and optimization of an electrohydrodynamic dehydrator using ANN-GA for improved energy performance | Chakrit Suvanjumrat, Klar Kongsarai, Piyamon Phong-arom, Namnguen Chumphong, Machimontorn Promtong, Jetsadaporn Priyadumkol | *Results in Engineering* **27**, 106049（2025），被引 17 | `10.1016/j.rineng.2025.106049` | Crossref DOI + OpenAlex | **EHD 干燥器**的 ANN-GA 开发优化（EHD 干燥是离子风的典型工程应用） |

### 2.6 电荷输运 / Poisson–Nernst–Planck / 电动力学（5 条）

> [!NOTE]
> **这一小节是第二层中对第 7 讲数学骨架最有价值的部分。** PNP 系统（$\nabla\cdot(\varepsilon\nabla\varphi)=-\rho_c$ 椭圆 + $\partial\rho_c/\partial t+\nabla\cdot\mathbf{J}=S$ 抛物-双曲）与 EHD 的电荷输运子系统在数学结构上**同构**——EHD 只多一个动量方程与 $\rho_c\mathbf{E}$ 体力耦合。因此这些文献是第 7 讲「方程类型混合 ⇒ 训练竞争」论证的直接依据，也是第三层「方法论迁移」的桥梁。

| # | 标题 | 作者 | 年份／venue | DOI 或 arXiv | 验证 | 一句话说明 |
|---|---|---|---|---|---|---|
| S21 | Enriched Physics-informed Neural Networks for Dynamic Poisson-Nernst-Planck Systems | Xujia Huang, Fajie Wang, Benrong Zhang, Hanqing Liu | arXiv 预印本，2024-02-01，类目 `cs.LG`, `physics.comp-ph` | `arXiv:2402.01768` | arXiv API + OpenAlex | **动态 PNP 强耦合非线性系统**的 EPINN：自适应损失权重（最大似然估计逐次迭代自动分配）+ 重采样加速收敛 + GPU 并行。**直接对应第 7 讲「权重方案（含 NTK 或自适应加权的必要性论证）」** |
| S22 | A Systematic Benchmark of Physics-Informed Neural Network Architectures for the Stiff Poisson-Nernst-Planck System: Adaptive Loss Weighting and Multi-Scale Resolution | David Pankaczy, Conrard Giresse Tetsassi Feugmo | arXiv 预印本，2026-06-02，类目 `physics.app-ph`, `math-ph`, `physics.comp-ph` | `arXiv:2606.04125` | arXiv API | **首个 data-free 的刚性 PNP 系统 PINN 基准**：11 种配置分 4 个策略组，在一维物理参数化锂对称电池模型上实现于 NVIDIA PhysicsNeMo Sym，并以 FVM 为参考解验证。摘要直言**电荷密度前因子造成极端系数比、电双层造成锐利边界层，而 spectral bias 与多任务损失失衡限制了刚性 PNP 上的精度**；其 BRDR（balanced residual decay rate）方案与 NTK 对齐。**这条几乎逐句对应第 7 讲「三场量级差异巨大」+「谱偏置」两个难点，是 C 路中最有论证价值的一条** |
| S23 | A conservative hybrid physics-informed neural network method for Maxwell-Ampère-Nernst-Planck equations | Cheng Chang, Zhouping Xin, Tieyong Zeng | arXiv 预印本，2023-12-10，类目 `math.NA`, `cs.LG` | `arXiv:2312.05891` | arXiv API | MANP 方程（带电粒子动力学）的**守恒型**混合 PINN：自动确定 dummy variable 的合适逼近，并把原本只适用于二维的 curl-free 松弛分量推广到一维。**与第 4 讲 cPINN（守恒律、界面通量守恒）形成 EHD 侧呼应；EHD 的电荷守恒同样是守恒律形式** |
| S24 | Neural network predicts ion concentration profiles under nanoconfinement | Zhonglin Cao, Yuyang Wang, Cooper Lorsung, Amir Barati Farimani | *J. Chem. Phys.* **159**, 094702（2023）；arXiv 2023-04-10 | DOI `10.1063/5.0147119` + `arXiv:2304.04896` | arXiv API（含 `arxiv:doi`）+ Crossref DOI | 纳米通道离子浓度剖面预测，理解**电双层与电渗流**；把浓度剖面建模为概率分布，作为分子动力学的高速代理模型。对应 §5.5「电渗流与微通道输运」 |
| S25 | Physics-Informed Neural Networks for Radial Consolidation of Combined Electroosmotic, Vacuum and Surcharge Preloading Considering Smear Effects | Dong Li, Yapeng Cao, Shuai Huang, Yujun Cui, Haiping Fu, Lu Yang, He Wei | arXiv 预印本，2026-05-18，类目 `cs.CE`, `cs.AI`, `cs.LG`, `physics.app-ph` | `arXiv:2606.00056` | arXiv API | **无量纲多域 PINN** 求解电渗径向固结；对比 Std-PINN（软约束）、Mod-PINN（门控）、Mod-HC-PINN（硬约束边界编码），以 FEM 为参考解，含四种加载工况。门控架构改善了**阴极与涂抹带界面附近陡压力梯度**的解析。
  **口径警告：应用领域是岩土电渗固结（多孔介质），不是自由流体 EHD。** 但其「无量纲化 + 多域 + 软约束 vs 硬约束对比 + FEM 参考解」的方法论结构对第 7 讲 §5.4「界面与边界条件」「硬约束处理」有直接借鉴价值，**引用时须说明领域差异** |

### 2.7 介电泳（dielectrophoresis）：**0 条有效命中**

`dielectrophoresis + surrogate/ML` 在 arXiv 命中 0；OpenAlex `title_and_abstract.search` 命中 72 条但**前排全为生物细胞分选／芯片电泳／质谱方向**（如 *Cell Electrokinetic Fingerprint*, ODEP 循环肿瘤细胞检测），无一条是 DEP 场的代理模型或 PINN 求解。

**结论：spec §5 第 7 讲 §5.5 列的「介电泳颗粒操纵」这一应用面，在 ML／PINNs 口径下目前无可用直接文献。** 建议第 7 讲把介电泳降级为「控制方程可写出（$\mathbf{f}_{\text{diel}}$ 项）但缺 ML 文献支撑」的诚实声明项，或改引非 ML 的经典标度律文献（见 T4）。

---

## 三、第三层：放宽口径（方法论迁移依据）

**12 条。**

> [!WARNING]
> **本节全部条目都不是「PINNs × EHD」直接文献。** 它们分两类：
> (a) **EHD 数值模拟／降阶／综述**——用来支撑第 7 讲的控制方程组、无量纲数、数值难点，但**不含机器学习成分**；
> (b) **PINNs 求解混合型强耦合多物理场的一般性工作**——用来支撑「椭圆 + 双曲-抛物 + 抛物」训练竞争的方法论论证，但**不是 EHD**。
> 按 spec §5 第 7 讲第 7 点「诚实声明」，第 7 讲正文引用本节时必须明确标注为**外推依据**，不得写成综述结论。

### 3.1 EHD 计算与综述（无 ML 成分）

| # | 标题 | 作者 | 年份／venue | DOI | 验证 | 对第 7 讲的用途 |
|---|---|---|---|---|---|---|
| T1 | Computational ElectroHydroDynamics in microsystems: A Review of Challenges and Applications | Christian Narváez-Muñoz, Ali Reza Hashemi, Mohammad Reza Hashemi, Luis Javier Segura, Pavel B. Ryzhakov | *Arch. Comput. Methods Eng.* **32**, 535–569（2024），被引 25 | `10.1007/s11831-024-10147-x` | Crossref DOI + OpenAlex | **微系统 EHD 计算方法综述（挑战与应用）。第三层中价值最高的一条**——可作 §5.2「EHD 控制方程组」与 §5.4「PINNs 实现的核心难点」中传统数值方法一侧的权威对照 |
| T2 | Electrohydrodynamics and its applications: Recent advances and future perspectives | Kamran Iranshahi, Thijs Defraeye, Rene M. Rossi, Ulf Christian Müller | *Int. J. Heat Mass Transfer* **232**, 125895（2024），被引 73 | `10.1016/j.ijheatmasstransfer.2024.125895` | Crossref DOI + OpenAlex | EHD 及其应用综述，支撑 §5.5「应用面」的整体地图 |
| T3 | Electrohydrodynamics: A Review of the Role of Interfacial Shear Stresses | J. R. Melcher, G. I. Taylor | *Annu. Rev. Fluid Mech.* **1**, 111–146（1969），被引 1329 | `10.1146/annurev.fl.01.010169.000551` | Crossref DOI + OpenAlex | **EHD 奠基性综述（Melcher–Taylor）**，界面剪切应力与 leaky dielectric 模型的源头。第 7 讲术语消歧后给出学科定位时的经典引证 |
| T4 | Electrohydrodynamics and dielectrophoresis in microsystems: scaling laws | A. Castellanos, A. Ramos, A. González, N. G. Green, H. Morgan | *J. Phys. D: Appl. Phys.* **36**, 2584–2597（2003），被引 704 | `10.1088/0022-3727/36/20/023` | Crossref DOI + OpenAlex | **EHD 与 DEP 在微系统中的标度律**。**直接支撑 §5.3「无量纲数」**（电雷诺数、电对流数、Coulomb 数、电 Rayleigh 数的量级估算），也可弥补 2.7 节 DEP 无 ML 文献的缺口 |
| T5 | A Review on Electrohydrodynamic (EHD) Pump | Yanhong Peng, Dongze Li, Xiaoyan Yang, Zisu Ma, Zebing Mao | *Micromachines* **14**, 321（2023），被引 70 | `10.3390/mi14020321` | Crossref DOI + OpenAlex | EHD 泵综述，支撑 §5.5「离子风／EHD 泵与电子器件散热」；与 S13／S14 同一作者群，可串联 |

### 3.2 EHD 的数据驱动 / 代理 / 降阶方法（不限 PINNs）

| # | 标题 | 作者 | 年份／venue | DOI | 验证 | 对第 7 讲的用途 |
|---|---|---|---|---|---|---|
| T6 | On modal decomposition as surrogate for charge-conservative EHD modelling of Taylor Cone jets | Sílvio Cândido, José C. Páscoa | *Int. J. Eng. Sci.* **193**, 103947（2023），被引 16 | `10.1016/j.ijengsci.2023.103947` | Crossref DOI + OpenAlex | **电荷守恒型 EHD Taylor cone 射流的模态分解代理模型**。与 S10 同作者群，是「EHD 降阶／代理」路线的代表；可与第 4 讲神经算子路线对照 |
| T7 | Reduced order models for EHD controlled wake flow | Juan D'Adamo, Roberto Sosa, Ada Cammilleri, Guillermo Artana | *J. Phys.: Conf. Ser.* **166**, 012014（2009），被引 3 | `10.1088/1742-6596/166/1/012014` | Crossref DOI + OpenAlex | **EHD 控制尾流的降阶模型**。C 路中唯一直接以「reduced order model」为主题的 EHD 文献，证明 EHD 降阶方向存在但体量极小 |
| T8 | Phase-field-based regularized lattice Boltzmann method for axisymmetric two-phase electrohydrodynamic flow | Yuqi Zhu, Shiting Zhang, Yang Hu, Qiang He, Decai Li | *Phys. Fluids* **37**, 013103（2025） | `10.1063/5.0248869` | Crossref DOI 直取 | **真 EHD（轴对称两相电流体流）的相场正则化 LBM**，**无 ML 成分**。此条即 `papers_1788510570245.json` idx 15 被原评估当作「LBM 误命中」而丢弃的条目——**原判断有误：它确实是 electrohydrodynamic，只是不含机器学习**。归入第三层作为传统数值方法的对照基准，可用于第 7 讲「PINNs 与 LBM／FVM 精度对比」的讨论 |

### 3.3 PINNs 求解混合型强耦合多物理场的一般性工作（非 EHD）

| # | 标题 | 作者 | 年份／venue | DOI 或 arXiv | 验证 | 对第 7 讲的迁移价值 |
|---|---|---|---|---|---|---|
| T9 | Coupling-Robust Accuracy in Multiphysics Physics Informed Neural Networks via Kronecker-Preconditioned Optimization | Youngjae Park, Jaemin Kim, Junghwa Hong | arXiv 预印本，2026-05-22（v3），类目 `cs.LG`, `math.NA` | `arXiv:2605.23391` | arXiv API | **第三层中迁移价值最高的一条。** 指出多物理场 PINN 精度随**方程间耦合增强**而系统性退化，且单靠逆梯度范数损失平衡无法可靠阻止该失效。用 NTK 分析证明标准核的谱半径随耦合强度 $\gamma$ 以 $\Omega(\gamma^2)$ 增长，而**块对角 Gauss–Newton 预条件把它界定为与 $\gamma$ 无关的网络数 $S$**；并证明任何对角预条件器都无法对任意耦合类型与损失加权恢复该界。以 SOAP 优化器实现。**这是第 7 讲 §5.4「强耦合：$\rho_c$ 同时出现在 Poisson 右端与动量源项」以及「耦合迭代 vs 联合求解取舍」最有力的理论支撑，且回指第 3 讲 NTK 视角** |
| T10 | A Physics-Informed Neural Network for Solving the Quasi-static Magnetohydrodynamic Equations | Jonathan S. Arnaud, Christopher J. McDevitt, Golo Wimmer, Xian-Zhu Tang | arXiv 预印本，2026-04-22 | `arXiv:2604.20085` | arXiv API | **MHD 类比迁移依据**：轴对称托卡马克几何下**无数据**学习含时准静态 MHD 方程组，PINN 经细致处理后能学到解并预测垂直位移等离子体。MHD 与 EHD 同为「场方程（椭圆）+ 流体方程（抛物）+ Lorentz／Coulomb 体力耦合」结构，是方法论迁移最贴近的类比 |
| T11 | Physics-Informed Neural Networks for Solving Forward and Inverse PDEs with Limited and Noisy Data: Application to Solar Corona Modeling | Hubert Baty | arXiv 预印本，2025-02-27 | `arXiv:2502.19843` | arXiv API | MHD 过程的 PINN 正／反问题：稀疏或噪声数据（边界或域内）下的求解，以及**用 PINN 作反演方法确定方程中的未知系数**。支撑第 7 讲若讨论「EHD 迁移率／电荷注入系数辨识」时的反问题可行性（回指第 1 讲反问题模式、第 5 讲优势清单） |
| T12 | 经典 EHD 圆管流基准的非 ML 解法谱系（2 条合并列出） | Najeeb Alam Khan, Muhammad Jamil, Amir Mahmood, Asmat Ara ／ S.E. Ghasemi, M. Hatami, GH.R. Mehdizadeh Ahangar, D.D. Ganji | *ISRN Comput. Math.* **2012**, 1–5 ／ *J. Electrostatics* **72**, 47–52（2014） | `10.5402/2012/341069` ／ `10.1016/j.elstat.2013.11.005` | 两条均 Crossref DOI 直取 | 单极 EHD 圆管流的近似解与最小二乘法解。**与 S15／S16／L1-5 构成完整谱系**，第 7 讲若选该题作推导案例，可用它填「前人解法 → 神经进化 → PINN vs FEM」的演进对照表 |

---

## 四、被排除的误匹配

**6 条。** 本节直接服务于第 7 讲开篇的术语消歧（spec §5 第 7 讲第 1 点、§3「EHD 歧义必须显式消解」）——**可作为「为什么这个缩写在检索中大量误命中」的实例证据。**

| # | 标题 | 作者／年份／venue | DOI | 验证 | 误匹配类型 | 排除理由 |
|---|---|---|---|---|---|---|
| E1 | A Design Study of an Elasto-Hydrodynamic Seal for sCO2 Power Cycle by Using Physics Informed Neural Network | Mohammad Towhidul Islam Rimon, Mohammad Fuad Hassan, Karthik Reddy Lyathakula, Sevki Cesmeci, Hanping Xu, Jing Tang. *ASME Power Applied R&D 2023*, V001T04A005（2023） | `10.1115/power2023-108802` | Crossref DOI 直取 | **elastohydrodynamic（弹流润滑）** | 标题自带缩写「Elasto-Hydrodynamic (EHD)」，摘要讲的是**低泄漏、最小磨损、无应力集中的 sCO2 循环密封**——属摩擦学／弹流润滑，与电场驱动流体或电荷输运**零关系**。**这是「PINN + EHD」四词共现却完全误命中的最典型样本，第 7 讲开篇消歧的首选反面例子** |
| E2 | 基于物理信息神经网络的电液执行器建模方法 | 《液压与气动》，2026-02-26 | **DOI 未获取（CNKI 收录）** | 源自 `papers_1788510570245.json` idx 1（原文件 `url` 字段为空 `https://doi.org/`，`score` 79.85 为该文件第二高分） | **electro-hydraulic（电液传动／液压）** | 中文「电液执行器」= electro-hydraulic actuator，摘要讲的是**把电液执行器动力学的力平衡方程作为物理约束嵌入损失函数**，属液压伺服系统建模。原文件自己的 `reason` 已写「三个约束均未满足」「领域不匹配」。**同时是 spec §7 指出「score 是检索相似度分不是相关性分」的实证：得分第二高，实际 C 路价值为零** |
| E3 | Design of neural networks for Darcy–Forchheimer viscous fluid subjected to electro-magnetohydrodynamic and thermal impacts | Muhammad Shoaib, Kottakkaran Sooppy Nisar, Muhammad Asif Zahoor Raja, Mamoona Kausar, Muhammad Zeb, Aqsa Riaz. *Waves in Random and Complex Media*（2023），1–37 | `10.1080/17455030.2023.2290656` | Crossref DOI 直取 | **electro-magnetohydrodynamic（EMHD，磁流体）** | 「electro-magnetohydrodynamic」与 electrohydrodynamic 仅一字母之差，但物理机制是**外加电磁场下 Darcy–Forchheimer 多孔介质黏性流体的边界层流动**（典型的 nanofluid 数值分析文献群），**不含空间电荷输运与 $\rho_c\mathbf{E}$ 体力**。同时命中 spec §7 明确点名的「Darcy–Forchheimer 误命中」 |
| E4 | Monitoring of dust concentration based on electrostatic induction and physics-informed neural network | Wendong He, Wei Gao, Haipeng Jiang, Jianxin Lu, Jing Luo. *Process Safety and Environmental Protection* **213**, 109010（2026） | `10.1016/j.psep.2026.109010` | Crossref DOI 直取 | **静电感应传感（electrostatic induction）** | 用 PINN 做**粉尘浓度监测**，物理机制是静电感应信号反演，**不涉及电场驱动的流体运动或电荷输运方程**。即 spec §7 点名的「静电感应粉尘监测」误命中 |
| E5 | The application of physics-informed neural networks to hydrodynamic voltammetry | Haotian Chen, Enno Kätelhön, Richard G. Compton. *The Analyst* **147**, 1881–1891（2022） | `10.1039/D2AN00456A` | Crossref DOI 直取 | **电化学（electrochemistry）边界案例** | **这是六条中最值得说明的一条。** 它确实求解 Nernst–Planck 输运 + 流体方程（旋转圆盘电极的对流-扩散），数学结构与 EHD 的电荷输运子系统**部分同构**，故一度考虑纳入第二层。**最终排除的理由：hydrodynamic voltammetry 的驱动机制是机械对流（电极旋转）而非电场体力，且研究对象是电极反应电流而非电流体流动**——不符合本课程 EHD = electrohydrodynamics 的口径。**若第 7 讲需要补充「PINN 求解 NP + NS 耦合」的第二例证，可优先引用 S21／S22（PNP 系统），而非本条** |
| E6 | Features of the combustion of liquid hydrocarbons in the presence of an electrostatic field | Tamer M. Ismail, M. Abd El-Salam. *Journal of Electrostatics* **143**, 104368（2026） | `10.1016/j.elstat.2026.104368` | Crossref DOI 直取 | **静电场辅助燃烧（属 B 路而非 C 路）** | 研究静电场存在下液态烃的**燃烧特性**，是「电场 × 燃烧」而非「电场驱动流体流动」。按 spec §9 已确认的决定 3「不做燃烧 + EHD 耦合专题」，此条即便有交集价值也不在 C 路范围内。**归 B 路备查** |

---

## 五、检索过程记录

### 5.1 接口与可用性

| 接口 | 端点 | 状态 |
|---|---|---|
| arXiv API | `https://export.arxiv.org/api/query?search_query=...&max_results=N`；回查 `?id_list=<编号>` | **可用，为主力**。全程 `-L` + https |
| OpenAlex | `https://api.openalex.org/works?search=...`；精检用 `?filter=title_and_abstract.search:...`；单篇取摘要用 `/works/doi:<DOI>`（还原 `abstract_inverted_index`） | **可用，为主力**。`filter=title_and_abstract.search` 的精度显著高于裸 `search`，建议后续沿用 |
| Crossref | `https://api.crossref.org/works?query.bibliographic=...&rows=N`；逐条验真 `https://api.crossref.org/works/<DOI>` | **可用**。带 User-Agent。**偶发 429**（`10.1016/j.birob.2023.100114` 首轮被限流，退避重试后成功），批量验真需加 sleep |
| doi.org / DataCite | `https://doi.org/<DOI>` 取重定向；`Accept: application/vnd.citationstyles.csl+json` 取 CSL 元数据 | **可用**。专用于 arXiv 自身的 `10.48550/` DataCite DOI（Crossref 无覆盖，直查 404）。本次用它确认 `10.48550/arxiv.2603.23578` 有效 |
| Semantic Scholar | `https://api.semanticscholar.org/graph/v1/paper/search` | **全程不可用**。5 个查询 × 3 次重试（含 8s 退避）均返回 **HTTP 429**，无鉴权 token 时该接口不可依赖。本次结果不依赖 S2，覆盖度未受实质影响 |
| Giiisp | — | **未使用**（无鉴权 token，按任务要求禁用） |

### 5.2 检索词与命中数

**第一层（arXiv）**

| 检索式 | 命中 |
|---|---|
| `all:"electrohydrodynamic" AND all:"physics-informed"` | 7 |
| `all:"electrohydrodynamic" AND all:"neural network"` | 6 |
| `all:"electrohydrodynamics" AND all:"neural network"` | 6 |
| `all:"electrohydrodynamic" AND all:"machine learning"` | 5 |
| `all:"electrohydrodynamic" AND all:"PINN"` | 5 |
| `all:"EHD" AND all:"physics-informed"` | 2 |
| `all:"electrohydrodynamic" AND all:"deep learning"` | 1 |
| `all:"electrohydrodynamic" AND all:"surrogate"` | **0** |
| `all:"electrohydrodynamic" AND all:"DeepONet"` | **0** |
| `all:"electrohydrodynamic" AND all:"data-driven"` | **0** |
| `all:"electroconvection" AND all:"physics-informed"` | **0** |
| **去重后第一层有效条目** | **9** |

**第一层（OpenAlex／Crossref，补充非 arXiv 期刊文献）**

| 检索式 | 接口 | 命中／有效 |
|---|---|---|
| `electrohydrodynamic physics-informed neural network` | OpenAlex `search` | 10 → 有效 4（DeepM&Mnet、Comms Eng、JCP LSTM-PINN、Phys. Scr.） |
| `electrohydrodynamic machine learning` | OpenAlex `search` | 10 → 有效 8 |
| `electrokinetic flow physics-informed neural network` | OpenAlex `search` | 8 → 有效 2（Computers & Fluids NPN 框架、EPINN） |
| `electrohydrodynamic physics-informed neural network` | OpenAlex `filter=title_and_abstract.search` | 总数 11 → 有效 5（其余为 arXiv 重复记录与 1 条 SSRN 预印本） |
| `electrohydrodynamic neural network` | OpenAlex `filter=title_and_abstract.search` | 总数 67 → 有效 7 |
| `electrohydrodynamic physics-informed neural network` | Crossref `query.bibliographic` | 8 → **有效 0**（全为同词根误命中：TechRxiv 间断计算、Stiff-PINN 补充材料、学位论文等） |

**第二层（按子领域）**

| 子领域 | 检索式（接口） | 命中／有效 |
|---|---|---|
| 电对流 | `all:"electroconvection" AND all:"neural network"`（arXiv） | 1 → 1（DeepM&Mnet 预印本） |
| Taylor cone | `all:"Taylor cone" AND all:"machine learning"`（arXiv） | **0** |
| Taylor cone | `electrospray Taylor cone machine learning`（OpenAlex）→ `data-driven surrogate Taylor cone jet electrospray`（Crossref） | 10 / 8 → 有效 2（PoF 2024 代理模型 + Sci Rep 2022 电喷雾模式 CNN） |
| 离子风 | `all:"ionic wind" AND all:"neural network"`（arXiv） | **0** |
| 离子风 | `all:"ion wind" AND all:"machine learning"`（arXiv） | **0** |
| 离子风 | `ionic wind neural network prediction`（OpenAlex `search`） | 10 → **有效 0**（全为神经形态计算／风电预测／锂电池 SOC 等噪声） |
| 离子风 | `ionic wind prediction model neural`（OpenAlex filter） | 总数 6 → 有效 0 |
| 离子风 | `corona discharge ionic wind machine learning prediction`（OpenAlex） | 8 → 有效 2（IEEE Access 电晕起晕电荷密度、Atmosphere 离子风除尘） |
| 电晕 | `all:"corona discharge" AND all:"machine learning"`（arXiv） | 1 → 0（E-FISH 电场测量，非 EHD） |
| 介电泳 | `all:"dielectrophoresis" AND all:"neural network"`（arXiv） | **0** |
| 介电泳 | `dielectrophoresis machine learning surrogate model`（OpenAlex） | 10 → **有效 0** |
| 介电泳 | `dielectrophoresis machine learning`（OpenAlex filter） | 总数 72 → **有效 0** |
| leaky dielectric | `all:"leaky dielectric" AND all:"neural network"`（arXiv） | **0**（唯一 leaky dielectric + ML 命中来自 S10 Taylor cone 代理模型，由 OpenAlex 路径获得） |
| 电渗／电动 | `all:"electroosmotic" AND all:"physics-informed"`（arXiv） | 1 → 1（岩土电渗固结 PINN） |
| 电渗／电动 | `all:"electrokinetic" AND all:"physics-informed neural network"`（arXiv） | **0** |
| 电渗／电动 | `all:"electroosmotic flow" AND all:"neural network"`（arXiv） | 1 → 1（纳米限域离子浓度剖面） |
| 电渗／电动 | `electrokinetic microfluidics`（OpenAlex） | → 有效 2（Computers & Fluids NPN、Micromachines 电动微流控综述） |
| 电荷输运 / PNP | `all:"Nernst-Planck" AND all:"physics-informed neural network"`（arXiv） | **4 → 4 全部有效**（EPINN、刚性 PNP 基准、MANP 守恒 PINN、Kronecker 预条件） |
| 空间电荷 | `all:"space charge" AND all:"physics-informed"`（arXiv） | 1 → 0（Cheetah 加速器物理） |
| EHD 泵 | `electrohydrodynamic pump machine learning`（S2） | **429 不可用**；改由 OpenAlex `electrohydrodynamic neural network` 命中 → 有效 6 |
| EHD 对流／热 | `electrohydrodynamic cooling machine learning heat transfer`（OpenAlex） | 8 → 有效 3（含 IJHMT 2024 综述、EHD 泵综述） |
| **第二层有效条目合计** | | **25**（24 条 DOI／arXiv 已验证 + 1 条待核验） |

**第三层（放宽口径）**

| 检索式 | 接口 | 命中／有效 |
|---|---|---|
| `electrohydrodynamic flow reduced order model proper orthogonal decomposition` | OpenAlex | 8 → 有效 4（IJES 模态分解代理、Arch Comput EHD 综述、JPCS EHD 尾流 ROM、ASME IMECE 界面 EHD 模态分解） |
| `all:"electrohydrodynamic" AND all:"reduced order model"` | arXiv | 1 → 0（电对流时空不稳定性，纯数值，无 ROM） |
| `all:"electrohydrodynamic" AND all:"proper orthogonal decomposition"` | arXiv | **0** |
| `electrohydrodynamic instability leaky dielectric simulation` | OpenAlex | 8 → 有效 2（Melcher–Taylor 1969、Castellanos 2003 标度律） |
| `all:"magnetohydrodynamic" AND all:"physics-informed neural network"` | arXiv | 12 → 有效 2（准静态 MHD PINN、太阳日冕 MHD 正反问题） |
| `all:"multiphysics" AND all:"physics-informed neural network" AND all:"Poisson" AND all:"coupling"` | arXiv | 1 → 1（Kronecker 预条件多物理场耦合） |
| `all:"Poisson-Nernst-Planck" AND all:"Navier-Stokes" AND all:"physics-informed"` | arXiv | **0** |
| `electrohydrodynamic flow circular cylindrical conduit`（基准谱系） | Crossref `query.bibliographic` | 4 → 有效 2（ISRN 2012、J. Electrostatics 2014；另 ZAMM 1999 与 Energies 2021 已归入他处） |
| **第三层有效条目合计** | | **12** |

### 5.3 检索方法上的三点教训（供 A／B 路复用）

1. **四重合取必须拆散。** 原查询要求单篇同时满足 PINN 变体 ∧ 燃烧 ∧ EHD ∧ 燃烧-EHD 耦合，而 C 路单独用 `electrohydrodynamic + physics-informed` 一个二重合取就命中 7 条。**交集约束是 C 路 0 命中的直接原因，不是文献不存在。**
2. **arXiv 覆盖不到本领域的主要期刊。** 第一、二层中**过半有效条目只在 OpenAlex／Crossref 出现**（Computers & Fluids 的 NPN 框架、Phys. Fluids 的 Taylor cone 代理模型、IEEE Access 的电晕起晕、Biomim. Intell. Robot. 的 EHD 泵等）。**只查 arXiv 会漏掉 L1-6 这条对第 7 讲最关键的文献。**
3. **OpenAlex 裸 `search` 噪声极大，必须改用 `filter=title_and_abstract.search`。** 对比实测：裸 `search` 查 `ionic wind neural network prediction` 返回神经形态计算硬件综述、锂电池 SOC 估计、风电 BP 网络等**有效 0 条**；同一主题改用 filter 后总数收敛到 6 条（虽仍 0 有效，但至少可直接判否）。而 `electrohydrodynamic neural network` 用 filter 得总数 67 条，前排 10 条中 7 条有效。**建议 A 路直接采用 filter 语法。**
4. **Crossref `query.bibliographic` 不适合做主题发现，只适合验真。** 该接口对 `electrohydrodynamic physics-informed neural network` 返回 8 条**全部为同词根误命中**（TechRxiv 预印本、Stiff-PINN 的 `.s001` 补充材料、若干学位论文）。**其正确用法是拿已知 DOI 走 `/works/<DOI>` 逐条验真**——本次 24 条 DOI 全部以此方式确认。

### 5.4 成稿后的标识符完整性复核（防编造）

为满足 spec §3「**严禁编造 DOI**」与本任务「严禁编造 DOI、arXiv 编号、作者或年份」，本文件写完后做了一次**程序化回扫**：用正则从 `track-C.md` 全文抽出所有 DOI 与 arXiv 编号，逐个回到注册源验真，结果如下。

| 检查项 | 抽取数 | 验真通过 | 未通过 | 说明 |
|---|---|---|---|---|
| DOI（`10.xxxx/...`） | **40** | **40** | 0 | 39 条经 Crossref `/works/<DOI>` 直取通过；1 条 `10.48550/arxiv.2603.23578` 在 Crossref 返回 404，改经 `doi.org` 解析确认有效（HTTP 200，CSL 元数据标题／作者／年份一致），原因见 5.1 表 |
| arXiv 编号（`arXiv:YYMM.NNNNN`） | **19** | **19** | 0 | 单次 `id_list` 批量回查，arXiv API 返回 19 个 entry，与抽取集合**完全一致，无缺失** |

- 19 个编号含 1 条非 C 路产出、仅为交叉引用而出现的 `arXiv:2410.13228`（《From PINNs to PIKANs》，A 路既有文献），同样验真通过。
- **无 DOI 的条目只有 2 条，均已显式标注、未编造**：S18（Sabir 2018，标 `待核验`）、E2（《液压与气动》电液执行器，标 `DOI 未获取（CNKI 收录）`，符合 spec §3 对 CNKI 体系期刊的处理规范）。
- **本次交付的所有作者名、年份、卷期页号均取自 API 返回的元数据字段，非人工记忆填写。**

---

## 六、结论

### 6.1 直接回答：**第一 + 第二层有效命中总数 = 34 条，远 ≥ 8 条。**

| 层级 | 有效命中 | 其中 DOI／arXiv 已验证 | 待核验 |
|---|---|---|---|
| **第一层** PINNs × EHD 直接命中 | **9** | 9 | 0 |
| **第二层** 子领域命中 | **25** | 24 | 1（S18 Sabir 2018，无 DOI） |
| **第一 + 第二层合计** | **34** | **33** | 1 |
| **第三层** 放宽口径（外推依据） | **12** | 12 | 0 |
| **被排除的误匹配** | **6** | 6（DOI 5 条 + CNKI 无 DOI 1 条） | — |

### 6.2 对第 7 讲写法的裁定

**不需要按 spec §7 降级为「方法论迁移推演」。** spec §7 的降级条件是「若三层合计有效命中 < 8 条」——实际第一层单独就有 9 条，第一 + 第二层 34 条，触发条件不成立。

**第 7 讲应按 spec §5 原定方案写成「文献综述 + 完整推导」的混合式**，但须做以下三处口径修正：

1. **§5.5「应用面（按文献可得性排序）」的顺序需要按实测结果重排。** spec 原排序为：离子风／EHD 泵散热 → 电喷雾与 Taylor cone → 介电泳 → 电渗流 → 电流体不稳定性。实测可得性为：
   - **电喷雾／EHD 打印／原子化：9 条（最充足）** — 但全为数据驱动过程建模，无 PDE 求解
   - **EHD 泵／单极圆管流基准：6 条** — 含 ANN 回归与分数阶配点网络
   - **电荷输运／PNP／电动：5 条** — **唯一能直接支撑损失函数设计的一支**
   - **EHD 对流与热管理：2 条**
   - **离子风／电晕：2 条** — 比 spec 预期薄得多，arXiv 侧 `ionic wind` / `ion wind` 命中均为 0
   - **介电泳：0 条（完全空白）** — **必须从应用面列表中降级或删除**
   - **电流体不稳定性（leaky dielectric）：仅 1 条间接命中**（S10 的 leaky-dielectric 模型），arXiv 侧 `leaky dielectric + neural network` 为 0
2. **§5.6「完整推导案例：稳态单极离子风」的选题得到文献支撑，但支撑点不在「离子风」而在「单极 EHD 圆管流」。** 直接可用的前人解法谱系已完整建立：ZAMM 1999 解析 → ISRN 2012 近似解 → *J. Electrostatics* 2014 最小二乘 → S18 2018 NN+GA（待核验）→ S16 2021 神经进化 → S15 2021 单极 EHD 泵流元启发式 → **L1-5 2026 PINN vs FEM**。**建议推导案例直接采用「稳态单极 EHD 圆管离子拖曳流」这一经典基准**，理由：方程可写全、有解析解可对拍、量级差异难点齐全，且 L1-5 已给出 PINN 与 FEM 的对照结论可作预期结果参照。若仍选「离子风」自由场构型，须承认该构型本身**无直接 PINN 文献**，L1-1／L1-2 的二维稳态 EHD 是最接近的替代。
3. **§5.4「PINNs 实现的核心难点」四个难点全部找到直接文献，无需外推：**
   - **三场量级差异** → S22（刚性 PNP：电荷密度前因子造成极端系数比 + 电双层锐利边界层 + spectral bias 与多任务损失失衡）、L1-3（五场统一算子）
   - **方程类型混合 ⇒ 训练竞争** → L1-2（三场强非线性耦合诱发锐利过渡层与多尺度结构，MLP-PINN 过平滑）、S21（自适应损失权重 + 重采样）
   - **强耦合** → T9（NTK 谱半径随耦合强度 $\Omega(\gamma^2)$ 增长，块对角 GN 预条件可界定为与耦合无关；对角预条件器无法恢复该界）、L1-6（NPN 三方程联合无数据训练）
   - **界面与边界条件（电荷注入）** → L1-4（电极附近指数型电荷边界层的数值扩散与畸变）、S25（阴极与涂抹带界面陡梯度的门控架构处理；软硬约束对比）

### 6.3 最有价值的三条（若第 7 讲参考文献需压缩到 8–20 条，优先保留）

1. **L1-6 · Computers & Fluids 2024 · DOI `10.1016/j.compfluid.2024.106421`** — 唯一一篇用 PINN 求解 **Nernst–Planck + Poisson + Navier–Stokes** 完整三场耦合、覆盖电迁移／ICP／电渗流、且**无需标注数据**的文献。与第 7 讲 §5.2 要求写全的方程组**逐一对应**，是「完整推导案例」损失函数设计的唯一直接模板。
2. **S22 · arXiv:2606.04125** — 刚性 PNP 系统的首个 data-free PINN 基准（11 配置 × 4 策略组，FVM 参考解）。摘要中「电荷密度前因子造成极端系数比」「电双层强加锐利边界层」「spectral bias 与多任务损失失衡限制精度」三句，几乎逐句对应第 7 讲 §5.4 的两大核心难点，**是把 EHD 难点从「我认为难」升级为「文献已量化证明难」的关键引证**。
3. **L1-7 · J. Comput. Phys. 2021 · DOI `10.1016/j.jcp.2021.110296`（DeepM&Mnet）** — C 路被引量最高（210）、出自 Karniadakis 团队、以电对列为基准的多物理场神经计算框架。**引用时必须标注它是 DeepONet 算子学习而非残差 PINN**，用于第 4 讲 PI-DeepONet／FNO 与第 7 讲的交叉对照——正因如此它同时具备「最高学术分量」与「最需要口径说明」两个属性。

（替补：**T9 · arXiv:2605.23391** 的多物理场耦合 NTK 理论，是 §5.4「强耦合」论点唯一的定量理论支撑；**L1-2 · arXiv:2603.21227** 的 8 算例 EHD 激波型基准套件，是「预期失败模式」一节的最佳素材。）

### 6.4 遗留风险与未决项

- **S18（Sabir 2018）DOI 未解析出，标记为「待核验」，按 spec §3「严禁编造 DOI」不得写入讲义参考文献。** 如需引用须人工到 DOAJ 取回原始出处。
- **介电泳（DEP）在 ML／PINNs 口径下确认为 0 命中**（arXiv 0 条；OpenAlex filter 总数 72 条但前排全为生物细胞分选方向）。第 7 讲 §5.5 若保留该应用面，须按 spec §5 第 7 讲第 7 点「诚实声明」标注为**无 ML 文献支撑**，或改引 T4（Castellanos 2003 标度律）作非 ML 依据。
- **离子风（ionic wind / ion wind）在 arXiv 侧命中为 0**，仅靠 OpenAlex 拿到 2 条（且其一为非神经网络回归）。**spec §5 把离子风列为第 7 讲应用面第一位，与实测可得性不符**，需按 6.2 第 1 点重排。
- **L1-7 DeepM&Mnet 与 L1-8 GPJet 均非残差式 PINN**（分别为 DeepONet 算子学习、物理信息贝叶斯学习）。第一层 9 条中**严格意义的残差 PINN 求解 EHD 为 7 条**（L1-1 至 L1-6、L1-9）。即便按最严口径，7 条仍 ≥ 8 的判定门槛的 87.5%，且第二层补足后合计远超，**降级条件依然不成立**。
- **Semantic Scholar 全程 429 不可用**，本次未获得其补充覆盖。若后续需要引文扩展（向前／向后引用），建议改用 OpenAlex 的 `cites:W...` / `referenced_works` 字段替代，该接口本次实测稳定可用。
- **Ze Tao / Fujun Liu 团队贡献了第一层 9 条中的 4 条**（L1-1 至 L1-4），且四条为同一研究线的连续产出（LSTM-PINN → 基准套件 → RA-PINN 电热 → RA-PINN 电荷边界层）。**这既是好事（可作第 7 讲的叙事主线，展示一个团队如何逐步攻克 EHD-PINN 的失败模式），也是风险（单一团队、四条均为 2025-12 至 2026-04 的近期预印本、其中 3 条尚无期刊 DOI、被引均为 0–6）。第 7 讲引用时应说明这一集中度，不宜写成「学界共识」。**
