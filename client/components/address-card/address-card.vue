<template>
  <view class="address-card" :class="{ selected: isSelected }" @click="handleClick">
    <view class="address-content">
      <view class="address-header">
        <text class="recipient-name">{{ address.recipient_name }}</text>
        <text v-if="address.recipient_phone_optional" class="recipient-phone">{{ address.recipient_phone_optional }}</text>
        <view v-if="address.is_default" class="default-badge">Default</view>
      </view>
      <text class="address-detail">
        {{ address.address_line1 }}
        <text v-if="address.address_line2_optional">, {{ address.address_line2_optional }}</text>
      </text>
      <text class="address-location">{{ address.city }}, {{ address.state }} {{ address.postcode }}</text>
    </view>
    
    <view v-if="showActions" class="address-actions">
      <view class="action-btn" @click.stop="handleEdit">
        <uni-icons type="compose" size="18" color="#666" />
        <text>Edit</text>
      </view>
      <view class="action-btn" @click.stop="handleSetDefault" v-if="!address.is_default">
        <uni-icons type="star" size="18" color="#666" />
        <text>Set Default</text>
      </view>
      <view class="action-btn delete" @click.stop="handleDelete">
        <uni-icons type="trash" size="18" color="#e53935" />
        <text>Delete</text>
      </view>
    </view>
    
    <view v-if="selectable && isSelected" class="check-icon">
      <uni-icons type="checkmarkempty" size="24" color="#007aff" />
    </view>
  </view>
</template>

<script>
import { setDefaultAddress, deleteAddress } from '@/services/address_service'

export default {
  name: 'AddressCard',
  props: {
    address: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      if (this.selectable) {
        this.$emit('select', this.address)
      }
    },
    handleEdit() {
      uni.navigateTo({
        url: `/pages/address/address-edit?id=${this.address.address_id}`
      })
    },
    handleSetDefault() {
      setDefaultAddress(this.address.address_id)
      this.$emit('refresh')
      uni.showToast({
        title: 'Set as default',
        icon: 'success'
      })
    },
    handleDelete() {
      uni.showModal({
        title: 'Delete Address',
        content: 'Are you sure to delete this address?',
        success: (res) => {
          if (res.confirm) {
            deleteAddress(this.address.address_id)
            this.$emit('refresh')
            uni.showToast({
              title: 'Deleted',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.address-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  
  &.selected {
    border: 2rpx solid #007aff;
  }
}

.address-content {
  padding-right: 40rpx;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.recipient-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.recipient-phone {
  font-size: 26rpx;
  color: #666;
}

.default-badge {
  padding: 4rpx 12rpx;
  background: #007aff;
  color: #fff;
  font-size: 20rpx;
  border-radius: 4rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.address-location {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.address-actions {
  display: flex;
  gap: 32rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    font-size: 24rpx;
    color: #666;
  }
  
  &.delete text {
    color: #e53935;
  }
}

.check-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}
</style>
