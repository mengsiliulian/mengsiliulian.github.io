# 网络百科 · 站长快捷编辑工具（tools/meme.js）

站长**个人用的**命令行工具，快捷新增/编辑词条。放在 `tools/` 而不是 `scripts/`（避免被 Hexo 当插件加载）。

## 用法一：快速新增（最常用，单行搞定）

```powershell
cd C:\Users\ROG\ai-news-blog
node tools/meme.js add `
  --name "词条名" `
  --def "释义（必填）" `
  --aliases "别名1,别名2" `
  --type "网络梗" `      # 网络梗/二次元/游戏
  --era "2021" `         # 记真实年份
  --tags "标签1,标签2" `
  --origin "出处/来源" `
  --usage "用法" `
  --related "关联梗1,关联梗2"
```

- PowerShell 续行用反引号 `` ` ``（或用单行写）。
- 必填只有 `--name` 和 `--def`，其余可省略。
- 最后会问「是否立即构建并部署?」，回车 `y` 即自动部署上线。

## 用法二：编辑已有词条

```powershell
node tools/meme.js edit "词条名" --def "新释义" --origin "新出处" --related "红有三,真香"
```

- 按 `name` / `别名` / `id` 匹配。
- 只传想改的字段，其余保留原值。

## 用法三：检索

```powershell
node tools/meme.js find "关键词"
```

## 用法四：手动部署

```powershell
node tools/meme.js deploy
```

## 交互模式（不传参数）

```powershell
node tools/meme.js add      # 一步步提问
node tools/meme.js edit "词条名"
```

## 工具自动做的事

1. 校验：必填字段、related 转数组、name 去重
2. 更新 `db.total`
3. `hexo generate` 构建
4. `git commit + push origin source` → 触发 GitHub Action 自动部署（约 1 分钟上线）

## 注意

- **别放 `scripts/`**：Hexo 会自动把 `scripts/` 下所有 .js 当插件加载，处理数据的脚本必须放 `tools/`。
- 数据文件：`source/meme/memes.json`。id 已统一为 1..N 连续数字（前端不依赖 id）。
- git push 返回 code 1 在 Windows 是 stderr 误报，看到 `xxx..xxx source -> source` 就说明成功了。
