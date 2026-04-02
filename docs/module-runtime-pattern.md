# 模块运行时接入模式说明

## 1. 目标与范围

本文档描述当前项目中“设备模块如何接入页面运行链路”的已实现模式。  
覆盖模块：`bushuqi`、`cockroach`。  
覆盖链路：首页扫描、详情连接、绑定新增。

本文档基于当前真实代码结构，不将未实现能力当作已完成。

## 2. 运行时分层与职责

## 2.1 `module.config`（模块声明层）

文件：

- `src/modules/bushuqi/module.config.js`
- `src/modules/cockroach/module.config.js`

作用：

- 声明模块元信息（`moduleKey/moduleName/displayName/protocolSummary`）
- 声明能力矩阵（`capabilities`）
- 暴露模块运行入口（`adapters.createScanSession/createDeviceSession`）
- 声明页面接入状态（`pageIntegration`）

## 2.2 `registry`（模块注册层）

文件：

- `src/app/registry/device-modules.js`
- `src/app/index.js`

作用：

- 注册所有模块 `module.config`
- 提供统一查询能力：
  - `getAllDeviceModules`
  - `getDeviceModule`
  - `hasDeviceModule`
  - `hasCapability`
  - `getModuleKeys`
  - `getModuleDisplayName`

## 2.3 `core/ble`（BLE 底座层）

关键文件：

- `src/core/ble/scan-session-base.js`
- `src/core/ble/device-session-base.js`
- `src/core/ble/scanner.js`
- `src/core/ble/connector.js`
- `src/core/ble/gatt.js`

作用：

- 提供与业务协议无关的 BLE 通用能力
- 管理扫描、连接、读写、notify、监听生命周期
- 降低页面对 `uni.*BLE*` 的直接依赖

## 2.4 `modules/*/protocol`（协议层）

关键文件：

- `broadcast-parser.js`
- `command-builder.js`
- `response-parser.js`

作用：

- 广播解析、命令构建、响应解析
- 只处理协议，不处理 UI 与页面流程

## 2.5 `modules/*/adapters`（模块会话层）

关键文件：

- `scan-session.js`
- `device-session.js`

作用：

- 基于 `core/ble` 基座做模块薄封装
- 注入模块差异（`moduleName`、parser、uuids）
- 向页面提供稳定调用接口

## 2.6 页面层（运行编排层）

作用：

- 生命周期
- 表单/列表/UI 状态
- 用户交互与导航
- 业务流程编排（如筛选、上报、提示）

页面不应承担：

- 低层 BLE API 细节
- 协议帧拼装/解析

## 3. 三条链路的当前接入方式

## 3.1 首页扫描链路

页面：

- `pages/index/indexNew.vue`
- `pages/index/indexCockroach.vue`

依赖：

- `registry`：读取模块元信息
- `modules/*/adapters/scan-session`
- `modules/*/protocol/broadcast-parser`（通过 scan-session 间接使用）
- `core/storage/device-cache`

页面保留职责：

- 列表更新、在线态策略、业务匹配规则、UI 提示

## 3.2 详情连接链路

页面：

- `pages/index/device/detailNew.vue`
- `pages/index/device/detailCockroach.vue`

依赖：

- `registry`：读取模块元信息/capability（轻接入）
- `modules/*/adapters/device-session`
- `modules/*/protocol/command-builder`
- `modules/*/protocol/response-parser`（通过 device-session 间接使用）

页面保留职责：

- 业务命令触发顺序、状态渲染、日志展示、接口上报

## 3.3 绑定新增链路

页面：

- `pages/index/device/add.vue`
- `pages/index/device/addCockroach.vue`

依赖：

- `registry`：读取模块元信息 + `adapters.createScanSession`
- `modules/*/adapters/scan-session`
- `modules/*/protocol/broadcast-parser`（通过 scan-session 间接使用）

页面保留职责：

- 表单输入、候选设备列表、设备去重策略、绑定 API 请求

## 4. 角色关系（运行时）

1. 页面根据 `moduleKey` 从 `registry` 读取模块配置。  
2. 页面通过 `moduleMeta.adapters` 获取会话工厂。  
3. 会话层调用 `core/ble` 执行 BLE 操作。  
4. 协议层负责广播/命令/响应编解码。  
5. 页面消费结构化结果并进行业务编排。

## 5. bushuqi / cockroach：共性与差异

## 5.1 共性（已统一）

- 三条链路页面均走 `session` 入口（扫描/连接）
- 页面可读取 `registry/module.config`
- 协议层统一为 `broadcast + command + response` 三件套
- BLE 底座统一复用 `scan-session-base/device-session-base`

## 5.2 差异（应保留）

- 协议细节（字段含义、命令集、响应类型）
- 默认 UUID
- 设备名筛选策略（如 `Mouse` / `Cockroachtrap`）
- 页面业务文案与少量流程差异（例如放电按钮）

## 6. 接入第三种设备：最小施工单

## 6.1 需新增文件

建议新增：

- `src/modules/<new>/module.config.js`
- `src/modules/<new>/protocol/broadcast-parser.js`
- `src/modules/<new>/protocol/command-builder.js`
- `src/modules/<new>/protocol/response-parser.js`
- `src/modules/<new>/adapters/scan-session.js`
- `src/modules/<new>/adapters/device-session.js`
- `src/modules/<new>/index.js`

并在 `src/app/registry/device-modules.js` 注册新模块。

## 6.2 页面最少改动点

- 选定页面的 `moduleKey`
- 通过 `registry` 获取 `moduleMeta`
- 会话创建改为 `moduleMeta.adapters.*`
- 保留页面业务逻辑，先不大改 UI

## 6.3 可直接复用能力

- `core/ble/*` 全部底座
- `scan-session-base`、`device-session-base`
- `registry` 查询函数
- 页面已验证的“轻接入模式”（initModuleMeta + ensureSession）

## 7. 当前未完全模板化部分（真实状态）

仍待完善：

- `module.config` 还未完全驱动所有页面分支（当前为轻接入）
- 绑定页与详情页的业务流程仍有页面内硬编码
- 未建立统一 `module registry` 自动发现机制（当前手工注册）
- 仅绑定页已抽轻量骨架（`BindPageShell`），首页/详情骨架尚未抽取
- `common` 目录仍存在兼容层逻辑

## 8. 抽通用绑定页骨架前置条件

建议满足以下前提再抽：

1. 双模块绑定页字段与流程差异已清单化（必填项、筛选策略、提交参数差异）。  
2. `module.config` 能提供足够驱动信息（至少包含绑定页行为配置）。  
3. 绑定页中可变逻辑已收敛到 adapter/protocol，而非散落在页面方法中。  
4. 已有回归清单（扫描发现、去重、提交、返回流程）。

在此前提未满足前，不建议直接抽通用骨架，避免“抽象层看似统一、内部大量特判”。
