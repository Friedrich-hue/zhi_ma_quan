<template>
  <view class="order-list-page">
    <!-- Header -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="header-title">My Orders</text>
    </view>
    
    <!-- Order List -->
    <view class="order-list" v-if="orders.length > 0">
      <view 
        class="order-card" 
        v-for="order in orders" 
        :key="order.order_id"
        @click="goDetail(order.order_id)"
      >
        <view class="order-header">
          <text class="order-no">{{ order.order_no }}</text>
          <text class="order-status" :class="order.status.toLowerCase()">
            {{ getStatusText(order.status) }}
          </text>
        </view>
        
        <view class="order-items-preview">
          <view 
            class="item-preview" 
            v-for="(item, index) in order.items.slice(0, 3)" 
            :key="index"
          >
            <text class="item-name">{{ item.name_snapshot }}</text>
            <text class="item-qty">x{{ item.qty }}</text>
          </view>
          <text v-if="order.items.length > 3" class="more-items">
            +{{ order.items.length - 3 }} more
          </text>
        </view>
        
        <view class="order-footer">
          <text class="order-date">{{ formatDate(order.created_at) }}</text>
          <text class="order-total">Total: RM {{ formatPrice(order.amount) }}</text>
        </view>
      </view>
    </view>
    
    <!-- Empty State -->
    <view v-else class="empty-state">
      <uni-icons type="paperplane" size="64" color="#ccc" />
      <text class="empty-title">No orders yet</text>
      <text class="empty-desc">Start shopping to create your first order</text>
      <view class="shop-btn" @click="goShopping">
        <text>Start Shopping</text>
      </view>
    </view>
  </view>
</template>

<script>
import { listOrders, getStatusText } from '@/services/order_service'

export default {
  data() {
    return {
      orders: []
    }
  },
  onShow() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.orders = await listOrders()
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
    goDetail(order_id) {
      uni.navigateTo({
        url: `/pages/order/order-detail?id=${order_id}`
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
.order-list-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.order-list {
  padding: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  
  &.pending_payment {
    background: #fff3e0;
    color: #e65100;
  }
  
  &.paid {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.cancelled {
    background: #fafafa;
    color: #9e9e9e;
  }
  
  &.completed {
    background: #e3f2fd;
    color: #1565c0;
  }
}

.order-items-preview {
  padding: 16rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-preview {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.item-name {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  font-size: 26rpx;
  color: #666;
  margin-left: 16rpx;
}

.more-items {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.order-date {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  font-size: 28rpx;
  font-weight: 600;
  color: #e53935;
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
</style>
