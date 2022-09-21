import { VuexModule, Module, MutationAction, getModule, Mutation, Action } from 'vuex-module-decorators'
import store from '@/store'

export interface IIBoxState {
  iboxList?: any
  breadcrumb?: any
}

@Module({ dynamic: true, store, name: 'ibox' })
class IBox extends VuexModule implements IIBoxState {
  public iboxList: any = null
  public breadcrumb: any = null

  @MutationAction
  public async SetList(info: any) {
    let iboxList = this.iboxList
    iboxList = info
    return { iboxList }
  }

  @Mutation
  public SET_BREADCRUMB(payload: any) {
    this.breadcrumb = payload
  }

  @Action
  public SetBreadcrumb(payload: any) {
    this.SET_BREADCRUMB(payload)
  }

  @Action
  public ResetBreadcrumb() {
    this.SET_BREADCRUMB('')
  }
}

export const IBoxModule = getModule(IBox)
