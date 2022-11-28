<template>
  <el-tooltip v-if="!currentFullscreen" content="进入全屏" placement="top">
    <div class="control__btn screen-tools__btn" @click.stop.prevent="fullscreen">
      <img class="icon" :src="require('../assets/svg/fullscreen.svg')">
    </div>
  </el-tooltip>
  <el-tooltip v-else content="退出全屏" placement="top">
    <div class="control__btn screen-tools__btn" @click.stop.prevent="exitFullscreen">
      <img class="icon" :src="require('../assets/svg/exit-fullscreen.svg')">
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'

@Component({
  name: 'Fullscreen'
})
export default class extends Vue {
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

  /**
   * 全屏
   */
  public fullscreen() {
    const element: any = this.$parent.$el
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
    const element: any = this.$parent.$el
    if (element.exitFullscreen) {
      element.exitFullscreen()
    } else if (element.msExitFullscreen) {
      element.msExitFullscreen()
    } else if (element.mozCancelFullScreen) {
      element.mozCancelFullScreen()
    } else if (element.webkitCancelFullScreen) {
      element.webkitCancelFullScreen()
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
