import { Component, Mixins } from 'vue-property-decorator'
import IndexMixin from './indexMixin'
import FullscreenMixin from './fullscreenMixin'
import Screen from '../models/Screen'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'
import { UserModule } from '@/store/modules/user'

@Component
export default class ScreenMixin extends Mixins(IndexMixin, FullscreenMixin) {
  public screenList: Array<Screen> = []
  public maxSize = 4
  public currentIndex = 0
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
    }
    // {
    //   label: '1+15分屏',
    //   value: '1_15'
    // }
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
      label: '4分屏',
      value: '4'
    }
  ]

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
   * 初始化储存播放记录
   */
  public initScreenCache(type: string) {
    // 判断是否启用视频记录保存配置
    if (!getLocalStorage('settings') || !(JSON.parse(getLocalStorage('settings')).screenCache[type] === 'true')) {
      return
    }
    // 针对页面刷新存储播放记录
    window.addEventListener('beforeunload', () => this.setScreenCache({ params: type }))
    if (this.screenCache[this.$route.name]!.screenSize) {
      this.handleScreenSize(this.screenCache[this.$route.name]!.screenSize)
      this.initScreen()
    }
    // screen.vue、replay.vue在watche监听到currentGroupId变化时会reset各个screen，故须在reset之后初始化
    this.$nextTick(() => {
      this.screenList.forEach((screen, index) => {
        let cacheScreen = this.screenCache[this.$route.name]!.screenList[index]
        if (cacheScreen && cacheScreen.deviceId) {
          screen.deviceId = cacheScreen.deviceId
          screen.inProtocol = cacheScreen.inProtocol || this.currentGroup!.inProtocol
          screen.realGroupInProtocol = cacheScreen.realGroupInProtocol || ''
          screen.streamNum = cacheScreen.streamNum
          screen.roleId = cacheScreen.roleId
          screen.realGroupId = cacheScreen.realGroupId
          screen.isLive = cacheScreen.isLive
          screen.replayType = cacheScreen.replayType
          screen.currentDate = cacheScreen.currentDate
          screen.currentTime = cacheScreen.currentTime
          screen.isCache = cacheScreen.isCache
          screen.getUrl()
        }
      })
    })
  }

  public get screenCache() {
    // 判断观看记录是否存在且当前用户是否与观看记录对应
    if (getLocalStorage('screenCache') && JSON.parse(getLocalStorage('screenCache')).mainUserID === UserModule.mainUserID) {
      return JSON.parse(getLocalStorage('screenCache'))
    } else {
      return {
        mainUserID: null,
        screen: {
          screenList: [],
          screenSize: '4'
        },
        replay: {
          screenList: [],
          screenSize: '1'
        }
      }
    }
  }

  public setScreenCache(params: any) {
    let cacheType = params.type || this.$route.name
    this.screenCache.mainUserID = UserModule.mainUserID
    this.screenCache[cacheType] = {
      ...this.screenCache[cacheType],
      screenList: this.screenList.map(screen => {
        return {
          ...screen,
          isCache: true
        }
      }),
      screenSize: this.screenSize
    }
    setLocalStorage('screenCache', JSON.stringify(this.screenCache))
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
