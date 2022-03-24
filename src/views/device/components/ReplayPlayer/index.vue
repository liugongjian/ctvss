<template>
  <VssPlayer
    ref="player"
    class="replay-player"
    :class="{'has-axis': hasAxis}"
    :url="url"
    :type="type"
    :codec="codec"
    :device-info="screen.deviceInfo"
    :error-msg="screen.errorMsg"
    :is-auto-play="true"
    :is-live="false"
    :has-close="hasClose"
    :is-loading="screen.isLoading"
    :volume="screen.volume"
    :is-muted="screen.isMuted"
    :playback-rate="screen.playbackRate"
    :scale="screen.scale"
    :is-debug="isDebug"
    :has-live-replay-selector="hasLiveReplaySelector"
    @dispatch="onDispatch"
    @onCreate="onPlayerCreate"
  >
    <template slot="controlBody">
      <Datepicker
        v-if="hasAxis"
        class="datepicker"
        :screen="screen"
      />
      <ReplayType
        v-if="hasAxis"
        class="replay-type"
        :screen="screen"
      />
      <ReplayAxis
        v-if="hasAxis"
        :screen="screen"
        :is-inline="true"
        @change="onAxisTimeChange"
      />
    </template>
    <template slot="controlRight">
      <RecordDownload :screen="screen" />
      <Fullscreen @change="onFullscreenChange" />
    </template>
  </VssPlayer>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { ScreenModule } from '@/store/modules/screen'
import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import { Screen } from '@/views/device/models/Screen/Screen'
import VssPlayer from '@/components/VssPlayer/index.vue'
import ReplayAxis from './ReplayAxis.vue'
import Datepicker from '../ScreenBoard/components/DatePicker.vue'
import ReplayType from '../ScreenBoard/components/ReplayType.vue'
import Fullscreen from '../ScreenBoard/components/Fullscreen.vue'
import RecordDownload from './RecordDownload.vue'

@Component({
  name: 'ReplayPlayer',
  components: {
    VssPlayer,
    ReplayAxis,
    Datepicker,
    ReplayType,
    Fullscreen,
    RecordDownload
  }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  @Prop()
  private hasClose: Boolean

  @Prop()
  private hasLiveReplaySelector: Boolean

  @Prop()
  private hasAxis: Boolean

  @Prop()
  private isDebug: Boolean

  private url: string = null
  private type: string = null
  private codec: string = null

  private get recordManager() {
    return this.screen.recordManager
  }

  @Watch('screen.recordManager.currentRecord.url', { immediate: true })
  @Watch('screen.url')
  private onChange() {
    if (this.screen.recordType === 0) {
      this.url = this.recordManager.currentRecord && this.recordManager.currentRecord.url
      this.type = 'hls'
      this.codec = this.recordManager.currentRecord && this.recordManager.currentRecord.codec
    } else {
      this.url = this.screen.url
      this.type = 'flv'
      this.codec = this.screen.codec
    }
  }

  /**
   * 播放器事件路由
   */
  private onDispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'close':
        this.onClose()
        break
      case 'toggleLiveReplay':
        this.toggleLiveReplay()
        break
      case 'setPlaybackRate':
        this.setPlaybackRate(event.payload)
        break
    }
  }

  /**
   * 当播放器实例创建
   * 如果设为offsetTime，则seek到此时间
   */
  private onPlayerCreate(player) {
    this.screen.player = player
    this.screen.errorMsg = null
    // 片段播放完后播放下一段
    this.screen.player.config.onEnded = this.recordManager.playNextRecord.bind(this.recordManager)
    // 跳转到offsetTime
    if (this.recordManager.currentRecord && this.recordManager.currentRecord.offsetTime) {
      this.screen.player.seek(this.recordManager.currentRecord.offsetTime)
    }
  }

  /**
   * 切换录像回放/实时预览
   */
  private toggleLiveReplay() {
    this.screen.isLive = true
    this.screen.init()
  }

  /**
   * 本地录像设置倍速播放
   */
  private setPlaybackRate(playbackRate: number) {
    if (this.screen.recordType === 1) {
      this.recordManager.setPlaybackRate(playbackRate)
    }
  }

  /**
   * 拖动时间轴
   */
  private onAxisTimeChange(time: number) {
    this.recordManager.seek(time)
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }

  /**
   * 全屏操作
   */
  private onFullscreenChange(isFullscreen) {
    this.screen.isFullscreen = isFullscreen
    ScreenModule.SetIsFullscreen(isFullscreen)
  }
}
</script>
<style lang="scss" scoped>
.replay-player {
  &.has-axis {
    ::v-deep {
      .player__wrap .control {
        height: 83px;
      }

      .axis__wrap {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 48px;

        .axis__zoom {
          margin-right: 5px;
        }

        .axis__zoom__btn svg {
          width: 10px !important;
        }
      }

      .axis__time {
        top: 31px;
        color: #fff;
        font-size: 12px;
        transform: scale(0.85);
      }
    }

    .datepicker {
      position: absolute;
      width: 105px;
      left: 40px;
      top: 8px;
      transform: scale(0.85);

      ::v-deep {
        .el-input__inner {
          font-size: 12px;
          background: none;
          color: #fff;
          padding: 0 0 0 23px;
          height: 21px;
          line-height: 21px;
          border-color: rgba(255, 255, 255, 70%);
        }

        .el-date-editor {
          width: auto;
        }

        .el-input__prefix {
          left: 2px;

          .el-input__icon {
            line-height: 21px;
          }
        }
      }
    }

    .replay-type {
      position: absolute;
      left: 140px;
      top: 1px;
      transform: scale(0.85);

      ::v-deep {
        .el-radio-button__inner {
          padding: 3px 4px;
          background: none;
          color: #fff;
          font-size: 12px;
        }

        .el-radio-button__orig-radio:checked + .el-radio-button__inner {
          background: #fff;
          border-color: #fff;
          color: #000;
          box-shadow: -1px 0 0 0 #fff;
        }
      }
    }
  }
}

</style>
