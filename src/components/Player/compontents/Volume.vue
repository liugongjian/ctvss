<!-- 音量控制按钮 -->
<template>
  <div>
    <div v-if="hasAudio" class="control__btn volume">
      <span @click="toggleMuteStatus">
        <svg-icon v-if="isMuted || volume === 0" name="mute" width="18px" height="18px" />
        <svg-icon v-else name="volume" width="18px" height="18px" />
      </span>
      <div v-if="player && !isMuted" class="control__popup control__volume">
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
    margin-top: 10px;
    margin-bottom: 10px;
    color: aliceblue;

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

  .control {
    * {
      user-select: none;
    }

    position: absolute;
    z-index: 15;
    bottom: 0 4px;
    left: 0 4px;
    width: 100%;
    height: 35px;
    background: rgba(0, 0, 0, 70%);
    color: #fff;
    opacity: 1;
    transition: opacity 0.2s;

    &__btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      height: 35px;
      font-size: 12px;
      cursor: pointer;

      .control__popup {
        display: none;
        position: absolute;
        bottom: 34px;
        left: -10px;
        margin: auto 0;
        padding: 5px 0;
        min-width: 50px;
        list-style: none;
        background: rgba(0, 0, 0, 70%);

        li {
          margin: 0;
          padding: 5px 15px;
          list-style: none;

          &:hover {
            background: #444;
          }

          &.selected {
            color: $primary;
          }
        }
      }

      .control__volume {
        min-width: 35px;
      }

      &:hover {
        .control__popup {
          display: block;
        }
      }

      &.selected {
        color: $primary;
      }
    }
  }

</style>
