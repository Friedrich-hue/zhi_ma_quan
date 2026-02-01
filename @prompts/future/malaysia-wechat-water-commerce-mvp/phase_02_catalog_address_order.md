## Phase 02｜商品/地址/下单（未支付）

### 目标
- 用户端可完成：**浏览商品 → 加购/改数量 → 选择地址 → 提交订单（待支付）**
- 管理端可完成：**商品 CRUD + 上下架**、**Banner 管理**、订单基础查询（列表/详情）
- 后端完成订单金额计算与订单快照（为支付与对账打基础）

### 本阶段交付物
- 用户端页面：**首页（含 Banner 轮播 + 商品列表）**、商品详情、购物车、结算页、地址管理、订单列表/详情（待支付）
- 管理端页面：**Banner 管理**、商品新增/编辑/上下架、订单列表/详情（只读即可）
- 数据结构：`opendb-banner`（系统集合）、`products`、`user_addresses`、`orders`、`order_items`（含必要索引）
- 接口/云函数：商品读取、地址 CRUD、订单创建/查询（Banner 读取/管理复用 `opendb-banner` 的 DB Schema 与通用 CRUD）

### 开发范围

- **首页 Banner（运营位）**
  - 统一使用系统集合：`opendb-banner`
  - 用户端：首页顶部轮播组件（swiper），只展示 `status=true` 的 Banner
  - 排序：按 `sort` 升序（数值越小越靠前）
  - （可选）栏目隔离：使用 `category_id` 区分（例如首页固定 `category_id="home"`）
  - 点击跳转：使用 `open_url`
    - 外部链接：`http://` / `https://`（用 web-view 打开）
    - 内部页面：以 `/`、`./`、`@/` 开头的页面路径（用 `navigateTo` 跳转）
    - 无跳转：`open_url` 为空
  - 备注：`opendb-banner` 默认不含 `start_at/end_at` 生效期字段；若后续需要“按时间自动上下架”，再评审是否扩展字段或改为自定义集合

- **商品（MVP）**
  - 列表/详情读取
  - 规格/包装信息（展示用）：如 `9.5L×2/箱`
  - 价格：原价/售价（可选促销价）
  - 上下架与图片管理
- **购物车（MVP）**
  - 先做客户端本地购物车：**Vuex 作为唯一数据源** + storage 持久化，下单时生成订单快照
  - 预留：后续可迁移到服务端购物车表
- **地址（MVP）**
  - 新增/编辑/删除、默认地址、结算选择地址
  - 马来西亚地址字段先按文本 + 基础校验（后续再标准化下拉）
- **订单（未支付）**
  - 创建订单：生成 `order_no`、计算 `amount`、写入 `orders` + `order_items`
  - 初始状态：`PENDING_PAYMENT`
  - 用户端：订单列表/详情可查看金额、地址、商品明细、状态
  - 管理端：订单列表/详情可查看并筛选

### 结算页（Checkout）字段与校验（参考 livewise.my）

> 说明：这里的字段按「用户实际填写」视角列出；落库时可按 `orders`（订单级字段）与 `address_snapshot`（地址快照）拆分存储。

- **联系信息（Contact information）**
  - `first_name`、`last_name`
  - `email_optional`：H5 端建议收集（用于通知/对账）；如后续要求必填再升级校验
  - `phone`：建议必填（配送沟通）
  - `marketing_opt_in_optional`：订阅营销（可选，默认 false）
- **收货地址（Shipping address）**
  - `recipient_name`：可由 `first_name + last_name` 拼接，或单独维护
  - `recipient_phone_optional`：建议与 `phone` 统一；若 UI 分离则提交时做合并/兜底
  - `address_line1`、`address_line2_optional`
  - `country`：默认 `Malaysia`
  - `state`、`city`、`postcode`
- **配送偏好（Remark / Delivery preference）**
  - `remark_optional`：备注
  - `delivery_date`：配送日期（建议限制在可配送日期集合内）
  - `delivery_time_slot`：配送时间段（下拉）
  - `whatsapp_number_optional`
  - `house_number_optional`：门牌号（可作为 `address_line2_optional` 的结构化补充）
- **账单地址（Billing address）**
  - `billing_same_as_shipping`（bool）
  - 若不同：`billing_address_line1`、`billing_address_line2_optional`、`billing_state`、`billing_city`、`billing_postcode`（`billing_country` 默认 Malaysia）
- **优惠码（可选）**
  - `discount_code_optional`：购物车页与结算页均可输入；是否做真实优惠计算由后续迭代决定
- **支付方式（占位，Phase 03 落地）**
  - 本阶段仅保留 UI 占位（如“线上支付/到付”），下单仍落 `PENDING_PAYMENT`（到付若要做，会影响订单状态机与履约流程，建议后续单独评审）

### 配送范围与运费规则（矿泉水业务，来自现有结账页文案）

> 以当前业务规则为 MVP 硬约束：只做“固定规则”，不做复杂运费模板/区域围栏系统。

- **配送范围**：`Kuala Lumpur`、`Selangor`（其余州在结算时拦截/提示不可配送）
- **起订量**：全购物车合计数量（暂按 `sum(qty)`）必须 **≥ 3**
  - 预留：如后续出现“单瓶/非整箱”SKU，可在商品上增加 `shipping_unit_equivalent` 用于换算“箱数”
- **运费**
  - 合计数量为 **3~4**：固定运费 `MYR 12`
  - 合计数量 **≥ 5**：免运费
- **配送日程**
  - 默认限制：每周 `Wed`、`Sat`（结算页 `delivery_date` 仅允许选择可配送日期）
  - 预留：后续可配置化（但仍不做通用运费模板）

