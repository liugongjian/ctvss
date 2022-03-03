<!-- 播放 / 暂停按钮 -->
<template>
  <div v-if="isPaused" class="controls__btn" @click="play">
    <svg-icon name="play" width="16px" height="16px" />
  </div>
  <div v-else class="controls__btn" @click="pause">
    <svg-icon name="pause" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { Player } from './models/Player'

@Component({
  name: 'PlayPause'
})
export default class extends Vue {
  @Inject('getPlayer')
  private getPlayer: any

  private get player(): Player {
    return this.getPlayer()
  }

  /* 是否暂停 */
  private isPaused = true

  /**
   * 监听播放器是否创建
   */
  @Watch('player')
  private onPlayerCreate() {
    console.log('onPlayerCreate')
    this.player.config.onPlay = this.onStatusChange
    this.player.config.onPause = this.onStatusChange
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

  /**
   * 回调事件
   * 当播放状态变更
   */
  private onStatusChange() {
    this.isPaused = this.player.isPaused
  }
}
</script>
