<template>
  <div class="ibox-container">
    <el-card calss="ibox-container__wrap">
      <div
        ref="deviceRef"
        :style="`height:${height}px`"
        class="ibox-container__tree-box"
        :class="{'ibox-container__collapsed': !isExpanded}"
      >
        <div class="ibox-container__left" :style="`width: ${dirDrag.width}px`">
          <div class="ibox-container__btnbox">
            <el-button class="ibox-container__expand" @click="toggledirList">
              <svg-icon name="hamburger" />
            </el-button>
            <el-button class="ibox-container__refresh" round plain @click="getDirList">
              <svg-icon name="refresh" />
            </el-button>
          </div>
          <div
            ref="dirList"
            class="ibox-container__tree-content"
            :style="`width: ${dirDrag.width}px`"
          >
            <el-tree
              ref="dirTree"
              :data="dirList"
              :load="loadDirs"
              lazy
              empty-text="暂无目录或设备"
              node-key="id"
              :default-expanded-keys="defaultExpandedKeys"
              :current-node-key="defaultKey"
              :props="treeProp"
              highlight-current
              @node-click="handleNodeClick"
            >
              <span slot-scope="{node, data}" class="ibox-container__tree-text">
                <svg-icon
                  v-if="data.deviceType === 'nvr'" name="nvr"
                  width="14" height="14"
                  :class="`ibox-container__tree-status ibox-container__tree-status__${data.deviceStatus.isOnline === 'off' ? 'off' : 'on'} `"
                />
                <svg-icon
                  v-else-if="data.deviceType === 'ibox'" name="ibox"
                  width="14" height="14"
                  :class="`ibox-container__tree-status ibox-container__tree-status__${data.deviceStatus === 'off' ? 'off' : 'on'} `"
                />
                <svg-icon
                  v-else-if="data.deviceType === 'ipc' " name="ipc"
                  width="14" height="14"
                  :class="`ibox-container__tree-status ibox-container__tree-status__${data.deviceStatus.isOnline === 'off' ? 'off' : 'on'} `"
                />
                <status-badge v-if="data.deviceType === 'ipc' && data.streams && data.streams.length" :status="data.streams[0].streamStatus" class="ibox-container__tree-status__stream" />
                <span v-if="data.deviceType ==='ipc' && data.streams.lentgth">{{ data.streams[0].streamStatus }}</span>
                <span>{{ getSum(node, data) }}</span>
              </span>
            </el-tree>
          </div>
        </div>
        <div
          class="ibox-container__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div class="ibox-container__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item" @click="gotoRoot">根目录</span>
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
              @click="handleNodeClick(item)"
            >
              {{ item.label }}
            </span>
          </div>
          <div
            class="ibox-container__list"
            :style="{height: `${height - 40}px`}"
          >
            <router-view :key="$route.fullPath" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import {
  Component, Provide, Mixins
} from 'vue-property-decorator'
import HandleMixin from './mixin/handleMixin'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import { getIBoxList, getDeviceList } from '@/api/ibox'
import { IBoxModule } from '@/store/modules/ibox'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'IBox',
  components: {
    StatusBadge
  }
})
export default class IBox extends Mixins(HandleMixin) {
  public loading = {
    dirTree: false,
    iboxTable: false
  }

