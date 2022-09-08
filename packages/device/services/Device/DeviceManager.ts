/**
 * 设备管理器
 */
import { ToolsEnum } from '../../enums/index'
import { Device } from '../../type/Device'
import { AdvancedSearch } from '../../type/AdvancedSearch'
import { deleteDir as deleteDirApi } from '../../api/dir'
import { exportSearchResult as exportSearchResultApi, getDeviceTree } from '../../api/device'
import { ScreenManager } from '../Screen/ScreenManager'
import { downloadFileUrl } from '@vss/base/utils/excel'

/**
 * ===============================================================================================
 * 操作设备
 */
/**
 * 创建设备
 */
const addDevice = function() {
  this.$router.push({ name: 'DeviceCreate' })
}

/**
 * 批量移动设备
 */
const moveDirs = () => {
  console.log('batchMoveDir')
}

/**
 * 批量删除设备
 */
const deleteDevices = () => {
  console.log('batchDeleteDevice')
}

/**
 * 批量启用/停用设备
 */
const startOrStopDevices = () => {
  console.log('batchStartOrStopDevice')
}

/**
 * 同步设备状态
 */
const syncDeviceStatus = () => {

}

/**
 * ===============================================================================================
 * 操作设备目录树
 */
/**
 * 设备搜索
 * @param state.advancedSearchForm 搜索表单
 * @param state.lazy 是否懒加载的状态
 * @param state.loading 加载中状态
 * @param state.treeSearchResult 搜索结果
 * @param state.deviceTree 树组件
 * @param filterData 过滤字段
 */
const advanceSearch = async function(state: { advancedSearchForm: AdvancedSearch, lazy: boolean, loading: any, treeSearchResult: any, deviceTree: any }, filterData?: any) {
  if (filterData) {
    state.advancedSearchForm.deviceStatusKeys = filterData.deviceStatusKeys
    state.advancedSearchForm.streamStatusKeys = filterData.streamStatusKeys
    state.advancedSearchForm.matchKeys = filterData.matchKeys
    state.advancedSearchForm.deviceAddresses = filterData.deviceAddresses
    state.advancedSearchForm.inputKey = filterData.inputKey
    state.advancedSearchForm.searchKey = filterData.searchKey
    state.advancedSearchForm.revertSearchFlag = filterData.revertSearchFlag
  }
  if (!state.lazy) {
    state.loading.tree = true
    state.treeSearchResult = await getDeviceTree({
      // groupId: this.currentGroupId,
      id: 0,
      deviceStatusKeys: state.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
      streamStatusKeys: state.advancedSearchForm.streamStatusKeys.join(',') || undefined,
      matchKeys: state.advancedSearchForm.matchKeys.join(',') || undefined,
      deviceAddresses: state.advancedSearchForm.deviceAddresses.code ? state.advancedSearchForm.deviceAddresses.code + ',' + state.advancedSearchForm.deviceAddresses.level : undefined,
      searchKey: state.advancedSearchForm.searchKey || undefined
    })
    state.loading.tree = false
  } else {
    state.treeSearchResult = []
  }
  state.deviceTree.initCommonTree()
}

/**
 * 初始化搜索结果
 * @param state.advancedSearchForm 搜索表单
 * @param state.lazy 是否懒加载的状态
 * @param state.loading 加载中状态
 * @param state.treeSearchResult 搜索结果
 */
const initAdvancedSearch = async function(state: { advancedSearchForm: AdvancedSearch, lazy: boolean, loading: any, treeSearchResult: any }) {
  if (state.lazy) return
  // 初始化数据
  const query: any = this.$route.query
  state.advancedSearchForm.deviceStatusKeys = (query.deviceStatusKeys && query.deviceStatusKeys.split(',')) || []
  state.advancedSearchForm.streamStatusKeys = (query.streamStatusKeys && query.streamStatusKeys.split(',')) || []
  if (query.deviceAddresses) {
    const temp = query.deviceAddresses.split(',')
    state.advancedSearchForm.deviceAddresses = {
      code: temp[0],
      level: temp[1]
    }
  }
  state.advancedSearchForm.matchKeys = (query.matchKeys && query.matchKeys.split(',')) || []
  state.advancedSearchForm.inputKey = query.searchKey || ''
  state.advancedSearchForm.searchKey = query.searchKey || ''
  state.advancedSearchForm.revertSearchFlag = Boolean(state.advancedSearchForm.searchKey ||
                                                      state.advancedSearchForm.deviceStatusKeys.length ||
                                                      state.advancedSearchForm.streamStatusKeys.length ||
                                                      state.advancedSearchForm.deviceAddresses.code)
  // 初始化树
  state.loading.tree = true
  state.treeSearchResult = await getDeviceTree({
    id: 0,
    deviceStatusKeys: state.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
    streamStatusKeys: state.advancedSearchForm.streamStatusKeys.join(',') || undefined,
    matchKeys: state.advancedSearchForm.matchKeys.join(',') || undefined,
    deviceAddresses: state.advancedSearchForm.deviceAddresses.code ? state.advancedSearchForm.deviceAddresses.code + ',' + state.advancedSearchForm.deviceAddresses.level : undefined,
    searchKey: state.advancedSearchForm.searchKey || undefined
  })
  state.loading.tree = false
}

