/**
 * 设备管理器
 */
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
   * 操作树
   */
  public static advanceSearch = function(searchData: any) {
    // this.advancedSearchForm.deviceStatusKeys = payload.deviceStatusKeys
    // this.advancedSearchForm.streamStatusKeys = payload.streamStatusKeys
    // this.advancedSearchForm.matchKeys = payload.matchKeys
    // this.advancedSearchForm.deviceAddresses = payload.deviceAddresses
    // this.advancedSearchForm.inputKey = payload.inputKey
    // this.advancedSearchForm.searchKey = payload.searchKey
    // this.advancedSearchForm.revertSearchFlag = payload.revertSearchFlag
    // this.initDirs()
    if (searchData.revertSearchFlag) {
      this.treeSearchResult = [{
        id: 1,
        type: 'platform',
        label: '一级 1',
        children: [{
          id: 4,
          type: 'dir',
          label: '二级 1-1',
          children: [{
            id: 9,
            type: 'ipc',
            label: '三级 1-1-1'
          }, {
            id: 10,
            type: 'ipc',
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        type: 'platform',
        label: '一级 2',
        children: [{
          id: 5,
          type: 'ipc',
          label: '二级 2-1'
        }, {
          id: 6,
          type: 'ipc',
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        type: 'platform',
        label: '一级 3',
        children: [{
          id: 7,
          type: 'dir',
          label: '二级 3-1'
        }, {
          id: 8,
          type: 'dir',
          label: '二级 3-2',
          children: [{
            id: 9,
            type: 'dir',
            label: '二级 3-1'
          }, {
            id: 10,
            type: 'nvr',
            label: '二级 3-2',
            children: [{
              id: 11,
              type: 'ipc',
              label: '二级 3-1'
            }, {
              id: 12,
              type: 'ipc',
              label: '二级 3-2'
            }]
          }]
        }]
      }]
      this.lazy = false
    } else {
      this.treeSearchResult = []
      this.lazy = true
    }
    this.deviceTree.initCommonTree()
  }

  /**
   * ===============================================================================================
   * 操作screen
   */
}
