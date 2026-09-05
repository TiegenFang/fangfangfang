# MD/DFT 奠基文献核验结果：课程要写公式的那些原始出处

支撑讲次：分子动力学与密度泛函理论应用于离子液体课程（第 1–18 类奠基条目）
检索日期：2026-09-05
检索接口：Crossref（`api.crossref.org/works`，DOI 回查 + `query.bibliographic`/`query.title` 检索 + 期刊 ISSN 路由扫卷内页）、OpenAlex（`api.openalex.org/works`，`title.search:` / `doi:` 探针，**本次会话中途触发免费额度上限 `Insufficient budget`，之后全部改用 Crossref**）、arXiv API（`export.arxiv.org/api/query?id_list=`）、Crossref 文献 `reference` 字段反向挖掘引文。
标识符规范：沿用 track-A——arXiv 预印本写 `arXiv:YYMM.NNNNN` 不写 DOI；期刊论文优先给 DOI，且**每个 DOI 都必须经 Crossref 单条回查、标题/作者/卷页三项对上才算核验通过**。

> [!WARNING]
> **类清单里给出的卷页与标识符有 9 处经回查为误配或不存在**，包括 Rayleigh 1882 的页码、van Duin 2001 的页码、DFT-D3 的元素数、Behler–Parrinello 的「PRL 100, 016402」、MACE 的「arXiv:2201.11905」、Dion 的「PRB 71, 165102」、Ren–Ponder 的「107, 5911」、Fowler–Nordheim 的题名、Green 的「JCP 20, 1745」。逐条证据见 §四。**其中三处是假标识符（回查后会落到别人的论文上）——Behler–Parrinello 的 PRL 卷页、MACE 的 arXiv 编号、Dion 的 PRB 71, 165102——绝不能照抄。**

---

## 一、总览

| 类别 | 可引用性 | 出处形式 |
|---|---|---|
| 1 cone-jet 电流标度律 | 已核验可引（4 条备选；清单猜测的 90 年代初 G–C/Vega/Sánchez/Barral 那篇未找到） | DOI |
| 2 Taylor 1964 | 已核验可引 | DOI |
| 3 Rayleigh 1882 | 已核验可引（**有 DOI**，与清单预期相反；页码需改 184–186） | DOI |
| 4 PBE 1996 | 已核验可引 | DOI |
| 5 Grimme D3 / D4 | 已核验可引（D3 题名应为「94 elements H–Pu」；D4 主文已找到） | DOI |
| 6 vdW-DF | 已核验可引（Dion PRL 2004 + Klimeš PRB 2011）；optB86b 首次出处未坐实 | DOI（optB86b：仅书目信息） |
| 7 Boys & Bernardi 1970 | 已核验可引 | DOI |
| 8 Ren & Ponder 2003 | 已核验可引（页码改正为 5933–5947） | DOI |
| 9 Drude-2013 磷脂 | 已核验可引（实际一作是 Chowdhary，非 Lemkul；Lemkul–Roux–MacKerell 2013 一文未找到） | DOI |
| 10 ReaxFF 2001 | 已核验可引（页码改正为 9396–9409） | DOI |
| 11 AMOEBA-IL | 已核验可引（DOI 已取得：IJMS 2020） | DOI |
| 12 机器学习势（5 条） | 全部已核验（Behler/DeepMD/ANI-1/sGDML/MACE）；MACE 用 arXiv | DOI + arXiv |
| 13 Fowler–Nordheim 1928 | 已核验可引（真实题名与清单不同） | DOI |
| 14 Nernst–Einstein 偏离 | 已核验可引（3 条替代文献）；清单点名的 PNAS 2014 无法核验 | DOI（PNAS 条：无法核验） |
| 15 电荷缩放 ±0.8e 的起源 | **部分**：可引的支撑文献均有 DOI，但「谁最先提出 0.7–0.8」无法用开放接口坐实 | DOI（起源归属：无法核验） |
| 16 离子液体电喷雾／ILIS | 已核验可引（Romero-Sanz 2003、Gamero-Castaño 2000）；清单点名的 1994 IJMSIP 无 DOI | DOI（1994 IJMSIP：仅书目信息） |
| 17 Green–Kubo | 已核验可引（Kubo I 电导、Green II 黏度） | DOI |
| 18 Nosé / Hoover / Parrinello–Rahman | 全部已核验可引 | DOI |

**18/18 类都拿到了至少一条经回查的标识符。** 按「是否落到清单点名的那一篇」分三档：
>
> - **14 类直接命中**（改正卷页或题名后即为清单所指）：2、3、4、5、6、7、8、9、10、11、12、13、17、18。
> - **3 类主题命中、清单指定的篇目未找到**：1（90 年代初那篇不存在于检索结果，标度律改引 de la Mora & Loscertales 1994）、14（PNAS 2014 无法核验，改引 Tokuda 2006 / Zhang–Maginn 2015 / France-Lanord 2019）、16（1994 IJMSIP 无 DOI，改引 Romero-Sanz 2003）。
> - **1 类只能引到支撑文献**：15（±0.8e 的首倡者无法坐实，改引 2023 *Molecules* 综述 + 各自实际使用的力场原文）。
>
> 另有两处**局部未坐实**已在正文标注：6 类的 optB86b-vdW 首次出处、9 类的「Lemkul 2013」署名。

---

## 二、逐条核验

### [M1] cone-jet 电流标度律 I ∝ Q^{1/2}

**首选（标度律的原始表述就在这里，摘要中含公式原文）：**

