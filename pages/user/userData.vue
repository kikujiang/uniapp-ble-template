<template>
	<view class="content">
		<view class="title_view" style="justify-content: flex-start;align-items: center;padding-top: 10rpx;padding-bottom: 10rpx;">
			<text style="font-size: 26rpx;">选择类型：</text>
			<view class="radio_group">
				<view style="display: flex;align-items: center;" @click="selectType(0)">
					<text style="margin-left: 20rpx;">捕鼠器</text>
					<image :src="type_data == 0?'../../static/user/radio_selected.png':'../../static/user/radio_unselected.png'" style="width: 40rpx;height: 40rpx;margin-left: 20rpx;"></image>
				</view>
				<view style="display: flex;align-items: center;" @click="selectType(1)">
					<text style="margin-left: 20rpx;">捕蟑螂器</text>
					<image :src="type_data == 0?'../../static/user/radio_unselected.png':'../../static/user/radio_selected.png'" style="width: 40rpx;height: 40rpx;margin-left: 20rpx;"></image>
				</view>
			</view>
		</view>
		<view class="title_view">
			<view class="title_left">
				<view class="start_time" @click="clickStartTime">
					<text v-if="startTimeStr.length>1">{{startTimeStr}}</text>
					<text v-else>选择开始时间</text>
					<image class="arrow_down" src="../../static/index/arrow_down.png"></image>
				</view>
				<view class="end_time" @click="clickEndTime">
					<text v-if="endTimeStr.length>1">{{endTimeStr}}</text>
					<text v-else>选择结束时间</text>
					<image class="arrow_down" src="../../static/index/arrow_down.png"></image>
				</view>
			</view>
			<view style="display: flex;align-items: center;">
				<image src="../../static/index/reset.png" class="search_img" style="width: 45rpx;height: 45rpx;" @click="reset"></image>
				<image src="../../static/index/search.png" class="search_img" style="margin-left: 15rpx;" @click="search"></image>
			</view>
			
		</view>
		
		<!-- <view v-if="!isShowEmpty && flag == 0" class="charts-box">
			<qiun-data-charts class="chart" type="pie":opts="chenjiaoOpts":chartData="chartData" :ontouch="true" :tooltipShow="false" loadingType="5"/>
		</view> -->
		
		<view v-if="!isShowEmpty && flag == 1" class="charts-box">
			<qiun-data-charts class="chart" type="mount" :opts="opts" :chartData="chartData" :ontouch="true" :tooltipShow="false" loadingType="5"/>
		</view>
		
		<view v-else class="empty_view">
			<image class="empty_image" src="../../static/index/nodata.png"></image>
		</view>
		
		<u-datetime-picker
				:show="dateTimeshow"
				v-model="currentDateValue"
				mode="date"
				@confirm="confirm"
				@cancel="cancel"
		></u-datetime-picker>
		
	</view>
</template>

