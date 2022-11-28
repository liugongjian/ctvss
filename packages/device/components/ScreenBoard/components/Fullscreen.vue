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
import { FullscreenTypeEnum } from '@vss/device/enums/screen'
import { ScreenModule } from '@vss/device/store/modules/screen'

@Component({
  name: 'Fullscreen'
})
export default class extends Vue {
  @Prop()
  public isFullscreen

  @Prop()
  public type: FullscreenTypeEnum

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
    if (this.type) {
      ScreenModule.pushFullscreenStack(this.type)
    }
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
   * 进入全屏时在全屏栈中存入当前分屏类型，退出后pop栈，如果剩下的栈不为空则只将当前分屏全屏模式设为false，不真正退出全屏。
   * 此逻辑为了满足此种场景：先进入Screen Board工具栏的全屏，然后再进入单个分屏全屏，然后再退出单个分屏全屏。 
   */
  public exitFullscreen() {
    if (this.type === FullscreenTypeEnum.Screen) {
      ScreenModule.popFullscreenStack()
      if (ScreenModule.fullscreenStack.length) {
        this.currentFullscreen = false
        return false
      }
    } else {
      ScreenModule.resetFullscreenStack()
    }

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
      // 按ESC退出全屏时直接清空栈
      ScreenModule.resetFullscreenStack()
    }
  }
}
</script>
