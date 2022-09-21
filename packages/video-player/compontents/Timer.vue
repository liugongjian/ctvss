<!-- 进度条 -->
<template>
  <div v-if="duration" class="control__timer">
    {{ durationFormatInVideo(Math.floor(currentTime)) }} / {{ durationFormatInVideo(duration) }}
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Timer'
})
export default class extends ComponentMixin {
  /* 视频时长 */
  private get duration() {
    return this.player && this.player.duration
  }

  /* 当更新视频播放的当前位置 */
  private get currentTime() {
    return this.player && this.player.currentTime
  }

  /**
   * 格式化时间
   */
  private durationFormatInVideo = (duration: number) => {
    duration = Math.round(duration)
    if (duration < 60) {
      const second = duration
      return `00:${this.prefixZero(second, 2)}`
    } else if (duration < 3600) {
      const minute = Math.floor(duration / 60)
      const second = duration % 60
      return `${minute}:${this.prefixZero(second, 2)}`
    } else {
      const hour = Math.floor(duration / 3600)
      const minute = Math.floor(duration % 3600 / 60)
      const second = duration % 60
      return `${hour}:${minute}:${this.prefixZero(second, 2)}`
    }
  }

  /**
   * 前置补零
   * @param num 数字
   * @param n 位数
   */
  private prefixZero = (num: number, n: number) => {
    return (Array(n).join('0') + num).slice(-n)
  }
}
</script>
<style lang="scss" scoped>
  .control__timer {
    line-height: 35px;
    margin-left: 10px;
    font-size: 12px;
  }
</style>
