---
title: 一条龙自动部署：用 GitHub Actions 让博客"提交即上线"
date: 2026-08-07 18:00:00
updated: 2026-08-07 18:00:00
comments: true
categories:
  - 教程
tags:
  - 教程
  - GitHub Actions
  - CI
  - 自动部署
  - Hexo
toc: true
---

> 静态博客最舒服的体验是什么？——写完文章提交到 Git，剩下的事（构建、部署、上线）全部自动完成。GitHub Actions 就是干这个的免费 CI/CD 服务。本文用一个真实的 Hexo + GitHub Pages 案例，讲清楚整个流水线怎么搭。

## 为什么需要自动部署

手动部署的痛点：

- 每次写完文章要本地跑 `hexo generate` + 推送到线上分支
- 换电脑/换环境就麻烦（依赖、Node 版本、主题文件都要重新配）
- 容易忘记"构建了没、推了没"

自动部署（CI/CD）把"构建 + 部署"变成一条流水线：**你只管提交代码，剩下全是机器的活**。

## 核心概念

- **Workflow（工作流）**：一个 `.yml` 文件，定义流水线的步骤
- **Job（任务）**：工作流里的一个执行单元（可以多个，可并行）
- **Step（步骤）**：任务里的每一步操作
- **Trigger（触发条件）**：什么事件触发流水线（如 push、PR、定时）

## 方案设计

本站的部署策略：

- **source 分支**：存博客源码（Markdown 文章、配置、主题）
- **main 分支**：存构建产物（编译后的 HTML，GitHub Pages 直接发布这个分支）
- **触发规则**：push 到 source → 自动构建 → 推送到 main → 网站更新

## 完整 Workflow 文件

在仓库 `.github/workflows/deploy.yml` 创建：

```yaml
name: 自动部署博客

# 触发条件：push 到 source 分支时自动运行；也支持手动触发
on:
  push:
    branches:
      - source
  workflow_dispatch:  # 手动触发（Actions 页面可点）

# 需要写 main 分支 + 部署 Pages 的权限
permissions:
  contents: write
  pages: write
  id-token: write

# 同一时间只允许一个部署在跑，避免排队冲突
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. 拉取源码
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          ref: source

      # 2. 安装 Node.js
      - name: 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # 3. 安装依赖
      - name: 安装依赖
        run: npm ci

      # 4. 构建静态网站（生成 public/ 目录）
      - name: 构建网站
        run: npx hexo generate

      # 5. 上传构建产物（GitHub Pages 专用）
      - name: 上传 Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

      # 6. 部署到 GitHub Pages
      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      # 7. 同时推送到 main 分支（双分支备份）
      - name: 推送到 main 分支
        run: |
          cd public
          git init -b main
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
          git push --force https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/你的用户名/你的仓库.git main
```

## 关键点讲解

**1. GitHub Pages 构建方式二选一**
- **方式 A（本文用）**：Pages 设置里选 "GitHub Actions" 作为构建来源，用 `upload-pages-artifact` + `deploy-pages` 部署
- **方式 B（传统）**：Pages 直接发布 main 分支，Workflow 只需要推送到 main 即可

两种都能用，方式 A 更现代、排队更快。

**2. 为什么用 `npm ci` 而不是 `npm install`**
`npm ci` 严格按照 `package-lock.json` 安装，保证 CI 环境和本地环境依赖完全一致，且更快更稳。

**3. `secrets.GITHUB_TOKEN` 是什么**
GitHub Actions 自动生成的临时令牌，每次运行自动注入，有写仓库的权限（在 permissions 里声明），用完即失效，无需自己配置密钥。

**4. `git init -b main` 的坑**
默认 `git init` 创建的是 `master` 分支，推送到 `main` 会报 "refspec main does not match" 错误。**必须加 `-b main`**（git 2.28+ 支持）。

## 配置 GitHub Pages

1. 仓库 → **Settings** → **Pages**
2. **Build and deployment** 选 **GitHub Actions**（方式 A）或对应分支（方式 B）
3. 保存后，第一次 push 触发 Workflow

## 验证与排错

**怎么看运行状态**：仓库 → **Actions** 标签，能看到每次运行的日志。绿色 ✓ = 成功，红色 ✗ = 失败。

**常见错误**：

| 报错 | 原因 | 解决 |
|---|---|---|
| `refspec main does not match` | git init 默认 master 分支 | `git init -b main` |
| `npm ci` 失败 | lock 文件与 package.json 不一致 | 本地重新 `npm install` 后提交新的 lock |
| 部署卡 `in_progress` 很久 | GitHub Pages 排队拥堵 | 等待或重新触发（workflow_dispatch） |
| 网站没更新 | 缓存 / 部署未完成 | 看 Action 日志 + 检查页面 Last-Modified |

**验证网站是否最新**：浏览器开发者工具看响应头 `Last-Modified`，等于最近部署时间即成功。

## 进阶玩法

- **多 Job 并行**：lint + 构建 + 部署分开跑
- **定时发布**：`on: schedule` + cron 表达式，定时构建（如每周五自动抓取并发布周报）
- **分支保护**：要求 PR 通过 CI 才能合并
- **环境变量/密钥**：`secrets` 存 API key，`env` 传给构建步骤

## 小结

| 环节 | 你要做的 | 机器要做的 |
|---|---|---|
| 写文章 | 提交到 source 分支 | — |
| 构建 | — | checkout → npm ci → hexo generate |
| 部署 | — | 上传 artifact → deploy-pages → 推 main |
| 上线 | 等 1 分钟 | — |

搭好之后，"写文章 → git push"就是全部流程。本站目前就是这么跑的：文章提交到 source 分支后约 1 分钟自动上线。建议新博客一开始就配好自动部署，省掉后面所有手动操作。
