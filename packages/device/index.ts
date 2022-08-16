import './assets/css/index.scss'

/**
 * 组件清单
 */
// import Hamburger from './components/Hamburger/index.vue'
// import Pagination from './components/Pagination/index.vue'
// import StatusBadge from './components/StatusBadge/index.vue'

// export {
//   Hamburger,
//   Pagination,
//   StatusBadge
// }

/**
 * 仅注册使用频率高的，轻量级的组件
 */
const componentsList = []

export default {
  install(Vue) {
    componentsList.map((component: any) => {
      Vue.component(component.options.name, component)
    })
  }
}
