import { DeviceSessionBase } from '@/src/core/ble/device-session-base.js'
import { parseResponse } from '@/src/modules/cockroach/protocol/response-parser.js'
import { getBleUuidsByModule } from '@/src/shared/constants/ble-uuids.js'

export class CockroachDeviceSession extends DeviceSessionBase {
  constructor({ deviceId, uuids } = {}) {
    super({
      moduleName: 'cockroach',
      deviceId,
      uuids: uuids || getBleUuidsByModule('cockroach'),
      parseResponse,
      mapResponsePayload: ({ parsed, rawHex, event }) => ({
        parsed,
        rawHex,
        event
      })
    })
  }
}

export const createCockroachDeviceSession = (options = {}) => {
  return new CockroachDeviceSession(options)
}

export default {
  CockroachDeviceSession,
  createCockroachDeviceSession
}
