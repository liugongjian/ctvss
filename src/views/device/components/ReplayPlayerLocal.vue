<template>
  <div class="replay-player">
    <div v-if="!address" v-loading="loading" class="empty-text">
      {{ errorMessage || '该时段暂无录像' }}
      <div v-if="hasPlaylive">
        <el-button type="text" @click="playlive">返回实时预览</el-button>
      </div>
    </div>
    <player
      v-if="address"
      ref="player"
      :type="codec"
      :url="address.flvUrl"
      :auto-play="true"
      :has-control="false"
      :has-playlive="hasPlaylive"
      :is-fullscreen="isFullscreen"
      @onTimeUpdate="setCurrentTime"
      @onPlaylive="playlive"
      @onFullscreen="fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
    <div class="timeline__box">
      <div ref="timelineWrap" class="timeline__wrap">
        <div ref="timeline" class="timeline" :class="{'dragging': axisDrag.isDragging}" @mousedown.stop.prevent="moveAxisStart($event)">
          <div
            ref="handle"
            class="timeline__handle"
            :style="`left: ${handlePos}%;`"
            @mousedown.stop.prevent="moveHandleStart($event)"
          >
            <div class="timeline__current-time">
              <span>{{ dateFormat(currentTime) }}</span>
            </div>
          </div>
          <div class="timeline__axis">
            <div v-for="i in 24" :key="i" class="timeline__hour">
              {{ i > 10 ? '' : '0' }}{{ i - 1 }}:00
            </div>
            <div v-if="timelineRatio > 1" class="timeline__axis__slice">
              <div v-for="i in 24 * 4" :key="i" class="timeline__half__hour">.</div>
            </div>
          </div>
          <div
            v-for="(time, index) in timePositionList"
            :key="index"
            class="timeline__bar"
            :style="`left: ${time.left}%; width: ${time.width}%;`"
            @click="handleTimeline($event, time)"
          />
        </div>
      </div>
      <div class="timeline__settings">
        <div class="settings__btn settings_zoomin" @click="setTimelineRatio(1)">
          <svg-icon name="zoom-in" width="14px" height="14px" />
        </div>
        <div class="settings__btn settings_zoomout" @click="setTimelineRatio(0)">
          <svg-icon name="zoom-out" width="14px" height="14px" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { getDeviceRecords, getDevicePreview } from '@/api/device'
import ReplayPlayerMixin from '@/views/device/mixin/replayPlayerMixin'

@Component({
  name: 'ReplayPlayerLocal'
})
export default class extends Mixins(ReplayPlayerMixin) {
  @Prop()
  private deviceId!: number | string
  private address?: any = null
  private codec?: string = ''
  private loading = false
  private errorMessage = ''

  @Watch('startTime')
  private onStartTimeChange() {
    this.setHandlePosition()
    this.getDevicePreview()
  }

  @Watch('currentDate', {
    immediate: true
  })
  private onCurrentDateChange() {
    this.currentTime = this.startTime = this.currentDate!
    this.getRecordList()
  }

  /**
   * 获取回放列表
   */
  private async getRecordList(startTime?: number) {
    try {
      this.loading = true
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        recordType: 1, // 0-云端，1-本地
        startTime: startTime || this.currentDate! / 1000,
        endTime: this.currentDate! / 1000 + 24 * 60 * 60,
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
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 获取预览链接
   */
  private async getDevicePreview() {
    try {
      this.loading = true
      this.errorMessage = ''
      this.address = null
      const res = await getDevicePreview({
        deviceId: this.deviceId,
        startTime: Math.floor(this.startTime! / 1000),
        endTime: Math.floor(new Date().getTime() / 1000),
        type: 'vod'
      })
      this.address = res.playUrl
      this.codec = res.video.codec === 'h264' ? 'flv' : 'h265-flv'
    } catch (e) {
      this.errorMessage = e.message
    } finally {
      this.loading = false
    }
  }

  /**
   * 设置操作具柄在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  public setCurrentTime(offsetTime: number) {
    if (this.handleDrag.isDragging) return
    if (!offsetTime) return
    const currentTimestamp = this.startTime! + offsetTime * 1000
    this.currentTime = currentTimestamp
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.setHandlePosition()
  }
}
</script>
