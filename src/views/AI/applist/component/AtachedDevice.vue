<template>
  <div class="device-wrapper">
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="devices"
      tooltip-effect="dark"
      cell-class-name="tableCell"
      @row-click="rowClick"
    >
      <el-table-column label="名称">
        <template slot-scope="scope">
          <svg-icon :name="scope.row.deviceType" width="20" height="20" :class="scope.row.deviceStatus+'line'" />
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ scope.row.deviceName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="设备ID">
        <template slot-scope="scope">{{ scope.row.deviceId }}</template>
      </el-table-column>
      <el-table-column label="业务组ID/名称">
        <template slot-scope="scope">
          <div>
            <div>{{ scope.row.groupId }}</div>
            <div>
              {{ scope.row.groupName }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="AI启用状态">
        <template slot-scope="scope">
          <status-badge :status="parseInt(scope.row.status) ? 'on' : 'failed'" />
          <span>{{ parseInt(scope.row.status) ? '启用' : '停用' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" class-name="col-action">
        <template slot-scope="scope">
          <el-button type="text" @click="rowClick(scope.row)">
            设备详情
          </el-button>
          <el-button type="text" @click.stop="startOrStop(scope.row)">
            {{ parseInt(scope.row.status) ? '停用' : '启用' }}
          </el-button>
          <el-button type="text" :disabled="scope.row.status === '1' ? true : false" @click.stop="detach(scope.row)">
            解绑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getAttachedDevice } from '@/api/ai-app'
import { startAppResource, stopAppResource, unBindAppResource } from '@/api/device'

@Component({
  name: 'AtachedDevice',
  components: { StatusBadge }
})
export default class extends Vue {
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }
  private loading = false
  private devices: any = []

  private async mounted() {
    this.getAttachedDevice()
  }

  private async getAttachedDevice() {
    const { deviceList, pageNum, pageSize, totalNum } = await getAttachedDevice({
      appId: this.$route.query.appid,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    })
    console.log(deviceList)
    this.devices = deviceList
    this.pager.pageNum = pageNum
    this.pager.pageSize = pageSize
    this.pager.totalNum = totalNum
  }
  /**
   * 启停用应用
   */
  public startOrStop(device) {
    const method = parseInt(device.status) ? '停用' : '启用'
    const m = parseInt(device.status) ? stopAppResource : startAppResource
    const h: Function = this.$createElement
    this.$alertHandle({
      handleName: method,
      type: '应用',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          `确定要${method}选中的设备吗？`
        ),
        h(
          'div',
          { class: 'batch-list' },
          [h('p', undefined, [
            h('span', undefined, device.name)
          ])]
        )
      ]),
      method: m,
      payload: {
        inProtocol: device.inProtocol,
        appIds: [this.$route.query.appid],
        deviceId: device.deviceId
      },
      onSuccess: () => {
        this.$message.success(`已通知${method}AI应用`)
        this.getAttachedDevice()
      }
    })
  }

  /**
   * 解绑应用
   */
  public detach(device) {
    const h: Function = this.$createElement
    this.$alertDelete({
      type: '应用',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          '确定要在该设备上解绑当前AI应用吗？'
        ),
        h(
          'div',
          { class: 'batch-list' },
          [h('p', undefined, [h('span', undefined, device.name)])]
        )
      ]),
      method: unBindAppResource,
      payload: {
        deviceId: device.deviceId,
        appId: [this.$route.query.appid]
      },
      onSuccess: () => {
        this.getAttachedDevice()
      }
    })
  }
  private rowClick(row: any) {
    this.$router.push({
      name: 'device-detail',
      query: {
        inProtocol: row.inProtocol,
        deviceId: row.deviceId
      }
    })
  }

  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getAttachedDevice()
  }

  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAttachedDevice()
  }
}
</script>
<style lang="scss" scoped>
.device-wrapper{
  .device-list__device-name{
    display: inline-block;
  }
  flex:1 1 auto;
  .svg-icon{
    margin: 0 8px;
  }
}
.online{
  color: #65c465;
}
.offline{
  color: #6e7c89;
}
::v-deep .tableCell{
  cursor: pointer;
}
</style>
