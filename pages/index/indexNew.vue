<template>
	<view class="content">
		<view class="login_bg"></view>
		<view class="navBarBox" :style="{ height: custom_bar + 'px' }">
			<view class='statusBar' :style="{ height: status_bar + 'px' }"></view>
			<view class="navBar">
				<view class="back_view" @click="naviBack">
					<image src="../../static/back.png" class="back_img" mode="widthFix"></image>
				</view>
				<view class="nav_title">{{ moduleDisplayName }}</view>
			</view>
		</view>

		<view>
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000"
				indicator-color="#ffffff">
				<swiper-item v-for="(item, index) in bannerList" class="swiper-item" :key="index">
					<image class="swiper-image" mode="aspectFill" :src="item.image"></image>
				</swiper-item>
			</swiper>
		</view>

		<view class="view_notice">
			<image src="../../static/index/notice_warn.png" class="notice_img" mode="widthFix"></image>
			<text class="notice_text">接收捕捉信息时请于设备保持10米以内</text>
		</view>

		<view class="device_list_top">
			<view class="top_left">
				<image src="../../static/index/add_img.png" mode="widthFix" class="front"></image>
				<text v-if="devices_show.length > 0" class="top_content">我的设备（{{ devices_show.length }}）</text>
				<text v-else class="top_content">我的设备</text>
			</view>

			<view class="scan_view">
				<image src="../../static/index/scan.png" class="scan" mode="widthFix" @click="scanQrcode"></image>
				<image src="../../static/index/add.png" class="back" mode="widthFix" @click="naviAdd(2)"></image>
			</view>

		</view>
		<view v-if="room_list_name.length > 0" class="device_list_title">
			<u-subsection :list="room_list_name" mode="subsection" :current="roomIndex" :fontSize="25"
				@change="sectionChange" activeColor="#28B2FF" inactiveColor="#505050"></u-subsection>
		</view>

		<view v-if="devices_show.length > 0" class="device_list_content">

			<view class="item_device_content1" v-for="(item, index) in devices_show" :key="index">
				<view class="item_device_content" @click="connectDevice(item)">
					<image v-if="!item.connect" class="device_bg" src="../../static/index/item_disconnected.jpg"
						mode="widthFix"></image>
					<image v-else class="device_bg" :src="setItemBg(item)" mode="widthFix"></image>
					<view class="device_left">
						<text class="device_name">{{ item.alias_name }}</text>
						<text class="device_location">{{ item.address }}</text>
					</view>
					<view v-if="item.count > 0 && item.connect" class="device_notice">{{ item.count }}</view>
					<image v-if="!item.connect" class="device_img1" src="../../static/index/blue_disconnected.png"
						mode="widthFix"></image>
					<image v-else class="device_img" :src="setItemVolt(item)" mode="widthFix"></image>
				</view>
			</view>
		</view>

		<view v-else class="empty_view">
			<image class="empty_image" src="../../static/index/nodata.png" mode="widthFix"></image>
			<text style="color: #666666;font-size: 30rpx;">~ 暂无设备 ~</text>
		</view>

	</view>
</template>

