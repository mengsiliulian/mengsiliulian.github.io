---
index_img: /img/cover-default.png
title: 十分钟搭建自己的 AI 新闻博客：Hexo + GitHub Pages 零成本方案
date: 2026-08-07 12:30:00
updated: 2026-08-07 12:30:00
comments: true
categories:
  - 教程
tags:
  - 教程
  - Hexo
  - GitHub Pages
  - 博客搭建
  - 免费
toc: true
---

> 这是本站的搭建过程实录：一个**完全免费**、**不需要服务器**、**写文章像发朋友圈一样简单**的博客方案。本文会把关键步骤和踩过的坑都写出来，照做即可。

---

## 🎯 这套方案是什么

| 组件 | 选型 | 花费 |
|---|---|---|
| 博客框架 | Hexo（Node.js 静态站点生成器） | ¥0 |
| 主题 | Fluid（中文友好、功能全） | ¥0 |
| 托管 | GitHub Pages | ¥0 |
| 评论 | giscus（GitHub Discussions 驱动） | ¥0 |
| 自动部署 | GitHub Actions | ¥0 |

**核心思路**：Hexo 把 Markdown 文章编译成纯静态 HTML，推到 GitHub 仓库后由 GitHub Pages 免费托管。整套下来**一分钱不花**，还能绑定自己的域名（可选）。

---

## 🛠️ 第一步：本地环境准备

需要三样东西（都是免费软件）：

1. **Git** — 版本管理工具
2. **Node.js** — Hexo 的运行环境
3. **GitHub 账号** — 托管代码和网站

装好后在命令行验证：

```bash
git --version
node -v
npm -v
```

## 📦 第二步：初始化 Hexo 博客

```bash
npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
```

安装 Fluid 主题：

```bash
npm install hexo-theme-fluid
```

在站点根目录的 `_config.yml` 里把主题切换为 Fluid，并把 Fluid 的配置复制一份到根目录 `_config.fluid.yml`（主题配置覆盖方式，升级不怕丢自定义）。

## 🚀 第三步：部署到 GitHub Pages

1. 在 GitHub 新建仓库，名字叫 `你的用户名.github.io`
2. 本地推送到仓库的 `source` 分支（源码备份）
3. 配置 GitHub Actions 自动构建，把构建产物推到 `main` 分支 → Pages 托管

核心的 `deploy.yml` 工作流大致是这样（关键点已注释）：

```yaml
name: 自动部署博客
on:
  push:
    branches: [source]   # 推 source 自动触发
  workflow_dispatch:     # 支持手动触发
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: source }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx hexo generate        # 生成静态站
      - uses: actions/upload-pages-artifact@v3
        with: { path: public }
      - uses: actions/deploy-pages@v4 # 部署到 Pages
```

## ✍️ 第四步：日常写文章

**方式一（推荐）：GitHub 网页直接写**
- 打开仓库 → 切到 `source` 分支 → 进 `source/_posts/` → Add file / 铅笔编辑
- 写 Markdown → Commit → **自动构建上线**，全程不用命令行

**方式二：本地命令行**

```bash
hexo new post "my-new-post"
hexo clean; hexo generate; hexo deploy
git add -A; git commit -m "update"; git push origin source
```

## 💬 第五步：加评论（giscus）

giscus 用 GitHub Discussions 做评论系统，访客用 GitHub 账号即可评论，免邮箱注册：

1. 仓库设置里打开 Discussions
2. 安装 giscus App 并授权
3. 在 giscus.app 填仓库名，生成配置代码
4. 贴进主题配置，文章 front-matter 加 `comments: true`

---

## 🐛 踩过的坑（省你几小时）

- **`git init` 默认建 master 分支** → 部署报 "refspec main does not match"。解决：`git init -b main`
- **GitHub Pages 部署偶发排队拥堵** → 连续多次 push 会触发，部署卡 10 分钟超时。解决：加 `workflow_dispatch` 手动触发，拥堵时等一段时间再重跑
- **评论不显示** → Fluid 主题的字段是 `post.comments.enable` + `type: giscus`，且文章要有 `comments: true`
- **国内访问慢** → 把第三方 CDN 资源自托管到 `/lib`，全站唯一外部依赖只剩评论
- **分享卡片空白** → 封面用 SVG 微信/QQ 不认，转成 1200×630 的 PNG 才行

---

## 📌 小结

这套方案适合想**零成本**搭博客、又不想折腾服务器的人。写文章的核心体验是：**网页上写 Markdown → 点 Commit → 自动上线**，比很多付费方案还省心。

> 本文为本站搭建经验分享，具体版本号与操作界面可能随更新变化，遇到问题可查阅官方文档：Hexo（hexo.io）、Fluid（fluid.ist）、GitHub Pages（pages.github.com）。

评论区聊聊你的搭建经历 👇
