import * as commandBuilder from './protocol/command-builder.js'
import * as broadcastParser from './protocol/broadcast-parser.js'
import * as responseParser from './protocol/response-parser.js'
import { createBushuqiScanSession } from './adapters/scan-session.js'
import { createBushuqiDeviceSession } from './adapters/device-session.js'

export const bushuqiModuleConfig = {
  moduleKey: 'bushuqi',
  moduleName: 'bushuqi',
  displayName: '智能感应灭鼠器',
  protocolSummary: 'BLE 广播 + 命令写入 + 响应解析（捕鼠设备协议）',
  capabilities: {
    scan: true,
    connect: true,
    read: true,
    write: true,
    notify: true,
    record: true,
    bind: true,
    discharge: false,
    calibrationTime: true
  },
  deviceNamePrefix: 'Mouse',
  pageMeta: {
    list: {
      title: '智能感应灭鼠器'
    },
    detail: {
      title: '设备详情'
    },
    bind: {
      title: '新增设备'
    }
  },
  bindConfig: {
    availableDeviceTitle: '可用设备',
    scanNotice:
      '连接说明：\n请确认设备已打开蓝牙；\n请确认设备已开启连接模式；\n请确认设备保持蓝牙连接状态；\n请确认设备有电；\n请确认设备在10米范围之内。',
    emptyDeviceHint: '暂无可绑定设备',
    submitHint: '确认后将添加并绑定该设备',
    submitButtonText: '添加设备',
    requestExtraFields: {}
  },
  platformRules: {
    ios: {
      transformLeadingZeroMac: true,
      checkByMacAddressIos: false
    },
    android: {
      useDeviceIdAsMac: true
    }
  },
  protocol: {
    broadcastParser,
    commandBuilder,
    responseParser
  },
  adapters: {
    createScanSession: createBushuqiScanSession,
    createDeviceSession: createBushuqiDeviceSession
  },
  pageIntegration: {
    listPage: {
      path: '/pages/index/indexNew',
      status: 'integrated'
    },
    detailPage: {
      path: '/pages/index/device/detailNew',
      status: 'integrated'
    },
    bindPage: {
      path: '/pages/index/device/add',
      status: 'integrated'
    }
  },
  extension: {
    reserved: {}
  }
}

export default bushuqiModuleConfig