<script>
import u_storage from '@/common/u-storage.js'
import util from '@/common/util.js'
import http from '../../common/http.js'
import user_util from '@/common/user-util.js'
import { createBushuqiScanSession } from '@/src/modules/bushuqi/adapters/index.js'
import { getDeviceModule, hasCapability } from '@/src/app/index.js'
import {
	getLastSeen,
	setLastSeen,
	getBroadcast,
	setBroadcast,
	clearDeviceCache,
	clearDeviceBroadcast
} from '@/src/core/storage/device-cache.js'
export default {
	data() {
		return {
			custom_bar: u_storage.get_custombar(),
			status_bar: u_storage.get_statusbar(),
			scan_data: {},
			devices: [],
			devices_show: [],
			room_list: [],
			room_list_name: [],
			bannerList: [],
			isShowLogin: true,
			currentUserInfo: null,
			timer: null,
			roomIndex: 0,
			deviceStateTimer: null,
			refreshTimer: null,
			currentClickId: -1,
			isConnectDevice: false,
			isAddDevice: false,
			typeAdd: -1,
			current_device: null,
			scanKeepAliveTimer: null,  // 扫描保活定时器
			isScanning: false,  // 扫描状态标记
			isRestarting: false,  // 是否正在重启扫描（防抖）
			lastRestartTime: 0,  // 上次重启时间（节流）
			restartCount: 0,  // 连续重启次数
			lastBroadcastReceived: 0,  // 本次 onShow 后是否收到过广播
			scanSession: null,
			moduleKey: 'bushuqi',
			moduleMeta: null,
			moduleDisplayName: '智能感应灭鼠器',
			moduleCapabilities: {},
			modulePageIntegration: {}
		}
	},
	onLoad() {
		this.initModuleMeta()
		this.fetchBannerList()
	},

	onShow() {
		console.log('[BLE] onShow')
		this.isConnectDevice = false
		this.isAddDevice = false
		this.restartCount = 0  // 重置重启计数
		this.lastBroadcastReceived = 0  // 重置广播接收时间
		
		// 清除所有设备的广播缓存，以便重新计算红点和在线状态
		this.clearAllDeviceCache()
		
		if (user_util.is_login() && user_util.getUserInfo().is_admin != 1) {
			this.isShowLogin = false
			this.fetchDeviceList()
			this.fetchRoomList()
			this.checkBLEState()
			this.listenBluetoothAdapterState()
		}
	},

	onHide() {
		console.log('[BLE] onHide')
		if (!this.isConnectDevice && !this.isAddDevice) {
			this.stopDiscovery()
		}
		this.closeTimer()
		this.closeScanKeepAliveTimer()
	},

	onUnload() {
		console.log('[BLE] onUnload')
		this.stopDiscovery()
		this.closeTimer()
		this.closeScanKeepAliveTimer()
		this.destroyScanSession()
	},
	onBackPress(options) {
		// 判断是否是手势返回
		if (options.from === 'backbutton' || options.from === 'navigateBack') {
			uni.showToast({
				title: '禁止返回',
				icon: 'none'
			});
			return true; // 阻止返回
		}
		return false; // 允许返回
	},
	// 分享给朋友
	onShareAppMessage(res) {
		return {
			title: '强凡先生 - 智能生活从这里开始',
			path: '/pages/index/SelectDeviceType',
			success(res) {
				uni.showToast({
					title: '分享成功'
				});
			},
			fail(res) {
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				});
			}
		}
	},

	// 分享到朋友圈
	onShareTimeline() {
		return {
			title: '强凡先生 - 智能生活从这里开始',
			query: 'page=SelectDeviceType&id=123', // 添加页面参数,
		}
	},
	methods: {
		initModuleMeta() {
			const moduleMeta = getDeviceModule(this.moduleKey)
			if (!moduleMeta) return
			this.moduleMeta = moduleMeta
			this.moduleDisplayName = moduleMeta.displayName || this.moduleDisplayName
			this.moduleCapabilities = moduleMeta.capabilities || {}
			this.modulePageIntegration = moduleMeta.pageIntegration || {}
		},

		hasModuleCapability(capability) {
			return hasCapability(this.moduleKey, capability)
		},

		ensureScanSession() {
			if (this.scanSession) {
				this.scanSession.setFoundHandler((payload) => this.handleScanFoundPayload(payload))
				return this.scanSession
			}
			this.scanSession = createBushuqiScanSession({
				onFound: (payload) => this.handleScanFoundPayload(payload)
			})
			return this.scanSession
		},

		destroyScanSession() {
			if (!this.scanSession) return
			this.scanSession.destroy()
			this.scanSession = null
		},

		closeTimer() {
			if (this.deviceStateTimer != null) {
				clearInterval(this.deviceStateTimer)
				this.deviceStateTimer = null
			}
		},
		
		// 关闭扫描保活定时器
		closeScanKeepAliveTimer() {
			if (this.scanKeepAliveTimer != null) {
				clearInterval(this.scanKeepAliveTimer)
				this.scanKeepAliveTimer = null
			}
		},
		
		// 启动扫描保活定时器 - 定期检查并重启扫描
		startScanKeepAliveTimer() {
			let me = this
			if (this.scanKeepAliveTimer != null) {
				return
			}
			
		this.scanKeepAliveTimer = setInterval(() => {
			if (me.isRestarting) return
			
			const now = new Date().getTime()
			let hasRecentBroadcast = false
			let hasAnyBroadcastRecord = false
			
			for (let i = 0; i < me.devices_show.length; i++) {
				const lastTime = me.getStorageValue(me.devices_show[i].id, 1)
				if (lastTime && lastTime > 0) {
					hasAnyBroadcastRecord = true
					if ((now - lastTime) < 15000) {
						hasRecentBroadcast = true
						break
					}
				}
			}
			
			me.ensureScanSession().getAdapterState()
				.then((res) => {
					const available = res.available
					const discovering = res.discovering
					
					if (!available) {
						me.isScanning = false
						return
					}
					
					// 只有在扫描停止且曾经收到过广播但现在没有时才重启
					const needRestart = !discovering && 
						hasAnyBroadcastRecord && !hasRecentBroadcast
					
					if (needRestart) {
						console.log('[BLE] 保活重启扫描')
						me.forceRestartScan()
					} else if (discovering) {
						me.isScanning = true
					}
				})
				.catch((error) => {
					console.error('[BLE] 保活检查失败:', error)
				})
		}, 20 * 1000)
		},
		
		// 强制重启扫描（带防抖、节流和次数限制）
		forceRestartScan() {
			let me = this
			const now = new Date().getTime()
			
			// 节流：距离上次重启不足5秒，跳过
			if (now - me.lastRestartTime < 5000) return
			// 防抖：如果正在重启中，跳过
			if (me.isRestarting) return
			
			// 连续重启次数限制：如果已经重启3次都没收到广播，不再重启
			if (me.restartCount >= 3 && me.lastBroadcastReceived === 0) {
				// 只打印一次暂停日志
				if (me.restartCount === 3) {
					console.log('[BLE] 连续重启3次无响应，暂停')
					me.restartCount = 4  // 标记已打印过
				}
				return
			}
			
			me.restartCount++
			me.isRestarting = true
			me.lastRestartTime = now
			console.log('[BLE] 重启扫描...(' + me.restartCount + ')')
			
			me.isScanning = false

			me.ensureScanSession().stopScan().catch(() => {}).finally(() => {
				setTimeout(() => {
					me.isRestarting = false
					me.startDeviceDiscovery()
				}, 2000)
			})
		},
		
		// 监听蓝牙适配器状态变化
		listenBluetoothAdapterState() {
			let me = this

			me.ensureScanSession().startAdapterStateListener((res) => {
				if (me.isRestarting) return
				
				if (!res.available) {
					console.log('[BLE] 蓝牙不可用')
					me.isScanning = false
					me.devices_show.forEach(device => { device.connect = false })
					me.$forceUpdate()
				}
			})
		},
		naviBack() {
			uni.navigateBack()
		},
		fetchBannerList() {
			let me = this
			http.send('banner/get_list', 'GET', {
				type: 0
			}, (res) => {
				if (res.code == 0) {
					me.bannerList = res.data.banner
				}
			}, (res) => {

			})
		},

		setItemBg(item) {
			if (item.voltage == null) {
				if (item.power === 0) {
					return '../../static/index/item_nocount.png'
				} else {
					return '../../static/index/item_normal.png'
				}
			}

			if (item.voltage < 2.2) {
				return '../../static/index/item_error.png'
			} else {
				if (item.power === 0) {
					return '../../static/index/item_nocount.png'
				} else {
					return '../../static/index/item_normal.png'
				}
			}

		},

		setItemVolt(item) {
			if (item.voltage == null) {
				return '../../static/index/b5.png'
			}

			if (item.voltage > 2.9) {
				return '../../static/index/b5.png' // 2.9V-3.0V maps to 80%-100%
			} else if (item.voltage > 2.7) {
				return '../../static/index/b4.png' // 2.7V-2.9V maps to 60%-80%
			} else if (item.voltage > 2.5) {
				return '../../static/index/b3.png' // 2.5V-2.7V maps to 40%-60%
			} else if (item.voltage > 2.2) {
				return '../../static/index/b2.png' // 2.2V-2.5V maps to 20%-40%
			} else {
				return '../../static/index/b1.png'
			}

		},

		sectionChange(index) {
			this.roomIndex = index
			const room_id = this.room_list_name[index]
			if (room_id === "全部") {
				this.devices_show = this.devices
			} else {
				this.devices_show = this.devices.filter(item => item.room_id === room_id);
			}
		},
		naviLogin() {
			uni.reLaunch({
				url: "/pages/login/login"
			})
		},
		naviAdd(type) {

			if (!user_util.is_login()) {
				uni.showToast({
					title: '请先登录',
					icon: 'error'
				})
				return
			}
			this.typeAdd = type
			this.isAddDevice = true
			this.stopDiscovery()

		},

		/**
		 * 点击设备进入详情页
		 * 
		 * 红点清零逻辑:
		 *   - 点击后立即清零前端显示的红点 (item.count = 0)
		 *   - 在详情页确认后，服务器会更新 current_cnt
		 *   - 下次广播时重新计算: count = totalCount - current_cnt
		 * 
		 * @param {Object} currentItem - 点击的设备对象
		 */
		connectDevice(currentItem) {
			let me = this

			// 检查设备是否在线
			if (!currentItem.connect) {
				uni.showToast({
					title: '设备未连接，无法查看',
					icon: 'error'
				})
				return
			}

			// 清零红点显示（前端临时清零）
			currentItem.count = 0
			const devicesItem = me.devices.find(item => item.id === currentItem.id)
			if (devicesItem) devicesItem.count = 0

			// 保存当前设备信息，准备跳转
			this.currentClickId = currentItem.id
			this.current_device = currentItem
			this.isConnectDevice = true
			this.stopDiscovery()
		},

		scanQrcode() {
			let me = this
			if (!user_util.is_login()) {
				uni.showToast({
					title: '请先登录',
					icon: 'error'
				})
				return
			}

			uni.scanCode({
				scanType: ['qrCode'],
				success(res) {
					let result = res.result
					const parts = res.result.split(',')

					if (parts.length !== 2) {
						uni.showToast({
							title: "二维码长度错误",
							icon: "error"
						})
						return
					}

					let numberOfColons = parts[1].split(':').length - 1;

					if (numberOfColons == 4) {
						const mac_parts_front = parts[1].slice(0, 8)
						const mac_parts_back = parts[1].slice(-8)
						parts[1] = mac_parts_front + ':' + mac_parts_back
					}

					const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/

					if (!macRegex.test(parts[1])) {
						uni.showToast({
							title: "mac地址有误",
							icon: "error"
						})
						return
					}

					me.scan_data.name = parts[0]
					me.scan_data.mac = parts[1]

					me.naviAdd(1)
				},
				fail(res) {
					let errMsg = res.errMsg.toLowerCase()
					if (!errMsg.includes("cancel")) {
						uni.showToast({
							title: '扫码失败，请重试',
							icon: 'error'
						})
					}
				}
			});
		},
		//获取本地缓存用户信息
		checkLoginInfo() {
			if (!user_util.is_login()) {
				//未登录时显示登录控件
				this.isShowLogin = true
				this.devices = this.devices_show = []
			} else {

				if (user_util.getUserInfo().is_admin === 1) {
					//如果是管理员登录，跳转到管理员登录页面
					uni.reLaunch({
						url: "/pages/admin/index"
					})
				} else {
					this.isShowLogin = false
					this.currentUserInfo = user_util.getUserInfo()
				}
			}
		},

		updateDevice(device) {
			let me = this
			http.send('Device/update_device', 'POST', {
				device_id: device.device_id,
				mac_address_ios: device.device_mac_ios
			}, (res) => {
			})
		},

		//获取设备列表
		fetchDeviceList() {
			uni.showLoading({
				title: "数据加载中"
			})
			let me = this
			http.send('user/get_device_company_list?room_id=0', 'GET', {}, (res) => {
				uni.hideLoading()
				if (res.code == 0) {
					const serverDataList = res.data
					const now = new Date().getTime()

					// 根据时间戳判断初始在线状态，而不是保持旧状态
					me.devices_show = me.devices = serverDataList.map(item => {
						const lastTime = me.getStorageValue(item.id, 1)
						// 如果12秒内有广播记录，认为设备在线
						const isOnline = lastTime && lastTime > 0 && 
							(now - lastTime) < 12000
						return { ...item, connect: isOnline }
					})

					console.log('[BLE] 设备数:', me.devices_show.length)
					me.checkDeviceOnlineState()
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'error'
					})
				}
			}, (res) => {
				uni.hideLoading()
				uni.showToast({
					title: '获取设备列表异常',
					icon: 'error'
				})
			})
		},

		fetchRoomList() {
			let me = this
			http.send('room/get_list_company', 'GET', {}, (res) => {
				if (res.code == 0) {
					me.room_list_name = []
					me.room_list = []

					me.room_list = res.data

					if (me.room_list.length > 0) {
						me.room_list_name = me.room_list.map(item => ({ name: item.name }))
						me.room_list_name.unshift("全部")
					}

				} else {
					uni.showToast({
						title: res.msg,
						icon: 'error'
					})
				}
			}, (res) => {
				uni.showToast({
					title: '获取仓库列表异常',
					icon: 'error'
				})
			})
		},

		/**
		 * 处理蓝牙广播数据，解析捕获计数和电压
		 * 广播数据格式（后30位）:
		 *   - 第0-11位: MAC地址（iOS用于匹配）
		 *   - 第26-27位: 捕获总数（十六进制）
		 *   - 第28-29位: 电压值（十六进制，实际值/10）
		 * 
		 * 红点计数逻辑（Android/iOS通用）:
		 *   - 广播中的totalCount: 设备报告的当前气罐捕获数量
		 *   - item.current_cnt: 服务器记录的已确认数量
		 *   - item.count: 红点显示的未确认数量 = totalCount - current_cnt
		 * 
		 * @param {Object} item - 当前设备对象
		 * @param {String} data - 广播数据后30位（大写十六进制）
		 */
		dealTestData(item, data) {
			// 解析捕获总数（位置26-28，无论MAC地址是否错位，此位置固定）
			const totalCount = parseInt(data.substring(26, 28), 16)
			
			// 查找设备列表中的对应项（用于同步更新）
			const devicesItem = this.devices.find(d => d.id === item.id)
			const currentCnt = item.current_cnt || 0
			const newCount = totalCount - currentCnt
			
			// 打印调试信息
			console.log('[BLE] 红点:', item.alias_name, 
				'广播:', data,
				'总数:', totalCount, 
				'服务器:', currentCnt,
				'红点:', newCount)
			
			// 计算红点数：总捕获数 - 已确认数
			if (newCount > 0) {
				item.count = newCount
				if (devicesItem) devicesItem.count = newCount
				this.$forceUpdate()
			} else if (item.count !== 0) {
				// 如果红点应该清零，也需要更新
				item.count = 0
				if (devicesItem) devicesItem.count = 0
				this.$forceUpdate()
			}

			// 解析电压值（最后2位，十六进制，实际值=读数/10）
			// 注：如果硬件MAC错位导致电压为0，保持之前的有效值不更新
			const voltageRaw = parseInt(data.slice(-2), 16)
			if (voltageRaw > 0) {
				const voltage = parseFloat((voltageRaw / 10).toFixed(1))
				if (voltage > 0) {
					item.voltage = voltage
					if (devicesItem) devicesItem.voltage = voltage
					this.$forceUpdate()
				}
			}

			// 上报数据到服务器
			http.send('record/save', 'POST', {
				device_id: item.id,
				tmpStr: data,
				totalSum: totalCount,
				is_connect: 0,
				voltage: item.voltage
			}, () => {}, (err) => {
				console.error('[BLE] 保存记录失败')
			})
		},

		getStorageValue(id, pre_fix_type) {
			if (pre_fix_type == 1) {
				return getLastSeen(id)
			}
			if (pre_fix_type == 2) {
				return getBroadcast(id)
			}
			return ''
		},

		setStorageValue(id, pre_fix_type, value) {
			if (pre_fix_type == 1) {
				return setLastSeen(id, value)
			}
			if (pre_fix_type == 2) {
				return setBroadcast(id, value)
			}
			return null
		},

		// 清除单个设备的缓存（时间戳和广播数据）
		clearStorageValue(id) {
			clearDeviceCache(id)
		},

		clearDeviceState() {
			for (var i = 0; i < this.devices_show.length; i++) {
				//从内存中取出值
				this.clearStorageValue(this.devices_show[i].id)
			}
		},
		
		// 清除所有设备缓存并重置在线状态
		clearAllDeviceCache() {
			for (let i = 0; i < this.devices_show.length; i++) {
				clearDeviceBroadcast(this.devices_show[i].id)
			}
		},

		checkDeviceOnlineState() {
			let me = this
			if (this.deviceStateTimer != null) return
			
			this.deviceStateTimer = setInterval(() => {
				if (me.isRestarting) return
				
				const now = new Date().getTime()
				let hasRecentBroadcast = false
				let hasAnyBroadcastRecord = false
				
				// 先检查并更新所有设备的在线状态
				let newOfflineDevices = []
				let newOnlineDevices = []

				for (var i = 0; i < me.devices_show.length; i++) {
					const lastBroadcastTime = me.getStorageValue(
						me.devices_show[i].id, 1)

					if (!lastBroadcastTime || lastBroadcastTime === 0) {
						if (me.devices_show[i].connect === true) {
							me.devices_show[i].connect = false
							var devices_item = me.devices.find(
								item => item.id === me.devices_show[i].id)
							if (devices_item) devices_item.connect = false
							newOfflineDevices.push(me.devices_show[i].alias_name)
						}
						continue
					}

					hasAnyBroadcastRecord = true
					const secondsDiff = (now - lastBroadcastTime) / 1000

					if (secondsDiff > 12) {
						if (me.devices_show[i].connect === true) {
							newOfflineDevices.push(me.devices_show[i].alias_name)
							me.devices_show[i].connect = false
							var devices_item = me.devices.find(
								item => item.id === me.devices_show[i].id)
							if (devices_item) devices_item.connect = false
						}
					} else {
						hasRecentBroadcast = true
						if (me.devices_show[i].connect === false) {
							newOnlineDevices.push(me.devices_show[i].alias_name)
							me.devices_show[i].connect = true
							var devices_item = me.devices.find(
								item => item.id === me.devices_show[i].id)
							if (devices_item) devices_item.connect = true
						}
					}
				}

				// 如果有状态变化，更新UI并输出日志
				if (newOfflineDevices.length > 0 || newOnlineDevices.length > 0) {
					me.$forceUpdate()
					if (newOfflineDevices.length > 0) {
						console.log('[BLE] 离线:', newOfflineDevices.join(', '))
					}
					if (newOnlineDevices.length > 0) {
						console.log('[BLE] 上线:', newOnlineDevices.join(', '))
					}
				}

				// 所有设备都没有最近的广播时，尝试重启扫描
				if (hasAnyBroadcastRecord && !hasRecentBroadcast) {
					me.forceRestartScan()
				}

			}, 8 * 1000)
		},

		//检查蓝牙的状态
		checkBLEState() {
			let me = this
			me.ensureScanSession()
				.ensureAdapterReady()
				.then(() => {
					console.log('[BLE] 适配器已就绪')
					me.startDeviceDiscovery()
					me.startScanKeepAliveTimer()
				})
				.catch((error) => {
					me.ensureScanSession().getAdapterState().then((res) => {
						if (res.available) {
							me.startDeviceDiscovery()
							me.startScanKeepAliveTimer()
						} else {
							console.error('[BLE] 蓝牙不可用', error)
						}
					}).catch((err) => {
						console.error('[BLE] 状态检查失败:', err)
					})
				})
		},

		startDeviceDiscovery() {
			let me = this
			if (me.isScanning) return

			const session = me.ensureScanSession()
			session.clearDiscoveredDevices()

			session.startScan({
				allowDuplicatesKey: true
			}).then(() => {
				console.log('[BLE] 扫描已启动')
				me.isScanning = true
			}).catch((err) => {
				if (err && err.errMsg && err.errMsg.includes('already discovering')) {
					me.isScanning = true
				} else {
					console.error('[BLE] 扫描启动失败:', err && err.errCode, err && err.errMsg)
					me.isScanning = false
				}
			})
		},

		handleScanFoundPayload(payload) {
			let me = this
			const { device, deviceId, platform, parsedBroadcast } = payload
			const broadcastData = (parsedBroadcast && parsedBroadcast.payloadHex) || ''

			if (!broadcastData || broadcastData.length < 30 || !parsedBroadcast.valid) {
				return
			}

			let matchedDevice = null

			if (platform === 'ios') {
				let macAddress = (parsedBroadcast.macAddress || '').toUpperCase()
				if (macAddress.startsWith('00')) {
					macAddress = util.changeMacAddress(macAddress)
				}

				matchedDevice = me.devices_show.find(item =>
					(item.mac_address?.toUpperCase() === macAddress) ||
					(item.mac_address_ios?.toUpperCase() === macAddress)
				)

				if (!matchedDevice) {
					return
				}

				if (matchedDevice.mac_address_ios !== deviceId) {
					matchedDevice.mac_address_ios = deviceId
					me.updateDevice(matchedDevice)
				}
			} else {
				const macAddress = (deviceId || '').toUpperCase()
				matchedDevice = me.devices_show.find(item =>
					(item.mac_address?.toUpperCase() === macAddress) ||
					(item.mac_address_ios?.toUpperCase() === macAddress)
				)
				if (!matchedDevice) return
			}

			const wasOffline = !matchedDevice.connect
			matchedDevice.connect = true

			const listDevice = me.devices.find(item => item.id === matchedDevice.id)
			if (listDevice) listDevice.connect = true

			me.lastBroadcastReceived = new Date().getTime()
			me.restartCount = 0
			if (wasOffline) {
				console.log('[BLE] 设备上线:', matchedDevice.alias_name)
			}

			const lastBroadcast = me.getStorageValue(matchedDevice.id, 2)
			const curTime = new Date().getTime()
			me.setStorageValue(matchedDevice.id, 1, curTime)

			if (lastBroadcast === broadcastData) {
				return
			}

			me.setStorageValue(matchedDevice.id, 2, broadcastData)
			me.dealTestData(matchedDevice, broadcastData)
		},

		//停止查找蓝牙设备
		stopDiscovery() {
			let me = this
			me.isScanning = false

			const afterStop = () => {
				if (me.isConnectDevice) {
					const systemInfo = uni.getSystemInfoSync()
					let deviceId = me.current_device.mac_address
					if (systemInfo.platform === 'ios') {
						deviceId = me.current_device.mac_address_ios
					}
					uni.navigateTo({
						url: '/pages/index/device/detailNew?id='
							+ me.current_device.id + "&mac=" + deviceId
					})
				}

				if (me.isAddDevice) {
					var curUrl = '/pages/index/device/add?type=' + me.typeAdd
					if (me.typeAdd == 1) {
						curUrl += "&data=" + JSON.stringify(me.scan_data)
					}
					uni.navigateTo({
						url: curUrl
					})
				}
			}

			me.ensureScanSession().stopScan()
				.then(() => {
					afterStop()
				})
				.catch((error) => {
					console.error('[BLE] 停止扫描失败:', error)
					afterStop()
				})
		},
	}
}
</script>

