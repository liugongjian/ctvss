/**
 * 分屏管理器
 */
import { Screen } from './Screen'

interface ScreenManagerConfig {
  size: number;
  isLive: boolean;
}

export class ScreenManager {
  public screenList: Screen[]
  public currentIndex: number
  public _size: number
  public isLive: boolean
  // public pooling

  constructor(config: ScreenManagerConfig) {
    this._size = config.size
    this.isLive = config.isLive
    this.currentIndex = 0
    this.screenList = []
    for (let i = 0; i < this._size; i++) {
      const screen = new Screen()
      this.screenList.push(screen)
    }
  }

  /**
   * 获取分屏数量
  */
  public get size() {
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
