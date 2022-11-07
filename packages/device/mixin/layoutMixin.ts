import { Component, Vue, Provide } from 'vue-property-decorator'
import { DeviceTypeEnum, DirectoryTypeEnum, ToolsEnum, PollingStatusEnum } from '../enums/index'
import { AdvancedSearch as AdvancedSearchType } from '../type/AdvancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import DeviceScreen from '../services/Device/DeviceScreen'
import AdvancedSearch from '@vss/device/components/AdvancedSearch.vue'
import { deleteDir, getNodeInfo } from '@vss/device/api/dir'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class LayoutMixin extends Vue {
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

  // public treeNodeInfo: any = {}

  // public get getTreeNodeInfo() {
  //   return this.treeNodeInfo
  // }

  public getVueComponent() {
    return this
  }
  
  // 功能回调字典
  public handleToolsMap = {
    // 设备树相关
    [ToolsEnum.RefreshDirectory]: () => DeviceManager.advanceSearch(this),
    [ToolsEnum.ExportSearchResult]: () => DeviceManager.exportSearchResult(this),
    [ToolsEnum.AddDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.AddDirectory, data || { id: '', type: DirectoryTypeEnum.Dir }),
    [ToolsEnum.EditDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.EditDirectory, data),
    [ToolsEnum.SortDirectory]: data => DeviceManager.openDirectoryDialog(this.getVueComponent, ToolsEnum.SortDirectory, data || { id: '', type: DirectoryTypeEnum.Dir }),
    [ToolsEnum.CloseDialog]: (type, isfresh) => DeviceManager.closeDirectoryDialog(this.getVueComponent, type, isfresh),
    [ToolsEnum.DeleteDirectory]: data => DeviceManager.deleteDir(this.getVueComponent, data),
    [ToolsEnum.SetStreamNum]: (data, streamNum) => DeviceManager.openScreen(this, data, streamNum),
    [ToolsEnum.Polling]: node => DeviceScreen.executeQueue(this.getVueComponent, node, !node, 'polling'),
    [ToolsEnum.AutoPlay]: node => DeviceScreen.executeQueue(this.getVueComponent, node, !node, 'autoPlay'),
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
  /* 设备目录树 */
  public get deviceTree() {
    return this.$refs.deviceTree as any
  }

  /* 面包屑 */
  public get breadcrumb() {
    return this.$refs.breadcrumb as any
  }

  /* 轮询遮罩 */
  public get pollingMask() {
    return this.$refs.pollingMask as any
  }

  /* 设备目录树是否懒加载依据 */
  public get lazy(): boolean {
    return ['deviceStatusKeys', 'streamStatusKeys', 'deviceAddresses', 'matchKeys', 'searchKey'].every(
      param => !this.$route.query[param]
    )
  }

  /* 播放器管理实例 */
  public get screenManager() {
    return (this.$refs.screenBoard as any)?.screenManager
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
  public treeLoad = async function (node) {
    let res
    // 增加 层级关系
    // console.log('怎么将 node  和 data 关联起来？   node', node)
    if (node.level === 0) {
      this.loading.tree = true
      try {
        res = await getNodeInfo({ id: '', type: DirectoryTypeEnum.Dir })
        const pathList = this.$route.query.path ? this.$route.query.path.split(',') : []
        this.deviceTree.loadChildren(pathList)
        this.deviceTree.rootSums.onlineSize = res.onlineSize
        this.deviceTree.rootSums.totalSize = res.totalSize
      } catch (e) {
        console.log(e)
      }
      this.loading.tree = false
    } else {
      // 增加 path 属性
      res = await getNodeInfo({ id: node.data.id, type: node.data.type })
      // console.log('get node info     ', res)
      let parentPath = this.concatPath(node)
      res.dirs.map((item: any) => {
        item.path = node.level === 1 ? node.label : parentPath + '/' + node.label
      })
    }
    return res.dirs
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

  // 拼接 path
  private concatPath(node: any) {
    if (typeof(node.parent.label) === "undefined") return ''
    let label = node.parent.label ? node.parent.label : ''
    return this.concatPath(node.parent) + '/' + label
  }

}
