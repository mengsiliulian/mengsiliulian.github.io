/* ============================================================
   AI 新闻周报 · 梗详解专区 前端搜索
   加载 /meme/memes.json，实现：
   - 关键词模糊搜索（匹配：name/aliases/tags/definition/origin）
   - 类型筛选（二次元梗/网络梗/游戏梗…）
   - 词条卡片渲染
   ============================================================ */
(function () {
  'use strict';

  var JSON_URL = '/meme/memes.json';

  var data = [];
  var loaded = false;

  var qEl = document.getElementById('meme-search-input');
  var clearEl = document.getElementById('meme-search-clear');
  var typeFilterEl = document.getElementById('meme-type-filter');
  var statsEl = document.getElementById('meme-stats');
  var listEl = document.getElementById('meme-list');
  var emptyEl = document.getElementById('meme-empty');
  var loadingEl = document.getElementById('meme-loading');

  if (!qEl || !listEl) return;

  /* ---------- 加载数据 ---------- */
  function load() {
    fetch(JSON_URL)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        data = (json && json.entries) || [];
        loaded = true;
        if (loadingEl) loadingEl.style.display = 'none';
        renderTypes();
        render();
      })
      .catch(function (e) {
        if (loadingEl) { loadingEl.textContent = '⚠️ 词条数据加载失败：' + e.message; }
      });
  }

  /* ---------- 类型筛选按钮 ---------- */
  function renderTypes() {
    var types = [];
    data.forEach(function (m) { if (m.type && types.indexOf(m.type) === -1) types.push(m.type); });
    types.sort();
    var html = '<span class="meme-chip meme-chip-all active" data-type="">全部</span>';
    types.forEach(function (t) {
      html += '<span class="meme-chip" data-type="' + esc(t) + '">' + esc(t) + '</span>';
    });
    typeFilterEl.innerHTML = html;

    typeFilterEl.addEventListener('click', function (ev) {
      var chip = ev.target;
      if (!chip.classList || !chip.classList.contains('meme-chip')) return;
      var chips = typeFilterEl.querySelectorAll('.meme-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
      chip.classList.add('active');
      currentType = chip.getAttribute('data-type') || '';
      render();
    });
  }

  /* ---------- 模糊搜索 ---------- */
  var currentType = '';

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, '');
  }

  // 检查某词条是否命中关键词（对每个 alias/name 做包含匹配）
  function matchEntry(m, kw) {
    var haystacks = [m.name, m.definition, m.origin, m.usage].concat(m.aliases || [], m.tags || []);
    for (var i = 0; i < haystacks.length; i++) {
      if (normalize(haystacks[i]).indexOf(kw) !== -1) return true;
    }
    return false;
  }

  function render() {
    if (!loaded) return;
    var kw = normalize(qEl.value);

    var result = data.filter(function (m) {
      if (currentType && m.type !== currentType) return false;
      if (kw && !matchEntry(m, kw)) return false;
      return true;
    });

    // 排序：先按 era 倒序，再按 name
    result.sort(function (a, b) {
      var eb = (b.era || '').localeCompare(a.era || '');
      if (eb !== 0) return eb;
      return (a.name || '').localeCompare(b.name || '', 'zh');
    });

    if (statsEl) statsEl.textContent = '共 ' + data.length + ' 个词条 · 当前匹配 ' + result.length + ' 个' + (kw ? '（关键词："' + qEl.value + '"）' : '');

    if (result.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    var html = '';
    result.forEach(function (m) {
      html += renderCard(m, kw);
    });
    listEl.innerHTML = html;
  }

  function renderCard(m, kw) {
    var typeBadge = m.type ? '<span class="meme-badge">' + esc(m.type) + '</span>' : '';
    var eraBadge = m.era ? '<span class="meme-era">' + esc(m.era) + '</span>' : '';

    var aliasesHtml = '';
    if (m.aliases && m.aliases.length) {
      var shown = [];
      m.aliases.forEach(function (a) {
        if (a === m.name) return;
        if (shown.indexOf(a) === -1) shown.push(a);
      });
      if (shown.length) {
        aliasesHtml = '<div class="meme-aliases"><b>别名/关键词：</b>' + shown.slice(0, 8).map(function (a) { return '<span class="meme-alias">' + esc(a) + '</span>'; }).join('') + '</div>';
      }
    }

    var def = highlight(m.definition, kw);

    var originHtml = m.origin ? '<p class="meme-f"><b>📜 出处：</b>' + highlight(m.origin, kw) + '</p>' : '';
    var usageHtml = m.usage ? '<p class="meme-f"><b>💬 用法：</b>' + highlight(m.usage, kw) + '</p>' : '';
    var relatedHtml = (m.related && m.related.length) ? '<p class="meme-f meme-related"><b>🔗 关联：</b>' + m.related.map(function (r) { return '<span class="meme-rel">' + esc(r) + '</span>'; }).join(' ') + '</p>' : '';

    return '<div class="meme-card">' +
      '<div class="meme-card-title">' + esc(m.name) + ' ' + typeBadge + eraBadge + '</div>' +
      '<p class="meme-def">' + def + '</p>' +
      aliasesHtml +
      originHtml +
      usageHtml +
      relatedHtml +
      '</div>';
  }

  /* ---------- 关键词高亮 ---------- */
  function highlight(text, kw) {
    if (!kw || !text) return esc(text);
    var t = esc(text);
    // 简单高亮：对每个命中词（转义后原文）包 <mark>
    var needle = kw;
    try {
      var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return t.replace(re, '<mark>$1</mark>');
    } catch (e) { return t; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- 事件 ---------- */
  qEl.addEventListener('input', render);
  qEl.addEventListener('keyup', function (e) { if (e.key === 'Enter') render(); });
  clearEl.addEventListener('click', function () { qEl.value = ''; render(); });

  load();
})();
