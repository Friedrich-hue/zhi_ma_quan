# 知马圈（马来西亚）微信H5商城 MVP 方案（v0.1）

## 1. 背景与目标

为马来西亚矿泉水一级经销商搭建一套 **微信内 H5 商城**，用于线上售卖与订单处理；前端基于 `uni-app`，后续可复用同套业务逻辑编译到 **小程序/APP**。

本阶段目标聚焦：

- **卖货**：用户快速选购、下单、支付（微信H5）
- **履约前的订单管理**：管理员可在后台查看与处理订单
- **多语言**：客户端 UI 支持中英文；管理端仅中文

## 2. 端与角色

- **客户端（H5，优先微信环境）**
  - 中/英文 UI
  - 必须登录后才能下单
- **管理端（后台）**
  - 仅中文 UI
  - 订单与商品、地址相关管理

### 2.1 开发分阶段（仅开发）

- Phase 00：静态下单 Demo（开发环境预览）[phase_00_static_order_demo.md](./phase_00_static_order_demo.md)
- Phase 01：基础工程与账号体系（H5 优先）[phase_01_foundation.md](./phase_01_foundation.md)
- Phase 02：商品/地址/下单（未支付）[phase_02_catalog_address_order.md](./phase_02_catalog_address_order.md)
- Phase 03：Fiuu 支付闭环（微信H5：创建/回调/查单/幂等/对账）[phase_03_wechat_h5_payment.md](./phase_03_wechat_h5_payment.md)
- Phase 04：管理端订单处理与履约（最小可运营）[phase_04_admin_fulfillment.md](./phase_04_admin_fulfillment.md)
- Phase 05：微信小程序适配与交付前开发加固 [phase_05_miniprogram_adaptation.md](./phase_05_miniprogram_adaptation.md)

## 3. 登录与账号体系（重要约束）

### 3.1 登录优先级（按运行环境判断）

1. **微信环境**：优先使用 **微信 OAuth 登录**（微信内 WebView）
2. **非微信环境**：使用 **邮箱注册/登录**（次选方案）

### 3.2 下单与身份标识

- **下单必须登录**
- **不以手机号为主键**，不要求绑定手机号
- 账号主键建议：`user_id`（系统生成）+ 登录凭据（微信 unionid/openid / email）

### 3.3 需要落地的实现点（后端/前端）

- 识别运行环境：是否微信内置浏览器（UA 判断）+ H5 平台判断
- 微信 OAuth：
  - 获取 code → 服务端换取用户标识 → 建立会话/发 token
  - 需要 **回调地址**、**状态校验**（state）、**登录幂等**
- 邮箱登录：
  - 注册/登录/找回密码（可复用 `uni-id-pages` 能力）

## 4. 多语言（客户端启用，管理端仅中文）

### 4.1 客户端语言策略

- **默认**：优先根据系统语言（`uni.getLocale()` 等）
- **用户可选择语言**：记忆用户选择（storage）
- **兜底**：中文（`zh-Hans`）

### 4.2 多语言范围

- **仅 UI 多语言**
- **暂不做动态数据字段多语言**（如商品名/描述等仍以单语言存储与展示）

### 4.3 管理端语言策略

- **只启用中文**（不提供语言切换入口）

## 5. 首页运营与商品售卖（MVP 范围）

### 5.0 首页 Banner（运营位）

> 首页顶部轮播 Banner，用于品牌宣传、促销活动、新品推荐等运营场景。

#### 5.0.1 Banner 展示（用户端）

- 首页顶部轮播组件（swiper）
- 支持图片展示 + 点击跳转（内部页面/外部链接）
- 仅展示上架状态的 Banner，按排序权重展示
- 空态处理：无 Banner 时隐藏轮播区域或展示默认占位

#### 5.0.2 Banner 管理（管理端）

