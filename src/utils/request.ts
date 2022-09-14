import axios, { AxiosResponse } from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { VGroupModule } from '@/store/modules/vgroup'
import * as loginService from '@/services/loginService'
import { VSSError } from '@/utils/error'
import { toLowerCase } from '@vss/base/utils/param'

let timeoutPromise: Promise<any>
const service = axios.create({
  baseURL: '/v1', // url = base url + request url
  timeout: 5 * 3600 * 1000
  // withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    if (UserModule.token) {
      config.headers['token'] = UserModule.token
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
    // TODO: 后端处理大小写
    const resData = response.data.Data ? toLowerCase(response.data.Data) : toLowerCase(response.data)
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
    const data = response && response.data
    const requestId = data && data.requestId
    const code = data && data.code ? data.code : '-1'
    let message = data && data.message ? data.message : '服务器异常，请稍后再试。'
    console.log('code: ', code, ' message: ', message)
    return Promise.reject(new VSSError(code, message, requestId))
  }
}

export default service
