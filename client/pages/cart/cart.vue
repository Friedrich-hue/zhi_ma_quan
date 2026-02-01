<template>
  <view class="cart-page">
    <!-- Header -->
    <view class="page-header">
      <text class="header-title">Shopping Cart</text>
    </view>
    
    <!-- Cart Content -->
    <view class="cart-content" v-if="!isEmpty">
      <!-- Cart Items -->
      <view class="cart-items">
        <cart-item
          v-for="item in cartItems"
          :key="item.product_id"
          :item="item"
          @change="refreshCart"
        />
      </view>
      
      <!-- Order Summary -->
      <order-summary
        :totalQty="pricing.totalQty"
        :subtotal="pricing.subtotal"
        :shippingFee="pricing.shippingFee"
        :total="pricing.total"
        :canCheckout="pricing.canCheckout"
        :minOrderQty="pricing.minOrderQty"
        :freeShippingThreshold="pricing.freeShippingThreshold"
      />
    </view>
    
    <!-- Empty State -->
    <view v-if="isEmpty" class="empty-state">
      <uni-icons type="cart" size="80" color="#ccc" />
      <text class="empty-title">Your cart is empty</text>
      <text class="empty-desc">Add some mineral water to get started</text>
      <view class="shop-btn" @click="goShopping">
        <text>Start Shopping</text>
      </view>
    </view>
    
    <!-- Bottom Bar -->
    <view class="bottom-bar" v-if="!isEmpty">
      <view class="total-section">
        <text class="total-label">Total:</text>
        <text class="total-value">RM {{ formatPrice(pricing.total) }}</text>
      </view>
      <view 
        class="checkout-btn" 
        :class="{ disabled: !pricing.canCheckout }"
        @click="goCheckout"
      >
        <text>Checkout</text>
      </view>
    </view>
  </view>
</template>

<script>
import { initCartBadge } from '@/services/cart_service'
import { calculateCartPricing } from '@/services/pricing_service'
import CartItem from '@/components/cart-item/cart-item.vue'
import OrderSummary from '@/components/order-summary/order-summary.vue'

export default {
  components: {
    CartItem,
    OrderSummary
  },
  computed: {
    // 直接从 store 响应式获取购物车数据
    cartItems() {
      return this.$store.getters['cart/cartItems']
    },
    isEmpty() {
      return this.cartItems.length === 0
    },
    // 价格计算（响应式）
    pricing() {
      return calculateCartPricing(this.cartItems)
    }
  },
  onShow() {
    initCartBadge()
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    // 保留此方法供子组件调用（兼容性），但实际数据已响应式更新
    refreshCart() {
      // 数据已通过 computed 自动响应式更新，此方法仅保留兼容性
      initCartBadge()
    },
    goShopping() {
      uni.switchTab({
        url: '/pages/catalog/catalog'
      })
    },
    goCheckout() {
      if (!this.pricing.canCheckout) {
        uni.showToast({
          title: `Minimum ${this.pricing.minOrderQty} items required`,
          icon: 'none'
        })
        return
      }
      uni.navigateTo({
        url: '/pages/checkout/checkout'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
}

.page-header {
  background: #fff;
  padding: 60rpx 32rpx 32rpx;
  padding-top: calc(env(safe-area-inset-top) + 60rpx);
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
}

.cart-content {
  padding: 24rpx;
}

.cart-items {
  margin-bottom: 24rpx;
}

.empty-state {
  padding: 120rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-top: 32rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 12rpx;
}

.shop-btn {
  margin-top: 48rpx;
  padding: 24rpx 64rpx;
  background: #007aff;
  border-radius: 8rpx;
  
  text {
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
  }
  
  &:active {
    opacity: 0.9;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 100rpx; // tabbar 高度
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.total-section {
  flex: 1;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #e53935;
  margin-left: 8rpx;
}

.checkout-btn {
  min-width: 240rpx;
  height: 80rpx;
  background: #007aff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
  }
  
  &:active {
    opacity: 0.9;
  }
  
  &.disabled {
    background: #ccc;
  }
}
</style>
