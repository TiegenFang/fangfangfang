import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首页",
    posts: "博客",
    courses: "课程",
    tags: "标签",
    projects: "项目",
    gallery: "影像",
    about: "关于",
    archives: "归档",
    search: "搜索",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享这篇文章：",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享",
    tagLabel: "标签",
    backToTop: "回到顶部",
    goBack: "返回",
    editPage: "编辑此页",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "页",
  },
  home: {
    socialLinks: "社交链接",
    featured: "精选",
    recentPosts: "最近文章",
    allPosts: "全部文章",
  },
  footer: {
    copyright: "版权所有",
    allRightsReserved: "保留所有权利。",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "包含此标签的所有文章：",

    tagsTitle: "标签",
    tagsDesc: "文章用到的所有标签。",

    postsTitle: "博客",
    postsDesc: "我发布的所有文章。",

    coursesTitle: "课程",
    coursesDesc: "成体系的笔记与教程系列。",

    projectsTitle: "项目",
    projectsDesc: "科研、软件与学习仓库。",

    galleryTitle: "影像",
    galleryDesc: "照片、地点与时间的碎片。",

    archivesTitle: "归档",
    archivesDesc: "按年份归档的全部文章。",

    searchTitle: "搜索",
    searchDesc: "搜索任意文章……",
  },
  gallery: {
    photosCount: "共 {{count}} 张",
    empty: "相册还在整理中，敬请期待。",
  },
  project: {
    filterAll: "全部",
    statusActive: "进行中",
    statusCompleted: "已完成",
    statusPaused: "暂停",
    statusArchived: "已归档",
    repoLink: "查看仓库",
  },
  course: {
    lecturesTitle: "课程讲义",
    lecturesCount: "共 {{count}} 讲",
    lecturePrefix: "第 {{index}} 讲",
    empty: "这门课还没有讲义。",
    backToCourses: "返回课程列表",
  },
  time: {
    dateFormat: "YYYY年M月D日",
  },
  a11y: {
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章……",
    noResults: "没有找到结果",
    goToPreviousPage: "上一页",
    goToNextPage: "下一页",
    lightboxClose: "关闭",
    lightboxPrev: "上一张",
    lightboxNext: "下一张",
  },
  notFound: {
    title: "404 Not Found",
    message: "页面不存在",
    goHome: "回到首页",
  },
} satisfies UIStrings;
