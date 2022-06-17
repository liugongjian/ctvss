<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加平台</el-button>
        <div class="filter-container__right">
          <el-button class="el-button-rect" @click="refresh">
            <svg-icon name="refresh" />
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column label="设备ID/名称" min-width="200">
          <template slot-scope="{row}">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.platformId }}</div>
              <div>{{ row.platformName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="视频编码" min-width="250" />
        <el-table-column prop="createdTime" label="级联状态" min-width="160" />
        <el-table-column prop="createdTime" label="IP" min-width="160" />
        <el-table-column prop="createdTime" label="端口" min-width="160" />
        <el-table-column prop="action" label="操作" width="150" fixed="right">
          <template slot-scope="{row}">
            <!-- <el-button type="text" @click="1">启用</el-button>
            <el-button type="text" @click="1">停用</el-button> -->
            <el-button type="text" @click="dialog.viewDetails = true">查看</el-button>
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="deleteCertificate(row)">删除</el-button>
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
      @on-close="closeDialog('viewDetails')"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormatInTable } from '@/utils/date'
import { getList, deleteCertificate } from '@/api/certificate/gb28181'
import { GB28181 } from '@/type/certificate'
import ViewDetails from './components/ViewDetails.vue'

@Component({
  name: 'CertificateGb28181List',
  components: {
    ViewDetails
  }
})
export default class extends Vue {
  private userType = ''
  private userName = ''
  private loading = false
  private dataList: Array<GB28181> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dialog = {
    viewDetails: false
  }
  private dateFormatInTable = dateFormatInTable

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 &&
      this.pager.pageNum > 1 &&
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
    let params = {
      userName: this.userName,
      userType: this.userType,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await getList(params)
      this.dataList = res.gbCerts
      this.pager.total = res.totalNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
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

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private edit(row: GB28181) {
    this.$router.push({
      name: 'view-up-platform-update',
      params: {
        userName: row.userName
      }
    })
  }

  private async deleteCertificate(row: GB28181) {
    this.$alertDelete({
      type: '视图库',
      msg: `是否确认删除视图库"${row.userName}"`,
      method: deleteCertificate,
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
