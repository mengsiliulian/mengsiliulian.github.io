// 把 f1-moe-net.json 里库里缺失的 42 条新梗作为正式词条加入 memes.json
// 这些条目在 f1 字典里有完整 definition/origin/usage，只缺 type/era/tags/aliases
// 这里补全四字段并 append 进库。era 记真实年份，不统一区间。
const fs = require('fs');
const DB = 'source/meme/memes.json';
const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const byName = new Set(db.entries.map(e => e.name));

// 42 条新梗的分类元数据（type/era/tags/aliases）
const meta = {
  '何意呢':            { type:'网络梗', era:'2010年代', tags:['网络语','句式','吐槽'] },
  '卧槽，ojbk':        { type:'网络梗', era:'2017', tags:['网络语','缩写','吐槽'] },
  '我好（了/的）':      { type:'网络梗', era:'2015', tags:['网络语','句式'] },
  '翔老太（头）坏得很':  { type:'网络梗', era:'2015', tags:['网络语','吐槽','句式'] },
  '你们都是坏（银）人':  { type:'网络梗', era:'2010', tags:['网络语','方言语','卖萌'] },
  'Oo其实（就是）xx，我o过': { type:'网络梗', era:'2011', tags:['网络语','句式'] },
  '一时oo，终身oo':    { type:'网络梗', era:'2012', tags:['网络语','句式','定式'] },
  '一个人滑铲':        { type:'网络梗', era:'2019', tags:['网络语','搞笑','自夸'] },
  '我来组成头部':      { type:'网络梗', era:'2008', tags:['机器人','合体','机甲'] },
  'oo中的战斗机':      { type:'网络梗', era:'2009', tags:['网络语','句式','广告'] },
  'oo之后（就）再无xx': { type:'网络梗', era:'2013', tags:['网络语','句式','感叹'] },
  '反复横跳':          { type:'网络梗', era:'2017', tags:['网络语','吐槽'] },
  '火力全开':          { type:'网络梗', era:'2007', tags:['网络语','游戏'] },
  '这个逼可以装':      { type:'网络梗', era:'2012', tags:['网络语','粗俗','吐槽'] },
  '无中生友':          { type:'网络梗', era:'2019', tags:['网络语','吐槽','句式'] },
  '人类迷惑行为':      { type:'网络梗', era:'2019', tags:['网络语','吐槽'] },
  '前方高能':          { type:'网络梗', era:'2012', tags:['弹幕','ACGN','预警'] },
  '战术后仰':          { type:'网络梗', era:'2017', tags:['网络语','表情','梗'] },
  '对不起，有钱真的可以为所欲为': { type:'网络梗', era:'2017', tags:['港剧','名场面','炫富'] },
  '带嘤':              { type:'网络梗', era:'2016', tags:['网络语','谐音','国名'] },
  '川普':              { type:'网络梗', era:'2016', tags:['时事','人物','谐音'] },
  '美利坚':            { type:'网络梗', era:'2001', tags:['国名','音译'] },
  '来自星星的你':      { type:'二次元梗', era:'2013', tags:['韩剧','外星人'] },
  '一起摇摆':          { type:'网络梗', era:'2013', tags:['歌曲','玩梗'] },
  '社会我X哥/社会我X姐':{ type:'网络梗', era:'2016', tags:['网络语','句式'] },
  '人狠话不多':        { type:'网络梗', era:'2016', tags:['网络语','形容'] },
  '我读书少你别骗我':  { type:'网络梗', era:'2010', tags:['网络语','句式'] },
  '你的良心不会痛吗':  { type:'网络梗', era:'2017', tags:['网络语','吐槽','句式'] },
  '真是邪了门了':      { type:'网络梗', era:'2014', tags:['网络语','口语'] },
  '非常棒':            { type:'网络梗', era:'2015', tags:['网络语','敷衍'] },
  '有内味了':          { type:'网络梗', era:'2020', tags:['网络语','吐槽'] },
  'yyds':              { type:'网络梗', era:'2020', tags:['缩写','夸赞','拼音'] },
  '绝绝子':            { type:'网络梗', era:'2020', tags:['网络语','夸赞'] },
  '栓Q（谢谢）':       { type:'网络梗', era:'2021', tags:['谐音','口语'] },
  '退退退':            { type:'网络梗', era:'2022', tags:['网络语','表情','驱赶'] },
  '栓住你了':          { type:'网络梗', era:'2021', tags:['谐音','搞笑'] },
  '泰裤辣':            { type:'网络梗', era:'2023', tags:['谐音','方言','热梗'] },
  '蜜雪冰城甜蜜蜜':     { type:'网络梗', era:'2021', tags:['品牌','歌曲','洗脑'] },
  '疯狂星期四':         { type:'网络梗', era:'2021', tags:['品牌','星期','整活'] },
  'V我50':             { type:'网络梗', era:'2021', tags:['谐音','转账','疯狂星期四'] },
  '修勾勾':            { type:'网络梗', era:'2020', tags:['卖萌','叠词','宠物'] },
  '卡哇伊':            { type:'网络梗', era:'2005', tags:['日语','音译','卖萌'] },
};

const f1 = JSON.parse(fs.readFileSync('scripts/enrich-data/f1-moe-net.json', 'utf8'));
let added = 0, skipped = 0;
let nextId = Math.max(...db.entries.map(e => e.id || 0)) + 1;

const aliasMap = {
  '何意呢': ['何意呢'], '卧槽，ojbk': ['ojbk','卧槽ojbk'], '前方高能': ['前方高能预警'],
  'yyds': ['永远的神','永远的滴神'], '退退退': ['退退退'], '泰裤辣': ['太酷啦'],
  '卡哇伊': ['かわいい','可爱'], '川普': ['特朗普'], '疯狂星期四': ['KFC疯狂星期四','疯四'],
  'V我50': ['v我五十','转我50'], '人类迷惑行为': ['迷惑行为','人类迷惑'], '蜜雪冰城甜蜜蜜': ['你爱我我爱你'],
};

for (const [name, content] of Object.entries(f1)) {
  if (byName.has(name)) { skipped++; continue; }
  const mm = meta[name];
  if (!mm) { console.log('!! 缺meta，跳过:', name); continue; }
  db.entries.push({
    id: nextId++,
    name,
    aliases: aliasMap[name] || [name],
    type: mm.type,
    era: mm.era,
    tags: mm.tags,
    definition: content.definition || '',
    origin: content.origin || '',
    usage: content.usage || '',
    related: '',
    source: ''
  });
  added++;
  byName.add(name);
}
db.total = db.entries.length;
fs.writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8');
console.log('新增词条:', added, '| 跳过(已存在):', skipped, '| 现在总数:', db.entries.length);
