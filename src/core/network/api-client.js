import {
  DEFAULT_BASE_URL,
  request,
  requestLegacy,
  uploadRequest,
  uploadLegacy
} from '@/src/core/network/request.js'

export const createApiClient = ({ baseURL = DEFAULT_BASE_URL } = {}) => {
  return {
    baseURL,
    request(options = {}) {
      return request({ ...options, baseURL: options.baseURL || baseURL })
    },
    get(url, data = {}, options = {}) {
      return request({
        ...options,
        baseURL: options.baseURL || baseURL,
        url,
        method: 'GET',
        data
      })
    },
    post(url, data = {}, options = {}) {
      return request({
        ...options,
        baseURL: options.baseURL || baseURL,
        url,
        method: 'POST',
        data
      })
    },
    requestLegacy(options = {}) {
      return requestLegacy({ ...options, baseURL: options.baseURL || baseURL })
    },
    upload(options = {}) {
      return uploadRequest({ ...options, baseURL: options.baseURL || baseURL })
    },
    uploadLegacy(options = {}) {
      return uploadLegacy({ ...options, baseURL: options.baseURL || baseURL })
    }
  }
}

const defaultApiClient = createApiClient()

export { DEFAULT_BASE_URL }
export default defaultApiClient
