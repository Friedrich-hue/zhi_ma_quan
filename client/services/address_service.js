/**
 * 地址服务层
 * 页面只依赖此 service 进行地址操作
 * Phase 0 使用 Vuex store（本地持久化）
 * Phase 02 时，替换为 cloud_api
 */

import store from '@/store'

/**
 * 获取地址列表
 * @returns {Promise<Array>} 地址列表
 */
export function listAddresses() {
  return Promise.resolve(store.getters['address/addresses'])
}

/**
 * 创建或更新地址
 * @param {Object} payload - 地址数据
 * @returns {Promise<Object>} 保存后的地址
 */
export function createOrUpdateAddress(payload) {
  return store.dispatch('address/saveAddress', payload)
}

/**
 * 删除地址
 * @param {string} address_id - 地址 ID
 * @returns {Promise<void>}
 */
export function deleteAddress(address_id) {
  return store.dispatch('address/deleteAddress', address_id)
}

/**
 * 设置默认地址
 * @param {string} address_id - 地址 ID
 * @returns {Promise<void>}
 */
export function setDefaultAddress(address_id) {
  return store.dispatch('address/setDefaultAddress', address_id)
}

/**
 * 获取默认地址
 * @returns {Object|null} 默认地址
 */
export function getDefaultAddress() {
  return store.getters['address/defaultAddress']
}

export default {
  listAddresses,
  createOrUpdateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
}
