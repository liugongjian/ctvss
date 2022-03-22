import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IScreenState {
  isMutedAll?: boolean
}

@Module({ dynamic: true, store, name: 'screen' })
class Screen extends VuexModule implements IScreenState {
  isMutedAll: boolean = false

  @Mutation
  public SET_IS_MUTED_ALL(payload: boolean) {
    this.isMutedAll = payload
  }

  @Action
  public SetIsMutedAll(payload: boolean) {
    this.SET_IS_MUTED_ALL(payload)
  }
}

export const ScreenModule = getModule(Screen)
