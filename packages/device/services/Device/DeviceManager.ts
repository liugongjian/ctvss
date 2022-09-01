/**
 * 设备管理器
 */
import { ToolsEnum } from '../../enums/index'
import { deleteDir } from '../../api/dir'
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
   * 操作设备目录（树）
   */
  public static initDirs = async function(isExpand?: boolean) {
    try {
      // VGroupModule.resetVGroupInfo()
      this.deviceTree.treeLoading = true
      // await DeviceModule.ResetBreadcrumb()
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: 0,
        deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
        streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
        matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
        deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
        searchKey: this.advancedSearchForm.searchKey || undefined
      })
      // this.dirList = this.setDirsStreamStatus(res)
      DeviceManager.getRootSums.call(this, res)
      this.deviceTree.initCommonTree()
      // this.$nextTick(() => {
      //   this.initTreeStatus(isExpand)
      // })
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.deviceTree.treeLoading = false
    }
  }

  /**
   * 计算根目录设备数统计
   */
  public static getRootSums = function(dirList: any) {
    this.deviceTree.rootSums.online = 0
    this.deviceTree.rootSums.total = 0
    dirList.forEach((dir: any) => {
      if (dir.type === 'ipc') {
        dir.deviceStatus === 'on' && this.rootSums.online++
        this.rootSums.total++
      } else {
        this.deviceTree.rootSums.online += dir.onlineSize
        this.deviceTree.rootSums.total += dir.totalSize
      }
    })
  }
  /**
   * 设备搜索
   * @param searchData 过滤字段
   */
  public static advanceSearch = async function(searchData: any) {
    // this.advancedSearchForm.deviceStatusKeys = payload.deviceStatusKeys
    // this.advancedSearchForm.streamStatusKeys = payload.streamStatusKeys
    // this.advancedSearchForm.matchKeys = payload.matchKeys
    // this.advancedSearchForm.deviceAddresses = payload.deviceAddresses
    // this.advancedSearchForm.inputKey = payload.inputKey
    // this.advancedSearchForm.searchKey = payload.searchKey
    // this.advancedSearchForm.revertSearchFlag = payload.revertSearchFlag
    // this.initDirs()
    if (searchData.revertSearchFlag) {
      this.treeSearchResult = await getDeviceTree({
        groupId: this.currentGroupId,
        id: 0,
        deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
        streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
        matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
        deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
        searchKey: this.advancedSearchForm.searchKey || undefined
      })
    } else {
      this.treeSearchResult = []
    }
    this.deviceTree.initCommonTree()
  }

  // 导出搜索结果
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
}
