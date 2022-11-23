<!-- 音量控制按钮 -->
<template>
  <el-popover
    placement="top"
    trigger="hover"
    popper-class="player__popover"
    :disabled="!hasAudio || isMuted || isH265"
    @after-enter="enterPopover"
    @after-leave="leavePopover"
  >
    <div class="player__popover__panel volume__panel">
      <el-slider
        :max="1"
        :step="0.01"
        :value="volume"
        :show-tooltip="false"
        class="volume"
        vertical
        height="80px"
        @input="setVolume"
      />
    </div>
    <template slot="reference">
      <div v-if="hasAudio" class="control__btn control__volume">
        <span class="control__btn__span" @click="toggleMuteStatus">
          <img v-if="isMuted || volume === 0" class="icon" :src="require('../assets/svg/mute.svg')">
          <img v-else class="icon" :src="require('../assets/svg/volume.svg')">
        </span>
      </div>
      <div v-else class="control__btn unloaded__volume">
        <img class="icon mute_gray" :src="require('../assets/svg/mute.svg')">
      </div>
    </template>
  </el-popover>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'
import { CodecEnum } from '../enums'

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
    return this.player && this.player.codec === CodecEnum.H265 && this.player.type !== 'flv'
  }

  /**
   * 控制音量
   */
  private setVolume(volume: number) {
    this.player?.setVolume(volume)
  }

  /***
   * 切换静音状态
   */
  private toggleMuteStatus() {
    this.player?.toggleMuteStatus(!this.isMuted)
  }
}
</script>
<style lang="scss" scoped>
  .volume__panel {
    padding: 7px 0;

    ::v-deep .el-slider.is-vertical .el-slider__runway {
      margin: 0 10px;
      background-color: gray;
      width: 4px;
    }

    ::v-deep .el-slider__bar {
      background-color: aliceblue;
      width: 4px;
    }

    ::v-deep .el-slider__button {
      width: 10px;
      height: 10px;
      border: none;
    }

    ::v-deep .el-slider__button-wrapper {
      left: -16px;
    }
  }

  .mute_gray {
    opacity: 0.4;
    color: aliceblue;
  }

  .unloaded__volume {
    cursor: not-allowed !important; //优先级
  }
</style>
