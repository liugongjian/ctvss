<template>
  <div class="player">
    <div class="player__controls">
      <el-form label-position="top">
        <el-form-item label="视频格式">
          <el-select v-model="form.type">
            <el-option value="flv" label="FLV" />
            <el-option value="hls" label="HLS" />
            <el-option value="rtc" label="Webrtc" />
          </el-select>
        </el-form-item>
        <el-form-item label="编码格式">
          <el-select v-model="form.codec">
            <el-option value="h264" label="H264" />
            <el-option value="h265" label="H265" />
          </el-select>
        </el-form-item>
        <el-form-item label="流类型">
          <el-select v-model="form.isLive">
            <el-option :value="true" label="直播流" />
            <el-option :value="false" label="点播流" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否使用ws">
          <el-select v-model="form.isWs">
            <el-option :value="true" label="使用ws" />
            <el-option :value="false" label="使用http" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频地址">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-form-item label="RTC视频地址">
          <el-input v-model="form.rtcUrl" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="form.videoName" />
        </el-form-item>
        <el-form-item label="视频封面">
          <el-input v-model="form.poster" />
        </el-form-item>
        <el-button type="primary" @click="generate">生成</el-button>
      </el-form>
    </div>
    <div class="player__body">
      <VssPlayer
        v-if="url"
        ref="player"
        :url="url"
        :type="form.type"
        :codec="form.codec"
        :has-progress="true"
        :device-info="form.deviceInfo"
        :is-debug="true"
        :is-auto-play="true"
        :is-live="form.isLive"
        :is-ws="form.isWs"
        :poster="form.poster"
        @dispatch="onPlayerDispatch"
      />
      <!-- <Player
        ref="player"
        :url="url"
        :type="form.type"
        :codec="form.codec"
        :is-live="form.isLive"
      /> -->
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VssPlayer from './index.vue'
import Player from '@vss/video-player/index.vue'

@Component({
  name: 'PlayerDebug',
  components: {
    VssPlayer,
    Player
  }
})
export default class extends Vue {
  private form: any = {
    codec: 'h264',
    type: 'flv',
    videoName: 'TestVideo',
    isLive: false,
    isWs: false,
    poster: '',
    deviceInfo: {
      deviceName: 'TestVideo',
      deviceId: '123',
      inProtocol: 'gb28181'
    },
    url: 'https://liveplay.lanzhou.vcn.ctyun.cn/live/29942067077591243_101.flv'
  }
  private url = ''

  private generate() {
    this.url = ''

    this.$nextTick(() => {
      this.url = this.form.url
    })
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

    // ::v-deep video {
    //   width: 100%;
    //   height: 100%;
    // }

    ::v-deep .vss-player__wrap {
      height: 500px;
      width: 100%;
    }
  }
}
</style>
