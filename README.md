# Eiz Claude Skills

Eiz 公司的 Claude Code 插件市场。

## 插件

| 插件 | 描述 |
|------|------|
| `addon-generator` | 根据 API 文档生成 lofko addon 页面（Next.js + Tailwind，可选 Vercel 部署） |
| `work-polish` | 工作汇报润色 — 大白话转职场语言，支持轻度/重度包装 |
| `grill-me` | 需求拷问 — 挑出需求里的漏洞和模糊点，确保做出来的和想的一致 |

## 安装

```bash
/plugin marketplace add yiguoguo/eiz-claude-skills
/plugin install addon-generator@eiz-claude-skills
```

## 使用

### addon-generator

根据 API 文档自动生成 lofko addon 页面，支持 OpenAPI/curl/自然语言输入。

```
/addon-generator <api-doc-or-url> [--deploy] [--name <project-name>]
```

**背景：** 生成的项目是 lofko 系统的 addon 模块。管理员在 lofko 后台注册部署 URL 后，用户点击 addon 时 lofko 自动追加 `?token=xxx`，页面用该 token 请求后端接口。

**页面类型由 Claude 根据接口结构自动判断**，无需手动指定：

| 接口返回特征 | 生成页面类型 |
|---|---|
| 数组 + 标量字段 | 数据表格 |
| 数组 + 图片/标题/价格 | 卡片网格 |
| 单对象 + 多字段 | 详情页 |
| 数值/统计字段 | Dashboard 图表 |

**示例：**

```bash
# OpenAPI 文档
/addon-generator https://petstore.swagger.io/v2/swagger.json --deploy --name my-pet-store

# curl 命令
/addon-generator curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token" --deploy

# 自然语言
/addon-generator 一个商品库存查询接口，GET /api/inventory，返回商品名、SKU、数量、价格
```

### work-polish

把大白话转成职场语言，支持两种包装力度：

```bash
/work-polish --轻度 帮老王改了登录页面的颜色
/work-polish --重度 明天要上线但还有 3 个 bug 没修完
```

### grill-me

需求拷问模式。每轮问 2-3 个具体问题，直到需求没有歧义，最后输出结构化确认清单。

```
/grill-me 做一个商品管理后台
/grill-me 接入微信支付
```

## 示例

参考 `examples/` 目录下的示例：

- [examples/dashboard/](examples/dashboard/) — Dashboard 图表页面示例

每个示例包含需求说明和 API 文档，可直接作为 `/addon-generator` 的输入参考。
