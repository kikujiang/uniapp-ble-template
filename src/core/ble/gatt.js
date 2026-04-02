import TIMEOUTS from '@/src/shared/constants/timeouts.js'

const normalizeServices = (services = []) => {
  if (!Array.isArray(services)) return []
  return services.map((service) => ({
    uuid: service.uuid,
    isPrimary: !!service.isPrimary,
    raw: service
  }))
}

const normalizeCharacteristics = (characteristics = []) => {
  if (!Array.isArray(characteristics)) return []
  return characteristics.map((characteristic) => ({
    uuid: characteristic.uuid,
    properties: characteristic.properties || {},
    raw: characteristic
  }))
}

class BleGatt {
  constructor() {
    this.valueChangeHandler = null
    this.valueChangeHandlerWrapped = null
  }

  getServices(deviceId) {
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceServices({
        deviceId,
        success: (res) => resolve(normalizeServices(res.services || [])),
        fail: reject
      })
    })
  }

  getCharacteristics(deviceId, serviceId) {
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
        success: (res) => resolve(normalizeCharacteristics(res.characteristics || [])),
        fail: reject
      })
    })
  }

  notify({ deviceId, serviceId, characteristicId, state = true }) {
    return new Promise((resolve, reject) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state,
        success: resolve,
        fail: reject
      })
    })
  }

  read({ deviceId, serviceId, characteristicId }) {
    return new Promise((resolve, reject) => {
      uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        success: resolve,
        fail: reject
      })
    })
  }

  write({
    deviceId,
    serviceId,
    characteristicId,
    value,
    writeType = 'write',
    timeout = TIMEOUTS.ble.writeResponseTimeout
  }) {
    const writePromise = new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value,
        writeType,
        success: resolve,
        fail: reject
      })
    })

    if (!timeout || timeout <= 0) {
      return writePromise
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('write timeout'))
      }, timeout)
    })

    return Promise.race([writePromise, timeoutPromise])
  }

  onValueChange(handler) {
    this.offValueChange()

    this.valueChangeHandler = handler
    this.valueChangeHandlerWrapped = (res) => {
      this.valueChangeHandler &&
        this.valueChangeHandler({
          deviceId: res.deviceId,
          serviceId: res.serviceId,
          characteristicId: res.characteristicId,
          value: res.value,
          raw: res
        })
    }

    uni.onBLECharacteristicValueChange(this.valueChangeHandlerWrapped)

    return () => this.offValueChange()
  }

  offValueChange() {
    if (!uni.offBLECharacteristicValueChange) return

    if (this.valueChangeHandlerWrapped) {
      uni.offBLECharacteristicValueChange(this.valueChangeHandlerWrapped)
    } else {
      uni.offBLECharacteristicValueChange()
    }

    this.valueChangeHandler = null
    this.valueChangeHandlerWrapped = null
  }

  // Reserved for serial write queue (Phase 2)
  writeQueued(params) {
    return this.write(params)
  }
}

const gatt = new BleGatt()

export { BleGatt }
export default gatt
