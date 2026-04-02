<template>
	<view class="content" style="box-sizing: border-box;">
		<view class="head_content">
			<view>总计租赁：{{total}}台</view>
		</view>
		<view v-if="list_agent_data.length > 0">

			<view v-for="(item,index) in list_agent_data" :key="index" class="item_user_data" @click="itemClick(item)">
				<view class="item_content">
					<text>区域：</text>
					<text class="item_content1">{{item.region}}</text>
				</view>
				
				<view class="item_content" style="margin-top: 15rpx;">
					<text>运营商：</text>
					<text class="item_content1">{{item.name}}</text>
				</view>

				<view class="item_content" style="margin-top: 15rpx;">
					<view style="flex:1;display: flex;flex-direction: row;align-items: flex-start;">
						<text>租借数量：</text>
						<text class="item_content1" style="flex:1;margin-left: 10rpx;">{{item.count}}台</text>
					</view>
					<view style="flex:1;display: flex;flex-direction: row;align-items: flex-start;">
						<text>在线数量：</text>
						<text class="item_content1" style="flex:1;margin-left: 10rpx;">{{item.count}}台</text>
					</view>
					<view style="flex:1;display: flex;flex-direction: row;align-items: flex-start;">
						<text>总收益：</text>
						<text class="item_content1" style="flex:1;margin-left: 10rpx;">{{item.total_money}}元</text>
					</view>
				</view>
			</view>
		</view>
		<view class="empty_view" v-else>
			<image class="empty_image" src="@/static/index/nodata.png"></image>
		</view>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	import user_util from '@/common/user-util.js'
	import util from '@/common/util.js'
	export default {
		data() {
			return {
				list_agent_data: [],
				total: 0,
			}
		},

		onLoad() {
			this.loadList()
		},

		onShow() {
			
		},
		beforeCreate() {
			uni.hideHomeButton()
		},
		methods: {
			//获取代理商列表
			loadList() {
				let me = this
				uni.showLoading({
					title:"加载中",
				})
				http.send('agent/getList', 'GET', {
				}, (res) => {
					uni.hideLoading()
					if (res.code == 0) {
						me.list_agent_data = res.data.list
						me.total = res.data.count
					}
				}, (res) => {
					uni.hideLoading()
				})
			},
			itemClick(item){
				uni.navigateTo({
					url:'/pages/index/rentList?agent_id='+item.id
				})
			}
		}
	}
</script>

<style scoped>
	page {
		/* background-color: #F7F7F7; */
		height: 100%;
		background-color: #FFFFFF;
	}

	.head_content {
		padding: 20rpx 30rpx;
		font-size: 32rpx;
		font-weight: 600;
	}

	.content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding-bottom: 80rpx;
	}

	.user_list_top {
		margin-top: 30rpx;
		margin-left: 30rpx;
		font-size: 36rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
	}

	.content_search {
		margin-top: 30rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		margin-bottom: 30rpx;
	}

	.empty_view {
		width: 100%;
		height: 300rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty_image {
		width: 300rpx;
		height: 300rpx;
	}

	.item_user_data {
		position: relative;
		display: flex;
		flex-direction: column;
		margin: 0 30rpx 30rpx 30rpx;

		border-radius: 10rpx;
		/* background-color: #fdffe5; */
		border-color: #4C92E5;
		border-width: 1rpx;
		border-style: solid;

		padding: 25rpx;
	}

	.item_content {
		display: flex;
		flex-direction: row;
		align-items: center;

		font-size: 25rpx;
		font-weight: 800;
		color: #000000;
	}

	.item_content1 {
		font-size: 25rpx;
		font-weight: 500;
		color: #101010;
		margin-left: 10rpx;
	}

	.device_list_content {
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		// height: 100%;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 30rpx;
		margin-bottom: 30rpx;
	}

	.item_device_content1 {
		width: 320rpx;
		height: 180rpx;
	}

	.item_device_content {
		width: 320rpx;
		height: 180rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		position: relative;
	}

	.device_bg {
		position: absolute;
		width: 320rpx;
		height: 180rpx;
		z-index: -1;
	}

	.device_left {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-left: 10rpx;
		margin-top: 40rpx;
		height: 100rpx;
		justify-content: space-between;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		/* 显示省略号 */
	}

	.device_name {
		margin-top: 10rpx;
		font-size: 25rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		/* 限制文本显示的行数 */
	}

	.device_location {
		font-size: 26rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: 100;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		/* 限制文本显示的行数 */
	}

	.change_account {
		margin: 30rpx 30rpx 0 30rpx;
		background-color: #4C92E5;
		border-radius: 10rpx;
		color: white;
		font-size: 26rpx;
		line-height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.img_delete {
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		right: 3px;
		/* top:30rpx; */
	}

	.title_view {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 30rpx 0 30rpx;
	}
</style>