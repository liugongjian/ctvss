<template>
  <player-container :on-can-play="onCanPlay" :calendar-focus="calendarFocus">
    <replay-view
      ref="replayView"
      :class="{'fullscreen': isFullscreen}"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :is-fullscreen="isFullscreen"
      @onCalendarFocus="onCalendarFocus"
      @onCanPlay="playEvent"
      @onFullscreen="isFullscreen = true; fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
  </player-container>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject } from 'vue-property-decorator'
import FullscreenMixin from '../mixin/fullscreenMixin'
import ReplayView from './ReplayView.vue'
import PlayerContainer from './PlayerContainer.vue'

@Component({
  name: 'DevicePreview',
  components: {
    ReplayView,
    PlayerContainer
  }
})
export default class extends Mixins(FullscreenMixin) {
  @Inject('deviceRouter') private deviceRouter!: Function

  @Prop() private deviceId?: string
  @Prop() private inProtocol?: string

  private onCanPlay = false
  private calendarFocus = false

  private mounted() {
    this.$nextTick(this.resizeReplayVideo)
    window.addEventListener('resize', this.resizeReplayVideo)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.resizeReplayVideo)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 设置播放器大小
   */
  private resizeReplayVideo() {
    const replayView: any = this.$refs.replayView
    if (!replayView) return
    const $replayView = replayView.$el
    const playerSize = $replayView.getBoundingClientRect()
    const documentHeight = document.body.offsetHeight
    $replayView.style.height = `${documentHeight - playerSize.top - 50}px`
  }

  /**
   * 鼠标移入移出视频触发事件
   */
  private playEvent(val: boolean) {
    this.onCanPlay = val
  }

  /**
   * 日历获取焦点
   */
  private onCalendarFocus(val: boolean) {
    this.calendarFocus = val
  }
}
</script>
<style lang="scss" scoped>
  .replay-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    ::v-deep .replay-player {
      flex: 1;
    }
  }

  .fullscreen ::v-deep .preview-player .video-wrap, .fullscreen.replay-view {
    position: fixed;
    z-index: 1001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100% !important;
    background: #333;
  }

  .fullscreen.replay-view {
    ::v-deep .filter-container {
      display: none;
    }
  }
</style>
