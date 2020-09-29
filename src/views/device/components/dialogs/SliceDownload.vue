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
      <el-form-item label="时间区间:" prop="time">
        <el-time-picker
          v-model="form.time"
          is-range
          class="form-date"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          placeholder="选择时间范围"
        />
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

@Component({
  name: 'SliceDownload'
})
export default class extends Vue {
  @Prop()
  private deviceId!: number | string
  private dialogVisible = true
  private submitting = false
  private today = new Date()
  private form: any = {
    date: this.today,
    time: [new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0), new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 2, 0)]
  }
  private rules = {
    date: [
      { required: true, message: '请选择日期', trigger: 'submit' }
    ],
    time: [
      { required: true, message: '请选择时间区间', trigger: 'submit' },
      { validator: this.validateTime, trigger: 'change' }
    ]
  }

  private validateTime(rule: any, value: string, callback: Function) {
    if (this.form.time[1].getTime() - this.form.time[0].getTime() > 2 * 3600 * 1000) {
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
          const year = this.form.date.getFullYear()
          const month = this.form.date.getMonth()
          const date = this.form.date.getDate()
          const startTime = new Date(year, month, date, this.form.time[0].getHours(), this.form.time[0].getMinutes(), this.form.time[0].getSeconds()).getTime()
          const endTime = new Date(year, month, date, this.form.time[1].getHours(), this.form.time[1].getMinutes(), this.form.time[1].getSeconds()).getTime()
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
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
  }
  .form-date {
    width: 100%;
  }
</style>
