// 删除 usage 含 xx/XX 占位符模板的词条的 usage 字段
// 这类词条本身是"xx 句式梗", 用法就是往 xx 里填内容, 写固定 usage 必然是生硬模板
// 前端 meme-search.js 已容忍缺失 usage (line 189: m.usage ? ... : '')
const fs = require('fs');
const P = 'source/meme/memes.json';
const db = JSON.parse(fs.readFileSync(P, 'utf8'));
const pat = /xx|XX|xxx|XXX/i;
let removed = 0;
const removedNames = [];
db.entries.forEach(e => {
  if (e.usage && pat.test(e.usage)) {
    delete e.usage;
    removed++;
    removedNames.push(e.name);
  }
});
db.total = db.entries.length;
fs.writeFileSync(P, JSON.stringify(db, null, 2), 'utf8');
console.log('删除含xx占位符 usage 的词条数:', removed);
console.log('list:', removedNames.join('、'));
// 复查残留
const left = db.entries.filter(e => e.usage && /xx|XX|xxx|XXX/i.test(e.usage));
console.log('残留含xx usage:', left.length);
// 缺字段统计
const miss = db.entries.filter(e => !e.definition || !e.type || !e.origin);
console.log('缺 def/type/origin:', miss.length);
const noUsage = db.entries.filter(e => !e.usage);
console.log('缺 usage 词条数:', noUsage.length, '(应为' + removed + ')');
