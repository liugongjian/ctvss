<!-- 截图 -->
<template>
  <el-tooltip v-if="!isFullscreen" content="进入全屏" placement="top">
    <div class="control__btn control__fullscreen" @click.stop.prevent="fullscreen">
      <svg-icon name="fullscreen" width="15px" height="15px" />
    </div>
  </el-tooltip>
  <el-tooltip v-else content="退出全屏" placement="top">
    <div class="control__btn control__exit-fullscreen" @click.stop.prevent="exitFullscreen">
      <svg-icon name="exit-fullscreen" width="15px" height="15px" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Fullscreen'
})
export default class extends ComponentMixin {
  public isFullscreen = false

  private mounted() {
    window.addEventListener('resize', this.checkFullscreen)
  }

  private destroyed() {
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 全屏
   */
  public fullscreen() {
    const element: any = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    }
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    const doc: any = document
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen()
    } else if (doc.webkitCancelFullScreen) {
      doc.webkitCancelFullScreen()
    }
  }

  /**
   * 检查是否全屏
   */
  public checkFullscreen() {
    const doc: any = document
    this.isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
  }
}
</script>
