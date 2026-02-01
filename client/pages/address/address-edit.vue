<template>
  <view class="address-edit-page">
    <!-- Header -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="header-title">{{ isEdit ? 'Edit Address' : 'Add Address' }}</text>
    </view>
    
    <view class="form-content">
      <!-- Contact Info -->
      <view class="form-section">
        <text class="section-title">Contact Information</text>
        
        <view class="form-item">
          <text class="form-label">Recipient Name *</text>
          <input 
            class="form-input" 
            v-model="form.recipient_name"
            placeholder="Full name"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">Phone Number (optional)</text>
          <input 
            class="form-input" 
            type="number"
            v-model="form.recipient_phone_optional"
            placeholder="e.g. 0123456789"
          />
        </view>
      </view>
      
      <!-- Address Info -->
      <view class="form-section">
        <text class="section-title">Address</text>
        
        <view class="form-item">
          <text class="form-label">Address Line 1 *</text>
          <input 
            class="form-input" 
            v-model="form.address_line1"
            placeholder="Street address, building name"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">Address Line 2 (optional)</text>
          <input 
            class="form-input" 
            v-model="form.address_line2_optional"
            placeholder="Unit, floor, etc."
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">City *</text>
          <input 
            class="form-input" 
            v-model="form.city"
            placeholder="City"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">State *</text>
          <picker mode="selector" :range="states" @change="onStateChange">
            <view class="picker-value" :class="{ placeholder: !form.state }">
              <text>{{ form.state || 'Select state' }}</text>
              <uni-icons type="right" size="16" color="#999" />
            </view>
          </picker>
          <view v-if="form.state && !isAllowedState" class="state-warning">
            <uni-icons type="info" size="14" color="#ff9800" />
            <text>Delivery only available in Kuala Lumpur & Selangor</text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">Postcode *</text>
          <input 
            class="form-input" 
            type="number"
            v-model="form.postcode"
            placeholder="e.g. 50000"
            maxlength="5"
          />
        </view>
      </view>
      
      <!-- Default Setting -->
      <view class="form-section">
        <view class="switch-item">
          <text class="switch-label">Set as default address</text>
          <switch :checked="form.is_default" @change="form.is_default = $event.detail.value" />
        </view>
      </view>
    </view>
    
    <!-- Save Button -->
    <view class="save-btn" @click="handleSave">
      <text>Save Address</text>
    </view>
  </view>
</template>

<script>
import { createOrUpdateAddress } from '@/services/address_service'
import { ALLOWED_STATES } from '@/services/pricing_service'

// 马来西亚州列表
const MALAYSIA_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan',
  'Melaka', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak',
  'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
]

export default {
  data() {
    return {
      isEdit: false,
      states: MALAYSIA_STATES,
      form: {
        address_id: '',
        recipient_name: '',
        recipient_phone_optional: '',
        address_line1: '',
        address_line2_optional: '',
        city: '',
        state: '',
        postcode: '',
        is_default: false
      }
    }
  },
  computed: {
    isAllowedState() {
      return ALLOWED_STATES.includes(this.form.state)
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.loadAddress(options.id)
    }
  },
  methods: {
    loadAddress(address_id) {
      const address = this.$store.getters['address/getAddressById'](address_id)
      if (address) {
        this.form = { ...address }
      }
    },
    goBack() {
      uni.navigateBack()
    },
    onStateChange(e) {
      this.form.state = this.states[e.detail.value]
    },
    validate() {
      if (!this.form.recipient_name.trim()) {
        uni.showToast({ title: 'Please enter name', icon: 'none' })
        return false
      }
      if (!this.form.address_line1.trim()) {
        uni.showToast({ title: 'Please enter address', icon: 'none' })
        return false
      }
      if (!this.form.city.trim()) {
        uni.showToast({ title: 'Please enter city', icon: 'none' })
        return false
      }
      if (!this.form.state) {
        uni.showToast({ title: 'Please select state', icon: 'none' })
        return false
      }
      if (!this.form.postcode.trim()) {
        uni.showToast({ title: 'Please enter postcode', icon: 'none' })
        return false
      }
      return true
    },
    async handleSave() {
      if (!this.validate()) return
      
      try {
        await createOrUpdateAddress(this.form)
        uni.showToast({
          title: 'Saved',
          icon: 'success'
        })
        setTimeout(() => uni.navigateBack(), 1000)
      } catch (e) {
        console.error('Failed to save address:', e)
        uni.showToast({
          title: 'Failed to save',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.address-edit-page {
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

.form-content {
  padding: 24rpx;
}

.form-section {
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
  margin-bottom: 20rpx;
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

.form-input {
  width: 100%;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  font-size: 28rpx;
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
  
  &.placeholder text {
    color: #999;
  }
}

.state-warning {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
  
  text {
    font-size: 22rpx;
    color: #ff9800;
  }
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-label {
  font-size: 28rpx;
  color: #333;
}

.save-btn {
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
