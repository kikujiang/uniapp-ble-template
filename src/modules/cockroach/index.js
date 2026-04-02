// Phase 1 scaffold: cockroach module boundary.
export * from './api/index.js'
export * from './protocol/index.js'
export * from './adapters/index.js'
export { default as cockroachModuleConfig, cockroachModuleConfig as moduleConfig } from './module.config.js'
