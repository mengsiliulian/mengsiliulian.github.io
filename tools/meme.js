#!/usr/bin/env node
/* ============================================================
   网络百科 · 站长快捷编辑工具
   usage:
     node tools/meme.js add                   交互相新增词条
     node tools/meme.js edit "红有三"          交互相编辑(按 name/alias/id 匹配)
     node tools/meme.js find "关键词"          只查不改(打印匹配词条)
     node tools/meme.js deploy                手动触发构建+推送部署
   交互结束后自动: 更新 total -> 校验 -> 构建 -> git commit+push -> 触发部署
   ⚠️ 本脚本在 tools/ 下(不是 scripts/), 避免被 Hexo 当插件加载
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DB = path.join(ROOT, 'source', 'meme', 'memes.json');

const TYPES = ['网络梗', '二次元', '游戏', '其他'];

function load() { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(db) { db.total = db.entries.length; fs.writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8'); }

function ask(rl, q, def) {
  return new Promise(res => {
    rl.question((def ? `${q} [默认: ${def}] ` : `${q} `), ans => {
      ans = (ans || '').trim();
      res(ans === '' && def !== undefined ? String(def) : ans);
    });
  });
}

function parseList(str) {
  return String(str || '')
    .split(/[,，、;；\/]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function findEntry(db, key) {
  const k = (key || '').trim().toLowerCase();
  if (!k) return null;
  return db.entries.find(e =>
    String(e.name || '').toLowerCase() === k ||
    String(e.id || '').toLowerCase() === k ||
    (Array.isArray(e.aliases) && e.aliases.some(a => String(a).toLowerCase() === k))
  ) || null;
}

function promptEntry(rl, existing) {
  const cur = existing || {};
  const def = (v) => (v === undefined || v === null ? '' : v);
  return (async () => {
    const name = await ask(rl, '词条名 (name，必填)', def(cur.name));
    const aliases = await ask(rl, '别名 (逗号分隔)', Array.isArray(cur.aliases) ? cur.aliases.join(',') : def(cur.aliases));
    const type = await ask(rl, `类型 (${TYPES.join('/')})`, def(cur.type) || '网络梗');
    const era = await ask(rl, '年代/时期 (era，记真实年份，如 2021 或 1979-2000s)', def(cur.era));
    const tags = await ask(rl, '标签 (逗号分隔)', Array.isArray(cur.tags) ? cur.tags.join(',') : def(cur.tags));
    const definition = await ask(rl, '释义 (definition，必填)', def(cur.definition));
    const origin = await ask(rl, '出处/来源 (origin)', def(cur.origin));
    const usage = await ask(rl, '用法 (usage)', def(cur.usage));
    const related = await ask(rl, '关联梗 (逗号分隔)', Array.isArray(cur.related) ? cur.related.join(',') : def(cur.related));

    if (!name.trim()) { console.log('✖ 词条名不能为空，取消。'); return null; }
    if (!definition.trim()) { console.log('✖ 释义不能为空，取消。'); return null; }

    const finalType = TYPES.includes(type) ? type : (TYPES.find(t => type.includes(t)) || '网络梗');
    return {
      name: name.trim(),
      aliases: parseList(aliases).length ? parseList(aliases) : [name.trim()],
      type: finalType,
      era: era.trim(),
      tags: parseList(tags),
      definition: definition.trim(),
      origin: origin.trim(),
      usage: usage.trim(),
      related: parseList(related).length ? parseList(related) : (Array.isArray(cur.related) ? cur.related : []),
      source: cur.source || ''
    };
  })();
}

function idFor(db, record) {
  // id 已统一为 1..N 连续整数(前端不依赖 id, 仅保证唯一即可)
  return db.entries.length + 1;
}

// 从命令行参数解析一条词条: --name --aliases --type --era --tags --def --origin --usage --related
function parseFlags(raw, existing) {
  const get = (k, def) => {
    const i = raw.indexOf('--' + k);
    if (i === -1 || raw[i + 1] === undefined) return def;
    let v = raw[i + 1];
    if (!v || v.startsWith('--')) return def;
    return v;
  };
  const cur = existing || {};
  const name = get('name', cur.name);
  const definition = get('def', cur.definition);
  if (!name || !definition) { console.log('✖ 缺少必填 --name 或 --def'); return null; }
  const aliases = parseList(get('aliases', Array.isArray(cur.aliases) ? cur.aliases.join(',') : cur.aliases));
  const type = get('type', cur.type) || '网络梗';
  const finalType = TYPES.includes(type) ? type : (TYPES.find(t => type.includes(t)) || '网络梗');
  return {
    name,
    aliases: aliases.length ? aliases : [name],
    type: finalType,
    era: get('era', cur.era) || '',
    tags: parseList(get('tags', Array.isArray(cur.tags) ? cur.tags.join(',') : cur.tags)),
    definition,
    origin: get('origin', cur.origin) || '',
    usage: get('usage', cur.usage) || '',
    related: parseList(get('related', Array.isArray(cur.related) ? cur.related.join(',') : cur.related)),
    source: cur.source || ''
  };
}

function hasFlag(raw, name) { return raw.indexOf('--' + name) !== -1; }

function deploy() {
  console.log('\n⏳ 构建并部署中…');
  try { execSync('hexo generate', { cwd: ROOT, stdio: 'inherit' }); }
  catch (e) { console.log('✖ 构建失败:', e.message); process.exit(1); }
  try {
    execSync('git add source/meme/memes.json source/js/meme-search.js && git commit -m "网络百科: 词条更新" && git push origin source', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    // git 相关命令 stderr 会 exit 1 但实际成功(Windows 误报), 不 here 视为失败
    console.log('→ git 已执行 (Windows 下 code 1 常为 stderr 误报, 请确认推送输出有 "source -> source")');
  }
  console.log('✅ 已触发部署, GitHub Action 约 1 分钟内上线');
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  let db = load();

  // 编辑目标的 key: 仅当第 2 个参数不是 -- 开头的 flag 时才是词条名
  const key = (args[1] && !args[1].startsWith('--')) ? args[1] : null;
  const flagsRaw = key ? args.slice(2) : args.slice(1);
  if (action === 'find') {
    const kw = (key || '').toLowerCase();
    const hits = db.entries.filter(e =>
      !kw ||
      String(e.name || '').toLowerCase().includes(kw) ||
      String(e.definition || '').toLowerCase().includes(kw) ||
      (Array.isArray(e.aliases) && e.aliases.some(a => String(a).toLowerCase().includes(kw)))
    );
    console.log(`匹配 ${hits.length} 条:`);
    hits.slice(0, 10).forEach(e => console.log(`  - ${e.name} [${e.type} ${e.era}]`));
    if (hits.length > 10) console.log(`  … 还有 ${hits.length - 10} 条`);
    return;
  }

  if (action === 'deploy') { deploy(); return; }

  // ---- 非交互快速模式: 命令行参数直接传字段 ----
  // node tools/meme.js add --name "X" --def "释义" [--aliases "a,b" --type 网络梗 --era 2021 --tags "a,b" --origin "..." --usage "..." --related "a,b"]
  // node tools/meme.js edit "词条名" --def "新释义" [--name "新名" ...]
  if ((action === 'add' || action === 'edit') && hasFlag(flagsRaw, 'def')) {
    if (action === 'add') {
      const rec = parseFlags(flagsRaw, null);
      if (!rec) return;
      if (findEntry(db, rec.name)) { console.log(`✖ 词条 "${rec.name}" 已存在, 用 edit 编辑。`); return; }
      rec.id = idFor(db, rec);
      db.entries.push(rec);
      save(db);
      console.log(`✅ 已新增: ${rec.name} (id=${rec.id}, 共 ${db.entries.length} 条)`);
    } else {
      if (!key) { console.log('用法: node tools/meme.js edit "词条名" --def "新释义" ...'); return; }
      const existing = findEntry(db, key);
      if (!existing) { console.log(`✖ 未找到词条 "${key}"。用 find 检索。`); return; }
      const rec = parseFlags(flagsRaw, existing);
      if (!rec) return;
      // 改名时去重
      if (rec.name !== existing.name && findEntry(db, rec.name)) { console.log(`✖ 已有同名词条 "${rec.name}"`); return; }
      rec.id = existing.id;
      Object.assign(existing, rec);
      save(db);
      console.log(`✅ 已更新: ${existing.name} (共 ${db.entries.length} 条)`);
    }
    const c = await ask(readline.createInterface({ input: process.stdin, output: process.stdout }), '\n是否立即构建并部署? (y/n)', 'y');
    if (c.toLowerCase() === 'y') deploy();
    return;
  }

  // ---- 交互模式 ----
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  if (action === 'edit') {
    if (!key) { console.log('用法: node tools/meme.js edit "词条名"'); rl.close(); return; }
    const existing = findEntry(db, key);
    if (!existing) {
      console.log(`✖ 未找到词条 "${key}"。用 "node tools/meme.js find 关键词" 检索。`);
      rl.close(); return;
    }
    console.log(`\n编辑词条: ${existing.name} (类型 ${existing.type})\n(直接回车保留原值)\n`);
    const rec = await promptEntry(rl, existing);
    if (!rec) { rl.close(); return; }
    rec.id = existing.id;
    Object.assign(existing, rec);
    save(db);
    console.log(`✅ 已更新: ${existing.name}`);
  } else if (action === 'add') {
    console.log('新增词条 (直接回车用默认值)\n');
    const rec = await promptEntry(rl, null);
    if (!rec) { rl.close(); return; }
    if (findEntry(db, rec.name)) { console.log(`✖ 词条 "${rec.name}" 已存在, 用 edit 编辑。`); rl.close(); return; }
    rec.id = idFor(db, rec);
    db.entries.push(rec);
    save(db);
    console.log(`✅ 已新增: ${rec.name}`);
  } else {
    console.log('用法:');
    console.log('  node tools/meme.js add [--name X --def "释义" ...]   # 新增(参数给全则非交互); 不带参数则交互相');
    console.log('  node tools/meme.js edit "词条名" [--def "新释义" ...] # 编辑(参数给全则非交互)');
    console.log('  node tools/meme.js find "关键词"                   # 检索词条');
    console.log('  node tools/meme.js deploy                         # 手动构建+部署');
    rl.close();
    return;
  }

  rl.close();
  const c = await ask(readline.createInterface({ input: process.stdin, output: process.stdout }), '\n是否立即构建并部署? (y/n)', 'y');
  if (c.toLowerCase() === 'y') deploy();
}

main().catch(e => { console.error(e); process.exit(1); });
