import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { getSortedPosts } from "./getSortedPosts";
import { getPostUrl } from "./getPostPaths";
import type { HomeEntry } from "@/types/home";

const introductions: Record<string, string> = {
  "post:hello-world": "为什么开这个博客，以及「方寸之间」会慢慢长成什么样。",
  "post:pinn-variants-survey":
    "从训练、表示和对象三个角度，整理 PINN 与其变体的适用条件。",
  "project:xyzrender-webapp": "把分子构型、轨道与密度变成图像的可视化工作站。",
  "project:pinns-learning":
    "用费曼学习法学习 PINNs，从自动微分走向物理问题与科学计算。",
  "project:interisofoamehd-thermal":
    "用 OpenFOAM 模拟电场中的两相流，研究泰勒锥与射流。",
};

function introduction(key: string, description?: string) {
  const text = introductions[key] ?? description ?? "打开相册，看看这些记录。";
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}

/** Homepage and garden discovery share the author's existing featured choices. */
export async function getHomeContent(locale: string) {
  const [posts, projects, albums, courses] = await Promise.all([
    getCollection("posts"),
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("gallery", ({ data }) => !data.draft),
    getCollection("courses", ({ data }) => !data.draft),
  ]);

  const entries: HomeEntry[] = [
    ...getSortedPosts(posts)
      .filter(({ data }) => !data.course)
      .map(post => ({
        key: `post:${post.id}`,
        kind: "post" as const,
        category: "文章",
        title: post.data.title,
        description: introduction(`post:${post.id}`, post.data.description),
        href: getPostUrl(post.id, post.filePath, locale),
        date: post.data.modDatetime ?? post.data.pubDatetime,
        featured: Boolean(post.data.featured),
      })),
    ...projects
      .filter(({ data }) => data.pubDatetime.getTime() <= Date.now())
      .map(project => ({
        key: `project:${project.id}`,
        kind: "project" as const,
        category: "项目",
        title: project.data.title,
        description: introduction(
          `project:${project.id}`,
          project.data.description
        ),
        href: getRelativeLocaleUrl(locale, `projects/${project.id}`),
        date: project.data.pubDatetime,
        featured: Boolean(project.data.featured),
      })),
    ...albums.map(album => ({
      key: `album:${album.id}`,
      kind: "album" as const,
      category: "相册",
      title: album.data.title,
      description: introduction(`album:${album.id}`, album.data.description),
      href: getRelativeLocaleUrl(locale, `gallery/${album.id}`),
      date: album.data.date,
      featured: Boolean(album.data.featured),
      cover: album.data.cover,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const recommendations = entries.filter(entry => entry.featured);
  const featured = (["post", "project", "album"] as const)
    .map(kind => recommendations.find(entry => entry.kind === kind))
    .filter((entry): entry is HomeEntry => Boolean(entry));
  const shown = new Set(featured.map(entry => entry.key));

  return {
    featured,
    recent: entries.filter(entry => !shown.has(entry.key)).slice(0, 3),
    recommendations,
    courseCount: courses.length,
  };
}
