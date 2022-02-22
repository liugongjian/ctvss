<template>
  <div class="replay-player">
    <div v-if="!recordList.length" class="empty-text">
      该时段暂无录像
      <div v-if="hasPlaylive">
        <el-button type="text" @click="playlive">返回实时预览</el-button>
      </div>
    </div>
    <player
      v-if="recordList.length && currentRecord"
      ref="player"
      type="hls"
      :codec="currentRecord.video.codec"
      :url="currentRecord.playUrl.hlsUrl"
      :auto-play="true"
      :has-control="false"
      :has-playlive="hasPlaylive"
      :default-volume="defaultVolume"
      :is-fullscreen="isFullscreen"
      @onCanPlay="onCanPlay"
      @onTimeUpdate="setCurrentTime"
      @onEnded="playNextRecord"
      @onPlaylive="playlive"
      @onVolumeChange="onVolumeChange"
      @onFullscreen="fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
    <div class="timeline__box">
      <div ref="timelineWrap" class="timeline__wrap">
        <div ref="timeline" class="timeline" :class="{'dragging': axisDrag.isDragging}" @mousedown.stop.prevent="moveAxisStart($event)">
          <div
            v-if="currentTime"
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
            :style="`left: ${time.left}%; width: ${time.width}%; min-width: 1px;`"
            @click="handleTimeline($event, time)"
          />
          <div
            v-for="heatmapTime in heatmapTimePositionList"
            :key="heatmapTime.startTime"
            class="timeline__bar timeline__bar_heatmap"
            :style="`left: ${heatmapTime.left}%; width: ${heatmapTime.width}%; min-width: 1px;`"
            @click="handleHeatMapTimeline($event, heatmapTime)"
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
import { Component, Watch, Prop, Mixins } from 'vue-property-decorator'
import ReplayPlayerMixin from '@/views/device/mixin/replayPlayerMixin'
import { getTimestamp } from '@/utils/date'

@Component({
  name: 'ReplayPlayer'
})
export default class extends Mixins(ReplayPlayerMixin) {
  @Prop({
    default: () => {
      return []
    }
  })

  public recordList!: Array<any>

  @Prop({
    default: () => {
      return []
    }
  })
  public heatmapList!: Array<any>

  public heatmapTimePositionList: Array<any> = []

  public async mounted() {
    if (this.screen && this.screen.isCache && this.screen.replayType === 'cloud' && this.screen.currentTime) {
      this.startTime = this.screen.currentTime
      // 获取一次记录后将不再获取记录，置resetIsCache: true
      this.$emit('onCurrentTimeChange', {
        currentTime: this.startTime,
        resetIsCache: true
      })
    }
    await this.init()
  }

  @Watch('recordList')
  public onRecordListChanged() {
    this.timePositionList = this.calcVideoPosition(this.recordList)
  }

  @Watch('heatmapList')
  public onHeatMapListChanged() {
    this.heatmapTimePositionList = this.calcHeatMapVideoPosition(this.heatmapList)
  }

