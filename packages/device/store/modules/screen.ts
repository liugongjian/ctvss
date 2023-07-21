import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'
import { FullscreenTypeEnum } from '@vss/device/enums/screen'

export interface IScreenState {
  isMutedAll?: boolean
  isFullscreen?: boolean
  fullscreenStack?: FullscreenTypeEnum[]
  playingScreens?: string[]
}

@Module({ dynamic: true, store, name: 'screen' })
export class Screen extends VuexModule implements IScreenState {
  isMutedAll = false
  isFullscreen = false
  fullscreenStack = []
  playingScreens = []

  @Mutation
  public SET_IS_MUTED_ALL(payload: boolean) {
    this.isMutedAll = payload
  }

  @Action
  public setIsMutedAll(payload: boolean) {
    this.SET_IS_MUTED_ALL(payload)
  }

  @Mutation
  public SET_IS_FULLSCREEN(payload: boolean) {
    this.isFullscreen = payload
  }

  @Action
  public setIsFullscreen(payload: boolean) {
    this.SET_IS_FULLSCREEN(payload)
  }

  /**
   * 设置全屏栈
   * @param payload 
   */
  @Mutation
  public PUSH_FULLSCREEN_STACK(payload: FullscreenTypeEnum) {
    this.fullscreenStack.push(payload)
  }

  @Action
  public pushFullscreenStack(payload: FullscreenTypeEnum) {
    this.PUSH_FULLSCREEN_STACK(payload)
  }

  @Mutation
  public POP_FULLSCREEN_STACK(): FullscreenTypeEnum {
    return this.fullscreenStack.pop()
  }

  @Action
  public popFullscreenStack(): FullscreenTypeEnum {
    return this.POP_FULLSCREEN_STACK()
  }

  @Mutation
  public RESET_FULLSCREEN_STACK() {
    return this.fullscreenStack = []
  }

  @Action
  public resetFullscreenStack() {
    return this.RESET_FULLSCREEN_STACK()
  }

  /**
   * 添加正在播放中的设备
   * @param deviceId 设备ID
   */
  @Mutation
  public SET_PLAYING_SCREENS(payload: string[]) {
    this.playingScreens = payload
  }

  @Action
  public addPlayingScreen(deviceId: string) {
    if (!this.playingScreens.includes(deviceId)) {
      this.SET_PLAYING_SCREENS([...this.playingScreens, deviceId])
    }
  }

  /**
   * 删除正在播放中的设备
   * @param deviceId 设备ID
   */
  @Action
  public removePlayingScreen(deviceId: string) {
    const index = this.playingScreens.indexOf(deviceId)
    if (index > -1) {
      const playingScreens = [...this.playingScreens]
      playingScreens.splice(index, 1)
      this.SET_PLAYING_SCREENS(playingScreens)
    }
  }

  /**
   * 清空正在播放的设备列表
   */
  @Action
  public clearPlayingScreen() {
    this.SET_PLAYING_SCREENS([])
  }
}

export const ScreenModule = getModule(Screen)
