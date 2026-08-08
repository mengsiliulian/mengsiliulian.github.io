const db = require('../source/meme/memes.json');
const hard = db.entries.filter(e => e.usage && /^例\s*[:：]/.test(e.usage.trim()));
console.log('含"例:"开头 usage 共', hard.length);
// 完整列出, 供人工判断
hard.forEach(e=>console.log('['+e.type+'] '+e.name+' :: '+e.usage));
