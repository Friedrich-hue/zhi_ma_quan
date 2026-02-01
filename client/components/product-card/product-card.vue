<template>
  <view class="product-card" @click="goDetail">
    <image class="product-image" :src="product.images[0]" mode="aspectFill" />
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <text class="product-spec">{{ product.spec_text }}</text>
      <view class="price-row">
        <text class="sale-price">RM {{ formatPrice(product.sale_price) }}</text>
        <text v-if="hasDiscount" class="origin-price">RM {{ formatPrice(product.origin_price) }}</text>
      </view>
    </view>
    <!-- 购物车数量控制 -->
    <view v-if="cartQty > 0" class="qty-control" @click.stop>
      <view class="qty-btn" @click.stop="handleDecrease">
        <uni-icons type="minus" size="16" color="#007aff" />
      </view>
      <text class="qty-text">{{ cartQty }}</text>
      <view class="qty-btn qty-btn-add" @click.stop="handleIncrease">
        <uni-icons type="plus" size="16" color="#fff" />
      </view>
    </view>
    <view v-else class="add-btn" @click.stop="handleAddToCart">
      <uni-icons type="plus" size="20" color="#fff" />
    </view>
    <view v-if="hasDiscount" class="sale-badge">Sale</view>
  </view>
</template>

<script>
import { addToCart, updateCartQty } from '@/services/cart_service'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasDiscount() {
      return this.product.origin_price > this.product.sale_price
    },
    // 获取该商品在购物车中的数量（使用 this.$store 确保响应式）
    cartQty() {
      const items = this.$store.getters['cart/cartItems']
      const item = items.find(i => i.product_id === this.product.product_id)
      return item ? item.qty : 0
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    goDetail() {
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?id=${this.product.product_id}`
      })
    },
    handleAddToCart() {
      addToCart(this.product, 1)
      uni.showToast({
        title: 'Added to cart',
        icon: 'success'
      })
    },
    // 增加数量
    handleIncrease() {
      updateCartQty(this.product.product_id, this.cartQty + 1)
    },
    // 减少数量
    handleDecrease() {
      const newQty = this.cartQty - 1
      if (newQty <= 0) {
        updateCartQty(this.product.product_id, 0)
      } else {
        updateCartQty(this.product.product_id, newQty)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.product-image {
  width: 100%;
  height: 280rpx;
  background: #f5f5f5;
}

.product-info {
  padding: 16rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-spec {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.price-row {
  margin-top: auto;
  padding-top: 12rpx;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.sale-price {
  font-size: 30rpx;
  font-weight: 600;
  color: #e53935;
}

.origin-price {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
}

.add-btn {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.8;
  }
}

// 数量控制器样式
.qty-control {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 28rpx;
  padding: 4rpx;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e0e0e0;
  
  &:active {
    opacity: 0.8;
  }
}

.qty-btn-add {
  background: #007aff;
  border-color: #007aff;
}

.qty-text {
  min-width: 48rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.sale-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background: #e53935;
  color: #fff;
  font-size: 20rpx;
  border-radius: 4rpx;
}
</style>
