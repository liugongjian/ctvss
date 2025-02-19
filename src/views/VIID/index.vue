<template>
  <div class="app-container">
    <el-card class="card-layout">
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加平台</el-button>
        <div class="filter-container__right">
          <el-button class="el-button-rect" @click="refresh">
            <svg-icon name="refresh" />
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit :height="10" @row-click="viewViidDetails">
        <el-table-column label="平台ID/名称" min-width="200">
          <template slot-scope="{ row }">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.cascadeViidId }}</div>
              <div>{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apsId" label="视图编码" min-width="250" />
        <el-table-column prop="isOnline" label="级联状态" min-width="160">
          <template slot-scope="{ row }">
            <status-badge :status="row.isOnline ? 'on' : 'off'" />
            {{ row.isOnline ? '在线' : '离线' }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddr" label="IP" min-width="160" />
        <el-table-column prop="port" label="端口" min-width="160" />
        <el-table-column prop="action" label="操作" width="200" fixed="right">
          <template slot-scope="{ row }">
            <el-button v-if="row.isActive" type="text" @click.stop="stopViewLibUpPlatform(row.cascadeViidId)">停用</el-button>
            <el-button v-else type="text" @click.stop="enableViewLibUpPlatform(row.cascadeViidId)">启用</el-button>
            <el-button type="text" @click.stop="viewViidDetails(row)">查看</el-button>
            <el-button type="text" @click.stop="edit(row)">编辑</el-button>
            <el-button :disabled="row.isActive" type="text" @click="deleteViewLibUpPlatform(row)">删除</el-button>
            <el-button type="text" @click.stop="viewDeviceList(row)">级联设备</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <viid-details-dialog
      v-if="dialog.viidDetails"
      :platform-details="platformDetails"
      @on-close="closeDialog('viidDetails')"
    />
    <device-list-dialog
      v-if="dialog.deviceList"
      :platform-details="platformDetails"
      @on-close="closeDialog('deviceList')"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormatInTable } from '@/utils/date'
import ViidDetailsDialog from './components/ViidDetailsDialog.vue'
import DeviceListDialog from './components/DeviceListDialog.vue'
import { enableViewLibUpPlatform, stopViewLibUpPlatform, deleteViewLibUpPlatform, getViewLibPlatformList, getViewLibPlatformDetail } from '@/api/viid'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'CertificateGb28181List',
  components: {
    ViidDetailsDialog,
    DeviceListDialog,
    StatusBadge
  }
})
export default class extends Vue {
  private loading = false
  private dataList = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private platformDetails = null
  private dialog = {
    viidDetails: false,
    deviceList: false
  }
  private dateFormatInTable = dateFormatInTable
  private currentCascadeViidId = ''

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 &&
      this.pager.pageNum > 0 &&
      this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async refresh() {
    await this.getList()
  }

  private async mounted() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    const params = {
      pageNum: this.pager.pageNum - 1,
      pageSize: this.pager.pageSize
    }
    try {
      const res: any = await getViewLibPlatformList(params)
      this.dataList = res.data
      this.pager.total = res.totalNum
      // this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 查看级联详情
   */
  private async viewViidDetails(row, column?: any) {
    if (column && column.property === 'action') return
    try {
      const res = await getViewLibPlatformDetail({ cascadeViidId: row.cascadeViidId })
      this.platformDetails = res.data
      this.dialog.viidDetails = true
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 查看级联设备列表
   */
  private async viewDeviceList(row) {
    this.platformDetails = row
    this.dialog.deviceList = true
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string) {
    this.dialog[type] = false
  }

  private handleCreate() {
    this.$router.push('/viid/up-platform/create')
  }

  /**
   * 编辑
   */
  private edit(row: any) {
    this.$router.push({
      name: 'ViidUpPlatformUpdate',
      params: {
        platformDetails: row
      }
    })
  }

  /**
   * 启用
   */
  private async enableViewLibUpPlatform(cascadeViidId) {
    await enableViewLibUpPlatform(cascadeViidId)
    this.$message.success('启用成功！')
    this.getList()
  }
  /**
   * 停止
   */
  private async stopViewLibUpPlatform(cascadeViidId) {
    await stopViewLibUpPlatform(cascadeViidId)
    this.$message.success('停用成功！')
    this.getList()
  }

  private async deleteViewLibUpPlatform(row: any) {
    this.$alertDelete({
      type: '视图库',
      msg: `是否确认删除视图库"${row.name}"`,
      method: deleteViewLibUpPlatform,
      payload: row.cascadeViidId,
      onSuccess: this.getList
    })
  }
}
</script>

<style lang="scss" scoped>
.card-layout {
  ::v-deep {
    > .el-card__body {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      height: calc(100vh - $header-height - $padding-medium * 2 - 3px);
    }
  }

  .filter-container {
    &__search-group {
      margin-right: 10px;
    }

    &__select {
      display: inline;
      margin-right: 10px;
    }
  }
}
</style>