  public isExpanded = true
  public height = 0
  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf' // 需要手动设置数据源的isLeaf属性，懒加载就不展示 可展开箭头
  }

  public dirList = []

  // public breadcrumb = []

  public iboxDevice: any = {}

  public iboxList = []

  public defaultExpandedKeys = []

  public treeIboxId = ''

  public async mounted() {
    this.calcHeight()
    window.addEventListener('resize', this.calcHeight)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.calcHeight)
    })
    await this.getDirList()
  }

  public get defaultKey() {
    const id = this.$route.query.deviceId
    if (!id) {
      return null
    }
    return id
  }

  public calcHeight() {
    const deviceRef = this.$refs.deviceRef as HTMLElement
    const { top = 0 } = deviceRef.getBoundingClientRect()
    const documentHeight = document.body.clientHeight
    this.height = documentHeight - top - 22
  }

  public toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  @Provide('handleNodeClick')
  public async handleNodeClick(item: any, node?: any) {
    // TODO 面包屑及刷新后选中逻辑
    const dirTree: any = this.$refs.dirTree
    let _node: any
    if (!node) {
      _node = dirTree.getNode(item.deviceId)
      if (_node) {
        // 过滤状态全量返回,不需要手动加载
        if (!_node.loaded) {
          this.loadDirChildren(item.deviceId, _node)
        }
        _node.parent.expanded = true
        dirTree.setCurrentKey(item.deviceId)
      }
    } else {
      _node = node
      _node.expanded = true
    }

    if (_node) {
      await IBoxModule.SetBreadcrumb(this.getDirPath(_node).reverse())
      const { deviceId } = _node?.data
      this.treeIboxId = deviceId
      switch (_node.level) {
        case 1:
          this.setListInfo('device', this.iboxDevice, deviceId)
          break
        case 2:
          if (_node.data.deviceType === 'nvr') {
            const iboxNvr = this.getIboxNvr(_node)
            this.setListInfo('nvrlist', iboxNvr, deviceId)
          } else if (_node.data.deviceType === 'ipc') {
            this.toDetail(_node.data, item)
          } else {
            this.toDetail(_node.data, item)
          }
          break
        case 3:
          this.toDetail(_node.data, item)
          break
        default:
          this.setListInfo('rootlist', this.iboxes, '')
      }
    } else {
      IBoxModule.SetList({ type: 'rootlist', data: this.iboxList })
      const param = {
        name: 'IBox',
        query: {
          type: 'rootlist'
        }
      }
      this.$router.push(param)
    }
  }

  // 获取ibox目录
  @Provide('getDirList')
  // @ts-ignore
  public async getDirList() {
    const { query } = this.$route as any
    const {
      deviceId = '',
      type = 'rootlist'
    }: { deviceId: string; type: string } = query

    // await IBoxModule.ResetBreadcrumb()

    const param = {
      pageNum: 1,
      pageSize: 9999 // 第一次请求，为了获取目录，传入9999
    }
    try {
      this.loading.dirTree = true
      const data = await getIBoxList(param)

      const { iboxes } = data

      this.dirList = iboxes.map((item: any) => {
        return {
          label: item.deviceName,
          deviceType: 'ibox',
          id: item.deviceId,
          ...item
        }
      })

      this.iboxes = iboxes

      this.setListInfo(type, iboxes, deviceId)
      this.$nextTick(() => {
        this.dirTreesStatus()
      })
    } catch (error) {
      console.log(error)
    } finally {
      this.loading.dirTree = false
    }
  }

  // 设置目录状态及关联面包屑
  public async dirTreesStatus() {
    const path: string | (string | null)[] | null = this.$route.query.path
    const dirTree: any = this.$refs.dirTree
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
            IBoxModule.SetBreadcrumb(this.getDirPath(node).reverse())
          }
        }
      }
    }
  }

  // 获取ibox下设备目录
  public async loadDirs(node: any, resolve: any) {
    const { data } = node
    const deviceId = data.deviceId

    if (deviceId) {
      await this.loadIboxDevice(deviceId)
    }

    // 根据 deviceType确定是否是子节点
    const iboxList = this.iboxDeviceData(this.iboxDevice)

    if (node.level === 1) {
      return resolve(iboxList)
    } else if (node.level === 2) {
      const { data } = node
      if (data.deviceType === 'nvr') {
        const iboxNvr = this.getIboxNvr(node)
        this.setListInfo('nvrlist', iboxNvr, data.deviceId)
        return resolve(iboxList)
      }
      return resolve([])
    }
    return resolve([])
  }

  // 组合数据
  public iboxDeviceData(data: any) {
    return data && data.length
      ? data.map((item: any) => {
        if (item.device.deviceType === 'nvr') {
          let videosInfo = item.videos[0]
          videosInfo = videosInfo[InVideoProtocolModelMapping[videosInfo.inVideoProtocol]]

          return {
            isLeaf: false,
            deviceType: 'nvr',
            label: item.device.deviceName,
            id: item.device.deviceId,
            ...item.device,
            ...item.industry,
            ...videosInfo,
            ...item
          }
        } else if (item.device.deviceType === 'ipc') {
          let videosInfo = item.videos[0]
          videosInfo = videosInfo[InVideoProtocolModelMapping[videosInfo.inVideoProtocol]]

          return {
            isLeaf: true,
            deviceType: 'ipc',
            label: item.device.deviceName,
            id: item.device.deviceId,
            ...item.device,
            ...item.industry,
            ...videosInfo,
            ...item
          }
        }
        return []
      })
      : []
  }

  // 加载子目录
  public async loadDirChildren(key: string, node: any) {
    try {
      const dirTree: any = this.$refs.dirTree
      const param = {
        ParentDeviceId: key,
        pageNum: 1,
        pageSize: 9999 // 第一次请求，为了获取目录，传入9999
      }
      const res = await getDeviceList(param)

      const iboxList = this.iboxDeviceData(res.devices)

      if (node.level === 1) {
        dirTree.updateKeyChildren(key, iboxList)
      } else if (node.level === 2) {
        const { data } = node
        if (data.deviceType === 'nvr') {
          dirTree.updateKeyChildren(key, iboxList)
        }
      }

      node.expanded = true
      node.loaded = true
    } catch (e) {
      console.log(e)
    }
  }

  public setDirsStreamStatus(dirs: any) {
    return dirs.map((dir: any) => {
      if (
        !dir.streamStatus &&
        dir.deviceStreams &&
        dir.deviceStreams.length > 0
      ) {
        const hasOnline = dir.deviceStreams.some((stream: any) => {
          return stream.streamStatus === 'on'
        })
        if (hasOnline) {
          dir.streamStatus = 'on'
        }
      }
      return dir
    })
  }

  public getIboxNvr(node: any) {
    const { data } = node
    const iboxNvr = data.deviceChannels.map((item: any) => ({
      isLeaf: true,
      deviceType: 'ipc',
      label: item.deviceName,
      id: item.deviceId,
      ...item
    }))
    return iboxNvr
  }

  public get breadcrumb() {
    return IBoxModule.breadcrumb ? IBoxModule.breadcrumb : []
  }

  // 获取ibox下设备
  public async loadIboxDevice(id: string) {
    const param = {
      ParentDeviceId: id,
      pageNum: 1,
      pageSize: 9999
    }

    try {
      this.loading.iboxTable = true
      const data: any = await getDeviceList(param)

      this.iboxDevice = data.devices
    } catch (error) {
      console.log(error)
    } finally {
      this.loading.iboxTable = false
    }
  }

  public setListInfo(
    type: string = 'rootlist',
    data: any = [],
    deviceId: string
  ) {
    const listInfo = {
      type,
      data
    }
    if (type !== 'ipc') {
      IBoxModule.SetList(listInfo)
    }
    let query: any = {}
    let router: any = {}
    if (deviceId) {
      query = {
        deviceId,
        type
      }
    } else {
      query = { type }
    }

    const path =
      this.breadcrumb.map((item: any) => item.deviceId).join(',') ||
      this.$route.query.path
    if (type === 'ipc') {
      router = {
        name: 'IBoxDeviceInfo',
        query: {
          path,
          ...query,
          tab: this.$route.query.tab || ''
        }
      }
    } else if (path) {
      router = {
        name: 'IBoxDeviceList',
        query: {
          path,
          deviceId,
          type
        }
      }
    } else {
      router = {
        name: 'IBoxDeviceList',
        query
      }
    }

    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) {
      return
    }
    this.$router.push(router)
  }

  // 区分计算树的 在线展示
  public getSum(node: any, data: any) {
    if (node.label && data.onlineSize >= 0 && data.onlineSize >= 0) {
      return `${node.label}(${data.onlineSize}/${data.deviceSize})`
    } else {
      return `${data.deviceName}`
    }
  }

  public treeHandle(node, data) {
    console.log(node, data)
  }

  // 返回根目录
  public async gotoRoot() {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(null)
    await IBoxModule.ResetBreadcrumb()
    // this.handleNodeClick({ deviceId: '0', type: 'rootlist' })
    this.$router.push({ name: 'IBox' })
    await this.getDirList()
  }

  public toDetail(item: any, routeInfo: any) {
    const path = this.breadcrumb.map((item: any) => item.deviceId).join(',')
    const query: any = {
      deviceId: item.deviceId,
      type: 'ipc'
    }

    const router: any = {
      name: 'IBoxDeviceInfo',
      query: {
        path,
        ...query,
        tab: routeInfo.tab || ''
      }
    }

    this.$router.push(router)
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

  // 获取目录菜单路径
  @Provide('getDirPath')
  public getDirPath(node: any) {
    const path: any = []
    const _getPath = (node: any, path: any) => {
      const data = node ? node.data : ''
      if (data && data.deviceId) {
        path.push({
          deviceId: data.deviceId,
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

  @Provide('goback')
  // @ts-ignore
  public goback() {
    const query: any = {
      deviceId: this.$route.query.deviceId,
      type: this.$route.query.type
    }
    if (this.$route.query.type === 'ipc') {
      const temp = this.breadcrumb.slice(-2, -1)[0]
      this.handleNodeClick(temp)
    } else {
      const router: any = {
        name: 'IBox',
        query,
        deviceId: this.$route.query.deviceId,
        type: this.$route.query.type
      }
      this.$router.push(router)
      this.handleNodeClick(router)
    }
  }
}
</script>
<style lang="scss" scoped>
.ibox-container {
  padding: 20px;

  ::v-deep {
    .el-card__body {
      padding: 0;
    }
  }

  &__wrap {
    position: relative;
  }

  &__left {
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: width 0.2s;
  }

  &__handle {
    position: absolute;
    z-index: 100;
    height: calc(100% - 20px);
    width: 8px;
    margin-left: -8px;
    border-right: 1px solid #eee;
    transition: border 0.1s;
    cursor: ew-resize;
  }

  &__right {
    flex: 1;
    min-width: 0;

    .breadcrumb {
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #eee;
      background: #f8f8f8;
      white-space: nowrap;
      overflow: hidden;
      transition: padding-left 0.2s;

      &__item {
        cursor: pointer;
      }
    }
  }

  &__tree-box {
    display: flex;
    position: relative;

    &.ibox-container__collapsed {
      .ibox-container__tree-content {
        width: 0 !important;
      }

      .ibox-container__left {
        width: 0 !important;
      }

      .ibox-container__handle,
      .ibox-container__refresh {
        display: none;
      }

      .breadcrumb {
        padding-left: 70px;
      }
    }
  }

  &__tree-content {
    flex: 1;
    padding: 10px;
    overflow: auto;
  }

  &__tree-status {
    margin-right: 5px;

    &__off {
      color: #6e7c89;
    }

    &__on {
      color: #65c465;
    }

    &__stream {
      position: absolute;
      top: -1px;
      left: -3px;
      width: 6px;
      height: 6px;
      opacity: 0.7;
    }
  }

  &__tree-text {
    position: relative;
  }

  &__btnbox {
    position: relative;
  }

  &__expand {
    border: none;
    border-radius: 0;
    left: 0;
    top: 0;
    z-index: 21;
    height: 39px;
    border-right: 1px solid #eee;
    font-size: 18px;
    padding: 10px 15px;
    background: #f8f8f8;
  }

  &__refresh {
    border: none;
    border-radius: 0;
    position: absolute;
    right: 0;
    z-index: 20;
  }

  &__list {
    display: flex;
    position: relative;
    padding: $padding-medium;
  }
}
</style>
