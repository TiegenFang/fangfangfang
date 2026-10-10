export interface UIStrings {
  nav: {
    home: string;
    posts: string;
    courses: string;
    tags: string;
    projects: string;
    gallery: string;
    about: string;
    archives: string;
    search: string;
  };
  post: {
    publishedAt: string;
    updatedAt: string;
    sharePostIntro: string;
    sharePostOn: string;
    sharePostViaEmail: string;
    tagLabel: string;
    backToTop: string;
    goBack: string;
    editPage: string;
    previousPost: string;
    nextPost: string;
    tableOfContents: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
  };
  home: {
    socialLinks: string;
    featured: string;
    recentPosts: string;
    allPosts: string;
  };
  footer: {
    copyright: string;
    allRightsReserved: string;
  };
  pages: {
    tagTitle: string;
    tagDesc: string;

    tagsTitle: string;
    tagsDesc: string;

    postsTitle: string;
    postsDesc: string;

    coursesTitle: string;
    coursesDesc: string;

    projectsTitle: string;
    projectsDesc: string;

    galleryTitle: string;
    galleryDesc: string;

    archivesTitle: string;
    archivesDesc: string;

    searchTitle: string;
    searchDesc: string;
  };
  gallery: {
    photosCount: string;
    empty: string;
  };
  project: {
    /** 分类与筛选按钮（All / Research / Software / Learning 中的 All） */
    filterAll: string;
    statusActive: string;
    statusCompleted: string;
    statusPaused: string;
    statusArchived: string;
    repoLink: string;
  };
  course: {
    lecturesTitle: string;
    lecturesCount: string;
    lecturePrefix: string;
    empty: string;
    backToCourses: string;
    navigation: string;
    previousLecture: string;
    nextLecture: string;
  };
  time: {
    /** dayjs format tokens, e.g. "YYYY年M月D日" */
    dateFormat: string;
  };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    closeNavigation: string;
    toggleTheme: string;
    searchPlaceholder: string;
    noResults: string;
    goToPreviousPage: string;
    goToNextPage: string;
    lightboxClose: string;
    lightboxPrev: string;
    lightboxNext: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
}
