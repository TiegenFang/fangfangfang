---
title: XYZRender Workstation
description: 基于 xyzrender 的分子与量子化学 Flask Web 可视化工作站：渲染、旋转、Multiwfn 服务与 Windows 桌面打包。
category: Software
status: Active
pubDatetime: 2026-09-02
tags:
  - Python
  - Flask
  - 可视化
  - 量子化学
repo: https://github.com/TiegenFang/xyzrender-webapp
featured: true
draft: false
---

做量子化学计算的人都有一个共同的痛点：算完的分子构型、轨道、密度，要出一张"能放进论文"的图，往往要在好几个工具之间倒手。XYZRender Workstation 把这件事搬进了浏览器——基于 xyzrender 0.3.6 内核的 Flask Web 工作站，划分子中渲染、模型、旋转与 Multiwfn 服务四个模块，支持批量预览、正式出图（FIGURE）与任务隔离（TEMP）。

桌面端通过 pywebview 打包成 Windows 应用；Web 版不需要任何桌面依赖，`pip install` 即用。
