import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/Group'
import { getGroups } from '@/api/group'
import { getTreeList } from '@/api/customTree'
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

  public customTrees?: Array<Group> = []

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
  public SET_CUSTOM_TREE_LIST(payload: Array<any>) {
    this.customTrees = payload
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
  public async GetMultiGroupList() {
    try {
      const params = {
        pageNum: 1,
        pageSize: 999
      }
      const groupsRes = await getGroups(params)
      const groupList = groupsRes.groups
      this.SET_GROUP_LIST(groupList)
      const treessRes = await getTreeList({})
      const treeList = treessRes.trees.map(tree => {
        return {
          groupId: tree.treeId,
          groupName: tree.treeName,
          isCustomTree: true,
          inProtocol: ''
        }
      })
      this.SET_CUSTOM_TREE_LIST(treeList)
      if (groupList.length || treeList.length) {
        let group
        if (!this.group?.groupId) {
          group = groupList[0]
        } else {
          const currentGroup = [...groupList, ...treeList].find((group: Group) => group.groupId === GroupModule.group?.groupId)
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
  public async GetGroupList() {
    const storageGroupListIndex: number = parseInt(getLocalStorage('groupListIndex')!)
    storageGroupListIndex && (this.SET_GROUP_LIST_INDEX(storageGroupListIndex))
    try {
      const params = {
        pageNum: 1,
        pageSize: 20 * this.groupListIndex!
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
      const params = {
        pageNum: this.groupListIndex + 1,
        pageSize: 20
      }
      const res = await getGroups(params)
      const groups = res.groups
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

  @Action
  public SetGroupList(groups) {
    this.SET_GROUP_LIST(groups)
  }
}

export const GroupModule = getModule(GroupStore)
