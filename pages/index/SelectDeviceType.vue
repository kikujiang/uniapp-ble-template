<template>
	<view class="content">
		<image src="/static/bgnew.jpg" class="bg"></image>
		<!-- <view class="login_bg"></view> -->
		<view class="navBar" :style="{ height: custom_bar + 'px' }">

			<view class="nav_title" :style="{ marginTop: status_bar + 'px' }">强凡AI智能设备</view>
		</view>

		<view class="swiper_parent">
			<swiper class="swiper" :indicator-dots="true" :autoplay="swiperAutoplay" :interval="3000" :duration="1000"
				indicator-active-color="#1E88E5" indicator-color="#ffffff" @change="handleSwiperChange">
				<swiper-item v-for="(item, index) in bannerList" class="swiper-item" :key="index">
					<video v-if="item.video" class="swiper-video" :src="item.video" @play="handleVideoPlay"
						@pause="handleVideoPause" id="video" controls></video>
					<image v-else class="swiper-image" mode="widthFix" :src="item.image"></image>
				</swiper-item>
			</swiper>
		</view>
		<view style="margin-top: 30rpx;"></view>

		<view v-for="(item, index) in list_device" :key="index" class="layout_type" @click="naviDeviceDetail(index)">
			<view class="left">
				<view v-if="index === 2" class="view_left_image">
					<image mode="widthFix" :src="item.image" class="left_image_custom"></image>
				</view>

				<image v-else mode="heightFix" :src="item.image" class="left_image"></image>
			</view>
			<view class="right">
				<text style="font-size: 30rpx;font-weight: 600;color: #2B2B2B;">{{ item.title }}</text>
				<text style="margin-top: 10rpx;font-size: 26rpx;color: #A0A0A0;">{{ item.sub_title }}</text>
			</view>
		</view>

		<view class="marquee-title">最新消息更新</view>
		<view class="marquee">
			<view class="marquee-content"
				:style="{ transform: `translateY(-${currentIndex * 100}%)`, transitionDuration: animationDuration + 's' }">
				<view v-for="(text, index) in marqueeTexts" :key="index" v-html="text"></view>
				<!-- 添加第一条数据的副本 -->
				<!-- <view v-html="marqueeTexts[0]"></view> -->
			</view>
		</view>

	</view>
</template>

