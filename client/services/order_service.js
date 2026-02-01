/**
 * 订单服务层
 * 页面只依赖此 service 进行订单操作
 * Phase 0 使用 Vuex store（本地持久化）
 * Phase 02 时，替换为 cloud_api
 */

import store from '@/store'
import { ORDER_STATUS, ORDER_STATUS_TEXT } from '@/store/modules/order'

/**
 * 创建订单
 * @param {Object} checkoutPayload - 结算参数
 * @returns {Promise<Object>} 创建的订单
 */
export function createOrder(checkoutPayload) {
  return store.dispatch('order/createOrder', checkoutPayload)
}

/**
 * 获取订单列表
 * @returns {Promise<Array>} 订单列表
 */
export function listOrders() {
  return Promise.resolve(store.getters['order/orders'])
}

/**
 * 获取订单详情
 * @param {string} order_id - 订单 ID
 * @returns {Promise<Object|null>} 订单详情
 */
export function getOrderDetail(order_id) {
  return Promise.resolve(store.getters['order/getOrderById'](order_id))
}

/**
 * 根据订单号获取订单
 * @param {string} order_no - 订单号
 * @returns {Promise<Object|null>} 订单详情
 */
export function getOrderByNo(order_no) {
  return Promise.resolve(store.getters['order/getOrderByNo'](order_no))
}

/**
 * 获取订单状态文本
 * @param {string} status - 状态码
 * @returns {string} 状态文本
 */
export function getStatusText(status) {
  return ORDER_STATUS_TEXT[status] || status
}

export { ORDER_STATUS, ORDER_STATUS_TEXT }

export default {
  createOrder,
  listOrders,
  getOrderDetail,
  getOrderByNo,
  getStatusText,
  ORDER_STATUS,
  ORDER_STATUS_TEXT
}
