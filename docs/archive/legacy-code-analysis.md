# 蓝牙设备管理代码逻辑分析

## 一、整体架构

### 1. 三个核心页面职责

#### indexNew.vue（首页 - 设备列表）
- **主要功能**：显示所有已添加的设备列表，通过广播扫描实时更新设备在线状态
- **蓝牙模式**：被动扫描（广播模式）`uni.startBluetoothDevicesDiscovery`
- **数据来源**：服务器API `user/get_device_company_list`
- **状态管理**：
  - `connect`: 设备在线状态（通过广播数据更新）
  - `voltage`: 设备电量（从广播数据解析）
  - `count`: 设备捕鼠数量（从广播数据解析）
- **关键流程**：
  1. onShow → fetchDeviceList（获取服务器设备列表）
  2. checkBLEState → startDeviceDiscovery（启动广播扫描）
  3. onBluetoothDeviceFound → 解析广播数据 → 更新设备状态
  4. checkDeviceOnlineState（定时器，每5秒检查设备是否超时离线）

#### add.vue（添加设备页面）
- **主要功能**：扫描未添加的新设备，提交到服务器
- **蓝牙模式**：被动扫描（广播模式）
- **过滤逻辑**：
  1. 过滤不符合命名规则的设备（必须以`Mouse`开头）
  2. 过滤广播数据格式不正确的设备（必须以`FF`或`00`开头）
  3. 过滤已存在于`device_connect_list`的设备（已添加）
- **关键流程**：
  1. onLoad → fetchDeviceList（获取已添加设备列表存入device_connect_list）
  2. onShow → initBLE → startBluetoothDeviceDiscovery
  3. onBluetoothDeviceFound → 解析MAC地址 → 过滤已添加设备 → 显示可选设备
  4. 用户选择设备 → addDevice → 提交到服务器

#### detailNew.vue（设备详情页面）
- **主要功能**：主动连接设备，读取/写入数据，执行设备操作
- **蓝牙模式**：主动连接（BLE连接）`uni.createBLEConnection`
- **服务特征**：
  - 服务UUID: `0000FFF0-0000-1000-8000-00805F9B34FB`
  - 写特征: `0000FFF3-0000-1000-8000-00805F9B34FB`
  - 通知特征: `0000FFF4-0000-1000-8000-00805F9B34FB`
- **关键流程**：
  1. onShow → fetchDeviceDetail（获取设备信息）+ checkBLEState
  2. connectDevice → uni.createBLEConnection（主动连接）
  3. getDeviceService → getCharacteristics → notify（启用通知）
  4. notifyData（接收设备返回数据）→ 解析命令 → 更新UI/服务器

---

## 二、iOS vs Android 关键差异

### 平台deviceId差异对照表

| 平台 | deviceId | mac_address | mac_address_ios | 连接时使用 | 比对时使用 |
|------|----------|-------------|-----------------|----------|----------|
| **Android** | 真实MAC<br/>(AA:BB:CC:DD:EE:FF) | 真实MAC | 空或UUID（可选） | deviceId | deviceId vs mac_address |
| **iOS** | UUID<br/>(12345678-...) | 从广播解析的真实MAC | UUID | deviceId (UUID) | UUID vs mac_address_ios<br/>或 MAC vs mac_address |

### 关键技术点

1. **Android平台**：
   - `deviceId` 直接就是MAC地址，可以用于连接和比对
   - 简单直接，无需额外解析

2. **iOS平台**：
   - `deviceId` 是系统生成的UUID，每次配对可能不同
   - 真实MAC地址需要从广播数据（`advertisData`）中解析
   - 需要同时维护两个ID：UUID用于连接，MAC用于识别设备

3. **MAC地址解析**：
   ```javascript
   // 从广播数据的前12个字符解析MAC
   let mac = bleData.substring(0,12) // 例如: "AABBCCDDEEFF"
   let macValue = mac.replace(/(..)(..)(..)(..)(..)(..)/g, "$1:$2:$3:$4:$5:$6")
   // 结果: "AA:BB:CC:DD:EE:FF"
   
   // iOS特殊处理：以00开头的MAC需要转换
   if(macValue.startsWith("00")){
       macValue = util.changeMacAddress(macValue)
   }
   ```

