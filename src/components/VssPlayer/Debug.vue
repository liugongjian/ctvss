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
    codec: 'h264',
    type: 'hls',
    videoName: 'TestVideo',
    isLive: false,
    isWs: false,
    // url: 'https://changchun.vcn.ctyun.cn/vss-work_order_10-1/29941957555937375/record/1644292818_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=M5NB4DWSTUYHO2W5V3XZ%2F20220305%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220305T015112Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a2ae9b8d55952be9dd767a01bfab753f85f6b6b15102611564b57e8db9d84f7b'
    url: 'https://vss-0b1056a46a878suejfc0a3d911da0596-1.guiyang.vcn.ctyun.cn/29941927491169158/record/1646112676_signed.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=N5FPWMDNNA5HCWPZ0X61%2F20220304%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20220304T150311Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=94340963364e2bf74b4c0463d42e73329ce4545789c2c5a976ee327e6d3af389'
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
      height: 400px;
      width: 570px;
    }
  }
}
</style>
