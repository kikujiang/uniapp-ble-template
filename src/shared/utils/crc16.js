import modbus from '@/common/modbus.js'

export const calculateCRC16 = (data = []) => {
  return modbus.calculateCRC16(data)
}

export const hexStringToByteArray = (hexString = '') => {
  return modbus.hexStringToByteArray(hexString)
}

export const calculateCRC16FromHex = (hexString = '') => {
  const message = hexStringToByteArray(hexString)
  return calculateCRC16(message)
}

export const calculateCRC16HexFromHex = (hexString = '') => {
  return calculateCRC16FromHex(hexString).toString(16).padStart(4, '0').toUpperCase()
}

export default {
  calculateCRC16,
  hexStringToByteArray,
  calculateCRC16FromHex,
  calculateCRC16HexFromHex
}
