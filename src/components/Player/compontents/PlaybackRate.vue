<!-- 切换播放速率 -->
<template>
  <el-popover
    placement="top"
    trigger="hover"
    popper-class="player__popover"
  >
    <ul class="player__popover__panel">
      <li
        v-for="rate in playbackRateList"
        :key="rate"
        :class="{'selected': rate === playbackRate}"
        @click="setPlaybackRate(rate)"
      >
        {{ rate }}x
      </li>
    </ul>
    <div slot="reference" class="control__btn control__playback">
      <span class="label">{{ playbackRate === 1 ? '倍速' : `${playbackRate}x` }}</span>
    </div>
  </el-popover>
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
