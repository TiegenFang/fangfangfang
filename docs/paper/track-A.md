# A 路文献检索结果：PINNs 方法学与变体谱系

支撑讲次：第 1–5、8 讲
检索日期：本次会话（spec §7 A 路重检索）
检索接口：arXiv API（`export.arxiv.org/api/query`）、Crossref（`api.crossref.org/works`）、OpenAlex（`api.openalex.org/works`）。Semantic Scholar 全程返回 HTTP 429，未取得有效结果。
标识符规范：沿用 spec §3——arXiv 预印本写 `arXiv:YYMM.NNNNN` 不写 DOI；期刊论文优先给 DOI。

> [!WARNING]
> **本次检索推翻了三条在二手文献中广泛流传、但经开放接口回查为假的标识符。** 详见 §3.4「被排除的误匹配」。引用时不要从二手综述抄 arXiv 编号或 DOI，务必回查。

---

## 一、奠基文献（8 条硬性验收）

**命中 8/8。** 其中 7 条取得可核验 DOI 或 arXiv 编号，1 条（Tancik）arXiv 编号已核验、会议卷页已核验但 NeurIPS 记录无 DOI。

---

### [A1] Raissi, Perdikaris & Karniadakis 2019 — PINNs 原始论文

- **标题**：Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations
- **作者**：Maziar Raissi, Paris Perdikaris, George Em Karniadakis
- **年份 / venue**：2019（2019-02），*Journal of Computational Physics*, vol. 378, pp. 686–707
- **标识符**：DOI `10.1016/j.jcp.2018.10.045`
- **验证方式**：Crossref 命中（`query.bibliographic` 检索，返回含 volume=378 / page=686-707 的完整记录，作者串 `Raissi M., Perdikaris P., Karniadakis G.E.`）
- **arXiv 前驱**：`arXiv:1711.10561`（Part I: Data-driven Solutions）与 `arXiv:1711.10566`（Part II: Data-driven Discovery），均经 arXiv `id_list` 回查确认标题、作者、日期（2017-11-28）。**注意两篇预印本的标题与 JCP 正式发表标题不同**，JCP 版是两部分的合并；两个 arXiv 记录均无 `journal_ref` 与 DOI 字段。
- **支撑**：第 1 讲 PINNs 的形式化定义（$\mathcal{N}[u;\lambda]=0$、边界算子、观测数据三要素）与三种使用模式（正问题 / 反问题 / 数据同化）的原始出处；第 2 讲自动微分求残差、总损失结构 $\mathcal{L}=\lambda_r\mathcal{L}_r+\lambda_b\mathcal{L}_b+\lambda_i\mathcal{L}_i+\lambda_d\mathcal{L}_d$ 的原始表述。

---

### [A2] Karniadakis et al. 2021 — Nature Reviews Physics 综述

- **标题**：Physics-informed machine learning
- **作者**：George Em Karniadakis, Ioannis G. Kevrekidis, Lu Lu, Paris Perdikaris, Sifan Wang, Liu Yang
- **年份 / venue**：2021（2021-05-24），*Nature Reviews Physics*, vol. 3, no. 6, pp. 422–440
- **标识符**：DOI `10.1038/s42254-021-00314-5`
- **验证方式**：Crossref 命中（返回 volume=3 / page=422-440）＋ OpenAlex 命中（多次独立 filter 均返回该记录，含 vol 3 iss 6 p 422）
- **支撑**：第 1 讲四类方法定位对比表（FVM/FEM/FDM、纯数据驱动 surrogate、神经算子、PINNs）的权威分类依据；第 4 讲变体谱系骨架；第 5 讲「PINNs 学一个解 vs 神经算子学一族解的算子」这条选型判据的出处。

---

### [A3] Jagtap & Karniadakis 2020 — XPINN（域分解）

- **标题**：Extended Physics-Informed Neural Networks (XPINNs): A Generalized Space-Time Domain Decomposition Based Deep Learning Framework for Nonlinear Partial Differential Equations
- **作者**：Ameya D. Jagtap, George Em Karniadakis
- **年份 / venue**：2020（2020-06），*Communications in Computational Physics* (CiCP)
- **标识符**：DOI `10.4208/cicp.oa-2020-0164`
- **验证方式**：Crossref 命中（`query.bibliographic=Extended physics-informed neural networks XPINNs generalized space-time domain decomposition`，首位返回即该记录，作者串 `D. Jagtap Ameya, Em Karniadakis George`）
- **arXiv**：**未找到。** arXiv 全文检索 `all:"Extended physics-informed neural networks"` 返回 10 条全部为引用该文的后继工作（含 Hu/Jagtap/Karniadakis/Kawaguchi 的 `arXiv:2109.09444`），无原始预印本；对 Jagtap 的 arXiv 作者全量列举（155 篇）亦未出现该文。二手文献流传的 `arXiv:1909.10887` 经 `id_list` 回查为 **Zhao, Zhu, Qiao & Wang 的引力波论文**《Waveform of gravitational waves in the general parity-violating gravities》（Phys. Rev. D 101, 024002），**系假标识符，严禁引用**。
- **支撑**：第 4 讲域分解类变体——子域独立网络 + 界面连续性/残差条件；解决大规模域与并行训练，代价是界面条件引入新超参。第 3 讲大规模域训练的对策。
- **配套警示文献**：Hu, Jagtap, Karniadakis & Kawaguchi, "When Do Extended Physics-Informed Neural Networks (XPINNs) Improve Generalization?", *SIAM Journal on Scientific Computing*, 2022. DOI `10.1137/21m1447039`（Crossref 命中）；arXiv `2109.09444`（id_list 回查确认）。第 4 讲必须引它说明 XPINN **并不总是优于单域 PINN**，避免写成无条件推荐。

---

### [A4] E & Yu 2018 — Deep Ritz（变分 / 能量最小化）

- **标题**：The Deep Ritz Method: A Deep Learning-Based Numerical Algorithm for Solving Variational Problems
- **作者**：Weinan E, Bing Yu
- **年份 / venue**：2018（2018-02-14），*Communications in Mathematics and Statistics*, vol. 6, pp. 1–12
- **标识符**：DOI `10.1007/s40304-018-0127-z`
- **验证方式**：Crossref 命中（返回 volume=6 / page=1-12）＋ arXiv `id_list` 回查 `arXiv:1710.00211`（2017-09-30，标题《The Deep Ritz method: A deep learning-based numerical algorithm for solving variational problems》，作者 Weinan E, Bing Yu，与正式发表标题仅大小写差异）
- **支撑**：第 4 讲弱形式/变分类——把 PDE 转为能量泛函极小化；**仅适用于有变分结构的问题（椭圆型），不适用于一般演化方程**。这条限制是第 4 讲分类图谱的关键判据，不能省略。

---

### [A5] Wang, Yu & Perdikaris 2022 — NTK / 梯度病理视角

- **标题**：When and why PINNs fail to train: A neural tangent kernel perspective
- **作者**：Sifan Wang, Xinling Yu, Paris Perdikaris
- **年份 / venue**：2022（2022-01），*Journal of Computational Physics*, vol. 449, 110768
- **标识符**：DOI `10.1016/j.jcp.2021.110768`；arXiv `2007.14527`（2020-07-28）
- **验证方式**：Crossref 命中（返回 volume=449 / page=110768）＋ arXiv `id_list` 回查 `2007.14527`（标题、三位作者、日期全部对应；摘要明言「derive the NTK of PINNs… remarkable discrepancy in the convergence rate of the different loss components」并提出用 NTK 特征值自适应校准收敛速率的梯度下降算法）
- **arXiv 记录无 `journal_ref` / DOI 字段**，故 DOI 只能由 Crossref 提供——两个接口互为独立验证。
- **支撑**：第 3 讲 NTK 视角的核心出处——$\Theta_{ij}=\langle\nabla_\theta u_\theta(x_i),\nabla_\theta u_\theta(x_j)\rangle$，各损失项对应 NTK 特征值谱失衡 ⇒ 收敛速率差异 ⇒ 某些项欠拟合；对应解法 NTK-based weighting。第 2 讲损失权重方案的理论依据。

