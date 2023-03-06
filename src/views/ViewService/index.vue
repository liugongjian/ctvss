<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button v-if="checkPermission(['ivs:AdminViid'])" type="primary" @click="handleCreate">添加平台</el-button>
        <div class="filter-container__right">
          <el-button class="el-button-rect" @click="refresh">
            <svg-icon name="refresh" />
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit @row-click="viewDetails">
        <el-table-column label="平台ID/名称" min-width="200">
          <template slot-scope="{row}">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.cascadeViidId }}</div>
              <div>{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apsId" label="视图编码" min-width="250" />
        <el-table-column prop="isOnline" label="级联状态" min-width="160">
          <template slot-scope="{row}">
            <status-badge :status="row.isOnline ? 'on' : 'off'" />
            {{ row.isOnline ? '在线' : '离线' }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddr" label="IP" min-width="160" />
        <el-table-column prop="port" label="端口" min-width="160" />
        <el-table-column prop="action" label="操作" width="200" fixed="right">
          <template slot-scope="{row}">
            <el-button v-if="row.isActive && checkPermission(['ivs:AdminViid'])" type="text" @click.stop="stopViewLibUpPlatform(row.cascadeViidId)">停用</el-button>
            <el-button v-else-if="checkPermission(['ivs:AdminViid'])" type="text" @click.stop="enableViewLibUpPlatform(row.cascadeViidId)">启用</el-button>
            <el-button type="text" @click.stop="viewDetails(row)">查看</el-button>
            <el-button v-if="checkPermission(['ivs:AdminViid'])" type="text" @click.stop="edit(row)">编辑</el-button>
            <!-- <el-button type="text" @click="deleteCertificate(row)">删除</el-button> -->
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
    <view-details
      v-if="dialog.viewDetails"
      :platform-details="platformDetails"
      @on-close="closeDialog('viewDetails')"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormatInTable } from '@/utils/date'
import { GB28181 } from '@/type/Certificate'
import ViewDetails from './components/ViewDetails.vue'
import { enableViewLibUpPlatform, stopViewLibUpPlatform, getViewLibPlatformList } from '@/api/viewLib'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { checkPermission } from '@/utils/permission'

@Component({
  name: 'CertificateGb28181List',
  components: {
    ViewDetails,
    StatusBadge
  }
})
export default class extends Vue {
  private checkPermission = checkPermission
  private loading = false
  private dataList = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private platformDetails = null
  private dialog = {
    viewDetails: false
  }

  private dateFormatInTable = dateFormatInTable

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
  private viewDetails(row, column?: any) {
    if (column && column.property === 'action') return
    this.platformDetails = row
    this.dialog.viewDetails = true
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
    this.$router.push('/view-service/up-platform/create')
  }

  /**
   * 编辑
   */
  private edit(row: any) {
    this.$router.push({
      name: 'viewUpPlatformUpdate',
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

  private async deleteCertificate(row: GB28181) {
    this.$alertDelete({
      type: '视图库',
      msg: `是否确认删除视图库"${row.userName}"`,
      method: () => {},
      payload: { userName: row.userName },
      onSuccess: this.getList
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }

  &__select {
    display: inline;
    margin-right: 10px;
  }
}
</style>