<style lang="scss">
page {}

.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	padding-bottom: 30rpx;
}

button::after {
	border: none;
}

.login_bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 750rpx;
	height: 444rpx;
	background-color: #28B2FF;
	border-bottom-left-radius: 50rpx;
	border-bottom-right-radius: 50rpx;
	z-index: -1;
}

.navBarBox {
	display: flex;
	flex-direction: column;
	top: 0px;
	width: 100%;
	z-index: 9999;
	background-color: #28B2FF;
}

.navBarBox .statusBar {
	width: 100%;
}

.navBarBox .navBar {
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	text-align: center;
	position: relative;
	justify-content: center;
}

.back_view {
	width: 80rpx;
	position: absolute;
	left: 20rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 80rpx;
}

.back_img {
	width: 25rpx;
}

.scan_view {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.scan {
	width: 60rpx;
	height: 60rpx;
}

.nav_title {
	font-size: 36rpx;
	font-weight: 800;
	color: white;
	font-family: "PingFang SC";
}

.swiper {
	display: flex;
	height: 320rpx;
	margin-top: 20rpx;
	border-radius: 10rpx;
	width: 690rpx;
	z-index: 100;
}

.swiper .swiper-item {
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
	position: relative;
}

.swiper-item .swiper-image {
	width: 100%;
	height: 320rpx !important;
	border-radius: 10rpx;
	top: 0rpx;
	position: absolute;
}

.view_notice {
	background-color: #FDFFDF;
	margin-top: 30rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
	width: calc(100% - 60rpx);
	border-radius: 90rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.notice_img {
	width: 30rpx;
	height: 30rpx;
	margin-left: 20rpx;
}

.notice_text {
	padding: 15rpx 0 15rpx 0;
	margin-left: 10rpx;
	font-size: 26rpx;
	line-height: 40rpx;
	color: #28B2FF;
	font-family: "PingFang SC";
	font-weight: bold;
}

.device_list_top {
	margin-top: 30rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
	width: calc(100% - 60rpx);
	height: 64rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.device_list_title {
	margin-top: 30rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
	width: calc(100% - 60rpx);
}

.top_left {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.front {
	width: 64rpx;
	height: 64rpx;
}

.top_content {
	margin-left: 20rpx;
	font-size: 36rpx;
	line-height: 40rpx;
	font-family: "PingFang SC";
	font-weight: bold;
	color: #505050;

}

.back {
	width: 75rpx;
	height: 78rpx;
	margin-left: 20rpx;
}

.device_list_content {
	margin-top: 30rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
	width: calc(100% - 60rpx);
	// height: 100%;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-gap: 30rpx;
}


.item_device_content1 {
	width: 320rpx;
	height: 180rpx;
}

.item_device_content {
	width: 320rpx;
	height: 180rpx;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	position: relative;
}

.device_bg {
	position: absolute;
	width: 320rpx;
	height: 180rpx;
	z-index: -1;
}

.device_left {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-left: 10rpx;
	margin-top: 50rpx;
	height: 100rpx;
	justify-content: space-between;
	overflow: hidden;
	// white-space: nowrap;
	text-overflow: ellipsis;
	/* 显示省略号 */
}

.device_name {
	margin-top: 10rpx;
	font-size: 25rpx;
	line-height: 40rpx;
	font-family: "PingFang SC";
	font-weight: bold;
	color: #000;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	/* 限制文本显示的行数 */
}

.device_location {
	font-size: 26rpx;
	line-height: 40rpx;
	font-family: "PingFang SC";
	font-weight: 300;
	color: #000;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	/* 限制文本显示的行数 */
}

.device_right {
	display: flex;
	width: 50rpx;
	margin-left: 10rpx;
	flex-direction: column;
	margin-right: 10rpx;
	margin-top: 10rpx;
	height: 100rpx;

	position: relative;
}

.device_notice {
	width: 30rpx;
	height: 30rpx;
	background-color: #FF0000;
	color: white;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 20rpx;
	line-height: 40rpx;
	font-family: "PingFang SC";
	font-weight: 600;
	right: -10rpx;
	top: -10rpx;
	position: absolute;
}

.device_img1 {
	position: absolute;
	right: 10rpx;
	top: 10rpx;
	width: 50rpx;
}

.device_img {
	width: 50rpx;
	height: 28rpx;
	position: absolute;
	right: 20rpx;
	top: 20rpx;
}

.view_end {
	position: fixed;
	bottom: 10rpx;
	left: 30rpx;
	background-color: rgba(16, 16, 16, 0.9);
	width: calc(100% - 60rpx);
	height: 80rpx;
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
}

.empty_view {
	width: 100%;
	// height: 300rpx;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.empty_image {
	width: calc(50%);
	height: auto;
}
</style>
