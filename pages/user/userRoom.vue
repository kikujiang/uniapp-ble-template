<template>
	<view class="content">
		
		<view class="device_list_top">
			<view class="top_left">
				<image src="../../static/user/changleft.png" class="front" mode="widthFix"></image>
				<text v-if="room_list.length > 0" class="top_content">我的区域（{{room_list.length}}）</text>
				<text v-else class="top_content">我的区域</text>
			</view>
			<image src="../../static/user/changright.png" class="back"  @click="addRoom"></image>
		</view>
		
		<view v-if="room_list.length > 0" class="view_content" v-for="(item,index) in room_list" >
			<u-swipe-action>
		        <u-swipe-action-item
		          :options="options1" @click="clickDelete(item)">
				<view class="room_content" @click="clickItem(item)">
					<text class="roon_name">{{item.name}}</text>
					<!-- <image class="room_delete" src="../../static/user/delete.png" @click.stop="clickDelete(item)"></image> -->
				</view>
				</u-swipe-action-item>
			</u-swipe-action>
			
		</view>
		
		<view v-if="room_list.length == 0" class="empty_view">
			<image class="empty_image" src="../../static/index/nodata.png" mode="widthFix"></image>
			<text style="color: #666666;font-size: 30rpx;">~ 暂无数据 ~</text>
		</view>
		
		<u-modal :show="deleteShow" :content="deleteContent" showCancelButton="true" confirmColor="#1F95E9" @confirm="confirmDeleteClick()" @cancel="cancelConfirmClick()" ></u-modal>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		data() {
			return {
				room_list:[],
				deleteShow:false,
				deleteContent:"确认删除区域？",
				currentDeleteId:-1,
				type:0,
				options1: [{
					text: '删除'
				}]
			}
		},
		
		onLoad(option) {
			this.type = option.type
		},
		
		onShow() {
			this.fetchRoomList()
		},
		
		methods: {
			clickDelete(item){
				this.deleteShow = true
				this.currentDeleteId = item.id
			},
			fetchRoomList(){
				let me = this
				http.send('room/get_list_company', 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取仓库列表数据为:",res.data)			
						me.room_list = res.data
						
						if(res.data.length == 0){
							me.room_list = []
						}
						
						console.log("room_list数据为:",me.room_list)	

					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '获取仓库列表异常',
						icon: 'error'
					})
				})
			},
			
			addRoom(){
				uni.navigateTo({
					url:"/pages/user/userRoomEdit"
				})
			},
			
			clickItem(item){
				
				if(this.type == 1){
					uni.navigateBack({
					        delta: 1, // 返回到上一页，如果有多个历史页面，可以调整delta的值
					        success() {
					          // 向上一页传递数据
					          uni.$emit('dataFromRoom', item);
					        }
					      });
				}else{
					uni.navigateTo({
						url:"/pages/user/userRoomEdit?id="+item.id+"&name="+item.name
					})
				}

			},
			confirmDeleteClick(){
				let me = this
				http.send('room/delete', 'POST', {
					id:this.currentDeleteId
				}, (res) => {
					if (res.code == 0) {
						console.log("删除信息返回数据为:",res.data)
						me.deleteShow = false
						uni.showToast({
							title:"删除成功",
							icon:"success"
						})
						
						me.fetchRoomList()
						
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '删除信息异常',
						icon: 'error'
					})
				})
			},
			cancelConfirmClick(){
				this.deleteShow = false
			}
		}
	}
</script>

<style lang="scss">
	
	page{
		display: flex;
		flex-direction: column;
		/* height: 100%; */
		background-color: #F2F5F7;
	}
	
	.content{
		/* height: 100%; */
		display: flex;
		flex-direction: column;
	}
	
	.empty_view{
		width: 100%;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	
	.empty_image{
		width: calc(50%);
	}
	
	.device_list_top{
		margin-top: 30rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		height: 64rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	
	.top_left{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.front {
		width: 64rpx;
		height: 64rpx;
	}
	
	.top_content{
		margin-left: 20rpx;
		font-size: 36rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
		
	}
	
	.back {
		width: 64rpx;
		height: 64rpx;
		align-items: flex-end;
	}
	
	.info_divider{
		margin-top: 30rpx;
		height: 1rpx;
		background-color: #BBBBBB;
	}
	
	.view_content{
		margin-top: 20rpx;
		margin-left: 30rpx;
		width: calc(100% - 60rpx);
	}
	
	.room_content{
		/* margin-left: 30rpx; */
		/* width: calc(100% - 60rpx); */
		display: flex;
		flex-direction: row;
		background-color: white;
		align-items: center;
		/* width: 690rpx; */
		border-radius: 15rpx;
		justify-content: space-between;
		text-align: left;
		padding-left: 30rpx;
		padding-top: 30rpx;
		padding-bottom: 30rpx;
		
	}
	
	.roon_name{
		font-size: 32rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
		color: #000;
	}
	
	.room_delete{
		width: 60rpx;
		height: 60rpx;
		margin-right: 30rpx;
	}
	
</style>
