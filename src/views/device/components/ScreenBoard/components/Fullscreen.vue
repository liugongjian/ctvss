<template>
  <el-tooltip v-if="!currentFullscreen" content="进入全屏" placement="top">
    <div class="control__btn screen-tools__btn" @click.stop.prevent="fullscreen">
      <svg-icon name="fullscreen" />
    </div>
  </el-tooltip>
  <el-tooltip v-else content="退出全屏" placement="top">
    <div class="control__btn screen-tools__btn" @click.stop.prevent="exitFullscreen">
      <svg-icon name="exit-fullscreen" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Watch, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'Fullscreen'
})
export default class extends Vue {
  @Prop()
  public isFullscreen

  private currentFullscreen = false

  private mounted() {
    document.addEventListener('fullscreenchange', this.checkFullscreen)
  }

  private destroyed() {
    document.removeEventListener('fullscreenchange', this.checkFullscreen)
  }

  @Watch('currentFullscreen')
  private onFullscreenChange() {
    this.$emit('change', this.currentFullscreen)
  }

  @Watch('isFullscreen', {
    immediate: true
  })
  private onIsFullscreenChange() {
    this.currentFullscreen = this.isFullscreen
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
    this.currentFullscreen = true
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
    if (!document.fullscreenElement) {
      this.currentFullscreen = false
    }
  }
}
</script>
