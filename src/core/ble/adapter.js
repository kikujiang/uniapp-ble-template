const normalizeAdapterState = (res = {}) => {
  return {
    available: res.available !== undefined ? res.available : !!(res.adapterState && res.adapterState.available),
    discovering:
      res.discovering !== undefined ? res.discovering : !!(res.adapterState && res.adapterState.discovering),
    raw: res
  }
}

const promisifyUniApi = (executor) => {
  return new Promise((resolve, reject) => {
    executor(resolve, reject)
  })
}

export const openAdapter = () => {
  return promisifyUniApi((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: resolve,
      fail: reject
    })
  })
}

export const closeAdapter = () => {
  return promisifyUniApi((resolve, reject) => {
    uni.closeBluetoothAdapter({
      success: resolve,
      fail: reject
    })
  })
}

export const getAdapterState = () => {
  return promisifyUniApi((resolve, reject) => {
    uni.getBluetoothAdapterState({
      success: (res) => resolve(normalizeAdapterState(res)),
      fail: reject
    })
  })
}

export const onAdapterStateChange = (handler) => {
  const wrappedHandler = (res) => {
    handler && handler(normalizeAdapterState(res))
  }

  uni.onBluetoothAdapterStateChange(wrappedHandler)

  return () => {
    if (uni.offBluetoothAdapterStateChange) {
      uni.offBluetoothAdapterStateChange(wrappedHandler)
    }
  }
}

export const offAdapterStateChange = (handler) => {
  if (!uni.offBluetoothAdapterStateChange) return
  if (handler) {
    uni.offBluetoothAdapterStateChange(handler)
    return
  }
  uni.offBluetoothAdapterStateChange()
}

export default {
  openAdapter,
  closeAdapter,
  getAdapterState,
  onAdapterStateChange,
  offAdapterStateChange
}
