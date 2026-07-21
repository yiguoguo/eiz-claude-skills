# Eiz Claude Skills

公司内部 Claude Code 插件集合。

## 安装

```bash
/plugin marketplace add yiguoguo/eiz-claude-skills
/plugin install eiz-claude-skills@eiz-claude-skills
```

## Skills

### `/addon-generator` — 接口文档转页面

根据 API 文档自动生成 lofko addon 页面，Claude 根据接口结构自动判断页面类型（表格/卡片/详情/图表），生成完整 Next.js + Tailwind 项目，可选 Vercel 一键部署。

```
/addon-generator https://petstore.swagger.io/v2/swagger.json --deploy
/addon-generator 一个商品库存查询接口，GET /api/inventory，返回商品名、SKU、数量、价格
```

<details>
<summary>页面类型自动推断规则</summary>

| 接口返回特征 | 页面类型 |
|---|---|
| 数组 + 标量字段 | 数据表格 |
| 数组 + 图片/标题/价格 | 卡片网格 |
| 单对象 + 多字段 | 详情页 |
| 数值/统计字段 | Dashboard 图表 |

</details>

<details>
<summary>lofko addon 工作流程</summary>

1. 管理员在 lofko 后台注册 addon，填入部署 URL
2. 用户点击 addon，lofko 自动追加 `?token=xxx`
3. 页面用 token 请求后端接口（`Authorization: Bearer <token>`）

</details>

---

### `/work-polish` — 职场语言包装

大白话变专业汇报语言，两种力度可选。

```bash
/work-polish --轻度 帮老王改了登录页面的颜色
/work-polish --重度 明天要上线但还有 3 个 bug 没修完
```

- **轻度**：加 2-3 个术语，见好就收，适合日常周报
- **重度**：拉满，PPT 标题级输出，适合向上汇报

---

### `/grill-me` — 需求拷问

每轮问 2-3 个具体问题，持续挖掘需求里的漏洞、边界情况和隐含假设，直到确认没有歧义，最后输出结构化需求确认清单。

```bash
/grill-me 做一个商品管理后台
/grill-me 接入微信支付
```

## 示例

`examples/` 目录包含可直接作为 `/addon-generator` 输入的示例：

- [examples/dashboard/](examples/dashboard/) — Dashboard 图表页面
