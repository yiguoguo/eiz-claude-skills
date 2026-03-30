---
name: addon-generator
description: 当用户提供 API 文档并要求"生成插件"、"创建addon"、"快速生成前端项目"时使用此skill。根据API文档生成完整的Next.js插件项目，可选自动部署到Vercel。
argument-hint: <api-doc-or-url> [--deploy] [--name <plugin-name>]
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "Task", "TaskCreate"]
---

# Addon Skill

Generate a Next.js plugin from API documentation.

## 使用方式

`/addon <api-doc-or-url> [--deploy] [--name <plugin-name>]`

## 参数说明

- `<api-doc-or-url>`: API 文档内容，支持以下格式：
  - OpenAPI/Swagger JSON 文档
  - curl 命令
  - 自然语言描述的 API

- `--deploy` (可选): 生成后自动部署到 Vercel

- `--name <plugin-name>` (可选): 指定插件项目名称，默认为 `addon-project`

## 工作流程

1. **解析 (Parse)**: 解析输入的 API 文档，自动检测格式
2. **生成 (Generate)**: 根据解析结果生成完整的 Next.js 项目
3. **部署 (Deploy)** (可选): 将项目部署到 Vercel

## 输出

返回生成的项目路径和可选的 Vercel 部署 URL。

## 使用示例

```
/addon https://petstore.swagger.io/v2/swagger.json --deploy --name my-pet-store
```

```
/addon curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy
```
