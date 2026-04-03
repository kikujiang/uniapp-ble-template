# UniApp BLE Device Template

## 项目定位

这是一个面向 **UniApp + 小程序 BLE 硬件交互** 的模板化工程基线。

当前已完成双模块验证：

- `bushuqi`（捕鼠）
- `cockroach`（捕蟑螂）

并且在三条核心链路上已跑通：

- 首页扫描链路
- 详情连接链路
- 绑定新增链路

## 适用场景

适合以下项目：

- 需要 BLE 扫描、连接、读写、通知的小程序硬件项目
- 多设备模块并存，但交互流程类似（扫描 -> 连接 -> 下发命令 -> 解析响应）
- 希望在保留业务页面的前提下，渐进模板化改造

不适合以下项目（当前阶段）：

- 需要复杂多设备并发调度与高级重连状态机的场景
- 追求一次性抽成完全通用低代码平台的场景

## 已完成模板能力

### 1) 分层能力

- `src/shared`：常量与纯工具（hex/crc16/timeouts/uuids）
- `src/core/network`：请求封装（`common/http.js` 已桥接）
- `src/core/ble`：BLE 核心底座
  - `scan-session-base`
  - `device-session-base`
- `src/app/registry`：模块注册中心（`module.config` 聚合）

### 2) 模块能力

- `src/modules/bushuqi`
- `src/modules/cockroach`

每个模块都具备：

- `protocol`（broadcast/command/response）
- `adapters`（scan-session/device-session）
- `module.config`（模块元信息、能力与页面配置）

### 3) 绑定链路共性能力

- `src/features/device-bind/bind-flow-helper.js`
- `src/features/device-bind/components/BindPageShell.vue`

## 待完善部分（明确未完成）

- 首页/详情页骨架尚未抽成通用组件
- `module.config` 仍在持续扩充驱动字段
- `common/` 兼容层仍存在，尚未完全退出
- 绑定页 API 层仍是页面直调（本阶段未迁移）

## 目录总览（模板相关）

```text
src/
├── app/
│   ├── index.js
│   └── registry/device-modules.js
├── core/
│   ├── ble/
│   │   ├── adapter.js
│   │   ├── scanner.js
│   │   ├── connector.js
│   │   ├── gatt.js
│   │   ├── scan-session-base.js
│   │   └── device-session-base.js
│   ├── network/
│   └── storage/device-cache.js
├── features/
│   └── device-bind/
│       ├── bind-flow-helper.js
│       └── components/BindPageShell.vue
├── modules/
│   ├── bushuqi/
│   │   ├── module.config.js
│   │   ├── protocol/
│   │   └── adapters/
│   └── cockroach/
│       ├── module.config.js
│       ├── protocol/
│       └── adapters/
└── shared/
```

## 运行与调试

当前工程仍以 **HBuilderX 工作流** 为主：

1. 使用 HBuilderX 打开项目根目录
2. 配置 `manifest.json` 的小程序 AppID（按你的环境）
3. 运行到微信开发者工具进行调试
4. BLE 建议真机验证（权限、蓝牙状态、距离等）

说明：仓库根目录未提供完整 npm 脚本流，默认不以 CLI 脚本为主入口。

## 上传后首次配置

拉取模板后，至少需先配置以下两项：

1. `manifest.json` 中 `mp-weixin.appid`（当前为 `YOUR_WECHAT_APPID` 占位值）  
2. `src/app/config/runtime.js` 中 `RUNTIME_CONFIG.API_BASE_URL`（当前为 `https://example.com/api.php/` 示例值）

## 新增第三设备模块（概览）

最小步骤：

1. 新建 `src/modules/<new>/module.config.js`
2. 实现 `protocol` 三件套
   - `broadcast-parser.js`
   - `command-builder.js`
   - `response-parser.js`
3. 实现 `adapters`
   - `scan-session.js`（基于 `scan-session-base`）
   - `device-session.js`（基于 `device-session-base`）
4. 在 `src/app/registry/device-modules.js` 注册新模块
5. 页面设置 `moduleKey` 并通过 registry 读取模块入口

## 开源许可与免责声明

- 许可协议：MIT（见仓库根目录 `LICENSE`）
- 免责声明：
  - 本项目为模板示例，不保证适配所有硬件协议、固件版本与现场环境。
  - 使用者需自行评估 BLE 通信可靠性、设备安全性与业务合规风险。
  - 模板默认配置仅用于演示，生产环境请替换为自有合法配置与后端地址。
  - 由模板二次开发产生的线上故障、数据风险与合规责任由使用方承担。

详细说明见：`docs/open-source-disclaimer.md`

## 文档入口

建议从以下文档开始：

1. `docs/template-overview.md`
2. `docs/module-runtime-pattern.md`
3. `docs/module-integration-guide.md`
4. `docs/bind-page-shell.md`
5. `docs/ble-architecture.md`
6. `docs/open-source-disclaimer.md`
7. `docs/upload-prep-checklist.md`

## 维护说明

本项目为个人长期维护的公开模板仓库，主要用于个人技术沉淀与后续项目复用。

- 欢迎提出 issue 和改进建议
- 欢迎基于本仓库进行二次开发
- 当前以个人维护节奏为主，不承诺对所有需求和 PR 及时响应
- 是否采纳优化建议，将根据项目方向与维护成本综合评估

## 最近更新

- 2026-04-02：补齐模板维护规范（Issue/PR 模板、CHANGELOG）

## 下个版本计划

- 抽离首页/详情页通用骨架组件
- 完善 `module.config` 驱动字段与示例
- 收敛 `common/` 兼容层，降低双入口维护成本

## 任务入口

- 功能建议：使用 `Feature request`
- 缺陷反馈：使用 `Bug report`
- 代码合并：按 `Pull Request Template` 提交
