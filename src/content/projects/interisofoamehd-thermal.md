---
title: interIsoFoamEHD-thermal
description: 基于 OpenFOAM 的高分辨率两相电流体动力学（EHD）求解器，用 isoAdvector 界面捕捉方法模拟泰勒锥射流动力学。
category: Research
status: Active
pubDatetime: 2026-05-09
tags:
  - OpenFOAM
  - EHD
  - 两相流
  - 泰勒锥射流
repo: https://github.com/TiegenFang/interIsoFoamEHD-thermal
featured: true
draft: false
---

电喷雾的发射端是曲率半径纳米量级的泰勒锥，连续介质求解器在这里同时面对两个界面问题：液–气界面的精确捕捉，以及电场对界面的应力耦合。这个仓库基于 OpenFOAM v1912 实现了两相 EHD 求解器：在 interIsoFoamEHD 的框架上引入 isoAdvector 界面捕捉，减小数值扩散，用于模拟两种不混溶、低电导率介质体系中的泰勒锥射流动力学。

仓库提供了完整的求解器源码与物性库，教程目录里附带 2D 轴对称与全 3D 的自动网格生成脚本，算例覆盖基础泰勒锥 2D 轴对称模拟与多级轴向加速。
