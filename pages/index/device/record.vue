<template>
	<view class="content">
		<view class="title_view">
			<view class="title_left">
				<view class="start_time" @click="clickStartTime">
					<text v-if="startTimeStr.length>1">{{startTimeStr}}</text>
					<text v-else>开始时间</text>
					<image class="arrow_down" src="../../../static/index/arrow_down.png"></image>
				</view>
				<view class="end_time" @click="clickEndTime">
					<text v-if="endTimeStr.length>1">{{endTimeStr}}</text>
					<text v-else>结束时间</text>
					<image class="arrow_down" src="../../../static/index/arrow_down.png"></image>
				</view>
			</view>
		
			<image src="../../../static/index/search.png" class="search_img" @click="search"></image>
		</view>
		
		<view v-if="items !=null && items.length > 0" class="view_data">
			<view class="title">
				<text class="title_text1">捕获时间</text>
				<text class="title_text">温度</text>
				<text class="title_text">电压</text>
				<text class="title_text">数量</text>
				<text class="title_text">电量</text>
			</view>
			<view v-for="(item,index) in items" :key="index" class="record_content">
				<view class="record_content1">
					<text class="record_text">{{item.time}}</text>
					<text class="record_text1">25°C</text>
					<text class="record_text1">3.7V</text>
					<text class="record_text1">15</text>
					<text class="record_text1">50%</text>
				</view>
			</view>
			
		</view>
		
		<view class="empty_view" v-else>
			<image class="empty_image" src="../../../static/index/nodata.png"></image>
		</view>
		
		<u-datetime-picker
				:show="dateTimeshow"
				v-model="value1"
				mode="date"
				@confirm="confirm"
				@cancel="cancel"
				:min-date="minValue1"
		></u-datetime-picker>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				items:[
					{time:'2023.08.09 21:58:20'},{time:'2023.08.10 21:58:20'},{time:'2023.09.09 21:58:20'},{time:'2023.09.10 21:58:20'},{time:'2023.10.10 21:58:20'}
				],
				// items:[
				
				// ],
				user_record_data:[],
				dateTimeshow:false,
				startTimeStr:"",
				endTimeStr:"",
				isStart:false,
				value1:"",
				minValue1:0
			}
		},
		
		onLoad() {
			console.log('======设备记录加载中======')
			const timeFormat = uni.$u.timeFormat
			const date = new Date;
			this.value1 = timeFormat(date, 'yyyy-mm-dd')
		},
		
		onShow() {
			console.log('======设备记录显示======')
		},
		
		onHide() {
			console.log('======设备记录隐藏======')
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
					this.minValue1 = date.getTime()
					console.log("选中时间为：",this.startTimeStr,"，选中的时间戳为：",this.minValue1)
				}else{
					this.endTimeStr = timeFormat(e.value, 'yyyy-mm-dd')
				}
				
				this.dateTimeshow = false
			},
			cancel(){
				this.dateTimeshow = false
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
		display: flex;
		flex-direction: row;
		color: #666666;
		line-height: 36rpx;
		font-size: 26rpx;
		font-weight: 400;
		font-family: "PingFang SC";
		margin-top: 30rpx;
		align-items: center;
		justify-content: space-between;
	}
	
	.title_left{
		display: flex;
		flex-direction: row;
	}
	
	.start_time{
		display: flex;
		flex-direction: row;
		width: 200rpx;
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
	
	.title{
		margin-top: 30rpx;
		display: flex;
		flex-direction: row;
		margin-left: 30rpx;
		width: calc(100% - 60rpx);
	}
	
	.title_text1{
		flex-grow: 3;
		font-size: 26rpx;
		font-weight: bold;
		color: black;
		font-family: "PingFang SC";
		text-align: center;
	}
	
	.title_text{
		flex-grow: 1;
		font-size: 26rpx;
		font-weight: bold;
		color: black;
		font-family: "PingFang SC";
		text-align: center;
	}
	
	.record_content{
		margin-top: 20rpx;
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
		text-align: center;
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
