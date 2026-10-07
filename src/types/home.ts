import type { ImageMetadata } from "astro";

export interface GardenRecommendation {
  title: string;
  description: string;
  href: string;
  category: string;
}

export interface HomeEntry extends GardenRecommendation {
  key: string;
  kind: "post" | "project" | "album";
  date: Date;
  featured: boolean;
  cover?: ImageMetadata;
}
