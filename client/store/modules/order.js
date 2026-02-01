/**
 * 订单模块 - Vuex Module
 * 本地持久化订单管理
 */

const STORAGE_KEY = 'zmq_orders'

// 从 storage 恢复订单列表
const loadOrdersFromStorage = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load orders from storage:', e)
    return []
  }
}

// 保存订单到 storage
const saveOrdersToStorage = (orders) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(orders))
  } catch (e) {
    console.error('Failed to save orders to storage:', e)
  }
}

// 生成订单号（格式：ZMQ + 年月日时分秒 + 4位随机数）
const generateOrderNo = () => {
  const now = new Date()
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return 'ZMQ' + dateStr + random
}

// 订单状态枚举
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
}

// 状态显示文本
export const ORDER_STATUS_TEXT = {
  PENDING_PAYMENT: '待支付（演示）',
  PAID: '已支付',
  CANCELLED: '已取消',
  COMPLETED: '已完成'
}

export default {
  namespaced: true,
  
  state: {
    list: loadOrdersFromStorage()
  },
  
  getters: {
    // 订单列表（按创建时间倒序）
    orders: state => [...state.list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    
    // 根据订单号获取订单
    getOrderByNo: state => (order_no) => state.list.find(o => o.order_no === order_no),
    
    // 根据 ID 获取订单
    getOrderById: state => (order_id) => state.list.find(o => o.order_id === order_id)
  },
  
  mutations: {
    ADD_ORDER(state, order) {
      state.list.unshift(order)
      saveOrdersToStorage(state.list)
    },
    
    UPDATE_ORDER_STATUS(state, { order_id, status }) {
      const order = state.list.find(o => o.order_id === order_id)
      if (order) {
        order.status = status
        order.updated_at = new Date().toISOString()
        saveOrdersToStorage(state.list)
      }
    }
  },
  
  actions: {
    /**
     * 创建订单
     * @param {Object} payload - 结算参数
     * @param {Array} payload.items - 购物车商品
     * @param {Object} payload.address - 收货地址
     * @param {Object} payload.delivery - 配送偏好
     * @param {Object} payload.pricing - 价格信息
     */
    createOrder({ commit }, payload) {
      const { items, address, delivery, pricing } = payload
      
      const order_id = 'order_' + Date.now()
      const order_no = generateOrderNo()
      
      // 构建订单项
      const order_items = items.map((item, index) => ({
        order_item_id: `${order_id}_item_${index}`,
        order_id,
        product_id: item.product_id,
        qty: item.qty,
        price_snapshot: item.sale_price,
        name_snapshot: item.name,
        spec_snapshot: item.spec_text
      }))
      
      // 构建订单
      const order = {
        order_id,
        order_no,
        user_id: 'demo_user',
        status: ORDER_STATUS.PENDING_PAYMENT,
        
        // 金额
        subtotal: pricing.subtotal,
        shipping_fee: pricing.shipping_fee,
        amount: pricing.total,
        currency: 'MYR',
        
        // 地址快照
        address_snapshot: { ...address },
        
        // 配送偏好
        delivery_date: delivery.delivery_date || null,
        delivery_time_slot: delivery.delivery_time_slot || null,
        whatsapp_number_optional: delivery.whatsapp_number || null,
        house_number_optional: delivery.house_number || null,
        remark_optional: delivery.remark || null,
        
        // 订单项
        items: order_items,
        
        // 时间
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      commit('ADD_ORDER', order)
      
      return order
    },
    
    // 更新订单状态
    updateStatus({ commit }, payload) {
      commit('UPDATE_ORDER_STATUS', payload)
    }
  }
}
