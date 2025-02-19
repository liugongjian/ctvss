import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message, MessageBox } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'
import { PermissionModule } from '@/store/modules/permission'
import settings from './settings'
import { removeTicket } from '@/utils/cookies'
import * as loginService from '@/services/loginService'
import casService from './services/casService'

NProgress.configure({ showSpinner: false })

const innerWhiteList = loginService.innerUrl.whiteList

const getPageTitle = (key: string) => {
  return (key ? `${key} - ` : '') + settings.title
}

router.beforeEach(async(to: Route, from: Route, next: any) => {
  // Start progress bar
  NProgress.start()
  console.log('to: ', to, ' from: ', from)

  if (innerWhiteList.some(url => to.path.startsWith(url))) {
    if (UserModule.casLoginId) {
      setTimeout(() => MessageBox.confirm(`您已通过${casService.casUrl.type_cn}登录，点击确认退出登录，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning'
      }).then(async() => {
        if (UserModule.token) {
          await UserModule.LogOut()
        }
        removeTicket(casService.casUrl.type)
        window.location.href = loginService.casUrl.logout
      }).catch(err => {
        console.log('err:', err)
        next({ path: from.path })
        NProgress.done()
      }), 200)
    } else {
      if (UserModule.token) {
        next({ path: '/' })
      } else {
        if (innerWhiteList.indexOf(to.path) === -1) {
          next({ path: '/login' })
        } else {
          next()
        }
      }
      NProgress.done()
    }
    return
  }
  // Determine whether the user has logged in
  if (UserModule.token) {
    // Check whether the user has obtained his permission
    if (UserModule.perms.length === 0) {
      try {
        // Note: perms must be a string array! such as: ['*'] or ['GET']
        await UserModule.GetGlobalInfo()
        const perms = UserModule.perms
        if (!perms.length) {
          Message.error('当前子用户暂无权限，请联系主账号配置权限策略！')
          if (to.path === '/404') {
            return next()
          }
        }
        const iamUserId = UserModule.iamUserId
        const tagObject = UserModule.tags || ({})
        const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
        const version = UserModule.version
        // Generate accessible routes map based on tags and perms and denyPerms
        PermissionModule.GenerateRoutes({ tagObject, perms, denyPerms, iamUserId, version })
        console.log('------', PermissionModule.dynamicRoutes)
        // Dynamically add accessible routes
        router.addRoutes(PermissionModule.dynamicRoutes)
        if (to.path === '/404' || (to.path === '/dashboard' && PermissionModule.dynamicRoutes[0].path !== '/dashboard')) {
          const menuRoutes: any = PermissionModule.dynamicRoutes.filter(route => route.path !== '/changePassword' && route.path !== '/404')
          if (menuRoutes.length > 0) {
            to = menuRoutes[0]
          } else {
          // @ts-ignore
            to = PermissionModule.dynamicRoutes[0]
          }
        }
        // 单点登录菜单高亮
        UserModule.casLoginId && casService.activeCasMenu(to)
        // Hack: ensure addRoutes is complete
        // Set the replace: true, so the navigation will not leave a history record
        next({ ...to, replace: true })
      } catch (err) {
        const loginType = loginService.getLoginType()
        // Remove token and redirect to login page
        UserModule.ResetToken()
        Message.error(err || 'Has Error')

        console.log('loginType:', loginType)
        if (loginType === 'sub') {
          next(`${loginService.innerUrl.sub}?redirect=%2Fdashboard`)
        } else if (loginType === 'main') {
          next(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
        } else {
          if (loginService.casUrl.login) {
            window.location.href = `${loginService.casUrl.login}?redirect=${to.path}`
          } else {
            next(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
            NProgress.done()
          }
        }
      }
    } else {
      if (!to.matched.length) {
        next({ path: '/404', replace: true })
      } else {
      // 单点登录菜单高亮
        UserModule.casLoginId && casService.activeCasMenu(to)
        next()
      }
    }
  } else {
    // Other pages that do not have permission to access are redirected to the login page.
    const loginType = loginService.getLoginType()
    if (loginType === 'sub') {
      next(`${loginService.innerUrl.sub}?redirect=%2Fdashboard`)
    } else if (loginType === 'main') {
      next(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
    } else {
      if (loginService.casUrl.login) {
        window.location.href = `${loginService.casUrl.login}?redirect=${to.path}`
      } else {
        next(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
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