- 可引用条目：**J. Fernández de la Mora, I. G. Loscertales. The current emitted by highly conducting Taylor cones. *J. Fluid Mech.*, 1994, 260: 155–184. DOI 10.1017/S0022112094003472**
- 验证方式：Crossref 单条回查（DOI 解析成功，容器 = Journal of Fluid Mechanics、volume 260、page 155–184、issued 1994-02-10、作者 `J. Fernández De La Mora; I. G. Loscertales`）＋ OpenAlex `doi:` 探针命中同记录（cited_by_count 888）。
- **Crossref 记录的摘要原文给出标度律**：「the measured current is given approximately by **I = f(ε)(γQK/ε)^{1/2}** for a wide variety of liquids and conditions（ε、γ 分别为液体介电常数与界面张力，f(ε) 见其图 11）」——即高电导极限下 I 与电压、电极几何无关，只由 Q、K、γ 决定。
- 配套可引（同主题，均已回查）：
  1. **A. M. Gañán-Calvo, J. Dávila, A. Barrero. Current and droplet size in the electrospraying of liquids. Scaling laws. *J. Aerosol Sci.*, 1997, 28(2): 249–275. DOI 10.1016/S0021-8502(96)00433-8**（OpenAlex cited 781，是本主题最高引）。
  2. **A. M. Gañán-Calvo. Cone-Jet Analytical Extension of Taylor's Electrostatic Solution and the Asymptotic Universal Scaling Laws in Electrospraying. *Phys. Rev. Lett.*, 1997, 79(2): 217–220. DOI 10.1103/PhysRevLett.79.217**；勘误：**同刊 2000, 85: 4193, DOI 10.1103/PhysRevLett.85.4193**（两条均 Crossref 回查通过，勘误记录作者串与首条一致）。讲义引 PRL 这条务必同时给出勘误。
  3. **A. Gomez, K. Tang. Charge and fission of droplets in electrostatic sprays. *Phys. Fluids*, 1994, 6(1): 404–414. DOI 10.1063/1.868037**（Crossref 回查通过）。
- 检索过的「清单猜测项」：Crossref `query.author=Ga%C3%B1%C3%A1n-Calvo`（带变音符）+ 1990–1997 时间过滤（命中的全是无关的西班牙语文献，作者字段被连字符/变音符切词，不可用）；OpenAlex 作者 ID `A5070516882`（Alfonso M. Gañán-Calvo，289 条作品）按 1990–1999 + 引用数降序取回前 20 条逐条筛查，**其中 1990–1996 年间没有任何一篇发表在 JFM 或 Phys. Fluids 上、给出该电流标度律的论文**（低引用条目未穷尽，见下方「未核验成功」表的坦白）；`title.search:previously established scaling laws` 与 `title.search:electric spray of liquids from colloid sources` 均 0 命中。
  > [!NOTE]
  > 清单里的「A. Barral」极可能是 **A. Barrero**（Gañán-Calvo 的长期合作者，见上面第 1 条）之误；「J. M. Vega / A. Sánchez」在本主题各接口均无命中。**不猜。**
- **量纲警示（写给讲义）**：清单写的 `I ∝ (Qσ/ε₀)^{1/2}`（σ 取电导率）**量纲不是电流**——σ/ε₀ 是电荷弛豫速率 1/s，Qσ/ε₀ 的量纲是 m³/s²。上面 dM & Loscertales 摘要中的 `(γQK/ε)^{1/2}` 才量纲自洽（γ[N/m]·Q[m³/s]·K[S/m] → A²）。写这一讲时以原文公式为准，别把清单里的简写直接抄进公式框。

---

### [M2] G. I. Taylor 1964 —— 49.3° 锥半角

- 可引用条目：**Geoffrey Ingram Taylor. Disintegration of water drops in an electric field. *Proc. R. Soc. Lond. A*, 1964, 280(1382): 383–397. DOI 10.1098/rspa.1964.0151**
- 验证方式：Crossref `query.bibliographic` 首位命中 + 单条回查（容器 = *Proc. R. Soc. Lond. A*、vol 280 issue 1382、p 383–397、issued 1964-07-28、作者 Geoffrey Ingram Taylor）。另经 Gañán-Calvo 1997 PRL 的 Crossref `reference` 字段反查，其引文条目即 `10.1098/rspa.1964.0151 … G. I. Taylor p280`——第三方交叉印证。
- 支撑：第 6 讲锥形液面静电平衡解与 49.3°（泰勒角）来处；第 7 讲 EHD 界面应力平衡。
  > [!WARNING]
  > `10.1098/rspa.1964.0147`（常被误当作本文）**回查结果是 Taylor 1962 Bakerian Lecture《The structure of liquids》，*Proc. R. Soc. A* 280, 299–322**。正确编号只差末位。

---

### [M3] Rayleigh 1882 —— 带电液滴稳定性极限

- 可引用条目：**Lord Rayleigh (J. W. Strutt). XX. On the equilibrium of liquid conducting masses charged with electricity. *The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science*, 1882, 14(87): 184–186. DOI 10.1080/14786448208628425**
- 验证方式：Crossref 单条回查（题名、卷 14、issue 87、p 184–186、issued 1882-09、作者 Lord Rayleigh）＋ OpenAlex `doi:` 探针（biblio 字段给出 volume 14 / issue 87 / first_page 184 / last_page 186，cited_by_count 1803）。**两接口完全一致 ⇒ 1882 年的老文献确实注册了 DOI（Taylor & Francis 回溯库），清单预期「可能没有 DOI」不成立。**
- 修正：清单写的「Phil. Mag. 14, 177」页码不对，实为 **14, 184–186**（同一 DOI 内）。若讲义要写 `Q_max = 8π(ε₀γR³)^{1/2}`，公式本身量纲自洽（结果电荷量纲 C ✓），出处挂本条。

---

### [M4] Perdew–Burke–Ernzerhof 1996（GGA）

- 可引用条目：**John P. Perdew, Kieron Burke, Matthias Ernzerhof. Generalized Gradient Approximation Made Simple. *Phys. Rev. Lett.*, 1996, 77(18): 3865–3868. DOI 10.1103/PhysRevLett.77.3865**
- 验证方式：Crossref 单条回查通过（作者三人串、vol 77 issue 18、p 3865–3868、issued 1996-10-28）。

