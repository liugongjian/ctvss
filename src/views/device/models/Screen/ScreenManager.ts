/**
 * 分屏管理器
 */
import { Screen } from './Screen'

interface ScreenManagerConfig {
  size: number;
  isLive: boolean;
  layout: string;
}

export interface ExecuteQueueConfig {
  policy: 'autoPlay' | 'polling';
  interval: number;
  status: 'pause' | 'working' | 'free'
}

export class ScreenManager {
  public screenList: Screen[]
  public currentIndex: number
  public layout: string
  private _size: number
  public isLive: boolean
  /* 录像时间轴同步向 */
  public isSync: boolean
  /* 设备数队列（用于轮巡） */
  public devicesQueue: any[]
  public refs: any
  public executeQueueConfig: ExecuteQueueConfig

  constructor(config: ScreenManagerConfig) {
    this._size = config.size
    this.layout = config.layout
    this.isLive = config.isLive
    this.isSync = false
    this.currentIndex = 0
    this.screenList = []
    this.devicesQueue = null
    this.refs = {}
    this.executeQueueConfig = {
      policy: 'autoPlay',
      interval: 10,
      status: 'free'
    }
    this.initScreenList()
  }

  public get screenManagerStatus() {
    return {
      executeQueueConfig: this.executeQueueConfig
    }
  }

  /**
   * 获取分屏数量
  */
  public initScreenList() {
    for (let i = 0; i < this._size; i++) {
      const screen = new Screen()
      this.screenList.push(screen)
    }
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
}
