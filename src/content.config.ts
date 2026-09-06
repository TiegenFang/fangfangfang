import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";
export const COURSE_PATH = "src/content/courses";
export const PROJECT_PATH = "src/content/projects";
export const GALLERY_PATH = "src/content/gallery";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      /** 归属课程的 slug（src/content/courses/ 下的文件名），声明后该文即为一讲讲义 */
      course: z.string().optional(),
      /** 课程内讲次序号，升序排列；未设置时按发布时间排在有讲次的讲义之后 */
      order: z.number().optional(),
    }),
});

const courses = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${COURSE_PATH}` }),
  schema: z.object({
    title: z.string(),
    /** 短名，用于首页讲义卡片上的课程徽标等紧凑场景；缺省回退到 title */
    shortTitle: z.string().optional(),
    description: z.string(),
    pubDatetime: z.date(),
    draft: z.boolean().optional(),
    canonicalURL: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

/** 项目分类；页内筛选按钮按此顺序展示 */
export const PROJECT_CATEGORIES = ["Research", "Software", "Learning"] as const;
/** 项目状态，见 ADR 0002 */
export const PROJECT_STATUSES = [
  "Active",
  "Completed",
  "Paused",
  "Archived",
] as const;

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${PROJECT_PATH}` }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(PROJECT_CATEGORIES),
    status: z.enum(PROJECT_STATUSES).default("Active"),
    pubDatetime: z.date(),
    tags: z.array(z.string()).default([]),
    /** GitHub 仓库等佐证链接；项目页写叙事，仓库作佐证（软引用） */
    repo: z.url().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

/**
 * 影像集合：一个 markdown 文件代表一个相册（见 CONTEXT.md「相册」词条）。
 * 照片文件与 md 同目录存放，frontmatter 用相对路径引用。
 */
const gallery = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${GALLERY_PATH}` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.date(),
      /** 相册主题分类，如 Campus / Travel / Laboratory / Life / Cats */
      category: z.string().default("Life"),
      cover: image(),
      photos: z
        .array(
          z.object({
            src: image(),
            caption: z.string().optional(),
          })
        )
        .min(1),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = { posts, courses, projects, gallery, pages };
