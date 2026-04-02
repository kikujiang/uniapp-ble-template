<template>
	<view class="content">
		
		<view class="title_view">
			<view class="start_time" @click="clickStartTime">
				<text v-if="startTimeStr.length>1">{{startTimeStr}}</text>
				<text v-else>开始时间</text>
				<image class="arrow_down" src="../../static/index/arrow_down.png"></image>
			</view>
			<view class="end_time"  @click="clickEndTime">
				<text v-if="endTimeStr.length>1">{{endTimeStr}}</text>
				<text v-else>结束时间</text>
				<image class="arrow_down" src="../../static/index/arrow_down.png"></image>
			</view>
			
			<image src="../../static/index/search.png" class="search_img" @click="search"></image>
		</view>
		
		<view v-if="user_record_data !=null && user_record_data.length > 0" class="view_data">
			<view v-for="(item,index) in user_record_data" :key="index" class="record_content">
				
				<view v-if="item.type == 1" class="record_content1">
					<text class="record_text">{{getTime(item.time_add)}}</text>
					<text class="record_text1">更换气罐</text>
				</view>
				
				<view v-else class="record_content1">
					<text class="record_text">{{getTime(item.time_record)}}</text>
					<text class="record_text1">灭杀成功</text>
					<text class="record_text1">环境温度{{item.temperature}}°C</text>
				</view>
			</view>
			
			<view style="font-size: 24rpx;color: #666666;text-align: center;margin-top: 30rpx;" v-if="isReachBottom">已经到底了~</view>
		</view>
		
		<view class="empty_view" v-else>
			<image class="empty_image" src="../../static/index/nodata.png"></image>
		</view>
		
		<u-datetime-picker
				:show="dateTimeshow"
				v-model="value"
				mode="date"
				@confirm="confirm"
				@cancel="cancel"
				:min-date="minValue"
		></u-datetime-picker>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	import util from '@/common/util.js'
	export default {
		data() {
			return {
				user_record_data:[],
				dateTimeshow:false,
				startTimeStr:"",
				endTimeStr:"",
				isStart:false,
				value:"",
				minValue:0,
				maxValue:0,
				mPage: 1,
				isloading: false,
				pageCount: 0,
				total: 0,
				isReachBottom: false,
				currentId:-1
			}
		},
		
		onLoad(option) {
			console.log('======设备日志加载中======')
			const timeFormat = uni.$u.timeFormat
			const date = new Date;
			this.value = timeFormat(date, 'yyyy-mm-dd')
			
			this.currentId = option.id
		},
		
		onShow() {
			console.log('======设备日志显示======')
			
			this.getLogData()
		},
		
		onHide() {
			console.log('======设备日志隐藏======')
		},
		
		onPullDownRefresh() {
			console.log("onPullDownRefresh called!")
		},
		
		// 触底的事件
		onReachBottom() {
			console.log("onReachBottom called!")
			
			if (this.user_record_data.length % 20) {
				this.isReachBottom = true
				return
			}
			// 判断是否正在请求其它数据，如果是，则不发起额外的请求
			if (this.isloading) return
			// 让页码值自增 +1
			this.mPage += 1
			this.getLogData()
		},
		
		methods: {
			search(){
				if(this.startTimeStr.length<1){
					uni.showToast({
						title: '请输入开始时间',
						icon:"error"
					});
					return
				}
				
				if(this.endTimeStr.length<1){
					uni.showToast({
						title: '请输入结束时间',
						icon:"error"
					});
					return
				}
				this.isReachBottom = false
				this.resetPage()
				this.getLogData()
			},
			clickStartTime(){
				this.dateTimeshow = true
				this.isStart = true
			},
			
			clickEndTime(){
				this.dateTimeshow = true
				this.isStart = false
			},
			confirm(e){
				const timeFormat = uni.$u.timeFormat
				if(this.isStart){
					this.startTimeStr = timeFormat(e.value, 'yyyy-mm-dd')
					const date = new Date(this.startTimeStr)
					this.minValue = date.getTime()/1000
					console.log("开始时间为：",this.startTimeStr,"，开始时间戳为：",this.minValue)
				}else{
					this.endTimeStr = timeFormat(e.value, 'yyyy-mm-dd')
					const date = new Date(this.endTimeStr)
					this.maxValue = date.getTime()/1000
					console.log("结束时间为：",this.endTimeStr,"，结束时间戳为：",this.maxValue)
				}
				
				this.dateTimeshow = false
				
				this.getLogData()
			},
			cancel(){
				this.dateTimeshow = false
			},
			getLogData(){
				let me = this
				me.isloading = true
				http.send('record/get_list', 'GET', {
					page: this.mPage,
					start_time: this.minValue,
					end_time: this.maxValue,
					page_size:20,
					device_id:this.currentId
				}, (res) => {
					if (res.code == 0) {
						
						let count = res.data.length
						
						if(me.mPage>1 && count < 20){
							me.isReachBottom = true
						}
						
						if (me.mPage == 1) {
							me.user_record_data = res.data
						} else {
							me.user_record_data = [...me.user_record_data, ...res.data]
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
					
					me.isloading = false
				}, (res) => {
					uni.hideLoading()
					uni.showToast({
						title: '获取信息异常',
						icon: 'error'
					})
					me.isloading = false
				})
			},
			
			resetPage() {
				this.mPage = 1
			},
			
			getTime(timestamp){
				return util.formatTime(timestamp)
			}
		}
	}
</script>

<style>
	
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
	
	.title_view{
		width: calc(100% - 60rpx);
		/* height: 108rpx; */
		display: flex;
		flex-direction: row;
		color: #666666;
		line-height: 36rpx;
		font-size: 26rpx;
		font-weight: 400;
		font-family: "PingFang SC";
		margin-top: 30rpx;
		align-items: center;
	}
	
	.start_time{
		flex-grow: 1;
		display: flex;
		flex-direction: row;
		width: calc(33% - 20rpx);
		height: 68rpx;
		background-color: #FFFFFF;
		align-items: center;
		justify-content: space-between;
		border-radius: 10rpx;
		border-width: 1rpx;
		border-color: #BBBBBB;
		border-style: solid;
		padding-left: 20rpx;
		padding-right: 20rpx;
	}
	
	.end_time{
		flex-grow: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 200rpx;
		height: 68rpx;
		justify-content: space-between;
		background-color: #FFFFFF;
		padding-left: 20rpx;
		padding-right: 20rpx;
		
		border-radius: 10rpx;
		border-width: 1rpx;
		border-color: #BBBBBB;
		border-style: solid;
	}
	
	.arrow_down{
		width: 24rpx;
		height: 24rpx;
	}
	
	.search_img{
		margin-left: 30rpx;
		width: 58rpx;
		height: 58rpx;
	}
	
	.view_data{
		margin-top: 30rpx;
		width: calc(100% - 60rpx);
		border-radius: 10rpx;
		background-color: #fff;
		padding-bottom: 30rpx;
	}
	
	.record_content{
		margin-top: 30rpx;
		margin-left: 30rpx;
		width: calc(100% - 60rpx);
	}
	
	.record_content1{
		display: flex;
		flex-direction: row;
	}
	
	.record_text{
		font-size: 24rpx;
		color: #101010;
		font-family: "PingFang SC";
		text-align: left;
	}
	
	.record_text1{
		flex-grow: 1;
		font-size: 26rpx;
		color: #101010;
		font-family: "PingFang SC";
		margin-left: 30rpx;
		text-align: center;
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
