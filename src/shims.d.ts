declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'element-ui/lib/locale/lang/*' {
  export const elementLocale: any
}

declare module '*.gif' {
  export const gif: any
}

// TODO: remove this part after vue-count-to has its typescript file
declare module 'vue-count-to'

// TODO: remove this part after vuedraggable has its typescript file
declare module 'vuedraggable'

// TODO: remove this part after vue2-dropzone has its typescript file
declare module 'vue2-dropzone'

// TODO: remove this part after vue-image-crop-upload has its typescript file
declare module 'vue-image-crop-upload'

// TODO: remove this part after vue-splitpane has its typescript file
declare module 'vue-splitpane'

// TODO: remove this part after vue-splitpane has its typescript file
declare module 'vue2-timepicker'

// js-base64@2版本暂无声明文件
declare module 'js-base64'

declare const CtcloudLayout: any
declare const AlogicLayout: any

declare module '*.jpg' {
  export const jpg: any
}
