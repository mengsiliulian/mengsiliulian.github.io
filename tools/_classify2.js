const fs = require('fs');
const db = require('../source/meme/memes.json');
const hard = db.entries.filter(e => e.usage && /^例\s*[:：]/.test(e.usage.trim()));
const parse = e => (e.usage||'').replace(/^例\s*[:：]\s*/,'');
const praiseKw = ['太经典','真经典','很经典','太燃','美到','太治愈','太强','太帅','太潮','太好看','好看','太震撼','震撼到','美得','帅到','太顶','天花板','吹爆','太可爱','太魔性','太洗脑','太有喜感','太感人','看哭','太招人喜欢','太让人','真是经典','经典','神作','白月光','好评','太惊艳','太能打','太有排面','无出其右','无人能及','意难平','太矫情','太上头','太好看'];
function isFiller(e){
  const t = parse(e);
  if(/被[^，。]{1,6}|掉[^，。]{1,4}|圈粉|粉转黑|黑转粉|秒空|买单|上头|下头|入坑|翻车|开盒|背刺|破防|社死|卡(死|机)|断网|蓝屏|死机|领盒饭|摸鱼|上班|加班|内卷|躺平/.test(t)) return false;
  if(/^[^，。！？]{2,12}[的了是就]/.test(t) && praiseKw.some(k=>t.includes(k))) return true;
  if(/^[^，。！？]{2,14}(是|就是)[^，。！？]{2,14}(经典|开端|巅峰|童年|图腾|代名词|起点|标配|招牌|名场面|代表作|白月光)/.test(t)) return true;
  return false;
}
const cand = hard.filter(isFiller);
let out='候选"凑数"条目: '+cand.length+' / 共'+hard.length+'\n\n';
cand.forEach(e=>{ out+='['+e.type+'] '+e.name+' :: '+(e.usage||'')+'\n'; });
fs.writeFileSync(process.env.TEMP+'\\cand-filler.txt', out,'utf8');
console.log('candidates', cand.length);
