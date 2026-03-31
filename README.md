# Eiz Claude Skills

Eiz 公司的 Claude Code 插件市场。

## 插件

| 插件 | 描述 |
|------|------|
| `addon-generator` | 根据 API 文档（OpenAPI/curl/自然语言）生成 Next.js 项目页面 |

## 安装

```bash
/plugin marketplace add yiguoguo/eiz-claude-skills
/plugin install addon-generator@eiz-claude-skills
```

## 使用

```
/addon-generator <api-doc-or-url> [--deploy] [--name <project-name>]
```

## 示例

参考 `examples/` 目录下的示例：

- [examples/dashboard/](examples/dashboard/) — Dashboard 图表页面示例

每个示例包含需求说明和 API 文档，可直接作为 `/addon-generator` 的输入参考。
