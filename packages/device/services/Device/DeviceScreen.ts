import { AdvancedSearch } from '../../type/AdvancedSearch'
import { ScreenManager } from '../Screen/ScreenManager'
import { DirectoryTypeEnum, StatusEnum, ToolsEnum } from '@vss/device/enums'

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
const openScreen = function (getVueComponent, data: any, streamNum?: number) {
  const state = getVueComponent()
  state.screenManager.openTreeItem(data, streamNum)
}

/**
 * 获取需要执行的视频队列并按策略执行
 * @param state.screenManager Screen Manager
 * @param state.dirList 目录列表
 * @param state.queueExecutor 轮询执行器
 * @param state.deviceTree 设备树
 * @param state.currentNode 当前节点
 * @param state.pollingStatus 轮询状态
 * @param state.pollingInterval 轮询间隔
 * @param state.maxSize 最大轮询数量
 * @param state.advancedSearchForm 搜索表单
 * @param state.setDirsStreamStatus 设置流状态
 * @param node 起始树节点
 * @param isRoot 是否为根节点
 * @param policy 执行策略
 */
const executeQueue = async function (
  getVueComponent,
  node: any,
  isRoot: boolean,
  policy: 'polling' | 'autoPlay',
  status: StatusEnum
) {
  const state: {
    currentDir?: any,
    currentTreeId?: string
    screenManager?: ScreenManager
    queueExecutor?: any
    handleTools?: any
    advancedSearchForm?: AdvancedSearch
    $refs?: any
  } = getVueComponent()
  state.handleTools(ToolsEnum.StopPolling)
  state.currentDir = isRoot ? { id: '', type: DirectoryTypeEnum.Dir } : node
  const pollingMask = state.$refs.pollingMask
  pollingMask.policy = policy
  
  if (state.queueExecutor) {
    try {
      state.screenManager.executeQueueConfig.query = {
        id: state.currentDir.id || state.currentTreeId,
        type: state.currentDir.type,
        deviceStatus: status,
        pollThreshold: 1000
      }
      state.screenManager.executeQueueConfig.pageNum = 1
      state.screenManager.devicesQueue = []
      pollingMask.isLoading = true
      await state.queueExecutor.getDevices(policy)
      pollingMask.isLoading = false
      state.queueExecutor.executeDevicesQueue(policy)
    } catch (e) {
      console.log(e)
    }
  }
}

/**
 * 改变轮巡时间
 * @param state.screenManager Screen Manager
 * @param val 时间
 */
const intervalChange = function (getVueComponent, interval: number) {
  const state: { screenManager, queueExecutor: any } = getVueComponent()
  if (state.queueExecutor) {
    state.queueExecutor.pausePolling()
    state.screenManager.executeQueueConfig.interval = interval
    state.queueExecutor.resumePolling()
  }
}

/**
 * 停止轮巡
 * @param state.queueExecutor 轮询执行器
 */
const stopPolling = function (getVueComponent) {
  const state: { queueExecutor: any } = getVueComponent()
  if (state.queueExecutor) {
    state.queueExecutor.stopPolling()
  }
}

/**
 * 暂停轮巡
 * @param state.queueExecutor 轮询执行器
 */
const pausePolling = function (getVueComponent) {
  const state: { queueExecutor: any } = getVueComponent()
  if (state.queueExecutor) {
    state.queueExecutor.pausePolling()
  }
}

/**
 * 继续轮巡
 * @param state.queueExecutor 轮询执行器
 */
const resumePolling = function (getVueComponent) {
  const state: { queueExecutor: any } = getVueComponent()
  if (state.queueExecutor) {
    state.queueExecutor.resumePolling()
  }
}

/**
 * 初始化分屏列表
 */
const clearAllScreen = function (getVueComponent) {
  const state: { screenManager: any } = getVueComponent()
  if (state.screenManager) {
    state.screenManager.clearAllScreen()
  }
}

export default {
  openScreen,
  executeQueue,
  intervalChange,
  stopPolling,
  pausePolling,
  resumePolling,
  clearAllScreen
}
