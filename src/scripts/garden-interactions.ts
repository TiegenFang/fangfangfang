import type { GardenRecommendation } from "@/types/home";

function isRecommendation(value: unknown): value is GardenRecommendation {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return ["title", "description", "href", "category"].every(
    key => typeof entry[key] === "string" && entry[key] !== ""
  );
}

/** DOM controls remain usable independently of the WebGL scene. */
export function mountGardenInteractions(garden: HTMLElement): () => void {
  const events = new AbortController();
  const { signal } = events;
  const feed = garden.querySelector<HTMLButtonElement>("[data-feed-cat]")!;
  const wander = garden.querySelector<HTMLButtonElement>("[data-wander]")!;
  const response = garden.querySelector<HTMLElement>("[data-cat-response]")!;
  const result = garden.querySelector<HTMLElement>("[data-garden-result]")!;
  const announcement = garden.querySelector<HTMLElement>(
    "[data-recommendation-status]"
  )!;
  const stage = garden.querySelector<HTMLElement>("[data-garden]")!;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let feeding = false;
  let reply = 0;
  const replies = [
    "猫条收下了，陪我坐一会儿。",
    "吃饱了。你慢慢逛，我在这里。",
    "这一根，我就不客气啦。",
  ];

  feed.hidden = false;
  feed.addEventListener(
    "click",
    () => {
      if (feeding) return;
      response.textContent = `香香：${replies[reply++ % replies.length]}`;
      if (motion.matches) return;
      feeding = true;
      garden.dataset.feeding = "";
      stage.dispatchEvent(new Event("garden:feed"));
      timer = setTimeout(() => {
        feeding = false;
        delete garden.dataset.feeding;
      }, 1000);
    },
    { signal }
  );

  let pool: GardenRecommendation[] = [];
  try {
    const data: unknown = JSON.parse(garden.dataset.recommendations ?? "[]");
    if (Array.isArray(data)) pool = data.filter(isRecommendation);
  } catch {
    // Static featured links remain available if discovery data is unavailable.
  }
  let remaining: number[] = [];
  let last = -1;
  wander.hidden = pool.length === 0;
  wander.addEventListener(
    "click",
    () => {
      if (!pool.length) return;
      if (!remaining.length) {
        remaining = pool.map((_, index) => index);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        const end = remaining.length - 1;
        if (remaining[end] === last && end > 0) {
          [remaining[0], remaining[end]] = [remaining[end], remaining[0]];
        }
      }
      last = remaining.pop()!;
      const entry = pool[last];
      result.querySelector<HTMLElement>("[data-result-category]")!.textContent =
        entry.category;
      result.querySelector<HTMLElement>("[data-result-title]")!.textContent =
        entry.title;
      result.querySelector<HTMLElement>(
        "[data-result-description]"
      )!.textContent = entry.description;
      const link =
        result.querySelector<HTMLAnchorElement>("[data-result-link]")!;
      link.href = entry.href;
      link.setAttribute("aria-label", `去看看：${entry.title}`);
      result.hidden = false;
      wander.setAttribute("aria-expanded", "true");
      announcement.textContent = `${entry.category}：${entry.title}。${entry.description}`;
    },
    { signal }
  );

  return () => {
    events.abort();
    clearTimeout(timer);
    delete garden.dataset.feeding;
  };
}
