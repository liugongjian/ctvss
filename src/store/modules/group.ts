import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/group'
import { getGroups } from '@/api/group'
import store from '@/store'

export interface IGroupState {
  group?: Group,
  groups?: Array<Group>
}

@Module({ dynamic: true, store, name: 'group' })
class GroupStore extends VuexModule implements IGroupState {
  public group?: Group = {
    groupName: ''
  }

  public groups?: Array<Group> = []

  @Mutation
  public SET_GROUP(payload: any) {
    this.group = payload
    window.localStorage.setItem('currentGroup', JSON.stringify(payload))
  }

  @Mutation
  public SET_GROUP_LIST(payload: Array<Group>) {
    this.groups = payload
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

  @Action
  public async GetGroupList() {
    try {
      let params = {
        pageSize: 1000
      }
      const res = await getGroups(params)
      const groupList = res.groups
      this.SET_GROUP_LIST(groupList)
      if (groupList.length) {
        let group
        if (!this.group?.groupId) {
          group = groupList[0]
        } else {
          const currentGroup = groupList.find((group: Group) => group.groupId === GroupModule.group?.groupId)
          group = currentGroup || groupList[0]
        }
        this.SET_GROUP(group)
      } else {
        this.ResetGroup()
      }
    } catch (e) {
      console.error(e)
    }
  }

  @Action
  public ResetGroupList() {
    this.SET_GROUP_LIST([])
  }
}

export const GroupModule = getModule(GroupStore)
