/**
 * 购物车模块 - Vuex Module
 * 全局共享购物车状态，支持 storage 持久化
 */

const STORAGE_KEY = 'zmq_cart'

// 从 storage 恢复购物车
const loadCartFromStorage = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load cart from storage:', e)
    return []
  }
}

// 保存购物车到 storage
const saveCartToStorage = (items) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save cart to storage:', e)
  }
}

export default {
  namespaced: true,
  
  state: {
    items: loadCartFromStorage() // [{ product_id, name, spec_text, sale_price, origin_price, qty, image }]
  },
  
  getters: {
    // 购物车商品列表
    cartItems: state => state.items,
    
    // 购物车总数量（用于 tabbar badge）
    totalQty: state => state.items.reduce((sum, item) => sum + item.qty, 0),
    
    // 商品小计（不含运费）
    subtotal: state => state.items.reduce((sum, item) => sum + item.sale_price * item.qty, 0),
    
    // 运费计算（矿泉水业务规则：3~4件 MYR12，≥5件免运费，<3件不允许下单）
    shippingFee: (state, getters) => {
      const qty = getters.totalQty
      if (qty >= 5) return 0
      if (qty >= 3) return 12
      return 12 // 不足3件也展示运费，但结算时会拦截
    },
    
    // 订单总额
    total: (state, getters) => getters.subtotal + getters.shippingFee,
    
    // 是否满足起订量
    canCheckout: (state, getters) => getters.totalQty >= 3,
    
    // 购物车是否为空
    isEmpty: state => state.items.length === 0
  },
  
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items
      saveCartToStorage(items)
    },
    
    ADD_ITEM(state, product) {
      const existing = state.items.find(item => item.product_id === product.product_id)
      if (existing) {
        existing.qty += product.qty || 1
      } else {
        state.items.push({
          product_id: product.product_id,
          name: product.name,
          spec_text: product.spec_text,
          sale_price: product.sale_price,
          origin_price: product.origin_price,
          image: product.images ? product.images[0] : '',
          qty: product.qty || 1
        })
      }
      saveCartToStorage(state.items)
    },
    
    UPDATE_QTY(state, { product_id, qty }) {
      const item = state.items.find(i => i.product_id === product_id)
      if (item) {
        item.qty = qty
        if (item.qty <= 0) {
          state.items = state.items.filter(i => i.product_id !== product_id)
        }
        saveCartToStorage(state.items)
      }
    },
    
    REMOVE_ITEM(state, product_id) {
      state.items = state.items.filter(i => i.product_id !== product_id)
      saveCartToStorage(state.items)
    },
    
    CLEAR_CART(state) {
      state.items = []
      saveCartToStorage(state.items)
    }
  },
  
  actions: {
    // 添加商品到购物车
    addItem({ commit }, product) {
      commit('ADD_ITEM', product)
      // 更新 tabbar badge
      updateTabBarBadge()
    },
    
    // 更新商品数量
    updateQty({ commit }, payload) {
      commit('UPDATE_QTY', payload)
      updateTabBarBadge()
    },
    
    // 移除商品
    removeItem({ commit }, product_id) {
      commit('REMOVE_ITEM', product_id)
      updateTabBarBadge()
    },
    
    // 清空购物车
    clearCart({ commit }) {
      commit('CLEAR_CART')
      updateTabBarBadge()
    },
    
    // 初始化时更新 badge
    initBadge({ getters }) {
      const qty = getters.totalQty
      if (qty > 0) {
        uni.setTabBarBadge({
          index: 1, // 购物车在 tabbar 的索引
          text: qty > 99 ? '99+' : String(qty)
        })
      } else {
        uni.removeTabBarBadge({ index: 1 })
      }
    }
  }
}

// 更新 tabbar 角标
function updateTabBarBadge() {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    const items = data ? JSON.parse(data) : []
    const qty = items.reduce((sum, item) => sum + item.qty, 0)
    
    if (qty > 0) {
      uni.setTabBarBadge({
        index: 1,
        text: qty > 99 ? '99+' : String(qty)
      })
    } else {
      uni.removeTabBarBadge({ index: 1 })
    }
  } catch (e) {
    console.error('Failed to update tabbar badge:', e)
  }
}
