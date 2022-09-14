import { DeviceEnum, DeviceTypeEnum, ToolsEnum } from '../../enums/index'
import {
  deleteDevice as deleteDeviceApi,
  syncDevice as syncDeviceApi,
  syncDeviceStatus as syncDeviceStatusApi,
  syncStatusPolling,
  exportDeviceAll,
  exportDeviceOption
} from '../../api/device'

/**
* ===============================================================================================
* 操作设备
*/
/**
* 创建设备
* @param state.$router 路由
* @param dirId 目录id
*/
const addDevice = function(state, dirId) {
  state.$router.push({
    name: 'DeviceCreate',
    query: {
      dirId
    }
  })
}

/**
* 查看设备详情
* @param state.$router 路由
* @param id 设备id
*/
const viewDevice = function(state, id) {
  state.$router.push({
    name: 'DeviceInfo',
    query: {
      // [DeviceEnum.DeviceId]: id
      [DeviceEnum.DeviceId]: '29941916753760267'
    }
  })
}

/**
* 编辑设备
* @param state.$router 路由
* @param id 设备id
*/
const editDevice = function(state, id) {
  state.$router.push({
    name: 'DeviceInfo',
    query: {
      // deviceId: id
      [DeviceEnum.DeviceId]: '29941916753760267'
    }
  })
}

/**
* 删除设备
* @param state.$alertDelete 提示框工具函数
* @param state.handleTools layout工能回调函数
* @param row 设备信息
*/
const deleteDevice = function(state, row?) {
  state.$alertDelete({
    type: '设备',
    msg: `删除操作不能恢复，确认删除设备"${row[DeviceEnum.DeviceName]}"吗？`,
    method: () => {},
    payload: {
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId],
      [DeviceEnum.ParentDeviceId]: row[DeviceEnum.ParentDeviceId]
    },
    onSuccess: () => {
      state.handleTools(ToolsEnum.RefreshDirectory)
      this.refreshDeviceList(state, 'true')
    }
  })
}

/**
* 刷新设备列表
* @param state.$router 页面路由实例
* @param state.$route 页面路由对象
* @param flag 刷新标志
*/
const refreshDeviceList = function(state, flag = 'true') {
  console.log(state.$route.query)
  state.$router.replace({
    query: {
      ...state.$route.query,
      deviceListRefreshFlag: flag
    }
  })
}

/**
* 同步设备
* @param state.loading 加载中状态
* @param state.handleTools layout工能回调函数
* @param state.pollingTimes 轮询次数
* @param state.$message 信息提示工具函数
*/
const syncDevice = function(state, id) {
  state.loading.syncDevice = true
  const param = {
    [DeviceEnum.DeviceId]: id
  }
  this.statusPolling(state, param).then(() => {
    state.handleTools(ToolsEnum.RefreshDirectory)
    state.pollingTimes = 1
  }).catch(e => {
    state.pollingTimes = 1
    state.$message.error(e && e.message)
  }).finally(() => {
    state.loading.syncDevice = false
  })
}

/**
* 轮询同步设备状态
* @param param 请求体 Object
*/
const statusPolling = function(state, param: any) {
  if (state.pollingTimes < 8) {
    state.pollingTimes += 1
  } else {
    state.pollingTimes = 8
  }
  return new Promise((resolve, reject) => {
    syncStatusPolling(param).then(res => {
      if (res.syncStatus === true) {
        setTimeout(() => {
          resolve(this.statusPolling(param))
        }, state.pollingTimes * 1000)
      } else {
        resolve(res)
      }
    }).catch(err => reject(err))
  })
}

/**
* 同步设备状态
*/
const syncDeviceStatus = async function(state, id, type) {
  let deviceIdAndTypes = []
  if (type === DeviceTypeEnum.Nvr) {
    deviceIdAndTypes.push({
      [DeviceEnum.DeviceId]: id,
      [DeviceEnum.DeviceType]: type
    })
  } else if (type === DeviceTypeEnum.Platform) {
    deviceIdAndTypes = state.deviceList.map(device => {
      return {
        [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId],
        [DeviceEnum.DeviceType]: 'platform,' + device[DeviceEnum.DeviceType]
      }
    })
  } else {
    deviceIdAndTypes = state.deviceList.map(device => {
      return {
        [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId],
        [DeviceEnum.DeviceType]: device[DeviceEnum.DeviceType]
      }
    })
  }
  try {
    state.loading.syncDeviceStatus = true
    await syncDeviceStatusApi({
      deviceIdAndTypes
    })
    state.handleTools(ToolsEnum.RefreshDirectory)
  } catch (e) {
    state.$message.error(e && e.message)
  } finally {
    state.loading.syncDeviceStatus = false
  }
}

