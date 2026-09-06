---
title: Alumina Nanopore & Pipe Generator
description: 面向分子动力学模拟的氧化铝纳米管与多孔底板建模工具包：晶体学定向切割、边缘化学修补与拓扑重构。
category: Software
status: Active
pubDatetime: 2026-01-26
tags:
  - 分子动力学
  - 建模工具
  - 氧化铝
  - Python
repo: https://github.com/TiegenFang/Alumina-Nanopore-Pipe-Generator-for-MD-Simulations
draft: false
---

做纳米受限输运的 MD 模拟，第一步的建模往往比模拟本身更花时间：从无限周期性晶体切出一个稳定的有限纳米管，边缘容易崩。这个工具包为 α-Al₂O₃（刚玉）构建高精度的纳米受限空间模型——沿晶体学轴线定向切割以保持 Al–O 环完整，对配位不足的边缘原子做加氢修补（≡Al–OH）模拟真实质子化状态，并用 K-D Tree 邻居搜索处理非周期拓扑重构。

建模策略参考计算矿物学领域的经典方法论，输出可直接用于 Gromacs/LAMMPS 的构型文件。
