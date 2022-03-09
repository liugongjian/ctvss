<!-- 切换播放速率 -->
<template>
  <div v-if="player" class="control__btn control__playback">
    {{ playbackRate === 1 ? '倍速' : `${playbackRate}x` }}
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
  .control__btn .control__popup {
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

  .control__btn:hover {
    .control__popup {
      display: block;
    }
  }

  .control__btn .selected {
    color: $primary;
  }
</style>
