<template>
	<view class="content">
		<view class="login_bg"></view>
		<view class="navBarBox" :style="{height: custom_bar + 'px'}">
			<view class='statusBar' :style="{height: status_bar + 'px'}"></view>
			<view class="navBar">
				<view class="back_view" @click="back">
					<image class="navi_back" src="../../../static/back.png" mode="widthFix"></image>
				</view>
				<view class="nav_title">{{ moduleDisplayName }}详情</view>
			</view>
		</view>

		<!-- 顶部信息 -->
		<view class="content_top">
			<view class="top_left">
				<text v-if="currentDevice != null" class="device_name">{{currentDevice.alias_name}}</text>
				<text
					v-if="currentDevice != null &&  currentDevice.room_name!=null &&currentDevice.room_name.length > 0"
					class="device_location">{{currentDevice.room_name}}</text>
				<text v-if="currentDevice != null" class="device_location">{{currentDevice.address}}</text>
			</view>
			<image src="../../../static/index/edit.png" class="top_edit" @click="naviEdit()"></image>
		</view>

		<view class="view_notice">
			<image src="../../../static/index/notice_warn.png" class="notice_img" mode="widthFix"></image>
			<text class="notice_text">更换气罐/新增设备时需要打开计数开关才能计数</text>
		</view>

		<!-- 设备信息 -->
		<view class="device_detail">
			<view class="detail_title1">

				<view class="detail_left">
					<view class="detail_title_img"></view>
					<text class="detail_title_text">设备信息</text>
				</view>

			</view>

			<view v-if="connectState" class="detail_info">
				<text class="info_title">计数开关</text>
				<view class="info_content">
					<u-switch v-model="deviceFlag" @change="deviceStateClick" activeColor="#28B2FF"
						size="38"></u-switch>
				</view>
			</view>

			<view v-if="connectState" class="info_divider"></view>

			<view class="detail_info">
				<text class="info_title">当前电量</text>
				<text v-if="currentDevice == null || currentDevice.voltage ==null || currentDevice.voltage.length === 0"
					class="info_content">100%</text>
				<text v-else class="info_content">{{batteryPercentage(currentDevice.voltage)}}</text>
			</view>

			<view class="info_divider"></view>

			<view class="detail_info">
				<text class="info_title">历史捕捉数量（个）</text>
				<text class="info_content">{{currentDevice.total_cnt}}</text>
			</view>

			<view class="info_divider"></view>
			<view class="detail_info">
				<text class="info_title">当前气罐捕捉数量（个）</text>
				<text class="info_content">{{currentDevice.current_cnt}}</text>
			</view>

			<!-- <view class="info_divider"></view>
			
			<view class="detail_info">
				<text class="info_title">当前温度（°C）</text>
				<text class="info_content">{{currentDevice.temperature}}</text>
			</view> -->

			<view class="info_divider"></view>

			<view class="detail_info">
				<text class="info_title">蓝牙地址</text>
				<text class="info_content">{{currentDevice.mac_address}}</text>
			</view>

		</view>

		<!-- 设备工作日志 -->
		<view class="device_detail">
			<view class="detail_title">
				<view class="detail_title_img"></view>
				<text class="detail_title_text">设备工作日志</text>
			</view>

			<view style="margin-top: 20rpx;"></view>
			<scroll-view scroll-y="true" style="height: 400rpx;">
				<view v-for="(item,index) in recordList" :key="index" class="item_record_content">
					<view v-if="item.type == 1" class="item_record_content1">
						<text class="item_record_text2">{{getTime(item.time_add)}}</text>
						<text class="item_record_text">更换气罐</text>
					</view>

					<view v-else class="item_record_content1">
						<text class="item_record_text2">{{getTime(item.time_record)}}</text>
						<text class="item_record_text1">灭杀成功</text>
						<text class="item_record_text1">环境温度{{item.temperature}}°C</text>
					</view>
				</view>
			</scroll-view>
			<view class="list_end" @click="naviLog">
				<text class="list_end_text">查看更多</text>
				<image src="../../../static/index/table_more_arrow.png" class="list_end_img"></image>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="content_bottom">
			<button class="bottom_btn_left" @click="changeBatteryCmd">更换气罐</button>
			<button class="bottom_btn_right" @click="deviceDelete">删除设备</button>
		</view>

		<u-popup :safeAreaInsetBottom="true" :safeAreaInsetTop="true" :overlayStyle="{background: 'rgba(0, 0, 0, 0.7)'}"
			:mode="popupData.mode" :show="deleteShow" :overlay="popupData.overlay" :customStyle="pop_style_delete">
			<view class="u-popup-slot_delete">
				<image class="bottom_img" src="../../../static/index/need_delete_device.png"></image>
				<text class="bottom_text">确认删除设备</text>
				<text>删除设备后数据将被清除</text>

				<view class="popup_bottom">
					<button class="btn_popup_cancel" @click="deleteShow = !deleteShow">取消</button>
					<button class="btn_popup_confirm" @click="deleteConfirm">确认</button>
				</view>

			</view>
		</u-popup>

		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import u_storage from '@/common/u-storage.js'
	import http from '@/common/http.js'
	import util from '@/common/util.js'
	import userUtil from '../../../common/user-util'
	import toast from '../../../uni_modules/uview-ui/libs/config/props/toast'
	import { getAdapterState } from '@/src/core/ble/adapter.js'
	import { getBleUuidsByModule } from '@/src/shared/constants/ble-uuids.js'
	import { getDeviceModule, hasCapability } from '@/src/app/index.js'
	import { createBushuqiDeviceSession } from '@/src/modules/bushuqi/adapters/index.js'
	import {
		buildReadTimeCommand,
		buildCalibrateTimeCommand,
		buildReadDeviceStateCommand,
		buildWriteDeviceStateCommand,
		buildQueryRecordSummaryCommand,
		buildQueryRecordDetailCommand,
		buildClearRecordCommand
	} from '@/src/modules/bushuqi/protocol/command-builder.js'
	export default {
		data() {
			return {
				custom_bar: u_storage.get_custombar(),
				status_bar: u_storage.get_statusbar(),
				recordList: [],
				deleteShow: false,
				popupData: {
					overlay: true,
					mode: 'center',
					closeable: true,
					closeOnClickOverlay: true
				},
				pop_style_delete: {
					FontFamily: "PingFang SC",
					fontSize: "28rpx",
					FontWeight: 400,
					FontColor: "#28282C",
					borderRadius: "10rpx",
					width: "520rpx",
					height: "356rpx"
				},
				currentId: -1,
				currentDevice: null,
				deviceId: -1,
				serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
				characteristicWriteId: "0000FFF3-0000-1000-8000-00805F9B34FB",
				characteristicReadId: "0000FFF4-0000-1000-8000-00805F9B34FB",
				characteristicNotifyId: "0000FFF4-0000-1000-8000-00805F9B34FB",
				connectState: false,
				isShowLoading: false,
				deviceFlag: false,
				deviceTmpFlag: false,
				tmpCommandList: [],
				device_record_count: 0,
				process_count: 0,
				//0表示计数按钮，1表示更换气罐，2表示删除设备
				countFlag: -1,
				clearFlag: false, //引入这个参数是因为发现硬件会重复发送清空数据的指令
				reconnecting: false,
				isExit: false,
				isNotFinish: true,
				bleUuids: getBleUuidsByModule('bushuqi'),
				bleSession: null,
				stopBleConnectionListener: null,
				stopBleValueListener: null,
				moduleKey: 'bushuqi',
				moduleMeta: null,
				moduleDisplayName: '设备',
				moduleCapabilities: {},
				modulePageIntegration: {}
			}
		},

		onLoad(option) {
			this.initModuleMeta()
			this.currentId = option.id
			this.deviceId = option.mac
			this.serviceId = this.bleUuids.serviceId
			this.characteristicWriteId = this.bleUuids.characteristicWriteId
			this.characteristicReadId = this.bleUuids.characteristicReadId
			this.characteristicNotifyId = this.bleUuids.characteristicNotifyId
			console.log('======捕鼠器详情加载生命周期接收的参数是=====currentId=', this.currentId, "===deviceId", this.deviceId)
			//每次重新加载时，将个数清空，重新获取
			this.device_record_count = 0
			this.process_count = 0
			this.reconnecting = false
		},

		onShow() {
			this.isExit = false
			this.fetchDeviceDetail()
			this.fetchRecordList()
			this.checkBLEState()
		},

		onUnload() {
			console.log('======详情卸载======')
			this.isExit = false
			this.cleanupBleListeners()
			this.clearBle()
			this.destroyBleSession()
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

			ensureBleSession() {
				if (this.bleSession) {
					this.bleSession.setDeviceId(this.deviceId)
					return this.bleSession
				}
				this.bleSession = createBushuqiDeviceSession({
					deviceId: this.deviceId,
					uuids: this.bleUuids
				})
				return this.bleSession
			},

			cleanupBleListeners() {
				if (this.stopBleConnectionListener) {
					this.stopBleConnectionListener()
					this.stopBleConnectionListener = null
				}
				if (this.stopBleValueListener) {
					this.stopBleValueListener()
					this.stopBleValueListener = null
				}
			},

			destroyBleSession() {
				if (!this.bleSession) return
				this.bleSession.destroy()
				this.bleSession = null
			},

			deviceStateClick(e) {
				console.log("点击事件返回：", e)
				this.deviceTmpFlag = e
				this.countFlag = 0
				console.log(e ? "发送开启设备状态指令" : "发送关闭设备状态指令")
				this.send(buildWriteDeviceStateCommand(e))

			},
			clearBle() {
				let me = this
				this.connectState = false
				// this.isExit = false
				uni.showLoading({
					title: "设备断开中..."
				})

				this.isShowLoading = true

				//断开设备连接
				this.deviceDisconnected()
			},

			batteryPercentage(voltage) {
				var percent = 0
				if (voltage >= 3.0) {
					percent = 100;
				} else if (voltage > 2.9) {
					percent = 80 + (voltage - 2.9) * 200; // 2.9V-3.0V maps to 80%-100%
				} else if (voltage > 2.7) {
					percent = 60 + (voltage - 2.7) * 100; // 2.7V-2.9V maps to 60%-80%
				} else if (voltage > 2.5) {
					percent = 40 + (voltage - 2.5) * 100; // 2.5V-2.7V maps to 40%-60%
				} else if (voltage > 2.2) {
					percent = 20 + (voltage - 2.2) * 66.67; // 2.2V-2.5V maps to 20%-40%
				} else if (voltage > 2.0) {
					percent = (voltage - 2.0) * 100; // 2.0V-2.2V maps to 0%-20%
				}
				return percent.toFixed(0) + "%"
			},

			back() {
				console.log("返回事件触发")
				this.isExit = true
				this.clearBle()
			},
			naviLog() {
				uni.navigateTo({
					url: '/pages/index/device/log?id=' + this.currentDevice.id+"&flag=1"
				})
			},
			naviEdit() {

				uni.navigateTo({
					url: '/pages/index/device/edit?id=' + this.currentDevice.id +
						'&name=' + this.currentDevice.alias_name +
						'&address=' + this.currentDevice.address +
						'&roomName=' + this.currentDevice.room_name +
						'&roomId=' + this.currentDevice.room_id
				})
			},
			getTime(timestamp) {
				return util.formatTime(timestamp)
			},

			changeBatteryCmd() {
				if (!this.connectState) {
					// this.$refs.uToast.show({
					// 	message: "蓝牙未连接,稍后再试",
					// 	type: 'error',
					// 	icon: false
					// })
					return
				}
				this.countFlag = 1

				uni.showLoading({
					title: "计数重置中..."
				})
				this.isShowLoading = true

				//首先发送关闭计数开关命令
				this.send(buildWriteDeviceStateCommand(false))

			},

			resetBatteryCmd() {

				uni.showLoading({
					title: "数据重置中..."
				})

				//发送更换气罐命令
				this.send(buildClearRecordCommand())

				this.isShowLoading = true
			},

			//更换气罐
			changeBattery() {
				let me = this
				//清除设备数据
				me.currentDevice.broadcastStr = ''
				me.process_count = 0
				me.device_record_count = 0
				//清空气罐之后将列表清空
				me.tmpCommandList = []

				http.send('device/change_pump', 'POST', {
					id: this.currentId,
				}, (res) => {
					if (res.code == 0) {
						console.log("更换气罐返回数据为:", res.data)
						// 创建一个Date对象以获取当前时间
						const currentDate = new Date();

						// 获取年、月、日、时和分
						const year = currentDate.getFullYear();
						const month = currentDate.getMonth() + 1; // 月份从0开始，所以要加1
						const day = currentDate.getDate();
						const hours = currentDate.getHours();
						const minutes = currentDate.getMinutes();
						const seconds = currentDate.getSeconds();

						// 创建一个新的Date对象，以便获取年月日时分的时间戳
						const timestamp = new Date(year, month - 1, day, hours, minutes).getTime()
						console.log("，当前的时间戳为：", timestamp)
						//此时时间不准，需要校对，发送给设备校对时间
						//发送数据到客户端
						const command = buildCalibrateTimeCommand(new Date(year, month - 1, day, hours, minutes, 0))
						console.log("更换气罐上传成功后，主动发送当前时间校准，发送校准指令：", command)
						me.send(command)

						//清除保存的信息
						userUtil.clearStorageDeviceValue(me.currentId)

						uni.showToast({
							icon: 'success',
							title: "数据重置完成"
						})
						//断开连接的蓝牙设备
						me.isExit = true
						me.clearBle()

					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '更换异常',
						icon: 'error'
					})
				})
			},
			deviceDelete() {
				this.deleteShow = true
			},

			deviceStatusChange() {
				let me = this
				var status = 0
				if (this.deviceFlag) {
					status = 1
				}
				console.log("===============上传服务器status的值为：", status)
				http.send('device/change_power_status', 'POST', {
					id: this.currentId,
					status: status
				}, (res) => {
					if (res.code == 0) {
						//此时不需要再次获取接口
						console.log("改变设备状态返回数据为:", res.data)
						// me.fetchDeviceDetail()
					}
				}, (res) => {

				})

			},

			//确认删除设备按钮
			deleteConfirm() {

				if (!this.connectState) {
					// this.$refs.uToast.show({
					// 	message: "蓝牙未连接,稍后再试",
					// 	type: 'error',
					// 	icon: false
					// })
					this.deleteShow = false
					return
				}

				// uni.showLoading({
				// 	title:"删除设备中..."
				// })
				let me = this
				this.countFlag = 2

				uni.showLoading({
					title: "计数重置中..."
				})

				//首先发送关闭计数开关命令
				this.send(buildWriteDeviceStateCommand(false))

				this.isShowLoading = true
			},

			deleteFromServer() {
				let me = this
				//清除保存的信息
				userUtil.clearStorageDeviceValue(me.currentId)
				this.tmpCommandList = []
				//服务器同步删除设备信息
				http.send('user/delete_device', 'POST', {
					device_id: this.currentId,
				}, (res) => {
					if (res.code == 0) {
						console.log("删除设备返回数据为:", res.data)

						uni.showToast({
							title: "删除成功",
							icon: "success"
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}

					me.isExit = true
					me.clearBle()
				}, (res) => {
					uni.showToast({
						title: '删除信息异常',
						icon: 'error'
					})
					me.isExit = true
					me.clearBle()
				})
			},

			fetchRecordList() {
				let me = this
				http.send('record/get_list', 'GET', {
					device_id: this.currentId,
					page: 1,
					page_size: 10
				}, (res) => {
					if (res.code == 0) {
						me.recordList = res.data
						console.log("=====获取捕鼠器日志数据为:", me.recordList)
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '获取信息异常',
						icon: 'error'
					})
				})
			},
			fetchDeviceDetail() {
				let me = this
				http.send('Device/get_device_info', 'GET', {
					id: this.currentId
				}, (res) => {
					if (res.code == 0) {
						var broadcastStr = ''
						if (me.currentDevice != null) {
							broadcastStr = me.currentDevice.broadcastStr
						}

						me.currentDevice = res.data
						console.log("====获取捕鼠器详情数据为:", me.currentDevice)
						//广播的值保存好
						me.currentDevice.broadcastStr = broadcastStr
						//获取当前服务器的个数
						const current_cnt = res.data.current_cnt
						me.process_count = current_cnt > 1 ? current_cnt - 1 : 0
						if (me.currentDevice.power == 1) {
							me.deviceFlag = true
						} else {
							me.deviceFlag = false
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '获取信息异常',
						icon: 'error'
					})
				})
			},

			searchData() {
				console.log("===================开启查询设备数据操作=====================")
				this.notify()
				this.send(buildReadTimeCommand())
				this.send(buildReadDeviceStateCommand())
				this.send(buildQueryRecordSummaryCommand())
			},

			//获取蓝牙服务
			getDeviceService() {
				const me = this
				const session = this.ensureBleSession()
				setTimeout(() => {
					session.getServices().then((res) => {
							console.log("===获取捕鼠器设备服务返回值：", res)
							me.getCharacteristics()
					}).catch((err) => {
						console.error("设备服务返回失败：", err)
					})
				}, 500)
			},

			//获取蓝牙的特征数据
			getCharacteristics() {
				const me = this
				const session = this.ensureBleSession()
				setTimeout(() => {
					session.getCharacteristics().then((res) => {
							console.log("====获取捕鼠器设备特征值返回成功：", res)
							me.searchData()
							uni.showToast({
								title: "蓝牙连接成功",
								icon: "success"
							})
					}).catch((err) => {
						console.error("特征值返回失败：", err)
					})
				}, 500)
			},

			listenBleState() {
				const me = this
				const session = this.ensureBleSession()
				if (this.stopBleConnectionListener) return
				this.stopBleConnectionListener = session.startConnectionListener((res) => {
					// 该方法回调中可以用于处理连接意外断开等异常情况
					console.log(`监听设备 ${res.deviceId} 的状态发生改变，当前连接状态为: ${res.connected}`)
					me.connectState = res.connected

					if (!res.connected && !me.reconnecting) {
						console.log("=====设备状态为断开，重新连接=====");
						me.reconnecting = true;
						session.reconnect().then(() => {
								console.log("=====重连设备成功=====");
								me.reconnecting = false;
						}).catch(() => {
							console.log("=====重连设备失败=====");
							me.reconnecting = false;
						})
					}
				})
			},

			connectDevice() {
				const me = this
				const session = this.ensureBleSession()
				session.connect().then((res) => {
						console.log("======捕鼠器设备连接成功，返回数据：", res)
						me.connectState = true
						me.listenBleState()
						me.getDeviceService()
						if (me.isShowLoading) {
							uni.hideLoading()
							me.isShowLoading = false
						}
				}).catch((error) => {
						if (error.errCode == -1) {
							//此时表明设备已连上
							me.connectState = true
							me.searchData()
							if (me.isShowLoading) {
								uni.hideLoading()
								me.isShowLoading = false
							}
						}
						console.log("连接失败，失败原因：", error)
				})
			},

			//开启消息监听
			notify() {
				const me = this
				const session = this.ensureBleSession()
				session.enableNotify().then((res) => {
						console.log("====监听设备消息返回成功：", res)
						me.notifyData()
				}).catch((err) => {
					console.error("====监听设备消息返回失败：", err)
				})
			},

			//检查蓝牙的状态
			checkBLEState() {
				const me = this
				getAdapterState().then((res) => {
					console.log('======获取蓝牙适配器状态返回数据：', res)
					if (res.available) {
						me.isConnectBle = true
						me.connectDevice()
					}
				}).catch((error) => {
					console.log("当前蓝牙返回错误：" + error)
				})
			},

			notifyData() {
				const session = this.ensureBleSession()
				if (this.stopBleValueListener) return
				this.stopBleValueListener = session.startResponseListener(({ parsed, rawHex }) => {
					this.handleParsedResponse(parsed, rawHex)
				})
			},

			handleParsedResponse(parsed, rawHex) {
				if (!parsed || parsed.valid === false) {
					console.log('====接收蓝牙设备无效数据：', rawHex)
					return
				}

				console.log("====接收蓝牙设备结构化返回数据为：", parsed)

				switch (parsed.type) {
					case 'time.read': {
						const { year, month, day, hour, minute } = parsed.payload
						const timestampDevice = new Date(year, month - 1, day, hour, minute).getTime()
						const now = new Date()
						const timestamp = new Date(
							now.getFullYear(),
							now.getMonth(),
							now.getDate(),
							now.getHours(),
							now.getMinutes()
						).getTime()
						if (timestampDevice != timestamp) {
							this.send(buildCalibrateTimeCommand(new Date()))
						}
						break
					}
					case 'record.new_hint': {
						const command = buildQueryRecordDetailCommand(this.device_record_count)
						this.device_record_count += 1
						this.send(command)
						break
					}
					case 'record.summary': {
						const record_count = parsed.payload.totalRecordCount
						if (record_count == null) return
						console.log("==设备当前一共：" + this.device_record_count + "条数据，当前传到了第" + this.process_count + "条数据")
						this.device_record_count = record_count
						if (record_count == this.tmpCommandList.length) {
							return
						}
						const broadcastStr = this.currentDevice ? this.currentDevice.broadcastStr : ''
						if (broadcastStr == parsed.frameHex) {
							return
						}
						for (let i = this.process_count; i < record_count; i++) {
							let sendCommand = buildQueryRecordDetailCommand(i)
							if (this.tmpCommandList.indexOf(sendCommand) == -1) {
								this.send(sendCommand)
								return
							}
						}
						break
					}
					case 'record.detail': {
						const detail = parsed.payload || {}
						if (!detail.valid) return
						let curCommand = buildQueryRecordDetailCommand(detail.index)
						if (this.tmpCommandList.indexOf(curCommand) != -1) return
						var dataList = []
						var item = {}
						item.voltage = detail.voltage
						item.temperature = detail.temperature
						item.time = detail.timestampSec
						dataList.push(item)
						let me = this
						http.send('record/save', 'POST', {
							device_id: me.currentDevice.id,
							tmpStr: parsed.frameHex,
							totalSum: 1,
							is_connect: 1,
							voltage: detail.voltage,
							list: JSON.stringify(dataList)
						}, (res) => {
							if (res.code == 0) {
								console.log("==设备记录上传成功返回数据为:", res)
								me.fetchDeviceDetail()
								me.fetchRecordList()
							}
						}, (err) => {
							console.log("==设备记录上传失败返回数据为:", err)
						})
						this.process_count++
						this.tmpCommandList.push(curCommand)
						if (detail.index < this.device_record_count - 1) {
							let sendCommand = buildQueryRecordDetailCommand(detail.index + 1)
							if (this.tmpCommandList.indexOf(sendCommand) == -1) {
								setTimeout(() => {
									this.send(sendCommand)
								}, 500)
							}
						}
						break
					}
					case 'record.clear.ack': {
						if (this.clearFlag) return
						if (this.isShowLoading) {
							uni.hideLoading()
							this.isShowLoading = false
						}
						if (parsed.payload.success) {
							this.clearFlag = true
							if (this.countFlag == 1) {
								this.changeBattery()
							} else if (this.countFlag == 2) {
								this.deleteFromServer()
							}
						} else {
							uni.showToast({
								title: "重置数据失败",
								icon: "error"
							})
						}
						break
					}
					case 'device.state.read': {
						this.deviceFlag = !!parsed.payload.enabled
						break
					}
					case 'device.state.write.ack': {
						if (this.isShowLoading) {
							uni.hideLoading()
							this.isShowLoading = false
						}
						if (parsed.payload.success) {
							uni.showToast({
								title: "状态更改成功",
								icon: "success"
							})
							switch (this.countFlag) {
								case 0:
									this.deviceFlag = this.deviceTmpFlag
									this.deviceStatusChange()
									break
								case 1:
									this.deviceFlag = false
									this.deviceStatusChange()
									this.resetBatteryCmd()
									break
								case 2:
									this.deviceFlag = false
									this.deviceStatusChange()
									this.resetBatteryCmd()
									break
							}
						}
						break
					}
					default:
						// 待业务确认的响应类型先保留日志，避免误解析导致行为回归
						console.log('==detail==未处理的协议响应：', parsed.type, parsed.frameHex)
						break
				}
			},

			hexStringToByteArray(hexString) {
				const bytes = [];
				for (let i = 0; i < hexString.length; i += 2) {
					console.log("发送蓝牙设备数据转化为:", parseInt(hexString.substr(i, 2), 16))
					bytes.push(parseInt(hexString.substr(i, 2), 16))
				}
				return new Uint8Array(bytes)
			},

			//发送数据
			send(data) {
				console.log("=====向捕鼠器设备发送数据为:", data)
				const session = this.ensureBleSession()
				return session.sendHexCommand(data).then((res) => {
					console.log("====发送数据返回值：", res)
					if (this.characteristicReadId != -1) {
						this.receive()
					}
				}).catch((err) => {
					console.log("====发送数据返回失败", err)
				})
			},

			//接收数据
			receive() {
				const session = this.ensureBleSession()
				return session.readCharacteristic().then((res) => {
					console.log('====接收返回数据成功', res);
				}).catch((err) => {
					console.log("====接收返回数据失败：", err)
				})
			},

			ab2hex(buffer) {
				const hexArr = Array.prototype.map.call(
					new Uint8Array(buffer),
					function(bit) {
						return ('00' + bit.toString(16)).slice(-2)
					}
				)
				return hexArr.join('')
			},

			deviceDisconnected() {
				console.log("==============调用设备断开连接的方法！=================")
				let me = this
				const session = this.ensureBleSession()
				this.cleanupBleListeners()
				session.disconnect().then((res) => {
						console.log("==============调用设备断开连接的成功=================，", res,me.isExit)
						if (me.isShowLoading) {
							uni.hideLoading()
							me.isShowLoading = false
						}

						if (me.isExit) {
							uni.navigateBack({
								delta: 1
							})
						}
				}).catch((err) => {
						console.log("断开连接失败返回数据：", err)

						if (me.isShowLoading) {
							uni.hideLoading()
							me.isShowLoading = false
						}

						if (me.isExit) {
							uni.navigateBack({
								delta: 1
							})
						}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F2F5F7;
		height: 100%;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
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

	.navi_back {
		width: 25rpx;
		height: 43rpx;
	}

	.back_view {
		position: absolute;
		left: 30rpx;
		width: 54rpx;
		height: 54rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav_title {
		font-size: 36rpx;
		font-weight: 300;
		color: white;
		font-family: "PingFang SC";
	}

	.content_top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		height: 120rpx;
		margin-top: 20rpx;
		border-radius: 10rpx;
		width: calc(100% - 60rpx);
		padding: 30rpx;
	}

	.top_left {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 120rpx;
	}

	.device_name {
		font-size: 36rpx;
		font-weight: bold;
		color: white;
		font-family: "PingFang SC";
	}

	.device_location {
		font-size: 28rpx;
		font-weight: 500;
		color: white;
		font-family: "PingFang SC";
	}

	.top_edit {
		width: 40rpx;
		height: 40rpx;
	}

	.device_detail {
		width: calc(100% - 60rpx);
		background-color: #fff;
		border-radius: 10rpx;
		border-width: 1rpx;
		border-color: #BBBBBB;
		border-style: solid;
		margin-top: 30rpx;

		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 30rpx;
	}

	.detail_title {
		width: calc(100% - 60rpx);
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 30rpx;
	}

	.detail_title1 {
		width: calc(100% - 60rpx);
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 30rpx;
		justify-content: space-between;
	}

	.detail_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}


	.detail_title_img {
		width: 15rpx;
		height: 40rpx;
		background-color: #28B2FF;
	}

	.detail_title_text {
		margin-left: 30rpx;
		font-size: 36rpx;
		font-weight: bold;
		color: black;
		font-family: "PingFang SC";
	}

	.detail_info {
		margin-top: 30rpx;
		width: calc(100% - 60rpx);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.info_title {
		font-size: 28rpx;
		font-weight: 800;
		color: #000000;
		font-family: "PingFang SC";
	}

	.info_content {
		font-size: 25rpx;
		font-weight: 500;
		color: #101010;
		font-family: "PingFang SC";
		text-align: right;
	}

	.info_divider {
		margin-top: 30rpx;
		width: calc(100% - 60rpx);
		height: 1rpx;
		background-color: #BBBBBB;
	}

	.list_title {
		margin-top: 30rpx;
		display: flex;
		flex-direction: row;
		width: calc(100% - 60rpx);
	}

	.list_title_text1 {
		flex-grow: 4;
		font-size: 26rpx;
		font-weight: bold;
		color: black;
		font-family: "PingFang SC";
		text-align: center;
	}

	.list_title_text {
		flex-grow: 1;
		font-size: 26rpx;
		font-weight: bold;
		color: black;
		font-family: "PingFang SC";
		text-align: center;
	}

	.item_record_content {
		margin-top: 20rpx;
		/* display: flex;
		flex-direction: row; */
		width: calc(100% - 60rpx);
	}

	.item_record_content1 {
		display: flex;
		flex-direction: row;
	}

	.item_record_text {
		flex-grow: 1;
		font-size: 24rpx;
		color: #101010;
		font-family: "PingFang SC";
		text-align: center;
	}

	.item_record_text2 {
		font-size: 24rpx;
		color: #101010;
		font-family: "PingFang SC";
		margin-left: 20rpx;
		text-align: left;
	}


	.item_record_text1 {
		flex-grow: 1;
		font-size: 24rpx;
		color: #101010;
		font-family: "PingFang SC";
		margin-left: 20rpx;
		text-align: center;
	}

	.list_end {
		margin-top: 30rpx;
		width: calc(100% - 60rpx);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.list_end_text {
		font-size: 26rpx;
		color: #28B2FF;
		font-family: "PingFang SC";
		font-weight: 500;
	}

	.list_end_img {
		margin-left: 10rpx;
		width: 24rpx;
		height: 24rpx;
	}

	.content_bottom {
		width: calc(100% - 60rpx);
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.bottom_btn_left {
		width: calc(50% - 20rpx);
		height: 80rpx;
		background-color: #28B2FF;

		font-size: 26rpx;
		color: #fff;
		font-family: "PingFang SC";
		font-weight: 600;
		line-height: 80rpx;
		border-radius: 200rpx;
	}

	.bottom_btn_right {
		width: calc(50% - 20rpx);
		height: 80rpx;
		background-color: #FF3B3B;

		font-size: 26rpx;
		color: #fff;
		font-family: "PingFang SC";
		font-weight: 600;
		line-height: 80rpx;
		border-radius: 200rpx;
	}

	.u-popup-slot_delete {
		width: 520rpx;
		height: 356rpx;
		@include flex;
		justify-content: center;
		align-items: center;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.bottom_img {
		width: 140rpx;
		height: 140rpx;
		position: absolute;
		top: -120rpx;
	}

	.bottom_text {
		margin-top: 20rpx;
	}

	.popup_bottom {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		margin-top: 50rpx;
	}

	.btn_popup_cancel {
		border-radius: 34rpx;
		background-color: #C1C1C1;
		width: 200rpx;
		height: 68rpx;
		font-family: "PingFang SC";
		font-size: 28rpx;
		font-weight: 400;
		border-radius: 200rpx;
		color: #FFFFFF;
	}

	.btn_popup_confirm {
		margin-left: 30rpx;
		border-radius: 34rpx;
		background-color: #28B2FF;
		width: 200rpx;
		height: 68rpx;
		font-family: "PingFang SC";
		font-size: 26rpx;
		font-weight: 600;
		border-radius: 200rpx;
		color: #FFFFFF;
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
</style>
