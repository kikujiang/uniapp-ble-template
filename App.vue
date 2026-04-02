<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
</style>

<script>
	import u_storage from '@/common/u-storage.js'
	export default {

		data() {
			return {}
		},
		onHide: function() {
			console.log('======小程序隐藏======')
		},

		// 在小程序启动时处理分享参数
		onLaunch: function(options) {
			console.log('App Launch，参数：', options);
			this.initStatusBar()
			if (options.query) {
				// 处理从朋友圈分享进入的场景
				const {
					page,
					id
				} = options.query;
				if (page && page === 'SelectDeviceType') {
					// 可以保存状态，后续在onShow中使用
					this.globalData.fromShare = true;
					this.globalData.shareParams = {
						page,
						id
					};

					// 如果需要跳转到其他页面，可以通过全局变量标记，然后在页面的onShow中处理
					// 注意：onLaunch阶段不能直接使用uni.navigateTo等跳转方法
				}
			}
		},

		// 监听页面显示
		onShow: function(options) {
			console.log('App Show，参数：', options);
			// 处理冷启动或后台切前台时的场景
			if (options.query && options.scene === 1154) { // 1154是朋友圈分享的场景值
				const {
					page,
					id
				} = options.query;
				if (page) {
					// 可以根据page参数决定跳转到哪个页面
					setTimeout(() => {
						uni.switchTab({
							url: `/pages/index/${page}`
						});
					}, 100);
				}
			}
		},

		methods: {
			initStatusBar() {
				let me = this
				uni.getSystemInfo({
					success: function(e) {
						let StatusBar = 0
						let CustomBar = 0
						// #ifndef MP
						StatusBar = e.statusBarHeight;
						if (e.platform == 'android') {
							CustomBar = e.statusBarHeight + 50;
						} else {
							CustomBar = e.statusBarHeight + 45;
						};
						// #endif
						// #ifdef MP-WEIXIN
						StatusBar = e.statusBarHeight;
						let custom = wx.getMenuButtonBoundingClientRect();
						// Vue.prototype.Custom = custom;
						CustomBar = custom.bottom + custom.top - e.statusBarHeight;

						console.log("custombar is:", CustomBar)
						console.log("statusbar is:", StatusBar)
						// #endif       
						// #ifdef MP-ALIPAY
						StatusBar = e.statusBarHeight;
						CustomBar = e.statusBarHeight + e.titleBarHeight;
						// #endif

						u_storage.save_custombar(CustomBar)
						u_storage.save_statusbar(StatusBar)
					}
				})
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>