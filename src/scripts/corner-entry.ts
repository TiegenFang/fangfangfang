type SceneWindow = Window & { __hoshi?: { ctx?: object } };

function setProgress(loader: HTMLElement, value: number, stage: string) {
  const progress = loader.querySelector<HTMLElement>("[data-corner-progress]");
  progress?.style.setProperty("--progress", `${value}%`);
  progress?.setAttribute("aria-valuenow", String(value));
  progress?.setAttribute("aria-valuetext", stage);
}

/** Keep a normal link until the visitor chooses to open the door. */
export function mountCornerEntrance() {
  const root = document.querySelector<HTMLElement>("[data-corner-entrance]");
  const link = root?.querySelector<HTMLAnchorElement>("[data-corner-link]");
  const loader = root?.querySelector<HTMLElement>("[data-corner-loader]");
  if (!root || !link || !loader) return;

  const events = new AbortController();
  const timers = new Set<number>();
  let entering = false;
  const reset = () => {
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
    entering = false;
    root.classList.remove("is-opening");
    link.removeAttribute("aria-busy");
    loader.hidden = true;
  };
  link.addEventListener(
    "click",
    event => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      if (entering) return;
      entering = true;
      root.classList.add("is-opening");
      link.setAttribute("aria-busy", "true");
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      timers.add(
        window.setTimeout(
          () => {
            loader.hidden = false;
            setProgress(loader, 18, "正在打开便利店");
          },
          reduced ? 0 : 760
        )
      );
      timers.add(
        window.setTimeout(
          () => {
            window.location.assign(link.href);
          },
          reduced ? 120 : 1160
        )
      );
    },
    { signal: events.signal }
  );
  window.addEventListener("pagehide", reset, { signal: events.signal });
  return () => {
    reset();
    events.abort();
  };
}

/** Keep the loading screen until the original scene has initialized and drawn. */
export function mountCornerScene() {
  const frame = document.querySelector<HTMLIFrameElement>(
    "[data-corner-scene]"
  );
  const loader = document.querySelector<HTMLElement>("[data-corner-loader]");
  const recovery = loader?.querySelector<HTMLElement>("[data-corner-recovery]");
  const retry = loader?.querySelector<HTMLButtonElement>("[data-corner-retry]");
  if (!frame || !loader || !recovery || !retry) return;

  const events = new AbortController();
  const timers = new Set<number>();
  let sceneWindow: SceneWindow | null = null;
  let sceneRaf = 0;
  let generation = 0;
  let startedAt = performance.now();
  let ready = false;
  let waitingForLoad = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clearPending = () => {
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
    if (sceneRaf) sceneWindow?.cancelAnimationFrame(sceneRaf);
    sceneRaf = 0;
  };
  const later = (callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      callback();
    }, delay);
    timers.add(id);
  };
  const fail = () => {
    generation++;
    clearPending();
    recovery.hidden = false;
    loader.setAttribute("data-load-failed", "");
  };
  const finish = (current: number) => {
    if (events.signal.aborted || current !== generation) return;
    setProgress(loader, 100, "便利店已准备好");
    later(
      () => {
        loader.classList.add("is-complete");
        later(
          () => {
            loader.hidden = true;
            frame.inert = false;
          },
          reduced ? 0 : 180
        );
      },
      reduced ? 0 : Math.max(260, 400 - (performance.now() - startedAt))
    );
  };
  const poll = (current: number) => {
    if (events.signal.aborted || current !== generation || ready) return;
    try {
      sceneWindow = frame.contentWindow as SceneWindow | null;
      if (!waitingForLoad && sceneWindow?.__hoshi?.ctx) {
        ready = true;
        clearPending();
        setProgress(loader, 85, "正在显示便利店");
        sceneRaf = sceneWindow.requestAnimationFrame(() => {
          if (events.signal.aborted || current !== generation) return;
          sceneRaf = sceneWindow!.requestAnimationFrame(() => finish(current));
        });
        return;
      }
    } catch {
      fail();
      return;
    }
    if (performance.now() - startedAt > 25000) fail();
    else later(() => poll(current), 60);
  };
  const start = (waitForLoad = false) => {
    generation++;
    clearPending();
    startedAt = performance.now();
    ready = false;
    waitingForLoad = waitForLoad;
    recovery.hidden = true;
    loader.hidden = false;
    frame.inert = true;
    loader.classList.remove("is-complete");
    loader.removeAttribute("data-load-failed");
    setProgress(loader, 18, "正在打开便利店");
    poll(generation);
  };
  frame.addEventListener(
    "load",
    () => {
      waitingForLoad = false;
      if (!ready && recovery.hidden)
        setProgress(loader, 55, "正在准备店内场景");
    },
    { signal: events.signal }
  );
  frame.addEventListener("error", fail, { signal: events.signal });
  retry.addEventListener(
    "click",
    () => {
      start(true);
      frame.src = frame.src;
    },
    { signal: events.signal }
  );
  window.addEventListener(
    "pageshow",
    event => {
      if (event.persisted && !loader.hidden) start();
    },
    { signal: events.signal }
  );
  window.addEventListener("pagehide", clearPending, { signal: events.signal });
  start();
  return () => {
    generation++;
    clearPending();
    events.abort();
  };
}
