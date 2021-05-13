import append from './append'

const protoInstall = {
  install: (Vue: any) => {
    Vue.prototype.$append = append([Element.prototype, Document.prototype, DocumentFragment.prototype])
  }
}

export default protoInstall
