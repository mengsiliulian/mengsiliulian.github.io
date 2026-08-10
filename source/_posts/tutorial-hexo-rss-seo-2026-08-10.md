---
title: 给 Hexo 博客加 RSS 订阅和做基础 SEO：从零到能搜到
date: 2026-08-10 13:30:00
updated: 2026-08-10 13:30:00
comments: true
categories:
  - 教程
tags:
  - Hexo
  - RSS
  - SEO
  - 教程
toc: true
---

上一篇我们讲了怎么用 Hexo 搭起博客、接上评论和自动部署。这篇接着补两件"锦上添花"但很多人会漏的事：**给博客加 RSS 订阅**，以及**做基础 SEO（搜索引擎优化）**，让内容更容易被搜到。

> 涉及 Hexo 插件与版本的信息，请以**官方最新文档**为准。

## 一、先加 RSS 订阅

RSS 能让读者用阅读器订阅你的更新。Hexo 生态里有现成插件，三步搞定：

1. **安装插件**：在博客根目录执行
   ```
   npm install hexo-generator-feed --save
   ```
2. **配置**：打开根目录的 `_config.yml`，加/改一段：
   ```yaml
   feed:
     type: atom
     path: atom.xml
     limit: 20
   ```
3. **本地预览确认**：`hexo g` 后，`public/atom.xml` 会生成，这就是订阅地址；`hexo s` 可在本地打开验证。

**常见坑**：
- 没装插件直接刷页面是看不到 atom.xml 的，先确认 `node_modules` 里有 `hexo-generator-feed`。
- 想顺便支持 JSON Feed，可以再加 `hexo-generator-feed` 之外的扩展或调整 `type` 字段。

## 二、做基础 SEO

SEO 不是玄学，对个人博客来说做好以下几点就够用了：

1. **每篇写好 `title` 和 `description`**：Hexo 文章的 front-matter 里，`title` 会被用作页面标题；`description`（如果主题支持）会作为摘要，尽量写得像"有人搜索会命中的一句话"。
2. **规范网址（canonical）**：让搜索引擎知道哪个 URL 才是"原始版本"，避免同一内容多个地址被判定为重复。多数主题自带这个功能，检查主题设置里有没有开启。
3. **语义化标题层级**：正文里的 `##`、`###` 按层级用，别跳过 `##` 直接 `####`，方便爬虫理解结构。
4. **提交站点地图（sitemap）**：装 `hexo-generator-sitemap`，生成 `sitemap.xml`，再到 **Google Search Console** / **Bing Webmaster** 提交站点和 sitemap，加速收录。
5. **Robots 与 404**：确认网站能正常返回 404（而不是一堆相同的 200），避免产生大量无意义页面。

## 三、发布前自检清单

- [ ] `atom.xml` 能正常访问
- [ ] 每篇文章有 title 和 description
- [ ] sitemap.xml 已生成并提交到站长平台
- [ ] 用"站内: 你的域名"能搜到主页

## 小结

RSS 解决"读者怎么持续追更"，SEO 解决"新人怎么找到你"。两件事都不复杂，重在**坚持更新 + 结构规范**。工具和插件的 API 会更新，多刷官方文档总没错。