### 关键设计约定（建议）
- **订单金额**：服务端重算并落库，不信任前端传入金额
- **配送规则校验**：服务端校验起订量、配送范围、运费计算口径一致（前端仅做提示/预校验）
- **订单快照**：`order_items.price_snapshot`、`order_items.product_snapshot`（可选）用于后续对账
- **订单号**：`order_no` 全局唯一（建议索引/唯一约束）
  - 建议让 `order_no` 可直接作为支付网关的 `OrderID` 使用：长度控制在 **32 字符以内**，并使用安全字符（如字母数字与少量分隔符）
  - 若历史原因无法满足约束：在订单表新增 `provider_order_id`（专供三方支付使用）并做唯一约束
- **下单幂等**：结算提交携带 `client_order_token`（同 token 重复提交返回同一订单）
- **库存**：本阶段不拦截库存；字段仅占位（与 README v0 保持一致）

### 数据结构建议（增量字段）

- `opendb-banner`（系统集合，直接复用）
  - `bannerfile`：图片文件（`file` 类型，使用 `bannerfile.url` 展示）
  - `open_url`：点击目标地址（外部链接或内部页面路径）
  - `title`：标题（内部标识；用户端可选展示）
  - `sort`：排序（数字越小越靠前）
  - `status`：生效状态（bool，true/false）
  - `category_id`：分类/栏目 id（可选，用于区分不同页面/栏位的 Banner）
  - `description`：备注（维护者自用）

- `products`
  - 核心：`name`、`desc`、`images[]`、`spec_text`、`origin_price`、`sale_price`、`status(on/off)`
  - 预留库存：`stock_mode`、`stock_qty`、`warehouse_id`
- `user_addresses`
  - `user_id`、`recipient_name`、`recipient_phone_optional`、`address_line1`、`address_line2_optional`
  - `city`、`state`、`postcode`、`is_default`
- `orders`
  - `user_id`、`order_no`、`status(PENDING_PAYMENT/...)`
  - `amount`、`currency(MYR)`、`address_snapshot`（或关联地址 + 快照二选一）
  - 配送偏好（订单级字段）：`delivery_date`、`delivery_time_slot`、`whatsapp_number_optional`、`house_number_optional`、`remark_optional`
  - 运费与优惠（可选）：`shipping_fee`、`discount_amount_optional`、`discount_code_optional`
  - `created_at`、`updated_at`
- `order_items`
  - `order_id`、`product_id`、`qty`
  - `price_snapshot`、`name_snapshot`、`spec_snapshot`（建议至少保存 `name/spec`）
  - 预留履约：`warehouse_id`

### 接口/云函数清单（示例）

**Banner 相关（统一复用 `opendb-banner`）**
- 用户端：使用 `unicloud-db` 组件直接查询 `opendb-banner`（过滤 `status=true`，可选 `category_id="home"`，按 `sort` 升序）
- 管理端：基于 `opendb-banner` 的 DB Schema 使用通用 CRUD（新增/编辑/删除/上下架/排序）

**商品相关**
- `catalog.products.list`：分页商品列表（只返回上架商品）
- `catalog.products.detail`：商品详情
- `admin.products.create/update/off_shelf/on_shelf/list`

**地址相关**
- `address.create/update/delete/list/set_default`

**订单相关**
- `order.create`：创建订单（从购物车/结算参数生成）
- `order.list/detail`：用户侧订单列表/详情
- `admin.orders.list/detail`（只读即可）

### 任务拆解

- **客户端（H5）**
  - **首页 Banner 轮播**
    - swiper 轮播组件（自动播放、指示器、手势滑动）
    - 点击跳转逻辑：根据 `open_url` 判断外链/内页/空
    - 空态处理：无 Banner 时隐藏轮播区域
    - 图片懒加载与占位（可选优化）
  - 商品列表/详情（含多语言 UI 文案适配）
  - 购物车：加购、数量修改、清空、存储与恢复（Vuex + storage）；Tabbar 独立购物车入口 + 数量角标
  - 地址管理：CRUD + 默认地址
  - 结算页：展示订单明细与总价，采集字段（联系信息/地址/配送偏好），提交生成订单
  - 订单页：列表/详情（待支付状态）

- **后端（UniCloud）**
  - **Banner（opendb-banner）**
    - 本阶段不新增自定义 Banner 云函数：用户端用 `unicloud-db` 查询；管理端用通用 CRUD
    - 图片上传：使用 `opendb-banner.bannerfile`（file 类型）上传并存储
  - 商品读取接口：按 `status` 过滤、分页
  - 地址 CRUD：只能操作自己的地址（鉴权）
  - 订单创建：金额重算（含运费规则）、快照落库、幂等处理、生成 `order_no`
  - 查询接口：按 `user_id` 过滤用户侧；管理端按权限放开

- **管理端**
  - **Banner 管理**
    - 列表页：展示所有 Banner（缩略图、标题、状态、排序、操作）
    - 新增/编辑：图片上传（`bannerfile`）、跳转地址（`open_url`）、排序（`sort`）、状态（`status`）、栏目（`category_id` 可选）
    - 上下架：快捷操作
    - 删除：二次确认
    - （可选）拖拽排序
  - 商品管理：新增/编辑/图片/上下架
  - 订单查看：列表筛选（时间/状态/订单号），详情查看（地址/商品/金额）

### 验收标准（开发验收）
- 可从 0 开始完成一次“加购→结算→提交订单”，订单状态为 `PENDING_PAYMENT`
- 用户端订单列表/详情展示数据正确（金额、商品明细、地址快照）
- 管理端可新增商品并上下架；用户端仅能看到上架商品
- 接口鉴权正确：用户不能读/改他人地址与订单

