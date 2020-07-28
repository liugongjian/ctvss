<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="currentGroupId"
        class="filter-group"
        placeholder="请选择业务组"
      >
        <el-option
          v-for="item in groupList"
          :key="item.id"
          :label="item.groupName"
          :value="item.id"
        />
      </el-select>
    </div>
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
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
              <el-tooltip class="item" effect="dark" content="添加目录" placement="top" :open-delay="300">
                <el-button type="text" @click="openDialog('createDir')"><i class="el-icon-plus" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="目录设置" placement="top" :open-delay="300">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
              <el-tree
                ref="dirTree"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
                :current-node-key="defaultKey"
                @node-click="deviceRouter"
              >
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <span class="node-name">
                    <svg-icon :name="data.type" color="#6e7c89" />
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                  </span>
                  <div v-if="data.type === 'dir'" class="tools" :style="`left: ${dirDrag.width - 80}px`">
                    <el-tooltip class="item" effect="dark" content="添加子目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('createDir', data)"><i class="el-icon-plus" /></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('updateDir', data)"><i class="el-icon-edit" /></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="删除目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="deleteDir(data)"><i class="el-icon-delete" /></el-button>
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
              @click="deviceRouter(item)"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <router-view />
          </div>
        </div>
      </div>
    </el-card>
    <create-dir v-if="dialog.createDir" :parent-dir="parentDir" :current-dir="currentDir" :group-id="currentGroupId" @on-close="closeDialog('createDir')" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Provide } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { Group } from '@/type/group'
import { DeviceStatus, DeviceType } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import CreateDir from './components/dialogs/CreateDir.vue'
import { deleteDir } from '@/api/dir'
import { resolve } from 'dns'

@Component({
  name: 'Device',
  components: {
    StatusBadge,
    CreateDir
  }
})
export default class extends Vue {
  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private isExpanded = true
  private loading = false
  private currentGroupId: number | null = null
  private currentGroup: Group | null = null
  private keyword = ''
  private breadcrumb: Array<any> = []
  private maxHeight = 1000
  private parentDir = null
  private currentDir = null
  private pager = {
    pageIndex: 1,
    pageSize: 10,
    total: 20
  }
  private dialog = {
    createDir: false
  }
  private dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private groupList = [
    {
      id: 1,
      groupName: 'IPC测试组',
      inProtocol: 'gb'
    }, {
      id: 2,
      groupName: 'RTMP测试组',
      inProtocol: 'rtmp'
    }, {
      id: 3,
      groupName: '广州电信园区',
      inProtocol: 'gb'
    }
  ]

  private deviceList: Array<Device> = []

  private dirList = [{
    label: '区域一',
    id: 1,
    type: 'dir',
    children: [{
      label: '一号楼',
      id: 4,
      type: 'dir',
      children: [{
        label: '一楼',
        id: 5,
        type: 'dir',
        children: []
      }]
    }, {
      label: '二号楼',
      id: 3,
      type: 'dir',
      children: []
    }]
  }]

  private get defaultKey() {
    const id = this.$route.query.id
    if (!id) {
      return null
    }
    return parseInt(id.toString())
  }

  private mounted() {
    this.currentGroupId = 1
    this.currentGroup = this.groupList[0]
    if (!this.$route.query.groupId) {
      this.$router.push({
        name: 'device-list',
        query: {
          groupId: this.currentGroupId!.toString(),
          inProtocol: this.currentGroup!.inProtocol
        }
      })
    }
    this.initTreeStatus()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 计算最大高度
   */
  private calMaxHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 65
  }

  /**
   * 创建设备
   */
  private handleCreate() {
    this.$router.push('/device/create')
  }

  /**
   * 收起/展开目录列表
   */
  private toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * 初始化目录状态
   */
  private async initTreeStatus() {
    const dirTree: any = this.$refs.dirTree
    const path: string | (string | null)[] | null = this.$route.query.path
    const keyPath = path ? path.toString().split(',') : null
    if (keyPath) {
      for (let i = 0; i < keyPath.length; i++) {
        const _key = parseInt(keyPath[i])
        const node = dirTree.getNode(_key)
        if (node) {
          await this.loadDirChildren(_key, node)
          if (i === keyPath.length - 1) {
            this.breadcrumb = this.getDirPath(node).reverse()
          }
        }
      }
    }
  }

  /**
   * 加载子目录
   */
  private async loadDirChildren(key: number, node: any) {
    const dirTree: any = this.$refs.dirTree
    let data = node.data.children || []
    let deviceData = await this.loadDevices(node)
    if (deviceData) {
      data = data.concat(deviceData)
    }
    dirTree.updateKeyChildren(key, data)
    node.expanded = true
    node.loaded = true
  }

  /**
   * 设备页面路由
   */
  @Provide('deviceRouter')
  private deviceRouter(item: any, node: any) {
    const dirTree: any = this.$refs.dirTree
    let _node: any
    if (!node) {
      _node = dirTree.getNode(item.id)
      if (!_node.loaded) {
        this.loadDirChildren(item.id, _node)
      }
      _node.parent.expanded = true
      dirTree.setCurrentKey(item.id)
    } else {
      _node = node
    }
    this.breadcrumb = this.getDirPath(_node).reverse()
    let router: any
    let query: any = {}
    switch (item.type) {
      case 'dir':
        router = {
          name: 'device-list'
        }
        break
      case 'nvr':
        router = {
          name: 'device-list'
        }
        break
      case 'ipc':
        router = {
          name: 'device-preview'
        }
        query = {
          previewTab: item.previewTab
        }
        break
      case 'detail':
        router = {
          name: 'device-detail'
        }
        break
    }
    router.query = {
      id: item.id.toString(),
      groupId: this.currentGroupId!.toString(),
      inProtocol: this.currentGroup!.inProtocol,
      type: item.type,
      path: this.breadcrumb.map(item => item.id).join(','),
      ...query
    }
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
  }

