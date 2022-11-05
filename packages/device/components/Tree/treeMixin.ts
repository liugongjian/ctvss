import { Component, Vue, Prop } from 'vue-property-decorator'
import { checkTreeToolsVisible } from '../../utils/param'
import { DeviceTypeEnum, ToolsEnum, DeviceEnum, StatusEnum, DirectoryTypeEnum } from '../../enums/index'
import { ScreenModule } from '@vss/device/store/modules/screen'
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
  public deviceEnum = DeviceEnum
  public statusEnum = StatusEnum
  public deviceTypeEnum = DeviceTypeEnum
  public directoryTypeEnum = DirectoryTypeEnum
  public rootKey = ''
  public nodeKey = 'id'
  public rootLabel = '根目录'
  public emptyText = '暂无目录或设备'
  public defaultProps = {
    children: 'children',
    label: 'name',
    isLeaf: 'isLeaf'
  }
  public rootSums = {
    onlineSize: 0,
    totalSize: 0
  }

  public get commonTree() {
    return this.$refs.commonTree as any
  }

  public get defaultKey() {
    return this.$route.query.dirId
  }

  public get playingScreens() {
    return ScreenModule ? ScreenModule.playingScreens : []
  }

  public initCommonTree() {
    console.log('使用  initCommonTree ')
    this.commonTree.initTree()
  }

  /**
   * 懒加载展开指定目录
   * @param payload node/key
   */
  public loadChildren(payload) {
    console.log('hhhhhhh      hhhhhh')
    window.setImmediate(async() => {
      if (Array.isArray(payload)) {
        // 展开路径列表
        const key = Array.isArray(payload) ? payload.shift() : payload
        if (payload.length) {
          await this.commonTree.loadChildren(key)
          this.loadChildren(payload)
        } else {
          this.setCurrentKey(key || this.rootKey)
          // this.$nextTick(() => {
          //   const currentNodeDom = document.getElementsByClassName('current-node')[0]
          //   console.log((currentNodeDom.parentNode as any).scrollTop)
          // })
        }
        
      } else {
        // 展开目录
        this.commonTree.loadChildren(payload)
      }
    })
  }

  private setCurrentKey(payload) {
    this.commonTree.setCurrentKey(payload)
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
   * 判断设备状态
   * @param data 设备信息
   */
  public checkTreeItemStatus(data: any) {
    return data.type === DirectoryTypeEnum.Ipc && this.playingScreens.includes(data.id)
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
}
