# Eiz Addon Generator

根据 Eiz API 文档（OpenAPI/curl/自然语言）自动生成 Next.js 插件项目，可选自动部署到 Vercel。

## 安装

这是一个 Claude Code Skill，通过 Claude Code 的 plugin 系统安装：

```bash
/plugin marketplace add yiguoguo/eiz-addon-generator
/plugin install addon-generator@yiguoguo/eiz-addon-generator
```

安装后即可使用 `/addon-generator` 命令。

## 使用方式

在 Claude Code 中使用：

```
/addon-generator <api-doc-or-url> [--deploy] [--name <plugin-name>]
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `<api-doc-or-url>` | API 文档内容，支持 OpenAPI JSON、curl 命令、自然语言描述 |
| `--deploy` | (可选) 生成后自动部署到 Vercel |
| `--name <plugin-name>` | (可选) 指定项目名称，默认为 `addon-project` |

### 示例

```bash
# 根据 curl 命令生成
/addon-generator curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy

# 根据 OpenAPI 文档生成
/addon-generator https://petstore.swagger.io/v2/swagger.json --name my-pet-store

# 根据自然语言描述生成
/addon-generator 这是一个用户管理 API，包含登录、注册、获取用户信息接口
```

## 工作流程

1. **解析** - 自动识别输入格式（OpenAPI/curl/自然语言），提取 API 结构
2. **生成** - AI 根据解析结果 + 风格约束生成完整的 Next.js 项目
3. **部署** - (可选) 一键部署到 Vercel

## AI 脚手架定位

本工具是一个 **AI 脚手架**，只做两件事：
- 解析 API 输入，提取结构信息
- 提供风格和认证约束

所有项目代码（页面、组件、路由、状态管理）由 AI 根据约束自由生成，不预设模板，接口数据格式完全自由。

## 生成项目规范

### UI 风格
- 无 Header、无面包屑、无底部声明
- Ant Design 风格，极简主义美学
- 白色背景配浅灰色调，品牌蓝 (#1890ff) 为主色
- 微妙阴影、细线条、扁平化设计
- 无衬线字体，4K 分辨率适配（1920px+）

### API 认证
- Token 通过 URL Query 参数传递：`?token=xxx`
- 请求时使用：`Authorization: Bearer <token>` Header
- 无认证需求则不使用 Token

## License

MIT
