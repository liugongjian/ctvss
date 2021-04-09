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
  private event: any
  private isLoading: boolean = false
  private dialogVisible = true
  private process: any = {
    messag: '',
    percent: 0,
    status: 'success'
  }

  @Watch('event')
  private isEventChange(event: any) {
    if (event.type === 'progress') {
      this.isLoading = true
      this.process.percent = parseInt(event.percent)
      this.process.message = `设备表格导入中，完成进度${this.process.percent}%`
      if (event.percent === 100) {
        this.process.message = `正在添加设备中...`
      }
    } else if (event.id === 101) {
      this.isLoading = false
      this.process.percent = 100
      this.process.message = `添加设备成功`
    } else if (event.type === 'error') {
      this.isLoading = false
      this.process.status = 'exception'
      this.process.message = `设备导入失败`
    }
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
