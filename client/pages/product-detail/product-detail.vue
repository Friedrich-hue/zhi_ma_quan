<template>
  <view class="product-detail-page">
    <view v-if="product">
      <!-- Product Image -->
      <swiper class="product-swiper" indicator-dots autoplay circular>
        <swiper-item v-for="(image, index) in product.images" :key="index">
          <image class="product-image" :src="image" mode="aspectFill" />
        </swiper-item>
      </swiper>
      
      <!-- Product Info -->
      <view class="product-info">
        <view class="price-section">
          <text class="sale-price">RM {{ formatPrice(product.sale_price) }}</text>
          <text v-if="hasDiscount" class="origin-price">RM {{ formatPrice(product.origin_price) }}</text>
          <view v-if="hasDiscount" class="discount-badge">
            -{{ discountPercent }}%
          </view>
        </view>
        
        <text class="product-name">{{ product.name }}</text>
        <text class="product-spec">{{ product.spec_text }}</text>
        
        <view class="divider" />
        
        <view class="desc-section">
          <text class="desc-title">Description</text>
          <text class="desc-content">{{ product.description }}</text>
        </view>
      </view>
      
      <!-- Delivery Notice -->
      <view class="notice-card">
        <uni-icons type="info" size="20" color="#007aff" />
        <view class="notice-content">
          <text class="notice-title">Delivery Info</text>
          <text class="notice-text">• Kuala Lumpur & Selangor only</text>
          <text class="notice-text">• Min. 3 items per order</text>
          <text class="notice-text">• Delivery on Wed & Sat</text>
        </view>
      </view>
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <uni-load-more status="loading" />
    </view>
    
    <!-- Bottom Bar -->
    <view class="bottom-bar" v-if="product">
      <!-- 购物车中已有数量提示 -->
      <view v-if="cartQty > 0" class="cart-hint">
        <uni-icons type="cart" size="16" color="#007aff" />
        <text>{{ cartQty }} in cart</text>
      </view>
      <view class="bottom-bar-main">
        <view class="qty-section">
          <view class="qty-btn" @click="decreaseQty">
            <text>−</text>
          </view>
          <text class="qty-value">{{ qty }}</text>
          <view class="qty-btn" @click="increaseQty">
            <text>+</text>
          </view>
        </view>
        <view class="add-cart-btn" @click="handleAddToCart">
          <text>Add to Cart - RM {{ formatPrice(product.sale_price * qty) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from '@/services/catalog_service'
import { addToCart, initCartBadge } from '@/services/cart_service'

export default {
  data() {
    return {
      product: null,
      loading: true,
      qty: 1
    }
  },
  computed: {
    hasDiscount() {
      return this.product && this.product.origin_price > this.product.sale_price
    },
    discountPercent() {
      if (!this.hasDiscount) return 0
      return Math.round((1 - this.product.sale_price / this.product.origin_price) * 100)
    },
    // 该商品在购物车中的数量
    cartQty() {
      if (!this.product) return 0
      const items = this.$store.getters['cart/cartItems']
      const item = items.find(i => i.product_id === this.product.product_id)
      return item ? item.qty : 0
    }
  },
  onLoad(options) {
    if (options.id) {
      this.loadProduct(options.id)
    }
  },
  onShow() {
    initCartBadge()
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    async loadProduct(product_id) {
      this.loading = true
      try {
        this.product = await getProductDetail(product_id)
        if (!this.product) {
          uni.showToast({
            title: 'Product not found',
            icon: 'none'
          })
          setTimeout(() => uni.navigateBack(), 1500)
        }
      } catch (e) {
        console.error('Failed to load product:', e)
      } finally {
        this.loading = false
      }
    },
    decreaseQty() {
      if (this.qty > 1) {
        this.qty--
      }
    },
    increaseQty() {
      this.qty++
    },
    handleAddToCart() {
      addToCart(this.product, this.qty)
      uni.showToast({
        title: `Added ${this.qty} to cart`,
        icon: 'success'
      })
      this.qty = 1
    }
  }
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
}

.product-swiper {
  width: 100%;
  height: 600rpx;
}

.product-image {
  width: 100%;
  height: 100%;
  background: #fff;
}

.product-info {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.sale-price {
  font-size: 48rpx;
  font-weight: 700;
  color: #e53935;
}

.origin-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.discount-badge {
  padding: 4rpx 12rpx;
  background: #ffebee;
  color: #e53935;
  font-size: 22rpx;
  font-weight: 500;
  border-radius: 4rpx;
}

.product-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: block;
}

.product-spec {
  font-size: 28rpx;
  color: #666;
  margin-top: 12rpx;
  display: block;
}

.divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 32rpx 0;
}

.desc-section {
  .desc-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .desc-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

.notice-card {
  background: #e3f2fd;
  margin: 0 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  display: flex;
  gap: 16rpx;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1565c0;
  display: block;
  margin-bottom: 8rpx;
}

.notice-text {
  font-size: 24rpx;
  color: #1976d2;
  display: block;
  line-height: 1.6;
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
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.cart-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding-bottom: 16rpx;
  margin-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  text {
    font-size: 24rpx;
    color: #007aff;
    font-weight: 500;
  }
}

.bottom-bar-main {
  display: flex;
  gap: 24rpx;
}

.qty-section {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}

.qty-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 36rpx;
    color: #333;
  }
  
  &:active {
    background: #e5e5e5;
  }
}

.qty-value {
  min-width: 60rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.add-cart-btn {
  flex: 1;
  height: 72rpx;
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
}
</style>