  /**
   * 计算检测到行人在时间轴中的位置
   */
  public calcHeatMapVideoPosition(list: Array<any>) {
    console.log('list: ', list)
    // const recordStartEndTimeList = []
    // let startTime = ''
    // let endTime = ''
    // this.recordList.forEach((record, index) => {
    //   if (index === 0) {
    //     startTime = record.startTime
    //   } else {
    //     const prevRecord = this.recordList[index - 1]
    //     const curRecord = this.recordList[index]
    //     if (prevRecord.endTime !== curRecord.startTime) {
    //       endTime = prevRecord.endTime
    //       recordStartEndTimeList.push({ startTime, endTime })
    //       startTime = curRecord.startTime
    //     }
    //     if (index === this.recordList.length - 1) {
    //       endTime = this.recordList[index].endTime
    //       recordStartEndTimeList.push({ startTime, endTime })
    //     }
    //   }
    // })
    // console.log('recordStartEndTimeList: ', recordStartEndTimeList)
    // const recordStartEndTimeListLength = recordStartEndTimeList.length
    const recordList = this.recordList
    const recordListLength = recordList.length
    const formattedList = []
    list.forEach((record: any) => {
      let startTime = record.startTime
      let endTime = record.endTime
      for (let i = 0; i < recordListLength; i++) {
        const cur = recordList[i]
        const curStartTime = cur.startTime
        const curEndTime = cur.endTime
        if (startTime < curStartTime) {
          startTime = curStartTime
        } else if (startTime > curEndTime) {
          continue
        }

        if (endTime <= curEndTime) {
          formattedList.push({
            ...record,
            startAt: getTimestamp(startTime),
            startTime,
            endTime,
            duration: new Date(endTime).getTime() / 1000 - new Date(startTime).getTime() / 1000,
            origi: recordList[i]
          })
          break
        } else if (startTime < curEndTime) {
          formattedList.push({
            ...record,
            startAt: getTimestamp(startTime),
            startTime,
            endTime: curEndTime,
            duration: new Date(curEndTime).getTime() / 1000 - new Date(startTime).getTime() / 1000,
            origi: recordList[i]
          })
          startTime = curEndTime
        }

        if (startTime >= endTime) {
          break
        }
      }
    })
    console.log('formattedList: ', formattedList)
    return formattedList.map((record: any) => {
      return {
        width: this.scale(record.duration + 1).toFixed(6),
        left: this.scale(Math.round((record.startAt - this.currentDate!) / 1000)).toFixed(6),
        ...record
      }
    })
  }

  /**
   * 初始化
   */
  public async init() {
    this.timePositionList = this.calcVideoPosition(this.recordList)
    this.heatmapTimePositionList = this.calcHeatMapVideoPosition(this.heatmapList)
    this.initVideoPlayer()
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
      if (this.startTime) {
        this.currentTime = this.startTime
        this.setRecordByCurrentTime()
      } else {
        this.currentRecord = this.recordList[0]
        this.$nextTick(() => {
          this.setCurrentTime(0)
          this.player && this.player.reset()
        })
      }
    }
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
      let offsetTime = 0
      let isCurrent = true
      if (!this.currentRecord || this.currentRecord.index !== record.index) {
        this.currentRecord = record
        isCurrent = false
      }
      this.$nextTick(() => {
        offsetTime = (currentTime - this.currentRecord.startAt) / 1000
        !isCurrent && this.player.reset()
        this.player.seek(offsetTime)
        this.setHandlePosition()
      })
    } else {
      console.log('destory')
      this.player && this.player.stop()
    }
  }

  /**
   * 点击行人位置
   */
  public handleHeatMapTimeline(e: any, record: any) {
    this.handleTimeline(e, record.origi)
  }
  /**
   * 点击时间轴位置
   */
  public handleTimeline(e: any, record: any) {
    if (this.axisDrag.isMove) return
    const scale = e.offsetX / e.target.clientWidth
    let offsetTime = Math.ceil(scale * record.duration)
    offsetTime = offsetTime <= 0 ? 0 : offsetTime
    let isCurrent = true
    if (this.currentRecord !== record) {
      this.currentRecord = record
      isCurrent = false
    }
    this.$nextTick(() => {
      this.setCurrentTime(offsetTime)
      this.setHandlePosition()
      !isCurrent && this.player.reset()
      this.player.seek(offsetTime)
    })
  }

  /**
   * 播放下一段
   */
  public playNextRecord() {
    let index = this.recordList.findIndex(record => this.currentRecord.index === record.index)
    index++
    if (index < this.recordList.length) {
      this.currentRecord = this.recordList[index]
      this.$nextTick(() => {
        this.setCurrentTime(0)
        this.player && this.player.reset()
      })
    }
  }

  /**
   * 已加载新录像
   */
  public loadedNewRecords(length: number) {
    let index = this.recordList.findIndex(record => this.currentRecord.index === record.index)
    // 最后一段并暂停时播放下一段
    if (this.recordList.length - length - 1 === index && this.player.paused) {
      this.playNextRecord()
    }
  }
}
</script>
