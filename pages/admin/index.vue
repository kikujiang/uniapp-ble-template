<template>
	<view class="content" style="box-sizing: border-box;">
		
		<view class="title_view">
			<view style="display: flex;align-items: flex-end;">
				<image src="../../static/admin.png" style="width: 60rpx;height: 60rpx;" mode="widthFix"></image>
				<text style="margin-left: 20rpx;font-size: 26rpx;">管理员</text>
			</view>
			
			<image src="../../static/exit.png" style="width: 50rpx;height: 50rpx;" mode="widthFix" @click="exit()"></image>
		</view>
		
		<view style="margin-left: 30rpx;margin-right: 30rpx;margin-top: 30rpx;">
			<u-subsection :list="list" :current="current" mode="subsection" :fontSize="22" @change="changeIndex"></u-subsection>
		</view>
		
		<view class="content_search">
			<u-search clearabled="true" shape="round" :showAction="false" @search="search" @clear="clear" place
				v-model="search_user_name" :placeholder="current ===0?'请输入场所名称':'请输入设备名称'" bgColor="#e6e6e6" height="70" search-icon-size="40"></u-search>
		</view>
		
		
		<view v-if="list_user_data.length > 0 && current == 0" >
			
			<view v-for="(item,index) in list_user_data" :key="index" class="item_user_data" @click="itemClick(item)">
				<u-swipe-action>
					<u-swipe-action-item
					  :options="options1" @click="deleteAccount(item)">
						<view class="item_content">
							<text>手机号码</text>
							<text class="item_content1">{{item.code}}</text>
						</view>
						
						<view class="item_content" style="margin-top: 10rpx;">
							<text>使用场所</text>
							<text class="item_content1">{{item.name}}</text>
						</view>
						
						<view class="item_content"  style="margin-top: 10rpx;">
							<text>设备数量</text>
							<text class="item_content1">{{item.device_cnt}}</text>
						</view>
				</u-swipe-action-item></u-swipe-action>
				<!-- <image class="img_delete" src="../../static/user/delete.png" @click.stop="deleteAccount(item)"></image> -->
			</view>
			
		</view>
		
		
		<view v-else-if="list_user_device.length > 0 && current == 1" class="device_list_content">
			
			<view class="item_device_content1" v-for="(item,index) in list_user_device":key="index" @click="naviLog(item)">
				<view class="item_device_content">
					<image class="device_bg" src="../../static/index/item_normal.png"></image>
					<view class="device_left">
						<text class="device_name">{{item.alias_name}}</text>
						<text class="device_location">{{item.address}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="empty_view" v-else>
			<image class="empty_image" src="../../static/index/nodata.png"></image>
		</view>
	</view>
</template>

<script>
	import http from '../../common/http.js'
	import user_util from '@/common/user-util.js'
	export default {
		data() {
			return {
				search_user_name:"",
				list_user_data:[],
				mPage:1,
				current:0,
				list:['场所列表','设备列表'],
				list_user_device:[],
				options1: [{
					text: '删除'
				}]
			}
		},
		
		onLoad() {
			
		},
		
		onShow() {
			this.loadList()
			this.fetchDeviceList()
		},
		
		beforeCreate() {
			uni.hideHomeButton()
		},
		methods: {
			//获取设备列表
			fetchDeviceList(){
				let me = this
				http.send('user/get_admin_device_list', 'GET', {
					page:1,
					page_size:100,
					key_word:this.search_user_name
				}, (res) => {
					if (res.code == 0) {
						console.log("获取设备列表数据为:",res.data)
						me.list_user_device = res.data
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				}, (res) => {
					uni.showToast({
						title: '获取设备列表异常',
						icon: 'error'
					})
				})
			},
			changeIndex(index){
				console.log("当前的index值为：",index)
				this.current = index
				this.search_user_name=""
				if(index == 0){
					this.list_user_data = []
					this.mPage = 1
					this.loadList()
				}else{
					this.list_user_data = []
					this.mPage = 1
					this.fetchDeviceList()
				}
			},
			clear() {
				this.search_user_name = ""
			},
			search(value) {
				if (value != undefined) {
					
					if(this.current == 0){
						this.search_user_name = value
						this.list_user_data = []
						this.mPage = 1
						this.loadList()
					}else{
						this.search_user_name = value
						this.list_user_data = []
						this.mPage = 1
						this.fetchDeviceList()
					}
				}
			},
			loadList(){
				uni.showLoading({
					title:"数据加载中..."
				})
				let me = this
				console.log("商品列表页面当前分类id是：", me.category_id)
				http.send("Admin/get_company_list", "GET", {
					'key_word':me.search_user_name,
					page:this.mPage,
					page_size:100
				}, (res) => {
						me.isloading = false
						uni.hideLoading()
						if (res.code == 0) {
							if (me.mPage == 1) {
								me.list_user_data = res.data
								console.log(me.list_user_data)
							} else {
								me.list = [...me.list, ...res.data]
							}
						}
					}, (res) => {
						uni.hideLoading()
						me.isloading = false
					})
			},
			itemClick(item){
				uni.navigateTo({
					url:"/pages/admin/userDetail?userInfo="+encodeURIComponent(JSON.stringify(item))
				})
			},
			deleteAccount(item){
				let me = this
				uni.showModal({
					title: '提示',
					content: '确认删除该场所？',
					success: function (res) {
						if (res.confirm) {
							http.send("/Company/delete", "POST", {
								id:item.id,
							}, (res) => {
									if (res.code == 0) {
										console.log("返回参数为：",res.data)
										me.list_user_data = []
										me.mPage = 1
										me.loadList()
										uni.showToast({
											title:'删除成功'
										})
									}
								})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			naviLog(item){
				uni.navigateTo({
					url:'/pages/admin/adminLog?id='+item.id
				})
			},
			exit(){
				user_util.clearLoginInfo()
				uni.reLaunch({
					url:'/pages/login/login'
				})
			}
		}
	}
</script>

<style scoped>

	page{
		/* background-color: #F7F7F7; */
		height:100%;
	}
	
	.content{
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.user_list_top{
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
	
	.item_user_data{
		position: relative;
		display: flex;
		flex-direction: column;
		margin: 0 30rpx 30rpx 30rpx;
		
		border-radius: 10rpx;
		/* background-color: #fdffe5; */
		border-color: #BBBBBB;
		border-width: 1rpx;
		border-style: solid;
		
		padding: 15rpx;
	}
	
	.item_content{
		display: flex;
		flex-direction: row;
		align-items: center;
		
		font-size: 25rpx;
		font-weight: 800;
		color: #000000;
	}
	
	.item_content1{
		font-size: 25rpx;
		font-weight: 500;
		color: #101010;
		margin-left: 30rpx;
	}
	
	.device_list_content{
		margin-left: 30rpx;
		margin-right: 30rpx;
		width: calc(100% - 60rpx);
		// height: 100%;
		display: grid;
		grid-template-columns: repeat(2,1fr);
		grid-gap: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.item_device_content1{
		width: 320rpx;
		height: 180rpx;
	}
	
	.item_device_content{
		width: 320rpx;
		height: 180rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		position: relative;
	}
	
	.device_bg{
		position: absolute;
		width: 320rpx;
		height: 180rpx;
		z-index: -1;
	}
	
	.device_left{
		flex : 1;
		display: flex;
		flex-direction: column;
		margin-left: 10rpx;
		margin-top: 40rpx;
		height: 100rpx;
		justify-content: space-between;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis; /* 显示省略号 */
	}
	
	.device_name{
		margin-top: 10rpx;
		font-size: 25rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: bold;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1; /* 限制文本显示的行数 */
	}
	
	.device_location{
		font-size: 26rpx;
		line-height: 40rpx;
		font-family: "PingFang SC";
		font-weight: 100;
		color: #000;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1; /* 限制文本显示的行数 */
	}
	
	.change_account{
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
	
	.img_delete{
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		right:3px;
		/* top:30rpx; */
	}
	
	.title_view{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 30rpx 0 30rpx;
	}
	
</style>
