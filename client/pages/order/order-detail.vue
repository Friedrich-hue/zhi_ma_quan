<template>
  <view class="order-detail-page">
    <!-- Header -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="header-title">Order Detail</text>
    </view>
    
    <view class="order-content" v-if="order">
      <!-- Status Card -->
      <view class="status-card" :class="order.status.toLowerCase()">
        <uni-icons :type="statusIcon" size="32" color="#fff" />
        <view class="status-info">
          <text class="status-text">{{ getStatusText(order.status) }}</text>
          <text class="status-desc">{{ statusDesc }}</text>
        </view>
      </view>
      
      <!-- Order Info -->
      <view class="section">
        <view class="section-row">
          <text class="row-label">Order No.</text>
          <text class="row-value">{{ order.order_no }}</text>
        </view>
        <view class="section-row">
          <text class="row-label">Order Time</text>
          <text class="row-value">{{ formatDate(order.created_at) }}</text>
        </view>
      </view>
      
      <!-- Delivery Info -->
      <view class="section">
        <text class="section-title">Delivery Information</text>
        
        <view class="address-info">
          <text class="address-name">{{ order.address_snapshot.recipient_name }}</text>
          <text v-if="order.address_snapshot.recipient_phone_optional" class="address-phone">
            {{ order.address_snapshot.recipient_phone_optional }}
          </text>
          <text class="address-detail">
            {{ order.address_snapshot.address_line1 }}
            <text v-if="order.address_snapshot.address_line2_optional">
              , {{ order.address_snapshot.address_line2_optional }}
            </text>
          </text>
          <text class="address-location">
            {{ order.address_snapshot.city }}, {{ order.address_snapshot.state }} 
            {{ order.address_snapshot.postcode }}
          </text>
        </view>
        
        <view class="delivery-pref" v-if="order.delivery_date">
          <view class="pref-item">
            <uni-icons type="calendar" size="16" color="#666" />
            <text>{{ order.delivery_date }}</text>
          </view>
          <view class="pref-item" v-if="order.delivery_time_slot">
            <uni-icons type="clock" size="16" color="#666" />
            <text>{{ order.delivery_time_slot }}</text>
          </view>
          <view class="pref-item" v-if="order.whatsapp_number_optional">
            <uni-icons type="phone" size="16" color="#666" />
            <text>{{ order.whatsapp_number_optional }}</text>
          </view>
        </view>
        
        <view class="remark" v-if="order.remark_optional">
          <text class="remark-label">Remark:</text>
          <text class="remark-text">{{ order.remark_optional }}</text>
        </view>
      </view>
      
      <!-- Order Items -->
      <view class="section">
        <text class="section-title">Order Items ({{ order.items.length }})</text>
        
        <view class="order-items">
          <view class="order-item" v-for="item in order.items" :key="item.order_item_id">
            <view class="item-info">
              <text class="item-name">{{ item.name_snapshot }}</text>
              <text class="item-spec">{{ item.spec_snapshot }}</text>
            </view>
            <view class="item-right">
              <text class="item-price">RM {{ formatPrice(item.price_snapshot) }}</text>
              <text class="item-qty">x {{ item.qty }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Payment Summary -->
      <view class="section">
        <text class="section-title">Payment Summary</text>
        
        <view class="summary-row">
          <text class="summary-label">Subtotal</text>
          <text class="summary-value">RM {{ formatPrice(order.subtotal) }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">Shipping</text>
          <text class="summary-value" :class="{ free: order.shipping_fee === 0 }">
            {{ order.shipping_fee === 0 ? 'FREE' : 'RM ' + formatPrice(order.shipping_fee) }}
          </text>
        </view>
        <view class="summary-divider" />
        <view class="summary-row total">
          <text class="summary-label">Total</text>
          <text class="summary-value">RM {{ formatPrice(order.amount) }}</text>
        </view>
      </view>
      
      <!-- Demo Notice -->
      <view class="demo-notice">
        <uni-icons type="info" size="18" color="#1565c0" />
        <text>This is a demo order. Payment functionality will be available in the next phase.</text>
      </view>
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <uni-load-more status="loading" />
    </view>
    
    <!-- Bottom Actions -->
    <view class="bottom-bar" v-if="order">
      <view class="action-btn secondary" @click="goOrders">
        <text>View All Orders</text>
      </view>
      <view class="action-btn primary" @click="goShopping">
        <text>Continue Shopping</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderDetail, getStatusText } from '@/services/order_service'

export default {
  data() {
    return {
      order: null,
      loading: true
    }
  },
  computed: {
    statusIcon() {
      const icons = {
        PENDING_PAYMENT: 'wallet',
        PAID: 'checkmarkempty',
        CANCELLED: 'closeempty',
        COMPLETED: 'flag'
      }
      return icons[this.order?.status] || 'info'
    },
    statusDesc() {
      const descs = {
        PENDING_PAYMENT: 'Waiting for payment (Demo)',
        PAID: 'Payment received',
        CANCELLED: 'Order cancelled',
        COMPLETED: 'Order completed'
      }
      return descs[this.order?.status] || ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.loadOrder(options.id)
    }
  },
  methods: {
    async loadOrder(order_id) {
      this.loading = true
      try {
        this.order = await getOrderDetail(order_id)
        if (!this.order) {
          uni.showToast({
            title: 'Order not found',
            icon: 'none'
          })
          setTimeout(() => uni.navigateBack(), 1500)
        }
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      return getStatusText(status)
    },
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    goBack() {
      uni.navigateBack()
    },
    goOrders() {
      uni.redirectTo({
        url: '/pages/order/order-list'
      })
    },
    goShopping() {
      uni.switchTab({
        url: '/pages/catalog/catalog'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
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

.order-content {
  padding: 24rpx;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 32rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  
  &.pending_payment {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  }
  
  &.paid {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
  
  &.cancelled {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  }
  
  &.completed {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  display: block;
}

.status-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4rpx;
  display: block;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.section-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.row-label {
  font-size: 26rpx;
  color: #666;
}

.row-value {
  font-size: 26rpx;
  color: #333;
}

.address-info {
  background: #f9f9f9;
  padding: 20rpx;
  border-radius: 8rpx;
}

.address-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
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

.delivery-pref {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.pref-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    font-size: 24rpx;
    color: #666;
  }
}

.remark {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #fffde7;
  border-radius: 8rpx;
}

.remark-label {
  font-size: 24rpx;
  color: #666;
}

.remark-text {
  font-size: 24rpx;
  color: #333;
  margin-left: 8rpx;
}

.order-items {
  margin-top: 8rpx;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 26rpx;
  color: #333;
  display: block;
}

.item-spec {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.item-right {
  text-align: right;
}

.item-price {
  font-size: 26rpx;
  color: #e53935;
  display: block;
}

.item-qty {
  font-size: 22rpx;
  color: #666;
  margin-top: 4rpx;
  display: block;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.summary-label {
  font-size: 26rpx;
  color: #666;
}

.summary-value {
  font-size: 26rpx;
  color: #333;
  
  &.free {
    color: #4caf50;
  }
}

.summary-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 12rpx 0;
}

.summary-row.total {
  .summary-label {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }
  
  .summary-value {
    font-size: 34rpx;
    font-weight: 600;
    color: #e53935;
  }
}

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx;
  background: #e3f2fd;
  border-radius: 8rpx;
  
  text {
    flex: 1;
    font-size: 24rpx;
    color: #1565c0;
    line-height: 1.5;
  }
}

.loading-state {
  padding: 80rpx 0;
  display: flex;
  justify-content: center;
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
  gap: 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 28rpx;
    font-weight: 600;
  }
  
  &.primary {
    background: #007aff;
    
    text {
      color: #fff;
    }
  }
  
  &.secondary {
    background: #f5f5f5;
    
    text {
      color: #333;
    }
  }
  
  &:active {
    opacity: 0.9;
  }
}
</style>
