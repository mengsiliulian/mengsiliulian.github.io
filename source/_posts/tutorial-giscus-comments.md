---
title: 给静态博客接入 giscus 评论：GitHub 账号即可，十分钟搞定
date: 2026-08-07 17:30:00
updated: 2026-08-07 17:30:00
comments: true
categories:
  - 教程
tags:
  - 教程
  - giscus
  - 评论
  - GitHub
  - Hexo
toc: true
---

> 静态博客（Hexo、Hugo、Jekyll 等）没有后端，评论功能怎么加？giscus 是目前最优雅的免费方案：基于 GitHub Discussions，访客用 GitHub 账号登录即可评论，数据存在 GitHub 上，零服务器成本。本文以 Hexo + Fluid 主题为例，完整走一遍接入流程。

## giscus 是什么

- **原理**：评论内容存储在 GitHub 仓库的 Discussions（讨论）里，网页通过 GitHub API 读取和发表评论
- **优点**：免费、无服务器、无需自建后端、支持 Markdown、支持表情、支持多语言
- **要求**：访客需要 GitHub 账号才能评论（这是唯一门槛）

## 前置准备

1. 一个 GitHub 账号
2. 一个公开的 GitHub 仓库（存评论用，可以和博客源码共用，也可以单独建）
3. 博客是静态站（Hexo/Hugo/Jekyll 都行）

## 第一步：开启仓库的 Discussions

1. 打开你的 GitHub 仓库 → **Settings**（设置）
2. 左侧找到 **General**（通用设置），往下滚动
3. 找到 **Features**（功能）区域，勾选 **Discussions**（讨论）
4. 回到仓库页面，顶部会出现 **Discussions** 标签

## 第二步：安装 giscus App

1. 打开 giscus 官网：`https://giscus.app/`（官方页面，全中文）
2. 点击页面上的 **GitHub App** 链接，进入安装页
3. 选择仓库：可以选"所有仓库"或"仅选定的仓库"（选你存评论的仓库）
4. 授权安装

## 第三步：获取配置参数

回到 giscus.app 首页：

1. 在 **仓库** 输入框填你的仓库名（格式：`用户名/仓库名`）
2. 页面会自动检测并给出配置参数，你需要记下几个关键值：
   - `data-repo`：仓库名
   - `data-repo-id`：仓库 ID
   - `data-category`：讨论分类名（默认 Announcements）
   - `data-category-id`：分类 ID
3. 其他选项（主题、语言、懒加载等）按喜好设置，页面下方会实时生成**嵌入代码**

## 第四步：把代码贴进博客

### Hexo + Fluid 主题

Fluid 主题原生支持 giscus，不需要改代码，只改配置：

1. 打开主题配置文件（本站是根目录 `_config.fluid.yml`）
2. 找到评论相关配置，把 `type` 设为 `giscus`，填入上一步拿到的参数：

```yaml
post:
  comments:
    enable: true
    type: giscus
    giscus:
      repo: 用户名/仓库名
      repo_id: 你的 repo-id
      category: Announcements
      category_id: 你的 category-id
      # 其他可选：theme、lang 等
```

3. 每篇文章的 front-matter 里加上 `comments: true`（本站约定），文章页才会显示评论区

### 其他主题（Hugo/Jekyll/自写）

把 giscus.app 生成的嵌入代码（`<script>` 那段）贴到文章页模板的底部即可。原理都一样：页面加载时 giscus 脚本读取配置，从 GitHub 拉取对应 Discussions 主题。

## 第五步：验证

1. 重新构建并部署博客
2. 打开任意一篇文章，页面底部应出现评论区
3. 用 GitHub 账号发一条测试评论（首次会要求授权 giscus 读取你的账号）
4. 评论会出现在仓库的 Discussions 里，和网站实时同步

## 常见问题

**Q：评论不显示？**
A：检查三点：① 仓库 Discussions 是否开启；② 配置参数（repo-id、category-id）是否填对；③ 文章 front-matter 是否有 `comments: true`。

**Q：访客必须注册 GitHub 吗？**
A：是的，giscus 的机制如此。如果在意这个门槛，可以换 Waline（需要服务器/数据库）或 Twikoo（需要部署），但都不如 giscus 零成本省心。

**Q：能迁移旧评论吗？**
A：giscus 本身不带迁移工具。从 Disqus 等迁移需要写脚本把评论导入 Discussions，GitHub 官方有 API 支持。

**Q：评论有垃圾广告怎么办？**
A：giscus 支持在 GitHub Discussions 里直接管理（编辑/删除/锁定）。也可以开 Discussions 的审核模式（新讨论需审核后才公开），在仓库 Settings → Discussions 里设置。

## 小结

| 步骤 | 操作 | 耗时 |
|---|---|---|
| 1 | 开启 Discussions | 1 分钟 |
| 2 | 安装 giscus App | 2 分钟 |
| 3 | 获取配置参数 | 2 分钟 |
| 4 | 填进主题配置 | 2 分钟 |
| 5 | 验证评论 | 2 分钟 |

总计不到 15 分钟。本站评论区就是 giscus 驱动的——你现在用的就是它。如果配置过程遇到问题，欢迎在本文评论区留言（正好测试一下！😄）
