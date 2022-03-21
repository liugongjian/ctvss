<!-- 播放 / 暂停按钮 -->
<template>
  <div v-if="isPaused" class="control__btn" @click="play">
    <svg-icon name="play" width="16px" height="16px" />
  </div>
  <div v-else class="control__btn" @click="pause">
    <svg-icon name="pause" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'PlayPause'
})
export default class extends ComponentMixin {
  /* 是否暂停状态 */
  private get isPaused() {
    return this.player && this.player.isPaused
  }

  /**
   * 播放
   */
  private play() {
    this.player!.play()
  }

  /**
   * 暂停
   */
  private pause() {
    this.player!.pause()
  }
}
</script>
