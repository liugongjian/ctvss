<template>
  <el-drawer
    title="我是标题"
    :visible="true"
    :before-close="handleClose"
    size="55%"
  >
    <!-- <el-radio-group v-model="radio" size="small" @input="radioChange">
      <el-radio-button label="近一小时" />
      <el-radio-button label="近1天" />
      <el-radio-button label="近7天" />
      <el-radio-button label="自定义时间" />
    </el-radio-group>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%;"
    >
      <el-table-column
        prop="lastTime"
        label="操作时间"
        width="180"
      />
      <el-table-column
        prop="action"
        label="操作名称"
      />
      <el-table-column
        prop="resourcName"
        label="资源名称"
      />
      <el-table-column
        prop="IP"
        label="操作IP"
      />
    </el-table> -->
    <div class="drawer-box">
      <opt-log :operator-id="1" />
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
// import { getOptLog } from '@/api/operationLog'
import OptLog from '@/views/OperationLog/OptLog.vue'
@Component({
  name: 'ListDrawer',
  components: {
    OptLog
  }
})
export default class extends Vue {
  @Prop() private operatorId?: string

  private tableData = []
  private radio = '近一小时'
  private loading = false
  // 一小时 时间戳
  private oneHourTimestamp = 60 * 60 * 1000

  async mounted() {
    await this.getLogs()
  }

  private radioChange(val: string) {
    if (val !== '自定义时间') {
      this.getLogs()
    }
  }

  private async getLogs() {
    this.loading = true
    let param: any = {}
    const nowDate = Date.now()
    param.endTime = Math.floor(nowDate / 1000)
    switch (this.radio) {
      case '近一小时':
        param.startTime = Math.floor((nowDate - this.oneHourTimestamp) / 1000)
        break
      case '近1天':
        param.startTime = Math.floor((nowDate - this.oneHourTimestamp * 24) / 1000)
        break
      case '近7天':
        param.startTime = Math.floor((nowDate - this.oneHourTimestamp * 24 * 7) / 1000)
        break
      case '自定义时间':
        break
      default:
        param = {}
    }
    try {
      console.log('param----->', param)
      // this.tableData = await getOptLog(param)
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.loading = false
    }
  }

  private handleClose() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
.drawer-box {
  padding: 10px;

  ::v-deep .el-pagination {
    position: fixed;
    bottom: 26px;
    right: 26px;
  }
}
</style>
