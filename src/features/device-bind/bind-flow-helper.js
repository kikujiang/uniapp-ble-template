const toUpper = (value = '') => String(value).toUpperCase()

export const validateBindBeforeSubmit = ({ deviceName, deviceLocation, currentType, currentDevice }) => {
  if (!deviceName || !String(deviceName).trim()) {
    return { ok: false, message: '设备名称为空' }
  }

  if (!deviceLocation || !String(deviceLocation).trim()) {
    return { ok: false, message: '设备位置为空' }
  }

  if (Number(currentType) === 2 && !currentDevice) {
    return { ok: false, message: '当前未选中设备' }
  }

  return { ok: true }
}

export const buildBindPayload = ({
  deviceMac,
  deviceName,
  deviceLocation,
  roomId,
  deviceAliasName,
  deviceMacIos,
  extraFields = {}
}) => {
  return {
    mac_address: deviceMac,
    device_name: deviceName,
    device_addr: deviceLocation,
    room_id: roomId,
    device_alias_name: deviceAliasName || deviceName,
    mac_address_ios: deviceMacIos,
    ...extraFields
  }
}

export const applySelectedCandidate = (deviceList = [], selectedDevice = null) => {
  if (!selectedDevice) return null

  for (let i = 0; i < deviceList.length; i++) {
    const current = deviceList[i]
    current.checked = current === selectedDevice
  }

  return selectedDevice
}

const isDuplicateInCandidateList = (candidateList = [], platform = '', deviceId = '', candidateMac = '') => {
  if (!Array.isArray(candidateList)) return false
  const normalizedPlatform = String(platform).toLowerCase()
  const normalizedDeviceId = toUpper(deviceId)
  const normalizedMac = toUpper(candidateMac)

  for (let i = 0; i < candidateList.length; i++) {
    const item = candidateList[i] || {}
    if (normalizedPlatform === 'ios') {
      if (toUpper(item.id) === normalizedDeviceId) return true
      continue
    }

    if (toUpper(item.mac) === normalizedDeviceId || toUpper(item.mac) === normalizedMac) {
      return true
    }
  }

  return false
}

const isAlreadyBound = ({
  boundDevices = [],
  platform = '',
  candidateMac = '',
  deviceId = '',
  checkIosByMacAddressIos = false
}) => {
  if (!Array.isArray(boundDevices)) return false

  const normalizedPlatform = String(platform).toLowerCase()
  const normalizedCandidateMac = toUpper(candidateMac)
  const normalizedDeviceId = toUpper(deviceId)

  for (let i = 0; i < boundDevices.length; i++) {
    const device = boundDevices[i] || {}
    const serverMac = toUpper(device.mac_address)
    const serverMacIos = toUpper(device.mac_address_ios)

    if (normalizedPlatform === 'ios') {
      if (serverMac === normalizedCandidateMac) return true
      if (checkIosByMacAddressIos && serverMacIos === normalizedDeviceId) return true
      continue
    }

    if (serverMac === normalizedDeviceId || serverMacIos === normalizedDeviceId) return true
  }

  return false
}

export const consumeScanPayloadForBind = ({
  payload,
  deviceNamePrefix = '',
  candidateList = [],
  boundDevices = [],
  transformIosMac,
  checkIosByMacAddressIos = false
}) => {
  if (!payload || !payload.device || !payload.parsedBroadcast || !payload.parsedBroadcast.valid) {
    return { accepted: false, reason: 'invalid_payload' }
  }

  const { device, deviceId, platform, parsedBroadcast } = payload
  const normalizedPlatform = String(platform || '').toLowerCase()
  const deviceName = device.name || ''

  if (!deviceName) {
    return { accepted: false, reason: 'empty_name' }
  }

  if (deviceNamePrefix && !deviceName.startsWith(deviceNamePrefix)) {
    return { accepted: false, reason: 'name_prefix_mismatch' }
  }

  let candidateMac = toUpper(parsedBroadcast.macAddress || '')
  if (normalizedPlatform === 'ios' && candidateMac.startsWith('00') && typeof transformIosMac === 'function') {
    candidateMac = toUpper(transformIosMac(candidateMac))
  }

  if (isDuplicateInCandidateList(candidateList, normalizedPlatform, deviceId, candidateMac)) {
    return { accepted: false, reason: 'duplicate_candidate' }
  }

  if (
    isAlreadyBound({
      boundDevices,
      platform: normalizedPlatform,
      candidateMac,
      deviceId,
      checkIosByMacAddressIos
    })
  ) {
    return { accepted: false, reason: 'already_bound' }
  }

  const candidate = {
    name: deviceName,
    checked: false,
    mac: normalizedPlatform === 'ios' ? candidateMac : toUpper(deviceId),
    id: normalizedPlatform === 'ios' ? deviceId : ''
  }

  return {
    accepted: true,
    reason: 'accepted',
    candidate
  }
}

export default {
  validateBindBeforeSubmit,
  buildBindPayload,
  applySelectedCandidate,
  consumeScanPayloadForBind
}
