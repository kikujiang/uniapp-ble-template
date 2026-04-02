const createDeviceIdentity = (device = {}) => {
  return device.deviceId || device.name || device.localName || ''
}

const normalizeDevice = (device = {}) => {
  return {
    deviceId: device.deviceId || '',
    name: device.name || '',
    localName: device.localName || '',
    RSSI: device.RSSI,
    advertisData: device.advertisData,
    raw: device
  }
}

const normalizeDeviceFoundPayload = (payload = {}) => {
  const list = Array.isArray(payload.devices) ? payload.devices : []
  return list.map(normalizeDevice)
}

class BleScanner {
  constructor() {
    this.isScanning = false
    this.discoveredMap = new Map()
    this.foundHandler = null
    this.foundHandlerWrapped = null
  }

  start(options = {}) {
    const {
      allowDuplicatesKey = true,
      interval = 0,
      powerLevel = 'high',
      services,
      force = false
    } = options

    if (this.isScanning && !force) {
      return Promise.resolve({ skipped: true, reason: 'already_scanning' })
    }

    return new Promise((resolve, reject) => {
      uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey,
        interval,
        powerLevel,
        services,
        success: (res) => {
          this.isScanning = true
          resolve(res)
        },
        fail: (err) => {
          if (err && err.errMsg && err.errMsg.includes('already discovering')) {
            this.isScanning = true
            resolve({ skipped: true, reason: 'already_discovering', raw: err })
            return
          }
          reject(err)
        }
      })
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      uni.stopBluetoothDevicesDiscovery({
        success: (res) => {
          this.isScanning = false
          resolve(res)
        },
        fail: (err) => {
          this.isScanning = false
          reject(err)
        }
      })
    })
  }

  onDeviceFound(handler) {
    this.offDeviceFound()

    this.foundHandler = handler
    this.foundHandlerWrapped = (payload) => {
      const normalizedDevices = normalizeDeviceFoundPayload(payload)
      const dedupedNewDevices = []

      for (let i = 0; i < normalizedDevices.length; i++) {
        const device = normalizedDevices[i]
        const key = createDeviceIdentity(device)
        if (!key) continue

        if (!this.discoveredMap.has(key)) {
          dedupedNewDevices.push(device)
        }

        this.discoveredMap.set(key, device)
      }

      this.foundHandler &&
        this.foundHandler({
          devices: normalizedDevices,
          dedupedNewDevices,
          allDevices: this.getDiscoveredDevices(),
          raw: payload
        })
    }

    uni.onBluetoothDeviceFound(this.foundHandlerWrapped)

    return () => this.offDeviceFound()
  }

  offDeviceFound() {
    if (!uni.offBluetoothDeviceFound) return

    if (this.foundHandlerWrapped) {
      uni.offBluetoothDeviceFound(this.foundHandlerWrapped)
    } else {
      uni.offBluetoothDeviceFound()
    }

    this.foundHandler = null
    this.foundHandlerWrapped = null
  }

  getDiscoveredDevices() {
    return Array.from(this.discoveredMap.values())
  }

  clearDiscoveredDevices() {
    this.discoveredMap.clear()
  }

  getState() {
    return {
      isScanning: this.isScanning,
      discoveredSize: this.discoveredMap.size
    }
  }

  // Reserved for keep-alive strategy (Phase 2)
  ensureScanning() {
    if (this.isScanning) {
      return Promise.resolve({ skipped: true, reason: 'already_scanning' })
    }
    return this.start()
  }
}

const scanner = new BleScanner()

export { BleScanner }
export default scanner
