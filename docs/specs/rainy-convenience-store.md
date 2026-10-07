# 便利店场景与首页样式统一

日期：2026-10-07。状态：用户最终指定的 Hoshi Mart HTML 原文件已接入，首页字体与色板已恢复，本地发布检查通过。GitHub Pages 随 `main` 分支推送自动发布。

## 用户最终选择

“以这个为准，不需要对html做改动，这个html中已经有了互动了，恢复内页字体与色版，然后git上传配置页面。”

最终场景为 `public/scenes/Hoshi Mart — a corner store diorama.html`，接入前 SHA-256：`461A946F4953432955354C7390E7BAC0DF9012DE76B8A8AF417490C54A0BDC51`。文件内容必须保持不变，包括其模型、材质、灯光、字体、配色、控件、动画与交互。

- 使用原文件已有的自由相机、香香互动、货架与顾客互动、补货、价格标签、昼夜、天气及像素风格切换。
- 原文件的界面控件和触摸规则随原文件保留，取代此前关于无界面控件、手机单指滚动与双指操作的设计。
- 不注入额外手势、键盘、暂停或运行时代码；不修改源文件来迁就先前场景接口。
- 旧小院、旧互动、派生素材与失败的便利店原型删除。上一轮加工过的 `rainy-night-corner.html` 也删除。

## 首页接入

- `src/components/RainyCorner.astro` 仅通过 iframe 嵌入原文件，保留其独立运行环境。文件名经过 URL 编码，并由 `getAssetPath` 添加 `/fangfangfang` 部署前缀。
- iframe 不设置阻止原脚本的 sandbox；外层不提供另一套控件。页面切换由浏览器卸载 iframe。
- 原 HTML 排除在 Prettier 自动格式化之外，防止提交检查或后续格式化改写其字节。
- `src/pages/index.astro` 复用全站 `Layout`、`font-app` 与 `src/styles/theme.css`，删除首页专用色板、Georgia / Songti 字体覆盖。精选、最近内容和简短课程入口保持原有布局。
- 场景自己的样式留在 iframe 内，不改变原文件，也不会覆盖博客字体与色板。

## 发布方式

- GitHub Pages 现有配置使用 GitHub Actions，源分支为 `main`；站点为 `https://tiegenfang.github.io/fangfangfang/`。
- `.github/workflows/deploy.yml` 在 `main` 推送时构建并上传 `dist`，随后发布 Pages；现有配置满足本次需求。
- 发布前运行 lint、Prettier 检查、完整 Astro / Pagefind 构建与 Git 空白检查，核对构建产物中的场景文件哈希。
- 发布后核对 Actions 对应提交成功、线上首页引用正确场景，并比对线上 HTML 字节。

## 验证边界

本地 lint、Prettier 格式检查与完整 Astro / Pagefind 构建通过，共生成 63 个站点页面、索引 32 页。原 HTML 接入前后哈希保持相同，`dist` 场景与原文件逐字节一致；生成首页使用带部署前缀的编码路径，外层组件没有交互脚本或样式覆盖。

Browser 之前的已保存权限校验失败。本轮不绕过该限制；源码、构建与 HTTP 发布核验不等于真实 WebGL 画面或设备触摸验收。
