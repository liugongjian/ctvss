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
      <el-form-item label="忽略中断时长" class="second" prop="ignore">
        <el-input v-model.number="form.ignore" />
        <span class="second_title">秒</span>
      </el-form-item>
    </el-form>
    <div slot="title" class="dialog-title">
      <span>录像断点导出</span>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="closeDialog">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getUnixTime, parse } from 'date-fns'
import { downLoadExcel } from '@/api/car'


const validateNumber = (rule, value, callback) => {
    if (value < 0) {
      callback(new Error('请输入大于等于0的值'))
    } else {
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
    ignore: 0
  }

  private rules = {
    startTime: [{ required: true, message: '请输入开始时间', trigger: 'blur' }],
    endTime: [{ required: true, message: '请输入结束时间', trigger: 'blur' }],
    ignore: [{ required: true, message: '请输入时长', trigger: 'blur' }, { validator: validateNumber, trigger: 'blur' }]
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
        startTime: this.form.startTime,
        endTime: this.form.endTime,
        ignore: this.form.ignore
      }
      const res = await downLoadExcel(param)
      const blob = new Blob([res])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = '车辆.xlsx'
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
</style>
