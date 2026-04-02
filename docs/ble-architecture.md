# BLE 架构说明（当前实现）

## 1. 分层原则

当前 BLE 相关代码按三层组织：

- `src/core/ble`：平台 BLE 通用能力，不包含业务协议。
- `src/modules/*/protocol`：设备协议层（广播/命令/响应）。
- `src/modules/*/adapters`：模块会话层，连接 core 与 protocol。

页面层只做生命周期、UI 状态、业务编排。

## 2. `src/core/ble` 各文件职责

- `adapter.js`
  - 蓝牙适配器开关
  - 获取适配器状态
  - 适配器状态监听绑定/解绑

- `scanner.js`
  - 启停扫描
  - 设备发现监听
  - 去重缓存（`discoveredMap`）
  - 扫描状态

- `connector.js`
  - 设备连接/断开
  - 查询连接状态
  - 连接状态监听绑定/解绑

- `gatt.js`
  - 服务与特征发现
  - notify/read/write
  - 写入 Promise 化与基础超时处理
  - 值变化监听绑定/解绑

- `scan-session-base.js`
  - 通用扫描会话封装：
    - 适配器准备、状态读取
    - 扫描启停
    - 设备发现回调流程标准化
    - 适配器状态监听生命周期
  - 通过注入 `parseBroadcast` 支持模块协议差异

- `device-session-base.js`
  - 通用连接会话封装：
    - connect/disconnect/reconnect/isConnected
    - services/characteristics/notify/read/write
    - 连接监听与响应监听生命周期
    - 页面销毁时资源释放
  - 通过注入 `parseResponse` 支持模块协议差异

## 3. `scan-session-base` 设计重点

核心目标：让页面不直接处理 BLE 低层扫描细节。

统一能力：

1. 适配器准备与状态判断
2. 扫描监听注册/解绑
3. 广播 raw -> parser -> 标准化 payload 流程
4. 与 `scanner.js` 的去重状态共享

模块差异保留方式：

- 模块在 `modules/*/adapters/scan-session.js` 注入：
  - `moduleName`
  - `parseBroadcast`
  - 可选过滤/映射钩子

## 4. `device-session-base` 设计重点

核心目标：让页面不直接散落连接/notify/write 细节。

统一能力：

1. 连接链路与重连入口
2. GATT 服务/特征/读写/notify 操作
3. 连接状态监听与值监听标准化
4. 销毁时监听释放

模块差异保留方式：

- 模块在 `modules/*/adapters/device-session.js` 注入：
  - `moduleName`
  - `uuids`
  - `parseResponse`
  - 可选 payload 映射

## 5. 为什么模块层只保留 parser/uuid/moduleName 差异

因为这三类差异是“设备天然差异”，应由模块承担；  
而连接/扫描/监听生命周期是“平台共性”，应由 core 承担。

这样做的收益：

- 新增设备时只需实现协议与少量 adapter。
- 旧页面可以渐进迁移，不要求一次性重写。
- 代码定位清晰：问题属于 core 还是 module 更容易判断。

## 6. 页面层当前应负责的内容

页面层应主要负责：

- 生命周期与页面状态
- 用户交互、提示、跳转
- 业务匹配规则（如设备筛选、在线阈值策略）
- 业务数据展示与上报

页面层应尽量避免：

- 直接调用 `uni.onBluetoothDeviceFound` / `uni.writeBLECharacteristicValue` 等低层 API
- 直接拼协议帧、直接解析原始响应

## 7. 当前架构边界（待完善项）

以下仍是后续可扩展项，不代表已完成：

- 通用重连策略（指数退避、最大重试）
- 串行写队列与命令-响应匹配状态机
- 统一模块注册中心（`module.config / registry`）
- 通用页面骨架（首页/详情/绑定）进一步抽象