---

## 三、完整业务流程分析

### 流程1：添加新设备

```
[用户操作] 点击添加设备按钮
    ↓
[indexNew.vue] naviAdd(2) → isAddDevice=true → stopDiscovery() → 跳转add页面
    ↓
[add.vue] onLoad() → fetchDeviceList() 获取已添加设备列表
    ↓
[add.vue] onShow() → initBLE() → checkBLEState() → startBluetoothDeviceDiscovery()
    ↓
[add.vue] onBluetoothDeviceFound() 
    → 过滤设备名称（必须以"Mouse"开头）
    → 过滤广播数据格式（必须以"FF"或"00"开头）
    → 解析MAC地址
    → 过滤device_list中已有的设备（防止重复显示）
    → 过滤device_connect_list中的设备（防止重复添加）
    → 添加到device_list显示
    ↓
[用户操作] 选择设备 → 输入设备名称、位置、区域
    ↓
[add.vue] addDevice()
    → 提交到服务器: Device/add_device_company
    → 成功后stopDiscovery() → navigateBack返回首页
    ↓
[indexNew.vue] onShow() → fetchDeviceList() 刷新列表（新设备已包含）
```

**关键点**：
- ✅ `device_connect_list`在onLoad时加载，不会自动刷新
- ✅ 这是合理的设计，因为用户添加设备后会返回首页重新加载
- ⚠️  如果用户在add页面时，其他人删除了设备，不会实时反映

### 流程2：查看设备详情并连接

```
[indexNew.vue] 广播扫描运行中
    → onBluetoothDeviceFound() 持续接收广播数据
    → 匹配设备 → 解析数据 → 更新connect=true, voltage, count
    ↓
[用户操作] 点击设备卡片
    ↓
[indexNew.vue] connectDevice(item)
    → isConnectDevice=true （标记进入详情）
    → stopDiscovery() （停止广播扫描）
    → 跳转detailNew.vue
    ↓
[detailNew.vue] onShow()
    → fetchDeviceDetail() 获取设备详细信息
    → checkBLEState() → connectDevice()
    ↓
[detailNew.vue] connectDevice()
    → uni.createBLEConnection() 主动连接设备
    → 成功后 → getDeviceService()
    → getCharacteristics()
    → notify() 启用通知
    ↓
[detailNew.vue] 发送命令（例如：查询时间、查询记录）
    → send(command) 通过写特征发送
    ↓
[detailNew.vue] notifyData() 接收设备响应
    → 解析命令码 (功能码 + 命令码)
    → 更新UI显示
    → 保存数据到服务器 (record/save, Device/update等)
    ↓
[用户操作] 返回首页
    ↓
[detailNew.vue] back() → clearBle() → deviceDisconnected() → navigateBack()
    ↓
[indexNew.vue] onShow()
    → fetchDeviceList() 获取最新设备列表
    → ⚠️  问题：connect状态被重置为false
    → ✅ 修复：保留原设备的connect状态
    → checkBLEState() 重新启动广播扫描
```

**关键问题修复**：
```javascript
// ❌ 修复前：所有设备connect重置为false
me.devices = res.data
me.devices.forEach(item => {
    item.connect = false
})

// ✅ 修复后：保留原设备的connect状态
const oldDevices = me.devices || []
me.devices = res.data.map(item => {
    const oldDevice = oldDevices.find(old => old.id === item.id)
    return { ...item, connect: oldDevice ? oldDevice.connect : false }
})
```

### 流程3：设备状态实时监控

```
[indexNew.vue] 广播扫描模式运行
    ↓
每次接收到广播数据:
    → 解析设备MAC/UUID
    → 匹配devices_show中的设备
    → 检查广播数据是否变化 (通过storage缓存的broadcastStr对比)
    → 如果数据相同：仅更新时间戳
    → 如果数据不同：
        - 解析电压、捕鼠数量、温度等
        - 更新设备状态
        - 保存到服务器 (record/save)
        - 更新storage缓存
    ↓
定时器 (每5秒执行):
    → checkDeviceOnlineState()
    → 检查每个设备的lastTime
    → 如果超过15秒未更新：connect=false (设备离线)
```

