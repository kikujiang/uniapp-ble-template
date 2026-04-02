import user_util from '@/common/user-util.js'
import apiClient from '@/src/core/network/api-client.js'

const noop = () => {}

export default {
	
	/**
	 * 和服务端的接口交互
	 * @param {Object} url 服务端对应的字段
	 * @param {Object} method 
	 * @param {Object} data 数据
	 * @param {Object} callback_success 返回成功之后的回调
	 * @param {Object} callback_fail 返回失败的回调
	 */
	send(url, method, data, callback_success, callback_fail) {
		data = data || {}
		let loginInfo = user_util.getLoginInfo()
		if (loginInfo != null) {
			data.uid = loginInfo.id
			data.token = loginInfo.token
		}

		apiClient.requestLegacy({
			url,
			method,
			data,
			callback_success: callback_success || noop,
			callback_fail: callback_fail || noop
		})
	},
	
	sendWithoutLoginInfo(url, method, data, callback_success, callback_fail) {
		data = data || {}
		apiClient.requestLegacy({
			url,
			method,
			data,
			callback_success: callback_success || noop,
			callback_fail: callback_fail || noop
		})
	},

	updateTmpFile(url, fileUrl, fileName, callback_success, callback_fail) {
		apiClient.uploadLegacy({
			url,
			filePath: fileUrl,
			name: fileName,
			transport: 'wx',
			callback_success: callback_success || noop,
			callback_fail: callback_fail || noop
		})
	},

	/**
	 * 上传图片信息
	 * @param {Object} url
	 * @param {Object} method
	 * @param {Object} filePath
	 * @param {Object} callback_success
	 * @param {Object} callback_fail
	 */
	uploadImg(url, method, filePath, callback_success, callback_fail) {
		apiClient.uploadLegacy({
			url,
			filePath: filePath,
			name: 'image',
			callback_success: callback_success || noop,
			callback_fail: callback_fail || noop
		})
	},
	
	/**
	 * 上传video文件
	 * @param {Object} url
	 * @param {Object} method
	 * @param {Object} filePath
	 * @param {Object} callback_success
	 * @param {Object} callback_fail
	 */
	uploadVideo(url, method, filePath, callback_success, callback_fail) {
		apiClient.uploadLegacy({
			url,
			filePath: filePath,
			name: 'video',
			callback_success: callback_success || noop,
			callback_fail: callback_fail || noop
		})
	}
}
