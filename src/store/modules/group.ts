import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/group'
import { getGroups } from '@/api/group'
import store from '@/store'
import { setLocalStorage, getLocalStorage } from '@/utils/storage'

export interface IGroupState {
  group?: Group,
  defaultGroup?: Group,
  groups?: Array<Group>,
  groupListIndex?: number
  isFilter?: boolean
}

@Module({ dynamic: true, store, name: 'group' })
class GroupStore extends VuexModule implements IGroupState {
  public group?: Group = {
    groupName: ''
  }

  public defaultGroup?: Group = {
    groupName: ''
  }

  public groups?: Array<Group> = []

  public groupListIndex?: number = 1

  public isFilter?: boolean = false

  @Mutation
  public SET_GROUP(payload: any) {
    this.group = payload
    window.localStorage.setItem('currentGroup', JSON.stringify(payload))
  }

  @Mutation
  public SET_DEFAULT_GROUP(payload: any) {
    this.defaultGroup = payload
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

  @Mutation
  public SET_IS_FILTER(payload: boolean) {
    this.isFilter = payload
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
        pageSize: 20 * this.groupListIndex!
      }
      const res = await getGroups(params)
      let groupList = res.groups
      // 过滤业务组
      if (this.isFilter) {
        groupList = groupList.filter(group => !['ga1400'].includes(group.inProtocol))
      }
      this.SET_GROUP_LIST(groupList)
      if (groupList.length) {
        let group
        if (!this.group?.groupId) {
          group = groupList[0]
        } else {
          // 设置默认业务组，且对ga1400做特殊处理
          if (this.isFilter && ['ga1400'].includes(GroupModule.group.inProtocol)) {
            group = groupList[0]
          } else {
            if (GroupModule.group.groupName) {
              group = GroupModule.group
              // 如果没查到则插入默认组
              if (!groupList.find((group: Group) => group.groupId === GroupModule.group?.groupId)) {
                this.SET_DEFAULT_GROUP(group)
              } else {
                this.SET_DEFAULT_GROUP({})
              }
            } else {
              group = groupList[0]
            }
          }
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
        pageNum: this.groupListIndex + 1,
        pageSize: 20
      }
      const res = await getGroups(params)
      // 去重与默认组重复的业务组
      const groups = res.groups.filter(group => group.groupId !== this.defaultGroup.groupId)
      this.SET_GROUP_LIST([...this.groups!, ...groups])
      this.SET_GROUP_LIST_INDEX(this.groupListIndex + 1)
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
