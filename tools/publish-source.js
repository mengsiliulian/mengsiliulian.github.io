#!/usr/bin/env node
/**
 * publish-source.js — 无人值守健壮发布脚本
 * 用法: node tools/publish-source.js "<commit-message>"
 *
 * 行为:
 *   1. git add -A + git commit（若有改动）
 *   2. 检测 github 网络连通性（可配代理）
 *   3. push origin source，失败自动重试（默认最多 5 次，间隔递增）
 *   4. 全部失败则把待推状态落盘到 write-task-log/PENDING-PUSH.md，供下次任务/人工接管
 *
 * 退出码: 0=成功或无需推送; 1=最终失败
 */
'use strict';

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = __dirname.replace(/[\\/]tools$/, '');
const LOG_DIR = path.join(REPO, 'write-task-log');
const PENDING_FILE = path.join(LOG_DIR, 'PENDING-PUSH.md');

const MAX_RETRY = 5;                 // 重试次数
const BASE_WAIT_MS = 30000;          // 基础等待 30s
const WAIT_STEP_MS = 20000;          // 每次递增 20s
const NET_TIMEOUT_MS = 25000;        // 连通性探测超时

function log(msg) { console.log(`[publish] ${new Date().toLocaleString('zh-CN')} ${msg}`); }

function run(cmd, opts = {}) {
  const r = spawnSync(cmd, {
    cwd: REPO,
    shell: true,
    encoding: 'utf8',
    timeout: opts.timeout || 180000,
  });
  return { ok: r.status === 0, status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function netOk() {
  // 用 node 快速探测 github https，不依赖系统工具
  const https = require('https');
  return new Promise((resolve) => {
    const req = https.get({ host: 'github.com', port: 443, path: '/', timeout: NET_TIMEOUT_MS }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
      res.resume();
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

async function main() {
  const commitMsg = process.argv[2] || `写稿任务:${new Date().toISOString().slice(0, 10)}`;

  // ---- 1) 提交 ----
  let r = run('git add -A');
  if (!r.ok) { log(`git add 失败: ${r.err}`); }
  r = run(`git commit -m "${commitMsg}"`);
  if (r.ok) log(`已提交: ${commitMsg}`);
  else if (r.err.includes('nothing to commit') || r.out.includes('nothing to commit') || r.err.includes('nothing added')) {
    log('无改动，跳过提交');
  } else {
    log(`commit 提示: ${(r.err || r.out).slice(0, 200)}`);
  }

  // ---- 2) 网络预检 ----
  const net = await netOk();
  if (!net) log('⚠️ 首次网络探测失败，仍尝试 push（失败会重试）');
  else log('网络连通性正常');

  // ---- 3) push 重试 ----
  for (let i = 1; i <= MAX_RETRY; i++) {
    r = run('git push origin source');
    if (r.ok) {
      log(`✅ push 成功（第 ${i} 次）`);
      console.log(r.out.split('\n').filter(l => l.includes('->')).join('\n'));
      // 成功则清理待推标记
      if (fs.existsSync(PENDING_FILE)) {
        try { fs.renameSync(PENDING_FILE, PENDING_FILE + '.cleared'); log('已清理待推标记'); } catch (_) {}
      }
      process.exit(0);
    }
    const wait = BASE_WAIT_MS + (i - 1) * WAIT_STEP_MS;
    log(`❌ push 失败（第 ${i}/${MAX_RETRY} 次）: ${(r.err || r.out).slice(0, 160)}`);
    if (i < MAX_RETRY) { log(`等待 ${wait / 1000}s 后重试...`); await new Promise(res => setTimeout(res, wait)); }
  }

  // ---- 4) 落盘待推 ----
  const now = new Date().toISOString();
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(PENDING_FILE,
    `# PENDING-PUSH (待推送)\n\n` +
    `- 生成时间: ${now}\n` +
    `- 原因: push origin source 连续 ${MAX_RETRY} 次失败\n` +
    `- 解决方案: 网络恢复后执行 \`git push origin source\`，或等下一个定时任务自动补推\n` +
    `- 本地领先远端: ${run('git status -sb').out}\n`,
    'utf8'
  );
  log(`❌ 最终失败，待推状态已写入 ${PENDING_FILE}`);
  log(`   本地提交: ${run('git log --oneline -1').out}`);
  process.exit(1);
}

main();
