# UniApp + BLE 模板总览

## 1. 模板定位

本项目正在从“具体业务项目”演进为“UniApp 小程序 + BLE 硬件交互模板”。

当前模板定位：

- 面向 **有蓝牙设备交互需求** 的 uni-app 小程序项目。
- 支持“**多设备模块并存**”的组织方式（当前已验证 `bushuqi` / `cockroach` 双模块）。
- 强调“**通用 BLE 底座 + 模块协议可插拔 + 页面渐进迁移**”。

## 2. 适合复用的项目类型

适合：

- 以微信小程序为主、使用 uni-app 的硬件项目。
- 设备协议不同但交互流程相似的场景（扫描 -> 连接 -> 读写 -> 解析 -> 展示）。
- 需要保留历史页面并逐步重构的存量项目。

不适合（当前阶段）：

- 需要一次性抽成完全低代码化平台的项目。
- 对多连接并发、复杂重连状态机、高吞吐写队列有强要求且必须立即上线的项目（需后续增强）。

## 3. 已沉淀的核心能力（已完成）

### 3.1 分层结构

- `src/shared`：跨模块常量与纯工具（hex/crc16/timeouts/ble-uuids）。
- `src/core/network`：请求层底座，`common/http.js` 已桥接。
- `src/core/ble`：BLE 核心能力（adapter/scanner/connector/gatt）。
- `src/modules/*`：按设备模块拆分 protocol/api/adapters。

### 3.2 BLE 模板化底座

- 扫描链路基座：`src/core/ble/scan-session-base.js`
- 连接链路基座：`src/core/ble/device-session-base.js`
- 两个模块均已接入：
  - `src/modules/bushuqi/adapters/scan-session.js`
  - `src/modules/cockroach/adapters/scan-session.js`
  - `src/modules/bushuqi/adapters/device-session.js`
  - `src/modules/cockroach/adapters/device-session.js`

### 3.3 双模块页面验证

- 首页扫描链路：`indexNew.vue` / `indexCockroach.vue` 已跑通新接入模式。
- 详情连接链路：`detailNew.vue` / `detailCockroach.vue` 已跑通新接入模式。

## 4. 尚未完全模板化的部分（待完善）

以下能力目前仍主要在页面层或 legacy 层，后续可继续收口：

- `add.vue` / `addCockroach.vue` 的绑定流程与会话编排。
- 页面层在线态策略、业务判定策略、提示策略的进一步抽象。
- `common/ble-util.js` 等 legacy BLE 工具的兼容收口。
- 模块注册机制（`module.config / registry`）尚未正式建立。
- 统一的“通用设备页面骨架”尚未抽取。

## 5. 推荐后续路线

建议顺序：

1. 补 `module.config / registry`，固化模块接入契约。
2. 接入并整理 `add.vue` / `addCockroach.vue`，形成绑定链路模板。
3. 补充模块接入脚手架与检查清单（文档 + 目录模板）。
4. 再评估是否抽“通用首页骨架 / 通用详情骨架”。

## 6. 当前阶段结论

当前项目已进入“**模板核心骨架可用**”阶段：  
底层链路（扫描/连接）已可复用，双模块已验证；下一阶段重点应放在“模块注册 + 绑定链路”而非继续大改页面。

