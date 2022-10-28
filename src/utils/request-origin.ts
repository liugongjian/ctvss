import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'

axios.defaults.withCredentials = false

const service = axios.create({
  baseURL: 'http://172.24.6.146:9094/v1/', // url = base url + request url
  // http://182.43.127.71:9280/devops/v1/ai/aiAbility/describelist
  timeout: 5000,
  withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    if (UserModule.token) {
      // config.headers['token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJYW1Vc2VySWQiOiIiLCJNYWluVXNlcklkIjoiMjA3MjAwMTYiLCJVc2VyTmFtZSI6InZzcy10ZXN0IiwiZXhwIjoxNjMwMzM5MjAwfQ.WCsgVq8b_piH1lLaXRBGRy5d1-uIdIUEoTlK6BCwtlU'
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
    // Some example codes here:
    // code == 20000: success
    // code == 50001: invalid access token
    // code == 50002: already login in other place
    // code == 50003: access token expired
    // code == 50004: invalid user (user not exist)
    // code == 50005: username or password is incorrect
    // You can change this part for your own usage.
    // const res = response.data
    // if (res.code !== 20000) {
    //   Message({
    //     message: res.message || 'Error',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     MessageBox.confirm(
    //       '你已被登出，可以取消继续留在该页面，或者重新登录',
    //       '确定登出',
    //       {
    //         confirmButtonText: '重新登录',
    //         cancelButtonText: '取消',
    //         closeOnClickModal: false,
    //         type: 'warning'
    //       }
    //     ).then(() => {
    //       UserModule.ResetToken()
    //       location.reload() // To prevent bugs from vue-router
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    return response.data
    // }
  },
  (error) => {
    // 登录功能暂时伪造，此处先去除报错提示(by rzj)
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
