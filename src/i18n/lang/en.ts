import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Home",
    posts: "Posts",
    courses: "Courses",
    tags: "Tags",
    projects: "Projects",
    gallery: "Gallery",
    about: "About",
    archives: "Archives",
    search: "Search",
  },
  post: {
    publishedAt: "Published at",
    updatedAt: "Updated",
    sharePostIntro: "Share this post:",
    sharePostOn: "Share this post on {{platform}}",
    sharePostViaEmail: "Share this post via email",
    tagLabel: "Tags",
    backToTop: "Back to top",
    goBack: "Go back",
    editPage: "Edit page",
    previousPost: "Previous Post",
    nextPost: "Next Post",
    tableOfContents: "On this page",
  },
  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  home: {
    socialLinks: "Social Links",
    featured: "Featured",
    recentPosts: "Recent Posts",
    allPosts: "All Posts",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "Tag",
    tagDesc: "All the articles with the tag",

    tagsTitle: "Tags",
    tagsDesc: "All the tags used in posts.",

    postsTitle: "Posts",
    postsDesc: "All the articles I've posted.",

    coursesTitle: "Courses",
    coursesDesc: "Structured series of notes and tutorials.",

    projectsTitle: "Projects",
    projectsDesc: "Research, software and learning repos.",

    galleryTitle: "Gallery",
    galleryDesc: "Photos, places and fragments of time.",

    archivesTitle: "Archives",
    archivesDesc: "All the articles I've archived.",

    searchTitle: "Search",
    searchDesc: "Search any article ...",
  },
  gallery: {
    photosCount: "{{count}} photos",
    empty: "Albums are being curated. Stay tuned.",
  },
  project: {
    filterAll: "All",
    statusActive: "Active",
    statusCompleted: "Completed",
    statusPaused: "Paused",
    statusArchived: "Archived",
    repoLink: "View repo",
  },
  course: {
    lecturesTitle: "Lectures",
    lecturesCount: "{{count}} lectures",
    lecturePrefix: "Lecture {{index}}",
    empty: "No lectures in this course yet.",
    backToCourses: "Back to courses",
    navigation: "Course navigation",
    previousLecture: "Previous Lecture",
    nextLecture: "Next Lecture",
  },
  time: {
    dateFormat: "D MMM, YYYY",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    closeNavigation: "Close navigation",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search posts...",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
    lightboxClose: "Close",
    lightboxPrev: "Previous photo",
    lightboxNext: "Next photo",
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
} satisfies UIStrings;
