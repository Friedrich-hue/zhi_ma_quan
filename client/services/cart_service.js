/**
 * 购物车服务层
 * 页面只依赖此 service 进行购物车操作
 * Phase 0 使用 Vuex store（本地持久化）
 * Phase 02 时，可替换为服务端购物车
 */

import store from '@/store'

/**
 * 获取购物车
 * @returns {Object} 购物车数据
 */
export function getCart() {
  return {
    items: store.getters['cart/cartItems'],
    totalQty: store.getters['cart/totalQty'],
    subtotal: store.getters['cart/subtotal'],
    shippingFee: store.getters['cart/shippingFee'],
    total: store.getters['cart/total'],
    canCheckout: store.getters['cart/canCheckout'],
    isEmpty: store.getters['cart/isEmpty']
  }
}

/**
 * 添加商品到购物车
 * @param {Object} product - 商品信息
 * @param {number} qty - 数量（默认1）
 */
export function addToCart(product, qty = 1) {
  return store.dispatch('cart/addItem', { ...product, qty })
}

/**
 * 更新购物车商品数量
 * @param {string} product_id - 商品 ID
 * @param {number} qty - 新数量
 */
export function updateCartQty(product_id, qty) {
  return store.dispatch('cart/updateQty', { product_id, qty })
}

/**
 * 从购物车移除商品
 * @param {string} product_id - 商品 ID
 */
export function removeFromCart(product_id) {
  return store.dispatch('cart/removeItem', product_id)
}

/**
 * 清空购物车
 */
export function clearCart() {
  return store.dispatch('cart/clearCart')
}

/**
 * 初始化购物车 badge（页面加载时调用）
 */
export function initCartBadge() {
  return store.dispatch('cart/initBadge')
}

export default {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  initCartBadge
}
