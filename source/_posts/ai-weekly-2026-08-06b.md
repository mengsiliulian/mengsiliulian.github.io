---
title: OpenAI 官宣下一代模型 Astra、学术研究者计划启动：8 月初 AI 动态速览
date: 2026-08-06 15:45:00
updated: 2026-08-06 15:45:00
comments: true
sticky: 1
categories:
  - AI 周报
tags:
  - AI
  - OpenAI
  - Astra
  - DeepSeek
  - 大模型
toc: true
---

> 本期为 8 月 1 日 – 8 月 6 日的 AI 动态速览。所有信息均以**官方来源**为准（官方博客、官方文档），并附可核实的链接。官方无公开信息的事件，宁缺毋滥。

## 📰 新闻速览

### 🧮 1. OpenAI 官宣下一代模型家族：Astra

**8 月 1 日**，OpenAI 通过一篇题为《数学与理论计算机科学的十项进展》（*Ten advances in mathematics and theoretical computer science*）的官方博客，正式介绍了其**下一代主要模型 Astra**。

这是 OpenAI 少见的"不按常规发布会来"的官宣：没有产品演示，而是用**十个长期开放数学/理论计算机科学难题的解法**作为开场。

官方博客明确说明：

> "这些成果由 **Astra 的内部版本**（an internal version of Astra, our next major model）取得。"

**十个成果覆盖**：高维球堆积、二元与球面码、非 sofic 群存在性、Connes 刚性猜想反例、算术电路复杂度下界、量子并行重复定理、最接近向量问题的近似硬度、Ehrhart 体积猜想、多彩 Ramsey 数、极值图论猜想——其中多个直接解决或推进了**几何、密码学、复杂性理论**领域的长期开放问题。

几个关键细节：

- 模型为每个证明生成了 **Lean 形式化证书**（已开源：github.com/openai/ten-proofs），并附**模型思考过程的叙述**（discovery walkthroughs）
- 官方估算：找出这些解所需 token，按 **Sol API 价格约合 $2,000**
- 论文由人类与模型共同整理成稿，OpenAI 明确表示"数学论证由系统生成，人类负责校对与形式化，并对正确性负责"——并回应了数学界关于 AI 参与研究的署名伦理讨论（提及莱顿宣言）

> ⚠️ 需注意：**Astra 尚未作为公开产品上线**。本次只是"能力预告"性质的技术公布，OpenAI 尚未决定其最终以何种型号发布。

> 来源（官方一手）：
> - OpenAI 官方博客：https://openai.com/index/ten-advances-in-mathematics/
> - Lean 证书开源仓库：https://github.com/openai/ten-proofs

---

### 🎓 2. OpenAI 启动"ChatGPT for Academic Researchers"：10 万研究者免费使用前沿模型

OpenAI 同期推出面向学术界的计划 **ChatGPT for Academic Researchers**，向全球**10 万名科研人员免费提供前沿模型访问**：

- **今夏先行开放 1 万人**，已覆盖普林斯顿高等研究院（IAS）、巴黎高等师范学院（ENS）等机构，计划到 **2027 年扩展到 10 万人**
- 首批可用的前沿模型包括 **GPT-5.6 Sol Pro**
- 每位研究者可邀请**最多 4 名机构内合作者**；工作区含企业级隐私保护，**默认不用数据训练模型**
- 配套提供培训、技术支持；与机构现有 ChatGPT Edu 工作区打通

官方还披露了一组使用数据：每周约 **130 万人**用 ChatGPT 进行高级科学/数学工作，产生约 **840 万条消息**。该计划是 OpenAI **$2.5 亿美元（到 2027 年）**外部科研支持承诺的一部分（含 NextGenAI 5000 万美元计划、与能源部 Genesis Mission 的合作）。

> 来源（官方一手）：https://openai.com/index/chatgpt-for-academic-researchers/

---

### 🐋 3. DeepSeek API 文档快照：V4-Flash-0731 与 V4-Pro 在列

截至本期，DeepSeek 官方 API 文档列出 `deepseek-v4-flash` 与 `deepseek-v4-pro` 两个模型，其中 `deepseek-v4-flash` 已更新至 **DeepSeek-V4-Flash-0731** 版本（调用方式不变，仍用 `deepseek-v4-flash` 即可）。文档同时示例了 `deepseek-v4-pro` 的调用（含 thinking 参数）。

> 说明：本条以官方 API 文档为准；官方暂未发布配套正式公告，故仅记录文档可见信息，不做二手媒体的性能渲染。

> 来源（官方一手）：https://api-docs.deepseek.com/

---

## 写在最后

本期最重磅的是 **Astra**——OpenAI 用"解开十个数学难题"这种硬核方式官宣下一代模型，这在 AI 圈相当少见，也侧面展示了大模型在数学研究上的实际生产力。值得留意的是 Astra 尚未公开上线，后续官方若发布正式产品信息，我们会第一时间跟进。

*本篇文章信息均来自所引官方来源（数据截至 2026-08-06）。*
