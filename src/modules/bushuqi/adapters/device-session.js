import { DeviceSessionBase } from '@/src/core/ble/device-session-base.js'
import { parseResponse } from '@/src/modules/bushuqi/protocol/response-parser.js'
import { getBleUuidsByModule } from '@/src/shared/constants/ble-uuids.js'

export class BushuqiDeviceSession extends DeviceSessionBase {
  constructor({ deviceId, uuids } = {}) {
    super({
      moduleName: 'bushuqi',
      deviceId,
      uuids: uuids || getBleUuidsByModule('bushuqi'),
      parseResponse,
      mapResponsePayload: ({ parsed, rawHex, event }) => ({
        parsed,
        rawHex,
        event
      })
    })
  }
}

export const createBushuqiDeviceSession = (options = {}) => {
  return new BushuqiDeviceSession(options)
}

export default {
  BushuqiDeviceSession,
  createBushuqiDeviceSession
}
