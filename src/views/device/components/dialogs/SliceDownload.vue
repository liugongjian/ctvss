<template>
  <el-dialog
    title="录像文件下载"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="450px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      class="form"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="日期:" prop="date">
        <el-date-picker
          v-model="form.date"
          class="form-date"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="时间区间:" prop="endTime">
        <vue-timepicker v-model="form.startTime" placeholder="开始时间" format="HH:mm:ss" hour-label="时" minute-label="分" second-label="秒" />
        <span class="time-range-gap">至</span>
        <vue-timepicker v-model="form.endTime" placeholder="结束时间" format="HH:mm:ss" hour-label="时" minute-label="分" second-label="秒" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">
        下 载
      </el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getDeviceRecord } from '@/api/device'
import VueTimepicker from 'vue2-timepicker'

@Component({
  name: 'SliceDownload',
  components: {
    VueTimepicker
  }
})
export default class extends Vue {
  @Prop()
  private deviceId!: number | string
  private dialogVisible = true
  private submitting = false
  private today = new Date()
  private form: any = {
    date: this.today,
    startTime: { HH: '00', mm: '00', ss: '00' },
    endTime: { HH: '00', mm: '00', ss: '00' }
  }
  private rules = {
    date: [
      { required: true, message: '请选择日期', trigger: 'submit' }
    ],
    endTime: [
      { required: true, message: '请选择时间区间', trigger: 'submit' },
      { validator: this.validateTime, trigger: 'change' }
    ]
  }

  private validateTime(rule: any, value: string, callback: Function) {
    const { startTime, endTime } = this.getRangeTime()
    if (endTime - startTime > 2 * 3600 * 1000) {
      callback(new Error('录像切片间隔不能超过2小时'))
    } else {
      callback()
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const { startTime, endTime } = this.getRangeTime()
          const res = await getDeviceRecord({
            deviceId: this.deviceId,
            startTime: startTime / 1000,
            endTime: endTime / 1000,
            fileFormat: 'mp4'
          })
          if (res.downloadUrl) {
            const link: HTMLAnchorElement = document.createElement('a')
            link.setAttribute('href', res.downloadUrl)
            link.click()
            link.remove()
          }
        } catch (e) {
          this.$message.error(e.message)
        } finally {
          this.submitting = false
        }
      }
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private getRangeTime() {
    const year = this.form.date.getFullYear()
    const month = this.form.date.getMonth()
    const date = this.form.date.getDate()
    const startTime = new Date(year, month, date, this.form.startTime.HH, this.form.startTime.mm, this.form.startTime.ss).getTime()
    const endTime = new Date(year, month, date, this.form.endTime.HH, this.form.endTime.mm, this.form.endTime.ss).getTime()
    return {
      startTime,
      endTime
    }
  }
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
    ::v-deep .vue__time-picker, ::v-deep .vue__time-picker input.display-time {
      width: 132px;
    }
    .time-range-gap {
      margin: 0 10px;
    }
  }
  .form-date {
    width: 100%;
  }
</style>
