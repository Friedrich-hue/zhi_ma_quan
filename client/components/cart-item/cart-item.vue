<template>
  <view class="cart-item">
    <image class="item-image" :src="item.image" mode="aspectFill" />
    <view class="item-info">
      <text class="item-name">{{ item.name }}</text>
      <text class="item-spec">{{ item.spec_text }}</text>
      <view class="item-bottom">
        <text class="item-price">RM {{ formatPrice(item.sale_price) }}</text>
        <view class="qty-control">
          <view class="qty-btn" @click="decrease">
            <text>−</text>
          </view>
          <text class="qty-value">{{ item.qty }}</text>
          <view class="qty-btn" @click="increase">
            <text>+</text>
          </view>
        </view>
      </view>
    </view>
    <view class="delete-btn" @click="handleDelete">
      <uni-icons type="trash" size="20" color="#999" />
    </view>
  </view>
</template>

<script>
import { updateCartQty, removeFromCart } from '@/services/cart_service'

export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    increase() {
      updateCartQty(this.item.product_id, this.item.qty + 1)
      this.$emit('change')
    },
    decrease() {
      if (this.item.qty > 1) {
        updateCartQty(this.item.product_id, this.item.qty - 1)
        this.$emit('change')
      } else {
        this.handleDelete()
      }
    },
    handleDelete() {
      uni.showModal({
        title: 'Remove Item',
        content: 'Remove this item from cart?',
        success: (res) => {
          if (res.confirm) {
            removeFromCart(this.item.product_id)
            this.$emit('change')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-item {
  display: flex;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  padding-right: 40rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.item-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-price {
  font-size: 30rpx;
  font-weight: 600;
  color: #e53935;
}

.qty-control {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}

.qty-btn {
  width: 56rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 32rpx;
    color: #333;
  }
  
  &:active {
    background: #e5e5e5;
  }
}

.qty-value {
  min-width: 56rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.delete-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  padding: 8rpx;
}
</style>
