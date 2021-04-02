<template>
  <div class="replay-view">
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
      <el-radio-group v-if="inProtocol === 'gb28181'" v-model="replayType" size="small" class="filter-container__replay-type">
        <el-radio-button label="cloud">云端</el-radio-button>
        <el-radio-button label="local">本地</el-radio-button>
      </el-radio-group>
      <el-radio-group v-if="replayType === 'cloud'" v-model="viewType" size="small" class="filter-container__view-model">
        <el-tooltip content="时间轴视图" placement="top">
          <el-radio-button label="timeline"><svg-icon name="timeline" width="16px" height="16px" /></el-radio-button>
        </el-tooltip>
        <el-tooltip content="列表视图" placement="top">
          <el-radio-button label="list"><svg-icon name="list" width="16px" height="16px" /></el-radio-button>
        </el-tooltip>
      </el-radio-group>
      <el-tooltip v-if="replayType === 'cloud'" content="录像文件下载" placement="top">
        <el-button class="filter-container__slice" size="small" @click="sliceDownload"><svg-icon name="download" width="16px" height="16px" /></el-button>
      </el-tooltip>
    </div>
    <template v-if="viewType === 'timeline'">
      <replay-player
        v-if="replayType === 'cloud' && recordList.length"
        ref="replayPlayer"
        v-loading="loading"
        :current-date="currentDate"
        :record-list="recordList"
        :has-playlive="hasPlaylive"
        :is-fullscreen="isFullscreen"
        :replay-type="replayType"
        @onPlaylive="playlive"
        @onFullscreen="fullscreen()"
        @onExitFullscreen="exitFullscreen()"
      />
      <div v-if="replayType === 'cloud' && !recordList.length && !loading" class="replay-player">
        <div class="empty-text">
          该时段暂无录像
          <div v-if="hasPlaylive">
            <el-button type="text" @click="playlive">返回实时预览</el-button>
          </div>
        </div>
      </div>
      <replay-player-local
        v-if="replayType === 'local'"
        :current-date="currentDate"
        :has-playlive="hasPlaylive"
        :is-fullscreen="isFullscreen"
        :replay-type="replayType"
        :device-id="deviceId"
        :in-protocol="inProtocol"
        @onPlaylive="playlive"
        @onFullscreen="fullscreen()"
        @onExitFullscreen="exitFullscreen()"
      />
    </template>
    <div v-else class="replay-time-list">
      <el-table v-loading="loading" :data="recordListSlice" empty-text="所选日期暂无录像">
        <el-table-column label="开始时间" prop="startAt" min-width="180" :formatter="dateFormatInTable" />
        <el-table-column label="时长" prop="duration" :formatter="durationFormatInTable" />
        <el-table-column prop="action" label="操作" width="200" fixed="right">
          <template slot-scope="{row}">
            <el-button :disabled="row.loading" type="text" @click="downloadReplay(row)">下载录像</el-button>
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
import { dateFormatInTable, dateFormat, durationFormatInTable, prefixZero } from '@/utils/date'
import { getDeviceRecords, getDeviceRecord, getDeviceRecordStatistic, getDeviceRecordRule } from '@/api/device'
import ReplayPlayerDialog from './dialogs/ReplayPlayer.vue'
import SliceDownloadDialog from './dialogs/SliceDownload.vue'
import ReplayPlayer from './ReplayPlayer.vue'
import ReplayPlayerLocal from './ReplayPlayerLocal.vue'