- **新增/编辑 Banner**
  - 图片上传（建议尺寸/比例约束，如 750×300 或 2.5:1）
  - 跳转链接（`link_type`：`none`/`internal`/`external`）
  - 内部跳转：商品详情、分类页、活动页等（`link_path`）
  - 外部跳转：完整 URL（`link_url`）
  - 排序权重（`sort_order`，数值越大越靠前）
  - 上下架状态（`status`：`on`/`off`）
  - 生效时间范围（可选）：`start_at`、`end_at`
- **上下架**：快捷操作
- **排序**：支持拖拽或权重调整
- **预览**：编辑时可预览效果（可选）

#### 5.0.3 Banner 数据结构（建议）

```
banners
├── _id
├── title              // Banner 标题（内部标识，用户端可选展示）
├── image_url          // 图片地址（云存储/CDN）
├── link_type          // 跳转类型：none/internal/external
├── link_path          // 内部跳转路径（如 /pages/product/detail?id=xxx）
├── link_url           // 外部跳转链接
├── sort_order         // 排序权重（数值越大越靠前）
├── status             // 状态：on/off
├── start_at           // 生效开始时间（可选）
├── end_at             // 生效结束时间（可选）
├── created_at
├── updated_at
└── created_by         // 创建人（管理员 ID）
```

### 5.1 商品展示（用户端）

- 商品列表（分类/搜索可先简化）
- 商品详情（图片、规格/包装、价格、促销价/原价）
- 加购/数量调整
- 购物车：Vuex 全局共享 + 底部 Tabbar 独立购物车入口（含数量角标 badge）

### 5.2 商品管理（管理端）

- 新增/编辑商品
- 上下架
- 价格（原价、售价）
- 图片管理
- 规格/包装信息（如 9.5L×2/箱、1.5L×12）
- 商品描述信息（如商品的详细介绍、使用方法、注意事项等）

### 5.3 库存与仓库（本期不做，但要预留）

当前阶段：

- **不做库存扣减、不做仓库/采购**，下单不拦截库存

需要预留的扩展窗口（字段/结构建议）：

- 商品层面预留：`stock_mode`（none/simple/multi_warehouse）、`stock_qty`、`warehouse_id` 等
- 订单项预留：`warehouse_id`、`procurement_status`、`inventory_reserved` 等

## 6. 地址与配送信息（MVP）

### 6.1 用户侧地址

- 新增/编辑/删除收货地址
- 结算时选择地址

### 6.2 管理侧地址管理

本期至少满足：

- 可查询订单地址/用户地址
- 可对异常地址做备注/纠错（如需）

（复杂运费模板/多区域围栏可在后续迭代；本期会实现“矿泉水业务固定规则”的最小配送约束）

### 6.3 结算页字段（参考 livewise.my）

- 联系信息：`first_name`、`last_name`、`phone`、`email_optional`
- 收货地址：`address_line1`、`address_line2_optional`、`city`、`state`、`postcode`、`country(Malaysia)`
- 配送偏好：`delivery_date`、`delivery_time_slot`、`whatsapp_number_optional`、`house_number_optional`、`remark_optional`
- 账单地址：`billing_same_as_shipping`（若不同则填写 billing 地址字段）

### 6.4 配送范围与运费规则（矿泉水业务）

- 配送范围：Kuala Lumpur / Selangor
- 起订量：≥ 3（按购物车合计数量，MVP 先按 `sum(qty)`）
- 运费：3~4 加 `MYR 12`；≥ 5 免运费
- 配送日程：默认每周 Wed / Sat（结算页限制可选日期）

## 7. 订单（核心）

### 7.1 用户侧订单能力

- 创建订单（结算提交）
- 订单列表/详情
- 支付状态展示

### 7.2 管理端订单能力

MVP 需要：

- 订单列表（筛选：时间、状态、用户、订单号）
- 订单详情（商品、数量、金额、地址）
- 订单状态更新（最少：待支付/已支付/已取消/已完成）
- 订单备注（客服/处理备注）

