// 通用新增词条脚本：把 enrich-data/ 下以 "add-" 开头的 json 里的词条作为新词条 append 进 memes.json
// 用法: node scripts/add-new.js
// 字典格式: { "词条name": { "type","era","tags","aliases","definition","origin","usage","related" } }
// - 已存在的词条会跳过（不覆盖）。era 必须记真实年份。
const fs = require('fs');
const path = require('path');
const DB = path.join(__dirname, '..', 'source', 'meme', 'memes.json');
const DATA_DIR = path.join(__dirname, 'enrich-data');

const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const byName = new Set(db.entries.map(e => e.name));
let nextId = Math.max(0, ...db.entries.map(e => e.id || 0)) + 1;
let totalAdded = 0;

for (const file of fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f.startsWith('add-')).sort()) {
  const dict = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  let added = 0, exists = 0, bad = 0;
  for (const [name, c] of Object.entries(dict)) {
    if (byName.has(name)) { exists++; continue; }
    if (!c || !c.definition) { bad++; continue; }
    db.entries.push({
      id: nextId++,
      name,
      aliases: c.aliases || [name],
      type: c.type || '网络梗',
      era: c.era || '',
      tags: c.tags || [],
      definition: c.definition,
      origin: c.origin || '',
      usage: c.usage || '',
      related: c.related || '',
      source: c.source || ''
    });
    byName.add(name);
    added++;
  }
  console.log(`[${file}] 新增 ${added} 条, 已存在跳过 ${exists}, 缺def跳过 ${bad}`);
  totalAdded += added;
}
db.total = db.entries.length;
fs.writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8');
console.log(`\n共新增 ${totalAdded} 条, 现在总词条数: ${db.entries.length}`);
