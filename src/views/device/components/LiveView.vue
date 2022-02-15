<template>
  <div v-loading="loading" class="live-wrap">
    <div v-if="inProtocol === 'rtsp' || inProtocol === 'ehome'" class="stream-selector">
      <StreamSelector
        :is-show-label="true"
        :stream-size="streamSize"
        :stream-num="streamNum"
        :streams="streams"
        @onSetStreamNum="onSetStreamNum"
      />
    </div>
    <div v-if="errorMessage" class="empty-text">{{ errorMessage }}</div>
    <div v-if="!errorMessage" class="preview-player">
      <player
        v-if="address"
        ref="video"
        :type="type"
        :codec="codec"
        :url="address.flvUrl"
        :auto-play="true"
        :is-ws="true"
        :is-live="true"
        :is-fullscreen="isFullscreen"
        :has-control="false"
        :all-address="address"
        :in-protocol="inProtocol"
        :device-id="deviceId"
        :video-info="videoInfo"
        :volume="volume"
        @onCanPlay="onCanPlay"
        @onRetry="onRetry"
        @onFullscreen="fullscreen"
        @onExitFullscreen="exitFullscreen"
        @onIntercom="onIntercom(intercomInfo, ...arguments)"
      />
    </div>

    <!-- <info-list v-if="address" label-width="70" title="播放地址" class="address">
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
      <info-list-item v-if="address.webrtcUrl" label="WebRTC:">
        {{ address.webrtcUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.webrtcUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </info-list-item>
    </info-list> -->
    <intercom-dialog v-if="ifIntercom" :intercom-info="intercomInfo" @close="closeIntercom" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getDevicePreview, getDevice } from '@/api/device'
import copy from 'copy-to-clipboard'
import Player from './Player.vue'
import StreamSelector from './StreamSelector.vue'
import IntercomDialog from './dialogs/Intercom.vue'

@Component({
  name: 'LiveView',
  components: {
    Player,
    StreamSelector,
    IntercomDialog
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
  private type?: string = 'flv'
  private codec?: string = ''
  private playerTimer: any = null
  private loading = false
  private retry = false
  private errorMessage = ''
  private timeout: any = null
  private streams?: Array<any> = []
  private streamNum?: number | null = null
  private streamSize?: number | null = null

  private intercomInfo = {}
  private ifIntercom = false
  private videoInfo = {}
  private volume = 30

  @Watch('$route.query')
  private onRouterChange() {
    if (this.playerTimer !== null) {
      clearTimeout(this.playerTimer)
    }
    this.playerTimer = setTimeout(this.loadPlayer, 500)
  }

  private async mounted() {
    if (this.inProtocol === 'rtsp' || this.inProtocol === 'ehome') {
      await this.getDevice()
    }
    this.getDevicePreview()
  }

  private beforeDestroy() {
    clearTimeout(this.timeout)
  }

  private destroy() {
    const $video: any = this.$refs.video
    $video && $video.disposePlayer()
  }

  // 实时对讲
  private onIntercom(screen:any, type: string) {
    this.volume = 0
    this.type = type.toLowerCase()
    screen.type = type.toLowerCase()
    this.intercomInfo = screen
    this.ifIntercom = true
  }

  /**
   * 关闭实时对讲
   */
  private closeIntercom() {
    this.volume = 30
    this.ifIntercom = false
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
   * 获取设备信息
   */
  public async getDevice() {
    try {
      const res = await getDevice({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol
      })
      this.streamNum = res.autoStreamNum
      this.streamSize = res.multiStreamSize
      this.streams = res.deviceStreams
      console.log(res)
    } catch (e) {
      console.error(e)
    }
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
        inProtocol: this.inProtocol,
        streamNum: this.streamNum
      })
      this.address = res.playUrl
      this.codec = res.video.codec
      this.retry = false
      this.videoInfo = res.videoInfo
      this.intercomInfo = {
        url: this.address.flvUrl,
        codec: this.codec,
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        isLive: true,
        allAddress: this.address
      }
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
   * 切换主子码流
   */
  private onSetStreamNum(streamNum: number) {
    this.address = ''
    this.streamNum = streamNum
    this.getDevicePreview()
  }

  /**
   * 视频加载完成
   */
  onCanPlay(val: boolean) {
    this.$emit('onCanPlay', val)
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
    width: 100%;
    min-height: 100px;
    .stream-selector {
      margin-bottom: 10px;
      i {
        display: inline-block;
        margin-bottom: 10px;
      }
      ::v-deep .controls__popup {
        left: 0;
      }
    }
    .empty-text {
      display: flex;
      min-height: 100px;
      justify-content: center;
      align-items: center;
      background: #f6f6f6;
    }
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
