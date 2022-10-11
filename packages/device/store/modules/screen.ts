import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'

export interface IScreenState {
  isMutedAll?: boolean;
  isFullscreen?: boolean;
}

@Module({ dynamic: true, store, name: 'screen' })
export class Screen extends VuexModule implements IScreenState {
  isMutedAll = false
  isFullscreen = false

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
}

export const ScreenModule = getModule(Screen)
