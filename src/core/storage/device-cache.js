const LAST_SEEN_SUFFIX = '_lastTime'
const BROADCAST_SUFFIX = '_broadcastStr'

const keyOf = (deviceId, suffix) => `${deviceId}${suffix}`

export const getLastSeen = (deviceId) => {
  return uni.getStorageSync(keyOf(deviceId, LAST_SEEN_SUFFIX))
}

export const setLastSeen = (deviceId, timestamp = Date.now()) => {
  return uni.setStorageSync(keyOf(deviceId, LAST_SEEN_SUFFIX), timestamp)
}

export const getBroadcast = (deviceId) => {
  return uni.getStorageSync(keyOf(deviceId, BROADCAST_SUFFIX))
}

export const setBroadcast = (deviceId, payloadHex = '') => {
  return uni.setStorageSync(keyOf(deviceId, BROADCAST_SUFFIX), payloadHex)
}

export const clearDeviceCache = (deviceId) => {
  uni.removeStorageSync(keyOf(deviceId, LAST_SEEN_SUFFIX))
  uni.removeStorageSync(keyOf(deviceId, BROADCAST_SUFFIX))
}

export const clearDeviceBroadcast = (deviceId) => {
  uni.removeStorageSync(keyOf(deviceId, BROADCAST_SUFFIX))
}

export default {
  getLastSeen,
  setLastSeen,
  getBroadcast,
  setBroadcast,
  clearDeviceCache,
  clearDeviceBroadcast
}
