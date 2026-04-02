export default {
	
	/* 时间戳格式化 带 时 分 秒 */
	formatTime(timestamp){
		const date = new Date(timestamp * 1000);
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		const hours = date.getHours()
		const minutes = date.getMinutes()
		const seconds = date.getSeconds()
		return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	},
	
	/**
	 * 用来解析最近一条记录的方法

	 * @param {Object} command 蓝牙接收到的指令
	 */
	decryptRecent(command){
		
	},
	
	/**
	 * 如果遇到有问题的 mac 地址，对其进行修复
	 * 支持 12 位（无冒号）或 17 位（带冒号）格式
	 * @param {Object} old_mac
	 */
	changeMacAddress(old_mac){
		// 移除冒号，统一处理
		const mac = old_mac.replace(/:/g, '')
		if(mac.length == 12){
			// 字节顺序调整
			const result = mac[2]+mac[3]+mac[0]+mac[1]+mac[10]+mac[11]+
				mac[8]+mac[9]+mac[6]+mac[7]+mac[4]+mac[5]
			// 如果原格式带冒号，返回带冒号的格式
			if(old_mac.includes(':')) {
				return result.replace(/(..)(..)(..)(..)(..)(..)/g, 
					'$1:$2:$3:$4:$5:$6').toUpperCase()
			}
			return result.toUpperCase()
		}
		return old_mac
	},
	
	getRandomInt(min, max) {
	    // 确保 min 和 max 是整数
	    min = Math.ceil(min);
	    max = Math.floor(max);
	
	    // 生成 min 到 max 的随机整数
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
}