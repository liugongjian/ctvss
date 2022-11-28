import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { VGroupModule } from '@/store/modules/vgroup'
import * as loginService from '@/services/loginService'
import { VSSError } from '@/utils/error'

import { toLowerCase, toUpperCase } from '@/utils/param'
import { whitelist } from '@/api/v2-whitelist'

let timeoutPromise: Promise<any>
const service = axios.create({
  // baseURL: '/v1', // url = base url + request url
  timeout: 5 * 3600 * 1000
  // withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    requestTransform(config)
    if (UserModule.token) {
      config.headers.token = UserModule.token
      if (GroupModule.group && GroupModule.group.inProtocol === 'vgroup') {
        const pathname = window.location.pathname
        // 防止虚拟业务组页面加载groupList时带role-id与real-group-id
        if (config.url !== '/group/list' && (pathname.startsWith('/vss/device') || pathname.startsWith('/vss/screen') || pathname.startsWith('/vss/replay')) && !config.headers['role-id'] && !config.headers['real-group-id']) {
          config.headers['role-id'] = VGroupModule.roleId
          config.headers['real-group-id'] = VGroupModule.realGroupId
        }
      }
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
    return responseHandler(response)
  },
  (error) => {
    if (axios.isCancel(error)) {
      error.response = {
        data: {
          code: -2,
          message: 'Canceled'
        }
      }
    }
    return responseHandler(error.response)
  }
)

function responseHandler(response: AxiosResponse) {
  if (response && (response.status === 200) && response.data && !response.data.code) {
    const resData = toLowerCase(response.data) as AxiosResponse
    if (Array.isArray(resData)) {
      return resData
    } else if (resData.data) {
      return resData.data
    } else {
      return resData
    }
    // const resData: AxiosResponse = (toLowerCase(response.data) as AxiosResponse).data ? (toLowerCase(response.data) as AxiosResponse).data : response.data
    // return resData
  } else {
    if (!timeoutPromise && response && response.data && response.data.code === 16) {
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
      debugger
      timeoutPromise.then(() => {
        const loginType = loginService.getLoginType()
        UserModule.ResetToken()
        if (loginType === 'sub') {
          window.location.href = `${loginService.innerUrl.prefix}/${loginService.innerUrl.sub}?redirect=%2Fdashboard`
        } else if (loginType === 'main') {
          window.location.href = `${loginService.innerUrl.prefix}/${loginService.innerUrl.main}?redirect=%2Fdashboard`
        } else {
          window.location.href = `${loginService.casUrl.login}?redirect=%2Fdashboard`
        }
      })
    }
    const data = response && response.data
    Object.keys(data).forEach(key => {
      data[key.toLowerCase()] = data[key]
    })
    const requestId = data && data.requestId
    const code = data && data.code ? data.code : '-1'
    const message = data && data.message ? data.message : '服务器异常，请稍后再试。'
    console.log('code: ', code, ' message: ', message)
    return Promise.reject(new VSSError(code, message, requestId))
  }
}

// 转换 ibox 中所需v2 或者 v1 请求地址
// 转换 部分请求参数大小写
function requestTransform(config: AxiosRequestConfig) {
  const url = config.url
  if (whitelist.includes(url)) {
    config.url = '/v2' + url
  } else {
    config.url = '/v1' + url
  }

  if (config.url.includes('/v1/gbcode/') && config.method === 'get') {
    config.params = toUpperCase(config.params)
  }

  if (config.url.includes('/v1/device/customGbId') && config.method === 'get') {
    config.params = JSON.parse(JSON.stringify(config.params).replace('inVideoProtocol', 'inProtocol'))
  }
  return config
}

export default service
