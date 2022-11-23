import { Component, Vue, Prop } from 'vue-property-decorator'
import { checkTreeToolsVisible } from '../../utils/param'
import { DeviceTypeEnum, ToolsEnum, DeviceEnum, StatusEnum, DirectoryTypeEnum } from '../../enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { ScreenModule } from '@vss/device/store/modules/screen'
import StreamSelector from '../StreamSelector.vue'
import { checkPermission } from '@vss/base/utils/permission'

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

  @Prop({ default: () => {} })
  public load

  public toolsEnum = ToolsEnum
  public deviceEnum = DeviceEnum
  public statusEnum = StatusEnum
  public deviceTypeEnum = DeviceTypeEnum
  public directoryTypeEnum = DirectoryTypeEnum
  public policyEnum = PolicyEnum
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
    this.commonTree.initTree()
  }

  /**
   * 懒加载展开指定目录
   * @param payload node/key
   */
  public loadChildren(payload) {
    window.setImmediate(async() => {
      if (Array.isArray(payload)) {
        // 展开路径列表
        const key = payload.shift()
        if (payload.length) {
          await this.commonTree.loadChildren(key)
          this.loadChildren(payload)
        } else {
          this.setCurrentKey(key || this.rootKey)
        }
        
      } else {
        // 展开目录
        this.commonTree.loadChildren(payload)
      }
    })
  }

  public async asyncLoadChildren(payload, enableCache) {
    if (Array.isArray(payload)) {
      // 展开路径列表
      const key = Array.isArray(payload) ? payload.shift() : payload
      if (payload.length) {
        await this.commonTree.loadChildren(key, null, enableCache)
        await this.asyncLoadChildren(payload, enableCache)
      } else {
        this.setCurrentKey(key || this.rootKey)
      }
      
    } else {
      // 展开目录
      this.commonTree.loadChildren(payload)
    }
  }

  private setCurrentKey(payload) {
    this.commonTree.setCurrentKey(payload)
  }

  /**
   * node点击事件
   * @param data node信息
   */
  public handleNode(data: any) {
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
  public checkVisible(type, prop, permission?, data?) {
    return checkTreeToolsVisible(type, prop, data) && checkPermission(permission)
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