/**
 * 查看通道
 */
const viewChannels = function(state, row) {
  console.log('ViewChannels', row[DeviceEnum.DeviceId])
}

const exportDeviceExcel = async function(state, policy) {
  state.loading.export = true
  try {
    let params: any = {

    }
    if (policy === ToolsEnum.ExportAll) {
      params.command = 'all'
    } else {
      params.command = 'selected'
      let deviceArr: any = []
      if (policy === ToolsEnum.ExportCurrentPage) {
        deviceArr = state.deviceList
      } else if (policy === ToolsEnum.ExportSelected) {
        deviceArr = state.selectedDeviceList
      }
      params.deviceIds = deviceArr.map((device: any) => {
        return { [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId] }
      })
    }
    await exportDevicesExcel(params)
  } catch (e) {
    state.$message.error('导出失败')
    console.log(e)
  }
  state.loading.export = false
}

// 导出设备表格
async function exportDevicesExcel(data: any) {
  let params: any = {
    groupId: data.groupId,
    inProtocol: data.inProtocol,
    dirId: data.dirId.toString(),
    parentDeviceId: data.parentDeviceId
  }
  // data.parentDeviceId && (params.parentDeviceId = data.parentDeviceId)
  try {
    if (data.command === 'all') {
      const query = this.$route.query
      params.deviceStatusKeys = query.deviceStatusKeys || undefined
      params.streamStatusKeys = query.streamStatusKeys || undefined
      params.deviceAddresses = query.deviceAddresses || undefined
      params.matchKeys = query.matchKeys
      params.searchKey = query.searchKey || undefined
      params.pageSize = 5000
      params.pageNum = 1
      var res = await exportDeviceAll(params)
    } else if (data.command === 'selected') {
      params.deviceIds = data.deviceIds
      res = await exportDeviceOption(params)
    }
    this.downloadFileUrl(`${params.inProtocol}导出设备表格`, res.exportFile)
  } catch (e) {
    console.log(e)
  }
}

/**
   * 导入设备表
   */
const uploadExcel = function(state, data: any) {
  console.log(data)
  // if (data.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || data.file.type === 'application/vnd.ms-excel') {
  //   state.dialog.uploadExcel = true
  //   state.selectedFile = data.file
  //   state.fileData = {
  //     groupId: this.groupId,
  //     inProtocol: this.inProtocol,
  //     dirId: this.dirId,
  //     fileName: data.file.name
  //   }
  //   if (this.isNVR) {
  //     this.fileData.parentDeviceId = this.deviceInfo.deviceId
  //     delete this.fileData.dirId
  //   }
  // } else {
  //   this.$message.error('导入文件必须为表格')
  // }
}

/**
   * 导出模板
   */
const exportTemplate = function(state) {
  console.log('exportTemplate')
  // let currentInProtocal: any = ['ehome', 'gb28181', 'rtsp', 'rtmp'].includes(this.inProtocol.toString()) ? this.inProtocol : 'gb28181'
  // this.exelType = 'template'
  // this.exelDeviceType = currentInProtocal
  // this.exelName = `${currentInProtocal}导入模板`
  // this.regionName = this.groupData?.regionName || ''
  // this.excelGroupDate = this.groupData
  // if (this.isNVR) {
  //   this.exelDeviceType = 'nvr'
  //   this.exelName = 'NVR添加子设备导入模板'
  //   this.excelInProtocol = this.deviceInfo.inProtocol
  //   this.parentDeviceId = this.deviceInfo.deviceId
  // }
  // this.exportExel()
}

/**
* 关闭目录对话框
* @param state.dialog 弹窗状态
* @param state.currentDevice 上级目录
* @param state.isBatchMoveDir 当前目录
* @param type 触发关闭窗口的事件类型
* @param isRefresh 是否更新列表
*/
const closeDialog = function(state, type: string, isfresh: any) {
  // @ts-ignore
  state.dialog[type] = false
  switch (type) {
    case 'moveDir':
      state.currentDevice = null
      state.isBatchMoveDir = false
  }
  if (isfresh === true) {
    state.handleListTools()
  }
}

export default {
  // 操作设备
  addDevice,
  viewDevice,
  editDevice,
  deleteDevice,
  syncDevice,
  syncDeviceStatus,
  statusPolling,
  refreshDeviceList,
  viewChannels,
  exportDeviceExcel,
  uploadExcel,
  exportTemplate
}
