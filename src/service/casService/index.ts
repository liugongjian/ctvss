import CdnCas from './CdnCas'
import CtyunCas from './CtyunCas'

/**
 * 创建Cas
 * @param container 框架DOM，用于挂载统一页面框架
 * @returns Cas
 */
const createCas = containerId => {
  const container = document.querySelector(containerId)
  const host = location.hostname.split('.').slice(-2)
  switch (host[0]) {
    case 'ctcdn':
      return CdnCas.getInstance(container)
    case 'ctyun':
      return CtyunCas.getInstance(container)
  }
}

/**
 * 初始化Cas
 * @param containerId 框架DOM id，用于挂载统一页面框架
 */
const initCas = async containerId => {
  try {
    const cas = createCas(containerId)
    if (!cas) return

    const auth = await cas.auth()
    if (auth.isLoggedIn) {
      cas.init()
    }
  } catch (e) {
    // todo
  }
}

const initLogin
export default {
  initCas
}
