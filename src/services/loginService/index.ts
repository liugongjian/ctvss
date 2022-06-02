import Vue from 'vue'
import App from '@/App.vue'
import store from '@/store'
import { GroupModule } from '@/store/modules/group'
import { UserModule } from '@/store/modules/user'
import router from '@/router'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'
import casService from '@/services/casService'
import settings from '@/settings'

let _loginType = null
export const getLoginType = () => {
  if (_loginType == null) {
    _loginType = getLocalStorage('loginType')
  }
  return _loginType
}

export const setLoginType = (loginType: string) => {
  _loginType = loginType
  setLocalStorage('loginType', loginType)
}

function handleUrlToken() {
  const href = window.location.href
  if (href.indexOf('token=') !== -1) {
    const token = href.slice(href.indexOf('token=') + 'token='.length, href.lastIndexOf('#'))
    UserModule.SetToken(token)
    window.history.replaceState(null, '', href.slice(0, href.indexOf('?token=')))
  }
}

export async function initLogin() {
  try {
    // 从localstorage中读取选中的业务组
    GroupModule.GetGroupFromLs()
    casService.authCas().then(async(data: any) => {
      const casLoggedIn = data.isLoggedIn
      const innerLoggedInLastTime = ['main', 'sub'].includes(getLoginType())
      const curCasLoginId = data.property && data.property.loginId
      const preCasLoginId = getLocalStorage('casLoginId')
      if (casLoggedIn === innerLoggedInLastTime || (casLoggedIn && preCasLoginId && preCasLoginId !== curCasLoginId)) {
        UserModule.ResetToken()
      } else if (casLoggedIn) {
        UserModule.SetCASLoginId(data.property.loginId)
        setLoginType('cas')
        casService.initCas('#container')
      }

      handleUrlToken()
      new Vue({
        router,
        store,
        render: (h) => h(App)
      }).$mount('#app')
    })
  } catch (e) {
    console.log('init login error: ', e.message)
  }
}

export const casUrl = casService.casUrl
export const innerUrl = {
  // const whiteList = ['/login', '/login/subAccount', '/reset-password', '/login/', '/login/subAccount/', '/reset-password/']
  whiteList: ['/login', '/login/subAccount', '/reset-password'],
  prefix: settings.projectPrefix,
  main: '/login',
  sub: '/login/subAccount'
}
