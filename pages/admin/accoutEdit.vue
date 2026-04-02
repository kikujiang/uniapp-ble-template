<template>
	<view class="content">
		
		<view class="device_detail">
			<text class="detail_title">账户名称</text>
			<text v-if="currentUser != null" class="detail_content">{{currentUser.user_name}}</text>
		</view>
		
		<view class="divider"></view>
		
		<view class="device_detail">
			<text class="detail_title">客户名称</text>
			<input class="detail_content" placeholder="请设置客户名称" placeholder-class="detail_content_placeholder" type="text" :value="userName" @blur="inputName"
				@confirm="inputName" @input="inputName"/>
		</view>
		
		<view class="divider"></view>
		<!-- 昵称 -->
		<view class="device_detail">
			<text class="detail_title">客户密码</text>
			<input class="detail_content" placeholder="请设置客户密码" placeholder-class="detail_content_placeholder" type="text" :value="userPwd" @blur="inputPwd"
				@confirm="inputPwd" @input="inputPwd"/>
		</view>
		
		<button class="bottom_btn" @click="save">保存</button>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		data() {
			return {
				currentUser:null,
				userName:"",
				userPwd:""
			}
		},
		
		onLoad(option) {
			let me = this
			me.currentUser = JSON.parse(decodeURIComponent(option.userInfo))
			
			if(me.currentUser != null){
				me.userName = me.currentUser.nick_name
				me.userPwd = me.currentUser.pwd
			}
		},
		
		methods: {
			inputName(e) {
				this.userName = e.detail.value
			},
			inputPwd(e) {
				this.userPwd = e.detail.value
			},
			save(){
				if(this.userName.length == 0){
					uni.showToast({
						title:"名称为空",
						icon:"error"
					})
					
					return
				}
				
				if(this.userPwd.length == 0){
					
					uni.showToast({
						title:"密码为空",
						icon:"error"
					})
					
					return
				}
				
				let me = this
				http.send('user/update_user_info', 'POST', {
					modify_uid:me.currentUser.id,
					nick_name:me.userName,
					pwd:me.userPwd,
				}, (res) => {
					if (res.code == 0) {
						console.log("编辑用户信息返回数据为:",res.data)
						
						uni.showToast({
							title:"保存成功",
							icon:"success"
						})
						
						setTimeout(function() {
						  // 在这里编写延迟后要执行的代码
						  uni.navigateBack({
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
					uni.showToast({
						title: '编辑信息异常',
						icon: 'error'
					})
				})
			},
		}
	}
</script>

<style>
	page{
		height: 100%;
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
		height: 100rpx;
		
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
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
		margin-right: 30rpx;
		text-align: right;
		
		font-size: 28rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.detail_content_placeholder{
		font-size: 28rpx;
		font-weight: 500;
		color: #666666;
		font-family: "PingFang SC";
	}
	
	.detail_title_right{
		/* display: flex;
		flex-direction: row;
		align-items: center; */
		
		/* padding-left: 0rpx !important; */
		/* padding-right: 0rpx !important; */
		/* width: 100%; */
		/* margin-top: 30rpx; */
		height: 100rpx;
		background-color: transparent;
		display: flex;
		flex-direction: row;
		align-items: center;
		align-self: flex-end;
	}
	
	.bottom_btn{
		width: calc(100% - 60rpx);
		margin-top: 30rpx;
		height: 80rpx;
		background-color: #1F95E9;
		
		font-size: 30rpx;
		color: #fff;
		font-family: "PingFang SC";
		font-weight: 300;
		line-height: 80rpx;
		
		border-radius: 30rpx;
	}
</style>