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
      </el-form>
    </div>
    <div class="player__body">
      <el-form label-position="top">
        <el-form-item label="指定时间">
          <el-input v-model.number="form.time" />
          <el-button type="primary" @click="getRecordByTime">切换时间</el-button>
        </el-form-item>
      </el-form>
      <ReplayPlayer
        v-if="screen"
        ref="player"
        :screen="screen"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import ReplayPlayer from './index.vue'
import { ReplayScreen as Screen } from '@/views/device/models/Screen/ReplayScreen'

@Component({
  name: 'PlayerDebug',
  components: {
    ReplayPlayer
  }
})
export default class extends Vue {
  private form: any = {
    deviceInfo: {
      deviceId: '29941946818494646',
      inProtocol: 'gb28181',
      recordType: 0
    },
    time: 0
  }
  private screen = new Screen()

  private generate() {
    this.screen = new Screen()

    this.$nextTick(() => {
      this.screen.deviceInfo = this.form.deviceInfo
      this.screen.init()
    })
  }

  private getRecordByTime() {
    this.screen.currentRecord = this.screen.getRecordByTime(this.form.time)
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