---

### [A6] Tancik et al. 2020 — Fourier features / 随机傅里叶特征

- **标题**：Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains
- **作者**：Matthew Tancik, Pratul P. Srinivasan, Ben Mildenhall, Sara Fridovich-Keil, Nithin Raghavan, Utkarsh Singhal, Ravi Ramamoorthi, Jonathan T. Barron, Ren Ng
- **年份 / venue**：2020，*Advances in Neural Information Processing Systems* (NeurIPS) 33, pp. 7537 起
- **标识符**：arXiv `2006.10739`（2020-06-18）。NeurIPS 记录在 OpenAlex 中 **DOI 字段为 None**，arXiv 记录亦无 `journal_ref`；按 spec §3 以 arXiv 编号引用，不补 DOI。
- **验证方式**：arXiv `id_list` 回查 `2006.10739`（标题、九位作者、日期、摘要全部对应；摘要明言「standard MLP fails to learn high frequencies… To overcome this spectral bias, we use a Fourier feature mapping to transform the effective NTK into a stationary kernel with a tunable bandwidth」）＋ OpenAlex 命中两条（arXiv 记录 DOI `10.48550/arxiv.2006.10739`；NeurIPS 记录 vol 33 p 7537、DOI None）
- **支撑**：第 3 讲 spectral bias 的机理出处与 Fourier features / RFF / positional encoding 对策；**直接后果——火焰面、激波、薄边界层是 PINNs 天然弱项**，此处显式前引第 6 讲（$L/\delta_L\sim10^2\!-\!10^3$）。
- **配套（多尺度 PDE 专用）**：Wang, Wang & Perdikaris, "On the eigenvector bias of Fourier feature networks: From regression to solving multi-scale PDEs with physics-informed neural networks", *Computer Methods in Applied Mechanics and Engineering*, 2021. DOI `10.1016/j.cma.2021.113938`；arXiv `2012.10047`（id_list 回查确认，DOI 由 arXiv 元数据自带）。这篇把 Tancik 的 Fourier features 落到多尺度 PINN 上，第 3 讲与第 6 讲都该引。

---

### [A7] McClenny & Braga-Neto 2023 — self-adaptive weights / SA-PINN

- **标题**：Self-Adaptive Physics-Informed Neural Networks using a Soft Attention Mechanism
- **作者**：Levi McClenny, Ulisses Braga-Neto
- **年份 / venue**：2023，*Journal of Computational Physics*, vol. 474, 111722
- **标识符**：DOI `10.1016/j.jcp.2022.111722`；arXiv `2009.04544`（2020-09-07，v5 更新至 2024-06-18）
- **验证方式**：arXiv `id_list` 回查 `2009.04544`——**arXiv 元数据自带 `journal_ref`「Journal of Computational Physics (2023), Vol. 474, 111722」与 `doi`「10.1016/j.jcp.2022.111722」**，标题与两位作者完全对应。这是本次 8 条中验证强度最高的一条（单一接口即同时给出编号、卷期、页码、DOI）。
- **支撑**：第 2 讲损失权重方案（固定 $\lambda$ vs 自适应）的自适应分支；第 3 讲多目标梯度冲突（$\nabla_\theta\mathcal{L}_r$ 与 $\nabla_\theta\mathcal{L}_b$ 量级差数个数量级 ⇒ 边界条件被牺牲）的逐点自适应对策。

---

### [A8] Krishnapriyan et al. 2021 — causal training / 时间推进式训练

- **标题**：Characterizing possible failure modes in physics-informed neural networks
- **作者**：Aditi S. Krishnapriyan, Amir Gholami, Shandian Zhe, Robert M. Kirby, Michael W. Mahoney
- **年份 / venue**：2021，*NeurIPS 2021*（arXiv `journal_ref` 字段即为「NeurIPS 2021」）
- **标识符**：arXiv `2109.01050`（2021-09-02，v2）。arXiv 记录无 DOI 字段，按 spec §3 以 arXiv 编号引用。
- **验证方式**：arXiv `id_list` 回查 `2109.01050`（标题、五位作者、日期、`journal_ref=NeurIPS 2021` 全部对应；摘要明言「not due to the lack of expressivity in the NN architecture, but that the PINN's setup makes the loss landscape very hard to optimize」并提出两条对策：curriculum regularization 与 sequence-to-sequence 时间推进式训练，实测误差降低 1–2 个数量级）
- **支撑**：第 3 讲因果性违背与时间推进失败——全域同时拟合时间依赖问题时，网络可能在早期时间未收敛时就「猜」后期解；对策 causal training / 时间推进式训练 / 课程学习。**该文也是「PINN 失败不是表达能力不足而是损失景观难优化」这一论断的出处，第 5 讲「无收敛性理论保证」一节应引。**
- **配套（因果损失的正式化）**：Wang, Sankaran & Perdikaris, "Respecting causality is all you need for training physics-informed neural networks", 2022. arXiv `2203.07404`（id_list 回查确认；OpenAlex 命中两条，DOI 仅 `10.48550/arxiv.2203.07404`，无期刊 DOI）。指数加权因果损失 $\mathcal{L}=\sum_n w_n\mathcal{L}_n$、$w_n=\exp(-\epsilon\sum_{m<n}\mathcal{L}_m)$ 的完整推导在这篇；第 3 讲讲 causal training 时两篇应并引。

---

## 二、变体与技巧

> 编号 `[An]` 是**稳定标识符而非顺序号**。`[A31]`（fPINN）为后补条目，按主题插在 §2.3 的 `[A16]` 与 `[A17]` 之间；后续如有增补继续沿用新号，不重排既有编号，以免已写就的讲义引用失效。

### 2.1 域分解类

#### [A9] cPINN — 守恒律域分解（已核验）

- **标题**：Conservative physics-informed neural networks on discrete domains for conservation laws: Applications to forward and inverse problems
- **作者**：Ameya D. Jagtap, Ehsan Kharazmi, George Em Karniadakis
- **年份 / venue**：2020，*Computer Methods in Applied Mechanics and Engineering*
- **标识符**：DOI `10.1016/j.cma.2020.113028`（OpenAlex ID `W3015865829`）
- **验证方式**：OpenAlex 命中（`filter=title.search:...`，唯一命中即该文，DOI / 年份 / venue / 三位作者全部对应）
- **支撑**：第 4 讲域分解类——面向守恒律，界面处强制通量守恒；适合激波与间断。第 6 讲燃烧（组分输运 $\partial(\rho Y_k)/\partial t+\nabla\cdot(\rho Y_k\mathbf{u})=-\nabla\cdot\mathbf{J}_k+\dot\omega_k$ 是守恒律形式）与第 7 讲 EHD 电荷守恒均可引。

#### [A10] dPINN — 时间域分解（**待核验，未命中**）

