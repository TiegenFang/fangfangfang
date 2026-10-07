import type { ImageMetadata } from "astro";

export interface HomeEntry {
  title: string;
  description: string;
  href: string;
  category: string;
  key: string;
  kind: "post" | "project" | "album";
  date: Date;
  featured: boolean;
  cover?: ImageMetadata;
}
