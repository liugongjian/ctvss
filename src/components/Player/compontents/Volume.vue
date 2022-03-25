<!-- 音量控制按钮 -->
<template>
  <div v-if="hasAudio" class="control__btn volume">
    <span @click="toggleMuteStatus">
      <svg-icon v-if="isMuted || volume === 0" name="mute" width="18px" height="18px" />
      <svg-icon v-else name="volume" width="18px" height="18px" />
    </span>
    <div v-if="player && !isMuted && !isH265" class="control__popup control__volume">
      <el-slider
        :max="1"
        :step="0.01"
        :value="volume"
        :show-tooltip="false"
        class="volume"
        vertical
        height="165px"
        @input="setVolume"
      />
    </div>
  </div>
  <div v-else class="control__btn unloaded__volume">
    <svg-icon name="mute" class="mute_gray" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Volume'
})
export default class extends ComponentMixin {
  private get hasAudio() {
    return this.player && this.player.hasAudio
  }

  private get isMuted() {
    return this.player && this.player.isMuted
  }

  private get volume() {
    return this.player.volume
  }

  private get isH265() {
    return this.player && this.player.type === 'h265'
  }

  /**
   * 控制音量
   */
  private setVolume(volume: number) {
    this.player!.setVolume(volume)
  }

  /***
   * 切换静音状态
   */
  private toggleMuteStatus() {
    this.player!.toggleMuteStatus(!this.isMuted)
  }
}
</script>
<style lang="scss" scoped>
  .volume {
    ::v-deep .el-slider.is-vertical .el-slider__runway {
      margin: 0 auto;
      background-color: gray;
    }

    ::v-deep .el-slider__bar {
      background-color: aliceblue;
    }
  }

  .mute_gray {
    opacity: 0.4;
    color: aliceblue;
  }

  .unloaded__volume {
    cursor: not-allowed !important; //优先级
  }

  .control__volume {
    min-width: 35px;
  }
</style>
