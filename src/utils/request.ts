import axios from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { getLocalStorage } from '@/utils/storage'
import settings from '@/settings'

class VSSError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

let timeoutPromise: Promise<any>
const service = axios.create({
  baseURL: '/vss/v1', // url = base url + request url
  timeout: 5 * 3600 * 1000
  // withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    if (UserModule.token) {
      config.headers['token'] = UserModule.token
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// Response interceptors
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.dir(error)
    if (!timeoutPromise && error.response && error.response.data.code === 16) {
      timeoutPromise = MessageBox.confirm(
        '登录超时，可以取消继续留在该页面，或者重新登录',
        '确定登出',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning'
        }
      )
      timeoutPromise.then(() => {
        const loginType = getLocalStorage('loginType')
        UserModule.ResetToken()
        if (loginType === 'sub') {
          window.location.href = `#${settings.subLoginUrl}?redirect=%2Fdashboard`
        } else if (loginType === 'main') {
          window.location.href = `#${settings.mainLoginUrl}?redirect=%2Fdashboard`
        } else {
          window.location.href = `${settings.casLoginUrl}?redirect=%2Fdashboard`
        }
      })
    }
    const data = error.response && error.response.data
    const code = data && data.code ? data.code : '-1'
    const message = data && data.message ? data.message : '服务器异常，请稍后再试。'
    console.log('code: ', code, ' message: ', message)
    return Promise.reject(new VSSError(code, message))
  }
)

export default service
