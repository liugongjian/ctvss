import { Component, Vue } from 'vue-property-decorator'

@Component
export default class FullscreenMixin extends Vue {
  public isFullscreen = false

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
