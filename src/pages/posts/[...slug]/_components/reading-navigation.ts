/**
 * 阅读页双导航（课程导航 + 本文目录）的交互层，由 ReadingNavigation.astro 挂载。
 *
 * 职责：
 * - 抽屉（原生 <dialog>）开合：showModal 提供背景 inert 与焦点圈定，close 归还焦点；
 *   讲义链接走正常导航并收起抽屉；目录链接收起后聚焦真实标题并更新地址栏锚点。
 * - 本文目录滚动跟随（scroll spy）：桌面侧栏与抽屉中的同名章节同步 aria-current；
 *   直接读取几何信息（不缓存），图片/字体引起的尺寸变化天然正确；接近页底时
 *   直接标识最后一章；rAF 节流，一帧只做一次批量布局读取。
 * - 窗口展宽到侧栏常驻断点时收起仍打开的抽屉（抽屉不进入桌面布局）。
 *
 * 每次挂载返回清理函数；astro:page-load 重新挂载，astro:before-swap 释放，
 * 保证换页后不残留监听与打开的抽屉。
 */

/** 视口触底容差（px）：接近页底时目录直接标识最后一章 */
const BOTTOM_EPSILON = 2;
/** 标题越过视口顶部该距离即视为当前章节（px） */
const HEADING_OFFSET = 96;

interface DialogPair {
  trigger: HTMLButtonElement;
  dialog: HTMLDialogElement;
  kind: "course" | "toc";
}

export function mountReadingNavigation(): (() => void) | undefined {
  const root = document.querySelector<HTMLElement>("[data-rn]");
  if (!root) return;

  const events = new AbortController();
  const { signal } = events;

  const pairs: DialogPair[] = [];
  const courseTrigger = root.querySelector<HTMLButtonElement>(
    "[data-rn-trigger='course']"
  );
  const courseDialog =
    root.querySelector<HTMLDialogElement>(".rn-dialog--course");
  const tocTrigger = root.querySelector<HTMLButtonElement>(
    "[data-rn-trigger='toc']"
  );
  const tocDialog = root.querySelector<HTMLDialogElement>(".rn-dialog--toc");
  if (courseTrigger && courseDialog)
    pairs.push({
      trigger: courseTrigger,
      dialog: courseDialog,
      kind: "course",
    });
  if (tocTrigger && tocDialog)
    pairs.push({ trigger: tocTrigger, dialog: tocDialog, kind: "toc" });

  for (const pair of pairs) {
    const { trigger, dialog, kind } = pair;

    trigger.addEventListener(
      "click",
      () => {
        if (dialog.open) return;
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty(
          "--rn-scrollbar-width",
          `${scrollbarWidth}px`
        );
        dialog.showModal();
        trigger.setAttribute("aria-expanded", "true");
      },
      { signal }
    );

    // 关闭（按钮、Esc、选择目标）后焦点由 <dialog> 原生归还触发按钮
    dialog.addEventListener(
      "close",
      () => {
        trigger.setAttribute("aria-expanded", "false");
        if (!root.querySelector("dialog[open]")) {
          document.documentElement.style.removeProperty("--rn-scrollbar-width");
        }
      },
      { signal }
    );

    dialog.addEventListener(
      "click",
      event => {
        const target = event.target as Element | null;
        // 背板（event.target 即 dialog 本身）或关闭按钮：仅收起抽屉
        if (event.target === dialog || target?.closest("[data-rn-close]")) {
          dialog.close();
          return;
        }
        const link = target?.closest("a");
        if (!link) return;
        if (kind === "toc") {
          const slug = link.getAttribute("data-rn-slug") ?? "";
          const heading = slug ? document.getElementById(slug) : null;
          if (!heading) return; // 找不到目标时退化为普通锚点跳转
          event.preventDefault();
          dialog.close();
          jumpToHeading(heading);
        } else {
          // 讲义切换使用正常页面链接，只收起抽屉
          dialog.close();
        }
      },
      { signal }
    );
  }

  // 窗口连续展宽进入桌面断点时，收起已打开的抽屉
  const courseColumn = window.matchMedia("(min-width: 1360px)");
  const tocColumn = window.matchMedia("(min-width: 1120px)");
  const collapseForColumns = () => {
    for (const { dialog, kind } of pairs) {
      if (!dialog.open) continue;
      if (kind === "course" ? courseColumn.matches : tocColumn.matches) {
        dialog.close();
      }
    }
  };
  courseColumn.addEventListener("change", collapseForColumns, { signal });
  tocColumn.addEventListener("change", collapseForColumns, { signal });

  // —— 本文目录滚动跟随 ——
  const tocLinks = Array.from(
    root.querySelectorAll<HTMLAnchorElement>("a[data-rn-toc-link]")
  );
  const sidebarList = root.querySelector<HTMLElement>("[data-rn-toc-list]");

  // 章节按文档顺序去重（侧栏与抽屉各渲染一份链接），并要求真实标题存在
  const seen = new Set<string>();
  const sections: { slug: string; el: HTMLElement }[] = [];
  for (const link of tocLinks) {
    const slug = link.dataset.rnSlug ?? "";
    if (!slug || seen.has(slug)) continue;
    const el = document.getElementById(slug);
    if (!el) continue;
    seen.add(slug);
    sections.push({ slug, el });
  }

  let raf = 0;
  let currentSlug: string | null | undefined;

  const apply = () => {
    raf = 0;
    if (sections.length === 0) return;

    let index = -1;
    for (let i = 0; i < sections.length; i += 1) {
      if (sections[i].el.getBoundingClientRect().top <= HEADING_OFFSET) {
        index = i;
      } else {
        break;
      }
    }
    const doc = document.documentElement;
    const atBottom =
      window.innerHeight + window.scrollY >= doc.scrollHeight - BOTTOM_EPSILON;
    // 已有章节越过顶部且页面触底：直接标识最后一章（对页底附近的短末章更准确）；
    // 整页本就一屏可见的短文不触发，避免初始加载就误标最后一章
    if (index >= 0 && atBottom) {
      index = sections.length - 1;
    }

    const slug = index >= 0 ? sections[index].slug : null;
    if (slug === currentSlug) return;
    currentSlug = slug;

    for (const link of tocLinks) {
      const active = slug !== null && link.dataset.rnSlug === slug;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    // 长目录滚出可视区时让侧栏列表跟随当前章节（抽屉开启时不滚动页面）
    if (slug && sidebarList) {
      sidebarList
        .querySelector<HTMLAnchorElement>(
          `a[data-rn-slug="${CSS.escape(slug)}"]`
        )
        ?.scrollIntoView({ block: "nearest" });
    }
  };

  const requestApply = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  document.addEventListener("scroll", requestApply, {
    passive: true,
    signal,
  });
  // 初次挂载（含带深锚点进入）立即同步一次当前章节
  apply();

  return () => {
    events.abort();
    if (raf) cancelAnimationFrame(raf);
    for (const { dialog } of pairs) {
      if (dialog.open) dialog.close();
    }
    document.documentElement.style.removeProperty("--rn-scrollbar-width");
  };
}

/** 收起抽屉后的章节跳转：更新锚点、滚动定位并聚焦真实标题 */
function jumpToHeading(heading: HTMLElement) {
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // pushState 更新地址栏锚点；目标与当前锚点相同时仍显式滚动定位
  if (window.location.hash !== `#${heading.id}`) {
    history.pushState(history.state, "", `#${heading.id}`);
  }
  heading.scrollIntoView({
    behavior: reduced ? "instant" : "smooth",
    block: "start",
  });
  heading.focus({ preventScroll: true });
}
