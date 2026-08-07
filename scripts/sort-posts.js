/**
 * 首页文章排序插件
 * 规则：
 *  1. sticky 置顶优先（大在前）
 *  2. 其余按日期倒序（UTC+8 固定偏移，避免 Action/UTC 环境时区错位）
 *  3. 同一天的文章按分类顺序聚合
 *
 * 实现：覆盖默认 index 生成器（scripts 在插件之后加载，register 同名覆盖），
 * 自定义排序后复用 hexo-pagination 分页，行为与默认生成器一致。
 */
'use strict';

const pagination = require('hexo-pagination');

const CATEGORY_ORDER = [
  'AI 周报', '二次元', '教程', 'AI 科普',
  '工具推荐', '学习路线', '游戏杂谈', '站务'
];

function categoryRank(post) {
  const cats = post.categories ? post.categories.toArray() : [];
  for (const cat of cats) {
    const idx = CATEGORY_ORDER.indexOf(cat.name);
    if (idx !== -1) return idx;
  }
  return CATEGORY_ORDER.length;
}

function customSort(a, b) {
  // 1. sticky 置顶优先
  const sa = Number(a.sticky) || 0;
  const sb = Number(b.sticky) || 0;
  if (sa !== sb) return sb - sa;
  // 2. 日期倒序（UTC+8）
  const da = a.date ? a.date.clone().utcOffset(480).valueOf() : 0;
  const db = b.date ? b.date.clone().utcOffset(480).valueOf() : 0;
  if (da !== db) return db - da;
  // 3. 同日期按分类顺序
  return categoryRank(a) - categoryRank(b);
}

hexo.extend.generator.register('index', function (locals) {
  const config = this.config;
  const posts = locals.posts;
  posts.data.sort(customSort);

  const paginationDir = config.index_generator.pagination_dir || config.pagination_dir || 'page';
  const path = config.index_generator.path || '';

  return pagination(path, posts, {
    perPage: config.index_generator.per_page,
    layout: config.index_generator.layout || ['index', 'archive'],
    format: paginationDir + '/%d/',
    data: {
      __index: true
    }
  });
});
