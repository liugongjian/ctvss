import { VuexModule, Module, MutationAction, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IIBoxState {
  iboxList?: any
}

@Module({ dynamic: true, store, name: 'ibox' })
class IBox extends VuexModule implements IIBoxState {
  public iboxList: any = null

  @MutationAction
  public async SetList(info: any) {
    let iboxList = this.iboxList
    iboxList = info
    return { iboxList }
  }
}

export const IBoxModule = getModule(IBox)
