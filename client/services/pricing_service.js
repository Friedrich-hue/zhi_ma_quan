/**
 * 价格计算服务层
 * 集中处理金额计算逻辑，避免散落在页面中
 * Phase 02 时，可迁移到服务端
 */

// 配送范围（马来西亚州）
export const ALLOWED_STATES = ['Kuala Lumpur', 'Selangor']

// 可配送日期（每周三、六）
export const DELIVERY_DAYS = ['Wed', 'Sat']

// 配送时间段
export const DELIVERY_TIME_SLOTS = [
  { value: '09:00-12:00', label: '09:00 - 12:00' },
  { value: '12:00-17:00', label: '12:00 - 17:00' },
  { value: '17:00-21:00', label: '17:00 - 21:00' }
]

// 起订量
export const MIN_ORDER_QTY = 3

// 运费规则
export const SHIPPING_RULES = {
  FREE_THRESHOLD: 5,    // 满5件免运费
  BASE_FEE: 12          // 基础运费 MYR 12
}

/**
 * 计算购物车价格
 * @param {Array} items - 购物车商品 [{ sale_price, qty }]
 * @returns {Object} 价格信息
 */
export function calculateCartPricing(items) {
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.sale_price * item.qty, 0)
  
  // 运费计算
  let shippingFee = SHIPPING_RULES.BASE_FEE
  if (totalQty >= SHIPPING_RULES.FREE_THRESHOLD) {
    shippingFee = 0
  }
  
  const total = subtotal + shippingFee
  const canCheckout = totalQty >= MIN_ORDER_QTY
  
  return {
    totalQty,
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee,
    shipping_fee: shippingFee, // snake_case 别名，供订单创建使用
    total: Number(total.toFixed(2)),
    canCheckout,
    minOrderQty: MIN_ORDER_QTY,
    freeShippingThreshold: SHIPPING_RULES.FREE_THRESHOLD
  }
}

/**
 * 检查地址是否在配送范围内
 * @param {string} state - 州名
 * @returns {boolean}
 */
export function isDeliverable(state) {
  return ALLOWED_STATES.includes(state)
}

/**
 * 获取可配送日期列表（未来14天内的周三、周六）
 * @returns {Array} 日期列表 [{ value: 'YYYY-MM-DD', label: 'Day, DD MMM' }]
 */
export function getDeliveryDates() {
  const dates = []
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayName = dayNames[date.getDay()]
    
    if (DELIVERY_DAYS.includes(dayName)) {
      const value = date.toISOString().split('T')[0]
      const label = `${dayName}, ${date.getDate()} ${monthNames[date.getMonth()]}`
      dates.push({ value, label })
    }
  }
  
  return dates
}

export default {
  calculateCartPricing,
  isDeliverable,
  getDeliveryDates,
  ALLOWED_STATES,
  DELIVERY_DAYS,
  DELIVERY_TIME_SLOTS,
  MIN_ORDER_QTY,
  SHIPPING_RULES
}
