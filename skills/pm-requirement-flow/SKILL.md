---
name: pm-requirement-flow
description: "PM 工作流。需求澄清 → 派发 → 验收。Yi 平时派需求给 Claude Code 开发的流程，已经跑通了，记录下来方便复用。依赖 claude-code-dispatch。"
metadata: {"openclaw": {"emoji": "📋"}}
---

# PM Requirement Flow 📋

从模糊需求到代码上线的完整流程。

## 依赖

必须安装 `clawdhub install claude-code-dispatch`

**使用前请先审计 claude-code-dispatch：**
- 检查 `~/.openclaw/workspace/skills/claude-code-dispatch/scripts/dispatch.sh` 的内容
- 确认来源可信（你自己的本地文件）
- 了解它会执行什么操作

---

## 核心理念

### PM 的职责
1. ✅ 需求澄清
2. ✅ 写 SPEC
3. ✅ 派发任务
4. ✅ 验收结果
5. ❌ **不写代码**（派给 Claude Code）

### 关键原则
- **不澄清不派发** — 需求不清楚时多问几句，比返工快
- **只派活不干活** — PM 不写代码，不自己改 bug
- **等通知不轮询** — 用 task-tracker 追踪，等 Hook 通知
- **复杂任务用 Teams** — 大项目用 Agent Teams（开发 + 测试）

---

## 流程

### 第一步：听需求

听用户说什么，不要急着给建议。先理解清楚再动手。

### 第二步：追问

持续追问几个关键点：

- **背景**：为什么做？解决什么问题？
- **用户**：谁用？痛点是什么？
- **范围**：必须包含什么？可以不包含？
- **验收**：怎么算完成？有什么标准？

每次问 2-3 个，不要一次性问完。

### 第三步：写 SPEC

把需求整理成结构化文档：

```markdown
# [功能名]

## 背景
为什么做

## 用户
谁用 + 痛点

## 功能
1. [功能 1] - 验收标准
2. [功能 2] - 验收标准

## 边界
- 包含：...
- 不包含：...

## 完成标准
怎么验证
```

### 第四步：确认

把 SPEC 发给用户确认：
- "是这样吗？"
- "有没有理解错的？"

### 第五步：派发

用 `claude-code-dispatch` 派给 Claude Code 开发：

```bash
nohup bash ~/.openclaw/workspace/skills/claude-code-dispatch/scripts/dispatch.sh \
  -p "需求：<SPEC 内容>" \
  -n "功能名" \
  --workdir /项目路径 \
  --permission-mode bypassPermissions \
  > /tmp/dispatch.log 2>&1 &
```

**dispatch 会自动：**
- ✅ 添加任务到 task-tracker
- ✅ 完成后 Hook 通知
- ✅ 标记任务为 completed

### 第六步：验收

**等待通知：**
- 完成后 Hook 会自动发 Telegram 通知
- 用 `task-tracker.sh list` 查看进行中的任务
- **不要轮询**（exec poll 浪费 token）

**验收流程：**
1. 打开部署链接
2. 逐项测试功能
3. **截图**（浏览器 screenshot）
4. 发截图给用户确认

**前端项目验收示例：**
```bash
# 打开浏览器
browser open <URL>

# 截图
browser screenshot <targetId>

# 发送给用户
message send --media <screenshot> --message "验收截图：..."
```

**不通过：** 写 Bug SPEC，重新派发修复。

---

## 任务追踪

**dispatch 自动添加任务到 tracker：**
```bash
# 查看进行中的任务
task-tracker.sh list

# 查看状态（含超时检查）
task-tracker.sh status

# 标记完成（Hook 自动调用）
task-tracker.sh complete <task-name>
```

**超时告警：** 任务超过 30 分钟未完成会自动提醒。

---

## Agent Teams 使用时机

| 场景 | 用 Teams? | 说明 |
|------|----------|------|
| 简单修复（如深色模式） | ❌ | 单 Agent 足够 |
| 新功能开发 | ✅ | 需要 Testing Agent |
| 多文件重构 | ✅ | 需要多 Agent 协作 |
| 完整项目 | ✅ | Teams + Testing |

**派发示例（带 Teams）：**
```bash
nohup bash scripts/dispatch.sh \
  -p "开发完整功能..." \
  --agent-teams \
  --agents-json '{"reviewer":{"description":"代码审查","prompt":"检查代码质量"}}' \
  ...
```

---

## 触发词

需求、开发、做个东西、帮我做 XX、开始项目

---

*Yi 自用流程，感觉有用就拿去。使用前请先了解依赖的 claude-code-dispatch skill。*

## Changelog

### v1.1.0 (2026-04-14)
- ✨ 新增 task-tracker 任务追踪
- 📝 添加 PM 职责说明（不写代码）
- 📝 添加 Agent Teams 使用时机
- 📝 添加验收流程（含截图要求）
- 🐛 修复 dispatch 输出缓冲问题

### v1.0.0 (2026-04-12)
- 初始版本

---

**链接：**
- [笔记站文档](https://note.wangyii.com/workflow/pm-updates)
- [Dispatch 修复说明](https://note.wangyii.com/workflow/dispatch-fix)
