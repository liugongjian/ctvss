import { Component, Vue, Provide } from 'vue-property-decorator'
import { ToolsEnum } from '../enums/index'
import { AdvancedSearch as AdvancedSearchType } from '../type/advancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import AdvancedSearch from '../components/AdvancedSearch.vue'
import { deleteDir } from '../api/dir'
import { getNodeInfo } from '../api/device'
import ScreenBoard from '../components/ScreenBoard/index.vue'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class DetailMixin extends Vue {
  public deviceManager = DeviceManager
  public toolsEnum = ToolsEnum
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
  private sortNode = null
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
    [ToolsEnum.Refresh]: DeviceManager.advanceSearch,
    [ToolsEnum.ExportSearchResult]: DeviceManager.exportSearchResult,
    [ToolsEnum.AddDirectory]: function() {
      DeviceManager.openDirectoryDialog.call(this, ToolsEnum.AddDirectory, ...arguments)
    },
    [ToolsEnum.EditDirectory]: function() {
      DeviceManager.openDirectoryDialog.call(this, ToolsEnum.EditDirectory, ...arguments)
    },
    [ToolsEnum.SortDirectory]: function() {
      DeviceManager.openDirectoryDialog.call(this, ToolsEnum.SortDirectory, ...arguments)
    },
    [ToolsEnum.DeleteDirectory]: DeviceManager.deleteDir,
    [ToolsEnum.SetStreamNum]: DeviceManager.openScreen,
    [ToolsEnum.Polling]: function(node) {
      DeviceManager.executeQueue.call(this, node, !node, 'polling')
    },
    [ToolsEnum.AutoPlay]: function(node) {
      DeviceManager.executeQueue.call(this, node, !node, 'autoPlay')
    },
    [ToolsEnum.IntervalChange]: DeviceManager.intervalChange,
    [ToolsEnum.StopPolling]: DeviceManager.stopPolling,
    [ToolsEnum.PausePolling]: DeviceManager.pausePolling,
    [ToolsEnum.ResumePolling]: DeviceManager.resumePolling,
    [ToolsEnum.AdvanceSearch]: DeviceManager.advanceSearch
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
  private get queueExecutor() {
    return this.screenManager && this.screenManager.refs.queueExecutor
  }

  public mounted() {
    DeviceManager.initAdvancedSearch.call(this)
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
  public handleTools(type: string, data?: any) {
    console.log(type, data)
    this.handleToolsMap[type].call(this, data)
  }

  /**
   * 树节点点击事件
   * @param data node信息
   */
  public handleTreeNode(data: any) {
    console.log(data)
  }
}
