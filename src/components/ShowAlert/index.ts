import { VNode } from 'vue/types/umd'

type handleParams = {
  type: string;
  handleName?: string;
  msg: string | Function | VNode;
  method: Function;
  payload: any;
  onSuccess?: Function;
}

declare module 'vue/types/vue' {
  interface Vue {
    $alertError: (msg: any) => void;
    $alertSuccess: (msg: string) => void;
    $alertDelete: (params: handleParams) => void;
  }
}

const install = function(Vue: any) {
  const alertHandle = function(params: handleParams) {
    this.$msgbox({
      title: `确认${params.handleName}？`,
      message: params.msg,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: async(action: any, instance: any, done: Function) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = `${params.handleName}中...`
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
        message: `${params.handleName}${params.type}成功`
      })
    }).catch((e: any) => {
      if (e === 'cancel' || e === 'close') return
      this.$message.error(e)
    })
  }

  Vue.prototype.$alertError = function(msg: any) {
    this.$message.error(msg)
  }

  Vue.prototype.$alertSuccess = function(msg: string) {
    this.$message({
      message: msg,
      type: 'success'
    })
  }

  Vue.prototype.$alertHandle = function(params: handleParams) {
    alertHandle.bind(this)(params)
  }

  Vue.prototype.$alertDelete = function(params: handleParams) {
    params.handleName = '删除'
    alertHandle.bind(this)(params)
  }
}

export default install