---

### [M5] Grimme DFT-D3 与 D4

- D3 可引用条目：**Stefan Grimme, Jens Antony, Stephan Ehrlich, Helge Krieg. A consistent and accurate *ab initio* parametrization of density functional dispersion correction (DFT-D) for the 94 elements H–Pu. *J. Chem. Phys.*, 2010, 132(15): 154104. DOI 10.1063/1.3382344**
- 验证方式：Crossref 单条回查（vol 132 issue 15、article-number 154104、issued 2010-04-16、四位作者全对）。
- **题名修正**：清单写「for the 76 elements」，Crossref 记录与出版社元数据均为 **「for the 94 elements H-Pu」**。别按清单写。
- D4 可引用条目（存在，且是方法主文）：**Eike Caldeweyher, Sebastian Ehlert, Andreas Hansen, Hagen Neugebauer, Sebastian Spicher, Christoph Bannwarth, Stefan Grimme. A generally applicable atomic-charge dependent London dispersion correction. *J. Chem. Phys.*, 2019, 150(15): 154122. DOI 10.1063/1.5090222**（Crossref 回查通过，七位作者；OpenAlex cited 1956，即通常所称 DFT-D4 主文）。
- 配套：**Eike Caldeweyher, Christoph Bannwarth, Stefan Grimme. Extension of the D3 dispersion coefficient model. *J. Chem. Phys.*, 2017, 147: 034112. DOI 10.1063/1.4993215**（回查通过；D4 的 C₆ 模型前驱，写 D3→D4 递进时引它）。

---

### [M6] vdW-DF（Dion 等）与固体版

- vdW-DF 原始论文：**M. Dion, H. Rydberg, E. Schröder, D. C. Langreth, B. I. Lundqvist. Van der Waals Density Functional for General Geometries. *Phys. Rev. Lett.*, 2004, 92(24): 246401. DOI 10.1103/PhysRevLett.92.246401**（Crossref 回查通过，五位作者全对；另有同组勘误 **DOI 10.1103/PhysRevLett.95.109902**, *Phys. Rev. Lett.* 2005, 95: 109902，单条回查通过，作者串与首条一致）。
- 固体系统检验／optB88–optB86b 常用出处：**Jiří Klimeš, David R. Bowler, Angelos Michaelides. Van der Waals density functionals applied to solids. *Phys. Rev. B*, 2011, 83(19): 195131. DOI 10.1103/PhysRevB.83.195131**（Crossref 回查通过；OpenAlex cited 4635；预印本 **arXiv:1102.1358** 经 arXiv API 标题检索命中，摘要首句即「The van der Waals density functional (vdW-DF) of Dion et al. [PRL 92, 246401 (2004)]…」，可作第三方串联证据）。
  > [!WARNING]
  > **清单第 6 条的出处是误配。** DOI `10.1103/PhysRevB.71.165102` 经 Crossref 与 OpenAlex 双接口回查，实为 **A. V. Nikolaev,「Multipole Coulomb interactions with several electrons per crystal site…」**，与 vdW-DF 无关；且「Van der Waals density functionals for **solids**」这个题名在 OpenAlex 里最接近的命中是 Klimeš 等的「applied to **solids**」PRB 83, 195131 (2011)。清单把「Dion 2005 PRB 71, 165102」与「Klimeš 固体版」混为一条了。
- **optB86b-vdW 首次出处：未能坐实。** `abstract.search:optB86b` / `title.search:optB86b` 在 OpenAlex 无命中（该库对 APS 摘要覆盖不全），Crossref 未收录 PRB 83,195131 的摘要正文（`abstract` 字段为空），因此无法证明「optB86b 首见于该文」。**处置建议**：讲义若要写 optB86b-vdW，出处挂上面两条（Dion PRL 2004 + Klimeš PRB 2011）并标「具体泛函参数化的原始出处待核」，或改引 VASP 手册/文档而非论文；**不得由我这条记录生成新的 DOI**。

---

### [M7] Boys & Bernardi 1970 —— 基组重叠误差 / counterpoise

- 可引用条目：**S. F. Boys, F. Bernardi. The calculation of small molecular interactions by the differences of separate total energies. Some procedures with reduced errors. *Mol. Phys.*, 1970, 19(4): 553–566. DOI 10.1080/00268977000101561**
- 验证方式：Crossref 单条回查（卷 19、issue 4、p 553–566、issued 1970-10、两位作者全对）。题名比清单给的短标题更完整，按此抄。

---

### [M8] Ren & Ponder 2003 —— AMOEBA 起点

- 可引用条目：**Pengyu Ren, Jay W. Ponder. Polarizable Atomic Multipole Water Model for Molecular Mechanics Simulation. *J. Phys. Chem. B*, 2003, 107(24): 5933–5947. DOI 10.1021/jp027815+**
- 验证方式：Crossref 单条回查 + `query.bibliographic` 检索 + OpenAlex `primary_location.source.issn:1520-6106,publication_year:2003,title_and_abstract.search:atomic multipole` 三方一致（biblio: vol 107 issue 24 first_page 5933 last_page 5947）。
- 配套（有机分子版 AMOEBA，讲义写参数化时该并引）：**Pengyu Ren, Chuanjie Wu, Jay W. Ponder. Polarizable Atomic Multipole-Based Molecular Mechanics for Organic Molecules. *J. Chem. Theory Comput.*, 2011, 7: 3143–3161. DOI 10.1021/ct200304d**（回查通过）。
  > [!WARNING]
  > **清单里的「107, 5911」不是一篇文章的起始页。** 用 Crossref 期刊路由把 *J. Phys. Chem. B* 2003-05-15～06-30 全部 266 条记录的起始页列出来核对：5901、**5906**、5914、5922、5926、5933……即 p. 5911 落在 10.1021/jp022153+（起始页 5906）那篇《Hidden Transition in the "Unfreezable Water" Region…》的页区间内，卷 107 中不存在以 5911 开头的水模型／AMOEBA 论文。**照 5933–5947 引。**

