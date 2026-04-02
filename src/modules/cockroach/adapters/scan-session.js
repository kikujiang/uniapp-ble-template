import { ScanSessionBase } from '@/src/core/ble/scan-session-base.js'
import { parseBroadcast } from '@/src/modules/cockroach/protocol/broadcast-parser.js'

export class CockroachScanSession extends ScanSessionBase {
  constructor({ onFound } = {}) {
    super({
      moduleName: 'cockroach',
      parseBroadcast,
      onFound
    })
  }
}

export const createCockroachScanSession = (options = {}) => {
  return new CockroachScanSession(options)
}

export default {
  CockroachScanSession,
  createCockroachScanSession
}
