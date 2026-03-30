# Eiz Addon Generator

根据 Eiz API 文档（OpenAPI/curl/自然语言）自动生成 Next.js 插件项目，可选自动部署到 Vercel。

## 安装

```bash
npm install -g addon-generator
```

## 使用方式

在 Claude Code 中使用：

```
/addon <api-doc-or-url> [--deploy] [--name <plugin-name>]
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
/addon curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy

# 根据 OpenAPI 文档生成
/addon https://petstore.swagger.io/v2/swagger.json --name my-pet-store

# 根据自然语言描述生成
/addon 这是一个用户管理 API，包含登录、注册、获取用户信息接口
```

## 工作流程

1. **解析** - 自动识别输入格式（OpenAPI/curl/自然语言）
2. **生成** - 创建完整的 Next.js 项目结构
3. **部署** - (可选) 一键部署到 Vercel

## 项目结构

生成的插件项目包含：

- `src/app/api/` - API 路由处理
- `src/components/` - React 组件
- `src/lib/` - 工具函数和类型定义
- `next.config.js` - Next.js 配置

## License

MIT
