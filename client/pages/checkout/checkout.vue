<template>
  <view class="checkout-page">
    <!-- Header -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="header-title">Checkout</text>
    </view>
    
    <view class="checkout-content">
      <!-- Shipping Address -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">Shipping Address</text>
          <view class="change-btn" @click="selectAddress">
            <text>{{ selectedAddress ? 'Change' : 'Add' }}</text>
          </view>
        </view>
        
        <view v-if="selectedAddress" class="address-preview">
          <text class="address-name">{{ selectedAddress.recipient_name }}</text>
          <text v-if="selectedAddress.recipient_phone_optional" class="address-phone">
            {{ selectedAddress.recipient_phone_optional }}
          </text>
          <text class="address-detail">
            {{ selectedAddress.address_line1 }}
            <text v-if="selectedAddress.address_line2_optional">, {{ selectedAddress.address_line2_optional }}</text>
          </text>
          <text class="address-location">
            {{ selectedAddress.city }}, {{ selectedAddress.state }} {{ selectedAddress.postcode }}
          </text>
          <view v-if="!isDeliverable" class="address-warning">
            <uni-icons type="info" size="16" color="#e53935" />
            <text>Delivery not available in this area</text>
          </view>
        </view>
        
        <view v-else class="no-address" @click="selectAddress">
          <uni-icons type="plusempty" size="24" color="#007aff" />
          <text>Add shipping address</text>
        </view>
      </view>
      
      <!-- Delivery Preference -->
      <view class="section">
        <text class="section-title">Delivery Preference</text>
        
        <view class="form-item">
          <text class="form-label">Delivery Date *</text>
          <picker mode="selector" :range="deliveryDates" range-key="label" @change="onDateChange">
            <view class="picker-value">
              <text>{{ selectedDateLabel || 'Select date' }}</text>
              <uni-icons type="right" size="16" color="#999" />
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">Delivery Time *</text>
          <picker mode="selector" :range="timeSlots" range-key="label" @change="onTimeChange">
            <view class="picker-value">
              <text>{{ selectedTimeLabel || 'Select time' }}</text>
              <uni-icons type="right" size="16" color="#999" />
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">WhatsApp Number (optional)</text>
          <input 
            class="form-input" 
            type="number"
            v-model="delivery.whatsapp_number"
            placeholder="For delivery notification"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">House/Unit Number (optional)</text>
          <input 
            class="form-input" 
            v-model="delivery.house_number"
            placeholder="e.g. Unit 12A, Block B"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">Remark (optional)</text>
          <textarea 
            class="form-textarea"
            v-model="delivery.remark"
            placeholder="Special instructions for delivery"
          />
        </view>
      </view>
      
      <!-- Order Items -->
      <view class="section">
        <text class="section-title">Order Items ({{ pricing.totalQty }})</text>
        <view class="order-items">
          <view class="order-item" v-for="item in cartItems" :key="item.product_id">
            <image class="item-image" :src="item.image" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">{{ item.spec_text }}</text>
              <view class="item-bottom">
                <text class="item-price">RM {{ formatPrice(item.sale_price) }}</text>
                <text class="item-qty">x {{ item.qty }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Order Summary -->
      <order-summary
        :totalQty="pricing.totalQty"
        :subtotal="pricing.subtotal"
        :shippingFee="pricing.shippingFee"
        :total="pricing.total"
        :canCheckout="true"
        :minOrderQty="pricing.minOrderQty"
        :freeShippingThreshold="pricing.freeShippingThreshold"
      />
    </view>
    
    <!-- Bottom Bar -->
    <view class="bottom-bar">
      <view class="total-section">
        <text class="total-label">Total:</text>
        <text class="total-value">RM {{ formatPrice(pricing.total) }}</text>
      </view>
      <view 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }"
        @click="submitOrder"
      >
        <text>Place Order</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCart, clearCart } from '@/services/cart_service'
import { getDefaultAddress } from '@/services/address_service'
import { createOrder } from '@/services/order_service'
import { calculateCartPricing, isDeliverable, getDeliveryDates, DELIVERY_TIME_SLOTS } from '@/services/pricing_service'
import OrderSummary from '@/components/order-summary/order-summary.vue'

