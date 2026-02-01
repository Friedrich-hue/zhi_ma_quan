<template>
  <view class="order-summary">
    <view class="summary-row">
      <text class="label">Subtotal ({{ totalQty }} items)</text>
      <text class="value">RM {{ formatPrice(subtotal) }}</text>
    </view>
    <view class="summary-row">
      <text class="label">Shipping</text>
      <text class="value" :class="{ free: shippingFee === 0 }">
        {{ shippingFee === 0 ? 'FREE' : 'RM ' + formatPrice(shippingFee) }}
      </text>
    </view>
    <view v-if="!canCheckout" class="min-order-notice">
      <uni-icons type="info" size="16" color="#ff9800" />
      <text>Minimum order: {{ minOrderQty }} items</text>
    </view>
    <view v-if="shippingFee > 0 && totalQty < freeShippingThreshold" class="free-shipping-notice">
      <uni-icons type="gift" size="16" color="#4caf50" />
      <text>Add {{ freeShippingThreshold - totalQty }} more for free shipping</text>
    </view>
    <view class="summary-divider" />
    <view class="summary-row total">
      <text class="label">Total</text>
      <text class="value">RM {{ formatPrice(total) }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OrderSummary',
  props: {
    totalQty: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    canCheckout: {
      type: Boolean,
      default: false
    },
    minOrderQty: {
      type: Number,
      default: 3
    },
    freeShippingThreshold: {
      type: Number,
      default: 5
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.order-summary {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    font-size: 28rpx;
    color: #666;
  }
  
  .value {
    font-size: 28rpx;
    color: #333;
    
    &.free {
      color: #4caf50;
      font-weight: 500;
    }
  }
  
  &.total {
    .label {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .value {
      font-size: 36rpx;
      font-weight: 600;
      color: #e53935;
    }
  }
}

.min-order-notice,
.free-shipping-notice {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 24rpx;
  }
}

.min-order-notice {
  background: #fff3e0;
  
  text {
    color: #e65100;
  }
}

.free-shipping-notice {
  background: #e8f5e9;
  
  text {
    color: #2e7d32;
  }
}

.summary-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 16rpx 0;
}
</style>
