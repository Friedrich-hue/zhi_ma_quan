## Phase 03｜Fiuu（微信H5）支付闭环（创建/回调/查单/幂等/对账）

### 目标
- 订单可完成支付闭环：`PENDING_PAYMENT` → `PAID`
- 服务端完成：对接 Fiuu 创建交易、回调验签、幂等更新订单、记录支付流水
- 补齐 3 类通知入口：Return URL / Notify URL / Callback URL
- 增加查单与日对账：用于回调丢失、状态未知的兜底与财务核验
- 客户端完成：拉起支付/跳转支付、回跳后查单确认、重复支付保护、支付失败/取消的 UX

### 本阶段交付物
- `pay.create`：为指定订单创建支付（返回跳转 URL 或唤起参数，取决于 Fiuu 接入方式）
- `pay.notify`：支付结果回调入口（Notify URL：验签 + 幂等）
- `pay.callback`：延迟/非实时状态回调入口（Callback URL：验签 + 幂等）
- `pay.query`（或 `order.detail` 扩展）：前端回跳后查单确认；服务端也可用于补偿
- `pay.recon.daily`：拉取 Transaction Reconciliation File / Daily Transaction Report 并入库核对
- `payments` 数据表：记录支付单/流水/回调原文（用于对账与排障）
- 订单超时处理：支付超时自动取消（最少实现订单状态变更；可选实现关单）

### 关键前置决策（开发需要明确）
- **支付网关**
  - 统一使用 **Fiuu**（后续如需扩展其它网关/渠道，再抽象 `pay_provider`）
- **接入形态（以 MVP 成本最低为优先）**
  - Hosted / Seamless / Direct（以 Fiuu 文档与商户开通能力为准）
- **三方订单号（OrderID）**
  - 优先复用 `orders.order_no` 作为 Fiuu 的 `OrderID`（长度控制在 32 字符以内）
  - 否则使用 `orders.provider_order_id`
- **URL 规划（必须落地）**
  - Return URL（前端跳转，非权威）
  - Notify URL（服务端 webhook，权威）
  - Callback URL（延迟状态 webhook，权威）
