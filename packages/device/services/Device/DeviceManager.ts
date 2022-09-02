/**
 * 设备管理器
 */
import { ToolsEnum } from '../../enums/index'
import { deleteDir } from '../../api/dir'
import { Device } from '../../type/Device'
import { exportSearchResult, getDeviceTree } from '../../api/device'
export default class DeviceManager {
  /**
   * ===============================================================================================
   * 操作设备
   */
  /**
   * 批量移动设备
   */
  public static moveDirs() {
    console.log('batchMoveDir')
  }

  /**
   * 批量删除设备
   */
  public static deleteDevices() {
    console.log('batchDeleteDevice')
  }

  /**
   * 批量启用/停用设备
   */
  public static startOrStopDevices() {
    console.log('batchStartOrStopDevice')
  }

  /**
   * 同步设备状态
   */
  public static syncDeviceStatus() {

  }

  /**
   * ===============================================================================================
   * 操作设备目录树
   */
  /**
   * 设备搜索
   * @param filterData 过滤字段
   */
  public static advanceSearch = async function(filterData?: any) {
    if (filterData) {
      this.advancedSearchForm.deviceStatusKeys = filterData.deviceStatusKeys
      this.advancedSearchForm.streamStatusKeys = filterData.streamStatusKeys
      this.advancedSearchForm.matchKeys = filterData.matchKeys
      this.advancedSearchForm.deviceAddresses = filterData.deviceAddresses
      this.advancedSearchForm.inputKey = filterData.inputKey
      this.advancedSearchForm.searchKey = filterData.searchKey
      this.advancedSearchForm.revertSearchFlag = filterData.revertSearchFlag
    }
    if (!this.lazy) {
      this.loading.tree = true
      this.treeSearchResult = await getDeviceTree({
        groupId: this.currentGroupId,
        id: 0,
        deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
        streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
        matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
        deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
        searchKey: this.advancedSearchForm.searchKey || undefined
      })
      this.loading.tree = false
    } else {
      this.treeSearchResult = []
    }
    this.deviceTree.initCommonTree()
  }

  /**
   * 初始化搜索结果
   */
  public static initAdvancedSearch = async function() {
    if (this.lazy) return
    // 初始化数据
    const query: any = this.$route.query
    this.advancedSearchForm.deviceStatusKeys = (query.deviceStatusKeys && query.deviceStatusKeys.split(',')) || []
    this.advancedSearchForm.streamStatusKeys = (query.streamStatusKeys && query.streamStatusKeys.split(',')) || []
    if (query.deviceAddresses) {
      const temp = query.deviceAddresses.split(',')
      this.advancedSearchForm.deviceAddresses = {
        code: temp[0],
        level: temp[1]
      }
    }
    this.advancedSearchForm.matchKeys = (query.matchKeys && query.matchKeys.split(',')) || []
    this.advancedSearchForm.inputKey = query.searchKey || ''
    this.advancedSearchForm.searchKey = query.searchKey || ''
    this.advancedSearchForm.revertSearchFlag = Boolean(this.advancedSearchForm.searchKey ||
                                                        this.advancedSearchForm.deviceStatusKeys.length ||
                                                        this.advancedSearchForm.streamStatusKeys.length ||
                                                        this.advancedSearchForm.deviceAddresses.code)
    // 初始化树
    this.loading.tree = true
    this.treeSearchResult = await getDeviceTree({
      id: 0,
      deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
      streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
      matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
      deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
      searchKey: this.advancedSearchForm.searchKey || undefined
    })
    this.loading.tree = false
  }