- **状态**：**三个开放接口均未找到 Jagtap/Karniadakis 的「dPINN（时间方向域分解）」原始论文。**
- **检索过程**：arXiv `all:"dPINN"`（6 条命中，无一为 Jagtap）、`all:"dynamic physics-informed neural networks"`（5 条，全部为电力/结构/CFD 应用，非该文）、Jagtap 作者全量列举 155 篇逐条筛查（无匹配）；Crossref `query.bibliographic=dPINN dynamic physics-informed neural networks`（返回 SSRN 预印本与 DPINN 去噪论文，无匹配）；OpenAlex `title.search:dPINNs`（仅 3 条，见下）；Semantic Scholar 429。
- **原因判断**：该文可能仅以非索引形式流通（技术报告 / 会议摘要），或其正式标题不含「dPINN」字样。不做猜测。
- **必须避免的误引**：OpenAlex 唯一的 `dPINNs` 标题命中是 Ramezani, Mohammadi & Mokhtari 2025, "dPINNs: A physics-informed framework for forward and inverse problems governed by distributed-order derivatives", *Engineering Analysis with Boundary Elements*, vol. 179, 106418, DOI `10.1016/j.enganabound.2025.106418`（OpenAlex 命中）。**该文 d = distributed-order（分布阶导数），不是 dynamic（时间域分解），缩写同名而含义完全不同，严禁当作 dPINN 引用。**
- **已核验的替代文献（第 4 讲「时间方向域分解 / 长时间积分」论点可用这三条支撑）**：
  1. Wang, Sankaran & Perdikaris 2022, arXiv `2203.07404` — 自回归式因果时间推进（见 [A8] 配套）。
  2. Wang & Perdikaris 2023, "Long-time integration of parametric evolution equations with physics-informed DeepONets", *Journal of Computational Physics*, vol. 475, 111855. DOI `10.1016/j.jcp.2022.111855`（OpenAlex 命中）；arXiv `2106.05384`（id_list 回查确认）。
  3. Krishnapriyan et al. 2021, arXiv `2109.01050` — sequence-to-sequence 时间推进（见 [A8]）。
- **对第 4 讲的处置建议**：若保留 dPINN 条目，须标注「原始文献待核验」并以「时间方向域分解、逐段推进」的通用描述行文，出处挂上述三条已核验文献；不得给出未经核验的 arXiv 编号或 DOI。

#### [A11] 域分解配套（已核验，arXiv id_list）

- Shukla, Jagtap & Karniadakis, "Parallel Physics-Informed Neural Networks via Domain Decomposition", arXiv `2104.10013`（2021-04-20，v3）。→ 第 4 讲 XPINN 的并行实现细节与第 8 讲多 GPU。
- Hu, Jagtap, Karniadakis & Kawaguchi, "Augmented Physics-Informed Neural Networks (APINNs): A gating network-based soft domain decomposition methodology", arXiv `2211.08939`（2022-11-16，v3）。→ 第 4 讲软域分解，与 XPINN 硬界面条件对照。
- Howard, Jacob, Helfert, Heinlein & Stonis 系的 Finite basis 域分解见 §2.3 [A20]。

---

### 2.2 弱形式 / 变分类

#### [A12] VPINN — 变分形式 + 测试函数（已核验）

- **标题**：Variational Physics-Informed Neural Networks For Solving Partial Differential Equations
- **作者**：Ehsan Kharazmi, Zhongqiang Zhang, George Em Karniadakis
- **年份**：2019（arXiv 2019-11-27）
- **标识符**：arXiv `1912.00873`（v1）。arXiv 记录无 `journal_ref` 与 DOI ⇒ **arXiv-only 预印本**，按 spec §3 以 arXiv 编号引用，不补 DOI。
- **验证方式**：arXiv `id_list` 回查 `1912.00873`（标题、三位作者、日期、comment「24 pages, 12 figures」全部对应）
- **支撑**：第 4 讲弱形式类——变分形式 + 测试函数，**降低对高阶导数的依赖**（这是 VPINN 相对强形式 PINN 的核心优势，直接关系第 2 讲「二阶导计算图膨胀与成本」）。
- **扩展版（有 DOI，建议并引）**：hp-VPINNs — Kharazmi, Zhang & Karniadakis, "hp-VPINNs: Variational Physics-Informed Neural Networks With Domain Decomposition", arXiv `2003.05385`，DOI `10.1016/j.cma.2020.113547`（*CMAME*, 2020）。验证：arXiv `id_list` 回查，DOI 由 arXiv 元数据自带。这篇同时是「变分 + 域分解」的交叉点，第 4 讲分类图谱里应标出。
- **配套（Dirichlet 硬约束在 VPINN 中的实现）**：Berrone, Canuto, Pintore & Sukumar, "Enforcing Dirichlet boundary conditions in physics-informed neural networks and variational physics-informed neural networks", *Heliyon*, 2023. DOI `10.1016/j.heliyon.2023.e18820`（Crossref 命中）。→ 同时服务 §2.6 硬约束条目。

#### [A13] wPINN — 弱解 / 激波 / 熵解（已核验）

- **标题**：wPINNs: Weak Physics Informed Neural Networks for Approximating Entropy Solutions of Hyperbolic Conservation Laws
- **作者**：Tim De Ryck, Siddhartha Mishra, Roberto Molinaro
- **年份 / venue**：2024（2024-03-14），*SIAM Journal on Numerical Analysis*, vol. 62, pp. 811–841
- **标识符**：DOI `10.1137/22m1522504`；arXiv `2207.08483`（2022-07-18）
- **验证方式**：Crossref 命中（返回 volume=62 / page=811-841，作者串 `De Ryck Tim, Mishra Siddhartha, Molinaro Roberto`）＋ arXiv `id_list` 回查 `2207.08483`（标题、三位作者、日期对应）
- **支撑**：第 4 讲弱形式类——弱解形式，专门处理守恒律与激波（熵解）。第 3 讲 spectral bias 直接后果之一（激波是 PINN 天然弱项）的专用解法。第 6 讲燃烧若涉及可压缩流/爆震（RDE 流场重建）应引。
- **配套理论**：De Ryck & Mishra, "Error analysis for physics-informed neural networks (PINNs) approximating Kolmogorov PDEs", *Advances in Computational Mathematics*, vol. 48, 2022. DOI `10.1007/s10444-022-09985-9`（Crossref 命中）。→ 第 5 讲「无收敛性理论保证」需要 nuanced 处理：确有误差分析结果，但条件强、与实践精度差距大。

---

### 2.3 架构替换类（神经算子 / KAN）

#### [A14] DeepONet 基础论文（已核验）

- **标题**：Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators
- **作者**：Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, George Em Karniadakis
- **年份 / venue**：2021，*Nature Machine Intelligence*
- **标识符**：DOI `10.1038/s42256-021-00302-5`
- **验证方式**：OpenAlex 命中（`filter=title.search:...`，唯一命中即该文，五位作者全部对应）
- **支撑**：第 1 讲四类方法对比表中「神经算子」一列的原始出处；第 4 讲架构替换类；第 5 讲判据「需要多工况快速评估 ⇒ 用神经算子，不要用 PINNs」。

#### [A15] PI-DeepONet（已核验，三条独立文献）

1. **Wang, Wang & Perdikaris 2021** — "Learning the solution operator of parametric partial differential equations with physics-informed DeepONets", *Science Advances*, vol. 7, eabi8605. DOI `10.1126/sciadv.abi8605`（OpenAlex 命中，两次独立检索均返回）；arXiv `2103.10974`（id_list 回查确认，2021-03-19，comment「33 pages, 28 figures, 8 tables」）。
2. **Wang & Perdikaris 2023** — "Long-time integration of parametric evolution equations with physics-informed DeepONets", *Journal of Computational Physics*, vol. 475, 111855. DOI `10.1016/j.jcp.2022.111855`（OpenAlex 命中）；arXiv `2106.05384`（id_list 回查确认）。→ 这条同时充当 [A10] dPINN 的替代文献。
3. **Goswami, Bora, Yu & Karniadakis 2022** — "Physics-Informed Deep Neural Operator Networks", arXiv `2207.05748`（id_list 回查确认，2022-07-08，v2）；正式发表版 DOI `10.1007/978-3-031-36644-4_6`（*Computational Methods in Engineering & the Sciences*, 2023；OpenAlex 命中）。

