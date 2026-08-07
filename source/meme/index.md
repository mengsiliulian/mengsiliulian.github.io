---
title: 网络百科
permalink: /meme/
comments: false
toc: false
---

<link rel="stylesheet" href="/css/meme.css">

<div class="meme-wrap">

  <div class="meme-head">
    <h2>🗂️ 网络百科 · 全量词条库</h2>
    <p class="meme-desc">从上世纪至今的二次元 + 网络 + 游戏词条库。输入关键词即可模糊搜索（含别名/标签匹配），如搜「三倍速」可命中「红有三」。</p>
    <p class="meme-submit">💡 想收录新词条？<a href="https://github.com/mengsiliulian/mengsiliulian.github.io/issues/new?template=submit-meme.yml" target="_blank" rel="noopener">点这里提交投稿</a>，站长审核通过后会收录进词条库。</p>
  </div>

  <div class="meme-search-box">
    <input type="text" id="meme-search-input" placeholder="输入关键词模糊搜索，如：三倍速 / 背刺 / 高达 / 弹幕…" autocomplete="off">
    <span class="meme-search-clear" id="meme-search-clear" title="清空">✕</span>
  </div>

  <div class="meme-filter">
    <span class="meme-filter-label">类型：</span>
    <span class="meme-filter-tags" id="meme-type-filter"></span>
  </div>

  <div class="meme-stats" id="meme-stats"></div>

  <div class="meme-list" id="meme-list"></div>

  <div class="meme-empty" id="meme-empty" style="display:none;">没有匹配的词条，换个关键词试试。</div>

  <div class="meme-loading" id="meme-loading">⏳ 词条加载中…</div>

</div>

<script src="/js/meme-search.js"></script>
