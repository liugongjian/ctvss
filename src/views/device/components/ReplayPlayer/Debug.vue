<template>
  <div class="player">
    <div class="player__controls">
      <el-form label-position="top">
        <el-form-item label="设备名称">
          <el-input v-model="form.deviceInfo.deviceId" />
        </el-form-item>
        <el-form-item label="设备协议">
          <el-select v-model="form.deviceInfo.inProtocol">
            <el-option value="gb28181" label="gb28181" />
            <el-option value="ehome" label="ehome" />
            <el-option value="rtsp" label="rtsp" />
            <el-option value="rtmp" label="rtmp" />
          </el-select>
        </el-form-item>
        <el-form-item label="录像类型">
          <el-select v-model="form.deviceInfo.recordType">
            <el-option :value="0" label="云端" />
            <el-option :value="1" label="设备" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="generate">生 成</el-button>
        <el-button type="primary" @click="destroy">销毁</el-button>
      </el-form>
    </div>
    <div class="player__body">
      <div v-if="screen">
        <div>
          日期: <el-input v-model.number="form.date" placeholder="日期" @blur="changeDate" />
        </div>
        <div>
          跳转: <el-input v-model.number="form.time" placeholder="片段时间" @blur="seek" />
        </div>
        <div>当前日期：{{ currentDate }}</div>
        <div>当前时间：{{ formatedCurrentTime }}</div>
        <div>当前片段时间：{{ recordCurrentTime }}</div>
        <ReplayPlayer
          ref="player"
          :screen="screen"
          :is-debug="true"
        />
      </div>
      <br><br><br>
      <ReplayAxis
        :screen="screen"
        @change="onAxisTimeChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import ReplayPlayer from './index.vue'
import ReplayAxis from './ReplayAxis.vue'
import { Screen } from '@/views/device/models/Screen/Screen'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'PlayerDebug',
  components: {
    ReplayPlayer,
    ReplayAxis
  }
})
export default class extends Vue {
  private form: any = {
    deviceInfo: {
      deviceId: '29941979030768445',
      inProtocol: 'gb28181',
      recordType: 0
    },
    time: 0,
    date: 0
  }
  private screen: Screen = null

  private get player() {
    return this.screen && this.screen.player
  }

  private get recordCurrentTime() {
    return this.player && this.player.currentTime
  }

  private get currentRecord() {
    return this.screen && this.screen.currentRecord
  }

  private get currentTime() {
    if (this.currentRecord) {
      const duration = this.currentRecord.offsetTime > this.recordCurrentTime ? this.currentRecord.offsetTime : this.recordCurrentTime
      return this.currentRecord.startTime + duration
    } else {
      return null
    }
  }

  private get formatedCurrentTime() {
    return this.currentRecord && dateFormat(new Date(this.currentTime * 1000))
  }

  private get currentDate() {
    return this.screen && dateFormat(new Date(this.screen.currentDate * 1000))
  }

  private changeDate() {
    this.screen.changeDate(this.form.date)
  }

  private generate() {
    this.screen = new Screen()

    this.$nextTick(() => {
      this.screen.isLive = false
      this.screen = Object.assign(this.screen, this.form.deviceInfo)
      console.log(this.screen.init)
      this.screen.init()
    })
  }

  private destroy() {
    this.screen = null
  }

  private seek() {
    this.screen.seek(this.form.time)
  }

  private onAxisTimeChange(time: number, flag: any) {
    console.log('onAxisTimeChange')
    console.log(flag)
    this.screen.seek(time)
  }
}
</script>
<style lang="scss" scoped>
.player {
  display: flex;

  &__controls {
    width: 400px;
    padding: 20px;
  }

  &__body {
    flex: 1;

    ::v-deep .vss-player__wrap {
      height: 500px;
      width: 100%;
    }
  }
}
</style>