- **支撑**：第 4 讲架构替换类——学习解算子而非单个解，支持多工况快速评估，**与 PINNs 是互补而非替代**；第 1 讲「PINNs 学一个解、神经算子学一族解的算子」的关键区分。第 6 讲 DeepONet 加速燃烧化学走这条线。
- **配套（刚性化学）**：Goswami, Jagtap, Babaee, Susi, Karniadakis et al., "Learning stiff chemical kinetics using extended deep neural operators", arXiv `2302.12645`（id_list 回查确认，2023-02-03）。→ 第 6 讲刚性源项对策的算子学习路线。

> [!WARNING]
> **`arXiv:2003.03485` 不是 PI-DeepONet。** 经 arXiv `id_list` 回查，该编号实为 Li, Kovachki, Azizzadenesheli, Liu, Bhattacharya, Stuart & Anandkumar 的《Neural Operator: Graph Kernel Network for Partial Differential Equations》（2020-03-07），是 FNO 的前驱工作。二手文献常把它误标为 PI-DeepONet，**严禁沿用**。

#### [A16] FNO — Fourier Neural Operator（已核验）

- **标题**：Fourier Neural Operator for Parametric Partial Differential Equations
- **作者**：Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, Anima Anandkumar
- **年份 / venue**：2020（arXiv 2020-10-18，v3），ICLR 2021
- **标识符**：arXiv `2010.08895`
- **验证方式**：arXiv `id_list` 回查 `2010.08895`（标题、七位作者、日期对应）；OpenAlex 检索返回 CaltechAUTHORS 机构库记录，**DOI 字段为 None**（ICLR 会议论文无注册 DOI）⇒ 按 spec §3 以 arXiv 编号引用，不补 DOI。
- **支撑**：第 1 讲四类方法对比表「神经算子」列；第 4 讲架构替换类；第 5 讲多工况快速评估判据。
- **配套（物理信息神经算子）**：Li, Zheng, Kovachki, Jin, Chen, Liu et al., "Physics-Informed Neural Operator for Learning Partial Differential Equations" (PINO), arXiv `2111.03794`，DOI `10.1145/3648506`（*ACM/IMS Journal of Data Science*, 2024；OpenAlex 命中两条）。→ 第 4 讲「PINN 与神经算子融合」这条支线。

#### [A31] fPINN — 分数阶导数（已核验）

- **标题**：fPINNs: Fractional Physics-Informed Neural Networks
- **作者**：Guofei Pang, Lu Lu, George Em Karniadakis
- **年份 / venue**：2019，*SIAM Journal on Scientific Computing*（arXiv 2018-11-20，comment「29 pages, 15 figures, 5 tables」）
- **标识符**：DOI `10.1137/18M1229845`；arXiv `1811.08967`
- **验证方式**：arXiv `id_list` 回查 `1811.08967`——**DOI 由 arXiv 元数据自带**，标题与三位作者完全对应；另经 arXiv `ti:"fPINNs"` 检索首位命中同记录（两次独立调用一致）
- **支撑**：第 4 讲架构替换类——分数阶导数。分数阶算子的非局部性是它与 fPINN 的核心难点，也是第 3 讲 spectral bias 讨论的一个反例场景（非局部核对高频的处理方式不同于整数阶）。
- **配套（非局部算子的另一分支）**：Pang, D'Elia, Parks & Karniadakis, "nPINNs: Nonlocal physics-informed neural networks for a parametrized nonlocal universal Laplacian operator", *JCP*, vol. 422, 109760, 2020, DOI `10.1016/j.jcp.2020.109760`（OpenAlex 命中）——见 §2.8 表。第 4 讲分类图谱中 fPINN 与 nPINN 应并列在「非局部 / 分数阶」一支，不要混为一谈。

#### [A17] PIKAN（已核验，与现有 JSON item 46 一致）

- **标题**：From PINNs to PIKANs: Recent Advances in Physics-Informed Machine Learning
- **作者**：Juan Diego Toscano, Vivek Oommen, Alan John Varghese, Zongren Zou, Nazanin Ahmadi Daryakenari, Chenxi Wu, George Em Karniadakis
- **年份**：2024（2024-10-17，v2）
- **标识符**：arXiv `2410.13228`
- **验证方式**：arXiv `id_list` 回查 `2410.13228`（标题、七位作者、日期、comment 关键词串「physics-informed neural networks, Kolmogorov-Arnold networks, optimization algorithms, separable PINNs, self-adaptive weights, uncertainty quantification」全部对应）。与 `docs/paper/papers_1788510570245.json` item 46 的 `url=https://doi.org/10.48550/arXiv.2410.13228` 交叉一致。
- **支撑**：第 4 讲架构替换类（KAN 替换 MLP）＋**可作为全课程第 1–5 讲的骨架性综述**（spec §5 第 4 讲已指定此用途）。其 comment 关键词串本身就覆盖了本课程第 2–4 讲的主要技巧条目，可用作变体谱系的交叉核对清单。

#### [A18] MLP vs KAN 公平对比（已核验）

- **标题**：A comprehensive and FAIR comparison between MLP and KAN representations for differential equations and operator networks
- **作者**：Khemraj Shukla, Juan Diego Toscano, Zhicheng Wang, Zongren Zou, George Em Karniadakis
- **年份 / venue**：2024，*Computer Methods in Applied Mechanics and Engineering*, vol. 431, 117290
- **标识符**：DOI `10.1016/j.cma.2024.117290`；arXiv `2406.02917`
- **验证方式**：OpenAlex 命中（`filter=title.search:comprehensive and fair comparison`，返回 CMAME 记录 vol 431 p 117290 与 arXiv 记录两条）
- **支撑**：第 4 讲 PIKAN 条目**必须配这条**——否则会把 KAN 写成无条件优于 MLP。第 5 讲「超参与采样敏感、可复现性差」的量化旁证。

#### [A19] 分离式与有限基 KAN（已核验，arXiv id_list）

- Jacob, Howard, Helfert, Heinlein & Stinis, "Finite basis Kolmogorov-Arnold networks: domain decomposition for data-driven and physics-informed problems", arXiv `2406.19662`（2024-06-28，v2）。→ KAN 版域分解，与 XPINN/cPINN 平行。
- Rigas, Papachristou, Papadopoulos, Anagnostopoulos & Alexandridis, "Adaptive Training of Grid-Dependent Physics-Informed Kolmogorov-Arnold Networks", arXiv `2407.17611`，DOI `10.1109/ACCESS.2024.3504962`（*IEEE Access*, vol. 12, pp. 176982–176998, 2024；DOI 由 arXiv 元数据自带）。→ 第 8 讲配点采样策略在 KAN 上的对应物。

#### [A20] 其他架构替换旁证（已核验，arXiv id_list）

- Dwivedi, Parashar & Srinivasan, "Distributed physics informed neural network for data-efficient solution to partial differential equations", arXiv `1907.08967`（2019-07-21）；正式版 *Neurocomputing*, vol. 420, pp. 299–316, DOI `10.1016/j.neucom.2020.09.006`（DOI 由 arXiv 元数据自带，OpenAlex 亦命中）。→ 第 4 讲域分解类的另一独立分支。

---

### 2.4 不确定性量化类

#### [A21] B-PINN 奠基论文（已核验）

