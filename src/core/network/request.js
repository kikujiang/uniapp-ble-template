import TIMEOUTS from '@/src/shared/constants/timeouts.js'
import { getApiBaseUrl } from '@/src/app/config/runtime.js'

export const DEFAULT_BASE_URL = getApiBaseUrl()

const isAbsoluteUrl = (url = '') => /^https?:\/\//i.test(url)

export const joinUrl = (baseURL = DEFAULT_BASE_URL, path = '') => {
  if (isAbsoluteUrl(path)) return path
  const base = String(baseURL || '').replace(/\/+$/, '')
  const cleanedPath = String(path || '').replace(/^\/+/, '')
  return `${base}/${cleanedPath}`
}

export const getAuthInfoFromStorage = () => {
  const userInfo = uni.getStorageSync('user_info') || {}
  const loginInfo = uni.getStorageSync('login_info') || {}
  const tokenFromStorage = uni.getStorageSync('token')

  return {
    uid: userInfo.id || loginInfo.id,
    token: tokenFromStorage || userInfo.token || loginInfo.token || ''
  }
}

const normalizeHeaders = (headers = {}) => {
  return {
    'Content-Type': 'application/json',
    ...headers
  }
}

const normalizeRequestError = (err = {}, extra = {}) => {
  const statusCode = err.statusCode || extra.statusCode || 0
  const message =
    err.errMsg ||
    err.message ||
    extra.message ||
    (statusCode ? `HTTP ${statusCode}` : 'network error')

  return {
    ok: false,
    statusCode,
    message,
    raw: err,
    ...extra
  }
}

const toastError = (message = '请求失败') => {
  if (typeof uni !== 'undefined' && uni.showToast) {
    uni.showToast({
      title: message,
      icon: 'none'
    })
  }
}

export const request = ({
  url,
  method = 'GET',
  data = {},
  baseURL = DEFAULT_BASE_URL,
  headers = {},
  timeout = TIMEOUTS.request,
  showErrorToast = false,
  withTokenHeader = false,
  tokenHeaderName = 'Authorization',
  tokenPrefix = 'Bearer '
} = {}) => {
  const requestUrl = joinUrl(baseURL, url)
  const finalHeaders = normalizeHeaders(headers)

  if (withTokenHeader) {
    const authInfo = getAuthInfoFromStorage()
    if (authInfo.token) {
      finalHeaders[tokenHeaderName] = `${tokenPrefix}${authInfo.token}`
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl,
      method,
      data,
      timeout,
      header: finalHeaders,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            ok: true,
            statusCode: res.statusCode,
            data: res.data,
            header: res.header,
            raw: res
          })
          return
        }

        const error = normalizeRequestError(res, {
          statusCode: res.statusCode,
          message: 'request failed'
        })
        if (showErrorToast) toastError(error.message)
        reject(error)
      },
      fail: (err) => {
        const error = normalizeRequestError(err)
        if (showErrorToast) toastError(error.message)
        reject(error)
      }
    })
  })
}

export const requestLegacy = ({
  url,
  method = 'GET',
  data = {},
  baseURL = DEFAULT_BASE_URL,
  headers = {},
  timeout = TIMEOUTS.request,
  callback_success,
  callback_fail
} = {}) => {
  return new Promise((resolve) => {
    uni.request({
      url: joinUrl(baseURL, url),
      method,
      data,
      timeout,
      header: normalizeHeaders(headers),
      success: (res) => {
        if (res.statusCode === 200) {
          callback_success && callback_success(res.data)
        } else {
          callback_fail && callback_fail(res)
        }
        resolve(res)
      },
      fail: (err) => {
        callback_fail && callback_fail(err)
        resolve(err)
      }
    })
  })
}

export const uploadRequest = ({
  url,
  filePath,
  name,
  formData,
  headers = {},
  baseURL = DEFAULT_BASE_URL,
  transport = 'uni'
} = {}) => {
  const uploadApi =
    transport === 'wx' && typeof wx !== 'undefined' && typeof wx.uploadFile === 'function'
      ? wx.uploadFile
      : uni.uploadFile

  return new Promise((resolve, reject) => {
    uploadApi({
      url: joinUrl(baseURL, url),
      filePath,
      name,
      formData,
      header: normalizeHeaders(headers),
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            ok: true,
            statusCode: res.statusCode,
            data: res.data,
            raw: res
          })
          return
        }

        const error = normalizeRequestError(res, {
          statusCode: res.statusCode,
          message: 'upload failed'
        })
        reject(error)
      },
      fail: (err) => {
        reject(normalizeRequestError(err, { message: 'upload failed' }))
      }
    })
  })
}

export const uploadLegacy = ({
  url,
  filePath,
  name,
  formData,
  headers = {},
  baseURL = DEFAULT_BASE_URL,
  transport = 'uni',
  callback_success,
  callback_fail
} = {}) => {
  const uploadApi =
    transport === 'wx' && typeof wx !== 'undefined' && typeof wx.uploadFile === 'function'
      ? wx.uploadFile
      : uni.uploadFile

  return new Promise((resolve) => {
    uploadApi({
      url: joinUrl(baseURL, url),
      filePath,
      name,
      formData,
      header: normalizeHeaders(headers),
      success: (res) => {
        if (res.statusCode === 200) {
          callback_success && callback_success(res.data)
        } else {
          callback_fail && callback_fail(res)
        }
        resolve(res)
      },
      fail: (err) => {
        callback_fail && callback_fail(err)
        resolve(err)
      }
    })
  })
}

export default {
  DEFAULT_BASE_URL,
  joinUrl,
  getAuthInfoFromStorage,
  request,
  requestLegacy,
  uploadRequest,
  uploadLegacy
}
