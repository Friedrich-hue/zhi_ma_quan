/**
 * 地址模块 - Vuex Module
 * 本地持久化地址管理
 */

const STORAGE_KEY = 'zmq_addresses'

// 从 storage 恢复地址列表
const loadAddressesFromStorage = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load addresses from storage:', e)
    return []
  }
}

// 保存地址到 storage
const saveAddressesToStorage = (addresses) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(addresses))
  } catch (e) {
    console.error('Failed to save addresses to storage:', e)
  }
}

// 生成唯一 ID
const generateId = () => 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

export default {
  namespaced: true,
  
  state: {
    list: loadAddressesFromStorage()
  },
  
  getters: {
    // 地址列表
    addresses: state => state.list,
    
    // 默认地址
    defaultAddress: state => state.list.find(addr => addr.is_default) || state.list[0] || null,
    
    // 根据 ID 获取地址
    getAddressById: state => (id) => state.list.find(addr => addr.address_id === id)
  },
  
  mutations: {
    SET_ADDRESSES(state, addresses) {
      state.list = addresses
      saveAddressesToStorage(addresses)
    },
    
    ADD_ADDRESS(state, address) {
      // 如果是默认地址，取消其他默认
      if (address.is_default) {
        state.list.forEach(addr => addr.is_default = false)
      }
      // 如果是第一个地址，设为默认
      if (state.list.length === 0) {
        address.is_default = true
      }
      state.list.unshift(address)
      saveAddressesToStorage(state.list)
    },
    
    UPDATE_ADDRESS(state, address) {
      const index = state.list.findIndex(addr => addr.address_id === address.address_id)
      if (index !== -1) {
        // 如果设为默认，取消其他默认
        if (address.is_default) {
          state.list.forEach(addr => addr.is_default = false)
        }
        state.list.splice(index, 1, address)
        saveAddressesToStorage(state.list)
      }
    },
    
    DELETE_ADDRESS(state, address_id) {
      const index = state.list.findIndex(addr => addr.address_id === address_id)
      if (index !== -1) {
        const wasDefault = state.list[index].is_default
        state.list.splice(index, 1)
        // 如果删除的是默认地址，将第一个设为默认
        if (wasDefault && state.list.length > 0) {
          state.list[0].is_default = true
        }
        saveAddressesToStorage(state.list)
      }
    },
    
    SET_DEFAULT(state, address_id) {
      state.list.forEach(addr => {
        addr.is_default = addr.address_id === address_id
      })
      saveAddressesToStorage(state.list)
    }
  },
  
  actions: {
    // 创建或更新地址
    saveAddress({ commit, state }, addressData) {
      const address = {
        ...addressData,
        user_id: 'demo_user', // 演示用户
        address_id: addressData.address_id || generateId()
      }
      
      if (addressData.address_id) {
        commit('UPDATE_ADDRESS', address)
      } else {
        commit('ADD_ADDRESS', address)
      }
      
      return address
    },
    
    // 删除地址
    deleteAddress({ commit }, address_id) {
      commit('DELETE_ADDRESS', address_id)
    },
    
    // 设置默认地址
    setDefaultAddress({ commit }, address_id) {
      commit('SET_DEFAULT', address_id)
    }
  }
}
