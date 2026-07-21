---
name: addon-generator
description: 根据 API 文档（OpenAPI/curl/自然语言）生成 lofko addon 页面。自动判断页面类型，生成完整 Next.js 项目并可选部署到 Vercel。
argument-hint: <api-doc-or-url> [--deploy] [--name <project-name>]
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "Task", "TaskCreate"]
---

# Addon Generator

根据 API 文档生成 lofko addon 页面。

## 背景

这是 lofko 系统的 addon 模块。流程如下：

1. 管理员在 lofko 后台注册一个 addon，填入我们部署好的项目 URL
2. 用户在 lofko 中看到这个 addon，点击访问
3. lofko 自动在 URL 后追加 `?token=xxx`
4. 我们的页面拿到 token，所有接口请求都带 `Authorization: Bearer <token>` Header

**我们只负责消费 token，不负责登录/鉴权流程。**

## 使用方式

```
/addon-generator <api-doc-or-url> [--deploy] [--name <project-name>]
```

## 参数说明

- `<api-doc-or-url>`：API 文档，支持以下格式：
  - OpenAPI/Swagger JSON 文档
  - curl 命令
  - 自然语言描述的 API

- `--deploy`（可选）：生成后自动部署到 Vercel

- `--name <project-name>`（可选）：项目名称，默认 `addon-project`

## 技术栈

- **框架**：Next.js，App Router
- **样式**：Tailwind CSS，不依赖 antd 等 UI 库
- **部署**：Vercel（CLI 命令 `vercel`）

生成时直接用 `npx create-next-app` 初始化项目，再写入页面代码。

## 认证约束

- **页面访问**：URL 参数 `?token=xxx`，由 lofko 自动追加
- **接口请求**：`Authorization: Bearer <token>`，从 URL 参数中读取
- 如果接口无认证需求，忽略 token

## 页面类型推断

Claude 根据接口返回结构自主判断生成什么页面。判断依据：

| 返回结构特征 | 页面类型 | 说明 |
|---|---|---|
| 数组，字段多为标量 | 数据表格 | 分页表格，支持筛选/排序 |
| 数组，含图片/标题/价格 | 商品/内容卡片 | 网格卡片布局 |
| 单对象，字段丰富 | 详情页 | 分区展示，卡片式布局 |
| 数组，含数值/统计字段 | Dashboard 图表 | 图表 + 数据概览 |
| 对象，字段适合输入 | 表单页 | 输入 + 提交 |

混合结构时，优先拆分为多个区块（如顶部概览 + 下方表格）。不要问用户要什么类型，自己判断，判断依据不足时按数据表格处理。

## UI 风格

借鉴 Ant Design 视觉风格，纯 CSS 实现（Tailwind），不引入 antd 包。

**布局要求**
- 无 Header 导航栏
- 无面包屑导航
- 无底部版权/声明区域
- 纯内容区域布局，最大化内容空间

**视觉规范**
- 白色背景，浅灰色调
- 品牌蓝 `#1890ff` 为主色调
- 圆角卡片（8px），微妙阴影（`shadow-sm`）
- 细线条分割，扁平化设计
- 无衬线字体（Inter / system-ui）
- 4K 适配（最大宽度 1920px，居中）

**交互**
- 表格：斑马纹、hover 高亮、表头固定
- 卡片：hover 轻微上浮（`translateY(-2px)`）
- 按钮：品牌蓝色，hover 加深
- 加载态：Skeleton 占位

## 工作流程

1. **解析**：解析 API 文档，提取接口列表、参数、返回结构
2. **判断**：根据返回结构确定页面类型（见上方推断表）
3. **生成**：
   - `npx create-next-app <name> --tailwind --app --ts --no-eslint`
   - 写入页面组件，严格遵循 UI 风格约束
   - 实现 token 读取和接口请求逻辑
4. **部署**（可选）：`vercel --yes` 在项目目录下执行

## 输出

返回生成的项目路径，以及可选的 Vercel 部署 URL。

## 使用示例

```bash
# OpenAPI 文档
/addon-generator https://petstore.swagger.io/v2/swagger.json --deploy --name my-pet-store

# curl 命令
/addon-generator curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy

# 自然语言
/addon-generator 一个商品库存查询接口，GET /api/inventory，返回商品名、SKU、数量、价格
```

## 示例参考

`examples/dashboard/` 目录下有 Dashboard 类型页面的示例，包含 API 文档和页面效果说明，可作为生成时的风格参考。