---

## 四、已修复的问题

### 问题1：删除设备后add页面还能检测到 ❌ 不修复

**原因分析**：
- `device_connect_list`在add.vue的onLoad时获取
- 删除设备后，add页面的列表不会自动更新

**解决方案评估**：
1. ❌ 在onShow中调用`fetchDeviceList()` → 会导致每次显示都请求，性能差
2. ✅ **保持现状不修改**，原因：
   - 用户删除设备后通常返回首页，不会立即进入add页面
   - 即使扫描到已删除设备，提交时服务器会拒绝
   - 如果真需要刷新，应该使用uni.$emit事件通知

### 问题2：detailNew连接正常但indexNew显示灰色 ✅ 已修复

**原因分析**：
- `fetchDeviceList()`在onShow时将所有设备的`connect`重置为`false`
- detailNew的连接状态是独立的，不影响indexNew的广播扫描结果

**修复方案**：
```javascript
// 在fetchDeviceList时保持原有设备的connect状态
const oldDevices = me.devices || []
me.devices_show = me.devices = serverDataList.map(item => {
    const oldDevice = oldDevices.find(old => old.id === item.id)
    return { ...item, connect: oldDevice ? oldDevice.connect : false };
});
```

### 问题3：广播数据处理时的时间戳错误 ✅ 已修复

**原因分析**：
- 在循环外使用了错误的设备索引`me.devices_show[i].id`
- 应该使用当前匹配到的设备`curDevice.id`

**修复方案**：
```javascript
// ❌ 错误
me.setStorageValue(me.devices_show[i].id, 1, curTime)

// ✅ 正确
me.setStorageValue(curDevice.id, 1, curTime)
```

### 问题4：for循环结构错误导致语法错误 ✅ 已修复

**原因分析**：
- fetchDeviceList中，for循环后直接跟了`} else {`
- `checkDeviceOnlineState()`被错误放在循环内部

**修复方案**：
```javascript
// ❌ 错误
for (var i = 0; i < me.devices_show.length; i++) {
    // ...
    me.checkDeviceOnlineState()  // 错误：在循环内
} else {  // 错误：for循环后不能直接跟else
    // ...
}

// ✅ 正确
for (var i = 0; i < me.devices_show.length; i++) {
    // ...
}
me.checkDeviceOnlineState()  // 正确：在循环外调用一次
} else {  // 正确：这是外层if的else
    // ...
}
```

---

## 五、代码优化建议

### 1. 日志优化 ✅ 已完成

**优化原则**：
- 使用统一的日志前缀：`[ADD页面]`、`[INDEX页面]`、`[DETAIL页面]`
- 只保留关键节点日志，移除过度详细的中间步骤日志
- 错误日志使用`console.error()`
- 成功操作使用 ✓ 标记

**关键日志保留**：
```javascript
// ADD页面
'[ADD页面] 加载 - type: 2'
'[ADD页面] ✓ 开始BLE扫描'
'[ADD页面] ✓ 发现新设备 - name: Mouse001, mac: AA:BB:CC:DD:EE:FF'
'[ADD页面] ✓ 设备添加成功 - id: 123'

// INDEX页面
'[INDEX页面] 加载'
'[INDEX页面] ✓ 开始BLE扫描(广播模式)'
'[INDEX页面] ✓ 设备在线 - name: Mouse001, data: FF0102...'
'[INDEX页面] 更新iOS deviceId到服务器 - device: Mouse001, uuid: 12345-...'

// DETAIL页面
'[DETAIL页面] 加载 - id: 123, mac: AA:BB:CC:DD:EE:FF'
'[DETAIL页面] ✓ BLE连接成功'
'[DETAIL页面] → 发送命令: AA0102...'
'[DETAIL页面] ← 接收数据: AA0202...'
'[DETAIL页面] ✓ 更新服务器成功'
```

