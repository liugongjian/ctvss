<template>
  <el-dialog
    title="录像文件下载"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="380px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="开始时间:" prop="startTime">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          value-format="timestamp"
          placeholder="选择开始时间"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item label="结束时间:" prop="endTime" class="form-with-tip">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          value-format="timestamp"
          placeholder="选择结束时间"
          :picker-options="pickerOptions"
        />
        <div class="form-tip">时间间隔不超过2小时</div>
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
  private form: any = {
    startTime: null,
    endTime: null
  }
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    }
  }
  private rules = {
    startTime: [
      { required: true, message: '请选择开始时间', trigger: 'submit' }
    ],
    endTime: [
      { required: true, message: '请选择结束时间', trigger: 'submit' },
      { validator: this.validateTime, trigger: 'change' }
    ]
  }

  private validateTime(rule: any, value: string, callback: Function) {
    if (this.form.endTime < this.form.startTime) {
      callback(new Error('结束时间必须大于开始时间'))
    } else if (this.form.endTime - this.form.startTime > 2 * 3600 * 1000) {
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
          const res = await getDeviceRecord({
            deviceId: this.deviceId,
            startTime: this.form.startTime / 1000,
            endTime: this.form.endTime / 1000,
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
