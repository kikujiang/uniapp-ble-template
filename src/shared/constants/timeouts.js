const TIMEOUTS = {
  request: 15000,
  ble: {
    writeResponseTimeout: 3000,
    connectTimeout: 8000,
    scanRestartThrottle: 5000,
    scanRestartDelay: 2000,
    scanKeepAliveInterval: 20000,
    deviceOfflineThreshold: 12000
  }
}

export default TIMEOUTS
