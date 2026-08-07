// 占位符规范化脚本 v2：把句式梗里的占位符统一为 xx；去掉 definition/usage 里的 ……
// 规则：只有"中文语境占位符"才替换——oo/○○/Oo/Ooo 两侧不都是英文字母时视为占位符
// 纯英文单词内部的 oo（如 Mood/Tooold/Kongroo）保留
// 用法: node scripts/_norm-placeholder.js  (dry 预览) | node scripts/_norm-placeholder.js --apply
const fs = require('fs');
const DB = 'source/meme/memes.json';
const APPLY = process.argv.includes('--apply');
const m = JSON.parse(fs.readFileSync(DB, 'utf8'));

// 判断位置是否为占位符：oo 两侧不都是英文字母（即不嵌在英文单词中间）
function normPlaceholder(s) {
  if (!s) return s;
  // 处理 Ooo/ooo/Oo/oo/○○/ＯＯ：要求该 oo 两侧不同时是英文字母
  // 用回调判断
  return s.replace(/Ooo|ooo|Oo|oo|○○|ＯＯ/g, (match, offset, str) => {
    const before = str[offset - 1];
    const after = str[offset + match.length];
    // 只有存在的字符才参与判断；任一是英文字母 → 视为英文单词一部分，保留
    const beforeIsLetter = before !== undefined && /[a-zA-Z]/.test(before);
    const afterIsLetter = after !== undefined && /[a-zA-Z]/.test(after);
    if (beforeIsLetter || afterIsLetter) return match;
    return 'xx';
  });
}

const normEllipsis = (s) => s ? s.replace(/……/g, '') : s;

let changedName = 0, changedDef = 0, changedUsage = 0;
const toShow = [];
m.entries.forEach(e => {
  const nn = normPlaceholder(e.name);
  if (nn !== e.name) {
    if (APPLY) e.name = nn; changedName++;
    toShow.push(`${e.name} -> ${nn}`);
  }
  if (e.definition) {
    let nd = normPlaceholder(e.definition);
    nd = normEllipsis(nd);
    if (nd !== e.definition) { if (APPLY) e.definition = nd; changedDef++; }
  }
  if (e.usage) {
    const nu = normEllipsis(e.usage);
    if (nu !== e.usage) { if (APPLY) e.usage = nu; changedUsage++; }
  }
});
if (APPLY) {
  m.total = m.entries.length;
  fs.writeFileSync(DB, JSON.stringify(m, null, 2), 'utf8');
}
console.log(`[${APPLY?'APPLY':'DRY'}] name改:${changedName} def改:${changedDef} usage改:${changedUsage}`);
if (!APPLY && toShow.length) console.log('示例:', toShow.slice(0, 15).join('\n  '));
