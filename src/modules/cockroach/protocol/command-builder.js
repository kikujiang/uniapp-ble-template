import { normalizeHexString } from '@/src/shared/utils/hex.js'
import { FRAME, FUNCTION_CODE } from './constants.js'

const buildFrame = (body = '') => {
  return `${FRAME.head}${normalizeHexString(body)}${FRAME.tail}`
}

const toHex2 = (value) => Number(value || 0).toString(16).padStart(2, '0').toUpperCase()

const formatDateTimeHex = (date = new Date()) => {
  const year = date.getFullYear().toString(16).padStart(4, '0')
  const month = (date.getMonth() + 1).toString(16).padStart(2, '0')
  const day = date.getDate().toString(16).padStart(2, '0')
  const hour = date.getHours().toString(16).padStart(2, '0')
  const minute = date.getMinutes().toString(16).padStart(2, '0')
  const second = date.getSeconds().toString(16).padStart(2, '0')
  return `${year}${month}${day}${hour}${minute}${second}`.toUpperCase()
}

export const buildReadTimeCommand = () => buildFrame(`${FUNCTION_CODE.TIME}01`)

export const buildCalibrateTimeCommand = (date = new Date()) => {
  const dateHex = formatDateTimeHex(date)
  return buildFrame(`${FUNCTION_CODE.TIME}02${dateHex}`)
}

export const buildQueryRecordSummaryCommand = () => buildFrame(`${FUNCTION_CODE.RECORD}02`)

export const buildQueryRecordDetailCommand = (index = 0) => {
  return buildFrame(`${FUNCTION_CODE.RECORD}03${toHex2(index)}`)
}

export const buildClearRecordCommand = () => buildFrame(`${FUNCTION_CODE.RECORD}04`)

export const buildStartDischargeCommand = () => buildFrame(`${FUNCTION_CODE.DISCHARGE}0201`)

export const buildBootstrapCommands = () => {
  return [buildReadTimeCommand(), buildQueryRecordSummaryCommand()]
}

export default {
  buildFrame,
  formatDateTimeHex,
  buildReadTimeCommand,
  buildCalibrateTimeCommand,
  buildQueryRecordSummaryCommand,
  buildQueryRecordDetailCommand,
  buildClearRecordCommand,
  buildStartDischargeCommand,
  buildBootstrapCommands
}
