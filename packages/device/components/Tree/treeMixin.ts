import { Component, Vue, Prop } from 'vue-property-decorator'
import { getNodeInfo } from '../../api/device'
import { dropScreen } from './dropScreen'
import { checkTreeToolsVisible } from '../../utils/param'
import { ToolsEnum } from '../../enums/index'
import StreamSelector from '../StreamSelector.vue'

@Component({
  components: {
    StreamSelector
  },
  directives: {
    'drop-screen': dropScreen
  }
})
export default class DetailMixin extends Vue {
  @Prop({ default: true })
  public lazy: boolean

  @Prop({ default: () => [] })
  public data

  @Prop({ default: () => {} })
  public load

  public dropScreen = dropScreen
  public toolsEnum = ToolsEnum
  public getNodeInfo = getNodeInfo
  public defaultKey = ''
  public rootLabel: string = '根目录'
  public emptyText: string = '暂无目录或设备'
  public defaultProps = {
    children: 'children',
    label: 'label',
    isLeaf: 'isLeaf'
  }
  public rootSums = {
    online: 0,
    total: 0
  }
  public treeLoading: boolean = false

  public get commonTree() {
    return this.$refs.commonTree as any
  }

  public mounted() {
    console.log(this)
  }

  public initCommonTree() {
    this.commonTree.initTree()
  }

  /**
   * 懒加载展开指定目录
   * @param payload node/key
   */
  public loadChildren(payload) {
    window.setImmediate(() => {
      this.commonTree.loadChildren(payload)
    })
  }

  /**
   * node点击事件
   * @param data node信息
   */
  public handleNode(data: any) {
    this.$router.push({
      name: 'DeviceList',
      query: {
        type: data && data.type,
        dirId: data && data.id
      }
    })
    this.$emit('handle-node', data)
  }

  /**
   * 判断是否显示form-item
   */
  public checkVisible(type, prop) {
    return checkTreeToolsVisible(type, prop)
  }

  /**
   * 工具栏功能触发回调
   * @param type 触发功能类型
   * @param data node信息
   */
  public handleTools(type: any, data: any) {
    this.$emit('handle-tools', type, data)
  }
}
