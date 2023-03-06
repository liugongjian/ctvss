<template>
  <div class="statistic-box__device__tree" :style="{height: `${maxHeight}px`}">
    <div
      class="device-list__handle"
      :style="`left: ${dirDrag.width}px`"
      @mousedown="changeWidthStart($event)"
    />
    <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
      <div class="dir-list" :style="`width: ${dirDrag.width}px`">
        <div class="dir-list__tools">
          <!-- <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) " class="item" effect="dark" content="子目录排序" placement="top" :open-delay="300">
            <el-button type="text" @click.stop="openDialog('sortChildren', {id: '0'})"><svg-icon name="sort" /></el-button>
          </el-tooltip> -->
          <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
            <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
          </el-tooltip>
          <!-- <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) " class="item" effect="dark" content="添加目录" placement="top" :open-delay="300">
            <el-button type="text" @click="openDialog('createDir')"><svg-icon name="plus" /></el-button>
          </el-tooltip>
          <el-tooltip v-if="false" class="item" effect="dark" content="目录设置" placement="top" :open-delay="300">
            <el-button type="text"><i class="el-icon-setting" /></el-button>
          </el-tooltip> -->
        </div>
        <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
          <div class="dir-list__tree--root" :class="{'actived': isRootDir}">
            <svg-icon name="component" width="12px" />
            根目录
            <span class="sum-icon">{{ `(${rootSums.online}/${rootSums.total})` }}</span>
          </div>
          <el-tree
            key="device-el-tree-filter"
            ref="dirTree"
            empty-text="暂无目录或设备"
            :data="dirList"
            node-key="id"
            lazy
            :load="loadDirs"
            highlight-current
            :props="treeProp"
            :current-node-key="defaultKey"
            @node-click="deviceRouter"
          >
            <span
              slot-scope="{node, data}"
              class="custom-tree-node"
              :class="{'online': data.deviceStatus === 'on'}"
            >
              <span class="node-name">
                <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                <span v-else class="node-dir">
                  <svg-icon name="dir" width="15" height="15" />
                  <svg-icon name="dir-close" width="15" height="15" />
                </span>
                <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                <additional-status
                  v-if="data.type === 'ipc'"
                  :record-status="data.recordStatus"
                  :alarm-info="data.alarmInfo"
                  :is-bind="data.isBind"
                />
                {{ node.label }}
                <span class="sum-icon">{{ getSums(data) }}</span>
                <span class="alert-type">{{ renderAlertType(data) }}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <!-- 虚拟业务组暂不支持搜索 -->
        <!-- <advanced-search v-if="currentGroup.inProtocol !== 'vgroup'" :search-form="advancedSearchForm" @search="doSearch" /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { VGroupModule } from '@/store/modules/vgroup'
import { GroupModule } from '@/store/modules/group'
import { DeviceModule } from '@/store/modules/device'
import { getDeviceTree } from '@/api/device'
import { checkPermission } from '@/utils/permission'
import { AdvancedSearch } from '@/type/AdvancedSearch'
import { setDirsStreamStatus, renderAlertType, getSums } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AdditionalStatus from '@/views/device/components/AdditionalStatus.vue'

@Component({
  name: 'DeviceTree',
  components: {
    StatusBadge,
    AdditionalStatus
  }
})

export default class extends Vue {
  private checkPermission = checkPermission
  public setDirsStreamStatus = setDirsStreamStatus
  public getSums = getSums
  public renderAlertType = renderAlertType

  public dirList = []
  public isExpanded = true

  public defaultKey = null
  private maxHeight: number = 0

  public loading = {
    dir: false,
    device: false
  }

  private rootSums = {
    online: 0,
    total: 0
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

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

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string) {
    this.advancedSearchForm.deviceStatusKeys = []
    this.advancedSearchForm.streamStatusKeys = []
    this.advancedSearchForm.deviceAddresses = {
      code: '',
      level: ''
    }
    this.advancedSearchForm.matchKeys = []
    this.advancedSearchForm.inputKey = ''
    this.advancedSearchForm.searchKey = ''
    this.advancedSearchForm.revertSearchFlag = false
    if (!groupId) return
    this.$nextTick(() => {
      this.initDirs()
    })
  }

  private mounted() {
    this.initSearchStatus()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    VGroupModule.resetVGroupInfo()
    window.removeEventListener('resize', this.calMaxHeight)
  }

  public get isRootDir() {
    return this.$route.query.type === 'dir' && this.$route.query.dirId === '0'
  }

  public get isVGroup() {
    return GroupModule.group?.inProtocol === 'vgroup'
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

  /**
   * 初始化目录
   */
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
        // this.initTreeStatus(isExpand)
        const dirTree: any = this.$refs.dirTree
        dirTree.setCurrentKey(this.dirList[0].id)
        this.deviceRouter(this.dirList[0])
      })
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
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
    // const deviceWrap: any = this.$refs.deviceWrap
    // const size = deviceWrap.$el.getBoundingClientRect()
    // const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - 172
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

  private deviceRouter(item: any, node?: any) {
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
    this.$emit('treeback', item.id)
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
</script>
