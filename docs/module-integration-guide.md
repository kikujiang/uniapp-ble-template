# 设备模块接入指南（第三种设备）

本文档用于指导在当前模板中新增一个设备模块（示例：`newDevice`）。

## 1. 接入目标

新增模块后，应满足：

- 可独立解析广播、构建命令、解析响应。
- 可复用通用 BLE 底座（扫描/连接会话）。
- 可复用绑定流程 helper 与轻量绑定页骨架。
- 页面层只保留业务编排，不直接散落 `uni.*BLE*` 调用。

## 2. 必要目录结构

```text
src/modules/newDevice/
├── index.js
├── module.config.js
├── api/
│   └── index.js
├── protocol/
│   ├── index.js
│   ├── constants.js          # 可选
│   ├── broadcast-parser.js   # 必须
│   ├── command-builder.js    # 必须
│   └── response-parser.js    # 必须
└── adapters/
    ├── index.js
    ├── scan-session.js       # 必须
    └── device-session.js     # 必须
```

## 3. 必须实现的协议与会话能力

## 3.1 `protocol/broadcast-parser.js`

- 输入原始广播 hex。
- 输出标准化对象，至少包含：
  - `valid`
  - `payloadHex`
  - `macAddress`（可解析时）
- 不确定字段放入 `unknownFields`。

## 3.2 `protocol/command-builder.js`

- 输出可写入设备的 hex 命令。
- 至少覆盖：状态查询、配置写入、记录查询、校时（按设备能力）。

## 3.3 `protocol/response-parser.js`

- 输入设备响应 hex。
- 输出结构化结果（命令类型、状态、记录、错误码等）。

## 3.4 `adapters/scan-session.js`

- 基于 `src/core/ble/scan-session-base.js` 薄封装。
- 注入模块 `parseBroadcast` 与 `moduleName`。

## 3.5 `adapters/device-session.js`

- 基于 `src/core/ble/device-session-base.js` 薄封装。
- 注入模块 `parseResponse` 与默认 UUID。

## 4. `module.config` 应该承载的差异

`module.config.js` 推荐最小字段：

- 基础信息：`moduleKey/moduleName/displayName/protocolSummary`
- 能力开关：`capabilities`
- 模块入口：`adapters.createScanSession/createDeviceSession`
- 页面接入状态：`pageIntegration`
- 绑定配置：
  - `deviceNamePrefix`
  - `bindConfig`（标题、提示、按钮文案、默认请求附加字段）
  - `platformRules`（iOS/Android 特殊处理开关）

## 5. 页面层差异放置原则

应写入 `module.config` 的差异：

- 稳定文案配置（绑定提示、按钮文案、列表标题）
- 稳定筛选规则（设备名前缀）
- 稳定平台规则开关（iOS MAC 处理策略）
- 稳定默认参数（如模块附加字段）

应留在页面层的差异：

- API 调用时机与异常处理
- 提交后导航与 toast 时机
- 临时运营策略或业务特判
- 表单级交互细节

## 6. 首页/详情/绑定接入建议

## 6.1 首页（index）

- 页面持有 `scanSession`。
- 扫描控制通过 `scanSession`。
- 广播解析由模块 parser 提供。
- 页面负责在线态与列表编排。

## 6.2 详情页（detail）

- 页面持有 `deviceSession`。
- 连接/notify/write/read 通过 `deviceSession`。
- 命令构建与响应解析由模块 protocol 提供。

## 6.3 绑定页（add）

- 页面读取 `module.config.bindConfig` 与 `platformRules`。
- 绑定流程共性通过 `bind-flow-helper`。
- 通用展示层复用 `BindPageShell`：
  - `availableDeviceTitle`
  - `scanNotice`
  - `emptyDeviceHint`
  - `submitButtonText`
  - `deviceList/selectedDevice/isScanning/isSubmitting`

## 7. 新增第三模块最小清单

1. 新建 `src/modules/<new>/` 全套文件（含 `module.config`）。
2. 在 `src/app/registry/device-modules.js` 注册新模块。
3. 绑定页设置 `moduleKey`，读取 registry：
   - 复用 `BindPageShell`
   - 复用 `bind-flow-helper`
4. 根据模块差异补充 `module.config.bindConfig/platformRules`。
5. 真机回归三条链路：
   - 首页扫描
   - 详情连接
   - 绑定新增

## 8. 当前状态说明（真实边界）

已完成：

- `bushuqi/cockroach` 双模块三链路闭环。
- 绑定页同构模式（registry + session + helper + shell）。

待完善：

- 通用详情页骨架尚未抽取。
- 更多页面仍有业务硬编码，尚未全部配置化。
- API 层仍在页面直调，尚未模块化到统一 service。

