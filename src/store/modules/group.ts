import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/group'
import store from '@/store'

export interface IGroupState {
  group?: Group,
}

@Module({ dynamic: true, store, name: 'group' })
class GroupStore extends VuexModule implements IGroupState {
  public group?: Group = {
    groupName: ''
  }

  @Mutation
  public SET_GROUP(payload: any) {
    this.group = payload
    window.localStorage.setItem('currentGroup', JSON.stringify(payload))
  }

  @Action
  public SetGroup(payload: any) {
    this.SET_GROUP(payload)
  }

  @Action
  public GetGroupFromLs() {
    const groupLs = window.localStorage.getItem('currentGroup')
    if (groupLs) {
      const group = JSON.parse(groupLs)
      this.SET_GROUP(group)
    }
  }

  @Action
  public ResetGroup() {
    this.SET_GROUP({
      groupName: ''
    })
  }
}

export const GroupModule = getModule(GroupStore)
