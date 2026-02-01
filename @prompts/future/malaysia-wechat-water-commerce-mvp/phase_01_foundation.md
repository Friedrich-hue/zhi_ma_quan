## Phase 01｜基础工程与账号体系（H5 优先）

### 目标
- 跑通客户端（H5，微信内优先）与管理端的最小工程骨架
- 建立统一的 **登录/鉴权** 基建：微信 OAuth（微信内）+ 邮箱登录（非微信兜底）
- 客户端完成 **中/英文 UI 多语言** 基建（仅 UI 文案）
- 为后续商品/订单/支付/履约预留可扩展的数据结构与工程分层

### 本阶段交付物
- 可本地/测试环境访问的 H5 客户端与管理端（含基础路由/布局）
- 用户体系可用：微信 OAuth 登录、邮箱注册/登录（至少一种可完整跑通）
- 统一的鉴权中间件/工具：前端 token 管理 + 服务端鉴权校验
- 多语言框架接入并在关键页面可切换
- 初版数据表（schema）与云函数/接口骨架（空实现也可，但要把边界定清）

### 开发范围（只谈开发，不谈资质申请/商务流程）
- **工程结构**：前端（uni-app vue2）+ 管理端 + UniCloud 云函数/DB Schema
- **前端状态管理**：统一使用 Vuex（`auth/cart/checkout` 等模块）
  - cart 必须为全局共享状态；提供底部 Tabbar 的「购物车」独立入口与角标（badge）能力（UI/路由骨架本阶段即可搭好）
- **配置中心**：敏感配置走 `uni-config-center`（支付参数、回调地址、环境开关等先占位）
  - Fiuu 支付配置占位（命名建议：`payment.fiuu`）
    - `merchant_id`、`verify_key`、`secret_key`
    - `return_url`、`notify_url`、`callback_url`
    - `api_base_url`（或按 API 分组配置多个 base_url，以实际文档为准）
    - `payment_timeout_minutes`（支付超时策略）
    - `env`（sandbox/prod）与日志开关
- **账号体系**：
  - 微信内：OAuth code → 服务端换取用户标识 → 创建/更新用户 → 发放 token/session
  - 非微信：邮箱注册/登录（复用 `uni-id` / `uni-id-pages` 能力）
  - 管理端账号：角色/权限（最少区分 admin 与普通用户）
- **多语言**：仅 UI 文案多语言；商品/订单数据字段暂不多语言

### 关键设计约定（建议）
- **鉴权形态**：统一走 `Authorization: Bearer <token>`（或 uni-id 默认 token 方案）
- **用户标识**：业务主键 `user_id`（系统生成）；微信侧存 `openid/unionid`（如可得）
- **环境识别**：微信内置浏览器 UA 判断 + H5 平台判断；封装为 `is_wechat_env()`
- **接口分层**：
  - `auth`：登录/换取 token/获取当前用户
  - `catalog`：商品读取（Phase 02 落地）
  - `order`：下单与查询（Phase 02 落地）
  - `pay`：支付创建/查单/回调/对账（Phase 03 落地，支付网关为 Fiuu）
- **幂等与审计占位**：所有会改变订单状态的接口预留 `request_id` / `idempotency_key`

### 数据结构（Phase 01 只建骨架/最小字段）
- `uni-id-users`：复用 uni-id
- `admin_users`（或使用 uni-id + role 字段）：管理端权限
- `products`（骨架）：`name`、`price`、`status`、`cover_image` + 库存预留字段
  - 预留：`stock_mode`、`stock_qty`、`warehouse_id`
- `user_addresses`（骨架）：`user_id`、`name`、`phone_optional`、`address_line`、`state`、`postcode`
- `orders`（骨架）：`user_id`、`order_no`、`status`、`amount`、`currency`、`created_at`
- `order_items`（骨架）：`order_id`、`product_id`、`qty`、`price_snapshot`

### 任务拆解
- **客户端（H5）**
  - 基础路由/布局：首页、登录页、我的（占位）
  - Vuex Store 骨架：`auth/cart/checkout`；cart 支持持久化（storage）与角标展示（tabbar badge）
  - 环境识别与登录分流：微信内走 OAuth；非微信走邮箱登录
  - token 持久化、登录态守卫（下单相关页面必须登录）
  - i18n 接入：语言自动识别 + 手动切换 + storage 记忆
- **后端（UniCloud）**
  - `auth` 云函数：OAuth code 换取、用户绑定/创建、发 token
  - `me` 接口：获取当前用户信息（验证鉴权链路）
  - DB Schema：建表 + 最小索引（user_id、order_no 预留唯一索引位）
- **管理端**
  - 管理员登录（可先用账号密码/邮箱登录）
  - 权限守卫与基础菜单（商品、订单先占位）

### 验收标准（开发验收）
- H5 在微信内可进入登录流程并拿到登录态（token/session）
- 非微信环境可通过邮箱方式登录（或明确：本阶段只保证其中一种跑通，另一种可用 mock）
- 登录态可在刷新后保持；退出登录生效
- i18n 切换后页面文案即时生效并可记忆

### 风险与对策
- 微信 OAuth 依赖域名/回调地址：开发期允许使用 mock code/测试号；接口要可插拔
- 管理端权限体系后续可能扩展：先用最小 role 模型，避免过度设计

