/**
 * 分屏管理器
 */
import { Screen } from './Screen'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/storage'
import { UserModule } from '@/store/modules/user'
import { Stream } from '@vss/device/type/Device'
import { StatusEnum } from '@vss/device/enums/index'
import { pick } from 'lodash'
import { getPollList } from '@vss/device/api/dir'

interface ScreenManagerConfig {
  // inProtocol: string
  size: number
  isLive: boolean
  layout: string
  isSingle: boolean
}

const SCREEN_CACHE_KEY = {
  live: 'liveScreenCache',
  replay: 'replayScreenCache'
}
const SCREEN_CACHE_MANAGER_PARAMS = ['layout', '_size', 'currentIndex', 'isSync']
const SCREEN_CACHE_PARAMS = [
  'isLive',
  'inProtocol',
  'deviceId',
  'deviceName',
  // 'roleId',
  // 'realGroupId',
  'streamSize',
  'streams',
  'streamNum',
  'currentRecordDatetime',
  'volume',
  'isMuted',
  'playbackRate',
  'scale',
  'recordType'
]
export interface ExecuteQueueConfig {
  policy: 'autoPlay' | 'polling'
  interval: number
  status: 'pause' | 'working' | 'free'
  pageNum: number
  pageSize: number
  total: number
  query: any
  method: Function
}

export class ScreenManager {
  // public inProtocol: string
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
  /* 车辆管理隐藏部分功能 */
  public isCarTask: boolean
  /* 设备数队列（用于轮巡） */
  public devicesQueue: any[]
  public refs: any
  public executeQueueConfig: ExecuteQueueConfig
  private _size: number

