import 'babel-polyfill'
import Polyfill from '@/polyfill'
import Vue, { DirectiveOptions } from 'vue'
import { isIE } from '@/utils/browser'

import ElementUI from 'element-ui'
import SvgIcon from 'vue-svgicon'
import InfoList from '@/components/InfoList'
import ShowAlert from '@/components/ShowAlert'

import 'normalize.css'
import 'vue2-timepicker/dist/VueTimepicker.css'
import '@/styles/element-variables.scss'
import '@/styles/index.scss'

import { AppModule } from '@/store/modules/app'
import '@/icons/components'
import '@/permission'
import '@/utils/error-log'
import * as directives from '@/directives'
import * as filters from '@/filters'

import { initLogin } from '@/services/loginService'

// @ts-ignore
window._typeof = (e: any) => {
  return typeof e
}

Vue.use(ElementUI, {
  size: AppModule.size // Set element-ui default size
})

// @ts-ignore
ElementUI.Dialog.props.closeOnClickModal = false

Vue.use(Polyfill)

Vue.use(SvgIcon, {
  tagName: 'svg-icon',
  defaultWidth: '1em',
  defaultHeight: '1em'
})

Vue.use(InfoList)
Vue.use(ShowAlert)

// Register global directives
Object.keys(directives).forEach(key => {
  Vue.directive(key, (directives as { [key: string ]: DirectiveOptions })[key])
})

// Register global filter functions
Object.keys(filters).forEach(key => {
  Vue.filter(key, (filters as { [key: string ]: Function })[key])
})

Vue.config.productionTip = false

if (isIE()) {
  document.getElementsByTagName('html')[0].className = 'ie'
}

initLogin()