---

### [M9] Drude 极化力场（2013 磷脂 / 发展史）

- 2013 磷脂（DPPC）Drude 力场——**这一篇才是清单描述的「Drude-2013 用于磷脂」**：
  **Janamejaya Chowdhary, Edward Harder, Pedro E. M. Lopes, Lei Huang, Alexander D. MacKerell, Benoît Roux. A Polarizable Force Field of Dipalmitoylphosphatidylcholine Based on the Classical Drude Model for Molecular Dynamics Simulations of Lipids. *J. Phys. Chem. B*, 2013, 117(31): 9142–9160. DOI 10.1021/jp402860e**
  验证方式：Crossref 单条回查（卷 117 issue 31、p 9142–9160、issued 2013-07-30、六位作者，末两位确为 MacKerell 与 Roux）。**一作是 Chowdhary，不是 Lemkul。**
- 力场发展史／综述（清单里「Lemkul, Roux & MacKerell」的作者组合实际对应这一篇）：
  **Justin A. Lemkul, Jing Huang, Benoît Roux, Alexander D. MacKerell. An Empirical Polarizable Force Field Based on the Classical Drude Oscillator Model: Development History and Recent Applications. *Chem. Rev.*, 2016, 116(9): 4983–5013. DOI 10.1021/acs.chemrev.5b00505**（Crossref 回查通过）。
- **未找到**：署名「Lemkul, Roux & MacKerell」的 2013 年 Drude 论文。用 Crossref 期刊路由把 *J. Phys. Chem. B* 2013-10-01～12-31 全部 397 条记录的题名扫过，含 "Drude" 或 "hosphatidyl" 的只有 10.1021/jp409672q（Brown & Conboy，脂双层 flip-flop，与本条无关）；*JCTC* 2013–2014 的扫描因单次响应结构异常未成功。**结论：该 2013 年 Lemkul 一作论文在本次检索中无法核验，不编造；用上面两条替代即可支撑讲义。**

---

### [M10] van Duin et al. 2001 —— ReaxFF

- 可引用条目：**Adri C. T. van Duin, Siddharth Dasgupta, Francois Lorant, William A. Goddard. ReaxFF: A Reactive Force Field for Hydrocarbons. *J. Phys. Chem. A*, 2001, 105(41): 9396–9409. DOI 10.1021/jp004368u**
- 验证方式：Crossref 单条回查（卷 105 issue 41、p 9396–9409、issued 2001-09-22、四位作者全对）。
- **页码修正**：清单写「105, 9336」，实为 **9396–9409**。（清单给的 `10.1021/jp003716a` 是 404，不存在。）

---

### [M11] AMOEBA-IL —— 清单里「查不到 DOI」的那篇

- 可引用条目：**Erik Antonio Vázquez-Montelongo, José Enrique Vázquez-Cervantes, G. Andrés Cisneros. Current Status of AMOEBA–IL: A Multipolar/Polarizable Force Field for Ionic Liquids. *Int. J. Mol. Sci.*, 2020, 21(3): 697. DOI 10.3390/ijms21030697**
- 验证方式：Crossref `query.bibliographic` 首位命中 → 单条回查通过（题名逐字一致，含 "Multipolar/Polarizable"；MDPI 文章号 697；issue 3；2020-01-21）。
- 更正预期：清单猜它是「2019+ 的 J. Phys. Chem. 或 Israel J. Chem. 特刊」，实为 **《International Journal of Molecular Sciences》2020 年 21 卷 3 期文章号 697**（MDPI 开放获取，可直接下载原文核公式）。

---

### [M12] 机器学习势（5 条，全部核验）

1. **Jörg Behler, Michele Parrinello. Generalized Neural-Network Representation of High-Dimensional Potential-Energy Surfaces. *Phys. Rev. Lett.*, 2007, 98(14): 146401. DOI 10.1103/PhysRevLett.98.146401**（Crossref 回查通过，两位作者）。
   > [!WARNING]
   > 清单写的「PRL 100, 016402」经回查是 **A. Klein et al.,「Changes in Electronic Structure and Chemical Bonding upon Crystallization of …」*PRL* 2008, 100: 016402**，与 Behler–Parrinello 无关；卷号、年份、文章号三处皆错。**严禁照抄。**
2. **Linfeng Zhang, Jiequn Han, Han Wang, Roberto Car, Weinan E. Deep Potential Molecular Dynamics: A Scalable Model with the Accuracy of Quantum Mechanics. *Phys. Rev. Lett.*, 2018, 120(14): 143001. DOI 10.1103/PhysRevLett.120.143001**（回查通过；**记录含五位作者，比清单的三人多了 Roberto Car 与 Weinan E**）。预印本编号本次未回查，不写。
3. **J. S. Smith, O. Isayev, A. E. Roitberg. ANI-1: an extensible neural network potential with DFT accuracy at force field computational cost. *Chemical Science*, 2017, 8(4): 3192–3203. DOI 10.1039/C6SC05720A**（回查通过）。
   - 清单猜测的「Cheng et al. 2017 *J. Chem. Theory Comput.*」不成立：题名在 Crossref 唯一命中即这条 RSC *Chem. Sci.* 论文，作者是 Smith/Isayev/Roitberg。
