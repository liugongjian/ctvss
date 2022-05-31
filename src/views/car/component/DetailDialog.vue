<template>
  <el-dialog
    :visible="true"
    title="任务详情"
    width="500px"
    center
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <el-form label-width="100px" size="small">
      <el-form-item label="设备名：">
        <span>{{ VehicleTask.deviceName }}</span>
      </el-form-item>
      <el-form-item label="设备ID：">
        <span>{{ VehicleTask.deviceId }}</span>
      </el-form-item>
      <el-form-item label="任务状态：">
        <span>{{ VehicleTask.plateNumber }}</span>
      </el-form-item>
      <el-form-item label="车牌号：">
        <span>{{ VehicleTask.plateNumber }}</span>
      </el-form-item>
      <el-form-item label="司机：">
        <span>{{ VehicleTask.driver }}</span>
      </el-form-item>
      <el-form-item label="工厂：">
        <span>{{ VehicleTask.factory }}</span>
      </el-form-item>
      <el-form-item label="运输公司：">
        <span>{{ VehicleTask.transCompany }}</span>
      </el-form-item>
      <el-form-item label="运输任务：">
        <span>{{ VehicleTask.transDetail }}</span>
      </el-form-item>
      <el-form-item label="任务历史：">
        <div v-for="op in Operations" :key="op.Id">{{ `${getOpType(op.operate)} ` }}<span style="color: #9e9e9e;">{{ `${op.operateTime}` }}</span></div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getCarTask } from '@/api/car'

@Component({
  name: 'DetailDialog'
})
export default class extends Vue {
  @Prop({ default: () => {} })
  private record!: any
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private VehicleTask = {}
  private Operations = []

  private async mounted() {
    this.getRecord()
  }
  private async getRecord() {
    try {
      let params = {
        taskId: this.record?.id,
        deviceId: this.record?.deviceId
      }
      const res = await getCarTask(params)
      this.VehicleTask = res?.vehicleTask
      this.Operations = res?.operations
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取车辆任务信息失败，原因：${e && e.message}`)
    }
  }
  private getOpType(type) {
    switch (type) {
      case 0:
        return '开始'
      case 1:
        return '暂停'
      case 2:
        return '结束'
      case 3:
        return '继续'
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 540px;
  overflow: auto;

  .el-form {
    padding-left: 15%;
  }
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}

.el-descriptions {
  padding-left: 15%;
}
</style>