- **标题**：B-PINNs: Bayesian Physics-Informed Neural Networks for Forward and Inverse PDE Problems with Noisy Data
- **作者**：Liu Yang, Xuhui Meng, George Em Karniadakis（arXiv comment 注明前两位同等贡献）
- **年份 / venue**：2020，*Journal of Computational Physics*, vol. 425, 109913
- **标识符**：DOI `10.1016/j.jcp.2020.109913`；arXiv `2003.06097`（2020-03-13）
- **验证方式**：arXiv `id_list` 回查 `2003.06097`（DOI 由 arXiv 元数据自带）＋ OpenAlex 命中（JCP 2020 按 ISSN 0021-9991 过滤的独立检索返回同记录，vol 425 p 109913）
- **支撑**：第 4 讲不确定性量化类——HMC 或 VI 得后验。第 5 讲「PINNs 单次训练的解不是唯一解，多种子方差必须报告」与第 8 讲「跨随机种子的均值与方差必须报告」的方法学依据。
- **与现有 JSON 的关系（重要更正）**：`papers_1788510570245.json` item 9 的「B-PINN」实为 Dabrowski et al., "Bayesian Physics Informed Neural Networks for Data Assimilation and Spatio-Temporal Modelling of Wildfires", arXiv `2212.00970`（*Spatial Statistics*, 2022）——**这是一篇贝叶斯 PINN 的应用论文，不是 B-PINN 奠基论文**。spec §7 把 item 9 记为 A 路仅有的 2 条可用文献之一，就奠基性而言不成立，本条 [A21] 为补正。

#### [A22] 全不确定性量化（已核验）

- **标题**：Quantifying total uncertainty in physics-informed neural networks for solving forward and inverse stochastic problems
- **作者**：Dongkun Zhang, Lu Lu, Ling Guo, George Em Karniadakis
- **年份 / venue**：2019（2019-11），*Journal of Computational Physics*, vol. 397, 108850
- **标识符**：DOI `10.1016/j.jcp.2019.07.048`
- **验证方式**：Crossref 命中（返回 volume=397 / page=108850，四位作者全部对应）
- **支撑**：第 4 讲 UQ 类——区分「参数不确定性」与「模型/解的非唯一性」两种来源；第 5 讲可复现性差条目的理论出处。

#### [A23] 贝叶斯 PINN 实战（已核验）

- Linka, Schäfer, Meng, Zou, Karniadakis & Kuhl, "Bayesian Physics Informed Neural Networks for real-world nonlinear dynamical systems", *Computer Methods in Applied Mechanics and Engineering*, vol. 402, 115346, 2022. DOI `10.1016/j.cma.2022.115346`（OpenAlex 命中）。→ 第 4 讲 UQ 类的真实系统案例，可作第 5 讲「多次运行方差」的实证支撑。

---

### 2.5 多保真度类

#### [A24] 复合神经网络 / multi-fidelity PINN（已核验）

- **标题**：A composite neural network that learns from multi-fidelity data: Application to function approximation and inverse PDE problems
- **作者**：Xuhui Meng, George Em Karniadakis
- **年份 / venue**：2019（arXiv 2019-02-26），*Journal of Computational Physics*
- **标识符**：DOI `10.1016/j.jcp.2019.109020`；arXiv `1903.00104`
- **验证方式**：arXiv `id_list` 回查 `1903.00104`（DOI 由 arXiv 元数据自带）
- **支撑**：第 4 讲多保真度类——融合低保真模型输出与少量高保真数据；第 5 讲优势条目「稀疏、异构、多源数据融合」的实现路径。
- **配套（多保真 + 反问题）**：Jagtap, Mitsotakis & Karniadakis, "Deep learning of inverse water waves problems using multi-fidelity data: Application to Serre-Green-Naghdi equations", arXiv `2202.02899`（id_list 回查确认，2022-02-07）。→ 第 5 讲数据同化判据。

---

### 2.6 训练技巧：硬约束、自适应加权、采样、优化器

#### [A25] 硬约束试函数 / hard boundary constraint（已核验，三条；一条待核验）

1. **Lu, Pestourie, Yao, Wang, Verdugo & Johnson 2021** — "Physics-informed neural networks with hard constraints for inverse design", arXiv `2102.04626`（2021-02-09）。验证：arXiv `id_list` 回查（六位作者全部对应）。arXiv 记录无 `journal_ref`/DOI ⇒ 按 spec §3 以 arXiv 编号引用。→ 第 2 讲硬约束试函数 $u_\theta=g(x)+\ell(x)\hat N(x;\theta)$ 的规范实现与逆向设计场景。
2. **Berg & Nyström 2018** — "A unified deep artificial neural network approach to partial differential equations in complex geometries", *Neurocomputing*, vol. 317, pp. 28–41. DOI `10.1016/j.neucom.2018.06.056`。验证：OpenAlex 命中（vol 317 p 28，两位作者对应）。→ 第 2 讲「高维与复杂几何下硬约束构造的困难」这条论点的出处。
3. **Berrone, Canuto, Pintore & Sukumar 2023** — "Enforcing Dirichlet boundary conditions in physics-informed neural networks and variational physics-informed neural networks", *Heliyon*, 2023. DOI `10.1016/j.heliyon.2023.e18820`。验证：Crossref 命中。→ 第 2 讲 1D Dirichlet 与 Neumann 的具体 $\ell$ 构造；同时覆盖 PINN 与 VPINN 两套框架，与 [A12] 呼应。
4. **McFall & Ben-Nym 2017** — "Constrained deep learning using boundary kernelization - Training artificial neural networks for Dirichlet boundary problems in arbitrary domains", *Neurocomputing*：**待核验。** OpenAlex `search=` 与 `title.search=` 均未命中（返回 Litjens 医学影像综述等无关文献），Crossref 本次会话持续 429，Semantic Scholar 429。**不猜 DOI。** 第 2 讲如需引「硬约束的最早系统化工作」，用上述 1–3 条已核验文献即可，McFall 条目标「待核验」或直接省略。

#### [A26] RAR / 残差自适应采样（原始文献待核验，三条替代已核验）

- **原始文献状态**：Lu, Jin, Pang, Zhang & Karniadakis, "Learning physics-informed deep models for PDEs"（提出 RAR 与 RAR-D，一般记为 *JCP* 2020）——**待核验，未命中。** arXiv `ti:` 与 `all:` 检索均 0 命中；OpenAlex `title.search:physics-informed deep models` + `publication_year:2020`（count=4）、`title.search:learning physics-informed deep models` + 2020（count=4）、按 JCP ISSN 0021-9991 + 2020 + `title.search:physics-informed`（count=7）与 `title.search:deep models`（count=4）四种过滤组合逐条筛查，均无该文；Crossref 多次 429，唯一成功的一次返回无关文献。
  > [!WARNING]
  > **流传的 DOI `10.1016/j.jcp.2020.109672` 经 OpenAlex DOI 精确探针回查为假**：该 DOI 实为 Han, Nica & Stinchcombe, "A derivative-free method for solving elliptic partial differential equations with deep neural networks", *JCP* vol. 419, 109672, 2020。**严禁引用该 DOI 作为 RAR 出处。**
- **已核验替代（第 3 讲「采样不足 ⇒ 假收敛」与第 8 讲采样策略表用这三条足够）**：
  1. **Wu, Zhu, Tan, Kartha & Lu 2023** — "A comprehensive study of non-adaptive and residual-based adaptive sampling for physics-informed neural networks", *Computer Methods in Applied Mechanics and Engineering*, vol. 403, 115671. DOI `10.1016/j.cma.2022.115671`。验证：OpenAlex 命中（两次独立 filter 返回同记录）。→ 第 8 讲「均匀 / LHS / 边界加密 / RAR / RAR-D / 残差自适应」对比表的直接依据，且作者含 Lu Lu，与 RAR 原始工作同源。
  2. **Mao & Meng 2023** — "Physics-informed neural networks with residual/gradient-based adaptive sampling methods for solving partial differential equations with sharp solutions", *Applied Mathematics and Mechanics*, vol. 44, p. 1069. DOI `10.1007/s10483-023-2994-7`。验证：OpenAlex 命中。→ 第 3 讲「锐利结构是 PINN 天然弱项」+ 第 6 讲火焰面区域加密的直接出处。
  3. **Qin, Li, Xu & Dong 2022** — "RAR-PINN algorithm for the data-driven vector-soliton solutions and parameter discovery of coupled nonlinear equations", *Physica D*. DOI `10.1016/j.physd.2022.133562`；arXiv `2205.10230`（id_list 回查确认，DOI 由 arXiv 元数据自带）。→ RAR 的具名算法化实现。

