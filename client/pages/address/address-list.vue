<template>
  <view class="address-list-page">
    <!-- Header -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="header-title">{{ isSelectMode ? 'Select Address' : 'My Addresses' }}</text>
    </view>
    
    <!-- Address List -->
    <view class="address-list" v-if="addresses.length > 0">
      <address-card
        v-for="address in addresses"
        :key="address.address_id"
        :address="address"
        :showActions="!isSelectMode"
        :selectable="isSelectMode"
        :isSelected="isSelectMode && selectedId === address.address_id"
        @select="handleSelect"
        @refresh="loadAddresses"
      />
    </view>
    
    <!-- Empty State -->
    <view v-else class="empty-state">
      <uni-icons type="location" size="64" color="#ccc" />
      <text class="empty-title">No addresses yet</text>
      <text class="empty-desc">Add your delivery address</text>
    </view>
    
    <!-- Add Button -->
    <view class="add-btn" @click="addAddress">
      <uni-icons type="plusempty" size="24" color="#fff" />
      <text>Add New Address</text>
    </view>
  </view>
</template>

<script>
import { listAddresses, getDefaultAddress } from '@/services/address_service'
import AddressCard from '@/components/address-card/address-card.vue'

export default {
  components: {
    AddressCard
  },
  data() {
    return {
      addresses: [],
      isSelectMode: false,
      selectedId: ''
    }
  },
  onLoad(options) {
    this.isSelectMode = options.mode === 'select'
    this.loadAddresses()
  },
  onShow() {
    this.loadAddresses()
  },
  methods: {
    async loadAddresses() {
      this.addresses = await listAddresses()
      
      // 如果是选择模式，默认选中默认地址
      if (this.isSelectMode && this.addresses.length > 0) {
        const defaultAddr = getDefaultAddress()
        this.selectedId = defaultAddr ? defaultAddr.address_id : this.addresses[0].address_id
      }
    },
    goBack() {
      uni.navigateBack()
    },
    addAddress() {
      uni.navigateTo({
        url: '/pages/address/address-edit'
      })
    },
    handleSelect(address) {
      if (this.isSelectMode) {
        // 保存选中的地址 ID 并返回
        uni.setStorageSync('zmq_selected_address_id', address.address_id)
        uni.navigateBack()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.address-list-page {
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

.address-list {
  padding: 24rpx;
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

.add-btn {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 32rpx);
  left: 32rpx;
  right: 32rpx;
  height: 88rpx;
  background: #007aff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  
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