<script>
import u_storage from '@/common/u-storage.js'
import http from '../../common/http.js'
import user_util from '@/common/user-util.js'
export default {
	data() {
		return {
			custom_bar: u_storage.get_custombar(),
			status_bar: u_storage.get_statusbar(),
			bannerList: [],
			list_device: [],
			loading: false,
			swiperAutoplay: true, // 控制swiper是否自动滚动
			marqueeTexts: [],
			currentIndex1: 0, // 当前显示的消息索引
			animationDuration: 20, // 动画持续时间，单位为秒
			names: ['张伟峰', '王芳峰', '李娜峰', '刘洋峰', '陈杰', '杨磊峰', '黄敏峰', '赵强峰', '周静峰', '吴涛', '徐丽峰', '孙军峰', '马超', '朱琳',
				'胡斌峰',
				'郭鹏',
				'何梅峰', '高峰', '林静', '罗刚'
			],
			usedNames: []
		}
	},
	onLoad() {
		this.initializeMarqueeTexts();
		this.fetchBannerList()
		this.fetchDeviceKing()
		this.checkBLEState()
	},

	onShow() {
		console.log("onshow called")
	},

	onHide() {
		console.log("onHide called")
	},
	// 分享给朋友
    onShareAppMessage(res) {
        return {
            title: '强凡先生 - 智能生活从这里开始',
            path: '/pages/index/SelectDeviceType',
            success(res) {
                uni.showToast({
                    title: '分享成功'
                });
            },
            fail(res) {
                uni.showToast({
                    title: '分享失败',
                    icon: 'none'
                });
            }
        }
    },
    
    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '强凡先生 - 智能生活从这里开始',
            query: '',
        }
    },
	methods: {
		getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		maskName(name) {
			return name[0] + '*'.repeat(name.length - 1);
		},
		generateRandomText() {
			if (this.names.length === 0) {
				// 如果名字数组为空，将已使用的名字重新放回名字数组
				this.names = this.usedNames;
				this.usedNames = [];
			}
			const randomIndex = this.getRandomInt(0, this.names.length - 1);
			const name = this.names.splice(randomIndex, 1)[0]; // 从名字数组中移除选中的名字
			this.usedNames.push(name); // 将选中的名字放入已使用的名字数组
			const count = this.getRandomInt(1, 10);
			return `${this.maskName(name)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;成功租赁了&nbsp;${count}&nbsp;台设备`;
		},
		initializeMarqueeTexts() {
			for (let i = 0; i < 5; i++) { // 初始化显示五条消息
				this.marqueeTexts.push(this.generateRandomText());
			}

			this.startMarqueeTimer();
		},
		updateMarqueeText() {
			// 每 5 秒添加五条数据
			// 每10秒添加一条新数据
			this.marqueeTexts.push(this.generateRandomText());
			if (this.marqueeTexts.length > 15) { // 如果超过 6 条数据，删除最旧的一条
				this.marqueeTexts.shift();
			}
			// this.currentIndex1++;
			this.resetAnimation();
		},
		resetAnimation() {
			// 重新触发动画
			this.animationDuration = 0; // 先将动画持续时间设为0
			this.$nextTick(() => {
				this.animationDuration = 20; // 再恢复为原来的持续时间
			});
		},
		startMarqueeTimer() {
			setInterval(() => {
				this.updateMarqueeText();
			}, 10000); // 每10秒更新一次数据
		},
		// 视频播放时停止自动滚动
		handleVideoPlay() {
			this.swiperAutoplay = false; // 停止自动滚动
		},
		// 视频暂停时恢复自动滚动
		handleVideoPause() {
			this.swiperAutoplay = true; // 恢复自动滚动
		},
		//检查蓝牙的状态
		checkBLEState() {
			let me = this
			uni.getBluetoothAdapterState({
				//蓝牙的匹配状态
				success: (res) => {
					console.log('检查蓝牙状态返回数据：', res)
					// 兼容真机和模拟器的不同返回结构
					const available = res.available !== undefined ? res.available : res.adapterState?.available
					console.log('当前蓝牙可用状态:', available)
					// 开始搜索蓝牙设备
					if (!available) {
						console.log("当前蓝牙不可用")
						me.openBle()
					}
				},
				fail: (error) => {
					// console.log("当前蓝牙返回错误："+error)
					me.openBle()
				}
			});
		},
		naviDeviceDetail(index) {
			if (index == 0) {
				if (user_util.is_login()) {
					//未登录时显示登录控件
					this.navi2BuZhanglang()
				} else {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			} else if (index === 2) {
				this.navi2Rent()
			} else {
				if (user_util.is_login()) {
					//未登录时显示登录控件
					this.navi2Bushuqi()
				} else {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			}
		},
		//获取设备信息
		fetchDeviceKing() {
			let me = this
			http.send('device/get_device_king', 'GET', {}, (res) => {
				if (res.code === 0) {
					me.list_device = res.data
					me.list_device.push({
						title: "租赁信息",
						sub_title: "查看设备的租赁详情",
						image: "../../static/rent.png"
					})
				}
			}, (res) => {

			})
		},
		//获取banner列表
		fetchBannerList() {
			let me = this
			http.send('banner/get_list', 'GET', {
				type: 2
			}, (res) => {
				if (res.code == 0) {
					me.bannerList = res.data.banner
					// 在第一位添加指定的对象
					// me.bannerList.unshift({
					// 	video: 'https://example.com/path/to/demo.mp4', // 指定的URL
					// });
					console.log("bannerList==========", me.bannerList)
				}
			}, (res) => {

			})
		},
		navi2Bushuqi() {
			uni.navigateTo({
				url: "/pages/index/indexNew"
			})
		},
		navi2BuZhanglang() {
			uni.navigateTo({
				url: "/pages/index/indexCockroach"
			})
		},
		navi2Rent() {
			uni.navigateTo({
				url: "/pages/index/operatorList/operatorList"
			})
		},
		openBle() {
			uni.showLoading({
				title: "开启蓝牙中..."
			})
			this.loading = true
			let me = this
			uni.openBluetoothAdapter({
				success(res) { //已打开
					console.log('打开蓝牙适配器返回数据：', res)
					if (me.loading) {
						uni.hideLoading()
						me.loading = false
						// uni.showToast({
						// 	icon: 'success',
						// 	title: '蓝牙开启成功'
						// });

					}
				},
				fail(err) { //未打开 
					// uni.showToast({icon:'none',title: '请打开蓝牙和定位功能'});
					console.log('蓝牙打开失败返回数据：', err)
				}
			})
		},
		handleSwiperChange(event) {
			let me = this
			const currentIndex = event.detail.current;

			// 延迟处理视频暂停，确保 DOM 节点稳定
			// 延迟操作，确保 DOM 渲染完成
			this.$nextTick(() => {
				this.bannerList.forEach((item, index) => {
					if (item.video) {
						console.log("====refs====", this.$refs)
						const player = uni.createVideoContext(`video`, this);
						if (player) {
							// 如果不是当前视频，暂停并重置
							if (index !== currentIndex) {
								player.pause(); // 暂停播放
								player.currentTime = 0; // 重置到开头
							}
						} else {
							console.warn(`videoRef 不存在`);
						}
					}
				});
			});
		}
	}
}
</script>

<style>
page {
	height: 100%;
}

.content {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 100%;
}

/* 背景图片样式 */
.bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	/* 确保背景图片位于最下层 */
	object-fit: cover;
	/* 确保图片覆盖整个容器 */
}

