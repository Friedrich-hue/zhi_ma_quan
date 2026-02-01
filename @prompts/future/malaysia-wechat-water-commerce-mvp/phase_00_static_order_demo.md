## Phase 00｜静态下单 Demo（开发环境预览）

### 目标
- 尽快产出一个可部署到**开发环境**的 H5 预览版，供甲方体验核心路径
- 只实现“静态数据 + 本地状态”的下单流程，但**代码形态要为 Phase 01-03 的真实登录/下单/支付铺路**
- 严格控制 mock 的边界：做到“后续替换数据源/接入后端时，改动集中且可控”

### Demo 体验范围（包含）
- 商品列表/商品详情（静态商品数据）
- 加购/改数量/购物车（**Vuex 全局共享** + 本地持久化）
- 地址新增/编辑/选择默认地址（本地持久化，可放入 Vuex 统一管理）
- 结算页（展示地址、商品明细、金额汇总；采集配送偏好字段）
- 提交订单（本地生成订单数据，落到订单列表/详情）
- 订单状态：仅展示 `PENDING_PAYMENT`（可标注“待支付（演示）”）
- 底部 Tabbar：至少包含「商品/购物车」；购物车需有独立入口与数量角标（badge）

### 非目标（明确不做，避免无用代码）
- 不做微信 OAuth / 邮箱登录（可用“演示用户”占位，但不要写半套鉴权）
- 不做真实支付（不接回调、不做验签、不做对账）
- 不做管理端、履约、退款、库存扣减、多语言数据字段等

### 关键原则（避免无用代码的约束）
- **mock 只能存在于一个“数据源适配层”**
  - 页面/组件不得直接 import mock json
  - 页面只调用 `service`（或 `repository`）接口拿数据
  - Phase 02 接真实后端时，只替换适配层实现
- **购物车状态必须全局共享**
  - 使用 Vuex 作为全局状态（尤其是 cart），并做 storage 持久化；后续 Phase 02 可平滑替换为服务端购物车
- **数据字段 shape 从 Phase 0 就对齐后续**
  - 商品/地址/订单/订单项字段命名、结构尽量与 Phase 02/03 对齐（snake_case）
  - 金额计算口径不要散落在页面里；集中到 `order_pricing`（后续可迁移到服务端）
- **演示能力必须可插拔**
  - 例如“模拟支付成功”如果存在，也必须通过 `payment_adapter` 抽象，避免页面写死逻辑
- **只做可复用的 UI 资产**
  - 商品卡片、购物车条目、地址表单、订单汇总等应优先设计为可复用组件
  - 不为了演示临时拼装大量一次性页面逻辑

### 建议的领域对象（本地 mock 也按这个 shape）
- `product`
  - `product_id`、`name`、`spec_text`、`images`、`origin_price`、`sale_price`、`status`
  - 预留：`stock_mode`、`stock_qty`、`warehouse_id`
- `address`
  - `address_id`、`user_id`、`recipient_name`、`recipient_phone_optional`
  - `address_line1`、`address_line2_optional`、`city`、`state`、`postcode`、`is_default`
- `order`
  - `order_id`、`order_no`、`user_id`、`status`
  - `amount`、`currency`、`created_at`
  - `address_snapshot`（演示版建议直接快照，避免后续地址变更影响历史订单显示）
  - 配送偏好（订单级字段，参考 Phase 02 结算字段）：`delivery_date`、`delivery_time_slot`、`whatsapp_number_optional`、`house_number_optional`、`remark_optional`
- `order_item`
  - `order_item_id`、`order_id`、`product_id`、`qty`
  - `price_snapshot`、`name_snapshot`、`spec_snapshot`

### 建议的 service 接口（页面只依赖这些接口）
- `catalog_service`
  - `list_products()`
  - `get_product_detail(product_id)`
- `address_service`
  - `list_addresses()`
  - `create_or_update_address(payload)`
  - `delete_address(address_id)`
  - `set_default_address(address_id)`
- `cart_service`
  - `get_cart()` / `set_cart()` / `clear_cart()`
- `order_service`
  - `create_order(checkout_payload)`（生成 `order_no`、写入本地 orders）
  - `list_orders()`
  - `get_order_detail(order_id)`

> 注：Phase 02 只需把上述 service 的实现从 `mock_storage` 切换为 `cloud_api`，页面与组件应尽量不变。

### 验收标准（开发验收）
- 开发环境可访问 H5，并能完整演示：商品→加购→结算→提交订单→查看订单
- 刷新页面后购物车、地址、订单可恢复（本地存储生效）
- mock 数据不外溢：页面层找不到直接引用 mock 数据的代码路径（原则上只有适配层持有 mock）
- 订单与订单项结构已对齐 Phase 02/03（便于后续无痛接入后端与支付）

### 退出标准（进入 Phase 01/02 的前提）
- 已明确“演示版边界”，并在 UI/说明里避免造成“已具备支付/履约”的误解
- service 层接口稳定；后续迭代主要通过替换实现而非重写页面完成

