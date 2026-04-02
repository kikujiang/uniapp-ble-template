<template>
	<view class="content">
		<view class="login_bg" ></view>
		<view class="navBarBox" :style="{height: custom_bar + 'px'}">
			<view class='statusBar' :style="{height: status_bar + 'px'}"></view>
			<view class="navBar">
				<view class="nav_title">我的</view>
			</view>
		</view>
		
		<view class="view_top" :style="{marginTop:status_bar+'px'}">
			<image  v-if="currentUserInfo != null && currentUserInfo.avatar != null" class="top_img" :src="currentUserInfo.avatar" mode="widthFix"></image>
			<image v-else class="top_img" :src="imageUrl" mode="widthFix"></image>
			<view class="top_right">
				<view v-if="currentUserInfo != null && currentUserInfo.user_name != null" class="user_name">{{currentUserInfo.user_name}}</view>
				<view v-else class="user_name" @click="toLogin()">未登录</view>
			</view>
		</view>
		
		<view class="view_content">
			<view class="content_item" :style="{marginTop:'40rpx'}" @click="naviUserInfo()">
				<image class="item_img" src="/static/user/need_user_info.png"></image>
				<text class="item_text">个人信息</text>
				<view class="item_right">
					<image class="item_img_right_arrow" src="../../static/arrow_right.png" mode="widthFix"></image>
				</view>
			</view>
			<view v-if="currentUserInfo.is_admin === 0" class="item_divider"></view>
			<view v-if="currentUserInfo.is_admin === 0" class="content_item" :style="{marginTop:'40rpx'}" @click="naviRoomInfo()">
				<image class="item_img" src="/static/user/location.png"></image>
				<text class="item_text">区域管理</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
			<view v-if="currentUserInfo.is_admin === 0" class="item_divider"></view>
			<view v-if="currentUserInfo.is_admin === 0" class="content_item" :style="{marginTop:'40rpx'}" @click="naviUserData()">
				<image class="item_img" src="/static/user/history_logo.png"></image>
				<text class="item_text">数据分析</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
			<view class="item_divider"></view>
			<view class="content_item" :style="{marginTop:'40rpx'}" @click="naviInstructions()">
				<image class="item_img" src="/static/user/user_instructions.png"></image>
				<text class="item_text">使用手册</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
			<view class="item_divider"></view>
			<view class="content_item" :style="{marginTop:'40rpx'}" @click="naviCompanyInfo()">
				<image class="item_img" src="/static/user/user_logo.png"></image>
				<text class="item_text">关于我们</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
			<view class="item_divider"></view>
			<view class="content_item" :style="{marginTop:'40rpx'}" @click="naviContactInfo()">
				<image class="item_img" src="/static/user/contact_logo.png"></image>
				<text class="item_text">联系我们</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
			<view class="item_divider"></view>
			<view class="content_item" :style="{marginTop:'40rpx'}" @click="exit()">
				<image class="item_img" src="/static/user/my_exit.png"></image>
				<text class="item_text">退出</text>
				<image class="item_img_arrow" src="../../static/arrow_right.png"></image>
			</view>
	
		</view>
		<u-toast ref="uToast"></u-toast>
		<!-- <user-service-prompt ref="dialog-service" :dialogVisible="dialogServiceVisible" @cancel="cancelServiceDialog"
			@onlineService="onlineService"></user-service-prompt>
		<wechat-enterprise-dialog :dialogVisible="displayOnLineServiceDialog" @cancel="cancelDialogOnLineService">
		</wechat-enterprise-dialog> -->
	</view>
	
</template>

<script>
	import u_storage from '@/common/u-storage.js'
	import http from '@/common/http.js'
	import user_util from '@/common/user-util.js'
