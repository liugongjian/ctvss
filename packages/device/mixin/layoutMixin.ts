import { Component, Vue } from 'vue-property-decorator'
import { ToolsEnum } from '../enums/index'
import { AdvancedSearch as AdvancedSearchType } from '../type/advancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import AdvancedSearch from '../components/AdvancedSearch.vue'
import { deleteDir } from '../api/dir'
import { getDeviceTree } from '../api/device'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class DetailMixin extends Vue {
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
    [ToolsEnum.Refresh]: DeviceManager.initDirs,
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
    [ToolsEnum.AdvanceSearch]: DeviceManager.advanceSearch
  }

  public get lazy(): boolean {
    return ['deviceStatusKeys', 'streamStatusKeys', 'deviceAddresses', 'matchKeys', 'searchKey'].some(param => {
      console.log(param, !!this.$route.query[param])
      !!this.$route.query[param]
    })

    return !this.$route.query.searchKey
  }

  public get deviceTree() {
    return this.$refs.deviceTree
  }

  public mounted() {
    this.init()
  }

  public async init() {
    !this.lazy && (this.treeSearchResult = await getDeviceTree({
      id: 0,
      deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
      streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
      matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
      deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
      searchKey: this.advancedSearchForm.searchKey || undefined
    }))
  }

  /**
   * 左侧功能触发回调
   * @param type 功能类型
   */
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
