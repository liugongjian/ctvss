import { Component, Mixins } from 'vue-property-decorator'
import IndexMixin from './indexMixin'
import FullscreenMixin from './fullscreenMixin'
import { Screen } from '../models/Screen/Screen'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'
import { UserModule } from '@/store/modules/user'

@Component
export default class ScreenMixin extends Mixins(IndexMixin, FullscreenMixin) {
  public maxSize = 4
  // public currentIndex = 0
  public dialogs = {
    deviceDir: false
  }
  public screenSize = '4'
  public screenSizeList = [
    {
      label: '1分屏',
      value: '1'
    },
    {
      label: '3分屏',
      value: '3'
    },
    {
      label: '4分屏',
      value: '4'
    },
    {
      label: '9分屏',
      value: '9'
    },
    {
      label: '16分屏',
      value: '16'
    },
    {
      label: '32分屏',
      value: '32'
    },
    {
      label: '1+3分屏',
      value: '1_3'
    },
    {
      label: '1+5分屏',
      value: '1_5'
    },
    {
      label: '1+7分屏',
      value: '1_7'
    },
    {
      label: '1+15分屏',
      value: '1_15'
    }
  ]

  public replayScreenSizeList = [
    {
      label: '1分屏',
      value: '1'
    },
    {
      label: '2分屏',
      value: '2'
    },
    {
      label: '3分屏',
      value: '3'
    },
    {
      label: '4分屏',
      value: '4'
    },
    {
      label: '9分屏',
      value: '9'
    },
    {
      label: '16分屏',
      value: '16'
    },
    {
      label: '32分屏',
      value: '32'
    },
    {
      label: '1+3分屏',
      value: '1_3'
    },
    {
      label: '1+5分屏',
      value: '1_5'
    },
    {
      label: '1+7分屏',
      value: '1_7'
    },
    {
      label: '1+15分屏',
      value: '1_15'
    }
  ]

  /**
   * 初始化分屏
   */
  public initScreen() {

  }

  /**
   * 初始化储存播放记录
   */
  public initScreenCache() {

  }

  public setScreenCache() {

  }

  /**
   * screen的currentTime改变
   */
  public onCurrentTimeChange(screen: any, params: any) {
    if (screen) {
      screen.currentTime = params.currentTime
      if (params.resetIsCache) {
        screen.isCache = false
      }
    }
  }

  /**
   * screen的currentDate改变
   */
  public onCurrentDateChange(screen: any, val: number) {
    if (screen) {
      screen.currentDate = val
    }
  }

  /**
   * screen的replayType改变
   */
  public onReplayTypeChange(screen: any, val: string) {
    if (screen) {
      screen.replayType = val
    }
  }

  /**
   * 切换分屏数量
   */
  public handleScreenSize(size: String) {
    switch (size) {
      case '1':
        this.maxSize = 1
        this.screenSize = '1'
        break
      case '2':
        this.maxSize = 2
        this.screenSize = '2'
        break
      case '3':
        this.maxSize = 3
        this.screenSize = '3'
        break
      case '4':
        this.maxSize = 4
        this.screenSize = '4'
        break
      case '9':
        this.maxSize = 9
        this.screenSize = '9'
        break
      case '16':
        this.maxSize = 16
        this.screenSize = '16'
        break
      case '32':
        this.maxSize = 32
        this.screenSize = '32'
        break
      case '1_3':
        this.maxSize = 4
        this.screenSize = '1_3'
        break
      case '1_5':
        this.maxSize = 6
        this.screenSize = '1_5'
        break
      case '1_7':
        this.maxSize = 8
        this.screenSize = '1_7'
        break
      case '1_15':
        this.maxSize = 16
        this.screenSize = '1_15'
        break
      default:
        break
    }
    if (this.currentIndex >= this.maxSize) {
      this.currentIndex = this.maxSize - 1
    }
    this.initScreen()
  }
  // public changeMaxSize(size: number) {
  //   this.maxSize = size
  //   if (this.currentIndex >= this.maxSize) {
  //     this.currentIndex = this.maxSize - 1
  //   }
  //   this.initScreen()
  // }

  // /**
  //  * 检查是否全屏
  //  */
  // public checkFullscreen() {
  //   const doc: any = document
  //   this.isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
  //   if (!this.isFullscreen) {
  //     this.screenList.forEach((screen: Screen) => {
  //       screen.exitFullscreen()
  //     })
  //   }
  // }

  // /**
  //  * 检查设备树中的设备项是否选择
  //  */
  // public checkTreeItemStatus(item: any) {
  //   if (item.type !== 'ipc' && item.type !== 'stream') return false
  //   return !!this.screenList.find(screen => screen.deviceId === item.id)
  // }

  /**
   * 选择视频
   * @param screen 视频
   */
  public selectDevice() {
    this.dialogs.deviceDir = true
  }

  // /**
  //  * 鼠标移入移出视频触发事件
  //  */
  // private playEvent(screen: any, val: boolean) {
  //   screen.onCanPlay = val
  // }

  /**
   * 日历获取焦点
   */
  public onCalendarFocus(screen: any, val: boolean) {
    screen.calendarFocus = val
  }

  /**
   * 播放器音量变化回调
   */
  public onVolumeChange(screen: Screen, volume: number) {
    screen.volume = volume
  }
}
