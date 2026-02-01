<template>
  <view class="catalog-page">
    <!-- Header -->
    <view class="page-header">
      <text class="header-title">Mineral Water</text>
      <text class="header-subtitle">Fresh delivery to your door</text>
    </view>
    
    <!-- Promo Banner -->
    <view class="promo-banner">
      <view class="promo-content">
        <text class="promo-title">FREE DELIVERY</text>
        <text class="promo-desc">Order 5+ items and get free shipping!</text>
      </view>
    </view>
    
    <!-- Product Grid -->
    <view class="product-grid" v-if="products.length > 0">
      <product-card
        v-for="product in products"
        :key="product.product_id"
        :product="product"
      />
    </view>
    
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <uni-load-more status="loading" />
    </view>
    
    <!-- Empty State -->
    <view v-if="!loading && products.length === 0" class="empty-state">
      <uni-icons type="shop" size="64" color="#ccc" />
      <text>No products available</text>
    </view>
    
    <!-- Delivery Info -->
    <view class="delivery-info">
      <view class="info-item">
        <uni-icons type="location" size="20" color="#007aff" />
        <text>Kuala Lumpur & Selangor only</text>
      </view>
      <view class="info-item">
        <uni-icons type="calendar" size="20" color="#007aff" />
        <text>Delivery: Wed & Sat</text>
      </view>
      <view class="info-item">
        <uni-icons type="cart" size="20" color="#007aff" />
        <text>Min. order: 3 items</text>
      </view>
    </view>
  </view>
</template>

<script>
import { listProducts } from '@/services/catalog_service'
import { initCartBadge } from '@/services/cart_service'
import ProductCard from '@/components/product-card/product-card.vue'

export default {
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      loading: true
    }
  },
  onLoad() {
    this.loadProducts()
  },
  onShow() {
    // 每次显示页面时更新购物车角标
    initCartBadge()
  },
  methods: {
    async loadProducts() {
      this.loading = true
      try {
        this.products = await listProducts()
      } catch (e) {
        console.error('Failed to load products:', e)
        uni.showToast({
          title: 'Failed to load products',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.catalog-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
}

.page-header {
  background: linear-gradient(135deg, #007aff 0%, #00c6ff 100%);
  padding: 60rpx 32rpx 40rpx;
  color: #fff;
}

.header-title {
  font-size: 44rpx;
  font-weight: 700;
  display: block;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.promo-banner {
  margin: -20rpx 24rpx 24rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(238, 90, 36, 0.3);
}

.promo-content {
  text-align: center;
  color: #fff;
}

.promo-title {
  font-size: 32rpx;
  font-weight: 700;
  display: block;
}

.promo-desc {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 8rpx;
  display: block;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 24rpx;
}

.loading-state,
.empty-state {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.delivery-info {
  margin: 32rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
  
  text {
    font-size: 26rpx;
    color: #666;
  }
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
}
</style>
