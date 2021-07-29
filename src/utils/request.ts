import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { getLocalStorage } from '@/utils/storage'
import settings from '@/settings'

export const getConsoleDropdownTree = (): Promise<any> =>
  axios({
    url: '/gw/v1/portal/menu/GetTree?domain=console.dropdown&locale=zh-cn',
    method: 'get'
  })

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
    const url = (response && response.config && response.config.url) || ''
    if (!UserModule.iamUserId && url && !url.endsWith('/user/logout')) {
      const mainUserRoleId = response.headers['x-role-id'] || response.headers['X-Role-Id'] || ''
      const mainUserRoleName = decodeURIComponent(response.headers['x-role-name'] || response.headers['X-Role-Name'] || '')
      if (!url.endsWith('/iam/role/switch') && !url.endsWith('/iam/role/exit')) {
        if (UserModule.mainUserRoleId !== mainUserRoleId) {
          UserModule.overrideRoleInfo({ roleId: mainUserRoleId, roleName: mainUserRoleName })
          UserModule.switchRole({ role: false, needWebRequest: false })
        }
      } else {
        UserModule.overrideRoleInfo({ roleId: mainUserRoleId, roleName: mainUserRoleName })
      }
    }
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