4. **sGDML**：Stefan Chmiela, Alexandre Tkatchenko, Huziel E. Sauceda, Igor Poltavsky, Kristof T. Schütt, Klaus-Robert Müller. Machine learning of accurate energy-conserving molecular force fields. ***Science Advances*, 2017, 3(5): e1603015. DOI 10.1126/sciadv.1603015**（回查通过，六位作者）；软件文 **同组, *Comput. Phys. Commun.*, 2019, 240: 38–45. DOI 10.1016/j.cpc.2019.02.007**（检索命中）。
   - 清单猜测的「sGDML = Bartók et al. 2017 PRL」不成立。Bartók 的 PRL 是 **Gaussian Approximation Potentials**, *PRL* 2010, 104: 136403, DOI 10.1103/PhysRevLett.104.136403（回查通过）——若讲义要引 GAP，用这条，别挂到 sGDML 名下。
5. **MACE**：**Ilyes Batatia, Dávid Péter Kovács, Gregor N. C. Simm, Christoph Ortner, Gábor Csányi. MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields.** 出处形式 **arXiv:2206.07697**（2022-06-15，v2）。
   - 验证方式：arXiv `id_list` 回查 ⇒ 标题、五位作者、日期逐字对应（返回记录 `doi` 与 `journal_ref` 字段均为 None）。
   - NeurIPS 2022 正式记录另有 DOI **10.52202/068431-0830**（*Advances in Neural Information Processing Systems*, 11423–11436，Crossref 回查通过，作者串一致；**该记录无卷号字段**）；该 DOI 前缀是会议卷聚合方而非出版社常规前缀，**按 spec §3 仍以 arXiv 编号为主引，卷页 DOI 作括注**。
   > [!WARNING]
   > 清单给的 **arXiv:2201.11905 是假编号**：`id_list` 回查结果为 Tong Li, Jiajun Liao, Rui-Jia Zhang 的《Dark magnetic dipole property in fermionic absorption by nucleus and electrons》（JHEP 2022）。与力场毫无关系。**严禁沿用。**

---

### [M13] Fowler–Nordheim 1928 —— 场发射

- 可引用条目：**R. H. Fowler, L. W. Nordheim. Electron emission in intense electric fields. *Proc. R. Soc. Lond. A*, 1928, 119(781): 173–181. DOI 10.1098/rspa.1928.0091**
- 验证方式：Crossref 单条回查（卷 119 issue 781、p 173–181、issued 1928-05-01、作者 Ralph Howard Fowler 与 L. Nordheim）。卷 119 与页 173 与清单完全一致 ⇒ **就是这一篇**。
- **题名修正**：清单给的题名「The emission of electrons from cold metals」不是这一篇。以 `title.search:emission of electrons from cold metals` 检索 OpenAlex，只命中 **「Further studies in the emission of electrons from cold metals」*Proc. R. Soc. A* 1929, 124: 699–723, DOI 10.1098/rspa.1929.0147**（回查通过；Crossref 记录作者串为 Stern / Gossling / Fowler）。即：1928 系列中卷 119 p 173 的正确题名是 *Electron emission in intense electric fields*；「cold metals」字样属于 1929 年的后续篇。**写 FN 公式（κ、指数隧穿）请引 1928 条。**

---

### [M14] Nernst–Einstein 偏离 / 离子关联 / ionicity

**清单点名的 PNAS 2014 条无法核验（见 §三），以下三条均已核验，且第 1 条就是该现象的经典定量出处：**

1. **Hiroyuki Tokuda, Seiji Tsuzuki, Md. Abu Bin Hasan Susan, Kikuko Hayamizu, Masayoshi Watanabe. How Ionic Are Room-Temperature Ionic Liquids? An Indicator of the Physicochemical Properties. *J. Phys. Chem. B*, 2006, 110(39): 19593–19600. DOI 10.1021/jp064159v**
   验证：Crossref 回查 + OpenAlex `title_and_abstract.search` 按引用数排序首位（cited 1201，本主题最高）。摘要原文明确「ionic nature 定义为 Λ(imp)/Λ(NMR)」——**σ_NE 高估实测电导这一现象的原始量化定义在此**（第 7 讲 Walden 图与 ionicity 段落引它）。
2. **Yong Zhang, Edward J. Maginn. Direct Correlation between Ionic Liquid Transport Properties and Ion Pair Lifetimes: A Molecular Dynamics Study. *J. Phys. Chem. Lett.*, 2015, 6(4): 700–705. DOI 10.1021/acs.jpclett.5b00003**
   验证：Crossref 回查通过（cited 266）。**计算路线**：把 NE 电导与 Green–Kubo 电导直接挂钩并用离子对寿命解释偏离——第 14/17 类两个知识点的交叉文献，建议并引。
3. **Arthur France-Lanord, Jeffrey C. Grossman. Correlations from Ion Pairing and the Nernst–Einstein Equation. *Phys. Rev. Lett.*, 2019, 122(13): 136001. DOI 10.1103/PhysRevLett.122.136001**
   验证：Crossref 回查通过。**理论侧**：把反号离子关联写成对 NE 的可计算修正（cited 225）。
- 可选（固态电解质侧的同主题失效，若讲义需要跨体系论证）：**Aris Marcolongo, Nicola Marzari. Ionic correlations and failure of Nernst–Einstein relation in solid-state electrolytes. *Phys. Rev. Materials*, 2017, 1: 025402. DOI 10.1103/PhysRevMaterials.1.025402**（回查通过）。
- 清单点名的 **Schöder/Havenith/Kremer/Kehr PNAS 2014** 与 **Schöder 2013 PCCP「How the mixture composition affects the charge transport mechanisms in water-free ionic liquids」**：Crossref `query.bibliographic`（两种题名串各一次）、`query.title`（"mixture composition charge transport water-free ionic liquids"）与 OpenAlex `title.search:Nernst-Einstein,publication_year:2005-2021`（按引用数排序前 15 条）+ `raw_author_name.search:Kremer,title_and_abstract.search:Nernst-Einstein` 全部未命中。**不猜 DOI，不写进参考文献。**

