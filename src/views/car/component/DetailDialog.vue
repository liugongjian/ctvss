<template>
  <el-dialog
    :visible="true"
    title="任务详情"
    width="500px"
    center
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <el-descriptions :column="1">
      <el-descriptions-item label="设备名">{{ VehicleTask.DeviceName }}</el-descriptions-item>
      <el-descriptions-item label="设备ID">{{ VehicleTask.DeviceId }}</el-descriptions-item>
      <el-descriptions-item label="任务状态">{{ VehicleTask.Status }}</el-descriptions-item>
      <el-descriptions-item label="车牌号">{{ VehicleTask.PlateNumber }}</el-descriptions-item>
      <el-descriptions-item label="司机">{{ VehicleTask.Driver }}</el-descriptions-item>
      <el-descriptions-item label="工厂">{{ VehicleTask.Factory }}</el-descriptions-item>
      <el-descriptions-item label="运输公司">{{ VehicleTask.TransCompany }}</el-descriptions-item>
      <el-descriptions-item label="运输任务">{{ VehicleTask.TransDetail }}</el-descriptions-item>
      <el-descriptions-item label="任务历史"><div v-for="op in Operations" :key="op.Id">{{ `${getOpType(op.Operate)} ${op.OperateTime}` }}</div></el-descriptions-item>
    </el-descriptions>
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
  private loading = false
  private bindData = []
  private filtersArray = [{ text: '组', value: 'group' }, { text: '设备', value: 'device' }]

  private async mounted() {
    this.getRecord()
  }
  private async getRecord() {
    try {
      this.loading = true
      let params = {
        taskId: this.record?.Id,
        deviceId: this.record?.DeviceId
      }
      const res = await getCarTask(params)
      this.loading = false
      this.VehicleTask = res?.VehicleTask
      this.Operations = res?.Operations
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取车辆任务列表失败，原因：${e && e.message}`)
      this.loading = false
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
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}

.el-descriptions {
  padding-left: 15%;
}
</style>
