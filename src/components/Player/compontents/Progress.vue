<!-- 进度条 -->
<template>
  <div
    v-if="duration"
    ref="progress"
    class="control__progress"
    :class="{'moving': progressMoveData.isStart}"
    @mousedown="progressHandle($event)"
  >
    <div class="control__progress__bar">
      <div class="control__progress__buffered" :style="`width: ${bufferedRate}%`" />
      <div class="control__progress__played" :style="`width: ${progressRate}%`" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Progress'
})
export default class extends ComponentMixin {
  /* 进度条拖拽状态 */
  private progressMoveData: any = {
    isStart: false,
    x: null,
    width: null
  }

  /* 视频时长 */
  private get duration() {
    return this.player && this.player.duration
  }

  /* 当更新视频播放的当前位置 */
  private get currentTime() {
    return this.player && this.player.currentTime
  }

  /* 视频预加载时长 */
  private get bufferedTime() {
    return this.player && this.player.bufferedTime
  }

  /* 当前位置和视频时长比例 */
  private get progressRate() {
    if (this.currentTime && this.duration) {
      return this.currentTime / this.duration * 100
    } else {
      return 0
    }
  }

  /* 预加载时长和视频时长比例 */
  private get bufferedRate() {
    if (this.bufferedTime && this.duration) {
      return this.bufferedTime / this.duration * 100
    } else {
      return 0
    }
  }

  /**
   * 鼠标点击进度条
   */
  private progressHandle() {
    const $progress: any = this.$refs.progress
    const progressSize = $progress.getBoundingClientRect()
    this.progressMoveData.x = progressSize.left
    this.progressMoveData.width = progressSize.width
    this.progressMoveData.isStart = true
    window.addEventListener('mousemove', this.progressMouseMove)
    window.addEventListener('mouseup', this.progressMouseUp)
  }

  /**
   * 拖拽进度条
   */
  private progressMouseMove(event: MouseEvent) {
    if (!this.progressMoveData.isStart) return
    const offsetX = event.x - this.progressMoveData.x
    const rate = offsetX / this.progressMoveData.width
    const startTime = rate * this.duration
    this.progressSeek(startTime)
  }

  /**
   * 拖拽进度条后抬起鼠标
   */
  private progressMouseUp(event: MouseEvent) {
    this.progressMouseMove(event)
    this.progressMoveData.isStart = false
    window.removeEventListener('mousemove', this.progressMouseMove)
    window.removeEventListener('mouseup', this.progressMouseUp)
  }

  /**
   * 进度条跳转视频位置
   */
  private progressSeek(startTime: number) {
    this.player.currentTime = startTime
    this.player.seek(startTime)
  }
}
</script>
<style lang="scss" scoped>
  .control__progress {
    position: absolute;
    width: 100%;
    top: -13px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;

    &__bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 20%);
    }

    &__buffered {
      position: absolute;
      height: 4px;
      background: rgba(255, 255, 255, 30%);
      transition: width 100ms;
    }

    &__played {
      position: absolute;
      height: 4px;
      background: $lightGray;

      &:after {
        content: ' ';
        position: absolute;
        width: 12px;
        height: 12px;
        background: $lightGray;
        border-radius: 100%;
        right: -5px;
        top: -4px;
        opacity: 0;
        transition: opacity 100ms;
      }
    }

    &:hover,
    &.moving {
      .control__progress__played:after {
        opacity: 1;
      }
    }
  }
</style>
