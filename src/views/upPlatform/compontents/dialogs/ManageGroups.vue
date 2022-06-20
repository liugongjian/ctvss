<template>
  <el-dialog
    title="管理资源"
    :visible="dialogVisible"
    width="1000px"
    center
    @close="closeDialog"
    @click.stop.native="clearSelected"
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
          :allow-drag="allowDrag"
          draggable
          :allow-drop="() => false"
          @node-drag-start="handleDragstart"
          @node-drag-end="handleDragend"
        >
          <!-- @check="checkCallback"
          @check-change="onCheckDevice"
          @node-click="selectDevice" -->
          <span slot-scope="{node, data}" class="custom-tree-node" :class="{'online': data.deviceStatus === 'on'}" @click="() => preventClick()" @mouseup="() => preventDrag()">
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
      <div v-loading="loading.sharedDir" class="tree-wrap">
        <div class="tree-wrap__sub">
          <el-tree
            ref="vgroupTree"
            node-key="id"
            :draggable="isDraggable"
            :data="sharedDirList"
            :load="loadSharedDirs"
            :props="treeProp"
            lazy
            :allow-drop="() => true"
            @node-drag-end="handleDragendShared"
            @node-click="selectSharedDevice"
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
              <span v-if="step === 1" slot="reference" class="node-input" @click.stop="">
                <div class="node-input__label"><span>{{ node.data.gbId || '-' }}</span></div>
                <div v-if="gbIdMode === 'district'"><el-input :value="data.gbIdDistrict" size="mini" @input="val => rootInput(node, data, val)" /></div>
                <div v-else><el-input v-model="data.gbIdVgroup" size="mini" /></div>
              </span>
            </span>
          </el-tree>
        </div>
        <div v-if="step === 1" class="tree-wrap__sub switch">
          <el-button type="primary" class="tree-wrap__sub__switch" @click="changeMode">{{ gbIdMode === 'vgroup' ? '' : '退出' }}匹配行政区划</el-button>
        </div>
      </div>
      <div v-if="step === 0" class="device-wrap">
        <el-button type="primary" @click="openInner('append')">新建组/虚拟组织</el-button>
        <el-button type="primary" :disabled="!(selectedNode && selectedNode.data.type !== 'ipc')" @click="openInner('edit')">编辑</el-button>
        <el-button type="primary" :disabled="!(selectedNode && selectedNode.data.type !== 'ipc')" @click="openInner('deleteGroup')">删除组/虚拟组织</el-button>
        <el-button type="primary" :disabled="!(selectedNode && selectedNode.data.type === 'ipc')" @click="openInner('deleteDevice')">删除设备</el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="step === 0" type="primary" :disabled="sharedDirList.length === 0 || loading.sharedDir || loading.dir" @click="next">下一步</el-button>
      <el-button v-if="step === 1" type="primary" :disabled="loading.sharedDir" @click="prev">上一步</el-button>
      <el-button v-if="step === 1" type="primary" :disabled="loading.sharedDir" @click="confirm">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
    <InnerDialog
      v-if="innerVisible"
      :selected-node="selectedNode"
      :platform-id="platformId"
      :type="innerDialogType"
      :mode="mode"
      @close-inner="closeInner"
      @inner-op="innerOp"
    />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { describeShareDevices, describeShareDirs, getPlatform, shareDevice } from '@/api/upPlatform'
import { setDirsStreamStatus } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import InnerDialog from './InnerDialog.vue'
import debounce from '@/utils/debounce'

