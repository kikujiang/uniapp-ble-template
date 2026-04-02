export const normalizeHexString = (hexString = '') => {
  return String(hexString).replace(/\s+/g, '').toUpperCase()
}

export const hexStringToByteArray = (hexString = '') => {
  const normalized = normalizeHexString(hexString)
  if (normalized.length % 2 !== 0) {
    throw new Error('Invalid hex string')
  }

  const byteArray = []
  for (let i = 0; i < normalized.length; i += 2) {
    byteArray.push(parseInt(normalized.substr(i, 2), 16))
  }
  return byteArray
}

export const hexStringToUint8Array = (hexString = '') => {
  return new Uint8Array(hexStringToByteArray(hexString))
}

export const uint8ArrayToHexString = (bytes) => {
  if (!bytes) return ''
  return Array.prototype.map.call(bytes, (bit) => ('00' + bit.toString(16)).slice(-2)).join('').toUpperCase()
}

export const arrayBufferToHexString = (buffer) => {
  if (!buffer) return ''
  return uint8ArrayToHexString(new Uint8Array(buffer))
}

export const hexStringToArrayBuffer = (hexString = '') => {
  const typedArray = hexStringToUint8Array(hexString)
  return typedArray.buffer
}

export const splitHexByBytes = (hexString = '', bytesPerChunk = 20) => {
  const normalized = normalizeHexString(hexString)
  const chunkLength = Math.max(1, bytesPerChunk) * 2
  const chunks = []
  for (let i = 0; i < normalized.length; i += chunkLength) {
    chunks.push(normalized.substring(i, i + chunkLength))
  }
  return chunks
}

export default {
  normalizeHexString,
  hexStringToByteArray,
  hexStringToUint8Array,
  uint8ArrayToHexString,
  arrayBufferToHexString,
  hexStringToArrayBuffer,
  splitHexByBytes
}
