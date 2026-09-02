/**
 * 一次性生成 public/default-og.jpg（站点的静态分享卡片）。
 * 站点标题/简介变更后可重跑：node scripts/generate-og.mjs
 *
 * 说明：模板自带的动态 OG 图（satori + Google Sans Code）不支持中文字形，
 * 因此本站关闭了 features.dynamicOgImage，改用这张静态图。
 * 注意：FONT_PATH 使用 Windows 系统字体（SimHei），仅保证在 Windows 可复现；
 * 其他平台请把 FONT_PATH 指向任意含中文字形的 ttf/otf 文件。
 */
import { readFileSync, writeFileSync } from "node:fs";
import satori from "satori";
import sharp from "sharp";

const FONT_PATH = "C:\\Windows\\Fonts\\simhei.ttf";
const fontData = readFileSync(FONT_PATH);

const cardBox = {
  position: "absolute",
  top: "-1px",
  right: "-1px",
  border: "4px solid #000",
  background: "#ecebeb",
  opacity: "0.9",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "center",
  margin: "2.5rem",
  width: "88%",
  height: "80%",
};

const cardFrame = {
  border: "4px solid #000",
  background: "#fefbfb",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "center",
  margin: "2rem",
  width: "88%",
  height: "80%",
};

const cardBody = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  margin: "20px",
  width: "90%",
  height: "90%",
};

const svg = await satori(
  {
    type: "div",
    props: {
      style: {
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "SimHei",
      },
      children: [
        { type: "div", props: { style: cardBox } },
        {
          type: "div",
          props: {
            style: cardFrame,
            children: {
              type: "div",
              props: {
                style: cardBody,
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "90%",
                        maxHeight: "90%",
                        overflow: "hidden",
                        textAlign: "center",
                      },
                      children: [
                        {
                          type: "p",
                          props: {
                            style: { fontSize: 96, fontWeight: "bold" },
                            children: "方寸之间",
                          },
                        },
                        {
                          type: "p",
                          props: {
                            style: { fontSize: 32 },
                            children: "Tiegen Fang 的碎碎念与知识分享",
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        justifyContent: "flex-end",
                        width: "100%",
                        marginBottom: "8px",
                        fontSize: 28,
                      },
                      children: {
                        type: "span",
                        props: {
                          style: { overflow: "hidden", fontWeight: "bold" },
                          children: "tiegenfang.github.io",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: [
      { name: "SimHei", data: fontData, weight: 400, style: "normal" },
      { name: "SimHei", data: fontData, weight: 700, style: "normal" },
    ],
  }
);

const jpg = await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toBuffer();

writeFileSync("public/default-og.jpg", jpg);
