import 'babel-polyfill'
import Polyfill from '@/polyfill'
import Vue, { DirectiveOptions } from 'vue'
import { isIE } from '@/utils/browser'

import ElementUI from 'element-ui'
import SvgIcon from 'vue-svgicon'
import InfoList from '@/components/InfoList'
import ShowAlert from '@/components/ShowAlert'

import 'normalize.css'
import 'vue2-timepicker/dist/VueTimepicker.css'
import '@/styles/element-variables.scss'
import '@/styles/index.scss'

import App from '@/App.vue'
import store from '@/store'
import { GroupModule } from '@/store/modules/group'
import { AppModule } from '@/store/modules/app'
import { UserModule } from '@/store/modules/user'
import router from '@/router'
import '@/icons/components'
import '@/permission'
import '@/utils/error-log'
import * as directives from '@/directives'
import * as filters from '@/filters'
import settings from './settings'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'

import { initCas } from '@/models/Cas'

// @ts-ignore
window._typeof = (e: any) => {
  return typeof e
}

Vue.use(ElementUI, {
  size: AppModule.size // Set element-ui default size
})

Vue.use(Polyfill)

Vue.use(SvgIcon, {
  tagName: 'svg-icon',
  defaultWidth: '1em',
  defaultHeight: '1em'
})

Vue.use(InfoList)
Vue.use(ShowAlert)

// Register global directives
Object.keys(directives).forEach(key => {
  Vue.directive(key, (directives as { [key: string ]: DirectiveOptions })[key])
})

// Register global filter functions
Object.keys(filters).forEach(key => {
  Vue.filter(key, (filters as { [key: string ]: Function })[key])
})

Vue.config.productionTip = false

if (isIE()) {
  document.getElementsByTagName('html')[0].className = 'ie'
}

/**
 * 先判断用户是否登录
 */
initCas('#container').then(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})

try {
  // 从localstorage中读取选中的业务组
  GroupModule.GetGroupFromLs()
  CtcloudLayout.getPublicInfo().authCurrentPromise.then(async(data: any) => {
    if (!data.isLoggedIn) {
      // 天翼云未登录
      const loginType = getLocalStorage('loginType')
      switch (loginType) {
        case 'main':
        case 'sub':
          new Vue({
            router,
            store,
            render: (h) => h(App)
          }).$mount('#app')
          break
        default: {
          UserModule.ResetToken()
          const path = window.location.pathname
          if (path.startsWith(`${settings.projectPrefix}/login`) || path.startsWith(`${settings.projectPrefix}/login/subAccount`) || path.startsWith(`${settings.projectPrefix}/reset-password`)) {
            // 访问平台主子账号登录路径or子账号重置密码
            new Vue({
              router,
              store,
              render: (h) => h(App)
            }).$mount('#app')
          } else {
            // 访问平台其他路径
            window.location.href = `${settings.casLoginUrl}`
          }
        }
      }
    } else {
      // 天翼云已登录
      const loginId = data.isLoggedIn ? data.property.loginId : null
      const localLoginId = getLocalStorage('ctLoginId')
      if (localLoginId && localLoginId !== loginId) {
        console.log('切换用户登录。。。。。。。')
        localStorage.clear()
        window.location.href = `${settings.casLoginUrl}`
      } else {
        const originalLoginType = getLocalStorage('loginType')
        console.log('originalLoginType: ', originalLoginType)
        if (originalLoginType !== 'cas') {
          UserModule.ResetToken()
        }
        UserModule.SetCTLoginId(loginId)
        setLocalStorage('loginType', 'cas')
        const href = window.location.href
        if (href.indexOf('token=') !== -1) {
          const token = href.slice(href.indexOf('token=') + 'token='.length, href.lastIndexOf('#'))
          UserModule.SetToken(token)
          window.history.replaceState(null, '', href.slice(0, href.indexOf('?token=')))
        }
        CtcloudLayout.config({
          pushHash: (route: any) => {
            router.push({
              path: route.code
            })
          }
        })
        new Vue({
          router,
          store,
          render: (h) => h(App)
        }).$mount('#app')
      }
    }
  })
} catch (e) {
  new Vue({
    router,
    store,
    render: (h) => h(App)
  }).$mount('#app')
}
