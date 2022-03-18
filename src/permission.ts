import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message, MessageBox } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'
import { PermissionModule } from '@/store/modules/permission'
import { getLocalStorage } from '@/utils/storage'
import settings from './settings'
import { removeTicket } from '@/utils/cookies'

NProgress.configure({ showSpinner: false })

// const whiteList = ['/login', '/login/subAccount', '/reset-password', '/auth-redirect']
const whiteList = ['/login', '/login/subAccount', '/reset-password', '/login/', '/login/subAccount/', '/reset-password/']

const getPageTitle = (key: string) => {
  return (key ? `${key} - ` : '') + settings.title
}

router.beforeEach(async(to: Route, from: Route, next: any) => {
  // Start progress bar
  NProgress.start()
  // console.log('to: ', to)
  // console.log('UserModule.token: ', UserModule.token)
  // Determine whether the user has logged in
  if (UserModule.token) {
    // 已登录
    if (to.path.startsWith('/login') || to.path.startsWith('/login/subAccount') || to.path.startsWith('/reset-password')) {
      if (UserModule.ctLoginId) {
        setTimeout(() => MessageBox.confirm('您已通过天翼云登录，点击确认退出登录，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning'
        }).then(async() => {
          await UserModule.LogOut()
          removeTicket()
          window.location.href = 'https://www.ctyun.cn/sign/out'
        }).catch(err => {
          console.log('err:', err)
          console.log('from: ', from)
          next({ path: from.path })
          NProgress.done()
        }), 200)
      } else {
        next({ path: '/' })
        NProgress.done()
      }
    } else {
      // Check whether the user has obtained his permission
      if (UserModule.perms.length === 0) {
        try {
          // Note: perms must be a object array! such as: ['*'] or ['GET']
          await UserModule.GetGlobalInfo()
          const perms = UserModule.perms
          const iamUserId = UserModule.iamUserId
          // Generate accessible routes map based on perms
          PermissionModule.GenerateRoutes({ perms, iamUserId })
          // Dynamically add accessible routes
          router.addRoutes(PermissionModule.dynamicRoutes)
          if (to.path === '/dashboard' && PermissionModule.dynamicRoutes[0].path !== 'dashboard') {
            // @ts-ignore
            to = PermissionModule.dynamicRoutes[0]
          }
          // 单点登录菜单高亮
          UserModule.ctLoginId && (<any>window).CtcloudLayout && (<any>window).CtcloudLayout.consoleLayout.match({
            key: to.meta.activeMenu || ('/' + to.name)
          })
          // Hack: ensure addRoutes is complete
          // Set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (err) {
          // Remove token and redirect to login page
          UserModule.ResetToken()
          Message.error(err || 'Has Error')
          window.location.href = `${settings.casLoginUrl}?redirect=${to.path}`
          NProgress.done()
        }
      } else {
        // 单点登录菜单高亮
        UserModule.ctLoginId && (<any>window).CtcloudLayout && (<any>window).CtcloudLayout.consoleLayout.match({
          key: to.meta.activeMenu || ('/' + to.name)
        })
        next()
      }
    }
  } else {
    // Has no token
    if (whiteList.indexOf(to.path) !== -1) {
      // 主要用于清空loginType&ctLoginId，防止天翼云已登录但是我们平台未登录，出现天翼云头部
      UserModule.ResetToken()
      UserModule.SetCTLoginId('')
      // In the free login whitelist, go directly
      next()
    } else {
      // Other pages that do not have permission to access are redirected to the login page.
      // next(`/login?redirect=${to.path}`)
      const loginType = getLocalStorage('loginType')
      if (loginType === 'sub') {
        next(`${settings.subLoginUrl}?redirect=%2Fdashboard`)
      } else if (loginType === 'main') {
        next(`${settings.mainLoginUrl}?redirect=%2Fdashboard`)
      } else {
        window.location.href = `${settings.casLoginUrl}?redirect=${to.path}`
        NProgress.done()
      }
    }
  }
})

router.afterEach((to: Route) => {
  // Finish progress bar
  NProgress.done()

  // set page title
  document.title = getPageTitle(to.meta.title)
})