  constructor(config: ScreenManagerConfig) {
    // this.inProtocol = config.inProtocol
    this.layout = config.layout
    this.view = 'screen'
    this.isLive = config.isLive
    this.isSync = false
    this.isSingle = config.isSingle
    this.isCarTask = false
    this.currentIndex = 0
    this.screenList = []
    this.devicesQueue = null
    this.refs = {}
    this.executeQueueConfig = {
      policy: 'autoPlay',
      interval: 20,
      status: 'free',
      pageNum: 1,
      pageSize: 10,
      total: Infinity,
      query: null,
      method: getPollList
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
    if (!this.isSingle && this.loadCache()) return // 读取分屏缓存
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
  public async openTreeItem(item: any, streamNum?: number, index?: number) {
    // 1）必须是IPC；2）实时预览必须设备在线
    if (item.type !== 'ipc' || (this.isLive && item.deviceStatus !== 'on')) {
      return
    }
    this.currentIndex = !isNaN(index) ? index : this.findRightIndex()
    const screen = this.screenList[this.currentIndex]
    // 如果当前分屏已有播放器，先执行销毁操作
    if (screen.deviceId) {
      screen.destroy()
    }
    this.transformDeviceParams(screen, item, streamNum)
    screen.streams = this.fillStreams(screen)
    screen.isLive = this.isLive
    screen.inProtocol = item.inVideoProtocol
    // 如果是同步向，新开的窗口使用与现在打开窗口相同的时间
    if (this.isSync) {
      const currentRecordDatetime = this.findRecordCurrentDatetime()
      if (currentRecordDatetime) screen.currentRecordDatetime = currentRecordDatetime
    }
    screen.init()
    this.currentIndex = this.findRightIndexAfterOpen()
  }

  /**
   * 参数适配转换
   * @param screen 分屏对象
   * @param data 设备数据
   * @param streamNum 指定码流
   */
  public transformDeviceParams(screen: Screen, data: any, streamNum?: number) {
    console.log('目录树信息🌲', data, streamNum)
    screen.deviceId = data.id
    screen.deviceName = data.name
    screen.streamSize = data.deviceStreamSize
    screen.streams = data.streams
    if (streamNum && !isNaN(streamNum)) {
      screen.streamNum = streamNum
    } else {
      screen.streamNum = data.deviceStreamPullIndex
    }
  }

  /**
   * 如果streams为空，需要手动补足数组
   * @param screen 分屏对象
   * @returns streams
   */
  public fillStreams(screen: Screen) {
    const streams: Stream[] = []
    if (screen.streamSize > 0 && !screen.streams.length) {
      for (let i = 0; i < screen.streamSize; i++) {
        streams.push({
          streamNum: i + 1,
          streamStatus: StatusEnum.Off
        })
      }
      return streams
    } else {
      return screen.streams
    }
  }

  /**
   * 清空所有分屏
   */
  public clearAllScreen() {
    this.screenList.forEach(screen => {
      screen.destroy()
    })
    this.currentIndex = 0
  }

  /**
   * 保存分屏至LocalStorage
   */
  public saveCache() {
    try {
      /* 判断用户是否开启缓存功能 */
      if (
        (this.isLive && UserModule.settings.screenCache.screen === 'true') ||
        (!this.isLive && UserModule.settings.screenCache.replay === 'true')
      ) {
        const screenCacheKey = this.isLive ? SCREEN_CACHE_KEY['live'] : SCREEN_CACHE_KEY['replay']
        const screenCache: any = {
          mainUserID: UserModule.mainUserID,
          ...pick(this, ...SCREEN_CACHE_MANAGER_PARAMS)
        }
        screenCache.screenList = this.screenList.map(screen => {
          return screen.deviceId ? pick(screen, ...SCREEN_CACHE_PARAMS) : null // 仅保存恢复缓存必要的数据
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
      if (screenCache.mainUserID !== UserModule.mainUserID) return false
      SCREEN_CACHE_MANAGER_PARAMS.forEach(key => {
        this[key] = screenCache[key]
      })
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
   * 清空缓存
   */
  public clearCache() {
    if (this.isLive) {
      removeLocalStorage(SCREEN_CACHE_KEY['live'])
    } else {
      removeLocalStorage(SCREEN_CACHE_KEY['replay'])
    }
  }

  /**
   * 设置所有分屏静音状态
   * 保存最后一次的静音状态
   * @param isMutedAll 是否全部静音
   */
  public toggleAllMuteStatus(isMutedAll) {
    this.screenList.forEach(screen => {
      screen.lastIsMuted = screen.isMuted
      screen.player && screen.player.toggleMuteStatus(isMutedAll)
    })
  }

  /**
   * 恢复最后一次静音状态
   */
  public restoreAllMuteStatus() {
    this.screenList.forEach(screen => {
      screen.player && screen.player.toggleMuteStatus(screen.lastIsMuted)
    })
  }

  /**
   * 同步录像时间
   * 开启“同步”操作后，将当前选中的分屏的时间同步到其他分屏
   */
  public syncReplayTime() {
    if (this.isSync) {
      this.screenList.forEach(screen => {
        if (!screen.isLive) {
          screen.recordManager && screen.recordManager.seek(this.currentScreen.currentRecordDatetime, true)
        }
      })
    }
  }

  /**
   * 切换录像时间(seek)
   */
  public changeReplayTime(time) {
    if (this.isSync) {
      this.screenList.forEach(screen => {
        if (!screen.isLive) {
          screen.recordManager && screen.recordManager.seek(time, true)
        }
      })
    } else {
      this.currentScreen.recordManager.seek(time)
    }
  }

  /**
   * 切换录像日期
   */
  public changeReplayDate(date) {
    if (this.isSync) {
      this.screenList.forEach(screen => {
        screen.recordManager && screen.recordManager.getRecordListByDate(date)
      })
    } else {
      this.currentScreen.recordManager.getRecordListByDate(date)
    }
  }

  /**
   * 切换录像类型
   */
  public changeReplayType(recordType) {
    if (this.isSync) {
      this.screenList.forEach(screen => {
        screen.recordType = recordType
        screen.recordManager && screen.init()
      })
    } else {
      this.currentScreen.recordType = recordType
      this.currentScreen.init()
    }
  }

  /**
   * 查找合适插入的分屏位置
   * 1) 如果是列表模式直接返回当前索引
   * 2) 实时预览:
   *    -- 视频播放永远使用选中态的窗口
   *    -- 点击设备时，使用选中态窗口进行播放，播放后当页面存在空窗口时，选中态自动跳到index最小的空窗口上
   *    -- 当播放页不存在空窗口时，选中态保留在当前播放窗口上
   * 3) 录像回放:
   *    -- 新播放的画面选中态保持在该窗口上，不进行跳动
   *    -- 选中态为空窗口时，使用选中态当前窗口
   *    -- 选中态为非空窗口时，如果页面存在空窗口，则使用index最小的空窗口进行播放，播放后选中态页跟随跳到新窗口；选中态为非空窗口时，如果页面不存在空窗口，则使用选中窗口播放
   * @return index
   */
  private findRightIndex(): number {
    // 如果是列表模式直接返回当前索引
    if (this.view === 'list') {
      return this.currentIndex
    }
    if (this.isLive) {
      // 视频播放永远使用选中态的窗口
      return this.currentIndex
    } else {
      // 选中态为空窗口时，使用选中态当前窗口
      if (!this.screenList[this.currentIndex].deviceId) {
        return this.currentIndex
      }
      // 选中态为非空窗口时，如果页面存在空窗口，则使用index最小的空窗口进行播放，播放后选中态页跟随跳到新窗口；选中态为非空窗口时，如果页面不存在空窗口，则使用选中窗口播放
      let count = 0
      for (let i = 0; i < this.screenList.length; i++) {
        if (!this.screenList[i].deviceId) {
          return i
        }
        count++
      }
      // 选中态为非空窗口时，如果页面存在空窗口，则使用index最小的空窗口进行播放，播放后选中态页跟随跳到新窗口；选中态为非空窗口时，如果页面不存在空窗口，则使用选中窗口播放
      if (count === this.screenList.length) {
        return this.currentIndex
      }
    }
  }

  /**
   * 在打开分屏后查找合适选中位置
   * 1) 如果是列表模式直接返回当前索引
   * 2）实时预览:
   *    -- 点击设备时，使用选中态窗口进行播放，播放后当页面存在空窗口时，选中态自动跳到index最小的空窗口上
   * 3）录像回放:
   *    -- 位置不变
   * @return index
   */
  private findRightIndexAfterOpen(): number {
    // 如果是列表模式直接返回当前索引
    if (this.view === 'list') {
      return this.currentIndex
    }
    if (this.isLive) {
      // 选中态为非空窗口时，如果页面存在空窗口，则使用index最小的空窗口进行播放，播放后选中态页跟随跳到新窗口；选中态为非空窗口时，如果页面不存在空窗口，则使用选中窗口播放
      let count = 0
      for (let i = 0; i < this.screenList.length; i++) {
        if (!this.screenList[i].deviceId) {
          return i
        }
        count++
      }
      // 选中态为非空窗口时，如果页面存在空窗口，则使用index最小的空窗口进行播放，播放后选中态页跟随跳到新窗口；选中态为非空窗口时，如果页面不存在空窗口，则使用选中窗口播放
      if (count === this.screenList.length) {
        return this.currentIndex
      }
    } else {
      return this.currentIndex
    }
  }

  /**
   * 查找首个分屏的录像播放时间
   * @returns 当前录像播放时间
   */
  private findRecordCurrentDatetime() {
    for (let i = 0; i < this.screenList.length; i++) {
      if (this.screenList[i].currentRecordDatetime) {
        return this.screenList[i].currentRecordDatetime
      }
    }
  }
}
