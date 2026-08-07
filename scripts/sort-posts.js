/**
 * 首页文章排序插件
 * 规则：
 *  1. sticky 置顶优先（hexo-generator-index 默认处理：sticky 大的在前，稳定排序）
 *  2. 其余按日期倒序（时间新的在前）
 *  3. 同一天的文章按分类顺序聚合（分类按约定顺序）
 *
 * 原理：给每篇文章注入 sort_key = "YYYYMMDD-分类序号"，
 * 再把 _config.yml 的 index_generator.order_by 设为 "-sort_key"。
 * 生成器先按 sort_key 倒序（日期倒序+同日按分类），再稳定地按 sticky 倒序（置顶优先）。
 */
'use strict';

const CATEGORY_ORDER = [
  'AI 周报',
  '二次元',
  '教程',
  'AI 科普',
  '工具推荐',
  '学习路线',
  '游戏杂谈',
  '站务'
];

function categoryRank(post) {
  const cats = post.categories ? post.categories.toArray() : [];
  for (const cat of cats) {
    const idx = CATEGORY_ORDER.indexOf(cat.name);
    if (idx !== -1) return idx;
  }
  return CATEGORY_ORDER.length;
}

hexo.extend.filter.register('before_generate', function () {
  const posts = hexo.locals.get('posts');
  if (posts) {
    posts.forEach(function (post) {
      const d = post.date ? post.date.format('YYYYMMDD') : '00000000';
      const rank = String(categoryRank(post)).padStart(2, '0');
      post.sort_key = d + '-' + rank;
    });
  }
});
