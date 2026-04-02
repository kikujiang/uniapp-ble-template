export default {
	
	
	hexStringToByteArray(hexString) {
		if (hexString.length % 2 !== 0) {
			throw new Error("Invalid hex string");
		}
	
		let byteArray = [];
		for (let i = 0; i < hexString.length; i += 2) {
			byteArray.push(parseInt(hexString.substr(i, 2), 16));
		}
	
		return byteArray;
	},
	calculateCRC16(data) {
		// CRC-16-IBM (Modbus) polynomial
		const POLYNOMIAL = 0xA001;
		let crc = 0xFFFF;  // Initial value
	
		for (let i = 0; i < data.length; i++) {
			crc ^= data[i];  // XOR byte into least significant byte of crc
	
			for (let j = 0; j < 8; j++) {
				if (crc & 0x0001) {
					crc = (crc >> 1) ^ POLYNOMIAL;
				} else {
					crc >>= 1;
				}
			}
		}
	
		// Swap bytes to match Modbus CRC endianness
		return ((crc << 8) | (crc >> 8)) & 0xFFFF;
	}
}