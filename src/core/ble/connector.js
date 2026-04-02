const normalizeConnectedDevices = (devices = []) => {
  if (!Array.isArray(devices)) return []
  return devices.map((device) => ({
    deviceId: device.deviceId || '',
    name: device.name || device.localName || '',
    localName: device.localName || '',
    raw: device
  }))
}

class BleConnector {
  constructor() {
    this.stateHandler = null
    this.stateHandlerWrapped = null
  }

  connect(deviceId, options = {}) {
    const { mtu = 500 } = options

    return new Promise((resolve, reject) => {
      uni.createBLEConnection({
        deviceId,
        mtu,
        success: resolve,
        fail: reject
      })
    })
  }

  disconnect(deviceId) {
    return new Promise((resolve, reject) => {
      uni.closeBLEConnection({
        deviceId,
        success: resolve,
        fail: reject
      })
    })
  }

  getConnectedDevices(services = []) {
    return new Promise((resolve, reject) => {
      uni.getConnectedBluetoothDevices({
        services,
        success: (res) => {
          resolve(normalizeConnectedDevices(res.devices || []))
        },
        fail: reject
      })
    })
  }

  isDeviceConnected(deviceId, services = []) {
    return this.getConnectedDevices(services).then((list) => {
      return list.some((item) => item.deviceId === deviceId)
    })
  }

  onConnectionStateChange(handler) {
    this.offConnectionStateChange()

    this.stateHandler = handler
    this.stateHandlerWrapped = (res) => {
      this.stateHandler &&
        this.stateHandler({
          deviceId: res.deviceId,
          connected: !!res.connected,
          raw: res
        })
    }

    uni.onBLEConnectionStateChange(this.stateHandlerWrapped)

    return () => this.offConnectionStateChange()
  }

  offConnectionStateChange() {
    if (!uni.offBLEConnectionStateChange) return

    if (this.stateHandlerWrapped) {
      uni.offBLEConnectionStateChange(this.stateHandlerWrapped)
    } else {
      uni.offBLEConnectionStateChange()
    }

    this.stateHandler = null
    this.stateHandlerWrapped = null
  }

  // Reserved for reconnect policy (Phase 2)
  reconnect(deviceId, options = {}) {
    return this.connect(deviceId, options)
  }
}

const connector = new BleConnector()

export { BleConnector }
export default connector