### 7.3 订单状态（建议初版）

- `PENDING_PAYMENT` 待支付
- `PAID` 已支付
- `CANCELLED` 已取消（含超时取消/手动取消）
- `COMPLETED` 已完成（人工置完成即可）

后续可扩展：

- `PROCESSING` 备货中、`DELIVERING` 配送中、退款相关状态等

## 8. 支付（本期：Fiuu 网关 + 微信支付）

### 8.1 支付渠道

- **仅对接微信支付（WeChat Pay）**（本期）
- **支付服务商/网关：Fiuu**（统一下单、回调、查单、对账）

### 8.2 关键实现要求（必须考虑）

#### 8.2.1 支付创建
- 支付创建：服务端创建支付单/统一下单（对接 Fiuu）

#### 8.2.2 回跳/回调（权威来源）
- 回跳（Return URL）：前端/浏览器跳转通知，**不可靠**（可能丢失）
- 回调（Notify URL）：服务端 webhook，**权威来源**，用于更新订单/支付状态（验签 + 幂等）
- 回调（Callback URL）：用于非实时/延迟状态变更通知（同样做验签 + 幂等）

#### 8.2.3 查单（兜底）
- 前端回跳后必须查单确认：查询订单支付状态（轮询/查询接口），防止仅靠前端回跳页面
- 服务端也需要查单兜底：回调丢失/状态未知时，按频控策略触发支付状态查询

#### 8.2.4 防重复支付
- 同一订单重复拉起支付时的处理策略：优先复用未过期支付单/凭证，避免重复创建

### 8.3 日对账（Reconciliation）
- 每日拉取支付网关提供的 **Transaction Reconciliation File / Daily Transaction Report**，与本地 `orders/payments` 核对
- 对账用于：补偿回调丢失、发现异常交易、财务结算核验、排障追溯
- 参考：Fiuu 对账文件文档 [Transaction Reconciliation File](https://docs.fiuu.dev/reference/transaction-reconciliation-file)

## 9. 非目标（明确不做）

本期不做：

- 库存/仓库/采购
- 多仓库履约
- 商品/订单的动态内容多语言
- 复杂营销（优惠券、积分、分销等）
- 不做复杂配送系统（运费模板、区域围栏、阶梯计价、多仓与多承运商等）；仅实现矿泉水业务所需的固定规则（起订量/固定运费/固定配送日程）

## 10. 需要进一步补齐的决策清单（下一轮）

- 微信 OAuth：
  - 是否要求公众号/开放平台绑定？回调域名如何配置？
  - 用户从非微信环境访问 H5 时的体验：是否提示“请在微信打开”还是直接走邮箱登录？
- 支付：
  - Fiuu 接入方式：Hosted/Seamless/Direct（以 MVP 成本最低为优先）
  - 回跳/回调地址：Return/Notify/Callback 三个 URL 的实际域名与路由约定
  - 支付失败/取消的 UX（是否回购物车/订单页）
  - 订单支付超时策略（超时自动取消时间：15/30 分钟？）
  - 日对账策略：拉取时间（T+0/T+1）、频率、异常单处理流程（自动补偿/人工复核）
- 订单履约：
  - 管理端“完成订单”的标准：发货/送达谁来确认？
- 地址：
  - 地址字段规范（马来西亚州/邮编是否要做标准化下拉）

---

变更记录：

- v0：根据当前沟通形成初版方案（登录优先微信OAuth、非微信邮箱；下单必须登录不绑手机号；客户端UI中英文；本期仅商品/订单/地址；支付微信H5；库存与仓库后续迭代预留）
- v0.1：支付服务商确定为 Fiuu，补充回跳/回调/查单与日对账（Transaction Reconciliation File）方案
- v0.2：补充结算字段（参考 livewise.my）与矿泉水配送规则；明确客户端使用 Vuex 全局购物车 + 独立购物车 Tabbar

