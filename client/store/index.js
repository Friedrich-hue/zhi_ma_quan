/**
 * Vuex Store - Phase 0 静态下单 Demo
 * 全局状态管理：cart / address / order
 */
import Vue from 'vue'
import Vuex from 'vuex'
import cart from './modules/cart'
import address from './modules/address'
import order from './modules/order'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    cart,
    address,
    order
  }
})

export default store
