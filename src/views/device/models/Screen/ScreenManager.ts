/**
 * 分屏管理器
 */
import { Screen } from './Screen'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/storage'
import { UserModule } from '@/store/modules/user'
import { pick } from 'lodash'

interface ScreenManagerConfig {
  inProtocol: string;
  size: number;
  isLive: boolean;
  layout: string;
}

const SCREEN_CACHE_KEY = {
  live: 'liveScreenCache',
  replay: 'replayScreenCache'
}

const SCREEN_CACHE_PARAMS = ['isLive', 'inProtocol', 'deviceId', 'deviceName', 'roleId', 'realGroupId', 'streamSize', 'streams', 'streamNum', 'currentRecordDatetime']
export interface ExecuteQueueConfig {
  policy: 'autoPlay' | 'polling';
  interval: number;
  status: 'pause' | 'working' | 'free'
}

export class ScreenManager {
  public inProtocol: string
  public screenList: Screen[]
  public currentIndex: number
  public layout: string
  /* 视图：分屏、列表 */
  public view: 'screen' | 'list'
  public isLive: boolean
  /* 录像时间轴同步向 */
  public isSync: boolean
  /* 是否只需要单窗口（用于设备管理播放） */
  public isSingle: boolean
  /* 设备数队列（用于轮巡） */
  public devicesQueue: any[]
  public refs: any
  public executeQueueConfig: ExecuteQueueConfig
  private _size: number

  constructor(config: ScreenManagerConfig) {
    this.inProtocol = config.inProtocol
    this.layout = config.layout
    this.view = 'screen'
    this.isLive = config.isLive
    this.isSync = false
    this.isSingle = false
    this.currentIndex = 0
    this.screenList = []
    this.devicesQueue = null
    this.refs = {}
    this.executeQueueConfig = {
      policy: 'autoPlay',
      interval: 10,
      status: 'free'
    }
    this._size = config.size
    this.initScreenList()
  }

  /**
   * 获取分屏数量
  */
  public get size(): number {
    return this._size
  }

  /**
   * 设置分屏数量
   * 设置完成后更新screenList数组
   */
  public set size(size: number) {
    this._size = size
    let startIndex = 0
    if (this.screenList.length) {
      this.screenList = this.screenList.slice(0, this._size)
      startIndex = this.screenList.length
    }
    for (let i = startIndex; i < this._size; i++) {
      const screen = new Screen()
      this.screenList.push(screen)
    }
  }

  /**
   * 状态信息
   */
  public get screenManagerStatus() {
    return {
      executeQueueConfig: this.executeQueueConfig
    }
  }

  /**
   * 当前分屏
   */
  public get currentScreen() {
    return this.screenList[this.currentIndex]
  }

  /**
   * 初始化屏幕列表
  */
  public initScreenList() {
    this.screenList = []
    this.currentIndex = 0
    if (this.loadCache()) return // 读取分屏缓存
    for (let i = 0; i < this._size; i++) {
      const screen = new Screen()
      this.screenList.push(screen)
    }
  }

  /**
   * 打开树节点
   * @param item 树Item
   * @param streamNum 第几路流
   */
  public async openTreeItem(item: any, streamNum?: number) {
    // 1）必须是IPC；2）实时预览必须设备在线
    if (item.type !== 'ipc' || (this.isLive && item.deviceStatus !== 'on')) {
      return
    }
    this.currentIndex = this.findRightIndex()
    const screen = this.screenList[this.currentIndex]
    // 如果当前分屏已有播放器，先执行销毁操作
    if (screen.deviceId) {
      screen.destroy()
    }
    screen.isLive = this.isLive
    screen.inProtocol = this.inProtocol
    screen.deviceId = item.id
    screen.deviceName = item.label
    screen.roleId = item.roleId || ''
    screen.realGroupId = item.realGroupId || ''
    // screen.realGroupInProtocol = item.realGroupInProtocol || ''
    screen.streamSize = item.multiStreamSize
    screen.streams = item.deviceStreams
    if (streamNum && !isNaN(streamNum)) {
      screen.streamNum = streamNum
    } else {
      screen.streamNum = item.autoStreamNum
    }
    screen.init()
  }

  /**
   * 保存分屏至LocalStorage
   */
  public saveCache() {
    try {
      /* 判断用户是否开启缓存功能 */
      if ((this.isLive && UserModule.settings.screenCache.screen === 'true') ||
        (!this.isLive && UserModule.settings.screenCache.replay === 'true')) {
        const screenCacheKey = this.isLive ? SCREEN_CACHE_KEY['live'] : SCREEN_CACHE_KEY['replay']
        const screenCache: any = {
          mainUserID: UserModule.mainUserID,
          layout: this.layout,
          size: this._size
        }
        screenCache.screenList = this.screenList.map(screen => {
          return pick(screen, ...SCREEN_CACHE_PARAMS) // 仅保存恢复缓存必要的数据
        })
        setLocalStorage(screenCacheKey, screenCache)
      } else {
        /* 如果用户关闭缓存功能需要删除之前存的记录 */
        UserModule.settings.screenCache.screen !== 'true' && removeLocalStorage(SCREEN_CACHE_KEY['live'])
        UserModule.settings.screenCache.replay !== 'true' && removeLocalStorage(SCREEN_CACHE_KEY['replay'])
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 读取缓存
   * @returns 是否存在缓存并成功返回
   */
  public loadCache(): boolean {
    try {
      const screenCacheKey = this.isLive ? SCREEN_CACHE_KEY['live'] : SCREEN_CACHE_KEY['replay']
      const screenCacheStr = getLocalStorage(screenCacheKey)
      if (!screenCacheStr) return false
      const screenCache = JSON.parse(screenCacheStr)
      console.log('screenCache', screenCache)
      this.layout = screenCache.layout
      this._size = screenCache.size
      this.screenList = []
      for (let i = 0; i < this._size; i++) {
        let screen = new Screen()
        screen = Object.assign(screen, { ...screenCache.screenList[i] })
        screen.init()
        this.screenList.push(screen)
      }
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 设置所有分屏静音状态
   * @param isMutedAll 是否全部静音
   */
  public toggleAllMuteStatus(isMutedAll) {
    this.screenList.forEach(screen => {
      screen.player && screen.player.toggleMuteStatus(isMutedAll)
    })
  }

  /**
   * 查找合适插入的分屏位置
   * 1) 判断当前选中的位置是否为空，如果为空则插入
   * 2) 然后，优先查找没有占用的位置(无DeviceId)
   * 3) 最后，如果全部占满，从选中位置开始重新循环插入，如果当前位置为最后位置，则重第一个重新开始
   * @return index
   */
  private findRightIndex(): number {
    // Step1
    if (!this.screenList[this.currentIndex].deviceId) {
      return this.currentIndex
    }
    // Step2
    for (let i = 0; i < this.screenList.length; i++) {
      if (!this.screenList[i].deviceId) {
        return i
      }
    }
    // Step3
    if (this.currentIndex === this.screenList.length - 1) {
      return 0
    } else {
      return this.currentIndex + 1
    }
  }
}
