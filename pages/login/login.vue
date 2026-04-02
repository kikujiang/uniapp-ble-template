<template>
	<view class="content">
		<view class="content_middle">
			<view class="middle_top">
				<image src="../../static/login_log.jpeg" class="logo_img" mode="widthFix"></image>
				<text class="login_title">欢迎使用强凡AI智能设备</text>
				
				<view v-show="isAdmin" style="width: 100%;">
					<input class="login_input_name" placeholder="请输入账号" @input="onInputUserName" placeholder-style="color:#999999;font-weight: 300;font-size:28rpx"/>
					
					<input class="login_input_password" placeholder="请输入密码" @input="onInputUserPassword" placeholder-style="color:#999999;font-weight: 300;font-size:28rpx"/>
					
					<view class="login_bottom">
						<button class="login_btn" @click="clickLogin()">登 录</button>
						<text class="login_admin1" @click="switchUser()">用户登录</text>
					</view>			
				</view>	
				
				<button v-show="isCommon" class="btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
					手机号快捷登录
				</button>
				
				<text v-show="isCommon" class="login_admin" @click="switchAdmin()">管理员登录</text>
			</view>
			
			<u-popup @close="popupClose" closeable="true" :show="showFlag" mode="center" overlay="false"
				:safeAreaInsetBottom="false" :closeOnClickOverlay="false" :round="10">
				<view class="yuding_view">
					<text class="popup_title">请输入场所资料</text>
			
					<view class="popup_name">
						<text>手机号码：</text>
						<input :value="companyCode" placeholder="请输入手机号码" @input="onUserCompanyCodeInput" />
					</view>
			
					<view class="popup_name">
						<text>公司名称：</text>
						<input :value="companyName" placeholder="请输入公司名称" @input="onUserCompanyNameInput" />
					</view>
			
					<view class="view_btn_yuyue" @click="submit">确    认</view>
			
				</view>
			</u-popup>
		</view>
		
	</view>
</template>