#### [A27] 学习率退火 + L-BFGS 两段式 / 梯度病理缓解（已核验）

- **标题**：Understanding and Mitigating Gradient Flow Pathologies in Physics-Informed Neural Networks
- **作者**：Sifan Wang, Yujun Teng, Paris Perdikaris
- **年份 / venue**：2021（2021-01），*SIAM Journal on Scientific Computing*, vol. 43, no. 5, pp. A3055–A3081
- **标识符**：DOI `10.1137/20m1318043`；arXiv `2001.04536`（2020-01-13）
- **验证方式**：Crossref 命中（返回 volume=43 / page=A3055-A3081，三位作者对应）＋ arXiv `id_list` 回查 `2001.04536`
- **支撑**：第 2 讲优化器两段式惯例（Adam 粗调 → L-BFGS 精调）及其原因；第 3 讲多目标梯度冲突的**学习率平衡（LRB）/ 反向传播学习率（BPT）**对策；第 8 讲「优化实践」小节的 Adam → L-BFGS 与学习率调度（cosine / exponential decay / ReduceLROnPlateau）。**这是第 2、3、8 三讲共用的核心技巧文献。**

#### [A28] 自适应激活函数（已核验，两条）

1. Jagtap & Karniadakis, "Adaptive activation functions accelerate convergence in deep and physics-informed neural networks", *Journal of Computational Physics*, 2019. DOI `10.1016/j.jcp.2019.109136`；arXiv `1906.01170`（id_list 回查确认，DOI 由 arXiv 元数据自带；OpenAlex 亦命中）。
2. Jagtap, Kawaguchi & Karniadakis, "Locally adaptive activation functions with slope recovery term for deep and physics-informed neural networks", arXiv `1909.12228`（id_list 回查确认，2019-09-25，v4）。
- **支撑**：第 2 讲网络构造与第 3 讲收敛加速对策；与 [A27] 的 LRB 并列为两条「不改损失权重、改优化动力学」的路线。

#### [A29] 训练实践指南（已核验）

- Wang, Sankaran, Wang & Perdikaris, "An Expert's Guide to Training Physics-informed Neural Networks", arXiv `2308.08468`（2023-08-16）。验证：arXiv `id_list` 回查（四位作者对应）。→ **第 8 讲的主干实践文献**：权重初始化、学习率调度、迭代数量级、早停判据、残差场可视化。

#### [A30] 梯度增强 PINN（已核验）

- Yu, Lu, Meng & Karniadakis, "Gradient-enhanced physics-informed neural networks for forward and inverse PDE problems", *Computer Methods in Applied Mechanics and Engineering*, 2022. DOI `10.1016/j.cma.2022.114823`；arXiv `2111.02801`（id_list 回查确认，DOI 由 arXiv 元数据自带）。→ 第 2 讲「自动微分给出全场导数量」优势条目的强化版；第 5 讲优势清单。

---

### 2.7 工程库与基准（第 8 讲）

| 库 / 基准 | 文献 | 标识符 | 验证方式 |
|---|---|---|---|
| DeepXDE | Lu, Meng, Mao & Karniadakis, "DeepXDE: A deep learning library for solving differential equations", *SIAM Review* | DOI `10.1137/19M1274067`；arXiv `1907.04502` | arXiv `id_list` 回查（DOI 由 arXiv 元数据自带） |
| PINNacle | Hao, Yao, Su, Su, Wang, Lu, Xia, Zhang, Liu, Lu & Zhu, "PINNacle: A Comprehensive Benchmark of Physics-Informed Neural Networks for Solving PDEs", NeurIPS 2024 | arXiv `2306.08827`；DOI `10.52202/079017-2442` | arXiv `id_list` 回查（11 位作者全部对应）＋ Crossref 命中（*Advances in Neural Information Processing Systems*, 2024） |
| NeuroDiffEq | Chen, Sondak, Protopapas, Mattheakis, Liu & Agarwal, "NeuroDiffEq: A Python package for solving differential equations with neural networks", *JOSS*, vol. 5, 1931, 2020 | DOI `10.21105/joss.01931` | OpenAlex 命中（另返回 Zenodo DOI `10.5281/zenodo.3674095`） |
| NeuroDiffEq 近况 | Liu, Protopapas, Sondak & Chen, "Recent Advances of NeuroDiffEq — An Open-Source Library for Physics-Informed Neural Networks", 2025 | arXiv `2502.12177` | OpenAlex 命中（DOI `10.48550/arxiv.2502.12177`） |
| SciANN | Haghighat & Juanes, "SciANN: A Keras/TensorFlow wrapper for scientific computations and physics-informed deep learning using artificial neural networks", *CMAME*, vol. 373, 113552, 2020 | DOI `10.1016/j.cma.2020.113552` | OpenAlex 命中 |
| IDRLnet | Peng, Zhang, Zhou, Zhao, Yao & Chen, "IDRLnet: A Physics-Informed Neural Network Library", 2021 | arXiv `2107.04320` | OpenAlex 命中（DOI `10.48550/arxiv.2107.04320`） |
| NVIDIA Modulus | **未找到可引用的同行评议论文** | — | OpenAlex / Crossref / arXiv 均无命中。第 8 讲库对比表中 Modulus 行的出处只能挂官方软件文档，**不得编造论文 DOI**；建议标注「无正式论文，引官方文档」。 |

---

### 2.8 综述与旁证（第 1、5 讲）

| 文献 | 标识符 | 验证方式 | 支撑 |
|---|---|---|---|
| Cuomo, Schiano Di Cola, Giampaolo, Rozza, Raissi & Piccialli, "Scientific Machine Learning Through Physics-Informed Neural Networks: Where we are and What's Next", *Journal of Scientific Computing*, vol. 92, 2022 | DOI `10.1007/s10915-022-01939-z` | OpenAlex 命中（多次独立检索） | 第 1 讲方法定位；第 5 讲优缺点清单的第三方旁证 |
| Cai, Mao, Wang, Yin & Karniadakis, "Physics-informed neural networks (PINNs) for fluid mechanics: a review", *Acta Mechanica Sinica*, vol. 37, p. 1727, 2021 | DOI `10.1007/s10409-021-01148-1` | OpenAlex 命中 | 第 4 讲变体谱系的流体力学视角；第 6、7 讲应用地图的接口 |
| Hao, Liu, Zhang, Ying, Feng et al., "Physics-Informed Machine Learning: A Survey on Problems, Methods and Applications", 2022 | arXiv `2211.08064` | arXiv `id_list` 回查 | 第 1 讲与 [A2]、[A17] 互为三角的第三条综述骨架 |
| Lu, Meng, Cai, Mao, Goswami, Zhang et al., "A comprehensive and fair comparison of two neural operators (with practical extensions) based on FAIR data", *CMAME*, vol. 393, 114778, 2022 | DOI `10.1016/j.cma.2022.114778` | Crossref 命中 ＋ OpenAlex 命中（两条） | **第 1 讲与第 5 讲「PINNs vs 神经算子」选型判据的关键实证**：多工况评估该用算子而非 PINNs |
| Sirignano & Spiliopoulos, "DGM: A deep learning algorithm for solving partial differential equations", *JCP*, vol. 375, p. 1339, 2018 | DOI `10.1016/j.jcp.2018.08.029` | OpenAlex 命中 | 第 1 讲四类方法对比表中「无网格深度求解器」的历史前驱；第 4 讲非变分类的对照架构 |
| Haghighat, Raissi, Moure, Gómez & Juanes, "A physics-informed deep learning framework for inversion and surrogate modeling in solid mechanics", *CMAME*, vol. 379, 113741, 2021 | DOI `10.1016/j.cma.2021.113741` | OpenAlex 命中 | 第 5 讲「何时该用 PINNs」判据中反问题/参数辨识一条的实证 |
| Jin, Cai, Li & Karniadakis, "NSFnets (Navier-Stokes flow nets): Physics-informed neural networks for the incompressible Navier-Stokes equations", *JCP*, vol. 426, 109951, 2021 | DOI `10.1016/j.jcp.2020.109951` | OpenAlex 命中 | 第 2 讲完整损失结构的 NS 实例；第 6、7 讲动量方程的损失项设计参照 |
| Pang, D'Elia, Parks & Karniadakis, "nPINNs: Nonlocal physics-informed neural networks for a parametrized nonlocal universal Laplacian operator", *JCP*, vol. 422, 109760, 2020 | DOI `10.1016/j.jcp.2020.109760` | OpenAlex 命中 | 第 4 讲架构替换类的非局部算子分支（与 fPINN 并列） |
| Zhang, Dao, Karniadakis & Suresh, "Analyses of internal structures and defects in materials using physics-informed neural networks", *Science Advances*, vol. 8, eabk0644, 2022 | DOI `10.1126/sciadv.abk0644` | OpenAlex 命中 | 第 5 讲「自动微分给出全场导数量，无需额外后处理」优势条目的实证 |

