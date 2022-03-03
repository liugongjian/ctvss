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
    codec: 'h264',
    type: 'hls',
    isLive: false,
    isWs: false,
    url: 'https://guangzhou.vcn.ctyun.cn/vss-work_order_10-2/29941953260967657/record/1646150401_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GAA6CGT2MMHD06Z2KWQX%2F20220302%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220302T062925Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a22bc457ca6bbc3d2da1224ab8120b1be28b81530e1a0583dcbf1974a6644b81'
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
