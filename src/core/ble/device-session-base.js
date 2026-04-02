import bleConnector from './connector.js'
import bleGatt from './gatt.js'
import { arrayBufferToHexString, hexStringToArrayBuffer, normalizeHexString } from '@/src/shared/utils/hex.js'

export class DeviceSessionBase {
  constructor({ moduleName = 'unknown', deviceId, uuids, parseResponse, mapResponsePayload } = {}) {
    this.moduleName = moduleName
    this.deviceId = deviceId || ''
    this.uuids = uuids || {}
    this.parseResponse = parseResponse || null
    this.mapResponsePayload = mapResponsePayload || null
    this.offConnectionListener = null
    this.offValueListener = null
  }

  setDeviceId(deviceId) {
    this.deviceId = deviceId || ''
  }

  setUuids(uuids = {}) {
    this.uuids = {
      ...this.uuids,
      ...uuids
    }
  }

  connect(options = {}) {
    return bleConnector.connect(this.deviceId, options)
  }

  disconnect() {
    return bleConnector.disconnect(this.deviceId)
  }

  reconnect(options = {}) {
    return this.connect(options)
  }

  isConnected() {
    const services = this.uuids && this.uuids.serviceId ? [this.uuids.serviceId] : []
    return bleConnector.isDeviceConnected(this.deviceId, services)
  }

  getServices() {
    return bleGatt.getServices(this.deviceId)
  }

  getCharacteristics(serviceId) {
    return bleGatt.getCharacteristics(this.deviceId, serviceId || this.uuids.serviceId)
  }

  enableNotify(characteristicId) {
    return bleGatt.notify({
      deviceId: this.deviceId,
      serviceId: this.uuids.serviceId,
      characteristicId: characteristicId || this.uuids.characteristicNotifyId,
      state: true
    })
  }

  disableNotify(characteristicId) {
    return bleGatt.notify({
      deviceId: this.deviceId,
      serviceId: this.uuids.serviceId,
      characteristicId: characteristicId || this.uuids.characteristicNotifyId,
      state: false
    })
  }

  readCharacteristic(characteristicId) {
    return bleGatt.read({
      deviceId: this.deviceId,
      serviceId: this.uuids.serviceId,
      characteristicId: characteristicId || this.uuids.characteristicReadId
    })
  }

  sendHexCommand(commandHex, options = {}) {
    const normalizedHex = normalizeHexString(commandHex)
    return bleGatt.write({
      deviceId: this.deviceId,
      serviceId: this.uuids.serviceId,
      characteristicId: this.uuids.characteristicWriteId,
      value: hexStringToArrayBuffer(normalizedHex),
      writeType: options.writeType || 'write',
      timeout: options.timeout
    })
  }

  startConnectionListener(handler) {
    this.stopConnectionListener()
    this.offConnectionListener = bleConnector.onConnectionStateChange((state) => {
      if (state.deviceId !== this.deviceId) return
      handler && handler(state)
    })
    return this.offConnectionListener
  }

  stopConnectionListener() {
    if (this.offConnectionListener) {
      this.offConnectionListener()
      this.offConnectionListener = null
    }
  }

  startResponseListener(handler) {
    this.stopResponseListener()
    this.offValueListener = bleGatt.onValueChange((event) => {
      if (event.deviceId !== this.deviceId) return
      const rawHex = arrayBufferToHexString(event.value)
      const parsed = this.parseResponse ? this.parseResponse(rawHex) : null

      const basePayload = {
        module: this.moduleName,
        parsed,
        rawHex,
        event
      }

      const payload = this.mapResponsePayload ? this.mapResponsePayload(basePayload) : basePayload
      handler && handler(payload)
    })
    return this.offValueListener
  }

  stopResponseListener() {
    if (this.offValueListener) {
      this.offValueListener()
      this.offValueListener = null
    }
  }

  destroy() {
    this.stopConnectionListener()
    this.stopResponseListener()
  }
}

export const createDeviceSessionBase = (options = {}) => {
  return new DeviceSessionBase(options)
}

export default {
  DeviceSessionBase,
  createDeviceSessionBase
}
