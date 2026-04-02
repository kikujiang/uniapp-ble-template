<template>
  <view class="bind-shell">
    <view v-if="showScanSection" class="bind-shell-list">
      <text class="bind-shell-list-title">{{ availableDeviceTitle }}</text>
      <view v-if="deviceList.length > 0">
        <view v-for="(item, index) in deviceList" :key="index">
          <view class="bind-shell-item" @click="handleSelect(item)">
            <view class="bind-shell-item-left">
              <image class="bind-shell-item-icon" src="@/static/index/blue_true.png"></image>
              <text class="bind-shell-item-name">{{ item.name }}</text>
            </view>
            <image
              v-if="item.checked"
              class="bind-shell-item-selected"
              src="@/static/index/blue_selected.png"
            ></image>
          </view>
        </view>
      </view>
      <text v-else class="bind-shell-empty">{{ emptyDeviceHint }}</text>
    </view>

    <view v-else class="bind-shell-address">
      <text class="bind-shell-address-title">蓝牙地址</text>
      <text class="bind-shell-address-value">{{ deviceMac }}</text>
    </view>

    <view v-if="showScanSection" class="bind-shell-notice">
      <text class="bind-shell-notice-text">{{ scanNotice }}</text>
      <text v-if="isScanning" class="bind-shell-scanning">扫描中...</text>
    </view>

    <view v-if="selectedDevice" class="bind-shell-selected">
      <text class="bind-shell-selected-title">当前选中</text>
      <text class="bind-shell-selected-content">{{ selectedDevice.name }}（{{ selectedDevice.mac }}）</text>
    </view>

    <button class="bind-shell-submit" :disabled="isSubmitting" @click="handleSubmit">
      {{ isSubmitting ? '提交中...' : submitButtonText }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'BindPageShell',
  props: {
    moduleDisplayName: {
      type: String,
      default: ''
    },
    availableDeviceTitle: {
      type: String,
      default: '可用设备'
    },
    scanNotice: {
      type: String,
      default: ''
    },
    emptyDeviceHint: {
      type: String,
      default: '暂无可绑定设备'
    },
    submitButtonText: {
      type: String,
      default: '添加设备'
    },
    deviceList: {
      type: Array,
      default: () => []
    },
    selectedDevice: {
      type: Object,
      default: null
    },
    isScanning: {
      type: Boolean,
      default: false
    },
    isSubmitting: {
      type: Boolean,
      default: false
    },
    showScanSection: {
      type: Boolean,
      default: true
    },
    deviceMac: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect(item) {
      this.$emit('select-device', item)
    },
    handleSubmit() {
      this.$emit('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.bind-shell {
  width: calc(100% - 60rpx);
  display: flex;
  flex-direction: column;
}

.bind-shell-list {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
}

.bind-shell-list-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #000;
  font-family: 'PingFang SC';
}

.bind-shell-item {
  margin-top: 30rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 10rpx;
}

.bind-shell-item-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.bind-shell-item-icon {
  width: 40rpx;
  height: 40rpx;
}

.bind-shell-item-name {
  margin-left: 30rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #000;
  font-family: 'PingFang SC';
}

.bind-shell-item-selected {
  width: 40rpx;
  height: 40rpx;
}

.bind-shell-empty {
  margin-top: 20rpx;
  font-size: 23rpx;
  font-weight: 500;
  color: #666666;
  font-family: 'PingFang SC';
}

.bind-shell-address {
  margin-top: 30rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 200rpx;
  border-width: 1rpx;
  border-color: #bbbbbb;
  border-style: solid;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.bind-shell-address-title {
  margin-left: 30rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #000;
  font-family: 'PingFang SC';
}

.bind-shell-address-value {
  margin-right: 30rpx;
  text-align: right;
  font-size: 26rpx;
  font-weight: 500;
  color: #000;
  font-family: 'PingFang SC';
}

.bind-shell-notice {
  margin-top: 30rpx;
}

.bind-shell-notice-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #575757;
  font-family: 'PingFang SC';
}

.bind-shell-scanning {
  margin-top: 10rpx;
  display: block;
  font-size: 24rpx;
  color: #28b2ff;
}

.bind-shell-selected {
  margin-top: 20rpx;
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
}

.bind-shell-selected-title {
  font-size: 24rpx;
  color: #666;
}

.bind-shell-selected-content {
  margin-top: 8rpx;
  display: block;
  font-size: 24rpx;
  color: #000;
}

.bind-shell-submit {
  margin-top: 60rpx;
  width: 100%;
  background-color: #28b2ff;
  font-size: 30rpx;
  line-height: 80rpx;
  font-family: 'PingFang SC';
  font-weight: 400;
  color: #ffffff;
  height: 80rpx;
  margin-bottom: 30rpx;
  border-radius: 200rpx;
}
</style>
