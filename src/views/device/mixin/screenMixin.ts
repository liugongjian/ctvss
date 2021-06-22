import { Component, Mixins } from 'vue-property-decorator'
import DeviceMixin from './deviceMixin'
import FullscreenMixin from './fullscreenMixin'
import Screen from '../models/Screen'

@Component
export default class ScreenMixin extends Mixins(DeviceMixin, FullscreenMixin) {
  public screenList: Array<Screen> = []
  public maxSize = 4
  public currentIndex = 0
  public dialogs = {
    deviceDir: false
  }

  /**
   * 初始化分屏
   */
  public initScreen() {
    let screenList: Array<Screen> = []
    let startIndex = 0
    if (this.screenList.length) {
      screenList = this.screenList.slice(0, this.maxSize)
      startIndex = screenList.length
    }
    for (let i = startIndex; i < this.maxSize; i++) {
      const screen = new Screen()
      screenList.push(screen)
    }
    this.screenList = screenList
  }

  /**
   * 切换分屏数量
   */
  public changeMaxSize(size: number) {
    this.maxSize = size
    if (this.currentIndex >= this.maxSize) {
      this.currentIndex = this.maxSize - 1
    }
    this.initScreen()
  }

  /**
   * 检查是否全屏
   */
  public checkFullscreen() {
    const doc: any = document
    this.isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
    if (!this.isFullscreen) {
      this.screenList.forEach((screen: Screen) => {
        screen.exitFullscreen()
      })
    }
  }

  /**
   * 检查设备树中的设备项是否选择
   */
  public checkTreeItemStatus(item: any) {
    if (item.type !== 'ipc' && item.type !== 'stream') return false
    return !!this.screenList.find(screen => screen.deviceId === item.id)
  }

  /**
   * 选择分屏
   */
  public async selectScreen(index: number) {
    this.currentIndex = index
  }

  /**
   * 选择视频
   * @param screen 视频
   */
  public selectDevice() {
    this.dialogs.deviceDir = true
  }

  /**
   * 鼠标移入移出视频触发事件
   */
  private playEvent(screen: any, val: boolean) {
    screen.onCanPlay = val
  }

  /**
   * 日历获取焦点
   */
  public onCalendarFocus(screen: any, val: boolean) {
    screen.calendarFocus = val
  }
}
