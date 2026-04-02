import { normalizeHexString } from '@/src/shared/utils/hex.js'

const DEVICE_BROADCAST_LENGTH = 30

export const trimToDeviceBroadcast = (rawHex = '') => {
  const normalized = normalizeHexString(rawHex)
  if (!normalized) return ''
  return normalized.length > DEVICE_BROADCAST_LENGTH
    ? normalized.slice(-DEVICE_BROADCAST_LENGTH)
    : normalized
}

export const parseBroadcast = (rawHex = '', options = {}) => {
  const payload = trimToDeviceBroadcast(rawHex)
  const header = payload.substring(0, 2)
  const isCandidate = header === 'FF' || header === '00'

  const macRaw = payload.length >= 12 ? payload.substring(0, 12) : ''
  const macAddress = macRaw
    ? macRaw.replace(/(..)(..)(..)(..)(..)(..)/g, '$1:$2:$3:$4:$5:$6').toUpperCase()
    : ''

  let totalCount = null
  if (payload.length >= 28) {
    totalCount = parseInt(payload.substring(26, 28), 16)
    if (Number.isNaN(totalCount)) totalCount = null
  }

  let voltageRaw = null
  let voltage = null
  if (payload.length >= 30) {
    voltageRaw = parseInt(payload.slice(-2), 16)
    if (Number.isNaN(voltageRaw)) {
      voltageRaw = null
    } else if (voltageRaw > 0) {
      voltage = parseFloat((voltageRaw / 10).toFixed(1))
    }
  }

  const unknownFields = {
    middlePayload: payload.length >= 26 ? payload.substring(12, 26) : ''
  }

  return {
    module: 'cockroach',
    valid: !!payload && isCandidate,
    reason: !payload
      ? 'empty_payload'
      : !isCandidate
      ? 'unsupported_header'
      : 'ok',
    rawHex: normalizeHexString(rawHex),
    payloadHex: payload,
    header,
    macRaw,
    macAddress,
    totalCount,
    voltageRaw,
    voltage,
    isOnlineSignal: !!payload && isCandidate,
    unknownFields
  }
}

export default {
  DEVICE_BROADCAST_LENGTH,
  trimToDeviceBroadcast,
  parseBroadcast
}
