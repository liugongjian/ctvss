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
        <el-form-item label="视频名称">
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
        :video-name="form.videoName"
        :is-debug="true"
        :is-auto-play="true"
        :is-live="form.isLive"
        :is-ws="form.isWs"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VssPlayer from './index.vue'

@Component({
  name: 'PlayerDebug',
  components: {
    VssPlayer
  }
})
export default class extends Vue {
  private form: any = {
    codec: 'h265',
    type: 'hls',
    videoName: 'TestVideo',
    isLive: false,
    isWs: false,
    url: 'https://vss-resource10-1.chongqing.vcn.ctyun.cn/29941970440842640/record/1646269868_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=RKI80FWBGEJRBDCI6UE2%2F20220303%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220303T101305Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=8bcac1bd098457c2e5b7d17f9c0306e23f52632033591c31ffde54443f779b8c'
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

    ::v-deep video {
      width: 100%;
    }

    ::v-deep .player-box {
      height: 300px !important;

      div {
        display: none !important;
      }
    }
  }
}
</style>