---

### [M15] 电荷缩放到 ±0.8e —— 起源归属

**结论：可引用的支撑文献都有 DOI，但「谁最先提出 0.7–0.8e」无法用开放接口坐实。**

已核验、可用于支撑这一讲的文献池：

1. **B. L. Bhargava, S. Balasubramanian. Refined potential model for atomistic simulations of ionic liquid [bmim][PF₆]. *J. Chem. Phys.*, 2007, 127(11): 114510. DOI 10.1063/1.2772268**（回查通过；常被引作缩放电荷的出处，但 **Crossref/OpenAlex 摘要均未写出 0.8 这个数值**，需回查正文后才能断言）。
2. **Yong Zhang, Edward J. Maginn. A Simple AIMD Approach to Derive Atomic Charges for Condensed Phase Simulation of Ionic Liquids. *J. Phys. Chem. B*, 2012, 116(33): 10036–10048. DOI 10.1021/jp3037999**（回查通过；OpenAlex cited 271）。
3. **Jiří Kolafa. Pressure in Molecular Simulations with Scaled Charges. 1. Ionic Systems. *J. Phys. Chem. B*, 2020, 124(34): 7379–7390. DOI 10.1021/acs.jpcb.0c02641**（回查通过；系统化处理缩放电荷的热力学后果）。
4. **Zhaoxi Sun, Lei Zheng, Zuo-Yuan Zhang, Yalong Cong, Mao Wang, Xiaohui Wang, Jingjing Yang, Zhirong Liu, Zhe Huai. Molecular Modelling of Ionic Liquids: Situations When Charge Scaling Seems Insufficient. *Molecules*, 2023, 28(2): 800. DOI 10.3390/molecules28020800**（回查通过，九位作者；**这是正面讨论 0.7–0.8e 缩放何时有效、何时失效的综述，讲义写这一约定时首选引它**——注意它的立场是「缩放常显不足」，不要写成背书）。
5. **E. Duboué-Dijon, M. Javanainen, P. Delcroix, et al. A practical guide to biologically relevant molecular simulations with scaled charges. *J. Chem. Phys.*, 2020, 153(5): 050901. DOI 10.1063/5.0017775**（回查通过；缩放电荷的实操指南，跨体系视角）。
- 排除项：清单给的「Bhargava & Balasubramaniam 2007, *Chem. Phys. Lett.*「scaling the ionic charges」」**检索不到**；*Chem. Phys. Lett.* 444 (2007) 内 Bhargava & Balasubramanian 名下命中的是 **「Probing anion–carbon dioxide interactions in room temperature ionic liquids」DOI 10.1016/j.cplett.2007.07.051, 444: 242–246**；试探性回查 `10.1016/j.cplett.2007.06.078` 的结果是一篇 Ag/L1₀  Ordering 的无关论文。**「Kohl & Saikaly」「Micaletto & Bourge-Lxon」两个候选在各接口均无命中。**

---

### [M16] 离子液体电喷雾／IL 离子源（微推进相关）

- 已核验主文献（**裸离子发射的直接实验证据 + 微推进应用**）：
  **I. Romero-Sanz, R. Bocanegra, J. Fernández de la Mora, M. Gamero-Castaño. Source of heavy molecular ions based on Taylor cones of ionic liquids operating in the pure ion evaporation regime. *J. Appl. Phys.*, 2003, 94(5): 3599–3605. DOI 10.1063/1.1598281**
  验证：Crossref 单条回查（vol 94 issue 5、p 3599–3605、issued 2003-09-01、四位作者含 Gamero-Castaño）＋ OpenAlex 命中（cited 261）。
- 已核验配套（离子蒸发动力学的直接测量，讲「纯离子发射 vs 离子蒸发/库仑裂变竞争」必引）：
  **M. Gamero-Castaño, J. Fernández de la Mora. Direct measurement of ion evaporation kinetics from electrified liquid surfaces. *J. Chem. Phys.*, 2000, 113(2): 815–832. DOI 10.1063/1.481857**（回查通过）。
- 旁证（同为 Crossref 回查通过，可用于「单分散离子/液滴发射」叙述）：**Carlos Larriba, Juan Fernandez de la Mora. Production of monodisperse submicron drops of dielectric liquids by charge-injection from highly conducting liquids. *Phys. Fluids*, 2011, 23(10): 102003. DOI 10.1063/1.3647573**；**M. Cloupeau（Crossref 记录仅列此一位作者）. Recipes for use of EHD spraying in cone-jet mode and notes on corona discharge effects. *J. Aerosol Sci.*, 1994, 25(6): 1143–1157. DOI 10.1016/0021-8502(94)90206-2**。
- **清单点名的 1994 IJMSIP 原文：无法核验，仅给书目信息。** 已做：Crossref 期刊路由 `journals/0168-1176/works`（Int. J. Mass Spectrom. Ion Processes）扫 1994-01-01～1995-06-30 全部 **342 条**记录（含 vol 135 的 24 条，页码覆盖 1–255），题名含 electrospray / ionic liquid / Taylor 的只有 4 条，**没有**「Electrospray of ionic molecular liquids」；`query.title` 与 `query.bibliographic` 两种检索式各一次亦 0 命中；OpenAlex `title.search:electrospray of ionic molecular liquids` 命中的全是 MDPI/Elsevier 的后继应用论文。
  **备选书目写法（不附 DOI）**：*H. Gomez, K. Tang, F. Lovoy, J. F. de la Mora, Electrospray of ionic molecular liquids, Int. J. Mass Spectrom. Ion Processes 135 (1994) 241–275.* —— 卷页与作者串为清单原文照抄，**未经任何接口回查**，引用时须标「DOI 未获取」或直接改引上面已核验的 Romero-Sanz 2003。