/**
 * 导出搜索结果
 * @param state.advancedSearchForm 搜索表单
 */
const exportSearchResult = async function(state: { advancedSearchForm: AdvancedSearch }) {
  try {
    const search = state.advancedSearchForm
    const data: any = {
      // groupId: this.currentGroupId,
      // inProtocol: this.currentGroupInProtocol,
      deviceStatusKeys: search.deviceStatusKeys.join(',') || undefined,
      streamStatusKeys: search.streamStatusKeys.join(',') || undefined,
      matchKeys: search.matchKeys.join(',') || undefined,
      deviceAddresses: search.deviceAddresses.code ? search.deviceAddresses.code + ',' + search.deviceAddresses.level : undefined,
      searchKey: search.searchKey || undefined,
      sortBy: 'OrderSequence',
      sortDirection: 'asc',
      pageSize: 5000,
      pageNum: 1
    }
    const res = await exportSearchResultApi(data)
    downloadFileUrl(`${data.inProtocol}导出设备表格`, res.exportFile)
  } catch (e) {
    console.log(e)
  }
}

/**
 * 打开目录对话框
 * @param state.dialog 弹窗状态
 * @param state.parentDir 上级目录
 * @param state.currentDir 当前目录
 * @param state.sortDir 筛选的目录
 * @param state.sortNode 筛选的节点
 * @param type 触发打开窗口的事件类型
 * @param payload 操作目录信息
 * @param node 操作目录树节点
 */
const openDirectoryDialog = function(state: { dialog: any, parentDir: any, currentDir: any, sortDir: any, sortNode: any }, type: string, payload: any, node?: any) {
  switch (type) {
    case ToolsEnum.AddDirectory:
      if (payload) {
        state.parentDir = payload
      }
      state.dialog[ToolsEnum.EditDirectory] = true
      break
    case ToolsEnum.EditDirectory:
      if (payload) {
        state.currentDir = payload
      }
      state.dialog[type] = true
      break
    case ToolsEnum.SortDirectory:
      if (payload) {
        state.sortDir = payload
        state.sortNode = node
      }
      state.dialog[type] = true
  }
}

/**
 * 关闭目录对话框
 * @param state.dialog 弹窗状态
 * @param state.parentDir 上级目录
 * @param state.currentDir 当前目录
 * @param state.sortDir 筛选的目录
 * @param state.sortNode 筛选的节点
 * @param type 触发关闭窗口的事件类型
 * @param isRefresh 是否更新树
 */
const closeDirectoryDialog = function(state: { dialog: any, parentDir: any, currentDir: any, sortDir: any, deviceTree: any, loadDirChildren: Function }, type: string, isRefresh: any) {
  // @ts-ignore
  state.dialog[type] = false
  switch (type) {
    case ToolsEnum.SortDirectory:
      if (isRefresh === true) {
        if (state.sortDir.id === '0') {
          (state.deviceTree as any).initCommonTree()
        } else {
          state.loadDirChildren(state.sortDir.id, this.sortNode)
        }
        (state.sortDir.id === this.$route.query.dirId || state.sortDir.id === this.$route.query.deviceId) && DeviceModule.SetIsSorted(true)
      }
      break
    case ToolsEnum.AddDirectory:
    case ToolsEnum.EditDirectory:
      state.currentDir = null
      state.parentDir = null
      if (isRefresh === true) {
        (state.deviceTree as any).initCommonTree()
      }
      break
  }
}

/**
 * 删除目录
 * @param state.deviceTree 树组件
 * @param state.gotoRoot 跳转到根
 * @param dir 目录信息
 */
const deleteDir = function(state: { deviceTree: any, gotoRoot: Function }, dir: any) {
  this.$alertDelete({
    type: '目录',
    msg: `是否确认删除目录"${dir.label}"`,
    method: deleteDirApi,
    payload: { dirId: dir.id },
    onSuccess: () => {
      state.deviceTree.initCommonTree()
      if (dir.id === this.$route.query.dirId) {
        state.gotoRoot()
      }
    }
  })
}

/**
 * ===============================================================================================
 * 操作screen
 */
/**
 * 开启视频播放器
 * @param state.screenManager Screen Manager
 * @param data 播放器信息
 * @param streamNum 第几路流
 */
const openScreen = function(state: { screenManager: ScreenManager }, data: any, streamNum?: number) {
  state.screenManager.openTreeItem(data, streamNum)
}

/**
 * 获取需要执行的视频队列并按策略执行
 * @param state.screenManager Screen Manager
 * @param state.dirList 目录列表
 * @param state.queueExecutor 轮询执行器
 * @param state.deviceTree 设备树
 * @param state.currentNode 当前节点
 * @param state.polling 轮询状态
 * @param state.maxSize 最大轮询数量
 * @param state.advancedSearchForm 搜索表单
 * @param state.setDirsStreamStatus 设置流状态
 * @param node 起始树节点
 * @param isRoot 是否为根节点
 * @param policy 执行策略
 */
