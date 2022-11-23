import Polyfill from '@/polyfill'
import Vue, { DirectiveOptions } from 'vue'
import { isIE } from '@/utils/browser'

import SvgIcon from 'vue-svgicon'
import InfoList from '@/components/InfoList'
import ShowAlert from '@/components/ShowAlert'

import 'normalize.css'
import 'vue2-timepicker/dist/VueTimepicker.css'
import '@/styles/element-variables.scss'
import '@/styles/index.scss'

import '@/icons/components'
import '@/permission'
import '@/gray-scale'
import '@/utils/error-log'
import * as directives from '@/directives'
import * as filters from '@/filters'

import { initLogin } from '@/services/loginService'
import VssBase from '@vss/base'
import VssDevice from '@vss/device'
import { loadJs } from '@vss/base/utils/load-resource'
import { isSupportH265 } from '@vss/base/utils/video'

// @ts-ignore
window._typeof = (e: any) => {
  return typeof e
}

Vue.use(VssBase)
Vue.use(VssDevice)

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
  Vue.directive(key, (directives as { [key: string]: DirectiveOptions })[key])
})

// Register global filter functions
Object.keys(filters).forEach(key => {
  Vue.filter(key, (filters as { [key: string]: Function })[key])
})

Vue.config.productionTip = false

if (isIE()) {
  document.getElementsByTagName('html')[0].className = 'ie'
}

// 加载h.265播放器插件
if (!isSupportH265()) {
  loadJs(`${process.env.BASE_URL}EasyWasmPlayer.js`)
}

initLogin()