@Component({
  name: 'ManageGroups',
  components: {
    StatusBadge,
    InnerDialog
  }
})
export default class extends Vue {
  @Prop()
  private platformId: any
  private dialogVisible = true
  private submitting = false
  private dirList: any = []
  private sharedDirList: any = []
  private deviceList: any = []
  public loading = {
    dir: false,
    sharedDir: false
  }
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf',
    disabled: () => {}
  }
  private innerDialogType = ''

  private innerVisible = false

  private step = 0

  private currentPlatform = {}

  private confirmList = []
  private dirTypeMap: any = {
    '0': 'dir',
    '1': 'nvr',
    '3': 'platform',
    '4': 'platformDir'
  }

  // 两种模式：虚拟组：vgroup和行政区：district
  private mode = 'vgroup'

  private gbIdMode = 'vgroup'

  private selectedNode = null

  private get isDraggable() {
    return this.step === 0
  }
  private typeMapping: any = {
    dir: 0,
    nvr: 1,
    platform: 3,
    platformDir: 4
  }

  // 利用防抖来控制按钮状态统一变更
  private debounceLoading = debounce(() => {
    this.loading.sharedDir = !this.loading.sharedDir
  }, 2000)

  private async mounted() {
    await this.initPlatform()
    this.initDirs()
    this.initSharedDirs()
  }

  private async initPlatform() {
    const res = await getPlatform({
      platformId: this.platformId
    })
    this.mode = res.platform?.cascadeType === 1 ? 'district' : 'vgroup'
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
          disabled: true,
          path: [{
            id: group.groupId,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            gbIdDistrict: group.gbId || '',
            gbIdVgroup: group.gbId || '',
            gbIdDistrictRoot: group.gbId
          }],
          gbIdDistrict: group.gbId || '',
          gbIdVgroup: group.gbId || '',
          gbIdDistrictRoot: group.gbId
        })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
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
      this.loading.sharedDir = true
      this.sharedDirList = []
      const res = await describeShareDirs({
        platformId: this.platformId,
        dirId: '-1',
        pageSize: 1000
      })
      if (res.dirs.length) {
        res.dirs.forEach((group: any) => {
          this.sharedDirList.push({
            id: group.dirId,
            dirId: group.dirId,
            label: group.dirName,
            inProtocol: group.inProtocol,
            gbId: group.gbId,
            type: this.mode === 'vgroup' ? 'dir' : 'top-group',
            dirType: group.dirType,
            sharedFlag: true,
            dragInFlag: false,
            path: [{
              id: group.dirId,
              label: group.dirName,
              type: this.mode === 'vgroup' ? 'group' : 'top-group',
              gbIdDistrict: group.gbId || '',
              gbIdVgroup: group.gbId || '',
              gbIdDistrictRoot: group.gbId
            }],
            gbIdDistrict: group.gbId || '',
            gbIdVgroup: group.gbId || '',
            gbIdDistrictRoot: group.gbId
          })
        })
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.sharedDir = false
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
    if (node.level === 0) return []
    let res = []
    this.loading.sharedDir = true
    if (node.data.dragInFlag) { // 对新darg入的节点进行加载
      res = await this.getTree(node)
    } else { // 对已共享的目录进行加载
      const dirs = await this.getSharedDirs(node)
      const devices = await this.getSharedTree(node)
      res = [...dirs, ...devices]
    }
    this.debounceLoading()
    return res
  }

  private async getSharedDirs(node: any) {
    const res = await describeShareDirs({
      dirId: node.data.dirId,
      inProtocol: node.data.inProtocol,
      platformId: this.platformId
    })

    const dirs = res.dirs.map((dir: any) => {
      return {
        ...dir,
        platformId: this.platformId,
        type: 'dir',
        label: dir.dirName,
        id: dir.dirId,
        sharedFlag: true,
        dragInFlag: false,
        path: node.data.path.concat([dir]),

        gbIdDistrict: node.data.path[0].gbIdDistrict + dir.gbId || '',
        gbIdVgroup: dir.gbId || '',
        gbIdDistrictRoot: node.data.path[0].gbIdDistrict
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
      let params: any = {
        platformId: this.platformId,
        dirId: node.data.dirId,
        dirType: node.data.dirType,
        pageSize: 1000
      }
      const res = await describeShareDevices(params)
      let dirs: any = res.devices.map((dir: any) => {
        const sharedFlag = true
        return {
          id: dir.deviceId,
          groupId: node.data.groupId,
          label: dir.deviceName,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          isLeaf: dir.isLeaf || true,
          type: dir.deviceType,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          // disabled: dir.type !== 'ipc' || sharedFlag,
          disabled: false,
          path: node.data.path.concat([dir]),
          sharedFlag,
          dragInFlag: false,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',

          gbId: dir.gbId,
          gbIdDistrict: node.data.path[0].gbIdDistrict + (dir.gbId || ''),
          gbIdVgroup: dir.gbId || '',
          gbIdDistrictRoot: node.data.path[0].gbIdDistrict
        }
      })
      // dirs = dirs.filter(dir => shareDeviceIds.includes(dir.id))
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any) {
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
          dirId: node.data.type === 'top-group' || node.data.type === 'group' ? -1 : node.data.id,
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
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
          sharedFlag = true
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
          disabled: true,
          path: node.data.path.concat([{ ...dir, gbIdDistrict: dir.gbId || '', gbIdVgroup: dir.gbId || '' }]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          dragInFlag: !!node.data?.dragInFlag,

          gbId: dir.gbId,
          gbIdDistrict: node.data.path[0].gbIdDistrict + (dir.gbId || ''),
          gbIdVgroup: dir.gbId || '',
          gbIdDistrictRoot: node.data.path[0].gbIdDistrict
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  // private async checkCallback(data: any) {
  //   const dirTree: any = this.$refs.dirTree
  //   const node = dirTree.getNode(data.id)
  //   await this.checkNodes(dirTree, node)
  // }

  // private async checkNodes(dirTree: any, node: any) {
  //   if (node.checked) {
  //     if (node.loaded) {
  //       node.expanded = true
  //     } else {
  //       const dirs = await this.getTree(node)
  //       dirTree.updateKeyChildren(node.data.id, dirs)
  //       node.expanded = true
  //       node.loaded = true
  //     }
  //     node.childNodes.forEach((child: any) => {
  //       child.checked = true
  //       if (child.data.type !== 'ipc') {
  //         this.checkNodes(dirTree, child)
  //       }
  //     })
  //     this.onCheckDevice()
  //   }
  // }

  private async expandNodes(dirTree: any, node: any, singleNode: boolean = false) {
    let dirs = []
    try {
      if (node.data.dragInFlag) {
      // 如果节点是拉进来的
        if (node.loaded) {
          node.expanded = true
        } else {
          dirs = await this.getTree(node)
          dirTree.updateKeyChildren(node.data.id, dirs)
          node.expanded = true
          node.loaded = true
        }
        if (!singleNode) {
          node.childNodes.forEach((child: any) => {
            child.checked = true
            if (child.data.type !== 'ipc') {
              this.expandNodes(dirTree, child)
            }
          })
        }
      } else {
      // 如果节点是原有的（已共享的）
        if (node.loaded) {
          node.expanded = true
        } else {
          dirs = await this.loadAll(node)
          dirTree.updateKeyChildren(node.data.id, dirs)
          node.expanded = true
          node.loaded = true
        }
        if (!singleNode) {
          node.childNodes.forEach((child: any) => {
            child.checked = true
            if (child.data.type !== 'ipc') {
              this.expandNodes(dirTree, child)
            }
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  private async forceRefreshChildren(dirTree: any, node: any) {
    const dirs = await this.loadAll(node)
    dirTree.updateKeyChildren(node.data.id, dirs)
    node.expanded = true
    node.loaded = true
  }

  private async expandSingleSharedDir(dirTree: any, node: any) {
    let dirs = []

    // 如果节点是原有的（已共享的）
    if (node.loaded) {
      node.expanded = true
    } else {
      try {
        dirs = await this.loadAll(node)
      } catch (e) {
        dirs = []
      }
      dirTree.updateKeyChildren(node.data.id, dirs)
      node.expanded = true
      node.loaded = true
    }
  }

  /**
   * 单击ipc时直接勾选
   */
  // private selectDevice(data: any) {
  //   if (data.type === 'ipc' && !data.sharedFlag) {
  //     const dirTree: any = this.$refs.dirTree
  //     const node = dirTree.getNode(data.id)
  //     dirTree.setChecked(data.id, !node.checked)
  //   }
  // }

  private selectSharedDevice(data: any, node: any) {
    this.selectedNode = node
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  // private onCheckDevice() {
  //   const dirTree: any = this.$refs.dirTree
  //   const nodes = dirTree.getCheckedNodes()
  //   this.deviceList = nodes.filter((node: any) => {
  //     return (node.type === 'ipc' && !node.sharedFlag)
  //   })
  // }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private handleDragstart(node, event) {
    const vgroupTree: any = this.$refs.vgroupTree
    vgroupTree.$emit('tree-node-drag-start', event, { node: node })
  }

  private async handleDragendShared(draggingNode, endNode) {
    if (endNode.data.type === 'ipc') {
      return false
    }
    if (endNode) {
      const dirTree: any = this.$refs.dirTree
      const vgroupTree: any = this.$refs.vgroupTree
      if (!draggingNode.data.dragInFlag) {
        const draggingData = JSON.parse(JSON.stringify(draggingNode.data))
        vgroupTree.remove(draggingData)
        const checkedNodes = dirTree.getCheckedNodes(true, false)
        console.log('checkedNodes:', checkedNodes)
        checkedNodes.push({ ...draggingData, dragInFlag: true })
        const param = checkedNodes.filter(data => data.type === 'ipc')
        await shareDevice({
          platformId: this.platformId,
          dirs: [{
            dirId: endNode.data.dirId,
            gbId: draggingNode.data.gbId,
            devices: param.map(data => ({
              deviceId: data.id,
              gbId: data.gbId,
              upGbId: data.gbId,
              deviceName: data.label,
              deviceType: data.type,
              inProtocol: data.inProtocol,
              channels: []
            }))
          }]
        })
        this.forceRefreshChildren(vgroupTree, endNode)
      }
    }
  }

  private handleDragend(draggingNode, endNode, position, event) {
    const dirTree: any = this.$refs.dirTree
    const vgroupTree: any = this.$refs.vgroupTree

    // // 插入一个空节点用于占位
    let emptyData = { id: draggingNode.id, children: [] }
    dirTree.insertBefore(emptyData, draggingNode)

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
        dirTree.setChecked(data)
      }
    })
  }

  private openInner(type) {
    if (!this.selectedNode || this.selectedNode.data.type === 'ipc') {
      if (type !== 'deleteDevice' && type !== 'append') {
        this.$message({
          message: '请先选择一个目录',
          type: 'warning'
        })
        return
      }
    }
    if (this.selectedNode && this.selectedNode.data.type !== 'ipc' && this.mode === 'district' && this.selectedNode.level > 3 && type === 'append') {
      this.$message({
        message: '行政区划目录层级不得超过4级',
        type: 'warning'
      })
      return
    }
    this.innerVisible = true
    this.innerDialogType = type
  }

  private async closeInner() {
    this.innerVisible = false
  }

  private next() {
    this.step = 1
    // 点击下一步时，展开所有的node
    const vgroupTree: any = this.$refs.vgroupTree
    // const nodes: any = vgroupTree.store.nodesMap
    this.sharedDirList.forEach(async item => { await this.expandNodes(vgroupTree, vgroupTree.getNode(item)) })
  }

  private prev() {
    this.step = 0
  }

  private allowDrag(node) {
    if (node.data.type !== 'ipc') {
      this.$message({
        message: '只能拖拽设备',
        type: 'warning'
      })
      return false
    }
    return true
  }

  private async confirm() {
    const list = JSON.parse(JSON.stringify(this.sharedDirList))

    if (list.length === 0) {
      return this.$message({
        message: '没有要提交的内容',
        type: 'warning'
      })
    }
    let param = []
    list.forEach(item => param.push(...this.generateParam(item, item.children)))

    try {
      await shareDevice({
        platformId: this.platformId,
        dirs: param
      })
      this.$message.success('添加成功！')
      this.closeDialog(true)
    } catch (e) {
      console.log(e)
      this.$message.error(e)
    }
  }

  private generateParam(dir, list) {
    const devices = []
    const dirs = []
    list.forEach(item => {
      item.type === 'ipc' ? devices.push(item) : dirs.push(...this.generateParam(item, item.children))
    })
    dirs.push({
      dirId: dir.dirId,
      gbId: this.gbIdMode === 'vgroup' ? dir.gbIdVgroup : dir.gbIdDistrict,
      devices: devices.map(device => ({
        deviceId: device.id,
        gbId: device.gbId,
        upGbId: this.gbIdMode === 'vgroup' ? device.gbIdVgroup : device.gbIdDistrict,
        deviceName: device.label,
        deviceType: device.type,
        inProtocol: device.inProtocol,
        channels: []
      }))
    })
    return dirs
  }

  private changeMode() {
    this.gbIdMode = this.gbIdMode === 'vgroup' ? 'district' : 'vgroup'
  }

  private async innerOp(opParam) {
    const vgroupTree: any = this.$refs.vgroupTree
    // 刷新某个节点
    if (opParam.selectedNode) {
      // 有选择节点
      this.forceRefreshChildren(vgroupTree, opParam.type === 'append' ? opParam.selectedNode : opParam.selectedNode.parent)
    } else {
      // 无选择节点：创建根目录
      const res = await describeShareDirs({
        platformId: this.platformId,
        dirId: '-1',
        pageSize: 1000
      })
      const newSharedDirs = []
      if (res.dirs.length > 0) {
        res.dirs.forEach((group: any) => {
          newSharedDirs.push({
            id: group.dirId,
            dirId: group.dirId,
            label: group.dirName,
            inProtocol: group.inProtocol,
            gbId: group.gbId,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            dirType: group.dirType,
            sharedFlag: true,
            dragInFlag: false,
            path: [{
              id: group.dirId,
              label: group.dirName,
              type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
              gbIdDistrict: group.gbId || '',
              gbIdVgroup: group.gbId || '',
              gbIdDistrictRoot: group.gbId
            }],
            gbIdDistrict: group.gbId || '',
            gbIdVgroup: group.gbId || '',
            gbIdDistrictRoot: group.gbId
          })
        })
      }
      let difference = newSharedDirs.filter(x => !this.sharedDirList.find(y => y.dirId === x.dirId))
      this.sharedDirList.push(difference[0])
    }

    this.$message.success('操作成功')

    this.innerVisible = false
  }

  private clearSelected() {
    this.selectedNode = null
  }

  private rootInput(node, data, val) {
    data.gbIdDistrict = val
    if (node.level === 1 && this.gbIdMode === 'district') { // 根节点
      data.gbIdDistrictRoot = val
      this.changeGbIdDistrictRoot(data, val)
    }
  }

  private changeGbIdDistrictRoot(data, val) {
    if (data.children && data.children.length > 0) {
      data.children.forEach(child => {
        child.gbIdDistrictRoot = val
        child.gbIdDistrict = val + child.gbId
        this.changeGbIdDistrictRoot(child, val)
      })
    }
  }

  private preventClick() {
    // @ts-ignore
    if (window.mouseup_click_debug) {
      return false
    }
  }

  private preventDrag() {
    // @ts-ignore
    window.mouseup_click_debug = true
    setTimeout(function() {
      // @ts-ignore
      window.mouseup_click_debug = false
    }, 200)
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
  justify-content: space-between;

  .switch {
    display: flex;
    justify-content: flex-end;
  }

  &__sub {
    // flex: 1 0;
    // display: flex;
    // justify-content: center;
    width: 100%;

    &__switch {
      height: 36px;
    }
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

      ::v-deep .el-input__inner {
        height: 25px;
      }
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
  width: 400px;

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
