import { ScanSessionBase } from '@/src/core/ble/scan-session-base.js'
import { parseBroadcast } from '@/src/modules/bushuqi/protocol/broadcast-parser.js'

export class BushuqiScanSession extends ScanSessionBase {
  constructor({ onFound } = {}) {
    super({
      moduleName: 'bushuqi',
      parseBroadcast,
      onFound
    })
  }
}

export const createBushuqiScanSession = (options = {}) => {
  return new BushuqiScanSession(options)
}

export default {
  BushuqiScanSession,
  createBushuqiScanSession
}
