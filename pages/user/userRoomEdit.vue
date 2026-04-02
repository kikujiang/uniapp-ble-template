<template>
	<view class="content">
		<view class="device_detail">
			<text class="detail_title">区域名称</text>
			<input class="detail_content" placeholder="请输入区域名称" placeholder-class="detail_content_placeholder" type="text" :value="currentName" @blur="inputName"
				@confirm="inputName" @input="inputName"/>
		</view>
		
		<button class="bottom_btn" @click="save">{{btnName}}</button>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		data() {
			return {
				currentId:-1,
				currentName:"",
				btnName:"新增"
			}
		},
		
		onLoad(option) {
			console.log(option.id)
			
			if(option.id != null){
				uni.setNavigationBarTitle({
					title:'编辑区域'
				})
				this.currentId = option.id
				this.currentName = option.name
				this.btnName = "保存"
			}else{
				uni.setNavigationBarTitle({
					title:'新增区域'
				})
			}
		},
		
		methods: {
			inputName(e) {
				this.currentName = e.detail.value
			},
			
			save(){
				if(this.currentId == -1){
					this.addRoom()
				}else{
					this.editRoom()
				}
			},
			
			addRoom(){
				if(this.currentName.length == 0){
					
					uni.showToast({
						title:"区域位置不为空",
						icon:"error"
					})
					return
				}
				
				http.send('room/add', 'POST', {
					name:this.currentName
				}, (res) => {
					if (res.code == 0) {
						console.log("新增信息返回数据为:",res.data)
						
						uni.showToast({
							title:"新增成功",
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
						title: '新增区域信息异常',
						icon: 'error'
					})
				})
			},
			
			editRoom(){
				if(this.currentName.length == 0){
					
					uni.showToast({
						title:"区域位置不为空",
						icon:"error"
					})
					
					return
				}
				
				http.send('room/edit', 'POST', {
					id:this.currentId,
					name:this.currentName
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
						title: '更改区域信息异常',
						icon: 'error'
					})
				})
			}
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
		padding: 0 30rpx 0 30rpx;
	}
	
	.device_detail{
		margin-top: 30rpx;
		width: calc(100%);
		height: 80rpx;
		
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	
	.detail_title{
		margin-left: 30rpx;
		font-size: 36rpx;
		font-weight: 500;
		color: #000;
		font-family: "PingFang SC";
	}
	
	.divider{
		width: calc(100% - 60rpx);
		height: 1rpx;
		background-color: #BBBBBB;
	}
	
	.detail_content{
		margin-right: 30rpx;
		text-align: right;
		
		font-size: 36rpx;
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
	
	.bottom_btn{
		width: 100%;
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
	}
</style>
