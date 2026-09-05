/* ============================================================
   AI 新闻周报 · 文章点赞（纯前端，无第三方服务/登录）
   - 计数存 localStorage，按文章路径隔离
   - 每篇文章每个访客限赞一次（localStorage 记录），可取消
   - 无后端，数据存本机浏览器；清缓存会清零
   ============================================================ */
(function () {
  // 只在文章页显示（pathname 形如 /YYYY/MM/DD/title/）
  if (!/^\/(\d{4})\/(\d{2})\/(\d{2})\//.test(window.location.pathname)) return;

  var path = window.location.pathname;
  var KEY_LIKES = 'blog_likes_' + path;
  var KEY_MINE = 'blog_liked_' + path;

  function getLikes() {
    return parseInt(localStorage.getItem(KEY_LIKES) || '0', 10);
  }
  function setLikes(n) {
    localStorage.setItem(KEY_LIKES, String(n));
  }
  function hasLiked() {
    return localStorage.getItem(KEY_MINE) === '1';
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'like-box';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'like-btn' + (hasLiked() ? ' liked' : '');

    // 用 DOM API 构造，避免 innerHTML 注入风险
    var icon = document.createElement('i');
    icon.className = 'iconfont icon-heart';
    icon.setAttribute('aria-hidden', 'true');
    var num = document.createElement('span');
    num.className = 'like-num';
    num.textContent = getLikes();

    btn.appendChild(icon);
    btn.appendChild(num);

    var tip = document.createElement('div');
    tip.className = 'like-tip';
    tip.textContent = hasLiked() ? '已点赞，再点取消' : '觉得不错？点个赞吧';

    btn.addEventListener('click', function () {
      if (hasLiked()) {
        setLikes(Math.max(0, getLikes() - 1));
        localStorage.removeItem(KEY_MINE);
        btn.classList.remove('liked');
        tip.textContent = '已取消点赞';
      } else {
        setLikes(getLikes() + 1);
        localStorage.setItem(KEY_MINE, '1');
        btn.classList.add('liked');
        tip.textContent = '感谢你的点赞！';
      }
      btn.querySelector('.like-num').textContent = getLikes();
    });

    wrap.appendChild(btn);
    wrap.appendChild(tip);
    return wrap;
  }

  function inject() {
    var content = document.querySelector('.post-content .markdown-body, article .markdown-body');
    if (content && content.nextSibling) {
      // 插到正文之后（hr 之前）
      content.parentNode.insertBefore(build(), content.nextSibling);
    } else if (content) {
      content.parentNode.appendChild(build());
    } else {
      // 兜底：正文开头
      var article = document.querySelector('article');
      if (article) article.appendChild(build());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
