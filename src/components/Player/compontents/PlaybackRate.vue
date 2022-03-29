<!-- 切换播放速率 -->
<template>
  <div v-if="player" class="control__btn control__playback">
    <span class="label">{{ playbackRate === 1 ? '倍速' : `${playbackRate}x` }}</span>
    <ul class="control__popup">
      <li
        v-for="rate in playbackRateList"
        :key="rate"
        :class="{'selected': rate === playbackRate}"
        @click="setPlaybackRate(rate)"
      >
        {{ rate }}x
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'PlaybackRate'
})
export default class extends ComponentMixin {
  private playbackRateList = [16, 8, 4, 2, 1.5, 1, 0.5, 0.25]

  private get playbackRate() {
    return this.player.playbackRate
  }

  /***
  * 切换倍速
  */
  private setPlaybackRate(playbackRate: number) {
    this.player!.setPlaybackRate(playbackRate)
  }
}
</script>
<style lang="scss" scoped>
  .control__playback {
    .control__popup {
      left: -18px;
    }
  }
</style>
