export default {
	/**
	 * 缓存custombar
	 */
	save_custombar(info){
		uni.setStorageSync("custombar",info)
	},
	
	/**
	 * 获取custombar
	 */
	get_custombar(){
		let custombar = uni.getStorageSync('custombar')
		return custombar
	},
	
	/**
	 * 缓存statusbar
	 */
	save_statusbar(info){
		uni.setStorageSync("statusbar",info)
	},
	
	/**
	 * 获取statusbar
	 */
	get_statusbar(){
		let statusbar = uni.getStorageSync('statusbar')
		return statusbar
	}
}