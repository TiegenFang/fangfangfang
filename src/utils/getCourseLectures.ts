import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";

/**
 * Returns published lectures belonging to `courseSlug`, ordered by their
 * `order` field (ascending, unspecified last), ties broken by publish time.
 */
export function getCourseLectures(
  posts: CollectionEntry<"posts">[],
  courseSlug: string
) {
  return posts
    .filter(post => post.data.course === courseSlug)
    .filter(postFilter)
    .sort((a, b) => {
      const orderA = a.data.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.data.order ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;
      return (
        new Date(a.data.pubDatetime).getTime() -
        new Date(b.data.pubDatetime).getTime()
      );
    });
}
