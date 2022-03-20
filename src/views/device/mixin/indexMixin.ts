import { Component, Provide, Vue } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { GroupModule } from '@/store/modules/group'
import { getDeviceTree } from '@/api/device'
import { VGroupModule } from '@/store/modules/vgroup'
import { setDirsStreamStatus } from '@/utils/device'
import { AdvancedSearch } from '@/type/advancedSearch'

@Component
export default class IndexMixin extends Vue {
  @Provide('outerSearch')
  public advancedSearchForm: AdvancedSearch = {
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

  private rootSums = {
    online: 0,
    total: 0
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

  public get defaultKey() {
    const id = this.$route.query.deviceId || this.$route.query.dirId
    if (!id) {
      return null
    }
    return id
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

  public get isVGroup() {
    return GroupModule.group?.inProtocol === 'vgroup'
  }

  public get breadcrumb() {
    // 当为查询设备时，面包屑重置为根目录
    return DeviceModule.breadcrumb && !this.$route.query.isSearch ? DeviceModule.breadcrumb : []
  }

  public get isRootDir() {
    return this.$route.query.type === 'dir' && this.$route.query.dirId === '0'
  }

  public get isSorted() {
    return DeviceModule.isSorted
  }

  public setDirsStreamStatus = setDirsStreamStatus

  public doSearch(payload: any) {
    this.advancedSearchForm.deviceStatusKeys = payload.deviceStatusKeys
    this.advancedSearchForm.streamStatusKeys = payload.streamStatusKeys
    this.advancedSearchForm.matchKeys = payload.matchKeys
    this.advancedSearchForm.deviceAddresses = payload.deviceAddresses
    this.advancedSearchForm.inputKey = payload.inputKey
    this.advancedSearchForm.searchKey = payload.searchKey
    this.advancedSearchForm.revertSearchFlag = payload.revertSearchFlag

    this.initDirs()
  }

  public initSearchStatus() {
    const query: any = this.$route.query
    this.advancedSearchForm.deviceStatusKeys = (query.deviceStatusKeys && query.deviceStatusKeys.split(',')) || []
    this.advancedSearchForm.streamStatusKeys = (query.streamStatusKeys && query.streamStatusKeys.split(',')) || []
    if (query.deviceAddresses) {
      const temp = query.deviceAddresses.split(',')
      this.advancedSearchForm.deviceAddresses = {
        code: temp[0],
        level: temp[1]
      }
    }
    this.advancedSearchForm.matchKeys = (query.matchKeys && query.matchKeys.split(',')) || []
    this.advancedSearchForm.inputKey = query.searchKey || ''
    this.advancedSearchForm.searchKey = query.searchKey || ''
    this.advancedSearchForm.revertSearchFlag = Boolean(this.advancedSearchForm.searchKey ||
                                                        this.advancedSearchForm.deviceStatusKeys.length ||
                                                        this.advancedSearchForm.streamStatusKeys.length ||
                                                        this.advancedSearchForm.deviceAddresses.code)
  }

  /**
   * 初始化目录
   */
  @Provide('initDirs')
  public async initDirs() {
    try {
      VGroupModule.resetVGroupInfo()
      this.loading.dir = true
      await DeviceModule.ResetBreadcrumb()
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: 0,
        deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
        streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
        matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
        deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
        searchKey: this.advancedSearchForm.searchKey || undefined
      })
      this.dirList = this.setDirsStreamStatus(res.dirs)
      this.getRootSums(this.dirList)
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
   * 计算根目录设备数统计
   */
  public getRootSums(dirList: any) {
    this.rootSums.online = 0
    this.rootSums.total = 0
    dirList.forEach((dir: any) => {
      if (dir.type === 'ipc') {
        dir.deviceStatus === 'on' && this.rootSums.online++
        this.rootSums.total++
      } else {
        this.rootSums.online += dir.onlineSize
        this.rootSums.total += dir.totalSize
      }
    })
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
    const blackList = ['/screen', '/replay']
    const path = this.$route.path
    if (this.advancedSearchForm.revertSearchFlag) {
      // 根据搜索结果 组装 目录树
      this.dirList = this.transformDirList(this.dirList)
      if (blackList.indexOf(path) === -1 && this.dirList.length) {
        let nonLeafNode: any = this.dirList[0]
        while (nonLeafNode && nonLeafNode.children && nonLeafNode.children.length) {
          nonLeafNode = nonLeafNode.children[0]
        }
        this.$nextTick(() => this.deviceRouter(nonLeafNode))
      }
    } else if (blackList.indexOf(path) === -1) {
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
              // 避免刷新目录后无法选中
              dirTree.setCurrentKey(this.defaultKey)
              DeviceModule.SetBreadcrumb(this.getDirPath(node).reverse())
            }
          }
        }
      } else if (this.dirList.length && this.dirList.every((dir: any) => dir.type === 'dir')) {
        // 如果为查找设备则不执行任何操作
        if (this.$route.query.isSearch === '1') return
        // 如果根目录下无设备，则跳转至第一个目录下
        this.deviceRouter(this.dirList[0])
      }
    }
  }

  /**
   * 转化搜索目录树
   */
  public transformDirList(dirList: any) {
    return dirList.map(dir => {
      if (dir.dirs) {
        return {
          ...dir,
          children: this.transformDirList(dir.dirs)
        }
      } else {
        return {
          ...dir
        }
      }
    })
  }

  /**
   * 加载子目录
   */
  public async loadDirChildren(key: string, node: any) {
    try {
      if (this.currentGroup?.inProtocol === 'vgroup') {
        if (node.data.type === 'role') {
          node.data.roleId = node.data.id
        } else if (node.data.type === 'group') {
          node.data.realGroupId = node.data.id
          node.data.realGroupInProtocol = node.data.inProtocol
        }
        VGroupModule.SetRoleID(node.data.roleId || '')
        VGroupModule.SetRealGroupId(node.data.realGroupId || '')
        VGroupModule.SetRealGroupInProtocol(node.data.realGroupInProtocol || '')
      }
      const dirTree: any = this.$refs.dirTree
      let data = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node.data.id,
        type: node.data.type
      })
      if (data.dirs) {
        if (this.currentGroup?.inProtocol === 'vgroup') {
          data.dirs.forEach((dir: any) => {
            dir.roleId = node.data.roleId || ''
            dir.realGroupId = node.data.realGroupId || ''
            dir.realGroupInProtocol = node.data.realGroupInProtocol || ''
          })
        }
        data.dirs = this.setDirsStreamStatus(data.dirs)
        dirTree.updateKeyChildren(key, data.dirs)
      }
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
        // 过滤状态全量返回,不需要手动加载
        if (!_node.loaded && !this.advancedSearchForm.revertSearchFlag) {
          this.loadDirChildren(item.id, _node)
        }
        _node.parent.expanded = true
        dirTree.setCurrentKey(item.id)
      }
    } else {
      _node = node
      _node.expanded = true
    }
    if (_node) {
      DeviceModule.SetBreadcrumb(this.getDirPath(_node).reverse())
      // 跳转前设置虚拟业务组相关信息
      VGroupModule.SetRoleID(_node.data.roleId || '')
      VGroupModule.SetRealGroupId(_node.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(_node.data.realGroupInProtocol || '')
    }
    let router: any
    let query: any = {}
    switch (item.type) {
      case 'role':
      case 'group':
        router = {
          name: 'device-list'
        }
        query = {
          dirId: item.id,
          type: item.type
        }
        break
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
        router = {
          name: 'device-list'
        }
        query = {
          dirId: item.id,
          deviceId: item.id
        }
        break
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
          name: 'device-detail'
        }
        query = {
          deviceId: item.id
        }
        break
      case 'preview':
        router = {
          name: 'device-detail'
        }
        query = {
          deviceId: item.id,
          tab: item.previewTab
        }
        break
      case 'detail':
        router = {
          name: 'device-detail'
        }
        query = {
          deviceId: item.id,
          tab: item.activeName
        }
        break
      case 'create':
        router = {
          name: 'device-create'
        }
        query = {
          dirId: item.id,
          deviceId: item.deviceId,
          isChannel: item.isChannel && item.isChannel.toString()
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
      case 'configChannel':
        router = {
          name: 'config-channel'
        }
        query = {
          dirId: item.id,
          deviceId: item.deviceId,
          isChannel: item.isChannel && item.isChannel.toString(),
          channelNumList: item.channelNumList && item.channelNumList.toString(),
          channelSize: item.channelSize
        }
        break
    }
    router.query = {
      inProtocol: this.currentGroup!.inProtocol,
      type: item.type,
      path: this.breadcrumb.map((item: any) => item.id).join(','),
      deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
      streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
      matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
      deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
      searchKey: this.advancedSearchForm.searchKey || undefined,
      ...query
    }

    if (_node && this.currentGroupInProtocol === 'vgroup') {
      router.query.realGroupInProtocol = _node.data.realGroupInProtocol || ''
    } else {
      delete router.query.realGroupInProtocol
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
    if (this.currentGroup?.inProtocol === 'vgroup') {
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      VGroupModule.SetRoleID(node.data.roleId || '')
      VGroupModule.SetRealGroupId(node.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(node.data.realGroupInProtocol || '')
    }
    try {
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node.data.id,
        type: node.data.type
      })
      if (this.currentGroup?.inProtocol === 'vgroup') {
        res.dirs.forEach((dir: any) => {
          dir.roleId = node.data.roleId || ''
          dir.realGroupId = node.data.realGroupId || ''
          dir.realGroupInProtocol = node.data.realGroupInProtocol || ''
        })
      }
      res.dirs = this.setDirsStreamStatus(res.dirs)
      resolve(res.dirs)
    } catch (e) {
      resolve([])
    }
  }
}
