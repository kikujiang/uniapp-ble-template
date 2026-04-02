<template>
	<view class="content">
		<view class="view_content">
			<view class="content_item1" :style="{marginTop:'40rpx'}" @tap="clickPhoneService">
				<text class="item_text">联系方式</text>
				<text class="item_text">{{kefu_mobile}}</text>
			</view>
		</view>
		
		<view class="view_content1">
			
			<text :style="{marginTop:'40rpx'}" class="item_text_title">关注公众号获取更多信息</text>
			
			<image class="item_img" src="../../static/qr_code.jpg" show-menu-by-longpress="true"></image>
			
			<text class="item_text_content">长按关注公众号</text>
			
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				kefu_mobile:"4008671586"
			}
		},
		methods: {
			/**
			 * 电话客服
			 */
			clickPhoneService() {
				let me = this
				uni.showActionSheet({
					itemList: [this.kefu_mobile],
					success: function(res) {
						uni.makePhoneCall({
							phoneNumber: [me.kefu_mobile][0]
						});
					},
					fail: function(res) {
			
					}
				})
				
			}
		}
	}
</script>
	
<style>
	
	page{
		background-color: #F7F7F7;
		height:100%;
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
		border-radius: 15rpx;
		justify-content: space-between;
	}
	
	.view_content1{
		margin-top: 50rpx;
		margin-left: 30rpx;
		margin-right: 30rpx;
		padding-bottom: 40rpx;
		display: flex;
		flex-direction: column;
		background-color: white;
		width: 690rpx;
		border-radius: 15rpx;
		align-items: center;
	}
	
	.content_item{
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		flex: 1;
		margin: 0 30rpx;
	}
	
	.content_item1{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
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
		width: 400rpx;
		height: 400rpx;
	}
	
	.item_text{
		margin-left: 20rpx;
		font-size: 28rpx;
		font-weight: 400;
		line-height: 39rpx;
		color: #28282C;
		font-family: "PingFang SC";
	}
	
	.item_text_title{
		font-size: 32rpx;
		font-weight: bold;
		color: #000000;
		font-family: "PingFang SC";
	}
	
	.item_text_content{
		font-size: 28rpx;
		font-weight: 400;
		line-height: 39rpx;
		color: rgb(158, 158, 158);
		font-family: "PingFang SC";
	}
</style>