---

## 三、检索过程记录

### 3.1 接口与调用情况

| 接口 | 状态 | 说明 |
|---|---|---|
| arXiv API `export.arxiv.org/api/query` | **全程可用，主力** | 必须 `curl -sL`（跟随 301）+ https。`id_list` 回查是最强验证手段——能同时返回标题、作者、日期、`journal_ref`、`arxiv:doi`、`arxiv:comment` |
| Crossref `api.crossref.org/works` | **间歇可用** | 会话中多次返回 HTTP 429（空响应体）。带 `User-Agent` 头 + `mailto` 后成功率提升但仍不稳定；成功的调用返回了含 volume/page 的完整记录，是期刊卷页的唯一可靠来源 |
| OpenAlex `api.openalex.org/works` | **全程可用** | `filter=title.search:` 与 `filter=primary_location.source.issn:` + `publication_year:` 组合最可靠；`search=`（全文）噪声大。OpenAlex 会为 arXiv 预印本分配 `10.48550/arxiv.XXXX.XXXXX` 形式的 DOI，**这类 DOI 不等于期刊 DOI，按 spec §3 仍以 arXiv 编号引用** |
| Semantic Scholar `api.semanticscholar.org` | **不可用** | 全部请求返回 HTTP 429 `Too Many Requests`，重试两次仍失败。未取得任何结果 |

### 3.2 arXiv API 语法踩坑（影响命中率，记录以备复查）

| 写法 | 结果 |
|---|---|
| `ti:"Physics-informed neural networks: A deep learning framework"` | **0 命中**。`ti:` 配长短语（含冒号）失效 |
| `all:"Extended physics-informed neural networks"` | 10 命中，但**全部是引用该文的后继工作**，无原始论文。arXiv 全文检索的相关性排序不利于找「原始文献」 |
| `au:"Jagtap A"`（带引号） | **0 命中** |
| `au:Jagtap`（不带引号） | 正常命中。**arXiv 的 `au:` 字段不要加引号** |
| `au:Lu_L AND au:Karniadakis_G` | **0 命中**。arXiv 作者字段的 `_` 首字母缩写消歧在本会话中不工作，改用 `au:Lu AND au:Karniadakis` 或作者全量列举 |
| `ti:"PINNacle"` | 15 命中，**14 条是组合数学的「pinnacle set」（排列的峰集）**，与 PINNs 无关。缩写型专名在 arXiv 标题检索中误匹配率极高 |
| `all:"dPINN"` | 6 命中，无一为目标论文 |
| `id_list=<多个编号>` | 稳定可靠。**但一次传 12 个编号时只返回 10 条**（1711.10566 与 1710.00211 被静默丢弃），需分批复查——**返回条数少于请求条数时必须逐个补查，不能假定缺失=不存在** |

### 3.3 实际使用的检索词（按目标分组）

**奠基 8 条**

| 目标 | 命中接口与检索式 |
|---|---|
| Raissi 2019 | Crossref `query.bibliographic=Physics-informed neural networks A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations` → 首位命中 |
| Karniadakis 2021 | Crossref `query.bibliographic=Physics-informed machine learning Karniadakis Nature Reviews Physics` → 首位命中；OpenAlex 多次交叉 |
| XPINN | Crossref `query.bibliographic=Extended physics-informed neural networks XPINNs generalized space-time domain decomposition` → 首位命中。arXiv 三次检索均失败 |
| Deep Ritz | arXiv `all:"Deep Ritz method"` → 命中 `1710.00211`；Crossref `query.bibliographic=The Deep Ritz method ... E Yu` → 首位命中 |
| Wang/Yu/Perdikaris NTK | arXiv `ti:"When and why PINNs fail to train"` → 唯一命中 `2007.14527`；Crossref 补 DOI |
| Tancik | arXiv `id_list=2006.10739` 回查；OpenAlex `search=` 补 NeurIPS 卷页 |
| McClenny | arXiv `id_list=2009.04544` 回查（journal_ref + DOI 由 arXiv 元数据自带） |
| Krishnapriyan | arXiv `ti:"physics-informed neural networks" AND au:Krishnapriyan` → 唯一命中 `2109.01050`；`id_list` 回查确认 `journal_ref=NeurIPS 2021` |

**变体与技巧**：`ti:"Conservative physics-informed neural networks"`、`ti:"Variational physics-informed neural networks"`、`ti:"fPINNs"`、`ti:"Physics-informed DeepONet"`、`ti:"Fourier Neural Operator"`、`ti:"B-PINNs"`、`ti:"composite neural network" AND all:"multi-fidelity"`、`ti:"weak" AND ti:"physics-informed" AND all:"conservation laws" AND all:"entropy"`、`ti:"Kolmogorov-Arnold" AND all:"physics-informed"`、`au:Jagtap AND au:Karniadakis`（155 篇全量列举后按关键词筛）、`au:Kharazmi AND au:Karniadakis`、`au:Mao AND au:Jagtap`、`ti:"hard-constrained physics-informed neural networks"`、`all:"residual-based adaptive refinement"`、`all:"dynamic physics-informed neural networks"`、`title.search:dPINNs`、`title.search:physics-informed deep models`、`primary_location.source.issn:0021-9991 + publication_year:2020 + title.search:physics-informed / deep models`、`title.search:comprehensive and fair comparison`、`title.search:NeuroDiffEq / SciANN / IDRLnet`、OpenAlex DOI 精确探针 `doi:10.1016/j.jcp.2020.109672`。

### 3.4 被排除的误匹配及原因

