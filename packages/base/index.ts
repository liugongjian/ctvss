import ElementUI from 'element-ui'
import './assets/css/element-variables.scss'
import './assets/css/index.scss'

/**
 * 组件清单
 */
import CommonLayout from './components/CommonLayout/index.vue'
import CommonTree from './components/CommonTree/index.vue'
import Hamburger from './components/Hamburger/index.vue'
import Pagination from './components/Pagination/index.vue'
import StatusBadge from './components/StatusBadge/index.vue'

const componentsList = [
  CommonLayout,
  CommonTree,
  Hamburger,
  Pagination,
  StatusBadge
]

export default {
  install(Vue) {
    Vue.use(ElementUI, { size: 'medium' })
    componentsList.map((component: any) => {
      Vue.component(component.options.name, component)
    })
  }
}