- Lozano 方向的微推进文献只找到会议/后续（如 *J. Microelectromech. Syst.* 2009, 18: 679–694, DOI 10.1109/JMEMS.2009.2015475；AIAA 2005-4388, DOI 10.2514/6.2005-4388，两条均检索命中），**属应用类，不列为奠基文献**。

---

### [M17] Green–Kubo：电导与黏度

- 电导（一般理论 + 电导应用）：**Ryogo Kubo. Statistical-Mechanical Theory of Irreversible Processes. I. General Theory and Simple Applications to Magnetic and Conduction Problems. *J. Phys. Soc. Japan*, 1957, 12(6): 570–586. DOI 10.1143/JPSJ.12.570**（Crossref 回查通过；OpenAlex cited 9489）。
- 黏度（**应力自相关 → 黏度** 的原始出处）：**Melville S. Green. Markoff Random Processes and the Statistical Mechanics of Time-Dependent Phenomena. II. Irreversible Processes in Fluids. *J. Chem. Phys.*, 1954, 22(3): 398–413. DOI 10.1063/1.1740082**（回查通过；摘要原文：「expressions are given for the **viscosity**, diffusion, and heat conductivity in terms the autocorrelation coefficients of certain phase functions」）。
- 一般形式（同一主标题的 Part I）：**Melville S. Green. Markoff Random Processes and the Statistical Mechanics of Time-Dependent Phenomena. *J. Chem. Phys.*, 1952, 20(8): 1281–1295. DOI 10.1063/1.1700722**（回查通过）。
- 可选补充：**Ryogo Kubo, Mario Yokota, Sadao Nakajima. …II. Response to Thermal Disturbance. *J. Phys. Soc. Japan*, 1957, 12(11): 1203–1211. DOI 10.1143/JPSJ.12.1203**（回查通过，但它是热扰动响应，不是黏度；清单若把「Kubo II」当黏度出处需纠正）。
- 面向 IL 的现代写法（电导的 NE 与 GK 两式对照）：**[M14] 第 2 条 Zhang & Maginn 2015, DOI 10.1021/acs.jpclett.5b00003**。
  > [!WARNING]
  > 清单给的「Green 1952 *J. Chem. Phys.* 20, 1745」在 Green 名下无对应记录（1952 年那篇是 **20, 1281**）；而「22, 398」的年份是 **1954**，不是 1952。

---

### [M18] Nosé–Hoover 恒温器与 Parrinello–Rahman 压浴

- **Shūichi Nosé. A molecular dynamics method for simulations in the canonical ensemble. *Mol. Phys.*, 1984, 52(2): 255–268. DOI 10.1080/00268978400101201**（Crossref 回查通过，卷页与清单一致）。
- 续篇（写扩展拉氏量、虚拟变量 s 与 δ 项时更常用）：**Shuichi Nosé. A unified formulation of the constant temperature molecular dynamics methods. *J. Chem. Phys.*, 1984, 81: 511–519. DOI 10.1063/1.447334**（回查通过）。
  > [!WARNING]
  > 形如 `10.1080/00268978400101361` 的 Nosé 编号经回查是 Counsell/Emsley/Luckhurst 的液晶 NMR 论文（*Mol. Phys.* 52, 499），**不是 Nosé 1984**。
- **William G. Hoover. Canonical dynamics: Equilibrium phase-space distributions. *Phys. Rev. A*, 1985, 31(3): 1695–1697. DOI 10.1103/PhysRevA.31.1695**（回查通过）。
- **M. Parrinello, A. Rahman. Polymorphic transitions in single crystals: A new molecular dynamics method. *J. Appl. Phys.*, 1981, 52(12): 7182–7190. DOI 10.1063/1.328693**（回查通过，卷页与清单一致）。
  > [!WARNING]
  > `10.1063/1.330040` 回查结果是 *J. Appl. Phys.* **53**, 6956 (1982) 的硅中受主杂质论文，**不是 Parrinello–Rahman 1981**。

---

## 三、未核验成功（逐条交代试过什么）

| 目标 | 状态 | 已试手段 | 处置 |
|---|---|---|---|
| **6 类：optB86b-vdW 的首次出处** | 未坐实 | OpenAlex `title.search:optB86b` / `abstract.search:optB86b`、`title.search:optimal van der Waals density functional` 均 0 命中；Crossref 中 PRB 83,195131 的 `abstract` 字段为空，arXiv:1102.1358 摘要被截断未点名该泛函 | 引 Dion PRL 2004 + Klimeš PRB 2011 两条已核验文献，optB86b 标「待核」或改引软件文档 |
| **9 类：署名 Lemkul/Roux/MacKerell 的 2013 Drude 磷脂论文** | 未命中 | Crossref 期刊路由扫 *JPCB* 2013-10～12 全 397 条题名（无匹配）、`query.title=Simulating phosphatidylcholines`、`query.bibliographic=phosphatidylcholines Drude …`、OpenAlex `title.search:phosphatidylcholines,publication_year:2012-2015`（无匹配）；`raw_author_name.search:MacKerell,publication_year:2013` 因额度上限中断 | 改引 Chowdhary et al. 2013（DOI 10.1021/jp402860e，作者含 Roux/MacKerell）＋ Lemkul et al. *Chem. Rev.* 2016 |
| **14 类：Schöder/Havenith/Kremer/Kehr PNAS 2014** | 无法核验 | Crossref `query.bibliographic`（"On the validity of the Nernst-Einstein relation ionic liquids"）、OpenAlex `raw_author_name.search:Kremer,title_and_abstract.search:Nernst-Einstein`、`title.search:Nernst-Einstein,publication_year:2005-2021` 按引用排序前 15 条筛查 | 用 [M14] 三条已核验文献；**不编造该条** |
| **14 类：Schöder 2013 PCCP「water-free ionic liquids」** | 无法核验 | 题名全串与关键子串两种检索式，Crossref 0 命中（返回一堆高分子/聚合物电解质无关项） | 同上 |
| **15 类：±0.8e 缩放的首倡者** | 归属未定 | *Chem. Phys. Lett.* 期刊路由 grep Bhargava（2007 年命中的是 CO₂ 相互作用一文）、`query.title=charges for molecular simulations of ionic liquids`、`title.search:electrospray…` 无关；试探 DOI `10.1016/j.cplett.2007.06.078` 回查为无关论文；MDPI 综述全文页 WebFetch 返回 403 | 写「惯例」而非「某人提出」，出处挂 [M15] 第 4、3、1 条 |
| **16 类：Gomez, Tang, Lovoy, de la Mora, IJMSIP 135 (1994)** | 无 DOI | Crossref 期刊路由扫 ISSN 0168-1176 全 342 条 1994–1995 记录（含 vol 135 的 24 条）逐条比对题名与页码；`query.title`、`query.bibliographic` 两种检索式；OpenAlex 题名检索 | 仅书目信息，标「DOI 未获取」，或改引已核验的 Romero-Sanz 2003 |
| **1 类：90 年代初 Gañán-Calvo/Vega/Sánchez/Barral 的 JFM/Phys. Fluids 标度律论文** | 检索结果中不存在 | OpenAlex 作者 ID A5070516882 的 1990–1999 作品按引用数降序前 20 条逐条筛查（无一篇为题干所述；更低引条目未穷尽）；Crossref `query.author` 变音符切词失效；`title.search:previously established scaling laws` 0 命中 | 用 [M1] 四条已核验文献；「A. Barral」疑为「A. Barrero」之误，正文中注明 |