| 误匹配项 | 排除原因 |
|---|---|
| `arXiv:1909.10887`（二手文献常标为 XPINN） | **`id_list` 回查为假**：实为 Zhao, Zhu, Qiao & Wang, "Waveform of gravitational waves in the general parity-violating gravities", *Phys. Rev. D* 101, 024002 (2020)。引力波论文，与 PINNs 无关 |
| `arXiv:2007.04527`（易与 NTK 论文混淆） | **`id_list` 回查为假**：实为 SND 合作组的 $e^+e^-\to K^+K^-\pi^0$ 截面测量论文（*Eur. Phys. J.* C80, 1139）。正确编号是 `2007.14527`——**4 与 1 之差** |
| `arXiv:2103.07187`（易与 Krishnapriyan 混淆） | **`id_list` 回查为假**：实为 Detinko & Flannery, "Locally nilpotent linear groups"（纯数学群论）。正确编号是 `2109.01050` |
| `arXiv:1707.01472`（易与 Deep Ritz 混淆） | **`id_list` 回查为假**：实为 Catsigeras, "Empiric stochastic stability of physical and pseudo-physical measures"。正确编号是 `1710.00211` |
| `arXiv:2003.03485`（二手文献常标为 PI-DeepONet） | **`id_list` 回查为假**：实为 Li et al., "Neural Operator: Graph Kernel Network for Partial Differential Equations"，是 FNO 的前驱而非 PI-DeepONet |
| DOI `10.1016/j.jcp.2020.109672`（二手文献常标为 RAR / Lu et al.） | **OpenAlex DOI 探针回查为假**：该 DOI 实为 Han, Nica & Stinchcombe, "A derivative-free method for solving elliptic partial differential equations with deep neural networks", *JCP* 419, 109672 |
| Ramezani, Mohammadi & Mokhtari 2025, "dPINNs: ... distributed-order derivatives", DOI `10.1016/j.enganabound.2025.106418` | 该文本身真实存在（OpenAlex 命中），但 **d = distributed-order（分布阶导数），非 dynamic（时间域分解）**。缩写同名、含义不同，不得当作 [A10] dPINN 引用 |
| `ti:"PINNacle"` 返回的 14 条 | 组合数学「pinnacle set」（排列的峰集）与「Pinnacles for Complex Reflection Groups」等，与 PINNs 基准套件完全无关。真正的 PINNacle 论文由 `au:Hao AND ti:"benchmark" AND all:"physics-informed neural networks"` 命中 `2306.08827` |
| `ti:"DeepXDE" OR ti:"PINNacle"` 中的 `10.24996/ijs...`、`Iraqi Journal of Science` 类命中 | 仅提及 IDRLnet 库名的应用论文（求解 Volterra 积分微分方程），非库本身的原始文献 |
| JSON item 9（arXiv `2212.00970`, Dabrowski et al., 野火数据同化） | spec §7 将其记为 A 路「B-PINN」可用文献。**它是贝叶斯 PINN 的应用论文，不是 B-PINN 奠基论文**；奠基论文见 [A21]（arXiv `2003.06097` / DOI `10.1016/j.jcp.2020.109913`） |
| Crossref `query.bibliographic=dPINN...` 返回的 SSRN 预印本（`10.2139/ssrn.*`）与 `DPINN: Denoising PINNs` | SSRN 条目无同行评议、`container-title` 为空；DPINN 的 D = Denoising（去噪），与 dPINN 无关 |
| Crossref 返回的 `10.54499/2024.04636.bd`、`10.3030/101284595` | 标题字段为 `?` / 空、作者字段为空的残缺记录，无法核验，一律弃用 |
| OpenAlex `search=` 返回的 Litjens 医学影像综述、Carhart-Harris「entropic brain」等 | 全文检索噪声，与查询词仅共享高频通用词（deep learning / comprehensive），标题与作者均不符 |

### 3.5 未命中清单（须标注「待核验」，不得编造标识符）

| 目标 | 状态 | 已核验替代 |
|---|---|---|
| **dPINN**（Jagtap/Karniadakis，时间方向域分解） | 三接口 + Semantic Scholar 全部未命中。arXiv Jagtap 全量 155 篇逐条筛查亦无 | [A10] 列出的三条：arXiv `2203.07404`、DOI `10.1016/j.jcp.2022.111855`、arXiv `2109.01050` |
| **RAR 原始论文**（Lu, Jin, Pang, Zhang & Karniadakis, "Learning physics-informed deep models for PDEs", *JCP* 2020） | arXiv / OpenAlex（四种 filter 组合）/ Crossref 全部未命中；流传 DOI 已证伪 | [A26] 列出的三条：DOI `10.1016/j.cma.2022.115671`、DOI `10.1007/s10483-023-2994-7`、DOI `10.1016/j.physd.2022.133562` |
| **McFall & Ben-Nym 2017**（"Constrained deep learning using boundary kernelization"，硬约束最早系统化工作） | OpenAlex 未命中；Crossref 本次会话 429；Semantic Scholar 429 | [A25] 的三条已核验硬约束文献（arXiv `2102.04626`、DOI `10.1016/j.neucom.2018.06.056`、DOI `10.1016/j.heliyon.2023.e18820`）足以支撑第 2 讲 |
| **NVIDIA Modulus 论文** | 三接口均无可引用的同行评议论文 | 第 8 讲库对比表 Modulus 行改挂官方软件文档，标注「无正式论文」 |
| **Lu et al., *Nature Communications* 2023, "A comprehensive and fair comparison of physics-informed neural networks with practical extensions"** | OpenAlex 按 Nature Communications + 2023 + `title.search:physics-informed` 过滤返回 0 条；`title.search:comprehensive and fair comparison` 返回的 11 条中无此文 | 用 §2.8 表的 Lu et al. *CMAME* 2022 DOI `10.1016/j.cma.2022.114778`（神经算子版公平对比）＋ [A18] Shukla et al. *CMAME* 2024 DOI `10.1016/j.cma.2024.117290`（MLP vs KAN 公平对比）替代，两者均已核验且同样服务第 1/5 讲选型判据 |

### 3.6 命中率汇总

| 类别 | 目标数 | 命中 | 未命中 |
|---|---|---|---|
| 奠基文献（硬性验收） | 8 | **8** | 0 |
| 变体与技巧（spec §7 列举） | 13（cPINN、dPINN、VPINN、wPINN、fPINN、PI-DeepONet、FNO、B-PINN、multi-fidelity、硬约束、RAR、LR退火+L-BFGS、PIKAN） | **12** | 1（dPINN） |
| 额外补充（第 8 讲库与基准、综述旁证、UQ、采样、激活函数、训练指南） | — | 20+ | Modulus 论文 |
| **合计可用条目** | — | **约 45 条，全部带可核验标识符** | 5 条标「待核验」并附替代 |

---

## 四、给写作阶段的使用提示

1. **第 1 讲**：[A1]（定义）＋ [A2]（分类）＋ [A14]/[A16]（神经算子对照）＋ §2.8 表 Lu et al. *CMAME* 2022（选型判据实证）。
2. **第 2 讲**：[A1]（损失结构）＋ [A25]（硬约束）＋ [A27]（两段式优化）＋ [A28]（自适应激活）＋ [A12]（VPINN 降低高阶导依赖）。
3. **第 3 讲**：[A5]（NTK）＋ [A6] 及其配套（spectral bias）＋ [A7]（自适应权重）＋ [A8] 及其配套（因果性）＋ [A26]（采样）＋ [A27]（梯度病理缓解）。**这一讲的六类病态现在每一类都有已核验出处。**
4. **第 4 讲**：[A3]（XPINN，配 Hu et al. 的警示文献）＋ [A9]（cPINN）＋ [A10]（dPINN，标待核验 + 三条替代）＋ [A4]（Deep Ritz）＋ [A12]/[A13]（VPINN/wPINN）＋ [A31]（fPINN）＋ [A15]/[A16]（PI-DeepONet/FNO）＋ [A17]/[A18]（PIKAN 及其公平对比）＋ [A21]–[A23]（UQ）＋ [A24]（多保真度）。**主对比表的每一行都有出处。**
5. **第 5 讲**：[A2]＋ [A17]＋ [A8]（失败不是表达能力问题）＋ [A13 配套 De Ryck & Mishra 误差分析]（「无收敛性保证」需 nuanced 表述）＋ [A18]（超参敏感）＋ [A21]/[A22]（多种子方差）。
6. **第 8 讲**：§2.7 全表 ＋ [A29]（训练实践指南）＋ [A26]（采样策略表）＋ [A27]（优化实践）。
7. **交叉污染提醒**：写第 6 讲（燃烧）与第 7 讲（EHD）时，若需引方法学文献，从本文件取；本文件不含任何燃烧或 EHD 应用文献（分别属 B 路与 C 路）。
