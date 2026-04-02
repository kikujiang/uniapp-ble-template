import { normalizeHexString } from '@/src/shared/utils/hex.js'

const trimToFrame = (rawHex = '') => {
  const normalized = normalizeHexString(rawHex).toLowerCase()
  const idx = normalized.indexOf('bb')
  const trimmed = idx >= 0 ? normalized.substring(0, idx + 2) : normalized
  return trimmed.toUpperCase()
}

const parseRecordDetail = (frameHex = '') => {
  if (frameHex.length < 30) {
    return { valid: false, reason: 'frame_too_short' }
  }

  if (frameHex.toLowerCase().includes('ffffffffffffffffffffffbb')) {
    return { valid: false, reason: 'invalid_payload' }
  }

  const index = parseInt(frameHex.substring(6, 8), 16)
  const year = parseInt(frameHex.substring(8, 12), 16)
  const month = parseInt(frameHex.substring(12, 14), 16)
  const day = parseInt(frameHex.substring(14, 16), 16)
  const hour = parseInt(frameHex.substring(16, 18), 16)
  const minute = parseInt(frameHex.substring(18, 20), 16)
  const second = parseInt(frameHex.substring(20, 22), 16)
  const temperature = parseInt(frameHex.substring(22, 26), 16)
  const voltageRaw = parseInt(frameHex.substring(26, 30), 16)

  const timestampMs = new Date(year, month - 1, day, hour, minute, second).getTime()
  const voltage = parseFloat((voltageRaw / 10).toFixed(1))

  return {
    valid: true,
    index,
    dateParts: { year, month, day, hour, minute, second },
    timestampMs,
    timestampSec: Number((timestampMs / 1000).toFixed(0)),
    temperature,
    voltageRaw,
    voltage
  }
}

export const parseResponse = (rawHex = '') => {
  const frameHex = trimToFrame(rawHex)
  if (!frameHex || frameHex.length < 6) {
    return {
      module: 'bushuqi',
      valid: false,
      reason: 'invalid_frame',
      rawHex: normalizeHexString(rawHex),
      frameHex
    }
  }

  const functionCode = frameHex.substring(2, 4)
  const commandCode = frameHex.substring(4, 6)
  const resultCodeHex = frameHex.length >= 8 ? frameHex.substring(6, 8) : ''

  const base = {
    module: 'bushuqi',
    valid: true,
    rawHex: normalizeHexString(rawHex),
    frameHex,
    functionCode,
    commandCode,
    resultCodeHex,
    ack: resultCodeHex === '01',
    type: 'unknown',
    payload: {},
    unknownFields: {}
  }

  if (functionCode === '01' && commandCode === '01' && frameHex.length >= 18) {
    const year = parseInt(frameHex.substring(6, 10), 16)
    const month = parseInt(frameHex.substring(10, 12), 16)
    const day = parseInt(frameHex.substring(12, 14), 16)
    const hour = parseInt(frameHex.substring(14, 16), 16)
    const minute = parseInt(frameHex.substring(16, 18), 16)
    const timestampMs = new Date(year, month - 1, day, hour, minute).getTime()
    return {
      ...base,
      type: 'time.read',
      payload: {
        year,
        month,
        day,
        hour,
        minute,
        timestampMs
      }
    }
  }

  if (functionCode === '01' && commandCode === '02') {
    return {
      ...base,
      type: 'time.calibrate.ack',
      payload: {
        success: resultCodeHex === '01'
      }
    }
  }

  if (functionCode === '02' && commandCode === '01') {
    return {
      ...base,
      type: 'record.new_hint',
      payload: {
        // 页面逻辑里用于触发下一条查询命令；具体含义待业务确认
        sequenceHex: resultCodeHex
      }
    }
  }

  if (functionCode === '02' && commandCode === '02') {
    const totalRecordCount = frameHex.length >= 14 ? parseInt(frameHex.substring(6, 14), 16) : null
    return {
      ...base,
      type: 'record.summary',
      payload: {
        totalRecordCount
      }
    }
  }

  if (functionCode === '02' && commandCode === '03') {
    return {
      ...base,
      type: 'record.detail',
      payload: parseRecordDetail(frameHex)
    }
  }

  if (functionCode === '02' && commandCode === '04') {
    return {
      ...base,
      type: 'record.clear.ack',
      payload: {
        success: resultCodeHex === '01'
      }
    }
  }

  if (functionCode === '03' && commandCode === '01') {
    return {
      ...base,
      type: 'device.state.read',
      payload: {
        enabled: resultCodeHex === '01',
        stateCodeHex: resultCodeHex
      }
    }
  }

  if (functionCode === '03' && commandCode === '02') {
    return {
      ...base,
      type: 'device.state.write.ack',
      payload: {
        success: resultCodeHex === '01'
      }
    }
  }

  return {
    ...base,
    unknownFields: {
      bodyHex: frameHex.substring(6, frameHex.length - 2)
    }
  }
}

export default {
  parseResponse
}
