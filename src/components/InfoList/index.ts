import InfoList from './InfoList.vue'
import InfoListItem from './InfoListItem.vue'

const install = function(Vue: any) {
  Vue.component('InfoList', InfoList)
  Vue.component('InfoListItem', InfoListItem)
}

export default install
