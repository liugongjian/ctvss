<template>
  <el-dialog
    :visible="true"
    :width="'550px'"
    center
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-form ref="dialogForm" :model="form" :rules="rules" label-position="right" label-width="165px">
      <el-form-item label="开始日期" prop="startTime">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期时间"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endTime">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期时间"
        />
      </el-form-item>
      <el-form-item label="导出内容" class="second">
        <el-radio-group v-model="form.partFlag">
          <el-radio label="all">
            全部记录
          </el-radio>
          <el-radio label="part">
            仅导出补录失败记录
          </el-radio>
        </el-radio-group>
        <!-- <el-input v-model.number="form.ignore" />
        <span class="second_title">秒</span> -->
      </el-form-item>
      <el-alert
        title="请选择录像断点记录的起止区间，选定日期区内的补录记录将被导出，最大支持7天的导出区间。"
        type="warning"
        show-icon
      >
      </el-alert>
    </el-form>

    <div slot="title" class="dialog-title">
      <span>补录记录导出</span>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="closeDialog">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getUnixTime, sub, format } from 'date-fns'
import { exportRecovery } from '@/api/statistic'



const validateIn30Days = (rule, value, callback) => {
  const date30 = (getUnixTime(new Date()) - 30 * 24 * 60 * 60) * 1000
  const date = new Date(value).getTime()
  if (date < date30){
    callback(new Error('请选择30日内的开始时间'))
  } else {
    callback()
  }
}

const validateIn7Days = (rule, value, callback, startTime) => {
  const stamp_startTime = new Date(startTime).getTime()
  const stamp_endTime = new Date(value).getTime()
  const comp = stamp_endTime - stamp_startTime > 7 * 24 * 60 * 60 * 1000
  const comp2 = stamp_endTime <= stamp_startTime

  if (comp){
    callback(new Error('结束时间必须小于开始时间的7天以内'))
  } else {
    if (startTime.length === 0){
      callback(new Error('请先选择开始时间'))
    }
    if (comp2){
      callback(new Error('结束时间不能早于结束时间'))
    }
    callback()
  }
}


@Component({
  name: 'ExportDialog'
})
export default class extends Vue {

  private form = {
    startTime: '',
    endTime: '',
    partFlag: 'part'
  }

  private rules = {
    startTime: [{ required: true, message: '请输入开始时间', trigger: 'blur' }, { validator: validateIn30Days, trigger: 'blur' }],
    endTime: [{ required: true, message: '请输入结束时间', trigger: 'blur' }, { validator: (rule, value, callback) => validateIn7Days(rule, value, callback, this.form.startTime), trigger: 'blur' }],
  }


  private mounted(){
    this.fillDefaultTimeRange()
  }

  private fillDefaultTimeRange(){
    const sevenDaysBefore = sub(new Date(), { days: 7 })
    this.form.endTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss' )
    this.form.startTime = format(sevenDaysBefore, 'yyyy-MM-dd HH:mm:ss' )
  }

  private async submit(){
    const form: any = this.$refs.dialogForm
    form.validate(async (valid: any) => {
      if (valid) {
        this.downLoadExcel()
      }
    })
  }

  private closeDialog() {
    this.$emit('on-close')
  }

  private async downLoadExcel(){
    try {
      const param = {
        beginTime: this.form.startTime,
        endTime: this.form.endTime,
        fail: this.form.partFlag === 'part'
      }
      const res = await exportRecovery(param)
      const blob = new Blob([res])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = '车辆补录.xlsx'
      link.click()
      link.remove()
      this.$message.success('导出成功')
      this.closeDialog()
    } catch (e) {
      this.$message.error(e)
    }

  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 620px;
  display: flex;
  justify-content: space-evenly;

  .history {
    overflow-y: auto;
    overflow-x: hidden;
    width: 240px;
    height: 500px;

    & > div {
      margin-bottom: 8px;
      margin-left: 8px;
    }
  }
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}

.el-descriptions {
  padding-left: 15%;
}

.dialog-player-wrapper {
  height: 583px;
  width: 800px;
}

.dialog-title {
  .plate {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }

  .time {
    color: #9e9e9e;
  }
}
::v-deep .el-form-item__content{
  display: flex;
  .second_title{
    margin-left: 10px;
  }
}
.second{
  ::v-deep .el-form-item__content{
    margin-top: 10px;
  }
}
</style>
