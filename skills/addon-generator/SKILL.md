---
name: addon-generator
description: 根据 API 文档（OpenAPI/curl/自然语言）生成 Next.js 页面。根据接口返回内容生成客户想要的页面。
argument-hint: <api-doc-or-url> [--deploy] [--name <project-name>]
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "Task", "TaskCreate"]
---

# Addon Skill

根据 API 文档生成 Next.js 页面。

## 使用方式

`/addon-generator <api-doc-or-url> [--deploy] [--name <project-name>]`

## 参数说明

- `<api-doc-or-url>`: API 文档内容，支持以下格式：
  - OpenAPI/Swagger JSON 文档
  - curl 命令
  - 自然语言描述的 API

- `--deploy` (可选): 生成后自动部署到 Vercel

- `--name <project-name>` (可选): 指定项目名称，默认为 `addon-project`

## API 认证约束

- **页面访问**：用户通过 `?token=xxx` 传递 Token，例如 `https://xxx.vercel.app?token=abc`
- **接口请求**：页面请求后端接口时，Token 通过 Header 传递：`Authorization: Bearer <token>`
- 如果接口无认证需求，则不使用 Token

## UI 风格约束

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

1. **解析 (Parse)**: 解析输入的 API 文档，自动检测格式（OpenAPI/curl/自然语言）
2. **生成 (Generate)**: AI 根据解析结果直接生成 Next.js 页面代码，严格遵循 UI 风格约束
3. **部署 (Deploy)** (可选): 调用 `vercel` 命令部署生成的项目

## 输出

返回生成的项目路径和可选的 Vercel 部署 URL。

## 使用示例

```
/addon-generator https://petstore.swagger.io/v2/swagger.json --deploy --name my-pet-store
```

```
/addon-generator curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy
```
