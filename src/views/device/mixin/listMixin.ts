import axios from 'axios'
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { DeviceParams, DeviceStatus, StreamStatus, RecordStatus, DeviceGb28181Type, SipTransType, StreamTransType, TransPriority } from '@/dics'
import { Device } from '@/type/device'
import { GroupModule } from '@/store/modules/group'
import { deleteDevice, startDevice, stopDevice, getDevice, getDevices, startRecord, stopRecord, syncDevice, syncDeviceStatus } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MoveDir from '../components/dialogs/MoveDir.vue'
import UploadExcel from '../components/dialogs/UploadExcel.vue'
import Resource from '../components/dialogs/Resource.vue'
import { checkPermission } from '@/utils/permission'

@Component({
  components: {
    StatusBadge,
    MoveDir,
    UploadExcel,
    Resource
  }
})
export default class CreateMixin extends Vue {
  @Inject('deviceRouter')
  public deviceRouter!: Function
  @Inject('initDirs')
  public initDirs!: Function
  public checkPermission = checkPermission
  public deviceInfo: any = null
  public deviceList: Array<Device> = []
  public dirStats: any = null
  public selectedDeviceList: Array<Device> = []
  public currentDevice?: Device | null = null

  public deviceParams = DeviceParams
  public deviceStatus = DeviceStatus
  public streamStatus = StreamStatus
  private recordStatus = RecordStatus
  public deviceType = DeviceGb28181Type
  public sipTransType = SipTransType
  public streamTransType = StreamTransType
  public transPriority = TransPriority
  public parentDeviceId = ''
  public axiosSources: any[] = []

  public loading = {
    info: false,
    list: false,
    syncDevice: false,
    syncDeviceStatus: false
  }
  public dialog = {
    moveDir: false,
    uploadExcel: false,
    resource: false
  }
  public keyword = ''
  public filter: any = {
    deviceType: undefined,
    deviceStatus: undefined,
    streamStatus: undefined,
    recordStatus: undefined
  }
  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  // 是否批量移动
  public isBatchMoveDir = false
  // 筛选类型
  public filtersArray = {
    deviceType: this.dictToFilterArray(DeviceGb28181Type),
    deviceStatus: this.dictToFilterArray(DeviceStatus),
    streamStatus: this.dictToFilterArray(StreamStatus),
    recordStatus: this.dictToFilterArray(RecordStatus)
  }
  public autoStreamNumObj = {
    1: '主码流',
    2: '子码流',
    3: '第三码流'
  }

  public get inProtocol() {
    return this.$route.query.inProtocol
  }

  public get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  public get type() {
    return this.$route.query.type
  }

  public get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  public get isChannel() {
    return this.$route.query.isChannel === 'true' || (this.parentDeviceId && this.parentDeviceId !== '-1')
  }

  public get isPlatform() {
    return this.$route.query.type === 'platform'
  }

  public get isIPC() {
    return this.$route.query.type === 'ipc'
  }

  public get isDir() {
    return this.$route.query.type === 'dir'
  }

  public get isPlatformDir() {
    return this.$route.query.type === 'platformDir'
  }

  public get isAllowedDelete() {
    let validArr = [
      this.isPlatform,
      this.isPlatformDir,
      this.isDir,
      this.deviceInfo && this.deviceInfo.createSubDevice !== 1
    ]
    return validArr.includes(true)
  }

  public get groupId() {
    return GroupModule.group?.groupId
  }

  public get groupData() {
    return GroupModule.group
  }

  public get isCreateSubDevice() {
    return this.deviceInfo && this.deviceInfo.createSubDevice === 1
  }

  public get isManulNVR() {
    return this.isNVR && this.deviceInfo && this.deviceInfo.createSubDevice === 2
  }

  public get dirId() {
    return this.$route.query.dirId ? this.$route.query.dirId : 0
  }

  public get deviceId() {
    return this.$route.query.deviceId
  }

  public get hasFiltered() {
    return !!(this.filter.deviceType || this.filter.deviceStatus || this.filter.streamStatus || this.filter.recordStatus)
  }

  public get filterButtons() {
    const buttons = []
    for (let key in this.filter) {
      const value = this.filter[key]
      if (value) {
        buttons.push({
          key,
          value
        })
      }
    }
    return buttons
  }

  @Watch('$route.query')
  public onRouterChange() {
    this.reset()
  }

  @Watch('groupId')
  public onGroupIdChange() {
    this.reset()
  }

  @Watch('dirId')
  public onDirIdChange() {
    this.pager.pageNum = 1
  }

