/* ============================================================
   AI 新闻周报 · 网络百科专区 前端搜索
   加载 /meme/memes.json，实现：
   - 关键词模糊搜索（匹配：name/aliases/tags/definition/origin）
   - 类型筛选（二次元/网络/游戏…）
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

  /* ---------- 匹配程度打分（得分越高越靠前；先比层级，再比同层得分）---------- */
  // 返回 [layer, score]：layer 表示主命中优先级，score 为同层内的细分得分
  function scoreEntry(m, kw) {
    if (!kw) return [0, 0];
    var nName = normalize(m.name);
    var kwL = kw;
    var layer = 0;
    var score = 0;

    // name 完全命中（最高优先级）
    if (nName === kwL) { layer = 6; score = 100; }
    // name 开头命中
    else if (nName.indexOf(kwL) === 0) { layer = 5; score = 90; }

    // aliases：完全/开头命中视为该别名即关键词本身（仅次于 name 命中）
    var aliases = m.aliases || [];
    var aliasExact = false, aliasPrefix = false;
    for (var i = 0; i < aliases.length; i++) {
      var na = normalize(aliases[i]);
      if (na === kwL) aliasExact = true;
      else if (na.indexOf(kwL) === 0) aliasPrefix = true;
    }
    if (aliasExact && layer === 0) { layer = 4; score = 85; }
    else if (aliasPrefix && layer === 0) { layer = 3; score = 78; }

    // name 包含（未完全/开头命中）
    if (nName.indexOf(kwL) !== -1 && layer === 0) { layer = 2; score = 70; }

    // 以下为低优先级辅助命中（仅在未命中 name/alias 时考虑）
    if (layer === 0) {
      // alias 包含
      for (var j = 0; j < aliases.length; j++) {
        if (normalize(aliases[j]).indexOf(kwL) !== -1) { layer = 1; score = 60; break; }
      }
      // tags 命中
      var tags = m.tags || [];
      for (var k = 0; k < tags.length; k++) {
        if (normalize(tags[k]).indexOf(kwL) !== -1) { if (layer < 1) layer = 0; score += 50; break; }
      }
      if (normalize(m.definition).indexOf(kwL) !== -1) { layer = 0; score += 40; }
      if (normalize(m.origin).indexOf(kwL) !== -1) { layer = 0; score += 30; }
      if (normalize(m.usage).indexOf(kwL) !== -1) { layer = 0; score += 20; }
    }

    return [layer, score];
  }

  function render() {
    if (!loaded) return;
    var kw = normalize(qEl.value);

    var result = data.filter(function (m) {
      if (currentType && m.type !== currentType) return false;
      if (kw && !matchEntry(m, kw)) return false;
      return true;
    });

    // 排序：有关键词 -> 按匹配得分降序（先比 layer 再比 score）；无关键词 -> 按 era 倒序 + name
    if (kw) {
      result.sort(function (a, b) {
        var sa = scoreEntry(a, kw);
        var sb = scoreEntry(b, kw);
        if (sa[0] !== sb[0]) return sb[0] - sa[0];
        if (sa[1] !== sb[1]) return sb[1] - sa[1];
        return (a.name || '').localeCompare(b.name || '', 'zh');
      });
    } else {
      result.sort(function (a, b) {
        var eb = (b.era || '').localeCompare(a.era || '');
        if (eb !== 0) return eb;
        return (a.name || '').localeCompare(b.name || '', 'zh');
      });
    }

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

    // related 字段可能为数组或纯字符串；统一成数组处理，杜绝 .map 报错
    var relatedArr = Array.isArray(m.related) ? m.related : (typeof m.related === 'string' && m.related ? [m.related] : []);
    var relatedHtml = relatedArr.length ? '<p class="meme-f meme-related"><b>🔗 关联：</b>' + relatedArr.map(function (r) { return '<span class="meme-rel">' + esc(r) + '</span>'; }).join(' ') + '</p>' : '';

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
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 事件 ---------- */
  qEl.addEventListener('input', render);
  qEl.addEventListener('keyup', function (e) { if (e.key === 'Enter') render(); });
  clearEl.addEventListener('click', function () { qEl.value = ''; render(); });

  load();
})();
