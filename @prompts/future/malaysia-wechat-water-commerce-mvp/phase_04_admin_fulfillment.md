## Phase 04｜管理端订单处理与履约（最小可运营）

### 目标
- 管理端具备“上线可用”的订单处理能力：查看、筛选、备注、取消、完成
- 把订单状态流转做成 **可控且可审计**（避免随意改状态导致对账/售后混乱）
- 用户端可看到更稳定的订单状态与处理结果（至少能刷新看到完成/取消）
- 提供最小的支付排障能力：订单详情可查看支付流水与对账结果（用于定位“已扣款但未改单”等问题）

### 本阶段交付物
- 管理端订单工作台（列表/详情/筛选/操作）
- 订单备注体系（客服备注/内部备注）
- 订单状态更新接口（带权限校验、流转约束、审计记录）
- 订单操作审计表（operation log）
- （建议）支付流水查询入口：按 `order_no`/`provider_tran_id` 定位支付状态与回调记录
- （可选）对账异常列表：展示日对账发现的 `MISMATCH/MISSING` 订单并支持导出
- （可选）基础导出（CSV/Excel）与打印小票（看实际需要）

### 状态与流转约束（建议最小规则）
- `PENDING_PAYMENT`
  - 可流转到：`CANCELLED`（超时自动/管理员手动/用户取消）
- `PAID`
  - 可流转到：`COMPLETED`（管理员手动完成）
  - 可流转到：`CANCELLED`（谨慎：若已支付取消通常意味着退款；本 MVP 可先禁止或要求备注）
- `CANCELLED`、`COMPLETED`
  - 终态，不允许再修改（避免历史订单被“复活”）

### 数据结构建议（增量）
- `orders` 增量字段
  - `admin_note`（内部备注）
  - `customer_note_optional`（展示给用户/客服话术，可选）
  - `completed_at_optional`、`cancelled_at_optional`
  - `cancel_reason_optional`（超时/手动/用户取消）
  - 配送偏好字段（来自 Phase 02 结算页）：`delivery_date`、`delivery_time_slot`、`whatsapp_number_optional`、`house_number_optional`、`remark_optional`（管理端需展示/导出）
- `order_ops`（建议新增）
  - `order_id`、`order_no`
  - `op_type`（SET_STATUS/ADD_NOTE/EDIT_ADDRESS_SNAPSHOT/...）
  - `from_status`、`to_status`
  - `operator_id`、`operator_role`
  - `payload`（变更内容，脱敏）
  - `created_at`

### 管理端功能清单
- **订单列表**
  - 筛选：时间范围、状态、订单号、用户（可选）
  - 快速操作入口：查看详情、复制订单号、添加备注
- **订单详情**
  - 基本信息：订单号、金额、状态、支付时间（如有）
  - 支付信息（建议新增一个区块/Tab）：
    - `payments.provider/channel/status/paid_at/provider_tran_id`
    - 最近一次回调时间、对账状态（`recon_status`）
  - 地址信息：展示快照（只读为主；如需纠错走“备注/追加信息”）
  - 配送信息（来自结算）：配送日期/时段、WhatsApp、门牌号、备注（用于实际派送/客服沟通）
  - 商品明细：名称/规格/数量/单价快照
  - 操作区：
    - `PAID` → 标记完成
    - `PENDING_PAYMENT` → 取消订单（需要原因）
    - 添加/编辑内部备注
  - 操作记录：展示 `order_ops` 时间线

- （建议）**支付流水/对账排障**
  - 支付流水列表：按订单号/交易号查询，查看状态与回调原文（脱敏）
  - 对账异常列表（可选）：按日期筛选，导出异常单，用于人工复核

### 后端（UniCloud）任务拆解
- 权限与鉴权
  - 管理端接口统一做 role 校验（admin 才能操作订单状态/备注）
- 订单操作接口（示例）
  - `admin.order.set_status(order_id, to_status, reason_optional)`
  - `admin.order.set_note(order_id, admin_note)`
  - `admin.order.ops.list(order_id)`（操作记录）
- 支付/对账接口（建议）
  - `admin.payments.list(filter)`：按 `order_no/provider_tran_id/status/date_range` 查询
  - `admin.payments.detail(payment_id)`：查看支付详情与回调记录（脱敏）
  - `admin.recon.exceptions.list(recon_date)`（可选）：对账异常单列表（来自 Phase 03 的对账入库结果）
- 一致性约束
  - 状态变更必须校验当前状态 + 允许流转集合
  - 写 `order_ops` 与更新 `orders` 需要原子性（事务/原子更新）

### 用户端（H5）增量
- 订单详情页展示：完成时间/取消原因（如有）
- 订单列表刷新与空态/异常态处理
- （可选）允许用户取消未支付订单：`PENDING_PAYMENT` → `CANCELLED`

### 验收标准（开发验收）
- 管理端可筛选并打开订单详情，且数据与用户端一致
- 状态更新遵守流转规则（不允许终态再改、禁止非法跳转）
- 每次管理端操作都会生成一条 `order_ops` 记录，并能在详情页看到
- 用户端刷新后能看到订单被取消/完成后的最终状态

