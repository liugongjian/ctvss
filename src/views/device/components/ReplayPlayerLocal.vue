<template>
  <div class="replay-player">
    <div v-if="!address" v-loading="loading" class="empty-text">
      <div v-if="!loading">{{ errorMessage || '该时段暂无本地录像' }}</div>
      <div v-if="hasPlaylive">
        <el-button type="text" @click="playlive">返回实时预览</el-button>
      </div>
    </div>
    <player
      v-if="address"
      ref="player"
      type="flv"
      :codec="codec"
      :url="address.flvUrl"
      :auto-play="true"
      :has-control="false"
      :has-playlive="hasPlaylive"
      :is-fullscreen="isFullscreen"
      @onCanPlay="onCanPlay"
      @onTimeUpdate="setCurrentTime"
      @onPlaylive="playlive"
      @onFullscreen="fullscreen()"
      @onExitFullscreen="exitFullscreen()"
      @onSetPlaybackRate="setPlaybackRate"
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
import axios from 'axios'
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { getDeviceRecords, getDevicePreview, setRecordScale } from '@/api/device'
import ReplayPlayerMixin from '@/views/device/mixin/replayPlayerMixin'
import { getTimestamp } from '@/utils/date'

@Component({
  name: 'ReplayPlayerLocal'
})
export default class extends Mixins(ReplayPlayerMixin) {
  @Prop()
  private deviceId!: number | string
  @Prop()
  private inProtocol!: string
  public recordList: Array<any> = []
  private address?: any = null
  private codec?: string = ''
  private loading = false
  private errorMessage = ''
  private axiosSource: any = {
    getRecordList: null,
    getDevicePreview: null
  }

  @Watch('startTime')
  private onStartTimeChange() {
    this.axiosSource.getDevicePreview && this.axiosSource.getDevicePreview.cancel()
    this.setHandlePosition()
    this.recordList.length && this.getDevicePreview()
  }

  @Watch('currentDate', {
    immediate: true
  })
  private async onCurrentDateChange() {
    this.cancelAxios()
    this.currentTime = this.startTime = this.currentDate!
    await this.getRecordList()
    this.initVideoPlayer()
  }

  public mounted() {
    // if (this.screen && this.screen.isCache && this.screen.replayType === 'local' && this.screen.currentTime) {
    //   this.startTime = this.screen.currentTimestamp
    //   // 清除screen中isCache
    //   this.$emit('onCurrentTimeChange', {
    //     currentTime: this.startTime,
    //     resetIsCache: true
    //   })
    // }
    this.initVideoPlayer()
  }

  private destroyed() {
    this.cancelAxios()
  }

  private cancelAxios() {
    for (const key in this.axiosSource) {
      this.axiosSource[key] && this.axiosSource[key].cancel()
    }
  }

  /**
   * 视频加载完成
   */
  public onCanPlay(val: boolean) {
    this.$emit('onCanPlay', val)
  }

  /**
   * 初始化播放器
   */
  public initVideoPlayer() {
    if (this.recordList.length) {
      this.currentRecord = this.recordList[0]
      this.currentTime = this.startTime = this.currentRecord && this.currentRecord.startAt
      this.$nextTick(() => {
        this.getDevicePreview()
      })
    } else {
      this.errorMessage = '该时段暂无本地录像'
    }
  }

  /**
   * 获取回放列表
   */
  private async getRecordList(startTime?: number) {
    try {
      this.loading = true
      this.axiosSource.getRecordList = axios.CancelToken.source()
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        recordType: 1, // 0-云端，1-本地
        startTime: startTime || this.currentDate! / 1000,
        endTime: this.currentDate! / 1000 + 24 * 60 * 60 - 1,
        pageSize: 9999
      }, this.axiosSource.getRecordList.token)
      // 追加最新的录像
      if (startTime) {
        const recordLength = this.recordList.length
        res.records.forEach((record: any, index: number) => {
          record.startAt = getTimestamp(record.startTime)
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
          record.startAt = getTimestamp(record.startTime)
          record.loading = false
          record.index = index
          return record
        })
      }
      this.timePositionList = this.calcVideoPosition(this.recordList)
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
      const startTimeDate = new Date(this.startTime)
      const endTime = new Date(startTimeDate.getFullYear(), startTimeDate.getMonth(), startTimeDate.getDate() + 1)
      this.axiosSource.getDevicePreview = axios.CancelToken.source()
      const res = await getDevicePreview({
        inProtocol: this.inProtocol,
        deviceId: this.deviceId,
        startTime: Math.floor(this.startTime! / 1000),
        endTime: Math.floor(endTime.getTime() / 1000 - 1),
        type: 'vod'
      }, this.axiosSource.getDevicePreview.token)
      this.address = res.playUrl
      this.codec = res.video.codec
    } catch (e) {
      if (e.code !== -1) {
        this.errorMessage = e.message
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 点击时间轴位置
   */
  public handleTimeline(e: any, record: any) {
    if (this.axisDrag.isMove) return
    const scale = e.offsetX / e.target.clientWidth
    let offsetTime = Math.ceil(scale * record.duration)
    offsetTime = offsetTime <= 0 ? 0 : offsetTime
    this.currentTime = new Date(record.startTime).getTime() + offsetTime * 1000
    this.startTime = this.currentTime!
    if (this.currentRecord !== record) {
      this.currentRecord = record
    }
    this.$nextTick(() => {
      this.setCurrentTime(0)
    })
  }

  /**
   * 设置游标在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  public setCurrentTime(offsetTime: number) {
    if (this.handleDrag.isDragging) return
    const currentTimestamp = this.startTime + offsetTime * 1000
    this.currentTime = currentTimestamp
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.$nextTick(() => {
      this.setHandlePosition()
    })
  }

  /**
   * 根据当前时间选择录像切片
   */
  public setRecordByCurrentTime() {
    const currentTime = this.currentTime!
    let record = this.recordList.find(record => {
      return (currentTime! >= record.startAt) && (currentTime! <= (record.startAt + record.duration * 1000))
    })
    if (record) {
      if (!this.currentRecord || this.currentRecord.index !== record.index) {
        this.currentRecord = record
      }
      this.$nextTick(() => {
        this.startTime = currentTime
        this.setHandlePosition()
      })
    }
  }

  /**
   * 设置播放速率
   */
  public setPlaybackRate(scale: number) {
    setRecordScale({
      deviceId: this.deviceId,
      playUrl: this.address.flvUrl,
      scale: scale.toString()
    })
  }
}
</script>