### 2. 错误处理增强 ⚠️  建议

**当前问题**：
- 很多API调用缺少错误处理
- 蓝牙连接失败时没有重试机制

**建议改进**：
```javascript
// 添加超时处理
setTimeout(() => {
    if (!this.connectState) {
        uni.showToast({ title: '连接超时，请重试', icon: 'none' })
    }
}, 10000)

// 添加重试机制
let retryCount = 0
const maxRetry = 3
function connectWithRetry() {
    uni.createBLEConnection({
        success: () => { /* ... */ },
        fail: (err) => {
            if (retryCount < maxRetry) {
                retryCount++
                console.log(`[DETAIL页面] 连接失败，重试 ${retryCount}/${maxRetry}`)
                setTimeout(connectWithRetry, 1000)
            } else {
                console.error('[DETAIL页面] 连接失败，已达最大重试次数')
            }
        }
    })
}
```

### 3. 代码复用 ⚠️  建议

**重复代码**：
- `ab2hex()` 方法在三个文件中重复
- iOS MAC地址转换逻辑重复
- 系统平台判断逻辑重复

**建议改进**：
- 创建 `common/ble-util.js`，封装公共方法：
  ```javascript
  // ble-util.js
  export default {
      ab2hex(buffer) { /* ... */ },
      parseMacAddress(bleData) { /* ... */ },
      isIOS() { return uni.getSystemInfoSync().platform === 'ios' },
      getDeviceId(device) { 
          return this.isIOS() ? device.mac_address_ios : device.mac_address 
      }
  }
  ```

---

## 六、测试建议

### 测试场景清单

1. **添加设备流程**：
   - [ ] Android设备：扫描→添加→验证服务器
   - [ ] iOS设备：扫描→添加→验证服务器
   - [ ] 重复添加同一设备（应被过滤）
   - [ ] 添加时网络异常处理

2. **设备列表刷新**：
   - [ ] 首页加载显示所有设备
   - [ ] 设备在线状态实时更新（广播扫描）
   - [ ] 设备离线检测（15秒超时）
   - [ ] 设备电量显示正确

3. **设备详情连接**：
   - [ ] 进入详情页自动连接
   - [ ] 连接失败提示
   - [ ] 查询设备时间
   - [ ] 查询捕鼠记录
   - [ ] 更换气罐操作
   - [ ] 删除设备操作

4. **iOS/Android兼容性**：
   - [ ] iOS设备MAC地址解析正确
   - [ ] iOS设备UUID保存到服务器
   - [ ] Android设备直接使用MAC地址
   - [ ] 跨平台设备识别（同一设备在iOS/Android都能正确识别）

5. **页面切换**：
   - [ ] 首页→添加页面→首页（蓝牙扫描正确停止/启动）
   - [ ] 首页→详情页→首页（设备连接状态保持）
   - [ ] 详情页返回时设备列表正确刷新

---

## 七、总结

### 架构优点

1. ✅ **职责分离清晰**：
   - indexNew: 广播扫描，状态监控
   - add: 设备发现，新增设备
   - detailNew: 主动连接，设备控制

2. ✅ **平台兼容性良好**：
   - 正确处理iOS/Android的deviceId差异
   - MAC地址解析逻辑完整

3. ✅ **实时性强**：
   - 广播扫描实时更新设备状态
   - 定时器监控设备离线

### 当前已修复

1. ✅ 设备连接状态保持（fetchDeviceList不再重置connect）
2. ✅ 时间戳更新使用正确的设备ID
3. ✅ for循环语法错误修复
4. ✅ 日志输出优化，只保留关键节点

### 仍需关注

1. ⚠️  错误处理机制不完善
2. ⚠️  代码存在重复，可以提取公共方法
3. ⚠️  蓝牙连接没有重试机制
4. ⚠️  add页面的device_connect_list不会实时刷新（但这是合理的设计）

---

**最后更新**: 2025年12月18日  
**文档版本**: v2.0  
**修订内容**: 全面重构，增加完整流程分析、日志优化、测试建议
