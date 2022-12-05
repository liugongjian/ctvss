<template>
  <el-dialog
    title="录像锁定"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    :append-to-body="true"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      class="form"
      :inline="true"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="设备名:" class="device">
        {{ deviceName }}
      </el-form-item>
      <el-form-item label="录像时段:" class="date-picker">
        <el-date-picker
          v-model="form.duration"
          type="datetimerange"
          value-format="timestamp"
          :picker-options="pickerOptions"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">
        确 定
      </el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { setLock } from '@/api/device'
import { prefixZero } from '@/utils/number'
import { GroupModule } from '@/store/modules/group'
import { getDevice } from '@/api/device'

@Component({
  name: 'LockDialog'
})
export default class extends Vue {
  @Prop()
  private screen

  private dialogVisible = true
  private submitting = false

  private deviceName: string = null // 设备名
  private today = new Date()
  private form: any = {
    date: this.today,
    duration: []
  }
  private deviceInfo = null

  private rules = {
    duration: [
      { required: true, message: '请选择录像时间段', trigger: 'submit' }
    ]
  }

  private get currentGroupId() {
    return GroupModule.group?.groupId
  }

  // 获取设备信息
  private async getDeviceInfo() {
    this.deviceInfo = await getDevice({
      deviceId: this.screen.deviceId,
      inProtocol: this.screen.inProtocol
    })
  }

  private pickerOptions = {
    disabledDate: (time: any) => {
      // 约束录像起始时间和结束时间范围
      return time.getTime() > Date.now()
    },
    cellClassName: (date: any) => {
      if (!this.recordStatistic) return
      const dateStr = `${date.getFullYear()}-${prefixZero(date.getMonth() + 1, 2)}-${prefixZero(date.getDate(), 2)}`
      return this.recordStatistic.has(dateStr) ? 'has-records' : ''
    },
    changeCalendar: (date: any) => {
      if (!this.recordManager) return
      const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 2).getTime() / 1000)
      const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 2).getTime() / 1000)
      this.recordManager.getRecordStatistic(startTime, endTime)
    }
  }

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private async created() {
    try {
      await this.getDeviceInfo()
      this.deviceName = this.screen.deviceName
    } catch (e) {
      this.$message.error(e)
    }

  }

  // 提交锁定
  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const res = await setLock({
            startTime: this.form.duration[0] / 1000,
            endTime: this.form.duration[1] / 1000,
            deviceId: this.screen.deviceId,
            inProtocol: this.screen.inProtocol,
            groupId: this.currentGroupId,
            parentDeviceId: this.deviceInfo.parentDeviceId
          })
          console.log('锁完了   res: ', res)
          if (res.locks.length > 0) {
            console.log('摩西摩西   ', this.screen)
            await this.screen.recordManager.getRecordListByDate(this.screen.recordManager.currentDate)
            // this.screen.recordManager.getRecordListByDate
          }
        } catch (e) {
          this.$message.error(e.message)
        } finally {
          this.submitting = false
          this.closeDialog()
        }
      }
    })
  }

  // 关闭 dialog
  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
.form {
  & .device {
    display: block;
    margin-left: 16%;
  }

  & .date-picker {
    display: block;
    margin-left: 16%;
  }
}
</style>
