// for组件命名：form10001
// meta命名：10001
const path = require('path')
const metas = require.context('.', true, /\.ts$/)
const forms = require.context('.', true, /\.vue$/)
let AlgoConfigs = {
  algos: {},
  components: {}
}
const metasWithoutIndex = metas.keys().filter(key => {
  const name = path.basename(key, '.ts')
  return name !== 'index'
})
metasWithoutIndex.forEach(key => {
  const name = key.split('/')[1]
  AlgoConfigs.algos[name] = metas(key).default || metas(key)
})

forms.keys().forEach(key => {
  const name = 'form' + key.split('/')[1]
  AlgoConfigs.components[name] = forms(key).default || forms(key)
})

export default AlgoConfigs
