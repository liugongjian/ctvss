import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { VGroupModule } from '@/store/modules/vgroup'
import * as loginService from '@/services/loginService'
import { VSSError } from '@/utils/error'
import { ApiMapping } from '@/api/api-mapping'
import { whiteList } from '@/api/v1-whitelist'
import { indexOf } from 'lodash'
import e from 'cors'

let timeoutPromise: Promise<any>
const service = axios.create({
  timeout: 5 * 3600 * 1000
  // withCredentials: true // send cookies when cross-domain requests
})

const ifExport = (config:any)=>{return config.url.includes('/device/exportDeviceAll') || config.url.includes('/device/exportDeviceOption')}

// Request interceptors
service.interceptors.request.use(
  (config) => {
    requestTransform(config)
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
function requestTransform(config: AxiosRequestConfig) {
  const url = config.url
  if (UserModule.version === 2 && !whiteList.includes(url)) {
    config.url = '/v2' + url
  } else {
    const apiList = Object.keys(ApiMapping)
    if (apiList.includes(url)) {
      const mapArr = ApiMapping[url].split(':')
      config.url = '/v1' + mapArr[0]
      if (mapArr[1] === 'get') {
        config.method = mapArr[1]
        config.params = config.data
        config.data = undefined
      } else if (mapArr[1]) {
        config.method = mapArr[1]
        config.data = config.params
        config.params = undefined
      }
    } else {
      config.url = '/v1' + url
    }
  }
  return config
}

function responseHandler(response: AxiosResponse) {
  if (response && (response.status === 200) && response.data && !response.data.code) {
    // TODO: 后续删除灰度判断
    // const resData = UserModule.version === 2 ? response.data.data : response.data.data
    let resData:AxiosResponse
    // 过滤 导出接口 返回
    if(ifExport(response.config)){
      resData = response
    }else{
      resData = UserModule.version === 2 ? response.data.data : response.data.data
    }
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
