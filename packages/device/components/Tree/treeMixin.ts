import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { checkTreeToolsVisible } from '../../utils/param'
import { DeviceTypeEnum, ToolsEnum, DeviceEnum, StatusEnum, DirectoryTypeEnum, DeviceInTypeEnum, InVideoProtocolEnum } from '../../enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { ScreenModule } from '@vss/device/store/modules/screen'
import StreamSelector from '../StreamSelector.vue'
import { checkPermission } from '@vss/base/utils/permission'
import { getNodeInfo, previewAuthActions } from '@vss/device/api/dir'
import { UserModule } from '@/store/modules/user'
import { AppModule, SystemType } from '@/store/modules/app'
@Component({
  components: {
    StreamSelector
  }
})
export default class TreeMixin extends Vue {
  /* 是否启用lazy模式 */
  @Prop({ default: true })
  public lazy: boolean

  /* 树初始化的所有节点信息（非lazy模式下） */
  @Prop({ default: () => [] })
  public data

  /* 树初始化的设备统计信息（非lazy模式下） */
  @Prop({ default: () => [0, 0] })
  public rootSumsArray

  /* 树加载子节点信息方法（lazy模式下） */
  @Prop({ default: () => {} })
  public load

  /* 树加载子节点信息默认接口的过滤字段（默认全部，可选video，viid） */
  @Prop()
  public deviceInType: DeviceInTypeEnum

  public toolsEnum = ToolsEnum
  public deviceEnum = DeviceEnum
  public statusEnum = StatusEnum
  public deviceTypeEnum = DeviceTypeEnum
  public directoryTypeEnum = DirectoryTypeEnum
  public inVideoProtocolEnum = InVideoProtocolEnum
  public policyEnum = PolicyEnum

  /* 树节点的唯一标识字段 */
  public nodeKey = 'id'
  /* 根节点对应的key值（设有根目录时会用到） */
  public rootKey = ''
  /* 根节点label值（设有根目录时会用到） */
  public rootLabel = '根目录'
  /* 根节点统计信息（设有根目录时会用到） */
  public rootSums = {
    onlineSize: 0,
    totalSize: 0
  }
  /* 树节点信息为空时展示信息 */
  public emptyText = '暂无目录或设备'
  /* 对应el-tree中props */
  public defaultProps = {
    children: 'dirs',
    label: 'name',
    isLeaf: 'isLeaf'
  }
  /* 树是否为加载中状态 */
  public loading = false

  /* 树初始化时默认选中节点对应的key值 */
  public get defaultKey() {
    return this.$route.query.dirId
  }

  public get commonTree() {
    return this.$refs.commonTree as any
  }

  public get playingScreens() {
    return ScreenModule ? ScreenModule.playingScreens : []
  }

  public initCommonTree() {
    this.commonTree.initTree()
  }

  @Watch('rootSumsArray', { deep: true })
  public rootSumsArrayChange(array) {
    this.rootSums.onlineSize = array[0]
    this.rootSums.totalSize = array[1]
  }

  /**
   * 懒加载时加载节点方法
   * @param node 节点信息
   */
  public async treeLoad(node) {
    let nodeData
    // 增加 层级关系
    if (node.level === 0) {
      this.loading = true
      try {
        const res = await getNodeInfo({
          id: '',
          type: DirectoryTypeEnum.Dir,
          inProtocol: this.deviceInType
        })
        this.rootSums.onlineSize = res.onlineSize
        this.rootSums.totalSize = res.totalSize
        nodeData = await this.onTreeLoadedHook(node, res)
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    } else {
      try {
        const res = await getNodeInfo({
          id: node.data.id,
          type: node.data.type,
          inProtocol: this.deviceInType
        })
        nodeData = await this.onTreeLoadedHook(node, res)
      } catch (e) {
        console.log(e)
      }
    }

    if (nodeData.length) {
      // 构造全路径（主账号也拼接全路径，避免path变更导致路由切换两次）
      nodeData.forEach((item: any) => {
        if (!item.path) {
          if (node.level === 0) {
            item.path = [{
              id: item.id,
              type: item.type
            }]
          } else {
            item.path = node.data.path.concat([{
              id: item.id,
              type: item.type
            }])
          }
        }
      })
      // 子账号-获取权限数据（仅用户控制台查询权限）
      if (AppModule.system === SystemType.SYSTEM_USER && UserModule.iamUserId) {
      const permissionRes = await previewAuthActions({
        targetResources: nodeData.map(dir => ({
          dirPath: ((dir.type === 'dir' || dir.type === 'platformDir') ? dir.path.map(path => path.id).join('/') : dir.path.slice(0, -1).map(path => path.id).join('/')) || '0',
          deviceId: (dir.type === 'dir' || dir.type === 'platformDir') ? undefined : dir.path[dir.path.length - 1].id
        }))
      })
      nodeData = nodeData
        .map((dir: any, index: number) => ({
          ...dir,
          ...permissionRes.result[index].iamUser.actions
        }))
      }
    }

    return nodeData
  }

  /**
   * 树节点加载完成后执行的钩子
   * @param node 父节点信息
   * @param res 接口返回信息
   * @returns 子节点信息
   */
  public async onTreeLoadedHook(node, res) {
    return res.dirs
  }


  /**
   * 懒加载展开指定目录
   * @param payload node/key
   */
  public async loadChildren(payload, enableCache = false) {
    if (Array.isArray(payload)) {
      // 展开路径列表
      const key = payload.shift()
      if (payload.length) {
        await this.commonTree.loadChildren(key, null, enableCache)
        await this.loadChildren(payload, enableCache)
      } else {
        this.setCurrentKey(key || this.rootKey)
      }
    } else {
      // 展开目录
      this.commonTree.loadChildren(payload)
    }
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

  /**
   * node点击事件
   * @param data node信息
   */
  public handleNode(data: any, node: any, component: any) {
    this.$emit('handle-node', data)
  }

  public getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    return this.commonTree.getCheckedNodes(leafOnly, includeHalfChecked)
  }

  public setCheckedNodes(nodes) {
    return this.commonTree.setCheckedNodes(nodes)
  }

  public getCheckedKeys(leafOnly = false) {
    return this.commonTree.getCheckedKeys(leafOnly)
  }

  public setCheckedKeys(keys, leafOnly = false) {
    return this.commonTree.setCheckedKeys(keys, leafOnly)
  }

  public setChecked(data, checked: boolean, deep = false) {
    return this.commonTree.setChecked(data, checked, deep)
  }

  public getCurrentKey() {
    return this.commonTree.getCurrentKey()
  }

  public getCurrentNode() {
    return this.commonTree.getCurrentNode()
  }

  public setCurrentKey(key) {
    return this.commonTree.setCurrentKey(key)
  }

  public setCurrentNode(node) {
    return this.commonTree.setCurrentNode(node)
  }

  public getNode(data) {
    return this.commonTree.getNode(data)
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
    return checkTreeToolsVisible(type, prop, data) && checkPermission(permission, data)
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