export default {
  components: {
    OrderSummary
  },
  data() {
    return {
      cartItems: [],
      pricing: {},
      selectedAddress: null,
      deliveryDates: [],
      timeSlots: DELIVERY_TIME_SLOTS,
      delivery: {
        delivery_date: '',
        delivery_time_slot: '',
        whatsapp_number: '',
        house_number: '',
        remark: ''
      }
    }
  },
  computed: {
    isDeliverable() {
      if (!this.selectedAddress) return true
      return isDeliverable(this.selectedAddress.state)
    },
    selectedDateLabel() {
      const date = this.deliveryDates.find(d => d.value === this.delivery.delivery_date)
      return date ? date.label : ''
    },
    selectedTimeLabel() {
      const time = this.timeSlots.find(t => t.value === this.delivery.delivery_time_slot)
      return time ? time.label : ''
    },
    canSubmit() {
      return (
        this.selectedAddress &&
        this.isDeliverable &&
        this.delivery.delivery_date &&
        this.delivery.delivery_time_slot &&
        this.cartItems.length > 0
      )
    }
  },
  onLoad() {
    this.loadData()
    this.deliveryDates = getDeliveryDates()
  },
  onShow() {
    // 从地址选择页返回时刷新地址
    this.loadAddress()
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    loadData() {
      const cart = getCart()
      this.cartItems = cart.items
      this.pricing = calculateCartPricing(cart.items)
      
      if (cart.items.length === 0) {
        uni.showToast({
          title: 'Cart is empty',
          icon: 'none'
        })
        setTimeout(() => uni.navigateBack(), 1500)
      }
    },
    loadAddress() {
      // 检查是否有选中的地址（从地址选择页传回）
      const selectedId = uni.getStorageSync('zmq_selected_address_id')
      if (selectedId) {
        uni.removeStorageSync('zmq_selected_address_id')
        const addresses = this.$store.getters['address/addresses']
        this.selectedAddress = addresses.find(a => a.address_id === selectedId) || getDefaultAddress()
      } else if (!this.selectedAddress) {
        this.selectedAddress = getDefaultAddress()
      }
    },
    goBack() {
      uni.navigateBack()
    },
    selectAddress() {
      uni.navigateTo({
        url: '/pages/address/address-list?mode=select'
      })
    },
    onDateChange(e) {
      const index = e.detail.value
      this.delivery.delivery_date = this.deliveryDates[index].value
    },
    onTimeChange(e) {
      const index = e.detail.value
      this.delivery.delivery_time_slot = this.timeSlots[index].value
    },
    async submitOrder() {
      if (!this.canSubmit) {
        if (!this.selectedAddress) {
          uni.showToast({ title: 'Please add address', icon: 'none' })
        } else if (!this.isDeliverable) {
          uni.showToast({ title: 'Area not deliverable', icon: 'none' })
        } else if (!this.delivery.delivery_date) {
          uni.showToast({ title: 'Please select date', icon: 'none' })
        } else if (!this.delivery.delivery_time_slot) {
          uni.showToast({ title: 'Please select time', icon: 'none' })
        }
        return
      }
      
      uni.showLoading({ title: 'Placing order...' })
      
      try {
        const order = await createOrder({
          items: this.cartItems,
          address: this.selectedAddress,
          delivery: this.delivery,
          pricing: this.pricing
        })
        
        // 清空购物车
        await clearCart()
        
        uni.hideLoading()
        
        // 跳转到订单详情
        uni.redirectTo({
          url: `/pages/order/order-detail?id=${order.order_id}`
        })
      } catch (e) {
        uni.hideLoading()
        console.error('Failed to create order:', e)
        uni.showToast({
          title: 'Failed to place order',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
}

.page-header {
  background: #fff;
  padding: 20rpx 32rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn {
  padding: 8rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.checkout-content {
  padding: 24rpx;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.change-btn {
  text {
    font-size: 26rpx;
    color: #007aff;
  }
}

.address-preview {
  background: #f9f9f9;
  padding: 20rpx;
  border-radius: 8rpx;
}

.address-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.address-phone {
  font-size: 26rpx;
  color: #666;
  margin-left: 16rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-top: 8rpx;
  line-height: 1.5;
}

.address-location {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.address-warning {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
  padding: 12rpx;
  background: #ffebee;
  border-radius: 6rpx;
  
  text {
    font-size: 24rpx;
    color: #e53935;
  }
}

.no-address {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 40rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  border: 2rpx dashed #ddd;
  
  text {
    font-size: 28rpx;
    color: #007aff;
  }
}

.form-item {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  
  text {
    font-size: 28rpx;
    color: #333;
  }
}

.form-input {
  width: 100%;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.order-items {
  margin-top: 16rpx;
}

.order-item {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-spec {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.item-bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 26rpx;
  color: #e53935;
}

.item-qty {
  font-size: 24rpx;
  color: #666;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
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

.submit-btn {
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
