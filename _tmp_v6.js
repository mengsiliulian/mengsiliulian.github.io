const fs = require('fs');
const d = require('./tools/enrich-data/add-43-more.json');
const keys = Object.keys(d);
let bad = [];
keys.forEach(n => {
  const c = d[n];
  ['definition','origin','usage','aliases'].forEach(f => {
    const v = c[f];
    if (typeof v === 'string' && /"/.test(v)) bad.push(n + ':' + f);
    if (Array.isArray(v)) v.forEach(a => { if (typeof a === 'string' && /"/.test(a)) bad.push(n + ':' + f + ':alias'); });
  });
  if (!c.definition || c.definition.length < 40) bad.push(n + ':短def');
  if (!c.origin) bad.push(n + ':无origin');
  if (!c.usage) bad.push(n + ':无usage');
  if (!c.type) bad.push(n + ':无type');
});
console.log('问题项:', bad.length);
console.log(bad.join('\n') || 'clean');
