import { Device } from '../../type/Device'
import { AdvancedSearch } from '../../type/AdvancedSearch'
import { getDeviceTree } from '../../api/device'
import { ScreenManager } from '../Screen/ScreenManager'

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
const openScreen = function (state: { screenManager: ScreenManager }, data: any, streamNum?: number) {
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
const executeQueue = async function (
  state: {
    screenManager?: ScreenManager
    queueExecutor?: any
    deviceTree?: any
    currentNode?: any
    polling?: any
    maxSize?: number
    advancedSearchForm?: AdvancedSearch
    setDirsStreamStatus?: Function
  },
  node: any,
  isRoot: boolean,
  policy: 'polling' | 'autoPlay'
) {
  const devicesQueue: Device[] = []
  const deviceTree: any = state.deviceTree
  if (node) {
    state.currentNode = node
    // 设置虚拟业务组相关信息
    // VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
    // VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
    // VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
  }
  policy === 'polling' && (state.polling.isLoading = true)
  // if (isRoot) {
  //   for (let i = 0, length = state.dirList.length; i < length; i++) {
  //     await deepDispatchTree(state, deviceTree, deviceTree.getNode(state.dirList[i].id), devicesQueue, policy)
  //   }
  // } else {
  await deepDispatchTree(state, deviceTree, node, devicesQueue, policy)
  // }
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
const deepDispatchTree = async function (
  state: {
    screenManager: ScreenManager
    advancedSearchForm: AdvancedSearch
    setDirsStreamStatus: Function
    maxSize: number
  },
  deviceTree: any,
  node: any,
  deviceArr: any[],
  policy?: 'polling' | 'autoPlay'
) {
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
      const data = await getDeviceTree({
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
const intervalChange = function (state: { screenManager }, interval: number) {
  state.screenManager.executeQueueConfig.interval = interval
}

/**
 * 停止轮巡
 * @param state.queueExecutor 轮询执行器
 */
const stopPolling = function (state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.stopPolling()
  }
}

/**
 * 暂停轮巡
 * @param state.queueExecutor 轮询执行器
 */
const pausePolling = function (state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.pausePolling()
  }
}

/**
 * 继续轮巡
 * @param state.queueExecutor 轮询执行器
 */
const resumePolling = function (state: { queueExecutor: any }) {
  if (state.queueExecutor) {
    state.queueExecutor.resumePolling()
  }
}

export default {
  openScreen,
  executeQueue,
  deepDispatchTree,
  intervalChange,
  stopPolling,
  pausePolling,
  resumePolling
}
