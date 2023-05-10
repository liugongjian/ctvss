<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <span class="filter-container__search-time">任务开始时间</span>
          <el-radio-group v-model="period" class="filter-container__search-time">
            <el-radio v-for="(value, key) in periods" :key="key" :label="key">{{ value }}</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="showRange"
            v-model="periodRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-container__search-time"
            value-format="timestamp"
            @change="changePicker"
          >
          </el-date-picker>
          <el-input v-model="factory" class="filter-container__search-group" placeholder="请输入工厂名" @keyup.enter.native="handleFilter" />
          <el-input v-model="plateNumber" class="filter-container__search-group" placeholder="请输入车牌号" @keyup.enter.native="handleFilter" />
          <el-button class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table" @row-click="rowClick">
        <el-table-column prop="plateNumber" label="车牌号" width="120">
          <template slot-scope="{ row }">
            <span>{{ row.plateNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="factory" label="工厂" />
        <el-table-column prop="transCompany" label="原粮出库点" min-width="120" />
        <el-table-column prop="manageFactory" label="管理工厂" />
        <el-table-column
          label="任务状态"
        >
          <template slot-scope="{ row }">
            <status-badge :status="transformStatus(row.status).status" />
            {{ `${transformStatus(row.status).cname}` }}
          </template>
        </el-table-column>
        <el-table-column
          label="开始/结束"
          min-width="170"
        >
          <template slot-scope="{ row }">
            <div class="start-time">{{ row.startTime }}</div>
            <div class="end-time">{{ row.endTime.length > 0 ? row.endTime : '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="最近操作"
          min-width="210"
        >
          <template slot-scope="{ row }">
            <span>{{ row.latestOperation.operate | translateOperate }}</span>
            <span>{{ '  ' + row.latestOperation.operateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备名" min-width="180">
          <template slot-scope="{ row }">
            <div class="device-list__device-name">
              <!-- <div class="device-list__device-id">{{ row.deviceId }}</div> -->
              <div>{{ row.deviceName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="设备状态"
        >
          <template slot-scope="{ row }">
            <div v-if="row.status !== 2">
              <status-badge :status="row.deviceStatus === 'on' ? 'on' : 'error'" />
              {{ row.deviceStatus === 'on' ? '在线' : '离线' }}
            </div>
            <div v-else>
              {{ '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="流状态"
        >
          <template slot-scope="{ row }">
            <div v-if="row.status !== 2">
              <status-badge :status="row.streamStatus === 'on' ? 'on' : 'error'" />
              {{ row.streamStatus === 'on' ? '在线' : '离线' }}
            </div>
            <div v-else>
              {{ '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="driver" label="司机" />

        <el-table-column prop="action" class-name="col-action" label="视频查看" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.status !== 0" @click.stop.native="preview(scope.row)">实时预览</el-button>
            <el-button type="text" @click.stop.native="record(scope.row)">录像回放</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="action" class-name="col-action" label="任务操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 0" type="text" @click.stop.native="operate(scope.row)">暂停</el-button>
            <el-button v-if="scope.row.status === 1" type="text" @click.stop.native="operate(scope.row)">继续</el-button>
            <el-button v-if="scope.row.status === 0 || scope.row.status === 1" type="text" @click.stop.native="stop(scope.row)">结束</el-button>
            <el-button type="text" @click="detail(scope.row)">查看详情</el-button>
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
    <detail-dialog v-if="showDetailDialog" :record="currentRecord" @on-close="closeDetail" />
    <video-dialog v-if="showVideoDialog" :record="currentRecord" :type="videoType" @on-close="closeVideo" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { RecordTemplate } from '@/type/Template'
import { dateFormatInTable } from '@/utils/date'
import { getCarTasks, operateCarTask } from '@/api/car'
import StatusBadge from '@/components/StatusBadge/index.vue'
import DetailDialog from './component/DetailDialog.vue'
import VideoDialog from './component/VideoDialog.vue'
import { subMonths, subDays, subHours } from 'date-fns'



@Component({
  name: 'Car',
  components: {
    StatusBadge,
    DetailDialog,
    VideoDialog
  },
  filters: {
    translateOperate: (val: any) => {
      switch (val) {
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
  }
})
export default class extends Vue {
  private loading = false
  private plateNumber = ''
  private factory = ''
  private dataList: Array<RecordTemplate> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable
  private showDetailDialog = false
  private showVideoDialog = false
  private currentRecord: any = {}
  private videoType = ''

  private periods = {
    'notLimit': '不限',
    'day': '近一天',
    'week': '近一周',
    'month': '近一月',
    'selfDefine': '自定义',
  }

  private period = 'notLimit'

  private periodRange = [subDays(new Date(), 7), new Date()]

  private get showRange(){
    return this.period === 'selfDefine'
  }

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }
  private detail(row: any) {
    this.currentRecord = row
    this.showDetailDialog = true
  }
  private preview(row: any) {
    this.currentRecord = row
    this.showVideoDialog = true
    this.videoType = 'preview'
  }

  private record(row: any) {
    this.currentRecord = row
    this.showVideoDialog = true
    this.videoType = 'record'
  }

  private closeDetail() {
    this.currentRecord = {}
    this.showDetailDialog = false
  }
  private closeVideo() {
    this.currentRecord = {}
    this.showVideoDialog = false
  }
  private setHeaderClass() {
    return 'background: white'
  }

  private resolvePeriod(){
    const now = new Date()
    const now_stamp = now.getTime()
    switch (this.period){
      case 'notLimit':
        return { startTime: undefined, endTime: now_stamp }
      case 'day':
        return { startTime: subHours(now, 24).getTime(), endTime: now_stamp }
      case 'week':
        return { startTime: subDays(now, 7).getTime(), endTime: now_stamp }
      case 'month':
        return { startTime: subMonths(now, 1).getTime(), endTime: now_stamp }
      case 'selfDefine':
        return { startTime: this.periodRange[0], endTime: this.periodRange[1] }
    }
  }

  private async getList() {
    try {
      this.loading = true
      const range = this.resolvePeriod()
      const params = {
        plateNumber: this.plateNumber || undefined,
        factory: this.factory || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        sortBy: 'updateTime',
        sortDirection: 'desc',
        status: -1,
        ...range
      }
      const res = await getCarTasks(params)
      this.loading = false
      this.dataList = res?.vehicleTasks
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取车辆任务列表失败，原因：${e && e.message}`)
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

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async stop(row: any) {
    this.$alertHandle({
      titleConfirmHide: true,
      handleName: '结束',
      type: '车辆录像',
      msg: `当前任务正在${row.status === 0 ? '运输中' : '暂停中'}，确定结束录制任务吗？`,
      method: operateCarTask,
      payload: { ...row, operate: 2, taskId: row.id },
      onSuccess: this.getList
    })
  }
  private async operate(row: any) {
    this.$alertHandle({
      titleConfirmHide: true,
      handleName: `${row.status === 0 ? '暂停' : '继续'}`,
      type: '车辆录像',
      msg: `当前任务正在${row.status === 0 ? '运输中' : '暂停中'}，确定${row.status === 0 ? '暂停' : '继续'}录制任务吗？`,
      method: operateCarTask,
      payload: { ...row, operate: row.status === 0 ? 1 : 3, taskId: row.id },
      onSuccess: this.getList
    })
  }

  /**
   * 单击行
   */
  private rowClick(row: any) {
    this.detail(row)
  }

  private transformStatus(status) {
    switch (status) {
      case 0 :
        return { status: 'on', cname: '运输中' }
      case 1 :
        return { status: 'warning', cname: '暂停中' }
      case 2 :
        return { status: 'error', cname: '已结束' }
    }
  }

  private changePicker(){
    console.log('this.periodRange:', this.periodRange)
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  width:150px;
  margin-right: 10px;
}
.filter-container{
  &__search-group{
    width:150px;
    margin-right: 10px;
  }
  &__search-time{
    margin-right: 10px;
  }
}


.template__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }

  .start-time,
  .end-time {
    width: 138px;
    text-align: center;
  }
}
</style>
