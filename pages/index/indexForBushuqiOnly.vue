<template>
	<view class="content">
		<view class="login_bg"></view>
		<view class="navBarBox" :style="{height: custom_bar + 'px'}">
			<view class='statusBar' :style="{height: status_bar + 'px'}"></view>
			<view class="navBar">
				<view class="scan_view" @click="scanQrcode">
					<image src="../../static/index/scan_w.png" class="scan" mode="widthFix"></image>
				</view>
				<view class="nav_title">智能感应灭鼠器</view>
			</view>
		</view>
		
		<view> 
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000"
				indicator-color="#ffffff">
				<swiper-item v-for="(item,index) in bannerList" class="swiper-item" :key="index">
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
				<text v-if="devices_show.length > 0" class="top_content">我的设备（{{devices_show.length}}）</text>
				<text v-else class="top_content">我的设备</text>
			</view>
			
			<!-- <view class="scan_view"> -->
				<!-- <image src="../../static/index/scan.png" class="scan" mode="widthFix" @click="scanQrcode"></image> -->
				<image src="../../static/index/add.png" class="scan" mode="widthFix" @click="naviAdd(2)"></image>
			<!-- </view> -->
			
		</view>
		<view v-if="room_list_name.length > 0" class="device_list_title">
			<u-subsection :list="room_list_name" mode="subsection" :current="roomIndex" :fontSize="25" @change="sectionChange" activeColor="#28B2FF" inactiveColor="#505050"></u-subsection>
			<!-- <u-tabs :list="room_list_name" lineWidth="300" lineColor="#f56c6c" :activeStyle="{
            color: '#303133',
            fontWeight: 'bold',
            transform: 'scale(1.05)'}" :inactiveStyle="{color: '#505050',transform: 'scale(1)'}"></u-tabs> -->
		</view>
		
		<view v-if="devices_show.length > 0" class="device_list_content">
			
			<view class="item_device_content1" v-for="(item,index) in devices_show":key="index">
				<view class="item_device_content" @click="connectDevice(item)">
					<image v-if="!item.connect" class="device_bg" src="../../static/index/item_disconnected.jpg" mode="widthFix"></image>
					<image v-else class="device_bg" :src="setItemBg(item)" mode="widthFix"></image>
					<view class="device_left">
						<text class="device_name">{{item.alias_name}}</text>
						<text class="device_location">{{item.address}}</text>
					</view>
					<view v-if="item.count>0 && item.connect" class="device_notice"></view>
					<image v-if="!item.connect" class="device_img1" src="../../static/index/blue_disconnected.png" mode="widthFix"></image>
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
	import http from '@/common/http.js'
	import user_util from '@/common/user-util.js'
	export default {
		data() {
			return {
				custom_bar: u_storage.get_custombar(),
				status_bar: u_storage.get_statusbar(),
				scan_data:{},
				devices:[],
				devices_show:[],
				room_list:[],
				room_list_name:[],
				bannerList:[],
				isShowLogin:true,
				currentUserInfo:null,
				timer:null,
				roomIndex:0,
				deviceStateTimer:null,
				refreshTimer:null,
				currentClickId:-1,
				isFetchFirst:false
			}
		},
		onLoad() {
			console.log('======首页加载中======')
			//判断当前的登录信息
			// this.checkLoginInfo()
			//加载banner图片
			this.fetchBannerList()
		},
		
		onShow() {
			console.log('======首页显示======')
			if(user_util.is_login() && user_util.getUserInfo().is_admin != 1){
				this.openBle()
				this.isShowLogin = false
				//获取首页设备列表
				this.fetchDeviceList()
				this.fetchRoomList()
			}
		},
		
		onHide() {
			console.log('======首页隐藏======')
			this.closeBle()
		},
		
		methods: {
			naviBack(){
				this.closeBle()
				uni.navigateBack()
			},
			fetchBannerList(){
				let me = this
				http.send('banner/get_list', 'GET', {
					type:0
				}, (res) => {
					if (res.code == 0) {
						me.bannerList = res.data.banner
					} 
				}, (res) => {
					
				})
			},
			
			setItemBg(item){
				if(item.voltage == null){
					if(item.power === 0){
						return '../../static/index/item_nocount.png'
					}else{
						return '../../static/index/item_normal.png'
					}
				}
				
				if(item.voltage < 2.2){
					return '../../static/index/item_error.png'
				}else{
					if(item.power === 0){
						return '../../static/index/item_nocount.png'
					}else{
						return '../../static/index/item_normal.png'
					}
				}
				
			},
			
			setItemVolt(item){
				if(item.voltage == null){
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
				console.log("当前的房间id是：",room_id)
				if(room_id === "全部"){
					this.devices_show = this.devices
				}else{
					this.devices_show = this.devices.filter(item => item.room_id === room_id);
				}
			},
			naviLogin(){
				uni.reLaunch({
					url:"/pages/login/login"
				})
			},
			naviAdd(type){
				
				if(!user_util.is_login()){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}
				
				// this.closeBle()
				
				var curUrl = '/pages/index/device/add?type='+type
				if(type == 1){
					curUrl += "&data=" + JSON.stringify(this.scan_data)
				}
				
				uni.navigateTo({
					url:curUrl
				})
			},
			
			connectDevice(currentItem){
				let me = this
				
				currentItem.count = 0
				
				var devices_item =  me.devices.find(item => item.id === currentItem.id);
				
				devices_item.count = 0
				
				this.currentClickId = currentItem.id
				const systemInfo = uni.getSystemInfoSync()
				let deviceId = currentItem.mac_address
				if(systemInfo.platform === 'ios'){
					deviceId = currentItem.mac_address_ios
				}
				//跳转到详情页面
				uni.navigateTo({
					url:'/pages/index/device/detailNew?id='+currentItem.id+"&mac="+deviceId
				})
				
			},
			
			scanQrcode(){
				
				let me = this
				
				if(!user_util.is_login()){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}	
				
				uni.scanCode({
					scanType: ['qrCode'],
					success(res) {
						console.log('扫码成功返回数据：' + JSON.stringify(res));
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						
						let result = res.result
						
						const parts = res.result.split(',')
						
						if(parts.length !== 2){
							uni.showToast({
								title:"二维码长度错误",
								icon:"error"
							})
							return
						}
						
						let numberOfColons = parts[1].split(':').length - 1;
						
						if(numberOfColons == 4){
							//冒号为5的时候特殊处理
							console.log('mac处理前数据：' + parts[1]);
							const mac_parts_front = parts[1].slice(0,8)
							const mac_parts_back = parts[1].slice(-8)
							
							parts[1] = mac_parts_front + ':' + mac_parts_back
							console.log('mac处理前数据：' + parts[1]);
						}
						
						const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/
						
						if(!macRegex.test(parts[1])){
							uni.showToast({
								title:"mac地址有误",
								icon:"error"
							})
							return
						}
						
						me.scan_data.name = parts[0]
						me.scan_data.mac = parts[1]
						
						me.naviAdd(1)
					},
					fail(res) {
						console.log('扫码失败返回数据：' + JSON.stringify(res));
						let errMsg = res.errMsg.toLowerCase()
						console.log('扫码失败返回错误信息为：' + errMsg);
						if(!errMsg.includes("cancel")){
							uni.showToast({
								title:'扫码失败，请重试',
								icon:'error'
							})
						}
					}
				});
			},
			//获取本地缓存用户信息
			checkLoginInfo(){
				if (!user_util.is_login()) {
					//未登录时显示登录控件
					this.isShowLogin = true
					this.devices = this.devices_show = []
				}else{
					
					if(user_util.getUserInfo().is_admin === 1){
						//如果是管理员登录，跳转到管理员登录页面
						uni.reLaunch({
							url:"/pages/admin/index"
						})
					}else{
						this.isShowLogin = false
						this.currentUserInfo = user_util.getUserInfo()
					}
				}
			},
			
			updateDevice(device){
				let me = this
				http.send('Device/update_device', 'POST', {
					device_id:device.device_id,
					mac_address_ios:device.device_mac_ios
				}, (res) => {
					console.log("编辑信息返回数据为:",res.data)
				})
			},
			
			//获取设备列表
			fetchDeviceList(){
				// this.clearDeviceState()
				// if(this.deviceStateTimer != null){
				// 	clearInterval(this.deviceStateTimer)
				// 	this.deviceStateTimer = null
				// }
				uni.showLoading({
					title:"数据加载中"
				})
				let me = this
				http.send('user/get_device_company_list?room_id=0', 'GET', {}, (res) => {
					uni.hideLoading()
					if (res.code == 0) {
						console.log("获取设备列表数据为:",res.data)
						
						const serverDataList = res.data
						//	更新最新数据
						me.devices_show = me.devices = serverDataList
						
						me.devices_show = me.devices = me.devices.map(item => {
							return { ...item, connect: true };
						});
						
						console.log(me.devices_show)
						
						me.isFetchFirst = true
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
			
			fetchRoomList(){
				let me = this
				http.send('room/get_list_company', 'GET', {}, (res) => {
					if (res.code == 0) {
						me.room_list_name=[]
						me.room_list=[]
						console.log("获取仓库列表数据为:",res.data)

						me.room_list = res.data
						
						if(me.room_list.length > 0){
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
			
			dealTestData(item,data){
				
				console.log("获取蓝牙广播的字符串是：",data)
				
				let count = parseInt(data.substring(26,28),16)
				console.log("当前震动数据是：",count,",当前item的count是：",item.current_cnt)
				var deviceCount = 0
				var devices_item =  this.devices.find(item1 => item1.id === item.id);
				if(count > 0){
					deviceCount = count
					const currentCount = count - item.current_cnt
					if(currentCount > 0){
						item.count = currentCount
						
						devices_item.count = currentCount
						
						this.$forceUpdate()
					}
				}
				
				let voltage = parseInt(data.slice(-2),16)
				
				if(voltage > 0){
					let voltageValue = parseFloat((voltage/10).toFixed(1))
					
					console.log("当前电压是：",voltageValue,"V")
					
					if(voltageValue>0){
						item.voltage = voltageValue
						devices_item.voltage = voltageValue
						this.$forceUpdate()
						devices_item.voltage = voltageValue
					}
				}
				
				let me = this
				http.send('record/save', 'POST', {
					device_id:item.id,
					tmpStr:data,
					totalSum:deviceCount,
					is_connect:0,
					voltage:item.voltage
				}, (res) => {
					
					if (res.code == 0) {
						console.log("保存记录成功返回数据为:",res)
						
						
					} 
				}, (err) => {
					console.log("保存记录失败返回数据为:",err)
				})
			},
			//打开蓝牙
			openBle(){
				//打开设备蓝牙适配器
				this.openBLEAdapter()
			},
			//关闭蓝牙
			closeBle(){
				this.stopDiscovery()
				this.closeBLEAdapter()
			},
			openBLEAdapter(){
				let me = this
				uni.openBluetoothAdapter({
					success(res) { //已打开
						console.log('打开蓝牙适配器返回数据：',res)
						me.checkBLEState()
					},
					fail(err){ //未打开 
						uni.showToast({icon:'none',title: '请打开蓝牙和定位功能'});
					}
				})
			},
			
			closeBLEAdapter(){
				let me = this
				uni.closeBluetoothAdapter({
					success(res) { //已打开
						console.log('关闭蓝牙适配器返回数据：',res)
						me.isBlueOpen = false
						// uni.hideLoading()
						if(me.timer != null){
							clearInterval(me.timer)
							me.timer = null
						}
						
						if(me.deviceStateTimer != null){
							clearInterval(me.deviceStateTimer)
							me.deviceStateTimer = null
						}
					},
					fail(err){ //未打开 
						
					}
				})
			},
			
			getStorageValue(id,pre_fix_type){
				
				var pre_fix = ""
				
				if(pre_fix_type == 1){
					pre_fix = "_lastTime"
				}else if(pre_fix_type == 2){
					pre_fix = "_broadcastStr"
				}
				
				const key = id + pre_fix
				console.log("getStorageValue key is:",key)
				//从内存中取出值
				return uni.getStorageSync(key)
			},
			
			setStorageValue(id,pre_fix_type,value){
				
				var pre_fix = ""
				
				if(pre_fix_type == 1){
					pre_fix = "_lastTime"
				}else if(pre_fix_type == 2){
					pre_fix = "_broadcastStr"
				}
				
				const key = id + pre_fix
				console.log("setStorageValue key is:",key)
				//从内存中取出值
				return uni.setStorageSync(key,value)
			},
			
			clearDeviceState(){
				for (var i = 0; i < this.devices_show.length; i++) {
					//从内存中取出值
					this.clearStorageValue(this.devices_show[i].id)
				}
			},
			
			checkDeviceOnlineState(){
				let me = this
				
				if(this.deviceStateTimer == null){
					this.deviceStateTimer = setInterval(()=>{
						console.log("判断当前连接设备是否离线中")
						
						for (var i = 0; i < me.devices_show.length; i++) {
							//从内存中取出值
							const lastBroadcastTime = this.getStorageValue(me.devices_show[i].id,1)
							//当前是连接状态，需要判断是否还在线
							const currentTimeStamp = new Date().getTime()
							var secondsDifference = (currentTimeStamp - lastBroadcastTime) / 1000;
							console.log("当前时间间隔为：",secondsDifference)
							if(secondsDifference > 30){
								//1分钟为标准来判断是否在线
								me.devices_show[i].connect = false
								me.$forceUpdate()
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id)
								devices_item.connect = false
							}else{
								me.devices_show[i].connect = true
								me.$forceUpdate()
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id)
								devices_item.connect = true
							}
						}
						
					},20 * 1000)
				}
				
			},
			
			//检查蓝牙的状态
			checkBLEState(){
				let me = this
				uni.getBluetoothAdapterState({//蓝牙的匹配状态
					success:(res)=>{
						console.log('检查蓝牙状态返回数据：',res)	
						// 开始搜索蓝牙设备
						if(res.available){
							//当前设备开启正常
							console.log("当前蓝牙可用！")
							me.startDeviceDiscovery()
						}else{
							console.log("当前蓝牙不可用！")
						}
					},
					fail:(error) => {
						console.log("当前蓝牙返回错误："+error)
					}
				});
			},
			
			// 开始搜索蓝牙设备
			startDeviceDiscovery(){
				let me = this
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey:true,
					success(res){
						console.log('开始搜索设备返回结果：', res)
						// 发现外围设备
						me.onBluetoothDeviceFound()
					},fail(err){
						console.log('开始搜索设备返回错误信息：',err)
					}
				})
			},
			
			// 发现外围设备
			onBluetoothDeviceFound() {
				console.log("搜寻设备中")
				let me = this
				uni.onBluetoothDeviceFound((res) => {
					const systemInfo = uni.getSystemInfoSync()
					
					for (var i = 0; i < me.devices_show.length; i++) {
						//00ff0523000007e8050f0b2504041f
						//ff000000173e07b201010000000000
						//FF:00:00:00:17:3E
						//00:FF:05:23:00:00
						//获取当前存储的广播字段
						const broadcastStr = me.getStorageValue(me.devices_show[i].id,2)
						console.log("onBluetoothDeviceFound 当前存储的广播值为：",broadcastStr)
						//获取当前广播的字段
						var bleData = me.ab2hex(res.devices[0].advertisData)
						if(bleData == null || bleData.length == 0 ){
							// console.log("onBluetoothDeviceFound 没有广播值，不处理！",bleData)
							return
						}
						
						const ble_slice_data = bleData.slice(-30).trim()
						//0808080822FF2322222207E8051310220B1E1B
						//0808080822FF2322222207E805131025091E1B
						
						if(broadcastStr === ble_slice_data && !me.isFetchFirst){
							console.log("onBluetoothDeviceFound 该数据已经处理过，不需要重复处理！",ble_slice_data)
							const curTime = new Date().getTime()
							me.setStorageValue(me.devices_show[i].id,1,curTime)
							return
						}
						
						// const title = ble_slice_data.substring(0, 2).toUpperCase()
						
						// if(title != "FF" && title != "00"){
						// 	//过滤数据格式不正确的数据
						// 	// console.log("onBluetoothDeviceFound 该数据格式不正确，进行过滤！",ble_slice_data)
						// 	return
						// }
						
						//对设备中的每个数据进行查看
						if(systemInfo.platform === 'ios'){
							let mac = ble_slice_data.substring(0,12)
							let macValue = mac.replace(/(..)(..)(..)(..)(..)(..)/g, "$1:$2:$3:$4:$5:$6");
							
							if(macValue.toUpperCase() == me.devices_show[i].mac_address.toUpperCase()){
								console.log("==================onBluetoothDeviceFound 进入ios设备处理=================")
								console.log("onBluetoothDeviceFound 接收蓝牙广播数据消息为：",ble_slice_data,"存储数据为：",broadcastStr)
								//用mac进行比较来判断是否是我们需要设备
								console.log("===============搜索到绑定设备了，mac地址：",mac)
								// me.devices_show[i].connect = true
								me.devices_show[i].connect = true
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id)
								devices_item.connect = true
								this.$forceUpdate()
								//更新缓存中的值
								const curTime = new Date().getTime()
								me.setStorageValue(me.devices_show[i].id,1,curTime)
								//更新缓存中设备广播数据对应的值
								me.setStorageValue(me.devices_show[i].id,2,ble_slice_data)
								me.isFetchFirst = false
								
								if(me.devices_show[i].mac_address_ios.length == 0){
									//此时mac_address_ios参数为空
									me.devices_show[i].mac_address_ios = res.devices[0].deviceId
									this.updateDevice(me.devices_show[i])
								}
								
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id);
								
								devices_item.connect = me.devices_show[i].connect
								devices_item.mac_address_ios = res.devices[0].deviceId
								me.dealTestData(me.devices_show[i],ble_slice_data)
							}
						}else{
							//除了ios的其他逻辑处理
							if(res.devices[0].deviceId == me.devices_show[i].mac_address_ios || res.devices[0].deviceId == me.devices_show[i].mac_address){
								console.log("onBluetoothDeviceFound 接收蓝牙广播数据消息为：",ble_slice_data,"存储数据为：",broadcastStr)
								console.log("==================onBluetoothDeviceFound 进入android设备处理=================")
								me.devices_show[i].connect = true
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id)
								devices_item.connect = true
								this.$forceUpdate()
								//更新缓存中的值
								const curTime = new Date().getTime()
								me.setStorageValue(me.devices_show[i].id,1,curTime)
								//更新缓存中设备广播数据对应的值
								me.setStorageValue(me.devices_show[i].id,2,ble_slice_data)
								me.isFetchFirst = false
								
								var devices_item =  me.devices.find(item => item.id === me.devices_show[i].id);
							
								me.dealTestData(me.devices_show[i],ble_slice_data)
							}
						}
					}
				})
			},
			
			ab2hex(buffer){
				const hexArr = Array.prototype.map.call(
					new Uint8Array(buffer),
					function(bit){
						return ('00' + bit.toString(16)).slice(-2)
					}
				)
				return hexArr.join('')
			},
			
			//停止查找蓝牙设备
			stopDiscovery(){
				uni.stopBluetoothDevicesDiscovery({
					success(res) {
						console.log("停止查找蓝牙设备回调成功:",res)
					},
					fail(error) {
						console.log("停止查找蓝牙设备回调失败:",error)
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	
	page{
	}
	
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		padding-bottom: 30rpx;
	}
	
	button::after{
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
	
	.scan_view{
		width: 80rpx;
		height: 80rpx;
		position: absolute;
		left: 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	
	.scan{
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
	
	.view_notice{
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
	
	.notice_img{
		width: 30rpx;
		height: 30rpx;
		margin-left: 20rpx;
	}
	
	.notice_text{
		padding: 15rpx 0 15rpx 0;
		margin-left: 10rpx;
		font-size: 26rpx;
		line-height: 40rpx;
		color: #28B2FF;
		font-family: "PingFang SC";
		font-weight: bold;
	}
	
	.device_list_top{
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
	
	.device_list_title{
		margin-top: 30rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
	}
	
	.top_left{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.front {
		width: 64rpx;
		height: 64rpx;
	}
	
	.top_content{
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
	
	.device_list_content{
		margin-top: 30rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		// height: 100%;
		display: grid;
		grid-template-columns: repeat(2,1fr);
		grid-gap: 30rpx;
	}
	
	
	.item_device_content1{
		width: 320rpx;
		height: 180rpx;
	}
	
	.item_device_content{
		width: 320rpx;
		height: 180rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		position: relative;
	}
	
	.device_bg{
		position: absolute;
		width: 320rpx;
		height: 180rpx;
		z-index: -1;
	}
	
	.device_left{
		flex : 1;
		display: flex;
		flex-direction: column;
		margin-left: 10rpx;
		margin-top: 50rpx;
		height: 100rpx;
		justify-content: space-between;
		overflow: hidden;
		// white-space: nowrap;
		text-overflow: ellipsis; /* 显示省略号 */
	}
	
	.device_name{
		margin-top: 10rpx;
		font-size: 25rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1; /* 限制文本显示的行数 */
	}
	
	.device_location{
		font-size: 26rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: 300;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1; /* 限制文本显示的行数 */
	}
	
	.device_right{
		display: flex;
		width: 50rpx;
		margin-left: 10rpx;
		flex-direction: column;
		margin-right: 10rpx;
		margin-top: 10rpx;
		height: 100rpx;
		
		position: relative;
	}
	
	.device_notice{
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
		font-weight: 100;
		right: -10rpx;
		top:-10rpx;
		position: absolute;
	}
	
	.device_img1{
		position: absolute;
		right: 10rpx;
		top: 10rpx;
		width: 50rpx;
	}
	
	.device_img{
		width: 50rpx;
		height: 28rpx;
		position: absolute;
		right: 20rpx;
		top: 20rpx;
	}
	
	.view_end{
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
	
	.empty_view{
		width: 100%;
		// height: 300rpx;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	
	.empty_image{
		width: calc(50%);
		height: auto;
	}
	
</style>