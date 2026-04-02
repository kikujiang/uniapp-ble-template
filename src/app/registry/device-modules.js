import bushuqiModuleConfig from '@/src/modules/bushuqi/module.config.js'
import cockroachModuleConfig from '@/src/modules/cockroach/module.config.js'

const DEVICE_MODULES = [bushuqiModuleConfig, cockroachModuleConfig]

const MODULE_MAP = DEVICE_MODULES.reduce((acc, moduleConfig) => {
  if (!moduleConfig || !moduleConfig.moduleKey) return acc
  acc[moduleConfig.moduleKey] = moduleConfig
  return acc
}, {})

export const getAllDeviceModules = () => {
  return DEVICE_MODULES.slice()
}

export const getDeviceModule = (moduleKey = '') => {
  return MODULE_MAP[moduleKey] || null
}

export const hasDeviceModule = (moduleKey = '') => {
  return !!getDeviceModule(moduleKey)
}

export const hasCapability = (moduleKey = '', capability = '') => {
  const moduleConfig = getDeviceModule(moduleKey)
  if (!moduleConfig || !capability) return false
  return !!(moduleConfig.capabilities && moduleConfig.capabilities[capability])
}

export const getModuleKeys = () => {
  return DEVICE_MODULES.map((item) => item.moduleKey)
}

export const getModuleDisplayName = (moduleKey = '') => {
  const moduleConfig = getDeviceModule(moduleKey)
  return moduleConfig ? moduleConfig.displayName : ''
}

export default {
  getAllDeviceModules,
  getDeviceModule,
  hasDeviceModule,
  hasCapability,
  getModuleKeys,
  getModuleDisplayName
}
