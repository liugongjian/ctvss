<template>
  <el-dialog
    title="录像回放"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    fullscreen
    class="video-player"
    @close="closeDialog"
  >
    <player
      v-if="dialogVisible"
      ref="video"
      :class="{'fullscreen': isFullscreen}"
      :type="type"
      :codec="video.video.codec"
      :url="video.playUrl.hlsUrl"
      :auto-play="true"
      :has-control="false"
      :has-progress="true"
      :is-fullscreen="isFullscreen"
      @onFullscreen="fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import FullscreenMixin from '../../mixin/fullscreenMixin'
import Player from '@/components/Player/index.vue'

@Component({
  name: 'ReplayPlayer',
  components: {
    Player
  }
})
export default class extends Mixins(FullscreenMixin) {
  @Prop()
  private video?: any

  private dialogVisible = true
  private currentTime?: Date | null = null
  private dateFormat = dateFormat

  private get type() {
    return this.video.video.codec === 'h264' ? 'hls' : 'h265-hls'
  }

  @Watch('isFullscreen')
  private isFullscreenChange(val: boolean) {
    const $model: any = document.querySelector('.v-modal')
    $model.style.display = val ? 'none' : 'block'
  }

  private mounted() {
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.checkFullscreen)
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
  .video-player {
    margin: 3%;
    ::v-deep .el-dialog {
      display: flex;
      flex-direction: column;
    }
    ::v-deep .el-dialog__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-top: 10px;
    }
    .video-wrap {
      flex: 1;
    }
  }

  ::v-deep .video-wrap {
    width: 100%;
    position: relative;
    flex: 1;
    video {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #000;
    }
  }

  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    height: 100%;
  }
</style>
