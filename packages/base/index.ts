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
import CopyTip from './components/CopyTip/index.vue'

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
  StatusBadge,
  CopyTip
]

const directivesList = [
  adaptiveHiding
]

// ElementUI配置
Object.defineProperties((ElementUI.Dialog as any).props, {
  'closeOnClickModal': {
    value: { default: false, type: Boolean }
  }
})



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
