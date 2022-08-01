import CdnCas from './CdnCas'
import CtyunCas from './CtyunCas'
import { loadJs, loadCss } from '@/utils/load-resource'

/**
 * 创建Cas
 * @param container 框架DOM，用于挂载统一页面框架
 * @returns Cas
 */
let cas: CdnCas | CtyunCas = null
const casUrl = {
  login: '',
  logout: '',
  type: '',
  type_cn: ''
}

const createCas = async() => {
  try {
    const host = location.hostname.split('.').slice(-2)
    switch (host[0]) {
      case 'ctcdn':
        loadCss('/iam/layout/alogic-layout.css')
        await loadJs('/iam/layout/alogic-layout.js')
        cas = CdnCas.getInstance()
        casUrl.login = CdnCas.LOGIN_URL
        casUrl.logout = CdnCas.LOGOUT_URL
        casUrl.type = CdnCas.TYPE
        casUrl.type_cn = CdnCas.TYPE_CN
        break
      case 'ctyun':
        loadCss('/layout/static/css/app.css')
        await loadJs('/layout/ctcloud-layout.min.js')
        cas = CtyunCas.getInstance()
        casUrl.login = CtyunCas.LOGIN_URL
        casUrl.logout = CtyunCas.LOGOUT_URL
        casUrl.type = CtyunCas.TYPE
        casUrl.type_cn = CtyunCas.TYPE_CN
        break
      default:
        throw new Error('单点登录域名未命中')
    }
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * 初始化Cas
 * @param containerId 框架DOM id，用于挂载统一页面框架
 */
const authCas = async() => {
  try {
    if (!cas) {
      await createCas()
    }
    return await cas.auth()
  } catch (e) {
    // todo
    // console.log('cas.auth e: ', e)
  }
}

const initCas = (containerId: string) => {
  cas.init(containerId)
}

/**
 * 过滤非菜单路由
 * @param routes
 */
function filterRouter(routes) {
  const result = []
  routes.forEach(route => {
    if (route.meta && route.meta.hidden) {
      return
    }
    const temp = { ...route }
    if (temp.children) {
      temp.children = filterRouter(temp.children)
      if (temp.children && temp.children.length) {
        result.push(temp)
      }
    } else {
      temp.meta.hidden !== true && result.push(temp)
    }
  })
  return result
}

const renderCasMenu = (routes) => {
  const filteredRoutes = filterRouter(routes)
  cas.renderMenuByRoute(filteredRoutes)
}

const activeCasMenu = (route) => {
  cas.activeMenu(route)
}

export default {
  authCas,
  initCas,
  renderCasMenu,
  activeCasMenu,
  casUrl
}
