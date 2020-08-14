<template>
  <div>
    <div class="preview-player">
      <player v-if="address" ref="video" :type="videoCoding" :url="address.flvUrl" :auto-play="true" />
    </div>
    <info-list v-if="address" label-width="70" title="播放地址" class="address">
      <info-list-item v-if="address.rtmpUrl" label="RTMP:">
        {{ address.rtmpUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.rtmpUrl)"><i class="el-icon-copy-document" /></el-button>
        </el-tooltip>
      </info-list-item>
      <info-list-item v-if="address.flvUrl" label="FLV:">
        {{ address.flvUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.flvUrl)"><i class="el-icon-copy-document" /></el-button>
        </el-tooltip>
      </info-list-item>
      <info-list-item v-if="address.hlsUrl" label="HLS:">
        {{ address.hlsUrl }}
        <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
          <el-button type="text" @click="copyUrl(address.hlsUrl)"><i class="el-icon-copy-document" /></el-button>
        </el-tooltip>
      </info-list-item>
    </info-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { getDevicePreview } from '@/api/device'
import copy from 'copy-to-clipboard'
import Ctplayer from '@/utils/player'
import Player from '@/views/components/Player.vue'

@Component({
  name: 'DevicePreview',
  components: {
    Player
  }
})
export default class extends Vue {
  @Inject('deviceRouter') private deviceRouter!: Function
  private address?: any = null
  private videoCoding?: string = ''
  private playerTimer: any = null

  private get deviceId() {
    return this.$route.query.deviceId
  }

  @Watch('$route.query')
  private onRouterChange() {
    console.log('onRouterChange')
    if (this.playerTimer !== null) {
      clearTimeout(this.playerTimer)
    }
    this.playerTimer = setTimeout(this.loadPlayer, 500)
  }

  private mounted() {
    this.getDevicePreview()
    window.addEventListener('focus', this.reloadPlayer)
  }

  private beforeDestroy() {
    window.removeEventListener('focus', this.reloadPlayer)
  }

  private destroy() {
    const $video: any = this.$refs.video
    $video.disposePlayer()
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
    $video.reloadPlayer()
  }

  /**
   * 获取预览链接
   */
  private async getDevicePreview() {
    try {
      this.address = null
      const res = await getDevicePreview({
        deviceId: this.deviceId
      })
      this.address = res.playUrl
      this.videoCoding = res.videoCoding === 'h264' ? 'flv' : 'h265-flv'
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 一键复制
   */
  private copyUrl(text: string) {
    copy(text)
    this.$message.success('复制成功')
  }
}
</script>
<style lang="scss" scoped>
  .preview-player {
    position: relative;
    background: #000;
    ::v-deep canvas {
      display: block;
      margin: 0 auto;
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
    ::v-deep video {
      width: 100%;
      height: auto;
    }
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
