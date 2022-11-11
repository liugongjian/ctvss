import router from './router'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'

const whiteList = [
  '/login',
  '/reset-password',
  '/404',
  '/401'
]

router.beforeEach(async(to: Route, from: Route, next: any) => {
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  if (UserModule.version === 1) {
    let path = to.path
    if (!to.path.startsWith('/1')) {
      path = '/1' + path
      next({
        ...to,
        path
      })
    } else {
      next()
      return
    }
  }
  next()
})