  /**
   * 导出搜索结果
   */
  public static exportSearchResult = async function() {
    try {
      const search = this.advancedSearchForm
      let data: any = {
        groupId: this.currentGroupId,
        inProtocol: this.currentGroupInProtocol,
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
      var res = await exportSearchResult(data)
      this.downloadFileUrl(`${data.inProtocol}导出设备表格`, res.exportFile)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 打开目录对话框
   */
  public static openDirectoryDialog = function(type: string, payload: any, node?: any) {
    switch (type) {
      case ToolsEnum.AddDirectory:
        if (payload) {
          this.parentDir = payload
        }
        this.dialog[ToolsEnum.EditDirectory] = true
        break
      case ToolsEnum.EditDirectory:
        if (payload) {
          this.currentDir = payload
        }
        this.dialog[type] = true
        break
      case ToolsEnum.SortDirectory:
        if (payload) {
          this.sortDir = payload
          this.sortNode = node
        }
        this.dialog[type] = true
    }
  }

  /**
   * 关闭目录对话框
   * @param dir 目录信息
   */
  public static closeDirectoryDialog = function(type: string, payload: any) {
    console.log(type)
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case ToolsEnum.SortDirectory:
        if (payload === true) {
          if (this.sortDir.id === '0') {
            (this.deviceTree as any).initCommonTree()
          } else {
            this.loadDirChildren(this.sortDir.id, this.sortNode)
          }
          (this.sortDir.id === this.$route.query.dirId || this.sortDir.id === this.$route.query.deviceId) && DeviceModule.SetIsSorted(true)
        }
        break
      case ToolsEnum.AddDirectory:
      case ToolsEnum.EditDirectory:
        this.currentDir = null
        this.parentDir = null
        if (payload === true) {
          (this.deviceTree as any).initCommonTree()
        }
        break
    }
  }

  /**
   * 删除目录
   * @param dir 目录信息
   */
  public static deleteDir = function(dir: any) {
    this.$alertDelete({
      type: '目录',
      msg: `是否确认删除目录"${dir.label}"`,
      method: deleteDir,
      payload: { dirId: dir.id },
      onSuccess: () => {
        this.deviceTree.initCommonTree()
        if (dir.id === this.$route.query.dirId) {
          this.gotoRoot()
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
   * @param data 播放器信息
   */
  public static openScreen = function(data: any, streamNum?: number) {
    this.screenManager.openTreeItem(data, streamNum)
  }
  /**
   * 获取需要执行的视频队列并按策略执行
   * @param node 起始树节点
   * @param isRoot 是否为根节点
   * @param policy 执行策略
   */
  public static executeQueue = async function(node: any, isRoot: boolean, policy: 'polling' | 'autoPlay') {
    let devicesQueue: Device[] = []
    const deviceTree: any = this.$refs.deviceTree
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      // VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      // VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      // VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    policy === 'polling' && (this.polling.isLoading = true)
    if (isRoot) {
      for (let i = 0, length = this.dirList.length; i < length; i++) {
        await this.deviceManager.deepDispatchTree.call(this, deviceTree, deviceTree.getNode(this.dirList[i].id), devicesQueue, policy)
      }
    } else {
      await this.deviceManager.deepDispatchTree.call(this, deviceTree, node, devicesQueue, policy)
    }
    policy === 'polling' && (this.polling.isLoading = false)
    if (this.queueExecutor) {
      this.screenManager.devicesQueue = devicesQueue
      this.queueExecutor.executeDevicesQueue(policy)
    }
  }

  /**
   * 深度优先遍历目录树
   * @param deviceTree 目录树DOM
   * @param node 当前node节点
   * @param deviceArr 存储有效设备的数组
   * @param policy 播放事件策略（一键播放/轮巡）
   * @param playType 播放视频类型（实时预览/录像回放）
   */
  public static deepDispatchTree = async function(deviceTree: any, node: any, deviceArr: any[], policy?: 'polling' | 'autoPlay') {
    // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
    if (policy === 'autoPlay' && deviceArr.length >= this.maxSize) return
    if (node.data.type === 'ipc') {
      // 实时预览的一键播放和轮巡需要判断设备是否在线，录像回放的一键播放不需要
      if (node.data.deviceStatus === 'on' || !this.screenManager.isLive) {
        node.data.inProtocol = this.currentGroupInProtocol
        deviceArr.push(node.data)
      }
    } else {
      // 不为搜索树时需要调接口添加node的children
      if (!this.advancedSearchForm.revertSearchFlag) {
        let data = await getDeviceTree({
          groupId: this.currentGroupId,
          id: node!.data.id,
          type: node!.data.type,
          'self-defined-headers': {
            'role-id': node!.data.roleId || '',
            'real-group-id': node!.data.realGroupId || ''
          }
        })
        const dirs = this.setDirsStreamStatus(data.dirs)
        deviceTree.updateKeyChildren(node.data.id, dirs)
        node.expanded = true
        node.loaded = true
      }
      if (node.data.children && node.data.children.length) {
        for (let i = 0, len = node.data.children.length; i < len; i++) {
          const item = node.data.children[i]
          // 子节点继承node的虚拟业务组信息
          if (node!.data.type === 'group') {
            item.roleId = node.data.roleId
            item.realGroupId = node.data.id
            item.realGroupInProtocol = node.data.inProtocol
          } else {
            item.roleId = node.data.roleId
            item.realGroupId = node.data.realGroupId
            item.realGroupInProtocol = node.data.realGroupInProtocol
          }
          await this.deviceManager.deepDispatchTree.call(this, deviceTree, deviceTree.getNode(item.id), deviceArr, policy)
          // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
          if (policy === 'autoPlay' && deviceArr.length >= this.maxSize) return
        }
      }
    }
  }

  /**
   * 改变轮巡时间
   * @param val 时间
   */
  public static intervalChange = function(val: number) {
    this.screenManager.executeQueueConfig.interval = val
  }

  /**
   * 停止轮巡
   */
  public static stopPolling = function() {
    if (this.queueExecutor) {
      this.queueExecutor.stopPolling()
    }
  }

  /**
   * 暂停轮巡
   */
  public static pausePolling = function() {
    if (this.queueExecutor) {
      this.queueExecutor.pausePolling()
    }
  }

  /**
   * 继续轮巡
   */
  public static resumePolling = function() {
    if (this.queueExecutor) {
      this.queueExecutor.resumePolling()
    }
  }
}
