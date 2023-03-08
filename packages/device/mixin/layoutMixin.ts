import { Component, Vue, Provide } from 'vue-property-decorator'
import { DeviceTypeEnum, DirectoryTypeEnum, ToolsEnum, PollingStatusEnum, StatusEnum, DeviceInTypeEnum } from '../enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { AdvancedSearch as AdvancedSearchType } from '../type/AdvancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import DeviceScreen from '../services/Device/DeviceScreen'
import PollingMask from '@vss/device/components/PollingMask.vue'
import AdvancedSearch from '@vss/device/components/AdvancedSearch.vue'
import { deleteDir, getNodeInfo } from '@vss/device/api/dir'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  components: {
    AdvancedSearch,
    PollingMask
  }
})
export default class LayoutMixin extends Vue {
  public deviceInType: DeviceInTypeEnum
  public deviceManager = DeviceManager
  public toolsEnum = ToolsEnum
  public deviceTypeEnum = DeviceTypeEnum
  public policyEnum = PolicyEnum
  public statusEnum = StatusEnum
  public checkPermission = checkPermission
  // 设备搜索条件表单
  public advancedSearchForm: AdvancedSearchType = {
    deviceStatusKeys: [],
    streamStatusKeys: [],
    deviceAddresses: {
      code: '',
      level: ''
    },
    matchKeys: [],
    inputKey: '',
    searchKey: '',
    revertSearchFlag: false
  }
  // 树是否懒加载标志
  // public lazy: boolean = true
  public treeSearchResult: any = []
  // 编辑目录标志
  public parentDir = null
  // 创建目录标志
  public currentDir = null
  // 排序目录标志
  public sortDir = null
  public sortNode = null
  // 轮询状态
  public pollingStatus = PollingStatusEnum.Free
  // 轮询时间
  public pollingInterval = 20
  public deleteDir = deleteDir
  public dialog = {
    [ToolsEnum.EditDirectory]: false,
    [ToolsEnum.SortDirectory]: false
  }
  public loading = {
    tree: false
  }
  public getVueComponent() {
    return this
  }
  
  // 功能回调字典
  public handleToolsMap = {
    // 设备树相关
    [ToolsEnum.RefreshDirectory]: () => {
      DeviceScreen.stopPolling(this.getVueComponent)
      DeviceManager.advanceSearch(this)
    },
    [ToolsEnum.ExportSearchResult]: () => DeviceManager.exportSearchResult(this),
    [ToolsEnum.AddDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.AddDirectory, data || { id: '', type: DirectoryTypeEnum.Dir }),
    [ToolsEnum.EditDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.EditDirectory, data),
    [ToolsEnum.SortDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.SortDirectory, data || { id: '', type: DirectoryTypeEnum.Dir }),
    [ToolsEnum.CloseDialog]: (type, isfresh) => DeviceManager.closeDirectoryDialog(this.getVueComponent, type, isfresh),
    [ToolsEnum.DeleteDirectory]: data => DeviceManager.deleteDir(this.getVueComponent, data),
    [ToolsEnum.SetStreamNum]: (data, streamNum) => DeviceManager.openScreen(this.getVueComponent, data, streamNum),
    [ToolsEnum.Polling]: (data, status) => DeviceScreen.executeQueue(this.getVueComponent, data, !data, 'polling', status),
    [ToolsEnum.AutoPlay]: (data, status) => DeviceScreen.executeQueue(this.getVueComponent, data, !data, 'autoPlay', status),
    [ToolsEnum.IntervalChange]: interval => DeviceScreen.intervalChange(this.getVueComponent, interval),
    [ToolsEnum.StopPolling]: () => DeviceScreen.stopPolling(this.getVueComponent),
    [ToolsEnum.PausePolling]: () => DeviceScreen.pausePolling(this.getVueComponent),
    [ToolsEnum.ResumePolling]: () => DeviceScreen.resumePolling(this.getVueComponent),
    [ToolsEnum.AdvanceSearch]: filterData => DeviceManager.advanceSearch(this, filterData),
    [ToolsEnum.RefreshRouterView]: (flag?) => DeviceManager.refreshRouterView(this, flag),
    [ToolsEnum.GoBack]: (level) => DeviceManager.goBack(this.getVueComponent, level),
    [ToolsEnum.StartDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StartDevice, row),
    [ToolsEnum.StopDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StopDevice, row),
    [ToolsEnum.StartRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StartRecord, row),
    [ToolsEnum.StopRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StopRecord, row),
    [ToolsEnum.DeleteDevice]: (row, inProtocol) => DeviceManager.deleteDevice(this, row, inProtocol)
  }

  private get currentDirId() {
    return this.$route.query.dirId as string
  }

  private get currentDirType() {
    return this.$route.query.type as DirectoryTypeEnum || DirectoryTypeEnum.Dir
  }
  
  /* 设备目录树 */
  public get deviceTree() {
    return this.$refs.deviceTree as any
  }

  /* 面包屑 */
  public get breadcrumb() {
    return this.$refs.breadcrumb as any
  }

  /* 设备目录树是否懒加载依据 */
  public get lazy(): boolean {
    return ['deviceStatusKeys', 'streamStatusKeys', 'deviceAddresses', 'matchKeys', 'searchKey'].every(
      param => !this.$route.query[param]
    )
  }

  public mounted() {
    DeviceManager.initAdvancedSearch(this)
  }

  /**
   * 左侧功能触发回调
   * @param type 功能类型
   */
  @Provide('handleTools')
  public handleTools(type: string, ...payload: any) {
    console.log(type, ...payload)
    this.handleToolsMap[type](...payload)
  }

  // 拼接 path
  private concatPath(node: any) {
    if (typeof(node.parent.label) === 'undefined') return ''
    const label = node.parent.label ? node.parent.label : ''
    return this.concatPath(node.parent) + '/' + label
  }

}
