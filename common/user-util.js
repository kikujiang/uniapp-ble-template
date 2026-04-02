import http from "@/common/http.js"
export default {
	
	/* 微信登录 */
	wxLogin(callback) {
		// #ifdef MP-WEIXIN
		uni.getUserProfile({
			desc: '用于获取您的个人信息',
			success: function(resp) {
				console.log("权限返回值：" + JSON.stringify(resp))
				uni.login({
					provider: 'weixin',
					success: function(res) {
						console.log("登录返回值：" + JSON.stringify(res))
						let reData = {
							login_code: res.code,
							username: resp.userInfo.nickName,
							avatar: resp.userInfo.avatarUrl,
							// mobile_code: mobileCode
						}
						uni.showLoading({
							title: '授权登录中',
							mask: false
						})
						http.send("user/wechat_login", "POST", reData, (response) => {
							uni.hideLoading()
							console.log("服务器返回值：" + JSON.stringify(response))
							if (response.code == 0 && response.data) {
								uni.setStorageSync("user_info", response.data)
								//todo 刷新登录状态
								uni.showToast({
									title: '登录成功',
									duration: 2000
								})
								setTimeout(() => {
									if (callback) {
										callback(response.data)
									}
								}, 2000)
	
							} else {
								uni.showToast({
									icon: 'none',
									title: res.msg
								})
							}
						}, (res) => {
							uni.hideLoading()
							uni.showToast({
								icon: 'error',
								title: res.msg,
								duration: 2000
							});
						})
					}
				})
			}
		});
		// #endif
	},
	
	/**
	 * 判断当前是否登录
	 */
	is_login() {
		let user_info = uni.getStorageSync('user_info')
		return user_info == "" ? false : true
	},

	/**
	 * 绑定登录信息
	 */
	bind_login_info(loginInfo) {
		uni.setStorageSync('login_info', loginInfo)
		uni.setStorageSync('token', loginInfo.token)
	},

	/**
	 * 绑定用户信息
	 */
	bind_user_info(userInfo) {
		uni.setStorageSync('user_info', userInfo)
	},

	/**
	 * 获取用户信息
	 */
	getUserInfo() {
		let user_info = uni.getStorageSync('user_info')
		return user_info == "" ? null : user_info
	},

	/**
	 * 获取用户登录信息
	 */
	getLoginInfo() {
		let login_info = uni.getStorageSync('user_info')
		return login_info == "" ? null : login_info
	},

	/**
	 * 清空用户信息
	 */
	clearUserInfo() {
		uni.clearStorageSync()
	},
	
	/**
	 * 清空login信息
	 */
	clearLoginInfo() {
		uni.setStorageSync('login_info',"")
		uni.setStorageSync('user_info',"")
		uni.setStorageSync('token',"")
	},
	
	/**
	 * 清空设备存储信息
	 */
	clearStorageDeviceValue(id){
		var key = ""
		key = id + "_lastTime"
		console.log("clearStorageValue _lastTime key is:",key)
		uni.removeStorage(key)
		key = id + "_broadcastStr"
		console.log("clearStorageValue key is:",key)
		uni.removeStorage(key)
	}
}