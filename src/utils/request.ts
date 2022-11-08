import axios, { AxiosResponse } from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { VGroupModule } from '@/store/modules/vgroup'
import * as loginService from '@/services/loginService'
import { VSSError } from '@/utils/error'
import { ApiMapping } from '@/api/api-mapping'
import { whiteList } from '@/api/v1-whitelist'

let timeoutPromise: Promise<any>
const service = axios.create({
  timeout: 5 * 3600 * 1000
  // withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    config.url = urlTransform(config.url)
    if (UserModule.token) {
      config.headers['token'] = UserModule.token
      if (GroupModule.group && GroupModule.group.inProtocol === 'vgroup') {
        const pathname = window.location.pathname
        // 防止虚拟业务组页面加载groupList时带role-id与real-group-id
        // eslint-disable-next-line max-len
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

// 根据用户tag转换请求url
function urlTransform(url: string) {
  const apiList = Object.keys(ApiMapping)
  if (UserModule.version === 2 && !whiteList.includes(url)) {
    url = '/v2' + (apiList.includes(url) ? ApiMapping[url] : url)
  } else {
    url = '/v1' + url
  }
  return url
}

function responseHandler(response: AxiosResponse) {
  if (response && (response.status === 200) && response.data && !response.data.code) {
    const resData = response.data.data
    return resData as AxiosResponse
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
    const data: any = response && response.data
    const requestId = data && data.requestId
    const code = data && data.code ? data.code : '-1'
    const message = data && data.message ? data.message : '服务器异常，请稍后再试。'
    console.log('code: ', code, ' message: ', message)
    return Promise.reject(new VSSError(code, message, requestId))
  }
}

export default service
