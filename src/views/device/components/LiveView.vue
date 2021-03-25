<template>
  <div v-loading="loading" class="live-wrap">
    <div class="empty-text">{{ errorMessage }}</div>
    <div v-if="!errorMessage" class="preview-player">
      <player
        v-if="address"
        ref="video"
        type="flv"
        :codec="codec"
        :url="address.flvUrl"
        :auto-play="true"
        :is-ws="true"
        :is-live="true"
        :is-fullscreen="isFullscreen"
        :has-control="false"
        @onRetry="onRetry"
        @onFullscreen="fullscreen()"
        @onExitFullscreen="exitFullscreen()"
      />
    </div>
    <info-list v-if="address" label-width="70" title="播放地址" class="address">
      <info-list-item v-if="address.rtmpUrl" label="RTMP:">
        {{ address.rtmpUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.rtmpUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </info-list-item>
      <info-list-item v-if="address.flvUrl" label="FLV:">
        {{ address.flvUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.flvUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </info-list-item>
      <info-list-item v-if="address.hlsUrl" label="HLS:">
        {{ address.hlsUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.hlsUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </info-list-item>
      <info-list-item v-if="address.hlsUrl" label="WebRTC:">
        {{ address.webrtcUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.webrtcUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </info-list-item>
    </info-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getDevicePreview } from '@/api/device'
import copy from 'copy-to-clipboard'
import Player from './Player.vue'

@Component({
  name: 'LiveView',
  components: {
    Player
  }
})
export default class extends Vue {
  @Prop({
    default: false
  })
  private isFullscreen?: boolean
  @Prop()
  private deviceId!: number | string
  @Prop()
  private inProtocol?: string
  private address?: any = null
  private codec?: string = ''
  private playerTimer: any = null
  private loading = false
  private retry = false
  private errorMessage = ''
  private timeout: any = null

  @Watch('$route.query')
  private onRouterChange() {
    if (this.playerTimer !== null) {
      clearTimeout(this.playerTimer)
    }
    this.playerTimer = setTimeout(this.loadPlayer, 500)
  }

  private mounted() {
    this.getDevicePreview()
  }

  private beforeDestroy() {
    clearTimeout(this.timeout)
  }

  private destroy() {
    const $video: any = this.$refs.video
    $video && $video.disposePlayer()
  }

  /**
   * 加载视频
   */
  private loadPlayer() {
    this.destroy()
    this.getDevicePreview()
  }

  /**
   * 重新加载视频
   */
  private reloadPlayer() {
    const $video: any = this.$refs.video
    $video && $video.reloadPlayer()
  }

  /**
   * 获取预览链接
   */
  private async getDevicePreview() {
    try {
      this.loading = true
      this.errorMessage = ''
      this.address = null
      const res = await getDevicePreview({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol
      })
      this.address = res.playUrl
      this.codec = res.video.codec
      this.retry = false
    } catch (e) {
      if (e.code === 5) {
        this.retry = true
      }
      this.errorMessage = e.message
    } finally {
      this.loading = false
    }
  }

  /**
   * 视频断流30秒后重试
   */
  private onRetry() {
    this.timeout = setTimeout(async() => {
      this.address = ''
      await this.getDevicePreview()
      if (this.retry) {
        this.onRetry()
      }
    }, 30 * 1000)
  }

  /**
   * 一键复制
   */
  private copyUrl(text: string) {
    copy(text)
    this.$message.success('复制成功')
  }

  /**
   * 开启全屏
   */
  public fullscreen() {
    this.$emit('onFullscreen')
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    this.$emit('onExitFullscreen')
  }
}
</script>
<style lang="scss" scoped>
  .live-wrap {
    min-height: 100px;
  }
  .preview-player {
    position: relative;
    background: #000;
    height: 70vh;
  }
  ::v-deep .play {
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: url('../assets/play.svg') no-repeat center;
    background-size: 80px 80px;
  }
  ::v-deep canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: none;
  }
  ::v-deep video {
    position: absolute;
    background: #000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: none;
  }
  ::v-deep .video-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: none;
  }
  .address {
    ::v-deep .info-item {
      padding: 15px 0 5px 0;
    }
    ::v-deep .info-item--val {
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      position: relative;
      padding-right: 20px;

      .el-button--text {
        position: absolute;
        padding: 0;
        right: 0;
      }
    }
  }
</style>
