/**
 * 分屏管理器
 */
import { Screen } from './Screen'
import { Device } from '@/type/device'

interface ScreenManagerConfig {
  size: number;
  isLive: boolean;
}

export class ScreenManager {
  public screenList: Screen[]
  public currentIndex: number
  public _size: number
  public isLive: boolean
  /* 录像时间轴同步向 */
  public isSync: boolean
  /* 设备数队列（用于轮巡） */
  public devicesQueue: Device[]
  public refs: any
  // public pooling

  constructor(config: ScreenManagerConfig) {
    this._size = config.size
    this.isLive = config.isLive
    this.isSync = false
    this.currentIndex = 0
    this.screenList = []
    for (let i = 0; i < this._size; i++) {
      const screen = new Screen()
      this.screenList.push(screen)
    }
    this.devicesQueue = null
    this.refs = {}
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
