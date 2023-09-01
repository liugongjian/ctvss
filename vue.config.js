const path = require('path')
// const styleLintPlugin = require('stylelint-webpack-plugin')
const environment = process.argv[3] === '--env' ? process.argv[4] : 'dev'
const isHttps = process.argv[process.argv.length - 1] === '--https'
const name = '天翼云视频云网平台-客户控制台'
const serverAddressMapping = {
  // local: 'http://172.24.8.148:8081', // 本地环境
  local: 'http://172.24.6.26:8081', // 本地环境
  dev: 'http://182.43.127.35:9190', // 开发环境
  dev1: 'http://182.43.127.35:9067', // 开发环境dev-1
  devrefactor: 'http://182.43.127.35:9062', // 开发环境dev-refactor
  testrefactor: 'http://182.43.127.36:9060', // 重构-测试环境
  test: 'http://182.43.127.35:9080', // 测试环境
  test1: 'http://182.43.127.35:9060', // 测试环境test-1
  test2: 'http://182.43.127.35:9061', // 测试环境test-2
  test3: 'http://182.43.127.35:9062', // 测试环境test-3
  test4: 'http://182.43.127.35:9063', // 测试环境test-4
  pre: 'http://182.43.127.35:9070', // 预发布环境
  prod: 'https://console.vaas.ctyun.cn' // 生产环境
}
const portMapping = {
  local: 8081,
  dev: 9190,
  dev1: 9067,
  devrefactor: 9062,
  testrefactor: 9060,
  test: 9080,
  test1: 9060,
  test2: 9061,
  test3: 9062,
  test4: 9063,
  pre: 9070,
  prod: 443
}
const serverAddress = serverAddressMapping[environment]
const devServerPort = portMapping[environment]

console.info(`启动${environment}环境:`, serverAddress)
console.info('是否开启https:', isHttps)

module.exports = {
  publicPath: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'pre') ? '/vss/' : '/',
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
      /**
       * CDN单点登录
       */
      '^/iam/gw/': {
        target: 'https://iam-cbip.ctcdn.cn:8843/',
        secure: false,
        changeOrigin: true,
        timeout: 3 * 1000,
        bypass: (req) => {
          if (req.headers && req.headers.referer) {
            const url = new URL(req.headers.referer)
            url.host = 'iam-cbip.ctcdn.cn'
            url.port = '8843'
            req.headers.referer = url.href
          }
        }
      },
      '^/iam/': {
        target: 'https://iam-cbip.ctcdn.cn:8843/',
        secure: false,
        changeOrigin: true,
        timeout: 3 * 1000
      },
      /**
       * 天翼云单点登录
       */
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
        changeOrigin: true,
        secure: false
      },
      '/v2': {
        target: serverAddress,
        changeOrigin: true,
        secure: false
      }
    },
    historyApiFallback: true,
    disableHostCheck: true
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'node_modules/@vss/base/assets/css/_variables.scss'),
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
    // config.plugin('stylelint').use(styleLintPlugin, [
    //   {
    //     files: ['**/*.{html,vue,css,sass,scss}'],
    //     // fix: true, // 自动修复
    //     cache: true,
    //     emitError: true,
    //     failOnError: false
    //   }
    // ])
    config.plugin('simple-progress-webpack-plugin')
      .use(require.resolve('simple-progress-webpack-plugin'), [{
        format: 'compact'
      }])

    config.module
      .rule('thejs')
      .test(/\.js$/)
      .include
      .add(path.resolve('src'))
      .add(path.resolve('node_modules/element-ui/packages'))
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .optimization.splitChunks({
              chunks: 'all',
              maxAsyncRequests: 10,
              maxInitialRequests: 10,
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
                antv: {
                  name: 'chunk-antv', // split antv into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?@antv(.*)/ // in order to adapt to cnpm
                },
                // exceljs: {
                //   name: 'chunk-exceljs', // split exceljs into a single package
                //   priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                //   test: /[\\/]node_modules[\\/]_?exceljs(.*)/ // in order to adapt to cnpm
                // },
                // hlsjs: {
                //   name: 'chunk-hlsjs', // split hlsjs into a single package
                //   priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                //   test: /[\\/]node_modules[\\/]_?hls\.js(.*)/ // in order to adapt to cnpm
                // },
                // flvjs: {
                //   name: 'chunk-flvjs', // split hlsjs into a single package
                //   priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                //   test: /[\\/]node_modules[\\/]_?flv\.js(.*)/ // in order to adapt to cnpm
                // },
                // player: {
                //   name: 'chunk-player', // split hlsjs into a single package
                //   priority: 40, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                //   test: /[\\/]src[\\/]components[\\/]Player(.*)/ // in order to adapt to cnpm
                // },
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
