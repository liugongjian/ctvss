import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/group'
import { getGroups } from '@/api/group'
import store from '@/store'
import { setLocalStorage, getLocalStorage } from '@/utils/storage'

export interface IGroupState {
  group?: Group,
  groups?: Array<Group>,
  groupListIndex?: number
}

@Module({ dynamic: true, store, name: 'group' })
class GroupStore extends VuexModule implements IGroupState {
  public group?: Group = {
    groupName: ''
  }

  public groups?: Array<Group> = []

  public groupListIndex?: number = 1

  @Mutation
  public SET_GROUP(payload: any) {
    this.group = payload
    window.localStorage.setItem('currentGroup', JSON.stringify(payload))
  }

  @Mutation
  public SET_GROUP_LIST(payload: Array<Group>) {
    this.groups = payload
  }

  @Mutation
  public SET_GROUP_LIST_INDEX(payload: number) {
    this.groupListIndex = payload
    setLocalStorage('groupListIndex', this.groupListIndex)
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
  public SetGroupListIndex(payload: number) {
    this.SET_GROUP_LIST_INDEX(payload)
  }

  @Action
  public ResetGroupListIndex() {
    this.SET_GROUP_LIST_INDEX(1)
  }

  @Action
  public async GetGroupList() {
    const storageGroupListIndex: number = parseInt(getLocalStorage('groupListIndex')!)
    storageGroupListIndex && (this.SET_GROUP_LIST_INDEX(storageGroupListIndex))
    try {
      let params = {
        pageNum: 1,
        pageSize: 10 * this.groupListIndex!
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
  public async LoadmoreGroups() {
    try {
      let params = {
        pageNum: this.groupListIndex,
        pageSize: 10
      }
      const res = await getGroups(params)
      const groups = res.groups
      this.SET_GROUP_LIST([...this.groups!, ...groups])
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