<script>
	import http from '@/common/http.js'
	import util from '@/common/util.js'
	export default {
		data() {
			return {
				// isMouse:true,
				type_data:0,//0表示捕鼠器，1表示捕蟑螂器
				user_record_data:[],
				dateTimeshow:false,
				startTimeStr:"",
				endTimeStr:"",
				isStart:false,
				currentDateValue:"",
				minValue:0,
				maxValue:0,
				isShowEmpty:false,
				flag:1,
				chartData:{
					series:[{
						name:"捕鼠统计图",
						data: [{"name":"捕鼠一号","value":50,"labelText":"50"},{"name":"捕鼠二号","value":30,"labelText":"30"},{"name":"捕鼠三号","value":20,"labelText":"20"},{"name":"捕鼠四号","value":18,"labelText":"18"}]
						},
					]
				},
				
				chenjiaoOpts: {
					color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
					padding: [5,5,5,5],
					enableScroll: false,
					xAxis: {
						disableGrid: true,
						itemCount:10,
						rotateLabel:true,
						rotateAngle:60,
						marginTop:8,
						fontSize:10
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
						data:[]
					},
					extra: {
					  pie: {
						activeOpacity: 0.5,
						activeRadius: 10,
						offsetAngle: 0,
						labelWidth: 15,
						border: true,
						borderWidth: 3,
						borderColor: "#FFFFFF",
						linearType: "custom"
					  }
					}
				},
				
				opts: {
					color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
					padding: [25,25,0,25],
					enableScroll: false,
					legend: {},
					xAxis: {
						// disableGrid: true,
					    itemCount:6,
					    rotateLabel:true,
					    rotateAngle:45,
					    marginTop:8,
					    fontSize:10,
						scrollShow: true,
						// itemCount: 4
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
					    data: [
							{
								min: 0
							}
						]
					},
					extra: {
					  mount: {
						type: "bar",
						widthRatio: 0.3,
						borderWidth: 0,
						barBorderRadius: [
						  0,
						  0,
						  0,
						  0
						],
						linearType: "custom"
					  }
					}
				  }
			}
		},
		onLoad() {
			console.log('======数据查询加载中======')
			const timeFormat = uni.$u.timeFormat
			const date = new Date;
			this.currentDateValue = timeFormat(date, 'yyyy-mm-dd')
		},
		
		onShow() {
			console.log('======数据查询显示======')
			this.getData()
		},
		
		onHide() {
			console.log('======数据查询隐藏======')
		},
		
		methods: {
			//重置搜索
			reset(){
				this.minValue = 0
				this.maxValue = 0
				this.startTimeStr = ""
				this.endTimeStr = ""
				this.getData()
			},
			selectType(type){
				this.type_data = type
				this.getData()
			},
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
				
				this.getData()
			},
			clickStartTime(){
				this.dateTimeshow = true
				this.isStart = true
				console.log("选中时间为：",this.currentDateValue)
			},
			
			clickEndTime(){
				this.dateTimeshow = true
				this.isStart = false
				console.log("选中时间为：",this.currentDateValue)
			},
			confirm(e){
				const timeFormat = uni.$u.timeFormat
				console.log("选中结束时间为：",e.value)
				if(this.isStart){
					this.startTimeStr = timeFormat(e.value, 'yyyy-mm-dd')
					const date = new Date(this.startTimeStr)
					this.minValue = date.getTime()
					console.log("选中开始时间为：",this.startTimeStr,"，选中的时间戳为：",this.minValue)
				}else{
					
					const end_value = timeFormat(e.value, 'yyyy-mm-dd')
					const date1 = new Date(end_value)
					
					if(date1.getTime() >= this.minValue){
						this.endTimeStr = timeFormat(e.value, 'yyyy-mm-dd')
						const date = new Date(this.endTimeStr)
						this.maxValue = date.getTime()
						console.log("选中结束时间为：",this.endTimeStr,"，选中的时间戳为：",this.maxValue)
					}else{
						uni.showToast({
							title:"小于开始时间",
							icon:"error"
						})
						return
					}
					
				}
				
				this.dateTimeshow = false
			},
			cancel(){
				this.dateTimeshow = false
			},
			
			getData(){
				let me = this
				uni.showLoading({
					title:"数据加载中..."
				})
				http.send('record/get_data_list', 'GET', {
					start_time: this.minValue,
					end_time: this.maxValue,
					type:this.type_data
				}, (res) => {
					uni.hideLoading()
					if (res.code == 0) {
						me.user_record_data = res.data
						
						if(me.user_record_data.length == 0){
							me.isShowEmpty = true
						}else{
							me.isShowEmpty = false
						}
						
						if(me.type_data == 1){
							me.chartData.series[0].name = "捕鼠统计图"
						}else{
							me.chartData.series[0].name = "捕蟑螂统计图"
						}
						
						me.chartData.series[0].data = []
						for (var i = 0; i < me.user_record_data.length; i++) {
							let record_data = {}
							record_data.name = me.user_record_data[i].alias_name
							record_data.value = me.user_record_data[i].record_count
							record_data.labelText = me.user_record_data[i].record_count
							me.chartData.series[0].data.push(record_data)
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
						title: '获取信息异常',
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
		/* margin-left: 30rpx; */
		width: 50rpx;
		height: 50rpx;
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
	
	.charts-box {
		margin-top: 30rpx;
	    width: 100%;
	    height: 300px;
		background: #FFFFFF;
	}
	
	.radio_group{
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 26rpx;
	}
	
</style>
