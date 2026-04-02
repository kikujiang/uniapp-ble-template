<template>
	<view>
		<view class="box_info">
			<view class="device_detail">
				<text class="detail_title">设备名称</text>
				<input class="detail_content" placeholder="请输入名称" placeholder-class="detail_content_placeholder" type="text" :value="device_name" @blur="inputName"
					@confirm="inputName" @input="inputName"/>
			</view>
			
			<view style="background-color: #f5f5f5;width: 100%;height: 1rpx;"></view>
			<!-- 安装位置 -->
			<view class="device_detail">
				<text class="detail_title">安装位置</text>
				<input class="detail_content" placeholder="请输入位置" placeholder-class="detail_content_placeholder" type="text" :value="device_location" @blur="inputLocation"
					@confirm="inputLocation" @input="inputLocation"/>
			</view>
			
			<view style="background-color: #f5f5f5;width: 100%;height: 1rpx;"></view>
			<!-- 区域位置 -->
			<view class="device_detail" @click="clickRoom()">
				<text class="detail_title">区域位置</text>
				<text class="detail_content">{{currentRoom}}</text>
			</view>
		</view>
		<button class="bottom_btn" @click="save">保存</button>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		data() {
			return {
				device_name:'',
				device_location:'',
				device_id:-1,
				currentRoom:"",
				currentRoomId:-1
			}
		},
		
		onLoad(option) {
			let me = this
			console.log('======编辑设备加载中======')
			
			this.device_id = option.id
			this.device_name = option.name
			this.device_location = option.address
			this.currentRoom = option.roomName
			this.currentRoomId = option.roomId
			
			console.log("当前设备的id：",this.device_id,"设备名称：",this.device_name,"设备位置：",this.device_location)
			
			uni.$on('dataFromRoom', (data) => {
			      console.log('接收到的数据:', data);
					// 处理接收到的数据
					me.currentRoom = data.name
					me.currentRoomId = data.id
			    });
		},
		
		onShow() {
			console.log('======编辑设备显示======')
		},
		
		onHide() {
			console.log('======编辑设备隐藏======')
		},
		
		methods: {
			save(){
				if(this.device_name.length == 0){
					uni.showToast({
						title:"设备名称为空",
						icon:"error"
					})
					
					return
				}
				
				if(this.device_location.length == 0){
					
					uni.showToast({
						title:"设备位置为空",
						icon:"error"
					})
					
					return
				}
				
				let me = this
				http.send('Device/update_device', 'POST', {
					device_id:this.device_id,
					device_addr:this.device_location,
					room_id:this.currentRoomId,
					device_alias_name:this.device_name
				}, (res) => {
					if (res.code == 0) {
						console.log("编辑信息返回数据为:",res.data)
						
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
			inputName(e) {
				this.device_name = e.detail.value
			},
			inputLocation(e) {
				this.device_location = e.detail.value
			},
			clickRoom(){
				uni.navigateTo({
					url:"/pages/user/userRoom?type=1"
				})
			}
		}
	}
</script>

<style>

	page{
		/* height: 100%; */
		background: #f5f5f5;
		padding: 40rpx;
		box-sizing: border-box;
	}
	
	button::after{
		border: none;
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
		/* margin-left: 30rpx; */
		font-size: 26rpx;
		font-weight: 500;
		
		color: #101010;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		flex-direction: row;
		font-weight: 500;
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
		font-size: 23rpx;
		font-weight: 500;
		color: #666666;
		font-family: "PingFang SC";
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
	
	.box_info {
		border-radius: 20rpx;
		box-shadow: 0 0.25rem 0.65625rem 0.0625rem rgba(0, 0, 0, .1);
		overflow: hidden;
		padding: 10rpx 30rpx;
		background: #fff;
	}
	
</style>
