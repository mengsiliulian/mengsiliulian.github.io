// 通用详实化合并器：读取 scripts/enrich-data/*.json 字典，合并进 memes.json
// 用法: node scripts/merge-enrich.js
// 字典格式: { "词条name": { "definition": "...", "origin": "...", "usage": "..." } }
const fs = require('fs');
const path = require('path');
const DB = path.join(__dirname, '..', 'source', 'meme', 'memes.json');
const DATA_DIR = path.join(__dirname, 'enrich-data');

const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const byName = new Map(db.entries.map(e => [e.name, e]));

let totalMerged = 0;
let totalMiss = 0;
const missList = [];

if (!fs.existsSync(DATA_DIR)) { console.log('无 enrich-data 目录'); process.exit(0); }

for (const file of fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort()) {
  const dict = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  let merged = 0, miss = 0;
  for (const [name, content] of Object.entries(dict)) {
    const e = byName.get(name);
    if (e) {
      // 仅当当前仍偏简(或强制)时替换，避免覆盖已是详实的手工内容
      if ((e.definition || '').replace(/\s/g, '').length < 40 || (content.force)) {
        if (content.definition) e.definition = content.definition;
        if (content.origin) e.origin = content.origin;
        if (content.usage) e.usage = content.usage;
        merged++;
      }
    } else {
      miss++; missList.push(name);
    }
  }
  console.log(`[${file}] 合并 ${merged} 条, 未命中 ${miss} 条`);
  totalMerged += merged; totalMiss += miss;
}

db.total = db.entries.length;
fs.writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8');
console.log(`\n共合并 ${totalMerged} 条, 未命中 ${totalMiss} 条`);
if (missList.length) console.log('未命中:', missList.join(' | '));
