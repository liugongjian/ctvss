<template>
  <div class="player">
    <div class="player__controls">
      <el-form label-position="top">
        <el-form-item label="视频格式">
          <el-select v-model="form.type">
            <el-option value="mp4" label="Mp4" />
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
        @dispatch="onPlayerDispatch"
      />
    </div>
    <!-- <div class="player__body">
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
        @dispatch="onPlayerDispatch"
      />
    </div> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { PlayerEvent } from '@/components/VssPlayer/types/VssPlayer'
import VssPlayer from './index.vue'

@Component({
  name: 'PlayerDebug',
  components: {
    VssPlayer
  }
})
export default class extends Vue {
  private form: any = {
    codec: 'h264',
    type: 'hls',
    videoName: 'TestVideo',
    isLive: false,
    isWs: false,
    deviceInfo: {
      deviceName: 'TestVideo',
      deviceId: '123',
      inProtocol: 'gb281812'
    },
    url: 'http://42.81.162.130:18080/vss-resource10-1/29942159419404414/record/1646755201_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AEZOKBBKZWIE4IZMR3HM%2F20220309%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220309T014107Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=7418620afbd9e979a5c73db6effe581e546950cc3bd55646871e6d65ef5a7636'
    // url: 'https://liveplay.guangzhou.vcn.ctyun.cn/live/395591776819757060.flv'
    // url: 'https://changchun.vcn.ctyun.cn/vss-work_order_10-1/29941957555937375/record/1644292818_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=M5NB4DWSTUYHO2W5V3XZ%2F20220305%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220305T015112Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a2ae9b8d55952be9dd767a01bfab753f85f6b6b15102611564b57e8db9d84f7b'
    // url: 'https://guangzhou.vcn.ctyun.cn/vss-work_order_10-2/29941953260967657/record/1646668800_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GAA6CGT2MMHD06Z2KWQX%2F20220308%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220308T061504Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=620384a6b4d5cb0544ea7c64db307aecc18b20b3ddbd3d5745b1f6e87fd5aa33'
  }
  private url = ''

  private generate() {
    this.url = ''

    this.$nextTick(() => {
      this.url = this.form.url
    })
  }

  private onPlayerDispatch(event: PlayerEvent) {
    console.log(event)
    // if (type === 'rtc') {
    //   this.url = ''

    //   this.$nextTick(() => {
    //     this.url = this.form.rtcUrl
    //   })
    // }
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
