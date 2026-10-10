import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

/**
 * Returns the adjacent published posts for `post`, or `null` at boundaries.
 *
 * - Lecture posts (`data.course` set) navigate within their course's
 *   lecture order (`lectures`, ascending as returned by `getCourseLectures`);
 *   they never fall back to the global timeline. The first/last lecture
 *   has `prevPost`/`nextPost` of `null`.
 * - Independent posts follow `timeline` (newest-first, as returned by
 *   `getSortedPosts`): `prevPost` is the older post, `nextPost` the newer.
 */
export function getPostNavigation(
  post: Post,
  timeline: Post[],
  lectures: Post[]
): { prevPost: Post | null; nextPost: Post | null } {
  if (post.data.course) {
    const lectureIndex = lectures.findIndex(lecture => lecture.id === post.id);
    if (lectureIndex !== -1) {
      return {
        prevPost: lectureIndex > 0 ? lectures[lectureIndex - 1] : null,
        nextPost:
          lectureIndex < lectures.length - 1
            ? lectures[lectureIndex + 1]
            : null,
      };
    }
    return { prevPost: null, nextPost: null };
  }

  const timelineIndex = timeline.findIndex(entry => entry.id === post.id);
  if (timelineIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  return {
    prevPost:
      timelineIndex < timeline.length - 1 ? timeline[timelineIndex + 1] : null,
    nextPost: timelineIndex > 0 ? timeline[timelineIndex - 1] : null,
  };
}
