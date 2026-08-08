// 分析 usage 类型, 区分: 硬凑例句(例:...) vs 有实际用法的
// 只分析, 不改数据
const db = require('../source/meme/memes.json');

// 分类1: usage以"例:"开头或含"例:" 的凑数例句
// 分类2: 真正有用法(含固定搭配/动词/句式/口语)
let hard=0, real=0, other=0;
const hardList=[], realList=[];
db.entries.forEach(e=>{
  const u=(e.usage||'').trim();
  if(!u) return;
  if(/^例\s*[:：]/.test(u) || /例\s*[:：]/.test(u.slice(0,6))){ hard++; hardList.push(e); }
  else { real++; realList.push(e); }
});
console.log('usage 总数:', db.entries.filter(e=>e.usage).length);
console.log('含"例:"的(疑似硬凑):', hard);
console.log('不含"例:" 的其他 usage:', real);

console.log('\n===== 硬凑样例(前25) =====');
hardList.slice(0,25).forEach(e=>console.log(' * ['+e.type+'] '+e.name+' -> '+(e.usage||'').slice(0,35)));
