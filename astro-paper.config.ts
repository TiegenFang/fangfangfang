import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://tiegenfang.github.io/fangfangfang/",
    title: "方寸之间",
    description: "Tiegen Fang 的碎碎念与知识分享",
    author: "Tiegen Fang",
    profile: "https://github.com/TiegenFang",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/TiegenFang/fangfangfang/edit/main/",
    },
    search: "pagefind",
  },
  socials: [{ name: "github", url: "https://github.com/TiegenFang" }],
  shareLinks: [],
});
