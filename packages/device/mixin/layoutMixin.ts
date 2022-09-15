import { Component, Vue, Provide } from 'vue-property-decorator'
import { DeviceTypeEnum, ToolsEnum } from '../enums/index'
import { AdvancedSearch as AdvancedSearchType } from '../type/advancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import AdvancedSearch from '../components/AdvancedSearch.vue'
import { deleteDir } from '../api/dir'
import { getNodeInfo } from '../api/device'
import { Console } from 'console'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class DetailMixin extends Vue {
  public deviceManager = DeviceManager
  public toolsEnum = ToolsEnum
  public deviceTypeEnum = DeviceTypeEnum
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
  public deleteDir = deleteDir
  public dialog = {
    [ToolsEnum.EditDirectory]: false,
    [ToolsEnum.SortDirectory]: false
  }
  public loading = {
    tree: false
  }
  // 功能回调字典
  public handleToolsMap = {
    // 设备树相关
    [ToolsEnum.RefreshDirectory]: () => DeviceManager.advanceSearch(this),
    [ToolsEnum.ExportSearchResult]: () => DeviceManager.exportSearchResult(this),
    [ToolsEnum.AddDirectory]: (data) => DeviceManager.openDirectoryDialog(this, ToolsEnum.AddDirectory, data),
    [ToolsEnum.EditDirectory]: (data) => DeviceManager.openDirectoryDialog(this, ToolsEnum.EditDirectory, data),
    [ToolsEnum.SortDirectory]: (data) => DeviceManager.openDirectoryDialog(this, ToolsEnum.SortDirectory, data),
    [ToolsEnum.CloseDialog]: (type, isfresh) => DeviceManager.closeDirectoryDialog(this, type, isfresh),
    [ToolsEnum.DeleteDirectory]: (data) => DeviceManager.deleteDir(this, data),
    [ToolsEnum.SetStreamNum]: (data, streamNum) => DeviceManager.openScreen(this, data, streamNum),
    [ToolsEnum.Polling]: (node) => DeviceManager.executeQueue(this, node, !node, 'polling'),
    [ToolsEnum.AutoPlay]: (node) => DeviceManager.executeQueue(this, node, !node, 'autoPlay'),
    [ToolsEnum.IntervalChange]: (interval) => DeviceManager.intervalChange(this, interval),
    [ToolsEnum.StopPolling]: () => DeviceManager.stopPolling(this),
    [ToolsEnum.PausePolling]: () => DeviceManager.pausePolling(this),
    [ToolsEnum.ResumePolling]: () => DeviceManager.resumePolling(this),
    [ToolsEnum.AdvanceSearch]: (filterData) => DeviceManager.advanceSearch(this, filterData),
    [ToolsEnum.RefreshDeviceList]: (flag?) => DeviceManager.refreshDeviceList(this, flag)
  }
  /* 设备目录树 */
  public get deviceTree() {
    return this.$refs.deviceTree as any
  }

  /* 设备目录树是否懒加载依据 */
  public get lazy(): boolean {
    return ['deviceStatusKeys', 'streamStatusKeys', 'deviceAddresses', 'matchKeys', 'searchKey'].every(param => !this.$route.query[param])
  }

  /* 播放器管理实例 */
  public get screenManager() {
    return (this.$refs.screenBoard as any)!.screenManager
  }

  /* 视频队列执行器 */
  public get queueExecutor() {
    return this.screenManager && this.screenManager.refs.queueExecutor
  }

  public mounted() {
    DeviceManager.initAdvancedSearch(this)
  }

  /**
   * 懒加载时加载节点方法
   * @param node 节点信息
   */
  public treeLoad = async function(node) {
    let children
    if (node.level === 0) {
      this.loading.tree = true
      children = await getNodeInfo('root')
      this.deviceTree.loadChildren('01')
    } else if (node.level < 4) {
      children = await getNodeInfo('node')
    } else if (node.level === 4) {
      children = await getNodeInfo('leaf')
    } else {
      children = []
    }
    this.loading.tree = false
    return children
  }.bind(this)

  /**
   * 左侧功能触发回调
   * @param type 功能类型
   */
  @Provide('handleTools')
  public handleTools(type: string, ...payload: any) {
    console.log(type, ...payload)
    this.handleToolsMap[type](...payload)
  }
}
