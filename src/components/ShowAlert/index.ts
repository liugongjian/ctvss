import { VNode } from 'vue/types/umd'

type deleteParams = {
  type: string;
  msg: string | Function | VNode;
  method: Function;
  payload: any;
  onSuccess?: Function;
}

declare module 'vue/types/vue' {

  interface Vue {
    $alertError: (msg: any) => void;
    $alertSuccess: (msg: string) => void;
    $alertDelete: (params: deleteParams) => void;
  }
}

const install = function(Vue: any) {
  Vue.prototype.$alertError = function(msg: any) {
    this.$message.error(msg)
  }

  Vue.prototype.$alertSuccess = function(msg: string) {
    this.$message({
      message: msg,
      type: 'success'
    })
  }

  Vue.prototype.$alertDelete = function(params: deleteParams) {
    this.$msgbox({
      title: '确认删除？',
      message: params.msg,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: async(action: any, instance: any, done: Function) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '删除中...'
          try {
            await params.method(params.payload)
            done()
          } catch (e) {
            this.$message.error(e.message)
          } finally {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定'
          }
        } else {
          done()
        }
      }
    }).then(() => {
      params.onSuccess && params.onSuccess()
      this.$message({
        type: 'success',
        message: `删除${params.type}成功`
      })
    }).catch((e: any) => {
      if (e === 'cancel' || e === 'close') return
      this.$message.error(e)
    })
  }
}

export default install
