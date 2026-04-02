<template>
	<view class="content">
		<!-- 设备名称栏 -->
		<view class="device_detail">
			<text class="detail_title">设备名称</text>
			<input class="detail_content" placeholder="请输入名称" placeholder-class="detail_content_placeholder" type="text" :value="device_name" @blur="inputName"
				@confirm="inputName" @input="inputName"/>
		</view>
		<!-- 安装位置 -->
		<view class="device_detail">
			<text class="detail_title">安装位置</text>
			<input class="detail_content" placeholder="请输入位置" placeholder-class="detail_content_placeholder" type="text" :value="device_location" @blur="inputLocation"
				@confirm="inputLocation" @input="inputLocation"/>
		</view>
		
		<!-- 区域位置 -->
		<view class="device_detail" @click="clickRoom()">
			<text class="detail_title">区域位置</text>
			<text class="detail_content">{{currentRoom}}</text>
		</view>
		
		<BindPageShell
			:moduleDisplayName="moduleDisplayName"
			:availableDeviceTitle="bindAvailableDeviceTitle"
			:scanNotice="bindScanNotice"
			:emptyDeviceHint="bindEmptyDeviceHint"
			:submitButtonText="bindSubmitButtonText"
			:deviceList="device_list"
			:selectedDevice="currentDevice"
			:isScanning="isScanning"
			:isSubmitting="isSubmitting"
			:showScanSection="currentType == 2"
			:deviceMac="device_mac"
			@select-device="clickItem"
			@submit="addDevice"
		/>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	import uitl from '@/common/util.js'
	import { getDeviceModule, hasCapability } from '@/src/app/index.js'
	import {
		validateBindBeforeSubmit,
		buildBindPayload,
		applySelectedCandidate,
		consumeScanPayloadForBind
	} from '@/src/features/device-bind/bind-flow-helper.js'
	import BindPageShell from '@/src/features/device-bind/components/BindPageShell.vue'
	export default {
		components: {
			BindPageShell
		},
		data() {
			return {
				device_list:[],
				device_name:'',
				device_location:'',
				device_mac:'',
				currentDevice:null,
				currentType:2,
				deviceNamePrefix:'Mouse',
				currentRoom:"",
				currentRoomId:-1,
				device_mac_ios:'',
				device_connect_list:[],
				moduleKey:'bushuqi',
				moduleMeta:null,
				moduleDisplayName:'智能感应灭鼠器',
				moduleCapabilities:{},
				modulePageIntegration:{},
				modulePageMeta:{},
				modulePlatformRules:{},
				scanSession:null,
				isScanning:false,
				bindAvailableDeviceTitle:'可用设备',
				bindScanNotice:'连接说明：\n请确认设备已打开蓝牙；\n请确认设备已开启连接模式；\n请确认设备保持蓝牙连接状态；\n请确认设备有电；\n请确认设备在10米范围之内。',
				bindEmptyDeviceHint:'暂无可绑定设备',
				bindSubmitHint:'',
				bindSubmitButtonText:'添加设备',
				bindRequestExtraFields:{},
				iosTransformLeadingZeroMac:true,
				iosCheckByMacAddressIos:false,
				isSubmitting:false
			}
		},
		
		onLoad(option) {
			let me = this
			this.initModuleMeta()
			this.initData(option)
			this.device_list=[]
			uni.$on('dataFromRoom', (data) => {
				me.currentRoom = data.name
				me.currentRoomId = data.id
			});
		},
		
		onShow() {
			console.log('[ADD页面] onShow')
			
			if(this.currentType != 1){
				// 清空设备列表，重新扫描
				this.device_list = []
				this.initBLE()
			}
		},
		
		onHide() {
			console.log('[ADD页面] onHide')
			if(this.currentType != 1){
				this.stopDiscovery()
			}
		},
		
		onUnload() {
			this.destroyScanSession()
		},
		
		methods: {
			initModuleMeta() {
				const moduleMeta = getDeviceModule(this.moduleKey)
				if (!moduleMeta) return
				this.moduleMeta = moduleMeta
				this.moduleDisplayName = moduleMeta.displayName || this.moduleDisplayName
				this.moduleCapabilities = moduleMeta.capabilities || {}
				this.modulePageIntegration = moduleMeta.pageIntegration || {}
				this.modulePageMeta = moduleMeta.pageMeta || {}
				this.modulePlatformRules = moduleMeta.platformRules || {}
				this.deviceNamePrefix = moduleMeta.deviceNamePrefix || this.deviceNamePrefix

				const bindConfig = moduleMeta.bindConfig || {}
				this.bindAvailableDeviceTitle = bindConfig.availableDeviceTitle || this.bindAvailableDeviceTitle
				this.bindScanNotice = bindConfig.scanNotice || this.bindScanNotice
				this.bindEmptyDeviceHint = bindConfig.emptyDeviceHint || this.bindEmptyDeviceHint
				this.bindSubmitHint = bindConfig.submitHint || this.bindSubmitHint
				this.bindSubmitButtonText = bindConfig.submitButtonText || this.bindSubmitButtonText
				this.bindRequestExtraFields = bindConfig.requestExtraFields || {}

				const iosRules = (moduleMeta.platformRules && moduleMeta.platformRules.ios) || {}
				this.iosTransformLeadingZeroMac =
					iosRules.transformLeadingZeroMac !== undefined
						? !!iosRules.transformLeadingZeroMac
						: this.iosTransformLeadingZeroMac
				this.iosCheckByMacAddressIos =
					iosRules.checkByMacAddressIos !== undefined
						? !!iosRules.checkByMacAddressIos
						: this.iosCheckByMacAddressIos
			},

			hasModuleCapability(capability) {
				return hasCapability(this.moduleKey, capability)
			},

			ensureScanSession() {
				if (this.scanSession) {
					this.scanSession.setFoundHandler((payload) => this.handleScanFoundPayload(payload))
					return this.scanSession
				}
				const moduleMeta = this.moduleMeta || getDeviceModule(this.moduleKey)
				const createScanSession = moduleMeta && moduleMeta.adapters && moduleMeta.adapters.createScanSession
				if (typeof createScanSession !== 'function') return null
				this.scanSession = createScanSession({
					onFound: (payload) => this.handleScanFoundPayload(payload)
				})
				return this.scanSession
			},

			destroyScanSession() {
				if (!this.scanSession) return
				this.scanSession.destroy()
				this.scanSession = null
				this.isScanning = false
			},

			//停止查找蓝牙设备
			stopDiscovery(){
				let me = this
				me.isScanning = false
				const session = me.ensureScanSession()
				if (!session) return
				session.stopScan().catch(() => {})
			},
			//获取设备列表（返回 Promise）
			fetchDeviceList(){
				let me = this
				return new Promise((resolve, reject) => {
					http.send('user/get_device_company_list?room_id=0', 'GET', {}, (res) => {
						if (res.code == 0) {
							me.device_connect_list = res.data || []
							// 打印已添加设备的 MAC 地址，帮助调试
							console.log('[ADD页面] 已添加设备:', me.device_connect_list.length)
							me.device_connect_list.forEach(d => {
								console.log('[ADD页面] - MAC:', d.mac_address)
							})
						}
						resolve()
					}, (err) => {
						console.error('[ADD页面] 获取设备列表失败')
						me.device_connect_list = []
						resolve()
					})
				})
			},
			
			change(e){
				this.currentRoom = e
			},
			initData(option){
				this.currentType = option.type
				if(this.currentType == 1){
					let data = JSON.parse(option.data)
					if(data != null){
						this.device_name = data.name
						this.device_mac = data.mac
						this.device_mac_ios = data.mac
					}
				}
				// fetchDeviceList 已移到 initBLE 中，确保先获取列表再扫描
			},
			addDevice(){
				let me = this
				const validation = validateBindBeforeSubmit({
					deviceName: this.device_name,
					deviceLocation: this.device_location,
					currentType: this.currentType,
					currentDevice: this.currentDevice
				})
				if(!validation.ok){
					uni.showToast({
						title:validation.message,
						icon:"error"
					})
					return
				}

				const payload = buildBindPayload({
					deviceMac: this.device_mac,
					deviceName: this.device_name,
					deviceLocation: this.device_location,
					roomId: this.currentRoomId,
					deviceAliasName: this.device_name,
					deviceMacIos: this.device_mac_ios,
					extraFields: this.bindRequestExtraFields
				})
				me.isSubmitting = true

				http.send('Device/add_device_company', 'POST', {
					...payload
				}, (res) => {
					me.isSubmitting = false
					if (res.code == 0) {
						console.log('[ADD页面] 设备添加成功')
						uni.showToast({
							title:"添加成功",
							icon:"success"
						})
						//关闭搜索
						me.stopDiscovery()
						
						setTimeout(function() {
							// 在这里编写延迟后要执行的代码
							uni.navigateBack({
								//返回上一页
								delta:1
							})
						}, 1000);
						
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					me.isSubmitting = false
					uni.showToast({
						title: '获取信息异常',
						icon: 'error'
					})
				})
			},
			
			clickItem(item){
				this.currentDevice = item
				this.device_name = item.name
				this.device_mac_ios = item.id
				this.device_mac = item.mac
				applySelectedCandidate(this.device_list, item)
			},
			
			inputName(e) {
				this.device_name = e.detail.value
			},
			inputLocation(e) {
				this.device_location = e.detail.value
			},
			
			async initBLE(){
				let me = this
				if (!me.hasModuleCapability('scan')) return
				// 先获取已添加的设备列表，再开始扫描
				await me.fetchDeviceList()
				me.checkBLEState()
			},
			
			//检查蓝牙的状态
			checkBLEState(){
				let me = this
				const session = me.ensureScanSession()
				if (!session) return
				session.ensureAdapterReady()
					.then((res) => {
						if (res.available) {
							me.startBluetoothDeviceDiscovery()
						}
					})
					.catch(() => {
						session.getAdapterState().then((res) => {
							if (res.available) {
								me.startBluetoothDeviceDiscovery()
							}
						}).catch(() => {
							console.error('[ADD页面] BLE状态检查失败')
						})
					})
			},
			// 开始搜索蓝牙设备
			startBluetoothDeviceDiscovery(){
				let me = this
				const session = me.ensureScanSession()
				if (!session || me.isScanning) return
				session.clearDiscoveredDevices()
				session.startScan({
					allowDuplicatesKey:true
				}).then(() => {
					console.log('[ADD页面] 扫描已启动')
					me.isScanning = true
				}).catch((err) => {
					if (err && err.errMsg && err.errMsg.includes('already discovering')) {
						me.isScanning = true
						return
					}
					console.error('[ADD页面] 扫描启动失败:', err && err.errCode)
				})
			},
			
			// 处理扫描回调（广播解析由模块 protocol 层完成）
			handleScanFoundPayload(payload) {
				let me = this
				const result = consumeScanPayloadForBind({
					payload,
					deviceNamePrefix: me.deviceNamePrefix,
					candidateList: me.device_list,
					boundDevices: me.device_connect_list,
					transformIosMac: me.iosTransformLeadingZeroMac ? (mac) => uitl.changeMacAddress(mac) : null,
					checkIosByMacAddressIos: me.iosCheckByMacAddressIos
				})
				if (!result.accepted) return

				me.device_list.push(result.candidate)
				console.log('[ADD页面] 发现新设备:', result.candidate.name, 'MAC:', result.candidate.mac)
			},
			
			clickRoom(){
				uni.navigateTo({
					url:"/pages/user/userRoom?type=1"
				})
			}
		}
	}
</script>

<style lang="scss">
	page{
		height: 100%;
		background-color: #F2F5F7;
	}
	
	button::after{
		border: none;
	}
	
	.content{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.device_detail{
		margin-top: 30rpx;
		width: calc(100% - 60rpx);
		height: 90rpx;
		background-color: #FFF;
		border-radius: 200rpx;
		border-width: 1rpx;
		border-color: #BBBBBB;
		border-style: solid;
		
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	
	.detail_title{
		margin-left: 30rpx;
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.detail_content{
		margin-right: 30rpx;
		text-align: right;
		
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.detail_content1{
		width: 300rpx;
		margin-right: 30rpx;
		height: 100%;
		
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.uni-data-select{
		width: 300rpx;
		margin-right: 30rpx;
		height: 100%;
		
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.detail_content_placeholder{
		font-size: 23rpx;
		font-weight: 500;
		color: #666666;
		font-family: "PingFang SC";
	}
	
	.device_add_list{
		width: calc(100% - 60rpx);
		margin-top: 30rpx;
		display: flex;
		flex-direction: column;
	}
	
	.device_name{
		width: calc(100% - 60rpx);
		margin-top: 30rpx;
		display: flex;
		flex-direction: column;
	}
	
	.list_title{
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.blue_item{
		margin-top: 30rpx;
		// width: calc(100% - 60rpx);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		background-color: #FFF;
		padding: 30rpx;
		border-radius: 10rpx;
	}
	
	.blue_left{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.blue_img{
		width: 40rpx;
		height: 40rpx;
	}
	
	.blue_name{
		margin-left: 30rpx;
		font-size: 26rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.blue_selected{
		width: 40rpx;
		height: 40rpx;
	}
	
	.device_notice{
		width: calc(100% - 60rpx);
		margin-top: 30rpx;
	}
	
	.device_desc{
		font-size: 26rpx;
		font-weight: 500;
		color: #575757;
		font-family: "PingFang SC";
	}
	
	.btn_add{
		margin-top: 60rpx;
		width: calc(100% - 60rpx);
		background-color: #28B2FF;
		font-size: 30rpx;
		line-height: 80rpx;
		font-family: "PingFang SC";
		font-weight: 400;
		color: #ffffff;
		height: 80rpx;
		margin-bottom: 30rpx;
		border-radius: 200rpx;
	}
	
</style>
