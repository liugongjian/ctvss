<template>
  <div class="app-container platform-container">
    <el-card class="platform">
      <div class="platform__header">
        <el-tooltip content="添加上级平台">
          <el-button type="primary" @click="handleCreate"><svg-icon name="plus" /></el-button>
        </el-tooltip>
        <el-input v-model="platformKeyword" class="platform__header--search" placeholder="请输入关键词" clearable>
          <svg-icon slot="append" name="search" />
        </el-input>
      </div>
      <div v-loading="loading.platform" class="platform__list">
        <ul>
          <li v-for="platform in filteredPlatformList" :key="platform.platformId" :class="{ 'actived': currentPlatform && (currentPlatform.platformId === platform.platformId) }" @click="selectPlatform(platform)">
            <span><status-badge :status="platform.status" /> {{ platform.name }}</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="查看平台详情" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="viewPlatform(platform)"><svg-icon name="documentation" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="editPlatform(platform)"><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="deletePlatform(platform)"><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
        </ul>
        <div v-if="platformList && !platformList.length && !loading.platform" class="empty-text">请创建向上级联平台</div>
      </div>
    </el-card>
    <el-card ref="deviceWrap" class="shared-devices">
      <div v-if="currentPlatform.platformId">
        <div class="filter-container">
          <!-- <el-button type="primary" @click="addDevices">
            添加资源
            <el-popover
              placement="top-start"
              title="添加资源"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.addDevices"
            >
              <svg-icon slot="reference" name="help" color="#fff" />
            </el-popover>
          </el-button> -->
          <el-button type="primary" @click="manageGroups">
            管理资源
          </el-button>
          <el-button v-if="!currentPlatform.enabled" :loading="loading.startStop" @click="startShare()">启动级联</el-button>
          <el-button v-else :loading="loading.startStop" @click="stopShare()">停止级联</el-button>
          <div class="filter-container__right">
            <div class="platform-status">平台状态: <status-badge :status="currentPlatform.status" />{{ platformStatus[currentPlatform.status] }}</div>
          </div>
        </div>
        <div class="device-list" :class="{ 'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging }" :style="{ height: `${maxHeight}px` }">
          <el-button class="device-list__expand" @click="toggledirList">
            <svg-icon name="hamburger" />
          </el-button>
          <div
            class="device-list__handle"
            :style="`left: ${dirDrag.width}px`"
            @mousedown="changeWidthStart($event)"
          />
          <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list" :style="`width: ${dirDrag.width}px`">
              <div class="dir-list__tools">
                <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                  <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
                </el-tooltip>
              </div>
              <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
                <el-tree
                  ref="dirTree"
                  empty-text="暂无目录或设备"
                  :data="dirList"
                  node-key="id"
                  highlight-current
                  lazy
                  :load="loadDirs"
                  :props="treeProp"
                  :default-expanded-keys="defaultExpandedKeys"
                  @node-click="nodeClick"
                >
                  <span
                    slot-scope="{ node, data }"
                    class="custom-tree-node"
                    :class="{ 'online': data.deviceStatus === 'on' }"
                  >
                    <span class="node-name">
                      <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                      <span v-else class="node-dir">
                        <svg-icon name="dir" width="15" height="15" />
                        <svg-icon name="dir-close" width="15" height="15" />
                      </span>
                      {{ node.label }}
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>
          </div>
          <div class="device-list__right">
            <div class="breadcrumb">
              <!-- <span class="breadcrumb__item" @click="goToRoot">根目录</span> -->
              <span
                v-for="item in breadcrumb"
                :key="item.id"
                class="breadcrumb__item"
                @click="goToPath(item)"
              >
                {{ item.label }}
              </span>
            </div>
            <div v-if="hasDir" ref="listWrap" class="device-list__max-height">
              <div ref="toolWrap" class="device-list__tools">
                <el-button class="cancle-btn" @click="cancleShareDevice(selectedList)">移除选中设备</el-button>
                <el-input v-model="searchDeviceName" class="filter-container__search-group" placeholder="请输入关键词" clearable @keyup.enter.native="handleFilter" @clear="handleFilter">
                  <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
                </el-input>
                <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
              </div>
              <el-table
                v-loading="loading.sharedDevices"
                :data="dataList"
                :height="tableMaxHeight"
                fit
                row-key="deviceId"
                :tree-props="{ children: 'channels', hasChildren: 'hasChildren' }"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" />
                <el-table-column prop="deviceName" label="设备ID/名称" min-width="160">
                  <template slot-scope="{ row }">
                    <div class="device-list__device-name">
                      <div class="device-list__device-id">{{ row.deviceId }}</div>
                      <!-- <div>{{ row.channelName || row.deviceName }}</div> -->
                      <div>{{ row.deviceName || row.channelName }}</div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="deviceStatus" label="设备状态">
                  <template slot-scope="{ row }">
                    <status-badge :status="row.deviceStatus" />
                    {{ deviceStatus[row.deviceStatus] || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="streamStatus" label="流状态">
                  <template slot-scope="{ row }">
                    <status-badge :status="row.streamStatus" />
                    {{ streamStatus[row.streamStatus] || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="gbId" label="国标ID">
                  <template slot-scope="{ row }">
                    {{ row.gbId || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="upGbId" label="上级平台国标ID">
                  <template slot-scope="{ row }">
                    {{ row.upGbId || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="action" label="操作" width="80" fixed="right">
                  <template slot-scope="{ row }">
                    <el-button type="text" @click="cancleShareDevice([row])">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                :current-page="pager.pageNum"
                :page-size="pager.pageSize"
                :total="pager.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
            <div v-else ref="listWrap" class="empty-text">
              暂无数据
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-text" :style="{ height: `${maxHeight + 55}px` }">
        请选择或创建一个向上级联平台
      </div>
    </el-card>
    <AddDevices v-if="dialog.addDevices" :platform-id="currentPlatform.platformId" @on-close="closeDialog" />
    <ManageGroups v-if="dialog.manageGroups" :platform-id="currentPlatform.platformId" @on-close="closeDialog" />
    <PlatformDetail v-if="dialog.platformDetail" :platform-id="currentPlatformDetail.platformId" @on-close="dialog.platformDetail = false" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Provide, Watch } from 'vue-property-decorator'
import { describeShareDirs, describeShareDevices, deletePlatform, cancleShareDevice, getPlatforms, cancleShareDir, startShareDevice, stopShareDevice } from '@/api/upPlatform'
import { DeviceStatus, StreamStatus, PlatformStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AddDevices from './compontents/dialogs/AddDevices.vue'
import ManageGroups from './compontents/dialogs/ManageGroups.vue'
import PlatformDetail from './compontents/dialogs/PlatformDetail.vue'

@Component({
  name: 'UpPlatformList',
  components: {
    AddDevices,
    PlatformDetail,
    StatusBadge,
    ManageGroups
  }
})
export default class extends Vue {
  private deviceStatus = DeviceStatus
  private streamStatus = StreamStatus
  private platformStatus = PlatformStatus
  private dirList: Array<any> = []
  private platformList: Array<any> = []
  private dataList: Array<any> = []
  private breadcrumb: Array<any> = []
  private selectedList: Array<any> = []
  private hasDir = false
  private platformKeyword = ''
  private searchDeviceName = ''
  private currentPlatform: any = {}
  private currentNodeData: any = {}
  private defaultExpandedKeys: Array<any> = []
  private currentPlatformDetail = null
  public isExpanded = true
  public maxHeight = null
  private tableMaxHeight = null
  private observer: any = null
  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }
  private dirTypeMap: any = {
    '0': 'dir',
    '1': 'nvr',
    '3': 'platform',
    '4': 'platformDir'
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  public loading = {
    platform: false,
    dir: false,
    sharedDevices: false,
    startStop: false
  }
  public dialog = {
    addDevices: false,
    platformDetail: false,
    manageGroups: false
  }
  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  public tips = {
    addDevices: '下方列表显示已共享的设备，点击"添加资源"添加想要共享的设备。',
    manageGroups: '管理虚拟业务组'
  }

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private get filteredPlatformList() {
    if (!this.platformKeyword) {
      return this.platformList
    } else {
      return this.platformList.filter((platform: any) => {
        return ~platform.name.indexOf(this.platformKeyword)
      })
    }
  }

  private refresh() {
    this.getList(this.currentNodeData, false)
  }

  private async mounted() {
    await this.getPlatformList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 查询上级平台列表
   */
  private async getPlatformList() {
    try {
      this.loading.platform = true
      const res = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.platformList = res.platforms
      console.log('this.platformList:', this.platformList)
      if (this.currentPlatform.platformId) {
        const currentPlatform = this.platformList.find((platform: any) => platform.platformId === this.currentPlatform.platformId)
        this.currentPlatform = currentPlatform
      } else {
        this.initPlatform()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.platform = false
    }
  }

  // 面包屑导航
  private goToPath(item: any) {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(item.id)
    const currentNode = dirTree.getNode(item.id)
    this.defaultExpandedKeys = [item.id]
    this.getList(currentNode.data, false)
    this.currentNodeData = currentNode.data
    this.breadcrumb = this.getNodePath(currentNode)
  }

  private handleSelectionChange(rows: any) {
    this.selectedList = rows
  }

  /**
   * 初始化上级平台
   */
  private initPlatform() {
    if (this.platformList.length !== 0) {
      this.selectPlatform(this.platformList[0])
    }
  }

  /**
   * 删除上级平台
   */
  private deletePlatform(platform: any) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除设备"${platform.name}"`,
      method: deletePlatform,
      payload: {
        platformId: platform.platformId
      },
      onSuccess: async() => {
        if (platform.platformId === this.currentPlatform.platformId) {
          this.currentPlatform = {}
        }
        await this.getPlatformList()
      }
    })
  }

  /**
   * 编辑上级平台
   */
  private editPlatform(platform: any) {
    this.$router.push({
      name: 'VideoUpPlatformUpdate',
      query: {
        platformId: platform.platformId
      }
    })
  }

  /**
   * 选择平台
   */
  private selectPlatform(platform: any) {
    this.currentPlatform = platform
    this.initDirs()
  }

  /**
   * 查看平台详情
   */
  private viewPlatform(platform: any) {
    this.dialog.platformDetail = true
    this.currentPlatformDetail = platform
  }

  /**
   * 启动级联
   */
  private async startShare() {
    try {
      this.loading.startStop = true
      await startShareDevice({
        platformId: this.currentPlatform.platformId
      })
      this.$message.success('已通知启动级联')
      setTimeout(this.getPlatformList, 2000)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.getPlatformList()
      this.loading.startStop = false
    }
  }

  /**
   * 停用级联
   */
  private async stopShare() {
    try {
      this.loading.startStop = true
      await stopShareDevice({
        platformId: this.currentPlatform.platformId
      })
      this.$message.success('已通知停用级联')
      setTimeout(this.getPlatformList, 2000)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.getPlatformList()
      this.loading.startStop = false
    }
  }

  /**
   * 获取设备列表
   */
  private async getList(node: any, isDelete: any) {
    if (!this.currentPlatform.platformId) {
      return
    }
    const params: any = {
      platformId: this.currentPlatform.platformId,
      // inProtocol: node.inProtocol,
      // groupId: node.groupId,
      dirId: node.dirId || '0',
      dirType: node.dirType || '0',
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      deviceName: this.searchDeviceName
    }
    this.loading.sharedDevices = true
    try {
      const res = await describeShareDevices(params)
      this.dataList = res.devices
      this.pager.total = res.totalNum
      const dirTree: any = this.$refs.dirTree
      const dirNode = dirTree.getNode(this.currentNodeData)
      // 是否删除目录
      if (isDelete && node.dirId && this.dataList.length === 0 && dirNode.childNodes.length === 0) {
        try {
          await cancleShareDir({
            platformId: this.currentPlatform.platformId,
            inProtocol: node.inProtocol,
            groupId: node.groupId,
            dirId: node.dirId
          })
          this.initDirs()
        } catch (e) {
          this.$message.error(e && e.message)
        }
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.sharedDevices = false
    }
  }

  /**
   * 移除设备
   */
  private cancleShareDevice(deviceList: any) {
    if (!deviceList.length) {
      this.$message.info('请先选择设备')
      return
    }
    this.$alertDelete({
      type: '设备',
      msg: `是否确认移除设备"${deviceList.map((device: any) => {
        return device.deviceName
      }).join(',')}"`,
      method: cancleShareDevice,
      payload: {
        platformId: this.currentPlatform.platformId,
        dirId: this.currentNodeData.dirId,
        devices: deviceList.map((device: any) => {
          return { deviceId: device.deviceId }
        })
      },
      onSuccess: () => {
        this.getList(this.currentNodeData, true)
      }
    })
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList(this.currentNodeData, false)
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList(this.currentNodeData, false)
  }

  private handleCreate() {
    this.$router.push({
      name: 'VideoUpPlatformCreate'
    })
  }

  private addDevices() {
    this.dialog.addDevices = true
  }

  private manageGroups() {
    if (this.currentPlatform.enabled) {
      this.$message.warning('当前平台已启动级联，无法操作平台资源，请先停止该平台的级联')
      return
    }
    this.dialog.manageGroups = true
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList(this.currentNodeData, false)
  }

  @Provide('initDirs')
  public async initDirs() {
    try {
      this.dirList = []
      this.loading.dir = true
      // const res = await describeShareGroups({
      //   platformId: this.currentPlatform.platformId,
      //   pageSize: 1000
      // })
      const res = await describeShareDirs({
        platformId: this.currentPlatform.platformId,
        dirId: '-1',
        pageSize: 1000
      })
      if (res.dirs.length) {
        this.hasDir = true
        res.dirs.forEach((group: any) => {
          // 放开rtsp rtmp
          // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome') && (
          this.dirList.push({
            id: group.dirId,
            dirId: group.dirId,
            groupId: group.groupId,
            label: group.dirName,
            inProtocol: group.inProtocol,
            gbId: group.gbId,
            type: 'group'
          })
          // )
        })
        this.$nextTick(() => {
          // 默认展开第一个组
          const initDir = this.dirList[0]
          const dirTree: any = this.$refs.dirTree
          dirTree.setCurrentKey(initDir.id)
          this.defaultExpandedKeys = [initDir.id]
          this.getList(this.dirList[0], false)
          this.currentNodeData = this.dirList[0]
          this.breadcrumb = this.getNodePath(dirTree.getNode(this.dirList[0].id))
        })
      } else {
        this.hasDir = false
        this.breadcrumb = []
      }
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载目录
   */
  public async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    try {
      const res = await describeShareDirs({
        // groupId: node.data.groupId,
        // dirId: node.data.type === 'group' ? 0 : node.data.dirId,
        // inProtocol: node.data.inProtocol,
        // platformId: this.currentPlatform.platformId
        dirId: node.data.dirId,
        inProtocol: node.data.inProtocol,
        platformId: this.currentPlatform.platformId,
        pageSize: 1000
      })

      const dirs = res.dirs.map((dir: any) => {
        return {
          ...dir,
          groupId: node.data.groupId,
          inProtocol: node.data.inProtocol,
          platformId: this.currentPlatform.platformId,
          type: 'dir',
          label: dir.dirName,
          id: dir.dirId
        }
      })
      resolve(dirs)
    } catch (e) {
      resolve([])
    }
  }

  private nodeClick(data: any, node: any) {
    console.log('data:', data)
    console.log('node:', node)
    node.expanded = true
    this.currentNodeData = data
    this.getList(this.currentNodeData, false)
    this.breadcrumb = this.getNodePath(node)
  }

  private closeDialog(refresh: boolean) {
    this.dialog.addDevices = false
    this.dialog.manageGroups = false
    refresh === true && this.initDirs()
  }

  private getNodePath(node: any) {
    const curentNodePath: any = []
    this.findParentNode(node, curentNodePath)
    return curentNodePath
  }

  private findParentNode(node: any, curentNodePath: any) {
    if (node.parent !== null) {
      curentNodePath.unshift({
        label: node.data.label,
        id: node.data.id
      })
      this.findParentNode(node.parent, curentNodePath)
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
    this.maxHeight = documentHeight - top - 90
    this.tableMaxHeight = this.maxHeight - 160
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
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }

  &__select {
    display: inline;
    margin-right: 10px;
  }

  .platform-status {
    margin: 10px 10px 0 0;
  }
}

.platform-container {
  display: flex;

  ::v-deep .el-card__body {
    padding: 0;
  }

  .platform {
    margin-right: 10px;
    min-width: 260px;

    &__header {
      border-bottom: 1px solid $borderGrey;
      padding: 15px;

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
      }

      ::v-deep .el-input-group__append {
        padding: 0 10px;
      }

      &--search {
        width: 172px;
      }
    }

    &__list {
      padding: 15px;
      min-height: 100px;

      ul {
        margin: 0;
        padding: 0;

        li {
          position: relative;
          list-style: none;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
          border-radius: 4px;
          padding-left: 10px;

          span {
            display: block;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          }

          .status-badge {
            width: 5px;
            height: 5px;
          }

          svg {
            color: $darkGray;
            vertical-align: middle;
            margin-left: 3px;
          }

          .tools {
            position: absolute;
            display: none;
            right: 0;
            top: 0;
            background: $treeHover;

            .el-button {
              padding: 5px;
            }

            .el-button + .el-button {
              margin-left: 0;
            }
          }

          &:hover {
            background: $treeHover;

            .tools {
              display: block;
            }
          }

          &.actived {
            background: $primary;
            color: #fff;

            .tools {
              background: $primary;
            }

            svg {
              color: #fff;
            }
          }
        }
      }
    }
  }

  .device-list__tools {
    text-align: right;
    margin-bottom: 10px;
    position: relative;

    .cancle-btn {
      float: left;
    }
  }

  .shared-devices {
    flex: 1;

    .filter-container {
      padding: 15px;
      margin: 0;
      border-bottom: 1px solid $borderGrey;
    }

    .device-list__max-height {
      padding: 15px;

      .el-table {
        ::v-deep .cell {
          display: flex;
          align-items: center;
        }
      }
    }

    .empty-text {
      margin-top: 50px;
    }
  }
}

</style>
