// 补字段脚本：用 enrich-data/ 下补 origin/usage 字段（不动 definition）
// 用法: node scripts/fill-fields.js
// 字典格式: { "词条name": { "origin": "...", "usage": "..." } }
const fs = require('fs');
const path = require('path');
const DB = path.join(__dirname, '..', 'source', 'meme', 'memes.json');
const DATA_DIR = path.join(__dirname, 'enrich-data');

const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const byName = new Map(db.entries.map(e => [e.name, e]));
let filled = 0;

for (const file of fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f.startsWith('field-')).sort()) {
  const dict = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  let done = 0, miss = 0;
  for (const [name, c] of Object.entries(dict)) {
    const e = byName.get(name);
    if (!e) { miss++; continue; }
    let changed = false;
    if (c.origin && !e.origin) { e.origin = c.origin; changed = true; }
    if (c.usage && !e.usage) { e.usage = c.usage; changed = true; }
    if (changed) done++;
  }
  console.log(`[${file}] 补齐 ${done} 条, 未命中 ${miss}`);
  filled += done;
}
db.total = db.entries.length;
fs.writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8');
console.log(`\n共补齐 ${filled} 条`);
