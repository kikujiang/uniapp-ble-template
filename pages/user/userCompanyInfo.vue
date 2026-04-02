<template>
	<view class="content">
		<view class="custom-html" v-html="content" @click="bigDetail"></view>
	</view>
</template>

<script>
	import http from '@/common/http.js'
	export default {
		data() {
			return {
				content:""
			}
		},
		
		onLoad() {
			this.fetchContent()
		},
		
		methods: {
			fetchContent(){
				let me = this
				http.send('config/get_introduce', 'GET', {}, (res) => {
					if (res.code == 0) {
						console.log("获取数据为:",res.data)
						me.content = res.data.replace(/\<img/gi, '<img class="maximg" ');
					} 
				}, (res) => {
					
				})
			},
			bigDetail(e) {
				let contentimg = this.content;
				let imgs = contentimg.match(/<img[^>]+>/g);
				let arrImg = [];
				for (var i = 0; i < imgs.length; i++) {
					imgs[i].replace(/<img[^>]*src=['"]([^'"]+)[^>]*>/gi, function(match, capture) {
						arrImg.push(capture)
					})
				}
				uni.previewImage({
					urls: arrImg
				})
			},
		}
	}
</script>

<style>
	.content{
		display: flex;
		margin: 20rpx 40rpx 30rpx 30rpx;
	}
	.custom-html>>>img {
		max-width: 100% !important;
	}
	
	.maximg {
		max-width: 100%;
	}
	
</style>
