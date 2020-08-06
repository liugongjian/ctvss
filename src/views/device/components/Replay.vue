<template>
  <div class="replay-wrap">
    <div class="replay-player">
      <video id="replayPlayer" ref="video" controls />
      <div class="timeline--wrap">
        <div ref="timeline" class="timeline">
          <div
            class="timeline__handle"
            :style="`left: ${handlePos}px;`"
          >
            {{ currentTime }}
          </div>
          <div
            v-for="(time, index) in timePositionList"
            :key="index"
            class="timeline__bar"
            :style="`left: ${time.left}%; width: ${time.width}%;`"
            @click="handleTimeline($event, time)"
          />
          <div class="timeline__hours">
            <div v-for="i in 24" :key="i" class="timeline__hour">
              {{ i > 10 ? '' : '0' }}{{ i - 1 }}:00
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="replay-time-list">
      <el-date-picker
        v-model="replayRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <el-table :data="timeList">
        <el-table-column label="开始时间" prop="startTime" min-width="180" :formatter="dateFormatInTable" />
        <el-table-column label="时长" prop="duration" />
        <el-table-column prop="action" label="操作" width="90" fixed="right">
          <template slot-scope="{row}">
            <el-button type="primary" @click="changeReplay(row)">播放</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat } from '@/utils/date'

@Component({
  name: 'Replay'
})
export default class extends Vue {
  private dateFormatInTable = dateFormatInTable
  private replayRange = null
  private currentDateTime = new Date(new Date().toLocaleDateString()).getTime()
  private currentTime: string | null = null
  private handlePos = 0
  private timeList = [
    {
      duration: 1800,
      hls: 'https://gbs.liveqing.com:10010/sms/34020000002020000001/record/34020000001320000264_34020000001320000264/20200803/20200803093000/34020000001320000264_34020000001320000264_record.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTY2NzY3NDAsInB3IjoiZ3Vlc3QiLCJ0bSI6MTU5NjY3NjU2MCwidW4iOiJndWVzdCJ9.BjZ_n72eTYUl8aUDaQICUcaHqES6IXj1Ra8cIa6235A',
      startAt: 1596672000000
    },
    {
      duration: 1800,
      hls: 'https://gbs.liveqing.com:10010/sms/34020000002020000001/record/34020000001320000264_34020000001320000264/20200803/20200803093000/34020000001320000264_34020000001320000264_record.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTY2NzY3NDAsInB3IjoiZ3Vlc3QiLCJ0bSI6MTU5NjY3NjU2MCwidW4iOiJndWVzdCJ9.BjZ_n72eTYUl8aUDaQICUcaHqES6IXj1Ra8cIa6235A',
      startAt: 1596673800000
    },
    {
      duration: 1800,
      hls: 'https://gbs.liveqing.com:10010/sms/34020000002020000001/record/34020000001320000264_34020000001320000264/20200803/20200803093000/34020000001320000264_34020000001320000264_record.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTY2NzY3NDAsInB3IjoiZ3Vlc3QiLCJ0bSI6MTU5NjY3NjU2MCwidW4iOiJndWVzdCJ9.BjZ_n72eTYUl8aUDaQICUcaHqES6IXj1Ra8cIa6235A',
      startAt: 1596675600000
    },
    {
      duration: 1800,
      hls: 'https://gbs.liveqing.com:10010/sms/34020000002020000001/record/34020000001320000264_34020000001320000264/20200803/20200803093000/34020000001320000264_34020000001320000264_record.m3u8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTY2NzY3NDAsInB3IjoiZ3Vlc3QiLCJ0bSI6MTU5NjY3NjU2MCwidW4iOiJndWVzdCJ9.BjZ_n72eTYUl8aUDaQICUcaHqES6IXj1Ra8cIa6235A',
      startAt: 1596686400000
    }
  ]
  private timePositionList: Array<any> = []

  private mounted() {
    this.timePositionList = this.calcPosition(this.timeList)
  }

  private handleTimeline(e: any, time: any) {
    console.log(e, time)
    const $timeline: any = this.$refs.timeline
    const scale = e.offsetX / e.target.clientWidth
    const wrapPos = $timeline.getBoundingClientRect()
    const seek = Math.ceil(scale * time.duration)
    const currentTime = time.startAt + seek * 1000
    const currentTimeDate = new Date(currentTime)
    this.currentTime = `${currentTimeDate.getHours()}:${currentTimeDate.getMinutes()}`
    console.log(currentTimeDate)
    this.handlePos = e.clientX - wrapPos.left
  }

  private calcPosition(list: Array<any>) {
    return list.map((time: any) => {
      return {
        width: this.scale(time.duration + 1),
        left: this.scale(Math.round((time.startAt - this.currentDateTime) / 1000)),
        ...time
      }
    })
  }

  private scale(sec: number) {
    return (sec / (24 * 60 * 60) * 100).toFixed(6)
  }
}
</script>
<style lang="scss" scoped>
  .replay-wrap {
  }
  .replay-player {
    flex: 4;
    height: 500px;
  }
  .replay-time-list {
    flex: 2;
    margin-left: 15px;
    overflow: hidden;

    .el-range-editor {
      width: 100%;
      margin-bottom: 15px;
    }
  }
  .timeline--wrap {
    overflow: auto;
  }
  .timeline {
    min-width: 970px;
    position: relative;
    margin-top: 15px;
    padding: 10px 0;
    display: flex;
    background: #eee;
    &__handle {
      position: absolute;
      top: 0;
      border-right: 2px solid $primary;
      height: 100%;
    }
    &__hours {
      display: flex;
      width: 100%;
    }
    &__hour {
      flex: 1 1 0;
      text-align: center;
      border-left: 1px solid #aaa;
      border-top: 1px solid #aaa;
      padding: 5px 0;
      font-size: 12px;
      &:first-child {
        border-left: none;
      }
    }
    &__bar {
      position: absolute;
      top: 0;
      border-top: 10px solid $primary;
      height: 100%;
      cursor: pointer;
    }
  }
</style>
