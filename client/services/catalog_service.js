/**
 * 商品服务层
 * 页面只依赖此 service 获取商品数据
 * Phase 02 时，将 mock 实现替换为 cloud_api
 */

import { MOCK_PRODUCTS } from '@/adapters/mock'

/**
 * 获取商品列表
 * @returns {Promise<Array>} 商品列表（仅返回上架商品）
 */
export function listProducts() {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const products = MOCK_PRODUCTS.filter(p => p.status === 'on')
      resolve(products)
    }, 300)
  })
}

/**
 * 获取商品详情
 * @param {string} product_id - 商品 ID
 * @returns {Promise<Object|null>} 商品详情
 */
export function getProductDetail(product_id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find(p => p.product_id === product_id && p.status === 'on')
      resolve(product || null)
    }, 200)
  })
}

export default {
  listProducts,
  getProductDetail
}