  /**
   * 加载设备
   */
  private loadDevices(node: any) {
    return new Promise((resolve, reject) => {
      const item = node.data
      setTimeout(() => {
        let data
        if (item.id === 4) {
          data = [{
            label: 'NVR设备',
            id: 31,
            type: 'nvr'
          }, {
            label: '设备三',
            id: 34,
            type: 'ipc',
            streamStatus: 'on',
            isLeaf: true
          }]
        }
        if (item.id === 31) {
          data = [{
            label: '工厂园区37号楼一层A区通道No.311',
            id: 32,
            type: 'ipc',
            streamStatus: 'on',
            isLeaf: true
          }, {
            label: '通道2',
            id: 33,
            type: 'ipc',
            streamStatus: 'off',
            isLeaf: true
          }]
        }
        resolve(data)
      }, 500)
    })
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.isLeaf) return resolve([])
    if (node.level === 0) {
      resolve(node.data)
    } else {
      console.log(node)
      let data = node.data.children || []
      let deviceData = await this.loadDevices(node)
      if (deviceData) {
        data = data.concat(deviceData)
      }
      resolve(data)
    }
  }

  /**
   * 获取树菜单路径
   */
  private getDirPath(node: any) {
    let path: any = []
    const _getPath = (node: any, path: any) => {
      const data = node.data
      if (data.id) {
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
   * 设置左侧宽度
   */
  private changeWidthStart(e: MouseEvent) {
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
    window.addEventListener('mouseup', (e) => {
      this.dirDrag.isDragging = false
    })
  }

  /**
   * 删除目录
   */
  private deleteDir(dir: any) {
    this.$alertDelete({
      type: '目录',
      msg: `是否确认删除目录"${dir.label}"`,
      method: deleteDir,
      payload: { dirId: dir.dirId }
    })
  }

  /**
   * 打开对话框
   */
  private openDialog(type: string, payload: any) {
    switch (type) {
      case 'createDir':
        if (payload) {
          this.parentDir = payload
        }
        this.dialog.createDir = true
        break
      case 'updateDir':
        if (payload) {
          this.currentDir = payload
        }
        this.dialog.createDir = true
        break
    }
  }

  /**
   * 关闭对话框
   */
  private closeDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'createDir':
      case 'updateDir':
        this.currentDir = null
        this.parentDir = null
    }
  }
}
</script>
<style lang="scss" scoped>
  .filter-group {
    width: 300px;
    ::v-deep .el-input--medium .el-input__inner {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
    }
  }
  .device-list-wrap {
    ::v-deep .el-card__body {
      padding: 0;
    }
  }
  .device-list {
    position: relative;
    display: flex;

    &__handle {
      position: absolute;
      top: 0;
      margin-left: -8px;
      z-index: 100;
      height: 100%;
      width: 8px;
      border-right: 1px solid $borderGrey;
      transition: border .1s;
      cursor: ew-resize;

      &:hover {
        border-right-color: #ccc;
      }
    }

    &__left {
      overflow: hidden;
      transition: width .2s;

      .dir-list {
        height: 100%;
        display: flex;
        flex-direction: column;
        &__tools {
          height: 40px;
          border-bottom: 1px solid $borderGrey;
          text-align: right;
          padding-right: 5px;
          background: #f8f8f8;
          .el-button--text {
            margin: 0;
            padding: 12px 5px;
            color: $text;
            font-size: 16px;
          }
        }
        &__tree {
          padding: 10px;

          ::v-deep .el-tree-node__content {
            position: relative;
            &:hover {
              .tools {
                display: block;
              }
            }
          }

          .svg-icon {
            margin-right: 5px;
          }

          .custom-tree-node {
            .node-name {
              position: relative;
            }
            .status-badge {
              position: absolute;
              top: -1px;
              left: -3px;
              width: 6px;
              height: 6px;
              opacity: 0.7;
            }
            .tools {
              position: absolute;
              top: 0;
              display: none;
              background: #F5F7FA;
              .el-button {
                color: $text;
                padding: 5px 0;
              }
              .el-button + .el-button {
                margin-left: 5px;
              }
            }
          }
        }
      }
      .el-tree {
        flex: 1;
        background: none;
      }
    }
    &__right {
      flex: 1;
      overflow: hidden;
      .filter-container__search-group {
        margin-right: 10px;
      }
    }
    &__container {
      padding: 15px;
    }

    &__expand {
      position: absolute;
      border: none;
      border-radius: 0;
      left: 0;
      top: 0;
      z-index: 11;
      height: 39px;
      border-right: 1px solid $borderGrey;
      font-size: 18px;
      padding: 10px 15px;
      background: #f8f8f8;
    }

    .breadcrumb {
      height: 40px;
      line-height: 40px;
      padding-left: 15px;
      border-bottom: 1px solid $borderGrey;
      background: #f8f8f8;
      transition: padding-left .2s;
      &__item {
        cursor: pointer;
      }
      &__item:after {
        content: '/';
        color: $textGrey;
        margin: 0 10px;
      }
      &__item:last-child:after {
        content: '';
      }
    }

    &--dragging {
      cursor: ew-resize;

      .device-list__left {
        transition: none;
      }
      * {
        user-select:none;
      }
    }

    &--collapsed {
      .device-list__handle {
        display: none;
      }
      .device-list__left {
        width: 0px!important;
      }
      .breadcrumb {
        padding-left: 70px;
      }
      .device-list__expand {
        left: 1px;
        i {
          transform: rotate(180deg);
        }
      }
    }
    .device-list__max-height {
      overflow: auto;
    }
  }
</style>
