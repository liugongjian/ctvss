import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'

let timeoutPromise: Promise<any>
const service = axios.create({
  baseURL: '/v1', // url = base url + request url
  timeout: 5000
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
    if (!timeoutPromise && error.response && error.response.data.code === 7) {
      timeoutPromise = MessageBox.confirm(
        '登录超时，可以取消继续留在该页面，或者重新登录',
        '确定登出',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      timeoutPromise.then(() => {
        UserModule.ResetToken()
        location.reload() // To prevent bugs from vue-router
      })
    }
    const message = error.response.data ? error.response.data.message : null
    if (message) {
      return Promise.reject(message)
    } else {
      Message.error('服务器异常，请稍后再试。')
    }
  }
)

export default service
