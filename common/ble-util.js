/**
 * 蓝牙工具类
 */

/**
 * 连接成功的状态
 */
const isConnect = false

//定时任务id
let intervalId = null

//缓存一个当前连接的设备信息
let currentConnectDeviceInfo = null

//连接蓝牙的一个回调
let connectionCallBack = null

//写入蓝牙数据以后接收到数据的回调
let writeCallBack = null

/**
 * 缓存的蓝牙数据集
 */
let device_list = []

/**
 * 超时时间记录
 */
let time_out_list = []


const characteristicId = "0000ee01-0000-1000-8000-00805f9b34fb"

const ios_characteristicId = "FFF1"

// const serviceId = "000000ee-0000-1000-8000-00805f9b34fb"

serviceId = "0000FFF0-0000-1000-8000-00805F9B34FB"
characteristicWriteId = "0000FFF3-0000-1000-8000-00805F9B34FB"
characteristicReadId = "0000FFF4-0000-1000-8000-00805F9B34FB",
characteristicNotifyId = "0000FFF4-0000-1000-8000-00805F9B34FB",

/**
 * 加一个写入的超时回调
 */
let writeTimeOutId = null

/**
 * 加一个扫描具体设备的超时回调
 */
let scanDirectBlueTimeOutId = null

/**
 * 发送状态的一个标识
 */
let isSending = false