button::after {
	border: none;
}

.login_bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 750rpx;
	height: 544rpx;
	/* background-color: #2196F3; */
	/* background: linear-gradient(45deg, #2196F3, #21CBF3); */
	/* background: linear-gradient(45deg, #0D47A1, #1976D2); */
	background: linear-gradient(45deg, #1E88E5, #42A5F5);
	/* border-bottom-left-radius: 10rpx;
		border-bottom-right-radius: 10rpx; */
	/* opacity: 0.8; */
	z-index: -1;
}

.navBar {
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: center;
	align-items: center;
	z-index: 100;
}

.nav_title {
	font-size: 36rpx;
	font-weight: 800;
	color: white;
	font-family: "PingFang SC";
}

.swiper_parent {
	display: flex;
	height: auto;
	position: relative;
	padding: 0 30rpx 0 30rpx;
	margin-top: 10rpx;
}

.swiper {
	display: flex;
	height: 320rpx;
	margin-top: 20rpx;
	border-radius: 15rpx;
	width: 690rpx;
	z-index: 100;
}

.swiper .swiper-item {
	width: 100%;
	height: 100%;
	border-radius: 15rpx;
	position: relative;
}

.swiper-item .swiper-image {
	width: 100%;
	height: 320rpx !important;
	border-radius: 15rpx;
	top: 0rpx;
	position: absolute;
}

.swiper-item .swiper-video {
	width: 100%;
	height: 320rpx !important;
	border-radius: 15rpx;
	top: 0rpx;
	position: absolute;
}

.layout_type {
	margin: 30rpx 30rpx 0 30rpx;
	display: flex;
	flex-direction: row;
	border-radius: 15rpx;
	padding: 0 30rpx 0 0;
	box-sizing: border-box;
	background-color: white;
	align-items: center;
	/* background-color: #1E1E1E; */
	transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
	/* 标准缓动曲线 */
	box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.right {
	display: flex;
	flex-direction: column;
	margin-left: 30rpx;
}

.left {
	padding: 20rpx;
	width: 30%;
}

.left_image {
	width: 200rpx;
	height: 150rpx;
	border-radius: 50rpx;
}

.view_left_image {
	width: 200rpx;
	height: 150rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.left_image_custom {
	width: 50px;
	/* 指定的宽度 */
	height: 50px;
	/* 指定的高度 */
}

.marquee-title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 10px;
	margin: 20rpx 30rpx;
}

.marquee {
	width: 100%;
	height: 150px;
	overflow: hidden;
	position: relative;
	padding-left: 30rpx;
}

.marquee-content {
	display: flex;
	flex-direction: column;
	animation: marqueeAnimation 20s linear infinite;
}

@keyframes marqueeAnimation {
	0% {
		transform: translateY(0);
	}

	100% {
		transform: translateY(-100%);
	}
}
</style>
