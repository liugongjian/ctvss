import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'

export interface IScreenState {
  isMutedAll?: boolean
  isFullscreen?: boolean
  playingScreens?: string[]
}

@Module({ dynamic: true, store, name: 'screen' })
export class Screen extends VuexModule implements IScreenState {
  isMutedAll = false
  isFullscreen = false
  playingScreens = []

  @Mutation
  public SET_IS_MUTED_ALL(payload: boolean) {
    this.isMutedAll = payload
  }

  @Action
  public SetIsMutedAll(payload: boolean) {
    this.SET_IS_MUTED_ALL(payload)
  }

  @Mutation
  public SET_IS_FULLSCREEN(payload: boolean) {
    this.isFullscreen = payload
  }

  @Action
  public SetIsFullscreen(payload: boolean) {
    this.SET_IS_FULLSCREEN(payload)
  }

  @Mutation
  public SET_PLAYING_SCREENS(payload: string[]) {
    this.playingScreens = payload
  }

  /**
   * 添加正在播放中的设备
   * @param deviceId 设备ID
   */
  @Action
  public AddPlayingScreen(deviceId: string) {
    if (!this.playingScreens.includes(deviceId)) {
      this.SET_PLAYING_SCREENS([deviceId, ...this.playingScreens])
    }
  }

  /**
   * 删除正在播放中的设备
   * @param deviceId 设备ID
   */
  @Action
  public RemovePlayingScreen(deviceId: string) {
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
  public ClearPlayingScreen() {
    this.SET_PLAYING_SCREENS([])
  }
}

export const ScreenModule = getModule(Screen)
