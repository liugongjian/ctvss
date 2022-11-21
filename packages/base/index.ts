import ElementUI from 'element-ui'
import './assets/css/element-variables.scss'
import './assets/css/index.scss'

/**
 * 组件清单
 */
import CommonLayout from './components/CommonLayout/index.vue'
import CommonTree from './components/CommonTree/index.vue'
import Hamburger from './components/Hamburger/index.vue'
import HoverSelector from './components/HoverSelector/index.vue'
import Pagination from './components/Pagination/index.vue'
import StatusBadge from './components/StatusBadge/index.vue'

/**
 * 指令清单
 */
import adaptiveHiding from './directives/adaptiveHiding'

const componentsList = [
  CommonLayout,
  CommonTree,
  Hamburger,
  HoverSelector,
  Pagination,
  StatusBadge
]

const directivesList = [
  adaptiveHiding
]

export default {
  install(Vue) {
    Vue.use(ElementUI, { size: 'medium' })
    componentsList.forEach((component: any) => {
      Vue.component(component.options.name, component)
    })
    directivesList.forEach((directive: any) => {
      Vue.directive(directive.name, directive)
    })
  }
}
