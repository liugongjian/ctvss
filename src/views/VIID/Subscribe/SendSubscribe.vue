<template>
  <div class="subscribe-view-body">
    <div class="subscribe-view-left">
      <div :class="{ active: !curPlatformId }" class="up-platform-item" @click="choosePlatform('')">
        <span class="text">全部下级平台</span>
      </div>
      <div v-for="platform in platformList" :key="platform.apeId" :class="{ active: curPlatformId === platform.apeId }" class="up-platform-item" @click="choosePlatform(platform.apeId)">
        <span class="text">{{ platform.name }}</span>
      </div>
    </div>
    <div class="subscribe-view-right">
      <div class="wrap">
        <div class="filter-container">
          <el-button type="primary" @click="handleCreate">添加订阅</el-button>
          <div class="filter-container__right">
            <el-input v-model="keywords" class="filter-container__search-group input-with-select" clearable @keyup.enter.native="handleFilter" @clear="handleFilter">
              <el-select slot="prepend" v-model="searchKey">
                <el-option label="订阅标题" value="title" />
                <el-option label="申请人" value="applicantName" />
                <el-option label="申请单位" value="applicantOrg" />
              </el-select>
              <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
            </el-input>
            <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
          </div>
        </div>
        <el-table v-loading="loading" :data="dataList" fit :height="100" @row-click="viewDetails">
          <el-table-column label="订阅ID/订阅标题" min-width="180">
            <template slot-scope="{ row }">
              <div class="device-list__device-name">
                <div class="device-list__device-id">{{ row.subscribeID }}</div>
                <div>{{ row.title }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicantName" label="申请人" min-width="180" />
          <el-table-column prop="applicantOrg" label="申请单位" min-width="180" />
          <el-table-column prop="subscribeDetail" label="订阅类别">
            <template slot-scope="{ row }">
              {{ handleSubscribeDetail(row.subscribeDetail) }}
            </template>
          </el-table-column>
          <el-table-column prop="subscribeStatus" label="执行状态">
            <template slot-scope="{ row }">
              {{ SubscribeStatus[row.subscribeStatus] }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="action" label="操作" width="150px" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" @click.stop="viewDetails(row)">查看详情</el-button>
              <el-button type="text" @click.stop="toStatistics(row)">通知统计</el-button>
              <el-button type="text" style="margin-left: 0;" @click.stop="cancelStatistics(row)">取消订阅</el-button>
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
      </div>
    </div>
    <subscribe-details
      v-if="showDetail"
      :detail="detail"
      @on-close="closeDetailDialog()"
    />
    <statistics-dialog
      v-if="showStatistics"
      :subscribe-id="subscribeId"
      @on-close="closeStatisticsDialog()"
    />
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { subscribeDetailList, subscribeStatus } from '@/dics/viid'
import { getAllSendSubscribesList, getOneSendSubscribesList, getLowerPlatformList } from '@/api/viid'
import SubscribeDetails from './components/SubscribeDetails.vue'
import StatisticsDialog from './components/StatisticsDialog.vue'

@Component({
  name: 'send-subscribe',
  components: {
    SubscribeDetails,
    StatisticsDialog
  }
})
export default class extends Vue {
  private loading = false
  private dataList = []
  private platformList = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private curPlatformId = ''

  private searchKey = 'title'
  private keywords = ''
  private showDetail = false
  private detail = null

  private showStatistics = false
  private subscribeId = ''

  private SubscribeStatus = subscribeStatus

  private async getPlatformList() {
    const params = {
      pageNum: 0,
      pageSize: 2000
    }
    try {
      const res: any = await getLowerPlatformList(params)
      this.platformList = res.data
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private resetPage() {
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  }

  private async choosePlatform(id) {
    if (this.curPlatformId !== id) {
      this.resetPage()
      this.curPlatformId = id || ''
      await this.getList()
    }
  }

  private async getList() {
    const params = {
      pageNum: this.pager.pageNum - 1,
      pageSize: this.pager.pageSize
    }
    params[this.searchKey] = this.keywords
    try {
      this.loading = true
      let res
      if (this.curPlatformId) {
        res = await getOneSendSubscribesList({ ...params, cascadeViidId: this.curPlatformId })
      } else {
        res = await getAllSendSubscribesList(params)
      }
      this.dataList = res.data
      this.pager.total = res.totalNum
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private handleSubscribeDetail(detail) {
    const res = []
    const details = detail.split(',')
    details.forEach(item => {
      res.push(subscribeDetailList.find(d => d.value === item).label)
    })
    return res.join('，')
  }

  private handleFilter() {
    this.getList()
  }

  private handleCreate() {
    console.log('create')
    this.$router.push({
      name: 'viid-subscribe-create'
    })
  }

  private viewDetails(row) {
    this.showDetail = true
    this.detail = row
  }
  private toStatistics(row) {
    console.log('通知统计')
    this.subscribeId = row.subscribeId
    this.showStatistics = true
  }

  private cancelStatistics(row) {
    console.log('取消订阅')
    this.$router.push({
      name: 'viid-subscribe-cancel',
      params: { detail: row }
    })
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private closeDetailDialog() {
    this.showDetail = false
  }

  private closeStatisticsDialog() {
    this.showStatistics = false
  }

  private refresh() {
    this.getList()
  }

  private mounted() {
    this.getPlatformList()
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
.subscribe-view-body {
  position: relative;
  background: #fff;
  height: 100%;
}

.subscribe-view-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 180px;
  padding: 15px 12px;
  border-right: 1px solid #eee;
  overflow: auto;

  .up-platform-item {
    width: 100%;
    height: 33px;
    line-height: 33px;
    margin: 0 auto;
    padding: 0 10px;
    border-radius: 5px;
    cursor: pointer;

    .text {
      text-align: left;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &.active {
      background: $primary;
      color: #fff;
    }
  }
}

.subscribe-view-right {
  position: relative;
  height: 100%;
  margin-left: 180px;
  padding: 15px;
  overflow: auto;

  .wrap {
    width: 100%;
    height: 100%;
    min-width: 800px;
    display: flex;
    flex-direction: column;
  }
}

.input-with-select {
  margin-right: 10px;

  ::v-deep .el-input-group__prepend {
    background: #fff;
  }

  ::v-deep .el-select .el-input {
    width: 120px;
  }
}
</style>
