---
title: Silica–Water 界面传热研究
description: 论文 "Tailoring Heat Transfer at Silica–Water Interfaces via Hydroxyl and Methyl Surface Groups" 的体系构建脚本与氢键动力学分析工具。
category: Research
status: Completed
pubDatetime: 2026-03-15
tags:
  - 分子动力学
  - 界面传热
  - 氢键
  - Python
repo: https://github.com/TiegenFang/silica-water-heat-transfer
draft: false
---

这项研究关心一个具体的问题：二氧化硅表面的羟基与甲基修饰，如何调控固–液界面的传热。仓库公开了论文中使用的两部分脚本——`system_setup` 负责构建二氧化硅–水界面体系并评估接触角、黏附功与界面热阻（ITR），附势函数与结构文件；`hbonds_analysis` 量化功能化表面的氢键寿命与形成/断裂速率。

脚本以"可复现优先"的原则按研究原样共享，用于支持论文结果的透明与复核。