<script>
	import user_util from '@/common/user-util.js'
	import http from '../../common/http.js'
	import modbus from '../../common/modbus.js'
	import uitl from '@/common/util.js'
	export default {
		data() {
			return {
				mobileCode: '',
				loginTestInfo:null,
				userName: '',
				userPassword: '',
				showFlag: false,
				companyCode:'',
				companyName:'',
				admin_flag:-1,
				isAdmin:false,
				isCommon:true
			}
		},
		
		onLoad() {
			this.test()
			console.log('======登录加载中======')
			if (user_util.is_login()) {
				//未登录时显示登录控件
				const user_info = user_util.getUserInfo()
				if(user_info.is_admin === 1){
					uni.reLaunch({
						url:"/pages/admin/index"
					})
				}else{
					uni.reLaunch({
						url:"/pages/index/SelectDeviceType",
						// url:"/pages/index/indexForBushuqiOnly"
					})
				}
			}
		},
		
		onShow() {
			console.log('======登录显示======')
		},
		
		onHide() {
			console.log('======登录隐藏======')
		},
		
		methods: {
			test(){
				let hexString = "01330000003F";
				let message = modbus.hexStringToByteArray(hexString);
				let crc = modbus.calculateCRC16(message);
				console.log("crc0:"+crc);
				crc = crc.toString(16).padStart(4, '0').toUpperCase()
				console.log("crc1:"+crc);
			},
			switchUser(){
				this.isAdmin = false
				this.isCommon = true
			},
			switchAdmin(){
				this.isAdmin = true
				this.isCommon = false
			},
			clickLogin() {
				var me = this
				let name = this.userName
				let password = this.userPassword
				if (name == '') {
					uni.showToast({
						title: '账号不能为空',
						icon: 'error'
					})
					return
				}
				if (password == '') {
					uni.showToast({
						title: '密码不能为空',
						icon: 'error'
					})
					return
				}
			
				uni.showLoading({
					title: '加载中...'
				})
			
				console.log('name = ' + name + '，password=' + password)
				
				this.login(name,password)
			},
			login(name,password){
				http.send('user/login', 'POST', {
					username: name,
					pwd: password
				}, (res) => {
					uni.hideLoading()
					if (res.code == 0) {
						user_util.bind_login_info(res.data)
						user_util.bind_user_info(res.data)
						
						if(res.data.is_admin === 1){
							uni.reLaunch({
								url:"/pages/admin/index"
							})
						}else{
							uni.reLaunch({
								url:"/pages/index/SelectDeviceType",
								// url:"/pages/index/indexForBushuqiOnly"
							})
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.hideLoading()
					uni.showToast({
						title: '登录异常',
						icon: 'error'
					})
				})
			},
			submit(){
				let me = this
				if (this.companyCode.length < 1) {
					uni.showToast({
						title: '公司代码不能为空',
						icon: 'error'
					})
					return
				}
				
				if (this.companyName.length < 1) {
					uni.showToast({
						title: '公司名称不能为空',
						icon: 'error'
					})
					return
				}
				
				http.send('user/setCompany', 'POST', {
					code: this.companyCode,
					name: this.companyName
				}, (res) => {
					if (res.code == 0) {
						if(this.admin_flag === 1){
							uni.reLaunch({
								url:"/pages/admin/index"
							})
						}else{
							uni.reLaunch({
								url:"/pages/index/SelectDeviceType",
								// url:"/pages/index/indexForBushuqiOnly"
							})
						}
					} 
				}, (res) => {
					
				})
			},
			
			getPhoneNumber(e) {
				let me = this
				console.log("获取电话号码为：" + JSON.stringify(e))
				if (e.detail.code != undefined) {
					me.mobileCode = e.detail.code
					me.wechatLogin()
					// me.loginTest()
				}
			},
			
			onUserCompanyCodeInput: function(event) {
				this.companyCode = event.target.value
			},
			
			onUserCompanyNameInput: function(event) {
				this.companyName = event.target.value
			},
			
			/**
			 * 点击登录
			 */
			wechatLogin() {
				let me = this
				uni.showModal({
					title: '温馨提示',
					content: '亲，授权微信登录后才能正常使用小程序功能',
					success(res) {
						if (res.confirm) {
							user_util.wxLogin((res) => {
								console.log("wechatLogin方法返回数据为：" + res)
								
								me.admin_flag = res['is_admin']
								
								if(res['rl_company_id'].length>0){
									//此时有组织id
									if(me.admin_flag === 1){
										uni.reLaunch({
											url:"/pages/admin/index"
										})
									}else{
										uni.reLaunch({
											url:"/pages/index/SelectDeviceType",
											// url:"/pages/index/indexForBushuqiOnly"
										})
									}
								}else{
									me.showFlag = true
								}
							})
						} else if (res.cancel) {
			
						}
					}
				})
			},
			
			loginTest(){
				this.wechatLogin()		
			},
			
			onInputUserName(e) {
				this.userName = e.detail.value
			},
			
			onInputUserPassword(e) {
				this.userPassword = e.detail.value
			},
			
			popupClose() {
				this.showFlag = false
			}
		}
	}
</script>

<style>
	
	page{
		background-color: #FFFFFF;
		height: 100%;
	}
	
	.content{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	
	.content_middle{
		width: 100%;
		/* height: 40%; */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}
	
	.middle_top{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-left: 30rpx;
		padding-right: 30rpx;
		box-sizing: border-box;
		width: 100%;
	}
	
	.logo_img{
		width: 80%;
		height: 80%;
	}
	
	.login_title{
		margin-top: -80rpx;
		font-size: 40rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: 800;
		color: #175171;
	}
	
	.btn {
		margin-top: 80rpx;
		background-color: #28B2FF;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		height: 100rpx;
		border-radius: 90rpx;
		display: flex;
		flex-direction: row;
		justify-content: center;
		color: #FFFFFF;
		font-weight: 400;
		font-size: 30rpx;
		align-items: center;
	}
	
	.btn .icon-phone {
		width: 44rpx;
		height: 36rpx;
		margin-right: 20rpx;
	}
	
	.login_input_name {
		margin-top: 50rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		padding: 30rpx 0 30rpx 0;
		background-color: #F1F4F6;
		border-radius: 90rpx;
		text-align: center;
		font-size: 28rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
	}
	
	.login_input_password {
		margin-top: 30rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		padding: 30rpx 0 30rpx 0;
		background-color: #F1F4F6;
		border-radius: 90rpx;
		text-align: center;
		font-size: 28rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
	}
	
	.login_bottom {
		margin-top: 50rpx;
		padding: 30rpx 0 30rpx 0;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	
	.login_btn {
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		height: 100rpx;
		height: 90rpx;
		border-radius: 90rpx;
		background: #28B2FF;
		font-size: 30rpx;
		font-weight: 1000;
		color: #FFFFFF;
		text-align: center;
		font-family: PingFangSC-Medium, PingFang SC;
		line-height: 90rpx;
	}
	
	.yuding_view {
		background-color: #28B2FF;
		display: flex;
		flex-direction: column;
		padding: 30rpx;
		align-items: center;
		border-radius: 10rpx;
	}
	
	.popup_title {
		color: white;
		font-size: 40rpx;
		font-weight: 300;
	}
	
	.popup_name {
		margin-top: 30rpx;
		background-color: white;
		border-radius: 10rpx;
		padding: 30rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
	
		font-size: 28rpx;
		color: black;
	
		width: 100%;
		box-sizing: border-box;
	}
	
	.view_btn_yuyue {
		text-align: center;
		margin-top: 30rpx;
		padding: 30rpx 0;
		font-weight: 800;
		font-size: 30rpx;
		width: 100%;
		color: white;
		background-color: #fe2c55;
		border-radius: 90rpx;
	}
	
	.login_admin1{
		height: 36rpx;
		margin-top: 10rpx;
		align-self: flex-end;
		margin-right: 30rpx;
		color: #28B2FF;
		font-weight: 400;
		font-size: 30rpx;
	}
	
	.login_admin{
		height: 36rpx;
		margin-top: 10rpx;
		align-self: flex-end;
		margin-right: 30rpx;
		color: #28B2FF;
		font-weight: 400;
		font-size: 30rpx;
	}
	
	button::after{
		border: none;
	}
	
</style>