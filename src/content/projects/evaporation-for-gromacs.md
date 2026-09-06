---
title: evaporation-for-Gromacs
description: 面向带电体系蒸发过程的 Gromacs 分子动力学脚本集：电场下 NVE 采样参数、VMD/Tcl 轨迹分析与批处理流程。
category: Research
status: Active
pubDatetime: 2026-05-25
tags:
  - Gromacs
  - 分子动力学
  - 蒸发
  - VMD
repo: https://github.com/TiegenFang/evaporation-for-Gromacs
draft: false
---

研究液滴在电场作用下的蒸发时，采样与分析的流程比单次模拟更难管理：外电场下的 NVE 采样、逐帧的界面识别、批量运行的调度。这个仓库沉淀了整套流程——`nve-efield` 的 mdp 参数模板、`analyze_evaporation` 与 `process_frame` 的 VMD/Tcl 分析脚本，以及把预处理、运行和归档串起来的 Shell 批处理脚本。

它服务于电喷雾蒸发相关的分子动力学研究，让"改一个参数、重跑一轮、重新统计"变成一条命令的事。