  @Watch('filter', { immediate: true, deep: true })
  public onFilterChange() {
    if (this.type === 'dir' || this.type === 'platformDir') this.getDeviceList()
    if (this.type === 'nvr') this.getDeviceInfo(this.type)
  }

  @Watch('deviceList.length')
  public onDeviceListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  public reset() {
    this.deviceInfo = null
    this.deviceList = []
    this.pager.pageNum = 1
    this.axiosSources.forEach((axiosSource: any) => {
      axiosSource.cancel()
    })
    this.init()
  }

  public mounted() {
    this.init()
    // 调整el-upload外框样式
    const uploadDiv: any = document.querySelector('.el-upload')?.parentNode
    uploadDiv && (
      uploadDiv.style.display = 'inline-block'
    ) && (
      uploadDiv.style.marginRight = '10px'
    )
  }

  /**
   * 初始化
   */
  public init() {
    this.parentDeviceId = ''
    if (!this.groupId || !this.inProtocol) return
    switch (this.type) {
      case 'platform':
        this.getDeviceInfo(this.type)
        this.getDeviceList()
        break
      case 'ipc':
      case 'nvr':
        if (!this.deviceId) return
        this.getDeviceInfo(this.type)
        break
      case 'dir':
      default:
        this.getDeviceList()
        break
    }
  }

  /**
   * 获取设备流信息
   */
  public getStreamStatus(statusArr: any, num: any) {
    if (!statusArr) {
      return false
    }
    let statusObj = statusArr.find((status: any) => status.streamNum === num)
    if (!statusObj) {
      return false
    } else {
      return statusObj.streamStatus
    }
  }