const executeQueue = async function(state: { screenManager: ScreenManager, dirList: any, queueExecutor: any, deviceTree: any, currentNode: any, polling: any, maxSize: number, advancedSearchForm: AdvancedSearch, setDirsStreamStatus: Function }, node: any, isRoot: boolean, policy: 'polling' | 'autoPlay') {
  let devicesQueue: Device[] = []
  const deviceTree: any = state.deviceTree
  if (node) {
    state.currentNode = node
    // 设置虚拟业务组相关信息
    // VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
    // VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
    // VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
  }
  policy === 'polling' && (state.polling.isLoading = true)
  if (isRoot) {
    for (let i = 0, length = state.dirList.length; i < length; i++) {
      await deepDispatchTree(state, deviceTree, deviceTree.getNode(state.dirList[i].id), devicesQueue, policy)
    }
  } else {
    await deepDispatchTree(state, deviceTree, node, devicesQueue, policy)
  }
  policy === 'polling' && (state.polling.isLoading = false)
  if (state.queueExecutor) {
    state.screenManager.devicesQueue = devicesQueue
    state.queueExecutor.executeDevicesQueue(policy)
  }
}

/**
 * 深度优先遍历目录树
 * @param state.screenManager Screen Manager
 * @param state.maxSize 最大轮询数量
 * @param state.advancedSearchForm 搜索表单
 * @param state.setDirsStreamStatus 设置流状态
 * @param deviceTree 目录树DOM
 * @param node 当前node节点
 * @param deviceArr 存储有效设备的数组
 * @param policy 播放事件策略（一键播放/轮巡）
 * @param playType 播放视频类型（实时预览/录像回放）
 */
const deepDispatchTree = async function(state: { screenManager: ScreenManager, advancedSearchForm: AdvancedSearch, setDirsStreamStatus: Function, maxSize: number }, deviceTree: any, node: any, deviceArr: any[], policy?: 'polling' | 'autoPlay') {
  // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
  if (policy === 'autoPlay' && deviceArr.length >= state.maxSize) return
  if (node.data.type === 'ipc') {
    // 实时预览的一键播放和轮巡需要判断设备是否在线，录像回放的一键播放不需要
    if (node.data.deviceStatus === 'on' || !state.screenManager.isLive) {
      // node.data.inProtocol = this.currentGroupInProtocol
      deviceArr.push(node.data)
    }
  } else {
    // 不为搜索树时需要调接口添加node的children
    if (!state.advancedSearchForm.revertSearchFlag) {
      let data = await getDeviceTree({
        // groupId: this.currentGroupId,
        id: node!.data.id,
        type: node!.data.type
        // 'self-defined-headers': {
        //   'role-id': node!.data.roleId || '',
        //   'real-group-id': node!.data.realGroupId || ''
        // }
      })
      const dirs = state.setDirsStreamStatus(data.dirs)
      deviceTree.updateKeyChildren(node.data.id, dirs)
      node.expanded = true
      node.loaded = true
    }
    if (node.data.children && node.data.children.length) {
      for (let i = 0, len = node.data.children.length; i < len; i++) {
        const item = node.data.children[i]
        // 子节点继承node的虚拟业务组信息
        // if (node!.data.type === 'group') {
        //   item.roleId = node.data.roleId
        //   item.realGroupId = node.data.id
        //   item.realGroupInProtocol = node.data.inProtocol
        // } else {
        //   item.roleId = node.data.roleId
        //   item.realGroupId = node.data.realGroupId
        //   item.realGroupInProtocol = node.data.realGroupInProtocol
        // }
        await deepDispatchTree(state, deviceTree, deviceTree.getNode(item.id), deviceArr, policy)
        // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
        if (policy === 'autoPlay' && deviceArr.length >= state.maxSize) return
      }
    }
  }
}

/**
 * 改变轮巡时间
 * @param state.screenManager Screen Manager
 * @param val 时间
 */
const intervalChange = function(state: { screenManager }, interval: number) {
  state.screenManager.executeQueueConfig.interval = interval
}

/**
 * 停止轮巡
 * @param state.queueExecutor 轮询执行器
 */
const stopPolling = function(state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.stopPolling()
  }
}

/**
 * 暂停轮巡
 * @param state.queueExecutor 轮询执行器
 */
const pausePolling = function(state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.pausePolling()
  }
}

/**
 * 继续轮巡
 * @param state.queueExecutor 轮询执行器
 */
const resumePolling = function(state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.resumePolling()
  }
}

export default {
  // 操作设备
  addDevice,
  moveDirs,
  deleteDevices,
  startOrStopDevices,
  syncDeviceStatus,
  // 操作设备目录树
  advanceSearch,
  initAdvancedSearch,
  exportSearchResult,
  openDirectoryDialog,
  closeDirectoryDialog,
  deleteDir,
  // 操作screen
  openScreen,
  executeQueue,
  deepDispatchTree,
  intervalChange,
  stopPolling,
  pausePolling,
  resumePolling
}
