import { DeviceEnum, DeviceTypeEnum, ToolsEnum } from '../../enums/index'
import {
  deleteDevice as deleteDeviceApi,
  syncDevice as syncDeviceApi,
  syncDeviceStatus as syncDeviceStatusApi,
  syncStatusPolling,
  exportDeviceAll,
  exportDeviceOption,
  startDevice,
  stopDevice,
  startRecord,
  stopRecord
} from '../../api/device'

import ExportExcelTemplate from './DeviceExportTemplate'

/**
 * ===============================================================================================
 * 操作设备
 */
/**
 * 创建设备
 * @param state.$router 路由
 * @param dirId 目录id
 */
const addDevice = function (state, dirId) {
  state.$router.push({
    name: 'DeviceCreate',
    query: {
      ...state.$route.query,
      dirId
    }
  })
}

/**
 * 查看设备详情
 * @param state.$router 路由
 * @param id 设备id
 * @param type 设备类型
 */
const viewDevice = function (state, id, type) {
  state.$router.push({
    name: 'DeviceInfo',
    query: {
      ...state.$route.query,
      [DeviceEnum.DeviceId]: id,
      [DeviceEnum.DirId]: '',
      type
    }
  })
}

/**
 * 编辑设备
 * @param state.$router 路由
 * @param id 设备id
 * @param type 设备类型
 */
const editDevice = function (state, id, type) {
  state.$router.push({
    name: 'DeviceInfo',
    query: {
      ...state.$route.query,
      deviceId: id,
      dirId: '',
      type
    },
    params: {
      isEdit: 'true',
    }
  })
}

/**
 * 删除设备
 * @param state.$alertDelete 提示框工具函数
 * @param state.handleTools layout工能回调函数
 * @param data 设备信息
 * @param inProtocol 删除协议
 */
const deleteDevice = function (state, data?, inProtocol?) {
  console.log(data, 111111, inProtocol)
  if (data instanceof Array) {
    // 批量操作
    const h: Function = state.$createElement
    state.$alertDelete({
      type: '设备',
      msg: h('div', undefined, [
        h('span', undefined, '删除操作不能恢复，确定要删除选中的设备吗？'),
        h(
          'div',
          { class: 'batch-list' },
          data.map(device => {
            return h('p', undefined, [h('span', { class: 'device-name' }, device[DeviceEnum.DeviceName])])
          })
        )
      ]),
      method: () => {
        return Promise.all(
          data.map(device => {
            return deleteDeviceApi({
              [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId],
              [DeviceEnum.ParentDeviceId]: device[DeviceEnum.ParentDeviceId]
            })
          })
        )
      },
      payload: null,
      onSuccess: () => {
        state.handleTools(ToolsEnum.RefreshDirectory)
        state.handleTools(ToolsEnum.RefreshRouterView)
      }
    })
  } else {
    console.log(data)
    // 单个操作
    state.$alertDelete({
      type: '设备',
      msg: `删除操作不能恢复，确认删除设备"${data[DeviceEnum.DeviceName]}"吗？`,
      method: deleteDeviceApi,
      payload: {
        [DeviceEnum.DeviceId]: data[DeviceEnum.DeviceId],
        [DeviceEnum.ParentDeviceId]: data[DeviceEnum.ParentDeviceId],
        [DeviceEnum.InProtocol]: inProtocol
      },
      onSuccess: () => {
        // 判断是否完全删除
        // if (inProtocol && data[DeviceEnum.InProtocol].length < 2) {
        //   state.handleTools(ToolsEnum.GoBack, 1)
        // } else {
          state.handleTools(ToolsEnum.RefreshDirectory)
          state.handleTools(ToolsEnum.RefreshRouterView)
        // }
      }
    })
  }
}

/**
 * 刷新设备列表
 * @param state.$router 页面路由实例
 * @param state.$route 页面路由对象
 * @param flag 刷新标志
 */
