<template>
  <el-dialog
    title="设备导入管理"
    :v-loading="isLoading"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog"
  >
    <div class="proccess">
      <el-progress
        :percentage="process.percent"
        :show-text="false"
        :status="process.status"
      />
      <div class="process__message">{{ process.message }}</div>
    </div>
    <el-button @click="downloadExcel">下载</el-button>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isLoading" @click="closeDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'UploadExcel'
})
export default class extends Vue {
  @Prop()
  private file: any
  private isLoading: boolean = false
  private dialogVisible = true
  private process: any = {
    messag: '',
    percent: 0,
    status: 'success'
  }
  private base64File: any = ''

  // @Watch('event')
  // private isEventChange(event: any) {
  //   if (event.type === 'progress') {
  //     this.isLoading = true
  //     this.process.percent = parseInt(event.percent)
  //     this.process.message = `设备表格导入中，完成进度${this.process.percent}%`
  //     if (event.percent === 100) {
  //       this.process.message = `正在添加设备中...`
  //     }
  //   } else if (event.id === 101) {
  //     this.isLoading = false
  //     this.process.percent = 100
  //     this.process.message = `添加设备成功`
  //   } else if (event.type === 'error') {
  //     this.isLoading = false
  //     this.process.status = 'exception'
  //     this.process.message = `设备导入失败`
  //   }
  // }

  private mounted() {
    console.log(this.file)
    this.getBase64(this.file).then((res: any) => {
      console.log('转码成功', res)
      this.base64File = res
    })
  }

  private downloadExcel() {
    this.downloadFileUrl('test', this.base64File)
  }

  private downloadFileUrl(fileName: string, file: any) {
    const blob = this.dataURLtoFile(`data:application/zip;base64,${file}`)
    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.xlsx`
    link.click()
  }
  private dataURLtoFile(base64: any) {
    var arr = base64.split(',')
    var mime = arr[0].match(/:(.*?);/)[1]
    var bstr = atob(arr[1])
    var n = bstr.length
    var u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  private getBase64(file: any) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader()
      let fileResult: any = ''
      reader.readAsDataURL(file)
      // 开始转
      reader.onload = function() {
        fileResult = reader.result
      }
      // 转 失败
      reader.onerror = function(error) {
        reject(error)
      }
      // 转 结束  咱就 resolve 出去
      reader.onloadend = function() {
        resolve(fileResult)
      }
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .process{
    position: relative;
    padding: 0 20px;
    &__message {
      margin-top: 10px;
    }
  }
</style>
