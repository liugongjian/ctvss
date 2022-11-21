<template>
  <el-dialog
    title="设备导入管理"
    :v-loading="isLoading"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog(false)"
  >
    <p v-if="process.status === 'loading'" class="process__message">{{ process.message }}</p>
    <p v-if="process.status === 'success'" class="process__message">{{ `总计导入 ${process.total} 条` }}</p>
    <p v-if="process.status === 'success'" class="process__message">{{ `成功导入 ${process.success} 条` }}</p>
    <p v-if="process.status === 'success'" class="process__message">
      {{ `失败导入 ${process.fail} 条` }}
      <span v-if="process.fail" style="margin-left: 20px;">
        下载 <el-button type="text" @click="exportFailedExcel">失败表格</el-button>
      </span>
    </p>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isLoading" @click="closeDialog(true)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { importDevice, exportFailDevice } from '../api/device'
import ExportExcelTemplate from '@vss/device/services/Device/DeviceExportTemplate'

@Component({
  name: 'upload-excel'
})
export default class extends Vue {
  @Prop()
  private file: any
  @Prop()
  private data: any
  private isLoading = false
  private dialogVisible = true
  private process: any = {
    message: '开始转码',
    status: 'loading',
    fail: 0,
    success: 0,
    total: 0,
    importFileFail: ''
  }
  private base64File: any = ''
  public reader: any

  private mounted() {
    this.importExcel()
  }

  // 导入设备
  private importExcel() {
    this.process.status = 'loading'
    this.process.message = '转码中...'
    console.log('this.file, this.reader--->', this.file, this.data)
    ExportExcelTemplate.fileToBase64(this.file, this.reader).then(async(fileString: any) => {
      this.process.message = '转码成功！'
      fileString = fileString.split(',')[1]
      try {
        const params: any = {
          dirId: this.data.dirId,
          importFile: fileString
        }
        this.data.parentDeviceId && (params.parentDeviceId = this.data.parentDeviceId)
        this.process.message = '导入设备中...'
        const res = await importDevice(params)
        if (!res.code) {
          this.process = {
            message: '导入设备完成',
            status: 'success',
            fail: res.fail,
            success: res.success,
            total: res.total,
            // importFileFail: res.importFileFail
          }
        } else {
          this.process.message = '导入设备失败！'
          console.log('导入设备失败', res.message)
        }
      } catch (e) {
        this.process.message = '导入设备失败！'
      }
    }).catch(() => {
      this.process.message = '转码失败！'
    })
  }

  private async exportFailedExcel() {
    try {
      const param = { dirId: this.data.dirId }
      const res  = await exportFailDevice(param)
      ExportExcelTemplate.downloadFileWithBlob(this.data.fileName + 'fail', res)
    } catch (error) {
      console.log(error)
    }
    
  }

  private closeDialog(isRefresh: boolean) {
    this.reader && this.reader.abort()
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .process {
    position: relative;
    padding: 0 20px;

    &__message {
      margin-top: 10px;
      height: 32px;
      line-height: 32px;
    }
  }
</style>
