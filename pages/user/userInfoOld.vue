<template>
	<view>
		<view class="box_info">
			
			<button class="detail_title_right" open-type="chooseAvatar"  @chooseavatar='onChooseAvatar'>
				<view class="title">
					<view class="item-text">头像</view>
				</view>
				<image v-if="currentUserInfo!=null && currentUserInfo.avatar" :src="currentUserInfo.avatar" class="img_left" mode="widthFix"></image>
				<image v-else src="../../static/user/avatar_man.png" class="img_left"></image>
				<!-- <image src="../../static/arrow_right.png" class="img_right"></image> -->
			</button>
			
			<view style="background-color: #f5f5f5;width: 100%;height: 1rpx;"></view>
			<!-- 昵称 -->
			<view class="device_detail">
				<view class="title">
					<view class="item-text">昵称</view>
				</view>
				<input class="detail_content" placeholder="请输入昵称" placeholder-style="color:#666666;font-weight: 100;font-size:28rpx" type="nickname" :value="userName" @blur="inputUserName" @confirm="inputUserName" @input="inputUserName"/>
			</view>
			
			<view style="background-color: #f5f5f5;width: 100%;height: 1rpx;"></view>
			<!-- 公司代码 -->
			<view class="device_detail">
				<view class="title">
					<view class="item-text">公司代码</view>
				</view>
				<input class="detail_content" placeholder="请输入公司代码" placeholder-style="color:#666666;font-weight: 100;font-size:28rpx" type="text" :value="companyCode" @confirm="inputCompanyCode" @input="inputCompanyCode"/>
			</view>
			
			<view style="background-color: #f5f5f5;width: 100%;height: 1rpx;"></view>
			<!-- 公司名称 -->
			<view class="device_detail">
				<view class="title">
					<view class="item-text">公司名称</view>
				</view>
				<input class="detail_content" placeholder="请输入公司名称" placeholder-style="color:#666666;font-weight: 100;font-size:28rpx" type="text" :value="companyName" @confirm="inputCompanyName" @input="inputCompanyName"/>
			</view>
		</view>
		<button class="bottom_btn" @click="save">保存</button>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		
		onShow() {
			this.getUserInfo()
		},
		
		data() {
			return {
				currentUserInfo:null,
				userName:'',
				companyCode:'',
				companyName:''
			}
		},
		methods: {
			
			inputCompanyName(e) {
				this.companyName = e.detail.value
			},
			inputCompanyCode(e) {
				this.companyCode = e.detail.value
			},
			inputUserName(e) {
				this.userName = e.detail.value
			},
			
			onChooseAvatar(e) {
				let me = this
				console.log("选中的头像地址 = " + JSON.stringify(e))
				let avatarUrl = e.detail.avatarUrl
				this.currentUserInfo.avatar = avatarUrl
				
				http.uploadImg('file/upload_image', 'POST', this.currentUserInfo.avatar, (res) => {
					let result = JSON.parse(res)
					if (result.code == 0) {
						console.log("上传头像成功！")
						me.currentUserInfo.avatar = result.data
					} 
				}, (res) => {
					
				})
			},
			save(){
				
				// if(this.userName.length == 0){
				// 	uni.showToast({
				// 		title:"用户昵称为空！",
				// 		icon:"error"
				// 	})
					
				// 	return
				// }
				
				if(this.companyCode.length == 0){
					uni.showToast({
						title:"公司代码为空",
						icon:"error"
					})
					
					return
				}
				
				if(this.companyName.length == 0){
					uni.showToast({
						title:"公司名称为空",
						icon:"error"
					})
					
					return
				}
				
				if(this.currentUserInfo.avatar == null){
					uni.showToast({
						title:"头像不能为空",
						icon:"error"
					})
					
					return
				}
				
				http.send('user/setup_info', 'POST', {
					avatar:this.currentUserInfo.avatar,
					username:this.userName,
					company_code:this.companyCode,
					company_name:this.companyName
				}, (res) => {
					if (res.code == 0) {
						console.log("更改信息返回数据为:",res.data)
						
						uni.showToast({
							title:"保存成功",
							icon:"success"
						})
						
						setTimeout(function() {
						  // 在这里编写延迟后要执行的代码
						  uni.navigateBack({
						  	delta:1
						  })
						}, 800);
						
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '更改信息异常',
						icon: 'error'
					})
				})
			},
			
			getUserInfo(){
				let me = this
				http.send('user/info', 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取用户信息为:",res.data)
						me.currentUserInfo = res.data
						me.userName = me.currentUserInfo.user_name
						me.companyCode = me.currentUserInfo.company_code
						me.companyName = me.currentUserInfo.company_name
					}
				}, (res) => {
					console.log("获取用户信息异常为:",res.data)
				})
			},
		}
	}
</script>

<style>
	page{
		background: #f5f5f5;
		padding: 40rpx;
		box-sizing: border-box;
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
		background-color: white;
		width: 100%;
		padding-left: 10rpx;
		padding-top: 20rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		box-sizing: border-box;
	}
	
	.detail_title{
		margin-left: 30rpx;
		font-size: 30rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
		flex: 1;
	}
	
	.divider{
		width: calc(100% - 60rpx);
		height: 1rpx;
		background-color: #BBBBBB;
	}
	
	.detail_content{
		height: 100rpx;
		background-color: white;
		border-radius: 10rpx;
		text-align: right;
		font-size: 30rpx;
		line-height: 100rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
		color: #666666;
		padding-left: 10rpx;
		flex: 1;
		text-indent: 16rpx;
	}
	
	.detail_content_placeholder{
		font-size: 28rpx;
		font-weight: 500;
		color: #666666;
		font-family: "PingFang SC";
	}
	
	.detail_title_right{
		display: flex;
		width: 100%;
		height: 120rpx;
		align-items: center;
		flex-direction: row;
		padding-left: 10rpx !important;
		padding-right: 20rpx !important;
		background-color: white;
		justify-content: space-between;
		
	}
	
	.img_left{
		width: 70rpx;
		/* height: 70rpx; */
		border-radius: 35rpx;
		background: #008AE5;
	}
	
	.img_right{
		margin-left: 10rpx;
		width: 40rpx;
		height: 40rpx;
	}
	
	.bottom_btn{
		margin-top: 50rpx;
		border-radius: 200rpx;
		background-color: #28B2FF;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
		color: white;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
		font-size: 32rpx;
		box-shadow: 0 0.25rem 0.65625rem 0.0625rem rgba(0, 0, 0, .2);
		position: absolute;
		bottom: 60rpx;
		left: 40rpx;
		right: 40rpx;
	}
	
	button::after{
		border: none;
	}
	
	.box_info {
		border-radius: 20rpx;
		box-shadow: 0 0.25rem 0.65625rem 0.0625rem rgba(0, 0, 0, .1);
		overflow: hidden;
		padding: 10rpx 30rpx;
		background: #fff;
	}
	
	.title {
		color: #101010;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		flex-direction: row;
		font-weight: 500;
	}
	
	.item-text {
		color: #101010;
		font-size: 28rpx;
		font-weight: 500;
		text-align: right;
		/* margin-left: 15rpx; */
	}
	
</style>
