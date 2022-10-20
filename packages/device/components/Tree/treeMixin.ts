import { Component, Vue, Prop } from 'vue-property-decorator'
import { getNodeInfo } from '../../api/device'
import { checkTreeToolsVisible } from '../../utils/param'
import { DeviceTypeEnum, ToolsEnum } from '../../enums/index'
import StreamSelector from '../StreamSelector.vue'

@Component({
  components: {
    StreamSelector
  }
})
export default class TreeMixin extends Vue {
  @Prop({ default: true })
  public lazy: boolean

  @Prop({ default: () => [] })
  public data

  @Prop({ default: {} })
  public load

  public toolsEnum = ToolsEnum
  public getNodeInfo = getNodeInfo
  public defaultKey = ''
  public rootLabel = '根目录'
  public emptyText = '暂无目录或设备'
  public defaultProps = {
    children: 'children',
    label: 'label',
    isLeaf: 'isLeaf'
  }
  public rootSums = {
    online: 0,
    total: 0
  }
  public treeLoading = false

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
    console.log('getCheckedNodes', this.commonTree.getCheckedNodes())
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
   * @param payload 参数payload
   */
  public handleTools(type: any, ...payload) {
    this.$emit('handle-tools', type, ...payload)
  }

  /**
   * 判断item是否可拖拽
   */
  public checkIsDraggable(node) {
    return node.data.type === DeviceTypeEnum.Ipc
    // if (isLive && node.data.deviceStatus !== 'on') return
  }
}