const refreshRouterView = function (state, flag = 'true') {
  state.$router.replace({
    query: {
      ...state.$route.query,
      refreshFlag: flag
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
const syncDevice = function (state, id) {
  state.loading.syncDevice = true
  const param = {
    [DeviceEnum.DeviceId]: id
  }
  this.statusPolling(state, param)
    .then(() => {
      state.handleTools(ToolsEnum.RefreshDirectory)
      state.pollingTimes = 1
    })
    .catch(e => {
      state.pollingTimes = 1
      state.$message.error(e && e.message)
    })
    .finally(() => {
      state.loading.syncDevice = false
    })
}

/**
 * 轮询同步设备状态
 * @param param 请求体 Object
 */
const statusPolling = function (state, param: any) {
  if (state.pollingTimes < 8) {
    state.pollingTimes += 1
  } else {
    state.pollingTimes = 8
  }
  return new Promise((resolve, reject) => {
    syncStatusPolling(param)
      .then(res => {
        if (res.syncStatus === true) {
          setTimeout(() => {
            resolve(this.statusPolling(state, param))
          }, state.pollingTimes * 1000)
        } else {
          resolve(res)
        }
      })
      .catch(err => reject(err))
  })
}

/**
 * 同步设备状态
 */
const syncDeviceStatus = async function (getVueComponent, id, type) {
  const state = getVueComponent()
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
    state.handleTools(ToolsEnum.RefreshRouterView)
  } catch (e) {
    state.$message.error(e && e.message)
  } finally {
    state.loading.syncDeviceStatus = false
  }
}

/**
 * 查看通道
 */
const viewChannels = function (state, row) {
  state.handleTreeNode({ id: row[DeviceEnum.DeviceId], type: row[DeviceEnum.DeviceType] })
}

// 导出设备
const exportDeviceExcel = async function (state, policy, data) {
  state.loading.export = true
  try {
    let params: any = {}
    if (policy === ToolsEnum.ExportAll) {
      params = {
        command: 'all'
      }
    } else {
      params = {
        command:'selected',
        policy,
        ...data
      }
    }
    await exportDeviceFile(params)
  } catch (e) {
    state.$message.error('导出失败')
    console.log(e)
  }
  state.loading.export = false
}

const exportDeviceFile = async function (data:any) {
  try {
    let res:any = {}
    if(data.command === 'all'){
      const param = {
        parentDeviceId: data.parentDeviceId,
        dirId: data.dirId.toString()  ,
        sortBy: "",
        sortDirection: "desc",
        pageNum: 1,
        pageSize: 9999
      }
      res = await exportDeviceAll(param)
    } else {
      let deviceArr: any = []
      if (data.policy === ToolsEnum.ExportCurrentPage) {
        deviceArr = data.deviceList
      } else if (data.policy === ToolsEnum.ExportSelected) {
        deviceArr = data.selectedDeviceList
      }
      const deviceIds = deviceArr.map((device: any) => {
        return { [DeviceEnum.DeviceId]: device[DeviceEnum.DeviceId] }
      })
      const param={
        deviceIds
      }
      res = await exportDeviceOption(param)
    }
    this.downloadFileUrl('设备表格', res.exportFile)
  } catch (error) {
    console.log(error)
  }

}

/**
 * 配置子通道
 * @param state.$router 路由
 * @param dirId 目录id
 */
 const configureChannels = function (state) {
  state.$router.push({
    name: 'ConfigureChannels',
    query: {
      ...state.$route.query,
    }
  })
}

// 导出设备表格
async function exportDevicesExcel(data: any) {
  const params: any = {
    groupId: data.groupId,
    inProtocol: data.inProtocol,
    dirId: data.dirId.toString(),
    parentDeviceId: data.parentDeviceId
  }
  // data.parentDeviceId && (params.parentDeviceId = data.parentDeviceId)
   let res
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
      res = await exportDeviceAll(params)
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
const uploadExcel = function (state, data: any) {
  console.log(data)
  // if (data.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || data.file.type === 'application/vnd.ms-excel') {
  // state.dialog.uploadExcel = true
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
const exportTemplate = function (state) {
  ExportExcelTemplate.exportTemplate(state)
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
 * 启用/停用设备
 */
const startOrStopDevice = async function (state, type, row?) {
  const method = type === ToolsEnum.StartDevice ? startDevice : stopDevice
  const methodStr = type === ToolsEnum.StartDevice ? '启用' : '停用'
  if (row) {
    // 单个操作
    try {
      const params: any = {
        [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId]
      }
      await method(params)
      state.$message.success(`已通知${methodStr}设备`)
      state.handleTools(ToolsEnum.RefreshDirectory)
    } catch (e) {
      state.$message.error(e && e.message)
    }
  } else {
    // 批量操作
    const deviceList = state.selectedDeviceList.filter(device => {
      return device[DeviceEnum.DeviceType] === DeviceTypeEnum.Ipc
    })
    const h: Function = state.$createElement
    state
      .$msgbox({
        title: `确认${methodStr}选中的设备吗？`,
        message: h('div', undefined, [
          h(
            'div',
            { class: 'batch-list' },
            deviceList.map(device => {
              return h('p', undefined, [h('span', { class: 'device-name' }, device.deviceName)])
            })
          )
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action: any, instance: any, done: Function) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '...'
            try {
              await Promise.all(
                deviceList.map(device => {
                  return method({
                    [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId]
                  })
                })
              )
              done()
            } catch (e) {
              state.$message.error(e && e.message)
            } finally {
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '确定'
            }
          } else {
            done()
          }
        }
      })
      .then(() => {
        state.$message.success(`已通知${methodStr}设备`)
        state.handleTools(ToolsEnum.RefreshDirectory)
      })
      .catch(e => {
        if (e === 'cancel' || e === 'close') return
        state.$message.error(e && e.message)
      })
  }
}

/**
 * 开始/停止录像
 */
const startOrStopRecord = async function (state, type, row) {
  const method = type === ToolsEnum.StartRecord ? startRecord : stopRecord
  const methodStr = type === ToolsEnum.StartRecord ? '开始' : '停止'
  try {
    const params: any = {
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId]
    }
    await method(params)
    state.$message.success(`已通知${methodStr}录制`)
    state.handleTools(ToolsEnum.RefreshDirectory)
  } catch (e) {
    state.$message.error(e && e.message)
    console.error(e)
  }
}

/**
 * 打开设备列表对话框
 * @param getVueComponent 获取Vue实例函数
 * @param state.dialog 弹窗状态
 * @param state.currentDevice 当前设备
 * @param state.isBatchMoveDir 是否为批量操作
 * @param type 触发打开窗口的事件类型
 * @param row 设备信息
 */
const openListDialog = function (getVueComponent, type: string, row?: any) {
  const state = getVueComponent()
  switch (type) {
    case ToolsEnum.MoveDevice:
      state.currentDevice = row
      state.isBatchMoveDir = !row
      state.dialog[ToolsEnum.MoveDevice] = true
      break
    case ToolsEnum.UpdateResource:
      state.currentDevice = row
      state.dialog[ToolsEnum.UpdateResource] = true
      break
  }
}

/**
 * 关闭目录对话框
 * @param state.dialog 弹窗状态
 * @param state.currentDevice 当前设备
 * @param state.isBatchMoveDir 是否为批量操作
 * @param type 触发关闭窗口的事件类型
 * @param isRefresh 是否更新列表
 */
const closeListDialog = function (state, type: string, isfresh: any) {
  state.dialog[type] = false
  switch (type) {
    case ToolsEnum.MoveDevice:
      state.currentDevice = null
      state.isBatchMoveDir = false
  }
  if (isfresh === true) {
    state.handleTools(ToolsEnum.RefreshDirectory)
    state.handleTools(ToolsEnum.RefreshRouterView)
  }
}

/**
 * 跳转面包屑层级
 * @param getVueComponent 获取Vue实例函数
 * @param level 返回层级数（0/1/2...）
 */
const goBack = function (
  getVueComponent: any,
  level: number
) {
  const state: { breadcrumb: any; handleTreeNode: any, $router: any, $route: any } = getVueComponent()
  const pathList = state.breadcrumb.pathList || []
  // 取当前path的向上level级/根目录
  const target = pathList[pathList.length - 1 - level] || { id: '' }
  state.handleTreeNode(target)
}

/**
 * 查看设备事件
 * @param state.$router 路由
 * @param row 设备信息
 */
const previewEvents = function (state, row?: any) {
  state.$router.push({
    name: 'DeviceEvents',
    query: {
      ...state.$route.query,
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId],
      [DeviceEnum.DirId]: '',
      type: row[DeviceEnum.DeviceType]
    }
  })
}

/**
 * 实时预览
 * @param state.$router 路由
 * @param row 设备信息
 */
const previewVideo = function (state, row?: any) {
  state.$router.push({
    name: 'DevicePreview',
    query: {
      ...state.$route.query,
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId],
      [DeviceEnum.DirId]: '',
      type: row[DeviceEnum.DeviceType]
    }
  })
}

/**
 * 录像回放
 * @param state.$router 路由
 * @param row 设备信息
 */
const replayVideo = function (state, row?: any) {
  state.$router.push({
    name: 'DeviceReplay',
    query: {
      ...state.$route.query,
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId],
      [DeviceEnum.DirId]: '',
      type: row[DeviceEnum.DeviceType]
    }
  })
}

/**
 * 视图查看
 * @param state.$router 路由
 * @param row 设备信息
 */
const previewViid = function (state, row?: any) {
  state.$router.push({
    name: 'DeviceViid',
    query: {
      ...state.$route.query,
      [DeviceEnum.DeviceId]: row[DeviceEnum.DeviceId],
      [DeviceEnum.DirId]: '',
      type: row[DeviceEnum.DeviceType]
    }
  })
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
  refreshRouterView,
  viewChannels,
  configureChannels,
  exportDeviceExcel,
  uploadExcel,
  exportTemplate,
  startOrStopDevice,
  startOrStopRecord,
  openListDialog,
  closeListDialog,
  previewEvents,
  previewVideo,
  replayVideo,
  previewViid,
  goBack
}