import toast from '../../uni_modules/uview-ui/libs/config/props/toast';
	export default {
		data() {
			return {
				custom_bar: u_storage.get_custombar(),
				status_bar: u_storage.get_statusbar(),
				imageUrl:"../../static/user/avatar_man.png",
				currentUserInfo:null,
				dialogServiceVisible: false,
				displayOnLineServiceDialog: false,
				isShowLogin:false
			};
		},
		
		onLoad() {
			console.log('======我的加载中======')
		},
		
		onShow() {
			console.log('======我的显示======')
			this.checkLoginInfo()
		},
		
		onHide() {
			console.log('======我的隐藏======')
		},
		
		methods:{
			exit(){
				user_util.clearLoginInfo()
				uni.reLaunch({
					url:'/pages/login/login'
				})
			},
			getUserInfo(){
				let me = this
				http.send('user/info', 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取用户信息为:",res.data)
						me.currentUserInfo = res.data
					}
				}, (res) => {
					console.log("获取用户信息异常为:",res.data)
				})
			},
			
			//获取本地缓存用户信息
			checkLoginInfo(){
				if (!user_util.is_login()) {
					//未登录时显示登录控件
					this.isShowLogin = true
				}else{
					this.isShowLogin = false
					this.getUserInfo()
				}
			},
			
			imageError(){
				
			},
			cancelServiceDialog() {
				this.dialogServiceVisible = false
			},
			onlineService() {
				this.dialogServiceVisible = false
				this.displayOnLineServiceDialog = true
			},
			clickService() {
				this.dialogServiceVisible = true
			},
			cancelDialogOnLineService() {
				this.displayOnLineServiceDialog = false
			},
			
			naviUserInfo(){
				
				if(this.isShowLogin){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}
				
				uni.navigateTo({
					url:'/pages/user/userInfo'
				})
			},
			naviUserData(){
				if(this.isShowLogin){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}
				uni.navigateTo({
					url:'/pages/user/userData'
				})											
			},
			naviCompanyInfo(){
				uni.navigateTo({
					url:'/pages/user/userCompanyInfo'
				})
			},
			naviContactInfo(){
				uni.navigateTo({
					url:'/pages/user/ContactInfo'
				})
			},
			naviRoomInfo(){
				if(this.isShowLogin){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					return
				}
				uni.navigateTo({
					url:'/pages/user/userRoom'
				})
			},
			naviInstructions(){
				this.toast("还在完善中，敬请期待")
				// uni.navigateTo({
				// 	url:'/pages/user/userInstructions'
				// })
			},
			toLogin(){
				uni.navigateTo({
					url:'/pages/login/login'
				})
			},
			toast(msg){
				this.$refs.uToast.show({
					message:msg
				})
			}
		}
	}
</script>

<style lang="scss">
	
	page{
		background-color: #F7F7F7;
		// height:100%;
	}
	
	.content {
		// height:100%;
		display: flex;
		flex-direction: column; /* 修改为纵向排列 */
		position: relative;
		align-items: center;
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
	
	.nav_title {
		font-size: 36rpx;
		font-weight: 800;
		color: white;
		font-family: "PingFang SC";
	}
	
	.view_top{
		padding: 0 30rpx 0 30rpx;
		width: calc(100%);
		z-index: 100;
		display: flex;
		flex-direction: row;
		align-items: center;
		box-sizing: border-box;
	}
	
	.top_img{
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
	}
	
	.top_right{
		margin-left: 20rpx;
	}
	
	.user_name{
		font-size: 32rpx;
		font-weight: 600;
		color: white;
		line-height: 45rpx;
		font-family: "PingFang SC";
	}
	
	.view_content{
		margin-top: 50rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		padding-bottom: 40rpx;
		display: flex;
		flex-direction: column;
		background-color: white;
		width: 690rpx;
		z-index: 100;
		border-radius: 45rpx;
		justify-content: space-between;
	}
	
	.content_item{
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		flex: 1;
		margin: 0 30rpx;
	}
	
	.item_divider{
		background-color: #E1E1E1;
		height: 1rpx;
		margin-top: 40rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
	}
	
	.item_img{
		width: 30rpx;
		height: 30rpx;
	}
	
	.item_text{
		margin-left: 20rpx;
		font-size: 28rpx;
		font-weight: 400;
		line-height: 39rpx;
		color: #505050;
		font-family: "PingFang SC";
	}
	
	.item_right{
		position: absolute;
		display: flex;
		flex-direction: row;
		align-items: center;
		right: 0;
		font-size: 24rpx;
		font-weight: 400;
		line-height: 34rpx;
		color: #494444;
		font-family: "PingFang SC";
	}
	
	.item_img_arrow{
		width: 24rpx;
		height: 24rpx;
		position: absolute;
		right: 0;
	}
	
	.item_img_right_arrow{
		width: 24rpx;
		margin-left: 10rpx;
	}
	
	.img_kefu{
		width: 80rpx;
		height: 80rpx;
		position: absolute;
		right:30rpx;
		bottom:30rpx;
	}
</style>