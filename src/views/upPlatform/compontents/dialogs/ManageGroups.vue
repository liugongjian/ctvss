<template>
  <el-dialog
    title="管理资源"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="960px"
    center
    @close="closeDialog"
  >
    <div class="dialog-wrap">
      <div v-show="step === 0" v-loading="loading.dir" class="tree-wrap">
        <el-tree
          ref="dirTree"
          node-key="id"
          lazy
          show-checkbox
          :data="dirList"
          :load="loadDirs"
          :props="treeProp"
          :check-strictly="false"
          draggable
          :allow-drop="() => false"
          @check="checkCallback"
          @check-change="onCheckDevice"
          @node-click="selectDevice"
          @node-drag-start="handleDragstart"
          @node-drag-end="handleDragend"
        >
          <span slot-scope="{node, data}" class="custom-tree-node" :class="{'online': data.deviceStatus === 'on'}">
            <span class="node-name">
              <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
              <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
              <span v-else class="node-dir">
                <svg-icon name="dir-close" width="15" height="15" />
              </span>
              {{ node.label }}
            </span>
          </span>
        </el-tree>
      </div>
      <div v-loading="loading.dir" class="tree-wrap">
        <div class="tree-wrap__sub">
          <el-tree
            ref="vgroupTree"
            node-key="id"
            draggable
            :data="sharedDirList"
            :load="loadSharedDirs"
            :props="treeProp"
            lazy
            :allow-drop="() => true"
            @node-click="selectVGroup"
          >
            <span slot-scope="{node, data}" class="custom-tree-node" :class="[data.deviceStatus === 'on' ? 'online' : '', step === 0 ? 'custom-tree-node' : 'custom-tree-node-right']">
              <span slot="reference" class="node-name">
                <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                <span v-else class="node-dir">
                  <svg-icon name="dir-close" width="15" height="15" />
                </span>
                {{ node.label.length > 10 ? node.label.substring(0,9)+'...' : node.label }}
              </span>
              <el-popover
                placement="top"
                trigger="hover"
                :open-delay="300"
                :content="node.label"
                popper-class="player__popover"
              >
                <span v-if="step === 1" slot="reference" class="node-input">
                  <div class="node-input__label"><span>{{ node.label.length > 10 ? node.label.substring(0,9)+'...' : node.label }}</span></div>

                  <div><el-input v-model="data.label" size="mini" /></div>
                </span>
              </el-popover>
            </span>
          </el-tree>
        </div>
        <!-- <div v-show="step === 1" class="tree-wrap__sub table">
          <el-table
            :data="tableData"
            style="width: 100%;"
            default-expand-all
            row-key="id"
            :tree-props="{children: 'childNodes'}"
            :stripe="false"
            :border="false"
            :show-header="false"
            :highlight-current-row="false"
          >
            <el-table-column
              prop="label"
              label="姓名"
              width="180"
            />
            <el-table-column
              width="180"
            >
              <template slot-scope="scope">
                <el-input v-model="scope.row.label" size="mini" />
              </template>
            </el-table-column>
          </el-table>
        </div> -->
        <div v-show="step === 1" class="tree-wrap__sub">
          <el-button type="primary" @click="changeMode">{{ mode === 'vgroup' ? '' : '退出' }}匹配行政区划</el-button>
        </div>
      </div>
      <div v-if="step === 0" class="device-wrap">
        <el-button type="primary" @click="openInner('append')">新建组/虚拟组织</el-button>
        <el-button type="primary" @click="openInner('edit')">编辑</el-button>
        <el-button type="primary" @click="openInner('deleteGroup')">删除组/虚拟组织</el-button>
        <el-button type="primary" @click="openInner('deleteDevice')">删除设备</el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="step === 0" type="primary" @click="next">下一步</el-button>
      <el-button v-if="step === 1" type="primary" @click="prev">上一步</el-button>
      <el-button v-if="step === 1" type="primary" @click="confirm">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
    <InnerDialog v-if="innerVisible" :platform-id="{}" :type="innerDialogType" :mode="mode" @close-inner="closeInner" />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { shareDevice, describeShareDevices, getPlatforms, describeShareGroups, cancleShareDir, describeShareDirs } from '@/api/upPlatform'
