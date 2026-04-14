# Eiz Claude Skills

Eiz 公司的 Claude Code 插件市场。

## 插件

| 插件 | 描述 |
|------|------|
| `addon-generator` | 根据 API 文档（OpenAPI/curl/自然语言）生成 Next.js 项目页面 |
| `pm-requirement-flow` | PM 工作流 — 需求澄清 → 派发 → 验收（集成 claude-code-dispatch + task-tracker） |

## 安装

```bash
/plugin marketplace add yiguoguo/eiz-claude-skills
/plugin install addon-generator@eiz-claude-skills
```

## 使用

### addon-generator

```
/addon-generator <api-doc-or-url> [--deploy] [--name <project-name>]
```

### pm-requirement-flow

**触发词：** 需求、开发、做个东西、帮我做 XX、开始项目

**流程：**
1. 需求澄清（追问背景/用户/范围/验收）
2. 写 SPEC（结构化文档）
3. 用户确认
4. 派发 Claude Code（自动追踪）
5. 独立验收（截图 + 测试）

**示例：**
```
用户：帮我做个番茄计时器
PM：好的，先确认几个问题：
1. 你自己用还是团队用？
2. 需要统计功能吗？
3. 有什么偏好的 UI 风格？
```

## 示例

参考 `examples/` 目录下的示例：

- [examples/dashboard/](examples/dashboard/) — Dashboard 图表页面示例

每个示例包含需求说明和 API 文档，可直接作为 `/addon-generator` 的输入参考。