export default {

	initListener(foundDeviceCallBack, valueReadCallBack) {
		console.log("开始蓝牙初始化~~~~~")
		//适配器监听
		ble.onBluetoothAdapterStateChange({}, (res) => {
			console.log('适配器状态变化', res);
			// let result = JSON.parse(res)
			uni.$emit('ble-open', {
				value: res.available
			})
		});
		//发现设备监听
		ble.onBluetoothDeviceFound({}, (res) => {
			let new_devices = []
			let me = this
			// console.log(res)
			if (res.devices) {
				let devices_list = JSON.parse(res.devices);
				for (let i = 0; i < devices_list.length; i++) {
					let device = devices_list[i];
					if (device.name.indexOf('JSJ') !== -1) {
						// console.log("device = " + JSON.stringify(device))
						new_devices.push(device)
					}
				}
				foundDeviceCallBack(new_devices)
				me.appendDevice2CacheList(new_devices)
			}
		});

		//监听设备连接监听{"deviceId":"64:E8:33:44:40:A2","message":"状态变化","status":"2500","connected":true}
		ble.onBLEConnectionStateChange({}, (res) => {
			let me = this
			console.log('设备连接状态回调' + JSON.stringify(res));
			// if (this.connectionCallBack != null) {
			// 	this.connectionCallBack({
			// 		'code': res.status == "2500" ? 0 : -1,
			// 		'message': res.status == "2500" ? '蓝牙连接成功' : res.message
			// 	})
			// }
			//连接成功，获取服务和订阅特征

			//连接设备蓝牙状态变化发送一个通知
			if(currentConnectDeviceInfo){
				this.notifyBleConnectStatusChanged(res.connected)
			}

			if (res.connected) {
				isConnect = true
				this.notify(res.deviceId)

				// me.currentConnectDeviceInfo = {
				// 	'deviceId': res.deviceId,
				// 	'serviceId': serviceId,
				// 	'characteristicId': characteristicId
				// }

				// if (me.connectionCallBack != null) {
				// 	me.connectionCallBack({
				// 		'code': res.status == "2500" ? 0 : -1,
				// 		'device': res.deviceId,
				// 		'message': res.status == "2500" ?
				// 			'蓝牙连接成功' : res.message
				// 	})
				// 	me.connectionCallBack = null
				// }

				this.stopScan()

			} else {
				this.disConnect(res.deviceId)
			}
		});

		//监听特征数据
		ble.onBLECharacteristicValueChange({}, (res) => {
			let value = res.value;
			isSending = false
			// console.log('监听到蓝牙信息返回:' + JSON.stringify(res));
			if (writeCallBack) {
				if ("11223344" != res.value && "FF00FF" != res.value) {
					console.log('接收到数据回调:' + JSON.stringify(res));
					clearTimeout(writeTimeOutId)
					writeTimeOutId = null
					writeCallBack(res.value)
					// writeCallBack = null
				}

			}
		});
	},

	/**
	 * 连接蓝牙必须先扫到设备，这里业务可以前置触发一下扫描，这样连接的时候快一些。
	 */
	preInit() {
		console.log("蓝牙工具 ===== preInit")
		this.open_blue((res) => {
			console.log("蓝牙与初始化结果 = " + res)
			if (res == 1) {
				this.startScan()
				uni.$emit('ble-open', {
					value: true
				})
			} else {
				uni.$emit('ble-open', {
					value: false
				})
			}
		})

	},

	/**
	 * 带入具体设备，如果扫描列表里面有回调成功，否则扫3s后回调有或者没有
	 */
	preScan(deviceName, callBack) {
		console.log("蓝牙工具 ===== preScan：" + deviceName)
		//根据设备名称去查蓝牙id
		let deviceId = this.getDeviceIdByDeviceName(deviceName)
		console.log("反查到的蓝牙设备id = " + deviceId)

		if (deviceId == null) {
			if (scanDirectBlueTimeOutId == null) {
				scanDirectBlueTimeOutId = setTimeout(() => {
					let existDeviceId = this.getDeviceIdByDeviceName(deviceName)
					clearTimeout(scanDirectBlueTimeOutId)
					scanDirectBlueTimeOutId = null
					callBack(existDeviceId == null ? -1 : 0)
				}, 2000)
			}
			this.open_blue((res) => {
				if (res == 1) {
					this.startScan()
				}
			})
		} else {
			//响应成功
			callBack(0)
		}
	},

	//刷新服务和订阅特征
	notify(deviceId) {
		let timeInterval = 300;
		let me = this
		setTimeout(() => {
			ble.getBLEDeviceServices({
				deviceId: deviceId
			}, (res) => {
				console.log("刷新服务和订阅特征:" + JSON.stringify(res));
				if (res.status == '2500') {
					let services = JSON.parse(res.services);
					//由于是异步方法，采用递归进行遍历
					var diguiServices = function(serArr, index) {
						console.log("开始递归方法~" + JSON.stringify(serArr))
						ble.getBLEDeviceCharacteristics({
							deviceId: deviceId,
							serviceId: serArr[index].uuid
						}, (res2) => {
							let characteristics = JSON.parse(res2.characteristics);
							// console.log("获取到的特征值 = " + res2.characteristics +
							// 	",isConnect = " + isConnect)
							//订阅设备特征
							for (let j = 0; j < characteristics.length; j++) {
								let characteristic = characteristics[j];
								console.log("characteristic = " + JSON.stringify(
									characteristic))
								if (characteristic.properties.notify == true) {
									ble.notifyBLECharacteristicValueChange({
										deviceId: deviceId,
										serviceId: serArr[index].uuid,
										characteristicId: characteristic.uuid
									}, (res3) => {
										console.log(
											"notifyBLECharacteristicValueChange result = " +
											JSON.stringify(res3))
									});
								}

								//读特征值
								if (characteristic.properties.read == true) {
									ble.readBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: serArr[index].uuid,
										characteristicId: characteristic.uuid
									}, (res3) => {
										console.log(
											"readBLECharacteristicValue result = " +
											JSON.stringify(res3))
										// if ("2500" != res3.status) {
										// 	me.cancelNotifyBLECharacteristicValueChange(
										// 		deviceId,
										// 		serArr[index].uuid,
										// 		characteristic.uuid
										// 	)
										// }
									});
								}

								let isDirectCharacteristicUUid = (characteristicId == characteristic.uuid) || (ios_characteristicId == characteristic.uuid)

								// console.log("可写的特征1=" + JSON.stringify(characteristic))
								//写一个值过去
								if (characteristic.properties.write == true && isDirectCharacteristicUUid) {
									
									console.log("可写的特征=" + JSON.stringify(characteristic))
									
									// me.notifyBleConnectStatusChanged(true)
									
									isSending = false

									//缓存写入蓝牙信息进去
									currentConnectDeviceInfo = {
										'deviceId': deviceId,
										'serviceId': serArr[index].uuid,
										'characteristicId': characteristic.uuid,
										'characteristic': characteristic
									}
									
									console.log("333333 = " + JSON.stringify(currentConnectDeviceInfo))

									if (connectionCallBack != null) {
										connectionCallBack({
											'code': res.status == "2500" ? 0 : -1,
											'device': deviceId,
											'message': res.status == "2500" ?
												'蓝牙连接成功' : res.message
										})
										connectionCallBack = null
									}
									
									me.notifyBleConnectStatusChanged(true)

									// clearInterval(me.intervalId)

									// ble.writeBLECharacteristicValue({
									// 	deviceId: deviceId,
									// 	serviceId: serArr[index].uuid,
									// 	characteristicId: characteristic.uuid,
									// 	value: "01" //十六进制数据
									// }, (res3) => {

									// });
								}
							}

							let index2 = index + 1;
							if (index2 >= serArr.length) {
								return;
							} else {
								// console.log("递归下一个服务的特征值");
								if (currentConnectDeviceInfo == null){
									diguiServices(serArr, index2);	
								}
							}

						})
					}
					console.log("currentConnectDeviceInfo = " + currentConnectDeviceInfo)
					if (currentConnectDeviceInfo == null) {
						//开始遍历服务
						diguiServices(services, 0);
					}

				}
			})
		}, timeInterval)
	},

	/**
	 * 写一个值过去
	 * 
	 */
	writeValue(value, callBack) {
		console.log("写入蓝牙信息 = " + value + ",writeTimeOutId = " + writeTimeOutId)

		if (isSending) {
			// uni.showToast({
			// 	title:'上个指令还未响应~',
			// 	icon:"error"
			// })
			console.log("发送异常，上个指令还未响应~")
			this.addTimeOutList()
			// callBack('-2')
			// this.addTimeOutList()
			// console.log("time_out_list = " + time_out_list)
			if (time_out_list.length === 5) {
				// 超时6个， 主动取消
				console.log('蓝牙超时5个， 主动取消')
				// callBack('-2')
				time_out_list = []
				//就当断开，释放
				this.onDestroy()
				this.notifyBleConnectStatusChanged(false)
			}
			callBack('-2')
			return
		}

		isSending = true
		writeCallBack = callBack

		if (writeTimeOutId == null) {
			clearTimeout(writeTimeOutId)
			writeTimeOutId = setTimeout(() => {
				console.log("xxxxxxxxxxx1 = " + writeCallBack)
				if (writeCallBack) {
					clearTimeout(writeTimeOutId)
					writeTimeOutId = null
					console.log('写入蓝牙信息 ,响应超时了~');
					writeCallBack('-1')
					isSending = false
					writeCallBack = null
				}
			}, 3000)
		}

		let systemInfo = getApp().globalData.systemInfo
		
		console.log("1111111 = " + currentConnectDeviceInfo)
		
		if (currentConnectDeviceInfo) {
			let deviceId = currentConnectDeviceInfo.deviceId
			let characteristic_Id = currentConnectDeviceInfo.characteristicId
			let service_Id = currentConnectDeviceInfo.serviceId
			//写一个值过去
			console.log("writeValue deviceId= " + deviceId + ",characteristicId = " + characteristic_Id +
				",serviceId = " + service_Id + ",value = " + value + ",length = " + value.length)

			if (systemInfo.platform == 'ios' || value.length < 500) {
				ble.writeBLECharacteristicValue({
					deviceId: deviceId,
					serviceId: service_Id,
					characteristicId: characteristic_Id,
					value: value //十六进制数据
				}, (res3) => {
					// console.log("写入蓝牙结果 = " + JSON.stringify(res3))
				});
			} else {
				this.writeBLE(value)
			}

		}

	},

	/**
	 * 打开蓝牙适配器
	 */
	open_blue(callBack) {
		console.log("蓝牙工具 ===== open_blue")
		//打开适配器
		uni.openBluetoothAdapter({
			success(res) { //已打开
				// console.log('打开蓝牙适配器返回数据：',res)
				console.log('打开适配器: ' + JSON.stringify(res));
				if (res.status == "2500") {
				// me.checkBLEState()
				callBack(1)
			},
			fail(err){ //未打开 
				// uni.showToast({icon:'none',title: '请打开蓝牙和定位功能'});
				callBack(0)
			}
		})
	},

	onUnload() {
		this.getConnected((res) => {
			let connectList = JSON.parse(res)
			if (connectList && connectList.length > 0) {
				for (var i = 0; i < connectList.length; i++) {
					var device = connectList[i]
					me.disConnect(device.deviceId)
				}
			}

			//这里返回页面触发销毁后，启动扫描，防止新设备进不来
			me.stopScan()
			currentConnectDeviceInfo = null
			isSending = false
			writeCallBack = null
			connectionCallBack = null
			me.closeAdapter()
		})
	},

	/**
	 * 销毁的方法
	 */
	onDestroy() {
		console.log("蓝牙工具 ===== onDestroy")
		let me = this
		this.getConnected((res) => {

			this.notifyBleConnectStatusChanged(false)

			let connectList = JSON.parse(res)
			if (connectList && connectList.length > 0) {
				for (var i = 0; i < connectList.length; i++) {
					var device = connectList[i]
					me.disConnect(device.deviceId)
				}
			}

			//这里返回页面触发销毁后，启动扫描，防止新设备进不来
			me.startScan()
			currentConnectDeviceInfo = null
			writeCallBack = null
			connectionCallBack = null
			isSending = false
		})
	},

	closeAdapter() {
		console.log("蓝牙工具 ===== closeAdapter")
		ble.closeBluetoothAdapter({}, (res) => {
			if (res.status == '2500') {
				//
			}
		})
	},

	//启动扫描
	startScan() {
		console.log("蓝牙工具 ===== startScan")
		ble.startBluetoothDevicesDiscovery({}, (res) => {
			console.log('打开蓝牙扫描: ' + JSON.stringify(res));
		});
	},

	//停止扫描
	stopScan() {
		console.log("蓝牙工具 ===== stopScan")
		ble.stopBluetoothDevicesDiscovery({}, (res) => {
			console.log('关闭蓝牙扫描: ' + res);
		});
	},

	logout() {

		if (ble) {
			this.onDestroy()
			// this.stopScan()
			device_list = []
		}

	},

	clearDeviceList() {
		device_list = []
	},

	//连接设备
	toConnect(deviceName, callBack) {
		console.log("蓝牙工具 ===== toConnect, 设备名 = " + deviceName)
		let me = this
		currentConnectDeviceInfo = null
		isSending = false
		// this.getConnected((res) => {
		// 	// let result = me.isConnectContainsDeviceId(res, deviceId)
		// 	// console.log('获取连接蓝牙信息 = ' + res + '，result=' + result)
		// 	// if (result) {
		// 	// 	callBack({
		// 	// 		'code': 0,
		// 	// 		'message': '蓝牙已连接'
		// 	// 	})
		// 	// } else {
		// 	this.connectionCallBack = callBack
		// 	//停止扫描
		// 	this.stopScan()
		// 	//开始连接
		// 	ble.createBLEConnection({
		// 		deviceId: deviceId
		// 	}, (res) => {
		// 		console.log('连接蓝牙设备: ' + JSON.stringify(res));
		// 		//加入自动重连
		// 		ble.addAutoReconnect({
		// 			deviceId: deviceId
		// 		}, (res2) => {
		// 			console.log('重复连接蓝牙设备: ' + res2);
		// 		});
		// 	});
		// 	// }
		// })

		//停止扫描
		this.stopScan()

		//根据设备名称去查蓝牙id
		let deviceId = this.getDeviceIdByDeviceName(deviceName)
		console.log("反查到的蓝牙设备id = " + deviceId)

		if (deviceId == null) {
			callBack({
				'code': -1,
				'message': '未发现当前设备'
			})

			return
		}

		connectionCallBack = callBack

		ble.createBLEConnection({
			deviceId: deviceId,
			mtu: 500
		}, (res) => {
			console.log('连接蓝牙设备: ' + JSON.stringify(res));
			//加入自动重连
			ble.addAutoReconnect({
				deviceId: deviceId
			}, (res2) => {
				console.log('重复连接蓝牙设备: ' + res2);
			});
		});
	},

	//断开连接
	disConnect(deviceId) {
		console.log("蓝牙工具 ===== disConnect, 设备id = " + deviceId)
		isConnect = false
		currentConnectDeviceInfo = null
		writeCallBack = null
		ble.removeAutoReconnect({
			deviceId: deviceId
		}, (res) => {
			console.log('关闭重连蓝牙设备动作: ' + res);
			ble.closeBLEConnection({
				deviceId: deviceId
			}, (res2) => {
				console.log('断开连接蓝牙设备: ' + res2);
			});
		});

		if (intervalId) {
			clearInterval(intervalId)
		}
		
		this.notifyBleConnectStatusChanged(false)
	},

	//获取已连接的蓝牙设备
	getConnected(callBack) {
		//获取已连接的所有设备
		ble.getConnectedBluetoothDevices({}, (res) => {
			console.log('已连接的蓝牙设备: ' + JSON.stringify(res));
			callBack(res.devices == null ? "[]" : res.devices)
		});
	},

	//取消特征值订阅
	cancelNotifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
		console.log('取消订阅: ' + deviceId + ",serviceId = " + serviceId + ",characteristicId = " + characteristicId);
		isConnect = false
		currentConnectDeviceInfo = null
		if (intervalId) {
			clearInterval(intervalId)
		}
		ble.cancelNotifyBLECharacteristicValueChange({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId
		}, (res) => {
			if (res.status == '2500') {
				//订阅API调用成功，已取消订阅
			}
		})
	},

	getStatus() {
		//获取当前适配器状态
		ble.getBluetoothAdapterState({}, (res) => {
			console.log('获取蓝牙适配器的状态: ' + res);
		});
	},

	/**
	 * 获取连接设备中是否包含对应的设备
	 */
	isConnectContainsDeviceId(list, connectDeivceId) {

		let connectList = JSON.parse(list)

		if (connectList == null || connectList.length == 0) {
			return false
		}

		var isContain = false
		for (var i = 0; i < connectList.length; i++) {
			var device = connectList[i]
			if (device.deviceId == connectDeivceId) {
				isContain = true
			}
		}

		return isContain
	},

	getDeviceList() {
		return device_list
	},

	/**
	 * 把蓝牙设备添加到发现设备列表中
	 */
	appendDevice2CacheList(res) {
		let me = this
		let all_device = [...device_list, ...res]

		let uniqueItems = [];
		let checkList = new Map();
		for (let item of all_device) {
			if (!checkList.has(item.name)) {
				checkList.set(item.name, true);
				uniqueItems.push(item);
			}
		}

		let isRefresh = false

		if (device_list.length != uniqueItems.length) {
			isRefresh = true
			console.log('发现了设备,当前设备列表', uniqueItems);
		}

		device_list = uniqueItems

		if (isRefresh) {
			// 发送事件
			uni.$emit('findDevice', {
				data: uniqueItems
			});
		}
	},

	/**
		根据蓝牙名称反查蓝牙id
	 */
	getDeviceIdByDeviceName(deviceName) {
		for (let item of device_list) {
			if (item.name == deviceName || item.deviceId == deviceName || item.localName == deviceName) {
				return item.deviceId
			}
		}

		return null
	},

	/**
		根据蓝牙id反查蓝牙
	 */
	getDeviceNameByDeviceId(deviceId) {
		for (let item of device_list) {
			if (item.deviceId == deviceId) {
				return (item.name == null || item.name == '') ? item.localName : item.name
			}
		}

		return null
	},

	sleep(delay) {
		var start = (new Date()).getTime();
		while ((new Date()).getTime() - start < delay) {
			continue;
		}
	},

	writeBLE(e) {
		// console.log(e)
		var deviceId = currentConnectDeviceInfo.deviceId
		var serviceId = currentConnectDeviceInfo.serviceId
		var characteristicId = currentConnectDeviceInfo.characteristicId

		console.log(deviceId, serviceId, characteristicId)
		// 向蓝牙设备发送一个0x00的16进制数据
		return new Promise((resolve, reject) => {
			for (var i = 0; i < e.length; i += 20) {
				var endLength = 0
				// console.log(i)
				if (i + 20 < e.length) {
					var senddata = e

					let subSendValue = e.substring(i, i + 20)

					// let dataSend = []
					// for (var j = i; j < i + 20; j++) { 
					// 	dataView.setUint8(j - i, senddata[j])

					// 	dataSend.push(dataView.getUint8(j-i)) 
					// }
					// console.log('多包发送的包数据:'+dataView.buffer)
					ble.writeBLECharacteristicValue({
						deviceId: deviceId,
						serviceId: serviceId,
						characteristicId: characteristicId,
						value: subSendValue //十六进制数据
					}, (res3) => {
						console.log("分段写入蓝牙的回调 = " + JSON.stringify(res3))
					});
					// 等待
					this.sleep(0.02)
				} else {
					var senddata = e
					// console.log(senddata)

					let suSendValue = e.substring(i, senddata.length)

					console.log('最后一包或第一数据:' + suSendValue)

					ble.writeBLECharacteristicValue({
						deviceId: deviceId,
						serviceId: serviceId,
						characteristicId: characteristicId,
						value: suSendValue //十六进制数据
					}, (res3) => {
						console.log("分段写入蓝牙的回调 = " + JSON.stringify(res3))
					});

					this.sleep(0.02)
				}
			}
		})
	},

	/**
		获取当前连接的蓝牙设备
	 */
	getConnectDeviceInfo(callBack) {
		if (currentConnectDeviceInfo) {
			let data = {
				"deviceId": currentConnectDeviceInfo.deviceId,
				"connected": true, //如果有连接设备，默认连接了
				'deviceName': this.getDeviceNameByDeviceId(currentConnectDeviceInfo.deviceId)
			}
			callBack(data)
		} else {
			callBack({})
		}
	},

	notifyBleConnectStatusChanged(connected) {
		console.log("蓝牙工具 ===== notifyBleConnectStatusChanged = " + JSON.stringify(currentConnectDeviceInfo))
		if (currentConnectDeviceInfo) {

			let data = {
				"deviceId": currentConnectDeviceInfo.deviceId,
				"connected": connected,
				'deviceName': this.getDeviceNameByDeviceId(currentConnectDeviceInfo.deviceId)
			}

			console.log("发送连接设备状态编号的通知 = " + JSON.stringify(data))

			uni.$emit('ble-status-change', data)
		}
	},
	/**
		增加时间数据
	 */
	addTimeOutList() {
		const dateTime = Math.floor(new Date())
		const firstItem = time_out_list[0] || ''
		// console.log("dateTime = " + dateTime + ", firstItem=" + firstItem)
		if (firstItem && (dateTime - firstItem  > 5000)) {
			time_out_list = []
		}
		time_out_list.push(dateTime)
		// console.log("addTimeOutList = " + time_out_list)
	}
}