import { setDirsStreamStatus } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import InnerDialog from './InnerDialog.vue'

@Component({
  name: 'ManageGroups',
  components: {
    StatusBadge,
    InnerDialog
  }
})
export default class extends Vue {
  private dialogVisible = true
  private submitting = false
  private dirList: any = []
  private sharedDirList: any = []
  private deviceList: any = []
  public loading = {
    dir: false
  }
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private innerDialogType = ''

  private innerVisible = false

  private step = 0

  private currentPlatform = {}

  private dirTypeMap: any = {
    '0': 'dir',
    '1': 'nvr',
    '3': 'platform',
    '4': 'platformDir'
  }

  // 两种模式：虚拟组：vgroup和行政区：district
  private mode = 'vgroup'

  // private tableData = []

  private selectedNode = null

  @Prop()
  private platformId: any
  private typeMapping: any = {
    dir: 0,
    nvr: 1,
    platform: 3,
    platformDir: 4
  }

  private async mounted() {
    await this.initDirs()
    await this.initSharedDirs()
  }

  /**
   * 目录初始化
   */
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        this.dirList.push({
          id: group.groupId,
          groupId: group.groupId,
          label: group.groupName,
          inProtocol: group.inProtocol,
          gbId: group.gbId,
          type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
          disabled: false,
          path: [{
            id: group.groupId,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
          }]
        })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 查询上级平台列表
   */
  private async getPlatformList() {
    try {
      const res = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.platformList = res.platforms
      if (this.platformId) {
        const currentPlatform = this.platformList.find((platform: any) => platform.platformId === this.platformId)
        this.currentPlatform = currentPlatform
      } else {
        this.initPlatform()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    }
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
   * 选择平台
   */
  private selectPlatform(platform: any) {
    this.currentPlatform = platform
    this.initSharedDirs()
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  public async initSharedDirs() {
    try {
      this.sharedDirList = []
      const res = await describeShareGroups({
        platformId: this.platformId,
        pageSize: 1000
      })
      if (res.groups.length) {
        // this.hasDir = true
        res.groups.forEach((group: any) => {
          // 放开rtsp rtmp
          // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome') && (
          this.sharedDirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            gbId: group.gbId,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            sharedFlag: true,
            dragInFlag: false,
            path: [{
              id: group.groupId,
              label: group.groupName,
              type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
            }]
          })
          // )
        })
      }
    } catch (e) {
      this.sharedDirList = []
      console.log(e)
    }
  }

  /**
   * 获取设备列表
   */
  private async getList(node: any, isDelete: any) {
    if (!this.platformId) {
      return
    }
    let params: any = {
      platformId: this.platformId,
      inProtocol: node.inProtocol,
      groupId: node.groupId,
      dirId: node.dirId || '0',
      dirType: node.dirType || '0',
      pageNum: 0,
      pageSize: 1000
    }
    // this.loading.sharedDevices = true
    try {
      const res = await describeShareDevices(params)
      this.dataList = res.devices
      this.pager.total = res.totalNum
      // 是否删除目录
      if (isDelete && node.dirId && this.dataList.length === 0) {
        try {
          await cancleShareDir({
            platformId: this.platformId,
            inProtocol: node.inProtocol,
            groupId: node.groupId,
            dirId: node.dirId
          })
          this.initSharedDirs()
        } catch (e) {
          this.$message.error(e && e.message)
        }
      }
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 加载共享目录
   */
  public async loadSharedDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    try {
      let temp = await this.loadAll(node)
      resolve(temp)
    } catch (e) {
      resolve([])
    }
  }

  private async loadAll(node) {
    let res = []
    if (node.data.dragInFlag) { // 对新darg入的节点进行加载
      res = await this.getTree(node, node.data.dragInFlag)
    } else { // 对已共享的目录进行加载
      const dirs = await this.getSharedDirs(node)
      const deviceDirs = await this.getSharedTree(node)
      res = [...dirs, ...deviceDirs]
    }
    return res
  }

  private async getSharedDirs(node: any) {
    const res = await describeShareDirs({
      groupId: node.data.groupId,
      dirId: node.data.type === 'top-group' ? 0 : node.data.dirId,
      inProtocol: node.data.inProtocol,
      platformId: this.platformId
    })
    const dirs = res.dirs.map((dir: any) => {
      return {
        ...dir,
        groupId: node.data.groupId,
        inProtocol: node.data.inProtocol,
        platformId: this.platformId,
        type: this.dirTypeMap[dir.dirType],
        label: dir.dirName,
        id: dir.dirId,
        sharedFlag: true,
        dragInFlag: false,
        path: [{
          id: dir.dirId,
          label: dir.dirName,
          type: node.data.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
        }]
      }
    })
    return dirs
  }

  /**
   * 获取树中的共享设备
   */
  private async getSharedTree(node: any) {
    try {
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      let shareDeviceIds: any = []
      if (node.data.type !== 'vgroup' && node.data.type !== 'role') {
        let params: any = {
          platformId: this.platformId,
          inProtocol: node.data.inProtocol,
          groupId: node.data.realGroupId || node.data.groupId,
          dirId: node.data.type === 'top-group' || node.data.type === 'group' ? 0 : node.data.id,
          dirType: '0',
          pageNum: 1,
          pageSize: 1000
        }
        const shareDevices: any = await describeShareDevices(params)
        shareDeviceIds = shareDevices.devices.map((device: any) => {
          return device.deviceId
        })
      }

      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
        'self-defined-headers': {
          'role-id': node.data.roleId,
          'real-group-id': node.data.realGroupId
        }
      })

      // if (node.data.type === 'role') {
      //   devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
      // }
      // const vgroupTree: any = this.$refs.vgroupTree
      // let checkedKeys = vgroupTree.getCheckedKeys()
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
          sharedFlag = true
          // checkedKeys.push(dir.id)
          // vgroupTree.setCheckedKeys(checkedKeys)
        }
        if (dir.type === 'ipc') {
          node.data.disabled = false
        }
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          // disabled: dir.type !== 'ipc' || sharedFlag,
          disabled: sharedFlag,
          path: node.data.path.concat([dir]),
          sharedFlag: sharedFlag,
          dragInFlag: false,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || ''
        }
      })
      dirs = dirs.filter(dir => shareDeviceIds.includes(dir.id))
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any, dragInFlag: boolean = false) {
    try {
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      let shareDeviceIds: any = []
      if (node.data.type !== 'vgroup' && node.data.type !== 'role') {
        let params: any = {
          platformId: this.platformId,
          inProtocol: node.data.inProtocol,
          groupId: node.data.realGroupId || node.data.groupId,
          dirId: node.data.type === 'top-group' || node.data.type === 'group' ? 0 : node.data.id,
          dirType: '0',
          pageNum: 1,
          pageSize: 1000
        }
        const shareDevices: any = await describeShareDevices(params)
        shareDeviceIds = shareDevices.devices.map((device: any) => {
          return device.deviceId
        })
      }

      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
        'self-defined-headers': {
          'role-id': node.data.roleId,
          'real-group-id': node.data.realGroupId
        }
      })

      // if (node.data.type === 'role') {
      //   devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
      // }
      const dirTree: any = this.$refs.dirTree
      let checkedKeys = dirTree.getCheckedKeys()
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
          sharedFlag = true
          checkedKeys.push(dir.id)
          dirTree.setCheckedKeys(checkedKeys)
        }
        if (dir.type === 'ipc') {
          node.data.disabled = false
        }
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          // disabled: dir.type !== 'ipc' || sharedFlag,
          disabled: sharedFlag,
          path: node.data.path.concat([dir]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          dragInFlag
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  private async checkCallback(data: any) {
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(data.id)
    this.checkNodes(dirTree, node)
  }

  private async checkNodes(dirTree: any, node: any, dragInFlag: boolean = false) {
    let dirs = []
    if (!dragInFlag) {
      if (node.checked) {
        if (node.loaded) {
          node.expanded = true
        } else {
          dirs = await this.getTree(node)
          dirTree.updateKeyChildren(node.data.id, dirs)
          node.expanded = true
          node.loaded = true
        }
        node.childNodes.forEach((child: any) => {
          child.checked = true
          if (child.data.type !== 'ipc') {
            this.checkNodes(dirTree, child)
          }
        })
        this.onCheckDevice()
      }
    } else {
      if (node.loaded) {
        node.expanded = true
      } else {
        dirs = await this.loadAll(node)
        dirTree.updateKeyChildren(node.data.id, dirs)
        node.expanded = true
        node.loaded = true
      }
      node.childNodes.forEach((child: any) => {
        child.checked = true
        if (child.data.type !== 'ipc') {
          this.checkNodes(dirTree, child)
        }
      })
    }
  }

  /**
   * 单击ipc时直接勾选
   */
  private selectDevice(data: any) {
    if (data.type === 'ipc' && !data.sharedFlag) {
      const dirTree: any = this.$refs.dirTree
      const node = dirTree.getNode(data.id)
      dirTree.setChecked(data.id, !node.checked)
    }
  }

  private selectVGroup(data: any, node: any) {
    this.selectedNode = node
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice() {
    const dirTree: any = this.$refs.dirTree
    const nodes = dirTree.getCheckedNodes()
    this.deviceList = nodes.filter((node: any) => {
      return (node.type === 'ipc' && !node.sharedFlag)
    })
  }

  /**
   * 移除设备
   */
  private removeDevice(device: any) {
    const dirTree: any = this.$refs.dirTree
    dirTree.setChecked(device.id, false)
  }

  /**
   * 显示设备所在路径
   */
  private renderPath(path: any) {
    const dirPath = path.slice(0, -1)
    const dirPathName = dirPath.map((dir: any) => {
      return dir.label
    })
    return dirPathName.join('/')
  }

  /**
   * 提交
   */
  private async submit() {
    if (!this.deviceList.length) {
      this.$message.error('未选择任何资源')
      return
    }
    try {
      this.submitting = true
      const groups: any = []
      this.deviceList.forEach((item: any) => {
        // 构建group
        if (item.path[0].type === 'vgroup') {
          item = {
            ...item,
            path: item.path.slice(2)
          }
        }
        const groupId = item.path[0].id
        const inProtocol = item.path[0].inProtocol
        let currentGroup = groups.find((group: any) => group.groupId === groupId)
        if (!currentGroup) {
          currentGroup = {
            groupId: groupId,
            inProtocol: inProtocol,
            dirs: []
          }
          groups.push(currentGroup)
        }
        // 构建dir列表
        const pathDirs = item.path.filter((path: any) => {
          if (['dir', 'nvr', 'platform', 'platformDir'].includes(path.type)) return true
        })
        let dirId = '0'
        let currentGroupDir
        let dirType = 0
        let parentDirId = '0'
        // patform特殊字段
        let parentDirType = ''
        if (pathDirs.length) {
          const parentPath = pathDirs.slice(0, -1)
          parentDirId = '0'
          parentDirType = ''
          if (parentPath.length) {
            const ids = parentPath.map((path: any) => {
              return path.id
            })
            const types = parentPath.map((path: any) => {
              return this.typeMapping[path.type]
            })
            parentDirId = ids.join(',')
            parentDirType = types.join(',')
          }
          dirId = pathDirs[pathDirs.length - 1].id
          dirType = pathDirs[pathDirs.length - 1].type
          currentGroupDir = currentGroup.dirs.find((dir: any) => dir.dirId === dirId)
          if (!currentGroupDir) {
            currentGroupDir = {
              dirId,
              parentDirId,
              dirType: this.typeMapping[dirType] || 0,
              devices: []
            }
            currentGroup.dirs.push(currentGroupDir)
          }
        }
        currentGroupDir = currentGroup.dirs.find((dir: any) => dir.dirId === dirId)
        if (!currentGroupDir) {
          currentGroupDir = {
            dirId,
            parentDirId,
            dirType,
            devices: []
          }
          currentGroup.dirs.push(currentGroupDir)
        }
        // 构建ipc
        currentGroupDir.devices.push({
          deviceId: item.id
        })
        // 针对patform特殊处理
        if ((parentDirType + ',' + currentGroupDir.dirType).split(',').some(type => ['3', '4'].includes(type))) {
          currentGroupDir.parentDirType = parentDirType
        }
      })
      await shareDevice({
        platformId: this.platformId,
        vssGroups: groups
      })
      this.$message.success('添加资源成功！')
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
    this.closeDialog(true)
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private handleDragstart(node, event) {
    const vgroupTree: any = this.$refs.vgroupTree
    vgroupTree.$emit('tree-node-drag-start', event, { node: node })
  }

  private handleDragend(draggingNode, endNode, position, event) {
    const dirTree: any = this.$refs.dirTree
    const vgroupTree: any = this.$refs.vgroupTree

    // 插入一个空节点用于占位
    let emptyData = { id: draggingNode.id, children: [] }
    dirTree.insertBefore(emptyData, draggingNode)

    // 对拉入到共享树中的节点打上标记
    draggingNode.data = { ...draggingNode.data, dragInFlag: true }

    vgroupTree.$emit('tree-node-drag-end', event)
    this.$nextTick(() => {
      // 如果是移动到了当前树上，需要清掉空节点
      if (dirTree.getNode(draggingNode.data)) {
        dirTree.remove(emptyData)
      } else {
        // 如果移动到了别的树上，需要恢复该节点，并清掉空节点
        let data = JSON.parse(JSON.stringify(draggingNode.data))
        dirTree.insertAfter(data, dirTree.getNode(emptyData))
        dirTree.remove(emptyData)
      }
    })
  }

  private openInner(type) {
    this.innerVisible = true
    this.innerDialogType = type
    // const vgroupTree: any = this.$refs.vgroupTree
    // let emptyData = { id: 1, children: [] }
    // if (this.selectedNode) {
    //   vgroupTree.append(emptyData, this.selectedNode)
    // }
  }

  private closeInner() {
    this.innerVisible = false
  }

  private next() {
    this.step = 1
    // 点击下一步时，展开所有的node
    const vgroupTree: any = this.$refs.vgroupTree
    const nodes: any = vgroupTree.store.nodesMap
    Object.keys(nodes).forEach(nLabel => {
      this.checkNodes(vgroupTree, nodes[nLabel], true)
    })
  }

  private prev() {
    this.step = 0
  }

  private confirm() {
  }

  private load(tree, treeNode, resolve) {
    setTimeout(() => {
      resolve([
        {
          id: 31,
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          id: 32,
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }
      ])
    }, 1000)
  }
  private changeMode() {
    this.mode = this.mode === 'vgroup' ? 'district' : 'vgroup'
  }
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  display: flex;
  margin: -15px 0 10px;
  border: 1px solid $borderGrey;
}

.tree-wrap {
  flex: 1 0;
  height: 550px;
  padding: 10px;
  overflow: auto;
  border-right: 1px solid $borderGrey;
  display: flex;

  &__sub {
    flex: 1 0;
    // max-width: 360px;
    // /* stylelint-disable-next-line declaration-block-no-duplicate-properties */
    // max-width: 300px;
  }

  .table {
    flex: 2 0 !important;
    max-width: 400px;

    .el-table:before {
      height: 0 !important;
    }

    ::v-deep td {
      padding: 0 !important;
      border-bottom: none !important;
    }

    ::v-deep .cell {
      .el-input__inner {
        height: 26px !important;
      }
    }
  }

  .custom-tree-node-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    .el-input {
      height: 25px;
    }
  }

  .custom-tree-node {
    width: auto;

    .node-name {
      position: relative;
      width: 240px;
      overflow: hidden;

      .svg-icon {
        color: $textGrey;
      }
    }

    &.online {
      .node-name {
        position: relative;

        .svg-icon {
          color: #65c465;
        }
      }
    }

    .status-badge {
      position: absolute;
      top: -1px;
      left: -3px;
      width: 6px;
      height: 6px;
      opacity: 0.7;
      display: none;

      &--on {
        display: block;
      }
    }
  }

  .is-disabled + .custom-tree-node__ipc {
    cursor: not-allowed;
  }
}

.device-wrap {
  flex: 1 0;
  height: 550px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  button {
    width: 148px;
    margin-left: 0 !important;
    margin-top: 20px;
  }

  &__header {
    font-weight: bold;
    text-align: center;
    padding: 10px;
  }
}

.form__input {
  width: 80%;
}

.node-input {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;

  &__label {
    width: 150px;
    display: flex;
    justify-content: center;
    overflow: hidden;
    text-align: left;
  }

  & > div {
    width: 48%;
  }

  .el-input {
    width: 100%;
    height: 25px;
  }
}
</style>
