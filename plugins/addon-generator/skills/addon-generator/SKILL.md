---
name: addon-generator
description: 当用户提供 API 文档并要求"生成插件"、"创建addon"、"快速生成前端项目"时使用此skill。根据API文档生成完整的Next.js插件项目，可选自动部署到Vercel。
argument-hint: <api-doc-or-url> [--deploy] [--name <plugin-name>]
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "Task", "TaskCreate"]
---

# Addon Skill

Generate a Next.js plugin from API documentation.

## 使用方式

`/addon-generator <api-doc-or-url> [--deploy] [--name <plugin-name>]`

## 参数说明

- `<api-doc-or-url>`: API 文档内容，支持以下格式：
  - OpenAPI/Swagger JSON 文档
  - curl 命令
  - 自然语言描述的 API

- `--deploy` (可选): 生成后自动部署到 Vercel

- `--name <plugin-name>` (可选): 指定插件项目名称，默认为 `addon-project`

## API 认证约束

- Token 通过 URL Query 参数传递：`?token=xxx`
- 请求接口时使用：`Authorization: Bearer <token>` Header
- 如果接口无认证需求，则不使用 Token

## UI 风格约束

生成的项目必须遵循以下设计规范：

**布局要求**
- 无 Header 导航栏
- 无面包屑导航
- 无底部版权/声明区域
- 纯内容区域布局，最大化内容空间

**视觉风格**
- 高质量现代电商库存管理系统后台 UI
- Ant Design 风格，极简主义美学
- 白色背景配浅灰色调
- 品牌蓝 (#1890ff) 为主色调
- 微妙的阴影、细线条分割
- 无衬线字体（推荐 Inter / Roboto）
- 扁平化设计，拒绝过度装饰

**布局规范**
- 4K 分辨率适配（1920px+ 宽度）
- 整齐的网格布局，间距一致
- 专业的后台管理界面，不做营销类 UI

**UX 设计**
- 简洁专业，拒绝冗余
- 清晰的视觉层次
- 快速上手，降低学习成本

## 工作流程

1. **解析 (Parse)**: 解析输入的 API 文档，自动检测格式
2. **生成 (Generate)**: 根据解析结果生成完整的 Next.js 项目，严格遵循上述 UI 风格约束
3. **部署 (Deploy)** (可选): 将项目部署到 Vercel

## 输出

返回生成的项目路径和可选的 Vercel 部署 URL。

## 使用示例

```
/addon-generator https://petstore.swagger.io/v2/swagger.json --deploy --name my-pet-store
```

```
/addon-generator curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy
```
