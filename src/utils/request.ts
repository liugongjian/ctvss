import axios from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { VGroupModule } from '@/store/modules/vgroup'
import { getLocalStorage } from '@/utils/storage'
import settings from '@/settings'

class VSSError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

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
        if ((pathname.startsWith('/vss/device') || pathname.startsWith('/vss/screen') || pathname.startsWith('/vss/replay')) && !config.headers['role-id'] && !config.headers['real-group-id']) {
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
    console.dir(error)
    return responseHandler(error.response)
  }
)

function responseHandler(response: any) {
  if (response && (response.status === 200) && response.data && !response.data.code) {
    return response.data
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
        const loginType = getLocalStorage('loginType')
        UserModule.ResetToken()
        if (loginType === 'sub') {
          window.location.href = `${settings.projectPrefix}/${settings.subLoginUrl}?redirect=%2Fdashboard`
        } else if (loginType === 'main') {
          window.location.href = `${settings.projectPrefix}${settings.mainLoginUrl}?redirect=%2Fdashboard`
        } else {
          window.location.href = `${settings.casLoginUrl}?redirect=%2Fdashboard`
        }
      })
    }
    const data = response && response.data
    const code = data && data.code ? data.code : '-1'
    let message = data && data.message ? data.message : '服务器异常，请稍后再试。'
    // TODO: 临时替换，后续需中台改
    message = message.replace('改设备', '该设备')
    console.log('code: ', code, ' message: ', message)
    return Promise.reject(new VSSError(code, message))
  }
}

export default service
