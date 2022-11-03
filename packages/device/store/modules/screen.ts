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

  @Action
  public SetPlayingScreens(payload: string[]) {
    this.SET_PLAYING_SCREENS(payload)
  }
}

export const ScreenModule = getModule(Screen)
