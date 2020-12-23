import { Component, Provide, Vue } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { GroupModule } from '@/store/modules/group'
import { getDeviceTree } from '@/api/device'
import { getStreamList } from '@/api/stream'
import { Stream } from '@/type/stream'

@Component
export default class DeviceMixin extends Vue {
  public maxHeight = 1000
  public dirList = []
  public isExpanded = true
  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }
  public loading = {
    dir: false,
    device: false
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  public get currentGroup() {
    return GroupModule.group
  }

  public get currentGroupId() {
    return GroupModule.group?.groupId
  }

  public get currentGroupInProtocol() {
    return GroupModule.group?.inProtocol
  }

  public get breadcrumb() {
    return DeviceModule.breadcrumb ? DeviceModule.breadcrumb : []
  }

  /**
   * 初始化目录
   */
  @Provide('initDirs')
  public async initDirs() {
    try {
      this.loading.dir = true
      await DeviceModule.ResetBreadcrumb()
      if (this.currentGroupInProtocol === 'rtmp') {
        let params = {
          pageNum: 1,
          pageSize: 1000,
          groupId: this.currentGroupId
        }
        const res = await getStreamList(params)
        this.dirList = res.streams.map((stream: Stream) => {
          return {
            id: stream.deviceId,
            label: stream.deviceId,
            type: 'ipc',
            isLeaf: true,
            streamStatus: stream.status
          }
        })
      } else {
        const res = await getDeviceTree({
          groupId: this.currentGroupId,
          id: 0
        })
        this.dirList = res.dirs
      }
      this.$nextTick(() => {
        this.initTreeStatus()
      })
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 65
  }

  /**
   * 初始化目录状态
   */
  public async initTreeStatus() {
    const dirTree: any = this.$refs.dirTree
    const path: string | (string | null)[] | null = this.$route.query.path
    const keyPath = path ? path.toString().split(',') : null
    if (keyPath) {
      for (let i = 0; i < keyPath.length; i++) {
        const _key = keyPath[i]
        const node = dirTree.getNode(_key)
        if (node) {
          await this.loadDirChildren(_key, node)
          if (i === keyPath.length - 1) {
            DeviceModule.SetBreadcrumb(this.getDirPath(node).reverse())
          }
        }
      }
    } else if (this.dirList.length && this.dirList.every((dir: any) => dir.type === 'dir')) {
      // 如果根目录下无设备，则跳转至第一个目录下
      this.deviceRouter(this.dirList[0])
    }
  }

  /**
   * 加载子目录
   */
  public async loadDirChildren(key: string, node: any) {
    try {
      const dirTree: any = this.$refs.dirTree
      let data = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node.data.id,
        type: node.data.type
      })
      data.dirs && dirTree.updateKeyChildren(key, data.dirs)
      node.expanded = true
      node.loaded = true
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取树菜单路径
   */
  @Provide('getDirPath')
  public getDirPath(node: any) {
    let path: any = []
    const _getPath = (node: any, path: any) => {
      const data = node.data
      if (data && data.id) {
        path.push({
          id: data.id,
          label: data.label,
          type: data.type
        })
      }
      if (node.parent) {
        _getPath(node.parent, path)
      }
    }
    _getPath(node, path)
    return path
  }

  /**
   * 设备页面路由
   */
  @Provide('deviceRouter')
  public async deviceRouter(item: any, node?: any) {
    const dirTree: any = this.$refs.dirTree
    let _node: any
    if (!node) {
      _node = dirTree.getNode(item.id)
      if (_node) {
        if (!_node.loaded) {
          this.loadDirChildren(item.id, _node)
        }
        _node.parent.expanded = true
        dirTree.setCurrentKey(item.id)
      }
    } else {
      _node = node
      _node.expanded = true
    }
    _node && DeviceModule.SetBreadcrumb(this.getDirPath(_node).reverse())
    let router: any
    let query: any = {}
    switch (item.type) {
      case 'platformDir':
      case 'dir':
        router = {
          name: 'device-list'
        }
        query = {
          dirId: item.id
        }
        break
      case 'platform':
      case 'nvr':
        router = {
          name: 'device-list'
        }
        query = {
          deviceId: item.id
        }
        break
      case 'ipc':
        router = {
          name: 'device-list'
        }
        query = {
          deviceId: item.id
        }
        break
      case 'preview':
        router = {
          name: 'device-preview'
        }
        query = {
          deviceId: item.id,
          previewTab: item.previewTab
        }
        break
      case 'detail':
        router = {
          name: 'device-detail'
        }
        query = {
          deviceId: item.id
        }
        break
      case 'create':
        router = {
          name: 'device-create'
        }
        query = {
          dirId: item.id,
          deviceId: item.deviceId,
          isChannel: item.isChannel.toString()
        }
        break
      case 'update':
        router = {
          name: 'device-update'
        }
        query = {
          deviceId: item.id
        }
        break
    }
    router.query = {
      inProtocol: this.currentGroup!.inProtocol,
      type: item.type,
      path: this.breadcrumb.map((item: any) => item.id).join(','),
      ...query
    }
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
  }

  /**
   * 收起/展开目录列表
   */
  public toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * 设置左侧宽度
   */
  public changeWidthStart(e: MouseEvent) {
    const $dirList: any = this.$refs.dirList
    this.dirDrag.isDragging = true
    this.dirDrag.start = e.x
    this.dirDrag.orginWidth = $dirList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dirDrag.isDragging) return
      this.dirDrag.offset = this.dirDrag.start - e.x
      const width = this.dirDrag.orginWidth - this.dirDrag.offset
      if (width < 50) return
      this.dirDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dirDrag.isDragging = false
    })
  }

  /**
   * 加载目录
   */
  public async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    try {
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node.data.id,
        type: node.data.type
      })
      resolve(res.dirs)
    } catch (e) {
      console.log(e)
    }
  }
}