---

## 四、清单卷页／标识符更正一览（写作时逐条对照）

| 类 | 清单写法 | 回查结果 | 应改为 |
|---|---|---|---|
| 1 | I ∝ (Qσ/ε₀)^½ | 量纲不是电流 | 照 de la Mora & Loscertales 1994 摘要写 I = f(ε)(γQK/ε)^{1/2} |
| 1 | Gañán-Calvo/Vega/Sánchez/Barral, JFM/Phys. Fluids 早期 90s | 无此记录 | JFM 260, 155 (1994)；J. Aerosol Sci. 28, 249 (1997)；PRL 79, 217 (1997) |
| 3 | Phil. Mag. 14, **177**；「可能无 DOI」 | DOI 存在，页码为 184–186 | 14(87): 184–186, DOI 10.1080/14786448208628425 |
| 5 | 「for the 76 elements」 | 元数据为 94 elements H–Pu | 按出版社题名 |
| 6 | Dion, PRB 71, 165102 (2005)「for solids」 | 该 DOI = Nikolaev 的库仑多极论文 | Dion PRL 92, 246401 (2004)；Klimeš PRB 83, 195131 (2011) |
| 8 | JPCB 107, **5911** | 5911 落在 5906 起那篇的页区间内 | 107(24): 5933–5947 |
| 10 | JPCA 105, **9336** | 实为 9396–9409 | 105(41): 9396–9409 |
| 12 | Behler PRL **100, 016402** | = Klein 2008 无关论文 | PRL 98, 146401 (2007) |
| 12 | ANI-1 = Cheng et al. JCTC 2017 | 实为 Smith/Isayev/Roitberg, *Chem. Sci.* | Chem. Sci. 8, 3192 (2017) |
| 12 | sGDML = Bartók 2017 PRL | 实为 Chmiela et al. *Sci. Adv.* | Sci. Adv. 3, e1603015 (2017) |
| 12 | MACE = **arXiv:2201.11905** | = 暗磁偶极物理论文 | arXiv:2206.07697 |
| 13 | 「The emission of electrons from cold metals」 | 119, 173 的题名是「Electron emission in intense electric fields」 | 用真实题名 |
| 17 | Green 1952 JCP **20, 1745** | 无此记录 | JCP 20, 1281 (1952) / JCP 22, 398 (1954，含黏度表达式) |
| 18 | Nosé DOI 若按 `…00101361` 取 | = Counsell 液晶论文 | 10.1080/00268978400101201 |
| 18 | PR 若按 `10.1063/1.330040` 取 | = J. Appl. Phys. 53, 6956 无关论文 | 10.1063/1.328693 |

---

## 五、给写作阶段的使用提示

1. **第 6/7 讲（电喷雾）**：[M1]（电流标度律，注意量纲）＋ [M2]（泰勒角）＋ [M3]（瑞利极限，注意页码）＋ [M13]（场发射，作为「强场发射」的对照机制）＋ [M16]（裸离子发射实验）。
2. **第 2–5 讲（方法学主干：DFT / 力场）**：[M4]（PBE）＋ [M5]（D3/D4）＋ [M6]（vdW-DF）＋ [M7]（BSSE/counterpoise）。这四条是公式直接进讲义的部分。
3. **第 2–5 讲中的力场段落（极化 / 反应力场）**：[M8]（AMOEBA）＋ [M11]（AMOEBA-IL，开放获取可直接下原文）＋ [M9]（Drude）＋ [M10]（ReaxFF）＋ [M15]（0.8e 缩放，写成「约定 + 综述依据」而非「某人首创」）。
4. **第 2–5 讲中的机器学习势段落**：[M12] 五条齐全，MACE 走 arXiv、其余走 DOI。
5. **第 2–5 讲输运性质段落（电导、黏度）**：[M17]（GK 原始文献）＋ [M14]（NE 偏离的量化定义与理论修正）。
6. **第 2–5 讲系综实现段落**：[M18] 四条（Nosé 两篇 + Hoover + PR）。
7. 本文件只含教科书级奠基文献，不含任何离子液体应用类文献；应用侧引用请从 track-A / track-C 及 `papers_*.json` 取，勿交叉污染。
