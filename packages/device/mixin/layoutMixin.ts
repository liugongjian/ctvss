import { Component, Vue } from 'vue-property-decorator'
import { ToolsEnum } from '../enums/index'
import { AdvancedSearch as AdvancedSearchType } from '../type/advancedSearch'
import DeviceManager from '../services/Device/DeviceManager'
import AdvancedSearch from '../components/AdvancedSearch.vue'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class DetailMixin extends Vue {
  public toolsEnum = ToolsEnum
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

  public handleToolsMap = {
    [ToolsEnum.AdvanceSearch]: DeviceManager.advanceSearch
  }

  public lazy: boolean = true

  public treeSearchResult: any = []

  public get deviceTree() {
    return this.$refs.deviceTree
  }

  public mounted() {
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
