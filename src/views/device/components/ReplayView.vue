<template>
  <div v-loading="loading" class="replay-view">
    <div class="filter-container">
      <el-date-picker
        v-model="currentDate"
        type="date"
        value-format="timestamp"
        placeholder="选择日期"
        size="small"
        :picker-options="pickerOptions"
        @change="changeDate"
      />
      <el-radio-group v-model="viewModel" size="small">
        <el-tooltip content="时间轴视图" placement="top">
          <el-radio-button label="timeline"><svg-icon name="timeline" width="16px" height="16px" /></el-radio-button>
        </el-tooltip>
        <el-tooltip content="列表视图" placement="top">
          <el-radio-button label="list"><svg-icon name="list" width="16px" height="16px" /></el-radio-button>
        </el-tooltip>
      </el-radio-group>
      <el-tooltip content="录像切片下载" placement="top">
        <el-button class="filter-container__slice" size="small" @click="sliceDownload"><svg-icon name="download" width="16px" height="16px" /></el-button>
      </el-tooltip>
    </div>
    <replay-player
      v-if="viewModel === 'timeline'"
      :current-date="currentDate"
      :record-list="recordList"
      :has-playlive="hasPlaylive"
      @onPlaylive="playlive"
    />
    <div v-else class="replay-time-list">
      <el-table :data="recordListSlice" empty-text="所选日期暂无录像">
        <el-table-column label="开始时间" prop="startAt" min-width="180" :formatter="dateFormatInTable" />
        <el-table-column label="时长" prop="duration" :formatter="durationFormatInTable" />
        <el-table-column prop="action" label="操作" width="200" fixed="right">
          <template slot-scope="{row}">
            <el-button v-if="row.loading" type="text" disabled>正在转码...</el-button>
            <el-button v-if="!row.loading" type="text" @click="downloadReplay(row)">下载录像</el-button>
            <el-button type="text" @click="playReplay(row)">播放录像</el-button>
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
      <replay-player-dialog v-if="dialog.play" :video="currentListRecord" @on-close="closeReplayPlayer" />
    </div>
    <slice-download-dialog v-if="dialog.slice" :device-id="deviceId" @on-close="closeSliceDownload" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat, durationFormatInTable } from '@/utils/date'
import Ctplayer from '../models/Ctplayer'
import { getDeviceRecords, getDeviceRecord } from '@/api/device'
import ReplayPlayerDialog from './dialogs/ReplayPlayer.vue'
import SliceDownloadDialog from './dialogs/SliceDownload.vue'
import ReplayPlayer from './ReplayPlayer.vue'

@Component({
  name: 'ReplayView',
  components: {
    ReplayPlayerDialog,
    SliceDownloadDialog,
    ReplayPlayer
  }
})
export default class extends Vue {
  @Prop()
  private deviceId!: number | string
  @Prop({
    default: false
  })
  private hasPlaylive?: boolean
  private player?: Ctplayer
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable
  private dateFormat = dateFormat
  private viewModel = 'timeline'
  private currentRecord: any = null
  private currentListRecord: any = null
  private currentDate = new Date(new Date().toLocaleDateString()).getTime()
  private loading = false
  private recordList: Array<any> = []
  private recordListSlice: Array<any> = []
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    }
  }
  private dialog = {
    play: false,
    slice: false
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private async mounted() {
    await this.init()
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.player && this.player.disposePlayer()
    this.init()
  }

  /**
   * 初始化
   */
  private async init() {
    await this.getRecordList()
  }

  /**
   * 切换日期
   */
  private changeDate() {
    this.init()
  }

  /**
   * 获取回放列表
   */
  private async getRecordList() {
    try {
      this.loading = true
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        startTime: this.currentDate / 1000,
        endTime: this.currentDate / 1000 + 24 * 60 * 60,
        pageSize: 9999
      })
      this.recordList = res.records.map((record: any, index: number) => {
        record.startAt = new Date(record.startTime).getTime()
        record.loading = false
        record.index = index
        return record
      })
      this.pager.total = res.totalNum
      this.getRecordListByPage()
    } catch (e) {
      this.recordList = []
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 下载录像
   */
  private async downloadReplay(record: any) {
    try {
      record.loading = true
      const res = await getDeviceRecord({
        deviceId: this.deviceId,
        startTime: record.startAt / 1000,
        fileFormat: 'mp4'
      })
      if (res.downloadUrl) {
        const link: HTMLAnchorElement = document.createElement('a')
        link.setAttribute('href', res.downloadUrl)
        link.click()
        link.remove()
      }
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      record.loading = false
    }
  }

  /**
   * 播放录像（模态框）
   */
  private playReplay(record: any) {
    this.dialog.play = true
    this.currentListRecord = record
  }

  /**
   * 关闭播放录像弹出框
   */
  private closeReplayPlayer() {
    this.dialog.play = false
    this.currentListRecord = null
  }

  /**
   * 切片下载
   */
  private sliceDownload() {
    this.dialog.slice = true
  }

  /**
   * 关闭切片下载弹出框
   */
  private closeSliceDownload() {
    this.dialog.slice = false
  }

  /**
   * 分页
   */
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getRecordListByPage()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getRecordListByPage()
  }

  private getRecordListByPage() {
    this.recordListSlice = this.recordList.slice((this.pager.pageNum - 1) * this.pager.pageSize, this.pager.pageNum * this.pager.pageSize)
  }

  /**
   * 播放直播
   */
  public playlive() {
    this.$emit('onPlaylive')
  }
}
</script>
<style lang="scss" scoped>
  .filter-container {
    text-align: right;
    .el-date-editor {
      width: 150px;
      margin-right: 10px;
      vertical-align: middle;
      ::v-deep .el-input__inner {
        padding-right: 0;
      }
    }
    ::v-deep .el-radio-button--small .el-radio-button__inner {
      padding: 7px 10px;
    }
    &__slice {
      margin-left: 10px;
      padding: 7px 10px;
      vertical-align: bottom;
    }
  }
  .replay-time-list {
    flex: 2;
    margin-left: 15px;
    overflow: auto;

    .el-range-editor {
      width: 100%;
      margin-bottom: 15px;
    }
  }
  .timeline--wrap {
    overflow: auto;
  }
  .timeline__current-time {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
  }
  .timeline {
    min-width: 1000px;
    position: relative;
    margin-top: 10px;
    padding: 8px 4px;
    display: flex;
    background: #f2f2f2;
    border-radius: 4px;
    &__handle {
      position: absolute;
      z-index: 10;
      top: 0;
      border-right: 2px solid $primary;
      height: 100%;
      &__time {
        position: absolute;
      }
    }
    &__hours {
      display: flex;
      width: 100%;
    }
    &__hour {
      flex: 1 1 0;
      text-align: center;
      border-left: 1px solid #ccc;
      border-top: 1px solid #ccc;
      padding: 8px 0;
      font-size: 12px;
      &:first-child {
        border-left: none;
      }
    }
    &__bar {
      position: absolute;
      top: 0;
      border-top: 8px solid $light-blue;
      height: 100%;
      cursor: pointer;
    }
  }
  .timeline__settings {
    text-align: right;
    margin-top: 10px;
    .el-select {
      width: 100px;
    }
    label {
      margin-right: 5px;
    }
  }
  .empty-text {
    padding-top: 30px;
  }
</style>
