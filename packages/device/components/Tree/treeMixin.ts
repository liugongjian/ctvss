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
  public treeLoading: boolean = false

  public initCommonTree() {
    let commonTree: any = this.$refs.commonTree
    commonTree.initTree()
  }

  /**
   * 加载节点
   */
  public async load(node: any, resolve: Function) {
    try {
      if (node.level === 0) {
        this.treeLoading = true
        resolve(await this.getNodeInfo('root'))
        this.treeLoading = false
      } else if (node.level < 4) {
        resolve(await this.getNodeInfo('node'))
      } else if (node.level === 4) {
        resolve(await this.getNodeInfo('leaf'))
      } else {
        resolve([])
      }
    } catch (e) {
      resolve([])
    } finally {
      this.treeLoading = false
    }
  }

  /**
   * node点击事件
   * @param data node信息
   */
  public handleNode(data: any) {
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
