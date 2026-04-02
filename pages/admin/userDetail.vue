<template>
	<view class="content">
		<view class="login_bg"></view>
		<view class="navBar" :style="{height: custom_bar + 'px'}">
			<view class="back_view" @click="back">
				<image class="navi_back" :style="{marginTop:status_bar+'px'}" src="../../static/back.png"></image>
			</view>
			<view class="nav_title" :style="{marginTop:status_bar+'px'}">{{currentTitle}}</view>
		</view>
		
		<!-- 顶部信息 -->
		<view class="content_top">
			<view class="top_left">
				<text v-if="currentUser != null" class="device_name1">手机号码：{{currentUser.code}}</text>
				<text v-if="currentUser != null" class="device_name1">场所名称：{{currentUser.name}}</text>
			</view>
			<image v-show="false" src="../../static/index/edit.png" class="top_edit" @click="naviEdit()"></image>
		</view>
		
		<view v-if="list_user_device.length > 0" class="device_list_content">
			
			<view class="item_device_content1" v-for="(item,index) in list_user_device":key="index" @click="naviLog(item)">
				<view class="item_device_content">
					<image class="device_bg" src="../../static/index/item_normal.png"></image>
					<view class="device_left">
						<text class="device_name">{{item.alias_name}}</text>
						<text class="device_location">{{item.address}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view v-else class="empty_view">
			<image class="empty_image" src="../../static/index/nodata.png"></image>
		</view>
	</view>
</template>

<script>
	import u_storage from '@/common/u-storage.js'
	import http from '@/common/http.js'
	import util from '@/common/util.js'
	export default {
		
		data() {
			return {
				currentUser:null,
				currentTitle:"用户详情",
				custom_bar: u_storage.get_custombar(),
				status_bar: u_storage.get_statusbar(),
				list_user_device:[]
			}
		},
		
		onLoad(option) {
			let me = this
			me.currentUser = JSON.parse(decodeURIComponent(option.userInfo))
			
			if(me.currentUser != null){
				me.currentTitle = me.currentUser.nick_name
				me.fetchDeviceList()
			}
			
		},
		
		onShow() {
			this.getUserInfo()
		},
		
		methods: {
			
			getUserInfo(){
				let me = this
				http.send('Company/detail?id='+me.currentUser.id, 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取用户信息为:",res.data)
						me.currentUser = res.data
						me.currentTitle = me.currentUser.name
					}
				}, (res) => {
					console.log("获取用户信息异常为:",res.data)
				})
			},
			back(){
				uni.navigateBack({
					delta:1
				})
			},
			naviLog(item){
				uni.navigateTo({
					url:'/pages/admin/adminLog?id='+item.id+"&userInfo="+encodeURIComponent(JSON.stringify(this.currentUser))
				})
			},
			naviEdit(){
				uni.navigateTo({
					url:'/pages/admin/accoutEdit?userInfo='+encodeURIComponent(JSON.stringify(this.currentUser))
				})
			},
			//获取设备列表
			fetchDeviceList(){
				let me = this
				http.send('Company/get_device_list?id='+me.currentUser.id, 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取设备列表数据为:",res.data)
						me.list_user_device = res.data
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '获取设备列表异常',
						icon: 'error'
					})
				})
			},
			
		}
	}
</script>

<style>

	page{
		height:100%;
	}
	
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}
	
	button::after{
		border: none;
	}
	
	.login_bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 374rpx;
		background-color: #4C92E5;
		z-index: -1;
	}
	
	.navBar {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		z-index: 100;
		position: relative;
	}
	
	.navi_back{
		width: 24rpx;
		height: 43rpx;
	}
	
	.back_view{
		position: absolute;
		left: 30rpx;
		width: 83rpx;
		height: 83rpx;
		display: flex;
		justify-content: center;
	}
	
	.nav_title {
		font-size: 36rpx;
		font-weight: 300;
		color: white;
		font-family: "PingFang SC";
	}
	
	.content_top{
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		height: 120rpx;
		margin-top: 40rpx;
		border-radius: 10rpx;
		width: calc(100% - 60rpx);
		padding: 30rpx;
	}
	
	.top_left{
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 120rpx;
	}
	
	.device_name1{
		font-size: 36rpx;
		font-weight: bold;
		color: white;
		font-family: "PingFang SC";
	}
	
	.top_edit{
		width: 40rpx;
		height: 40rpx;
	}
	
	.device_location1{
		font-size: 28rpx;
		font-weight: 500;
		color: white;
		font-family: "PingFang SC";
	}
	
	.item_user_data{
		display: flex;
		flex-direction: column;
		margin: 0 30rpx 30rpx 30rpx;
		
		border-radius: 10rpx;
		background-color: #fff;
		border-color: #BBBBBB;
		border-width: 1rpx;
		border-style: solid;
		
		padding: 10rpx;
	}
	
	.item_content{
		/* margin-top: 30rpx; */
		display: flex;
		flex-direction: row;
		align-items: center;
		
		font-size: 28rpx;
		font-weight: 800;
		color: #000000;
	}
	
	.item_content1{
		font-size: 25rpx;
		font-weight: 500;
		color: #101010;
		margin-left: 30rpx;
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
		margin-bottom: 30rpx;
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
		margin-top: 40rpx;
		height: 100rpx;
		justify-content: space-between;
		overflow: hidden;
		white-space: nowrap;
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
	
	.empty_view{
		width: 100%;
		height: 300rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.empty_image{
		width: 300rpx;
		height: 300rpx;
	}
	
</style>
