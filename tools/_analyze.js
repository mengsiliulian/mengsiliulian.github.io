const db = require('../source/meme/memes.json');
const li = db.entries.filter(e => e.usage && /^例\s*[:：]|例\s*[:：]/.test(e.usage));
console.log('usage以"例："开头的:', li.length);
li.slice(0, 30).forEach(e => console.log(' * [' + e.type + '] ' + e.name + ' -> ' + (e.usage||'').slice(0, 40)));
console.log('\n--- 全部条目按 name 看 usage 长度的10条 ---');
db.entries.sort((a,b)=>(a.usage||'').length-(b.usage||'').length).slice(0,10).forEach(e=>console.log('['+e.type+'] '+e.name+' usage('+(e.usage||'').length+'): '+(e.usage||'(无)').slice(0,30)));
