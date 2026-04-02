const BLE_UUIDS = {
  common: {
    serviceId: '0000FFF0-0000-1000-8000-00805F9B34FB',
    characteristicWriteId: '0000FFF3-0000-1000-8000-00805F9B34FB',
    characteristicReadId: '0000FFF4-0000-1000-8000-00805F9B34FB',
    characteristicNotifyId: '0000FFF4-0000-1000-8000-00805F9B34FB'
  },
  bushuqi: {
    serviceId: '0000FFF0-0000-1000-8000-00805F9B34FB',
    characteristicWriteId: '0000FFF3-0000-1000-8000-00805F9B34FB',
    characteristicReadId: '0000FFF4-0000-1000-8000-00805F9B34FB',
    characteristicNotifyId: '0000FFF4-0000-1000-8000-00805F9B34FB'
  },
  cockroach: {
    serviceId: '0000FFF0-0000-1000-8000-00805F9B34FB',
    characteristicWriteId: '0000FFF3-0000-1000-8000-00805F9B34FB',
    characteristicReadId: '0000FFF4-0000-1000-8000-00805F9B34FB',
    characteristicNotifyId: '0000FFF4-0000-1000-8000-00805F9B34FB'
  }
}

export const getBleUuidsByModule = (moduleName = 'common') => {
  return BLE_UUIDS[moduleName] || BLE_UUIDS.common
}

export default BLE_UUIDS