@Component({
  name: 'ReplayView',
  components: {
    ReplayPlayerDialog,
    SliceDownloadDialog,
    ReplayPlayer,
    ReplayPlayerLocal
  }
})
export default class extends Vue {
  @Prop()
  private deviceId!: number | string
  @Prop()
  private inProtocol!: string
  @Prop({
    default: false
  })
  private isFullscreen?: boolean
  @Prop({
    default: false
  })
  private hasPlaylive?: boolean
  private player?: any
  private dateFormatInTable = dateFormatInTable
  private durationFormatInTable = durationFormatInTable
  private dateFormat = dateFormat
  private viewType = 'timeline'
  private replayType = 'cloud'
  private currentRecord: any = null
  private currentListRecord: any = null
  private currentDate = new Date(new Date().toLocaleDateString()).getTime()
  private loading = false
  private recordList: Array<any> = []
  private recordListSlice: Array<any> = []
  private recordStatistic: Map<string, any> = new Map()
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    },
    cellClassName: (date: any) => {
      const monthStr = `${date.getFullYear()}-${prefixZero(date.getMonth() + 1, 2)}`
      const dateStr = monthStr + `-${prefixZero(date.getDate(), 2)}`
      const month = this.recordStatistic.get(monthStr)
      const hasRecords = month ? month.has(dateStr) : ''
      return hasRecords ? 'has-records' : ''
    },
    changeCalendar: (date: any) => {
      const monthStr = `${date.getFullYear()}-${date.getMonth()}`
      if (!this.recordStatistic.has(monthStr)) {
        const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 1).getTime() / 1000)
        const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000)
        this.getRecordStatistic(startTime, endTime)
      }
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
  private recordInterval: any = null

  private async mounted() {
    await this.init()
  }

  private async destroyed() {
    clearInterval(this.recordInterval)
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.player && this.player.disposePlayer()
    this.init()
  }

  @Watch('replayType')
  private onReplayTypeChange() {
    this.viewType = 'timeline'
  }

  /**
   * 初始化
   */
  private async init() {
    // 获得最近两月录像统计
    const current = new Date()
    const startTime = Math.floor(new Date(current.getFullYear(), current.getMonth() - 1).getTime() / 1000)
    const endTime = Math.floor(new Date().getTime() / 1000)
    this.getRecordStatistic(startTime, endTime)
    clearInterval(this.recordInterval)
    this.recordList = []
    await this.getRecordList()
    // 定时轮询新录像
    this.getLatestRecord()
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
  private async getRecordList(startTime?: number) {
    try {
      this.loading = true
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        recordType: 0, // 0-云端，1-本地
        startTime: startTime || this.currentDate / 1000,
        endTime: this.currentDate / 1000 + 24 * 60 * 60,
        pageSize: 9999
      })
      // 追加最新的录像
      if (startTime) {
        const recordLength = this.recordList.length
        res.records.forEach((record: any, index: number) => {
          record.startAt = new Date(record.startTime).getTime()
          record.loading = false
          record.index = recordLength + index
          if (!~this.recordList.findIndex(_record => {
            return record.startTime === _record.startTime
          })) {
            this.recordList.push(record)
          }
        })
        if (res.records) {
          const replayPlayer: any = this.$refs.replayPlayer
          replayPlayer.loadedNewRecords(res.records.length)
        }
      } else {
        this.recordList = res.records.map((record: any, index: number) => {
          record.startAt = new Date(record.startTime).getTime()
          record.loading = false
          record.index = index
          return record
        })
        this.pager.total = res.totalNum
      }
      this.getRecordListByPage()
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 获取日历统计
   */
  private async getRecordStatistic(startTime: number, endTime: number) {
    try {
      const res = await getDeviceRecordStatistic({
        deviceId: this.deviceId,
        startTime: startTime,
        endTime: endTime
      })
      res.records.forEach((statistic: any) => {
        const monthArray = statistic.day.match(/\d+-\d+/)
        const month = monthArray ? monthArray[0] : null
        if (!this.recordStatistic.has(month)) {
          this.recordStatistic.set(month, new Set())
        }
        this.recordStatistic.get(month).add(statistic.day)
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 定时轮询新录像
   */
  private async getLatestRecord() {
    const recordListLength = this.recordList.length
    if (!recordListLength) return
    try {
      // 获取录制规则
      const res = await getDeviceRecordRule({
        deviceId: this.deviceId
      })
      const interval = res.interval
      if (interval) {
        this.recordInterval = setInterval(() => {
          const lastRecord = this.recordList[recordListLength - 1]
          const startTime = Math.floor(new Date(lastRecord.endTime).getTime() / 1000 - 3 * 60)
          this.getRecordList(startTime)
        }, interval * 1000)
      }
    } catch (e) {
      console.log(e)
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

  /**
   * 开启全屏
   */
  public fullscreen() {
    this.$emit('onFullscreen')
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    this.$emit('onExitFullscreen')
  }
}
</script>
<style lang="scss" scoped>
  .replay-view {
    ::v-deep .el-loading-mask {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }
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
    &__replay-type {
      margin-right: 10px;
      ::v-deep .el-radio-button--small .el-radio-button__inner {
        padding: 9px 10px;
      }
    }
    &__view-model {
      margin-right: 10px;
    }
    &__slice {
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
