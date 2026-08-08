const fs = require('fs');
const db = require('../source/meme/memes.json');
const hard = db.entries.filter(e => e.usage && /^例\s*[:：]/.test(e.usage.trim()));
let out = '含"例:"开头 usage 共 ' + hard.length + '\n\n';
hard.forEach(e => { out += '[' + e.type + '] ' + e.name + ' :: ' + e.usage + '\n'; });
fs.writeFileSync(process.env.TEMP + '\\hard-list.txt', out, 'utf8');
console.log('written', hard.length);
