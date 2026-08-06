/* ============================================================
   AI 新闻周报 · 返回上一步（悬浮按钮）
   - 点击返回上一步（history.back）
   - 无历史记录时回首页
   - 纯前端、DOM API 构建（无 innerHTML，防注入）
   ============================================================ */
(function () {
  'use strict';

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }

  function build() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-top-btn';
    btn.setAttribute('aria-label', '返回上一步');
    btn.title = '返回上一步';

    // 图标（iconfont 箭头） + 文字，全部用 DOM API
    var icon = document.createElement('i');
    icon.className = 'iconfont icon-arrowleft';
    icon.setAttribute('aria-hidden', 'true');

    var label = document.createElement('span');
    label.className = 'back-top-label';
    label.textContent = '返回上一步';

    btn.appendChild(icon);
    btn.appendChild(label);
    btn.addEventListener('click', goBack);
    return btn;
  }

  function inject() {
    var btn = build();
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
