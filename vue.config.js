const path = require('path')
const environment = process.argv[3] === '--env' ? process.argv[4] : 'dev'
const isHttps = process.argv[process.argv.length - 1] === '--https'
const name = '天翼云视频云网平台-客户控制台'
const serverAddressMapping = {
  local: 'http://172.24.6.4:8081', // 本地环境
  dev: 'http://182.43.127.35:9190', // 开发环境
  dev1: 'http://182.43.127.35:9050', // 开发环境dev-1
  test: 'https://182.43.127.35:9180', // 测试环境
  test1: 'https://182.43.127.35:9160', // 测试环境test-1
  prod: 'https://182.43.127.45' // 生产环境
}
const portMapping = {
  local: 9180,
  dev: 9190,
  dev1: 9050,
  test: 9180,
  test1: 9160,
  prod: 443
}
const serverAddress = serverAddressMapping[environment]
const devServerPort = portMapping[environment]

console.info(`启动${environment}环境:`, serverAddress)
console.info(`是否开启https:`, isHttps)

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vss/' : '/',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: devServerPort,
    open: true,
    openPage: 'vss/login',
    overlay: {
      warnings: false,
      errors: true
    },
    progress: false,
    proxy: {
      '/ctyun/': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/layout/': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/gw': {
        target: 'https://www.ctyun.cn',
        secure: false,
        changeOrigin: true
      },
      '/ctyun/signin': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/services/user/ImageCode': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/record2/': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/ctyunfile/': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/cloudapp/': {
        target: 'https://www.ctyun.cn/',
        secure: false,
        changeOrigin: true
      },
      '/v1': {
        target: serverAddress,
        changeOrigin: false,
        secure: false
      }
    },
    historyApiFallback: true,
    disableHostCheck: true
  },
  pwa: {
    name: name,
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: path.resolve(__dirname, 'src/pwa/service-worker.js')
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  transpileDependencies: ['flv.js'],
  chainWebpack(config) {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    config.set('name', name)

    // https://webpack.js.org/configuration/devtool/#development
    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-eval-source-map')
      )

    // remove vue-cli-service's progress output
    config.plugins.delete('progress')
    // replace with another progress output plugin to solve the this bug:
    // https://github.com/vuejs/vue-cli/issues/4557
    config.plugin('simple-progress-webpack-plugin')
      .use(require.resolve('simple-progress-webpack-plugin'), [{
        format: 'compact'
      }])

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: path.resolve(__dirname, 'src/components'),
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
