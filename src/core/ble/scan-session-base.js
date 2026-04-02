import { openAdapter, getAdapterState, onAdapterStateChange } from './adapter.js'
import bleScanner from './scanner.js'
import { arrayBufferToHexString } from '@/src/shared/utils/hex.js'

export class ScanSessionBase {
  constructor({ moduleName = 'unknown', parseBroadcast, onFound, shouldEmit, mapPayload } = {}) {
    this.moduleName = moduleName
    this.parseBroadcast = parseBroadcast
    this.onFound = onFound || null
    this.shouldEmit = shouldEmit || null
    this.mapPayload = mapPayload || null
    this.stopFoundListener = null
    this.stopAdapterListener = null
  }

  setFoundHandler(handler) {
    this.onFound = handler || null
  }

  async ensureAdapterReady() {
    try {
      await openAdapter()
    } catch (error) {
      if (!(error && error.errMsg && error.errMsg.includes('already opened'))) {
        throw error
      }
    }

    return getAdapterState()
  }

  async getAdapterState() {
    return getAdapterState()
  }

  async startScan(options = {}) {
    this.stopFoundListener && this.stopFoundListener()

    this.stopFoundListener = bleScanner.onDeviceFound((payload) => {
      const platform = (uni.getSystemInfoSync && uni.getSystemInfoSync().platform) || ''
      const devices = payload.devices || []

      for (let i = 0; i < devices.length; i++) {
        const device = devices[i]
        const rawHex = arrayBufferToHexString(device.advertisData || null)

        let parsedBroadcast = null
        try {
          parsedBroadcast = this.parseBroadcast ? this.parseBroadcast(rawHex) : null
        } catch (error) {
          continue
        }

        const candidatePayload = {
          module: this.moduleName,
          device,
          deviceId: device.deviceId,
          platform,
          rawHex,
          parsedBroadcast,
          payload
        }

        if (!parsedBroadcast || !parsedBroadcast.valid) continue
        if (this.shouldEmit && !this.shouldEmit(candidatePayload)) continue

        const finalPayload = this.mapPayload ? this.mapPayload(candidatePayload) : candidatePayload
        this.onFound && this.onFound(finalPayload)
      }
    })

    return bleScanner.start(options)
  }

  async stopScan() {
    this.stopFoundListener && this.stopFoundListener()
    this.stopFoundListener = null
    return bleScanner.stop()
  }

  startAdapterStateListener(handler) {
    this.stopAdapterStateListener()
    this.stopAdapterListener = onAdapterStateChange(handler)
    return this.stopAdapterListener
  }

  stopAdapterStateListener() {
    if (this.stopAdapterListener) {
      this.stopAdapterListener()
      this.stopAdapterListener = null
    }
  }

  getState() {
    return bleScanner.getState()
  }

  clearDiscoveredDevices() {
    bleScanner.clearDiscoveredDevices()
  }

  destroy() {
    this.stopFoundListener && this.stopFoundListener()
    this.stopFoundListener = null
    this.stopAdapterStateListener()
  }
}

export const createScanSessionBase = (options = {}) => {
  return new ScanSessionBase(options)
}

export default {
  ScanSessionBase,
  createScanSessionBase
}
