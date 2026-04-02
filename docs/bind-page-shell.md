# BindPageShell 使用说明

## 1. 组件定位

`BindPageShell` 是绑定页的轻量展示骨架组件，用于承载“可复用 UI 区块”，不承载业务提交流程。

文件位置：

- `src/features/device-bind/components/BindPageShell.vue`

## 2. 负责什么

组件当前负责：

- 扫描状态展示（`isScanning`）
- 可用设备列表展示（`deviceList`）
- 空列表提示展示（`emptyDeviceHint`）
- 当前选中设备展示（`selectedDevice`）
- 绑定提交按钮展示（`submitButtonText` / `isSubmitting`）
- 基础提示文案展示（`scanNotice`）
- 非扫描模式下蓝牙地址展示（`deviceMac`）

## 3. 不负责什么

组件不负责：

- API 提交逻辑
- 扫描生命周期控制
- registry / module.config 读取
- 选中后的业务赋值
- 提交后导航与 toast 时机
- 模块特有参数组装

以上逻辑应继续由页面层负责。

## 4. Props

当前支持的主要 `props`：

- `moduleDisplayName: string`
- `availableDeviceTitle: string`
- `scanNotice: string`
- `emptyDeviceHint: string`
- `submitButtonText: string`
- `deviceList: Array`
- `selectedDevice: Object | null`
- `isScanning: boolean`
- `isSubmitting: boolean`
- `showScanSection: boolean`
- `deviceMac: string`

## 5. Events

当前透出的事件：

- `select-device`
  - 点击候选设备时触发
  - 参数：当前点击设备对象
- `submit`
  - 点击提交按钮时触发

## 6. 页面层仍需负责的最小职责

页面至少应负责：

1. 读取 `module.config`（通过 registry）并映射到 props。  
2. 扫描会话启动/停止与资源释放。  
3. 候选设备筛选、去重、已绑定过滤（可复用 helper）。  
4. 提交前校验与 payload 构建。  
5. API 调用、toast/loading、导航。

## 7. 适用场景

适合复用 `BindPageShell` 的条件：

- 页面是“绑定/新增设备”类页面
- 具备“候选设备列表 + 选中 + 提交”基础交互
- 业务差异主要在提交参数、筛选规则、提示文案

如果页面交互模型明显不同（例如多步骤向导、复杂批量绑定），不建议强行复用。

## 8. 当前状态与后续扩展

当前状态：

- 已在 `add.vue` 与 `addCockroach.vue` 接入
- 作为“轻量骨架 + 页面业务层”模式运行

后续可扩展（待评估）：

- 增加可选插槽（例如自定义顶部说明区）
- 增加更细粒度事件（例如“重试扫描”）
- 将字段文案进一步配置化（通过 `module.config.bindConfig`）