  /**
   * 获取设备信息
   */
  public async getDeviceInfo(type: string) {
    try {
      this.loading.info = true
      const axiosSource = axios.CancelToken.source()
      this.axiosSources.push(axiosSource)
      const res = await getDevice({
        inProtocol: this.inProtocol,
        deviceId: this.deviceId
      }, axiosSource.token)
      if (type === 'nvr' || type === 'platform') {
        this.deviceInfo = res
        let deviceList = this.deviceInfo.deviceChannels.map((channel: any) => {
          channel.deviceType = 'ipc'
          channel.multiStreamSize = this.deviceInfo.multiStreamSize
          channel.inProtocol = this.deviceInfo.inProtocol
          channel.transPriority = this.deviceInfo.transPriority
          channel.sipTransType = this.deviceInfo.sipTransType
          channel.streamTransType = this.deviceInfo.streamTransType
          channel.deviceName = channel.channelName
          return channel
        })
        if (type === 'nvr') {
          // nvr通道后端全量返回，前端做筛选
          deviceList = deviceList.filter((device: any) => {
            if (this.filter.deviceStatus && device.deviceStatus !== this.filter.deviceStatus) {
              return false
            }
            if (this.filter.streamStatus && device.streamStatus !== this.filter.streamStatus) {
              return false
            }
            if (this.filter.recordStatus && device.recordStatus.toString() !== this.filter.recordStatus.toString()) {
              return false
            }
            return true
          })
          this.deviceList = deviceList.sort((left: any, right: any) => left.channelNum - right.channelNum)
        } else {
          this.deviceList = deviceList
        }
      } else if (type === 'ipc') {
        this.deviceInfo = res
        this.parentDeviceId = res.parentDeviceId
        if (res.parentDeviceId !== '-1' && res.deviceChannels.length) {
          res.deviceId = res.deviceChannels[0].deviceId
          res.deviceName = res.deviceChannels[0].channelName
          res.channelNum = res.deviceChannels[0].channelNum
          res.deviceStatus = res.deviceChannels[0].deviceStatus
          res.recordStatus = res.deviceChannels[0].recordStatus
          res.deviceStreams = res.deviceChannels[0].deviceStreams
          res.recordTaskId = res.deviceChannels[0].recordTaskId
        }
        this.deviceList = [ res ]
      }
    } catch (e) {
      this.deviceInfo = null
      this.deviceList = []
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 加载设备列表
   */
  public async getDeviceList() {
    try {
      let params: any = {
        groupId: this.groupId,
        inProtocol: this.inProtocol,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        deviceType: this.filter.deviceType,
        deviceStatus: this.filter.deviceStatus,
        streamStatus: this.filter.streamStatus,
        recordStatus: this.filter.recordStatus
      }
      let res: any
      this.loading.list = true
      params.dirId = this.dirId ? this.dirId : 0
      const axiosSource = axios.CancelToken.source()
      this.axiosSources.push(axiosSource)
      res = await getDevices(params, axiosSource.token)
      this.deviceList = res.devices
      this.dirStats = res.dirStats
      this.pager = {
        pageNum: res.pageNum,
        pageSize: res.pageSize,
        total: res.totalNum
      }
    } catch (e) {
      this.deviceList = []
    } finally {
      this.loading.list = false
    }
  }

  /**
   * 渲染NVR数量
   */
  public renderNvrSize(dirStats: any) {
    if (dirStats && dirStats.nvrSize) {
      const size = dirStats.nvrSize.split(':')
      if (size.length) {
        return [
          {
            label: 'NVR',
            value: size[0]
          },
          {
            label: '通道',
            value: size[1]
          }
        ]
      }
    }
  }

  /**
   * 渲染NVR数量
   */
  public renderPlatformSize(dirStats: any) {
    if (dirStats && dirStats.platformSize) {
      const size = dirStats.platformSize.split(':')
      if (size.length) {
        return [
          {
            label: '平台',
            value: size[0]
          },
          {
            label: '通道',
            value: size[1]
          }
        ]
      }
    }
  }

  /**
   * 创建设备
   */
  public goToCreate() {
    this.deviceRouter({
      id: this.dirId,
      deviceId: this.deviceId,
      type: 'create',
      isChannel: this.isNVR
    })
  }

  /**
   * 根据类型进入下一级页面
   */
  public rowClick(device: Device, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
      const type = device.deviceType === 'ipc' ? 'detail' : device.deviceType
      this.deviceRouter({
        id: device.deviceId,
        type
      })
    }
  }

  /**
   * 更多菜单
   */
  public handleMore(command: any) {
    switch (command.type) {
      case 'detail':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'detail'
        })
        break
      case 'update':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'update'
        })
        break
      case 'delete':
        this.deleteDevice(command.device)
        break
      case 'nvr':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'nvr'
        })
        break
      case 'move':
        this.openDialog('moveDir', command.device)
        break
      case 'startDevice':
        if (command.device.inProtocol === 'ehome') {
          command.device.streamNum = command.num
        }
        this.startDevice(command.device)
        break
      case 'stopDevice':
        if (command.device.inProtocol === 'ehome') {
          command.device.streamNum = command.num
        }
        this.stopDevice(command.device)
        break
      case 'startRecord':
        this.startRecord(command.device)
        break
      case 'stopRecord':
        this.stopRecord(command.device)
        break
      case 'updateResource':
        this.openDialog('resource', command.device)
        break
    }
  }

  /**
   * 批量操作菜单
   */
  public handleBatch(command: any) {
    if (!this.selectedDeviceList.length) {
      this.$alertError('请先选择设备')
      return
    }
    switch (command) {
      case 'move':
        this.batchMoveDir()
        break
      case 'delete':
        this.batchDeleteDevice()
        break
      case 'startDevice':
        this.batchStartOrStopDevice('start')
        break
      case 'stopDevice':
        this.batchStartOrStopDevice('stop')
        break
    }
  }

  /**
   * 预览
   */
  public goToPreview(previewTab: string, device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'preview',
      previewTab
    })
  }

  /**
   * 查看设备详情
   */
  public goToDetail(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'detail'
    })
  }

  /**
   * 编辑设备
   */
  public goToUpdate(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'update'
    })
  }

  /**
   * 删除设备
   */
  public deleteDevice(device: Device) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除设备"${device.deviceName}"`,
      method: deleteDevice,
      payload: {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        parentDeviceId: device.parentDeviceId
      },
      onSuccess: () => {
        this.init()
        this.initDirs()
      }
    })
  }

  /**
   * 批量删除设备
   */
  public batchDeleteDevice() {
    const h: Function = this.$createElement
    this.$alertDelete({
      type: '设备',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          '删除操作不能恢复，确定要删除选中的设备吗？'
        ),
        h(
          'div',
          { class: 'batch-device-list' },
          this.selectedDeviceList.map((device: Device) => {
            return h('p', undefined, [
              h('span', { class: 'device-name' }, device.deviceName)
            ])
          })
        )
      ]),
      method: () => {
        return Promise.all(
          this.selectedDeviceList.map((device: Device) => {
            return deleteDevice({
              deviceId: device.deviceId,
              inProtocol: this.inProtocol,
              parentDeviceId: device.parentDeviceId
            })
          })
        )
      },
      payload: null,
      onSuccess: () => {
        this.init()
        this.initDirs()
      }
    })
  }

  /**
   * 启动设备
   */
  public async startDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        inType: device.inType,
        streamNum: device.streamNum
      }
      await startDevice(params)
      this.$message.success('已通知启用设备')
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 停用设备
   */
  public async stopDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        inType: device.inType,
        streamNum: device.streamNum
      }
      await stopDevice(params)
      this.$message.success('已通知停用设备')
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 开始录像
   */
  public async startRecord(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol
      }
      await startRecord(params)
      this.$message.success('已通知开始录制')
      this.init()
    } catch (e) {
      this.$message.error(e && e.message)
      console.error(e)
    }
  }

  /**
   * 停止录像
   */
  public async stopRecord(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        recordTaskId: device.recordTaskId,
        inProtocol: this.inProtocol
      }
      await stopRecord(params)
      this.$message.success('已通知停止录像')
      this.init()
    } catch (e) {
      this.$message.error(e && e.message)
      console.error(e)
    }
  }

  /**
   * 批量启用/停用设备
   */
  public batchStartOrStopDevice(type: string) {
    const deviceList = this.selectedDeviceList.filter((device: Device) => {
      return device.deviceType === 'ipc'
    })
    const method = type === 'start' ? startDevice : stopDevice
    const methodStr = type === 'start' ? '启用' : '停用'
    const h: Function = this.$createElement
    this.$msgbox({
      title: `确认${methodStr}选中的设备吗？`,
      message: h('div', undefined, [
        h(
          'div',
          { class: 'batch-device-list' },
          deviceList.map((device: Device) => {
            return h('p', undefined, [
              h('span', { class: 'device-name' }, device.deviceName)
            ])
          })
        )
      ]),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: async(action: any, instance: any, done: Function) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '...'
          try {
            await Promise.all(deviceList.map((device: Device) => {
              return method({
                deviceId: device.deviceId,
                inProtocol: this.inProtocol,
                inType: device.inType
              })
            }))
            done()
          } catch (e) {
            this.$message.error(e && e.message)
          } finally {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定'
          }
        } else {
          done()
        }
      }
    }).then(() => {
      this.$message.success(`已通知${methodStr}设备`)
    }).catch((e: any) => {
      if (e === 'cancel' || e === 'close') return
      this.$message.error(e && e.message)
    })
  }

  /**
   * 批量移动
   */
  public batchMoveDir() {
    this.isBatchMoveDir = true
    this.openDialog('moveDir', null)
  }

  /**
   * 设备同步
   */
  public async syncDevice() {
    try {
      this.loading.syncDevice = true
      await syncDevice({
        deviceId: this.deviceInfo.deviceId,
        inProtocol: this.inProtocol
      })
      this.init()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.syncDevice = false
    }
  }

  /**
   * 设备同步状态
   */
  public async syncDeviceStatus() {
    let deviceIdAndTypes = []
    if (this.isNVR) {
      deviceIdAndTypes.push({
        deviceId: this.deviceId,
        devicieType: 'nvr'
      })
    } else {
      deviceIdAndTypes = this.deviceList.map(device => {
        return {
          deviceId: device.deviceId,
          deviceType: device.deviceType
        }
      })
    }
    try {
      this.loading.syncDeviceStatus = true
      await syncDeviceStatus({
        deviceIdAndTypes,
        inProtocol: this.inProtocol
      })
      this.init()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.syncDeviceStatus = false
    }
  }

  /**
   * 打开对话框
   */
  public openDialog(type: string, payload: any) {
    switch (type) {
      case 'moveDir':
        this.currentDevice = payload
        this.dialog.moveDir = true
        break
      case 'resource':
        this.currentDevice = payload
        this.dialog.resource = true
        break
    }
  }

  /**
   * 关闭对话框
   */
  public closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'moveDir':
        this.currentDevice = null
        this.isBatchMoveDir = false
    }
    if (payload === true) {
      this.init()
    }
  }

  /**
   * 表格多选框变化
   */
  public handleSelectionChange(devices: Array<Device>) {
    this.selectedDeviceList = devices
  }

  /**
   * 当表格的筛选条件发生变化
   */
  public filterChange(filters: any) {
    for (let key in filters) {
      const values = filters[key]
      if (values.length) {
        this.filter[key] = values[0]
      } else {
        this.filter[key] = undefined
      }
    }
  }

  /**
   * 清空指定筛选条件
   */
  public clearFilter(key: string) {
    this.filter[key] = undefined
    const deviceTable: any = this.$refs.deviceTable
    deviceTable.clearFilter(key)
  }

  /**
   * 将字典转为筛选数组
   */
  public dictToFilterArray(dict: any) {
    const filterArray = []
    for (let key in dict) {
      filterArray.push({
        text: dict[key],
        value: key
      })
    }
    return filterArray
  }

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }
}
