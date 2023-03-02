import { Component, Provide, Vue } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { GroupModule } from '@/store/modules/group'
import { getDeviceTree } from '@/api/device'
import { loadTreeNode } from '@/api/customTree'
import { previewAuthActions } from '@/api/accessManage'
import { VGroupModule } from '@/store/modules/vgroup'
import { setDirsStreamStatus } from '@/utils/device'
// @ts-ignore
import { AdvancedSearch } from '@/type/advancedSearch'
import { UserModule } from '@/store/modules/user'
import { checkPermission } from '@/utils/permission'

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

  public rootActions = {}
  public checkPermission = checkPermission
  public maxHeight = null
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

  public get isCustomTree() {
    return this.currentGroup?.isCustomTree
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
    this.advancedSearchForm.deviceAddresses = { code: '', level: '' }
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
  public async initDirs(isExpand?: boolean) {
    try {
      VGroupModule.resetVGroupInfo()
      this.loading.dir = true
      await DeviceModule.ResetBreadcrumb()
      let dirs
      if (this.isCustomTree) {
        const res = await loadTreeNode({
          dirId: this.currentGroupId
        })
        res.dirs = res.dirs.map(dir => ({
          ...dir,
          ...dir.authMap
        }))
        dirs = this.setDirsStreamStatus(res.dirs)
      } else {
        if (UserModule.iamUserId) {
          const permissionRes = await previewAuthActions({
            targetResources: [{
              groupId: this.currentGroupId
            }]
          })
          this.rootActions = permissionRes.result[0].iamUser.actions
        }
        dirs = await this.getAuthActionsDeviceTree({
          groupId: this.currentGroupId,
          id: 0,
          deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
          streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
          matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
          deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
          searchKey: this.advancedSearchForm.searchKey || undefined
        }, null)
      }
      this.dirList = dirs
      this.getRootSums(this.dirList)
      this.$nextTick(() => {
        this.initTreeStatus(isExpand)
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
    this.maxHeight = documentHeight - top - 22
  }

  /**
   * 初始化目录状态
   * @param isExpand 是否默认打开第一个设备
   */
  public async initTreeStatus(isExpand = true) {
    const blackList = ['/screen', '/replay']
    const path = this.$route.path
    if (this.advancedSearchForm.revertSearchFlag) {
      // 根据搜索结果 组装 目录树
      this.dirList = await this.transformDirList(this.dirList)
      if (blackList.indexOf(path) === -1 && this.dirList.length && isExpand) {
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
        if (isExpand) this.deviceRouter(this.dirList[0])
      }
    }
  }

  /**
   * 转化搜索目录树
   */
  public async transformDirList(dirList: any) {
    try {
      this.loading.dir = true
      dirList = this.generateDirList(dirList)
      await this.actionDirList(dirList)
      return dirList
    } catch (e) {
      console.log('e: ', e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 生成带children属性的树，并填充path属性
   * @param dirList 子节点列表
   * @param parentPath 上级path
   * @returns 处理后的树
   */
  public generateDirList(dirList: any, parentPath?: object[]) {
    return dirList.map(dir => {
      if (parentPath) {
        dir.path = parentPath.concat([{
          id: dir.id,
          label: dir.label,
          type: dir.type
        }])
      }
      if (dir.dirs && dir.dirs.length) {
        return {
          ...dir,
          children: this.generateDirList(dir.dirs, dir.path)
        }
      } else {
        return dir
      }
    })
  }

  /**
   * 生成带action的树
   * @param dirList 子节点列表
   */
  public async actionDirList(dirList: any) {
    if (UserModule.iamUserId && dirList && dirList.length) {
      const permissionRes = await previewAuthActions({
        targetResources: dirList.map(dir => ({
          groupId: this.currentGroupId,
          dirPath: ((dir.type === 'dir' || dir.type === 'platformDir') ? dir.path.map(path => path.id).join('/') : dir.path.slice(0, -1).map(path => path.id).join('/')) || '0',
          deviceId: (dir.type === 'dir' || dir.type === 'platformDir') ? undefined : dir.path[dir.path.length - 1].id
        }))
      })
      for (let idx = 0, len = dirList.length; idx < len; idx++) {
        const dir = dirList[idx]
        if (dir.children) {
          await this.actionDirList(dir.children)
        }
        Object.assign(dir, permissionRes.result[idx].iamUser.actions)
      }
    }
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
      let data
      if (this.isCustomTree) {
        data = await loadTreeNode({
          dirId: node.data.id
        })
        data.dirs = data.dirs.map(dir => ({
          ...dir,
          ...dir.authMap
        }))
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
      } else {
        const data = await this.getAuthActionsDeviceTree({
          groupId: this.currentGroupId,
          id: node.data.id,
          type: node.data.type
        }, node)
        data && dirTree.updateKeyChildren(key, data)
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
    const path: any = []
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

  public async getAuthActionsDeviceTree(params: any, node: any) {
    const res = await getDeviceTree(params)
    if (res.dirs) {
      if (this.currentGroupInProtocol === 'vgroup') {
        res.dirs.forEach((dir: any) => {
          dir.roleId = (node && node.data.roleId) || ''
          dir.realGroupId = (node && node.data.realGroupId) || ''
          dir.realGroupInProtocol = (node && node.data.realGroupInProtocol) || ''
        })
      }
      res.dirs = res.dirs
        .map((dir: any) => ({
          ...dir,
          groupId: this.currentGroupId,
          inProtocol: this.currentGroupInProtocol,
          path: node
            ? node.data.path.concat([dir])
            : [{
              id: dir.id,
              label: dir.label,
              type: dir.type
            }],
          parentId: node ? node.data.id : '0'
        }))
      res.dirs = this.setDirsStreamStatus(res.dirs)
      if (UserModule.iamUserId && res.dirs.length) {
        const permissionRes = await previewAuthActions({
          targetResources: res.dirs.map(dir => ({
            groupId: dir.groupId,
            dirPath: ((dir.type === 'dir' || dir.type === 'platformDir') ? dir.path.map(path => path.id).join('/') : dir.path.slice(0, -1).map(path => path.id).join('/')) || '0',
            deviceId: (dir.type === 'dir' || dir.type === 'platformDir') ? undefined : dir.path[dir.path.length - 1].id
          }))
        })
        res.dirs = res.dirs
          .map((dir: any, index: number) => ({
            ...dir,
            ...permissionRes.result[index].iamUser.actions
          }))
      }
      return res.dirs
    }
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
      let res
      if (this.isCustomTree) {
        res = await loadTreeNode({
          dirId: node.data.id
        })
        res.dirs = res.dirs.map(dir => ({
          ...dir,
          ...dir.authMap
        }))
        if (this.currentGroup?.inProtocol === 'vgroup') {
          res.dirs.forEach((dir: any) => {
            dir.roleId = node.data.roleId || ''
            dir.realGroupId = node.data.realGroupId || ''
            dir.realGroupInProtocol = node.data.realGroupInProtocol || ''
          })
        }
        res.dirs = this.setDirsStreamStatus(res.dirs)
        resolve(res.dirs)
      } else {
        const dirs = await this.getAuthActionsDeviceTree({
          groupId: this.currentGroupId,
          id: node.data.id,
          type: node.data.type
        }, node)
        resolve(dirs)
      }
    } catch (e) {
      console.log('e: ', e)
      resolve([])
    }
  }
}