- **对账策略**
  - 使用 Fiuu 对账文件（日交易报表）进行日对账：参考 [Transaction Reconciliation File](https://docs.fiuu.dev/reference/transaction-reconciliation-file)

### 状态机（建议最小可用）
- `orders.status`
  - `PENDING_PAYMENT` 待支付
  - `PAID` 已支付
  - `CANCELLED` 已取消（超时/手动）
  - `COMPLETED` 已完成（Phase 04 管理端置完成）
- `payments.status`
  - `CREATED` 已创建待支付
  - `SUCCESS` 支付成功
  - `FAILED` 支付失败（含用户取消/失败）
  - `CLOSED` 已关单/过期

### 数据结构建议（增量）
- `payments`
  - 关联：`order_id`、`order_no`、`user_id`
  - 网关：`provider`（固定：`fiuu`）
  - 渠道：`channel`（如 wechat / card / fpx... 以 Fiuu 回传为准）
  - 金额：`amount`、`currency(MYR)`
  - 三方字段：
    - `provider_tran_id`（TranID）
    - `provider_order_id`（OrderID，通常等于 `orders.order_no` 或 `orders.provider_order_id`）
    - `provider_stat_code_optional`、`provider_stat_name_optional`
  - 状态：`status`、`created_at`、`paid_at_optional`、`expired_at_optional`
  - 回跳/回调（建议都记录原文，便于排障与对账）：
    - Return：`return_raw_optional`、`return_at_optional`
    - Notify：`notify_raw`、`notify_at_optional`
    - Callback：`callback_raw_optional`、`callback_at_optional`
  - 幂等：`notify_processed`、`notify_process_count`、`callback_processed_optional`、`callback_process_count_optional`
  - 对账：`last_recon_date_optional`、`recon_status_optional(MATCH/MISMATCH/MISSING)`、`recon_diff_optional`

- （建议新增）`payment_recon_files`
  - `provider(fiuu)`、`recon_date`、`response_type`、`raw_content_or_file_id`、`fetched_at`
- （建议新增）`payment_recon_items`
  - `provider(fiuu)`、`recon_date`、`provider_tran_id`、`provider_order_id`
  - `amount`、`currency`、`stat_code`、`stat_name`、`billing_date_optional`
  - `channel_optional`、`paid_date_optional`、`settlement_date_optional`
  - `raw_row`（脱敏）

### 接口/云函数清单（示例）
- `pay.create`
  - 入参：`order_id`（或 `order_no`）
  - 校验：
    - 订单归属当前用户（或管理端代付明确禁止/允许）
    - 订单状态必须为 `PENDING_PAYMENT`
    - 金额/币种从订单表读取（不信任前端）
  - 返回：
    - Hosted：`payment_url`（前端跳转）
    - 或（Seamless/Direct）：其要求的唤起参数/表单参数
- `pay.notify`（Notify URL：支付回调）
  - 验签：校验签名/回调来源（按 Fiuu 要求）
  - 核对：`order_no`、`amount`、`currency` 必须与本地订单一致
  - 幂等：同一笔支付回调重复到达只处理一次
  - 结果：更新 `payments.status=SUCCESS`，更新 `orders.status=PAID`
- `pay.callback`（Callback URL：延迟状态回调）
  - 验签 + 幂等 + 金额核对策略同 `pay.notify`
  - 用于处理非实时支付、延迟同步、状态变更等
- `pay.query`（或复用 `order.detail`）
  - 用于前端回跳后确认状态，避免只靠前端“支付成功页面”
- `pay.recon.daily`
  - 拉取指定日期对账文件/日交易报表 → 入库 `payment_recon_*` → 与本地 `payments/orders` 核对 → 输出异常清单
- `order.cancel_by_timeout`（可选：定时任务/触发器）
  - 超时未支付：置 `orders.status=CANCELLED`
  - 可选关单：调用支付侧关单接口，避免用户继续支付旧订单

### 客户端（H5）开发要点
- **拉起支付**
  - Hosted：跳转到 `payment_url`
  - Seamless/Direct：按 Fiuu 要求拉起/提交（保持封装，避免页面直接耦合）
  - 拉起/跳转失败：提示并留在订单详情页可重试
- **回跳与查单**
  - Return URL 不作为最终凭证：必须调用 `pay.query` 或 `order.detail` 确认 `PAID`
  - 轮询策略：间隔递增（例如 1s/2s/3s/5s）+ 最大等待时长
- **防重复支付**
  - 若订单已 `PAID`：支付按钮置灰/隐藏
  - 若存在未过期的 `payments(CREATED)`：优先复用，避免重复创建预支付单
- **支付失败/取消 UX**
  - 明确落点：回订单详情页（可重试）或回购物车（按产品选择）

### 服务端（UniCloud）开发要点
- **安全性**
  - 金额/币种必须来自订单表
  - 回调必须二次校验金额与订单归属（防篡改）
  - 对账/查单结果入库同样要做金额/币种核对（避免“错单匹配”）
- **幂等与并发**
  - `pay.create` 幂等：同一订单在有效期内只返回同一个可支付凭证（或返回“已创建”）
  - `pay.notify`/`pay.callback` 幂等：通过 `payments` 的处理标记 + 数据库原子更新/事务保证只处理一次
- **查单频控**
  - 查单接口需要做节流/队列：避免高频 requery 导致被网关限流或封禁
- **日对账（Reconciliation）**
  - 每天拉取对账文件并入库，核对 `orders/payments`：作为回调丢失与状态未知的兜底
  - 对账发现异常时：优先触发查单补偿；仍不一致则进入人工复核（Phase 04 可提供最小查看入口）
- **可观测性**
  - 记录 `notify_raw`（脱敏）与关键字段，便于排障与对账

### 验收标准（开发验收）
- 在测试环境可完成一次完整支付：订单从 `PENDING_PAYMENT` 变为 `PAID`
- 回调重复发送（模拟）不会导致重复记账/重复改状态
- 前端在“回跳丢失/网络抖动”时仍可通过查单确认最终状态
- 重复点击支付不会生成多笔有效支付单（或不会导致订单状态异常）
- 可手动触发一次“对账拉取与核对”，能输出：匹配/不匹配/缺失回调的订单清单

