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
        <div class="tree-wrap__sub">
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
            :expand-on-click-node="false"
            draggable
            :allow-drop="() => false"
            @node-drag-start="handleDragstart"
            @node-drag-end="handleDragend"
            @check="checkCallback"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node" :class="{ 'online': data.deviceStatus === 'on' }">
              <span class="node-name">
                <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                <span v-else class="node-dir">
                  <svg-icon name="dir-close" width="15" height="15" />
                </span>
                {{ node.label }}
                
                <span v-if="data.securityLevel" class="security-icon">{{ dicts.SecurityLevel[data.securityLevel] }}</span>
              </span>
            </span>
          </el-tree>
        </div>
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
            :allow-drag="allowDragSharedTree"
            @node-drag-end="handleDragendShared"
            @node-click="selectSharedDevice"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
              :class="[data.deviceStatus === 'on' ? 'online' : '', step === 0 ? 'custom-tree-node' : 'custom-tree-node-right']"
            >
              <span slot="reference" class="node-name">
                <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                <span v-else class="node-dir">
                  <svg-icon name="dir-close" width="15" height="15" />
                </span>
                <el-popover
                  v-if="node.label.length > 11"
                  placement="top-start"
                  trigger="hover"
                  :content="node.label"
                  popper-class="tree-label-poppover"
                  :open-delay="500"
                >
                  <span slot="reference">{{ node.label.substring(0,10)+'...' }}</span>
                </el-popover>
                <span v-else>{{ node.label }}</span>
                <span v-if="data.securityLevel" class="security-icon">{{ dicts.SecurityLevel[data.securityLevel] }}</span>
              </span>
              <span v-if="step === 1" slot="reference" class="node-input" @click.stop="">
                <div class="node-input__label"><span>{{ node.data.gbId || '-' }}</span></div>
                <div>
                  <el-input
                    :value="data.upGbId"
                    size="mini"
                    :class="[errorNodesData.find(item => data.id === item.id) ? 'error' : '', data.upGbId !== data.upGbIdOrigin ? 'modified' : '']"
                    @input="val => rootInput(node, data, val)"
                  />
                </div>
              </span>
            </span>
          </el-tree>
        </div>
        <div v-if="step === 1" class="tree-wrap__sub switch">
          <el-button type="primary" class="tree-wrap__sub__switch" @click="changeMode">{{ gbIdMode === 'vgroup' ? '' : '退出' }}匹配行政区划</el-button>
        </div>
      </div>
      <div v-if="step === 0" class="device-wrap">
        <el-button type="primary" @click="openInner('append')">{{ mode === 'district' ? '新建目录' :'新建组/虚拟组织' }}</el-button>
        <el-button type="primary" :disabled="!(selectedNode && selectedNode.data.type !== 'ipc' && selectedNode.data.type !== 'nvr')" @click="openInner('edit')">编辑</el-button>
        <el-button type="primary" :disabled="!(selectedNode && selectedNode.data.type !== 'ipc' && selectedNode.data.type !== 'nvr')" @click="openInner('deleteGroup')">{{ mode === 'district' ? '删除目录' :'删除组/虚拟组织' }}</el-button>
        <el-button type="primary" :disabled="!(selectedNode && (selectedNode.data.type === 'ipc' || selectedNode.data.type === 'nvr'))" @click="openInner('deleteDevice')">删除设备</el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="step === 0" type="primary" :disabled="sharedDirList.length === 0 || loading.sharedDir || loading.dir" @click="next">下一步</el-button>
      <el-button v-if="step === 1" type="primary" :disabled="loading.sharedDir" @click="prev">上一步</el-button>
      <el-button v-if="step === 1" type="primary" :disabled="loading.sharedDir" @click="submit">确 定</el-button>
      <el-button @click="() => closeDialog(true)">取 消</el-button>
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
import { Component, Prop, Mixins } from 'vue-property-decorator'
// import { getDeviceTree } from '@/api/device'
import { getNodeInfo } from '@vss/device/api/dir'
// import { getGroups } from '@/api/group'
import { describeShareDevices, describeShareDirs, getPlatform, shareDevice, validateShareDevices, cancleShareDevice, validateShareDirs } from '@/api/upPlatform'
import { setDirsStreamStatus } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import InnerDialog from './InnerDialog.vue'
import debounce from '@/utils/debounce'
import * as _ from 'lodash'
import Validate from '../../mixins/validate'
import * as dicts from '@vss/device/dicts'

@Component({
  name: 'ManageGroups',
  components: {
    StatusBadge,
    InnerDialog
  }
})
export default class extends Mixins(Validate) {
  @Prop()
  private platformId: any
  private dicts = dicts
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
    isLeaf: 'isLeaf'
  }

  private dirNodeStatus = {
    checked: [],
    halfChecked: []
  }
  private confirmed = false

  private innerDialogType = ''

  private innerVisible = false

  private dragInNodes = {}

  private deleteNodes = []

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
  public mode = 'vgroup'

  private tempNode: any = {}

  public gbIdMode = 'vgroup'

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
      // const res = await getGroups({
      //   pageSize: 1000
      // })
      const res = await getNodeInfo({ type: 'dir', inProtocol: 'video' })
      this.dirList = []
      res.dirs.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        this.dirList.push({
          ...group,
          id: group.id,
          groupId: group.groupId,
          label: group.name,
          // inProtocol: group.inProtocol,
          inProtocol: group.inVideoProtocol,
          gbId: group.outId || '',
          type: group.type,
          disabled: false,
          path: [{
            id: group.id,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            // inProtocol: group.inProtocol || '',
            inProtocol: group.inVideoProtocol || '',
            upGbId: group.outId || '',
            upGbIdOrigin: group.outId || ''
          }],
          upGbId: group.outId || '',
          upGbIdOrigin: group.outId || ''
        })
      })

      const allNode = res.dirs
      const dirNode = allNode.filter(node => node.type === 'dir' || node.type === 'platform')
      const deviceNode = allNode.filter(node => node.type === 'ipc' || node.type === 'nvr')

      const { dirs } = await validateShareDirs({
        platformId: this.platformId,
        // groups: dirNode.map(group => ({
        //   groupId: group.id,
        //   inprotocol: group.inProtocol,
        //   dirs: []
        // }))
        dirs: dirNode.map(dir => ({
          dirId: dir.id,
          dirType: dir.type
        }))
      })

      let deviceChekced = []
      const { isUsed } = await validateShareDevices({
          platformId: this.platformId,
          devices: deviceNode.map(device => ({
            deviceId: device.id
          }))
      })
      if (isUsed) {
        deviceChekced = isUsed.map(item => item.deviceId)
        this.dirNodeStatus.checked.push(...deviceChekced)
      }

      this.setDirChecked(dirs, 'group')

    } catch (e) {
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  private setDirChecked(groups, type) {
    // const checkeNodes = type === 'group' ? groups.map(group => group.groupIdStatus) : groups[0].groupIdStatus.dirs
    const checkeNodes = groups
    const checkedIds = checkeNodes.filter(node => node[type + 'Status'] === 2)
    const halfCheckedIds = checkeNodes.filter(node => node[type + 'Status'] === 1)
    const dirTree: any = this.$refs.dirTree

    checkedIds.forEach(check => {
      this.dirNodeStatus.checked.push(check[type + 'Id'])
    })
    halfCheckedIds.forEach(half => {
      this.dirNodeStatus.halfChecked.push(half[type + 'Id'])
    })
    if (dirTree) {
      this.initCheckedNode(dirTree)
      this.initIdeterminateNode(dirTree)
    }
  }

  private initIdeterminateNode(dirTree) {
    this.dirNodeStatus.halfChecked.forEach(id => {
      if (id) {
        const node = dirTree.getNode(id)
        if (node) {
          node.indeterminate = true
          node.checked = false
        }
      }
    })
  }

  private initCheckedNode(dirTree) {
    this.dirNodeStatus.checked.forEach(id => {
      const node = dirTree.getNode(id)
      if (node) {
        node.checked = true
        node.indeterminate = false
        node.data.disabled = true
      }
    })
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    this.loading.dir = true
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    const dirParam = dirs.filter(item => ['dir', 'platform', 'platformDir', 'nvr'].includes(item.type)).map(dir => ({
      dirId: dir.id,
      // parentDirId: node.level === 1 ? '0' : node.id + '' 
      type: dir.type
    }))
    if (dirParam.length) {
      try {
        const { dirs } = await validateShareDirs({
          platformId: this.platformId,
          // groups: [{
          //   groupId: node.data.groupId,
          //   inprotocol: node.data.inprotocol,
          //   dirs: dirParam
          // }]
          dirs: dirParam
        })
        this.setDirChecked(dirs, 'dir')

        // this.tagNvrUnchecked(node, dirs)
        this.resetNvrStatus(node)
      } catch (e){
        console.log(e)
      }
    }
    resolve(dirs)
    this.loading.dir = false
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
              inProtocol: group.inProtocol || '',
              upGbId: group.gbId || '',
              upGbIdOrigin: group.gbId || ''
            }],
            upGbId: group.gbId || '',
            upGbIdOrigin: group.gbId || ''
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
      const temp = await this.loadAll(node)
      resolve(temp)
    } catch (e) {
      resolve([])
    } finally {
      this.appendDragInNodes(node)
      this.removeDeleteNodes()
      this.tagNvrUnloaded(node)
    }
  }

  private async loadAll(node) {
    if (node.level === 0) return []
    let res = []
    this.loading.sharedDir = true
    if (node.data.dragInFlag) { // 对新darg入的节点进行加载
      res = await this.getTree(node)
    } else {
      // 对已共享的目录进行加载
      if (node.data.type === 'nvr') {
        // nvr设备无需请求，只需构造节点
        if (node.data.sharedFlag) {
          // 已共享nvr节点展开时构造数据
          res = node.data.channels ? node.data.channels.map(channel => {
            return {
              ...channel,
              id: channel.deviceId || channel.id,
              groupId: channel.groupId,
              label: channel.channelName ?? channel.label,
              inProtocol: channel.inProtocol || node.data.inProtocol,
              // isLeaf: dir.isLeaf || true,
              isLeaf: true,
              type: 'ipc',
              deviceStatus: channel.deviceStatus,
              streamStatus: channel.streamStatus,
              // disabled: dir.type !== 'ipc' || sharedFlag,
              disabled: false,
              path: node.data.path.concat([channel]),
              sharedFlag: true,
              dragInFlag: false,
              roleId: node.data.roleId || '',
              realGroupId: node.data.realGroupId || '',
              realGroupInProtocol: node.data.realGroupInProtocol || '',

              gbId: channel.gbId,
              upGbId: channel.upGbId,
              upGbIdOrigin: channel.upGbId || ''
            }
          }) : []
        } else {
          // 还未共享，仅是拖拽的nvr节点展开时构造数据
          res = node.data.channels
        }
      } else {
        try {
          // 目录
          const dirs = await this.getSharedDirs(node)
          const devices = await this.getSharedTree(node)
          // const devices = []
          res = [...dirs, ...devices]
        } catch (e){
          console.log(e)
        }

      }
    }
    this.step === 1 ? this.debounceLoading() : (this.loading.sharedDir = false)
    return res
  }

  private async getSharedDirs(node: any) {
    const res = await describeShareDirs({
      dirId: node.data.dirId,
      inProtocol: node.data.inProtocol,
      platformId: this.platformId,
      pageSize: 1000
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
        upGbId: dir.gbId || '',
        upGbIdOrigin: dir.gbId || ''
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
      const params: any = {
        platformId: this.platformId,
        dirId: node.data.dirId,
        dirType: node.data.dirType,
        pageSize: 1000
      }
      const res = await describeShareDevices(params)
      let dirs: any = res.devices.map((dir: any) => {
        const sharedFlag = true
        return {
          ...dir,
          id: dir.deviceId,
          groupId: dir.groupId,
          label: dir.deviceName,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          // isLeaf: dir.isLeaf || true,
          isLeaf: dir.deviceType === 'ipc',
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
          upGbId: dir.upGbId || '',
          upGbIdOrigin: dir.upGbId || ''
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
      if (node.data.type === 'ipc') {
        return
      }

      // const devices: any = await getDeviceTree({
      //   groupId: node.data.groupId,
      //   id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
      //   inProtocol: node.data.inProtocol,
      //   type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
      //   'self-defined-headers': {
      //     'role-id': node.data.roleId,
      //     'real-group-id': node.data.realGroupId
      //   }
      // })
      const devices = await getNodeInfo({ type: node.data.type, id: node.data.id, inProtocol: 'video' })
      let shareDeviceIds: any = []
      const paramNoNvrDevice = devices.dirs.filter(item => item.type !== 'nvr')
      
      if (paramNoNvrDevice.some(device => device.type === 'ipc')) {
        const param = {
          platformId: this.platformId,
          devices: paramNoNvrDevice.map(device => ({
            deviceId: device.id
          }))
        }
        try {
          const res = await validateShareDevices(param)
          if (res.isUsed) {
            shareDeviceIds = res.isUsed.map(item => item.deviceId)
          }
        } catch (e) {
          console.log(e)
        }
      }
      const dirTree: any = this.$refs.dirTree
      const checkedKeys = dirTree.getCheckedKeys()
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        let isDeleteFlag = false
        if (shareDeviceIds.includes(dir.id)) {
          sharedFlag = true

          isDeleteFlag = this.filterShareDeviceIds(dir.id)
          if (!isDeleteFlag) {
            checkedKeys.push(dir.id)
          }
          dirTree.setCheckedKeys(checkedKeys)
        }
        // setCheckedKeys会影响所有节点的半选状态，因此要重新设置
        this.initIdeterminateNode(dirTree)
        return {
          ...dir,
          id: dir.id,
          groupId: node.data.groupId,
          groupDirId: node.data.type === 'top-group' || node.data.type === 'vgroup' ? '-1' : node.data.id,
          label: dir.name,
          // inProtocol: dir.inProtocol || node.data.inProtocol,
          inProtocol: dir.inVideoProtocol || '', // 共享设备时，参数取值变化，因此，此处去字段变化
          channelNum: dir.channelNum + '' || '0',
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          disabled: sharedFlag && !isDeleteFlag,
          // path: node.data.path.concat([{ ...dir, upGbId: dir.outId || '', upGbIdOrigin: dir.outId || '', inProtocol: dir.inProtocol || node.data.inProtocol }]),
          path: node.data.path.concat([{ ...dir, upGbId: dir.outId || '', upGbIdOrigin: dir.outId || '', inProtocol: dir.inVideoProtocol || '' }]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          dragInFlag: !!node.data?.dragInFlag,

          gbId: dir.outId,
          upGbId: dir.outId || '',
          upGbIdOrigin: dir.outId || ''
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
    await this.checkNodes(dirTree, node)
  }

  private async checkNodes(dirTree: any, node: any) {
    if (node.checked) {
      if (node.loaded) {
        node.expanded = true
      } else {
        const dirs = await this.getTree(node)
        dirs && dirTree.updateKeyChildren(node.data.id, dirs)
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

  private async expandNodes(dirTree: any, node: any, singleNode = false) {
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
          this.appendDragInNodes(node)
          this.removeDeleteNodes()
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

  private forceRefreshChildren(tree: any, node: any) {
    const rNode = tree.getNode(node.data.id)
    rNode.loaded = false
    rNode.expand()
  }

  private selectSharedDevice(data: any, node: any) {
    this.selectedNode = node
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private handleDragstart(node, event) {
    this.tempNode = _.cloneDeep(node)
    const vgroupTree: any = this.$refs.vgroupTree
    vgroupTree.$emit('tree-node-drag-start', event, { node: node })
  }

  private async handleDragendShared(draggingNode, endNode) {
    const dirTree: any = this.$refs.dirTree
    const vgroupTree: any = this.$refs.vgroupTree
    if (endNode) {
      if (endNode.data.type === 'ipc' || endNode.data.type === 'nvr') {
        const draggingData = _.cloneDeep(draggingNode.data)
        this.$nextTick(() => {
          vgroupTree.remove(draggingData)
        })
        this.$message.error('请拖入目录')
        return false
      }
      if (!draggingNode.data.dragInFlag) {
        const draggingData = _.cloneDeep(draggingNode.data)
        this.$nextTick(() => {
          vgroupTree.remove(draggingData)
        })
        const checkedNodes = dirTree.getCheckedNodes(true, false)
        const allNodes = checkedNodes.map(data => dirTree.getNode(data.id))
        // 由于拖拽的节点parent会丢失
        draggingNode.parent = this.tempNode.parent
        let allIPCNodes = allNodes.filter(node => node.data.type === 'ipc' && node.data.disabled === false && node.data.id !== draggingNode.data.id)
        allIPCNodes.push(draggingNode)
        allIPCNodes = this.sortNodeOnOrderSeq(allIPCNodes)
        if (!this.dragInNodes[endNode.data.id]) {
          this.$set(this.dragInNodes, endNode.data.id, [])
        }
        // 将数据添加到delete或者draginNode钟维护状态
        this.resolveFromAppend(allIPCNodes, endNode)

        setTimeout(() => {
          allIPCNodes.forEach(node => {
            const dirNode = dirTree.getNode(node.data)
            dirNode.data.disabled = true
            dirNode.checked = true
            // 如果上级目录/nvr设备为选中状态，则把上级节点disabled
            const parentNode = dirTree.getNode(dirNode.parent.data)
            if (parentNode && parentNode.checked) {
              parentNode.data.disabled = true
            }
          })
          this.forceRefreshChildren(vgroupTree, endNode)
        }, 0)
      }
    }
  }

  private handleDragend(draggingNode, endNode, position, event) {
    const dirTree: any = this.$refs.dirTree
    const vgroupTree: any = this.$refs.vgroupTree
    // // // 插入一个空节点用于占位
    const emptyData = { id: draggingNode.id, children: [] }
    dirTree.insertBefore(emptyData, draggingNode)

    vgroupTree.$emit('tree-node-drag-end', event)
    this.$nextTick(() => {
      // 如果是移动到了当前树上，需要清掉空节点
      if (dirTree.getNode(draggingNode.data)) {
        dirTree.remove(emptyData)
      } else {
        // 如果移动到了别的树上，需要恢复该节点，并清掉空节点
        const data = _.cloneDeep(draggingNode.data)
        dirTree.insertAfter(data, dirTree.getNode(emptyData))
        dirTree.remove(emptyData)
      }
    })
  }

  private resolveFromAppend(allIPCNodes, endNode) {
    allIPCNodes.forEach(node => {
      const isInDelete = this.deleteNodeInDeleteNodes(node, endNode)
      if (!isInDelete) {
        if (node.parent.data.type === 'nvr') {
        // 选取设备中有nvr通道
          let findFlag = false
          this.dragInNodes[endNode.data.id].forEach(device => {
            if (node.parent.data.id === device.id) {
              device.channels.push(_.cloneDeep(node.data))
              findFlag = true
            }
          })
          if (!findFlag) {
            const nvrNode = _.cloneDeep(node)
            this.$set(nvrNode.parent.data, 'channels', [nvrNode.data])
            this.dragInNodes[endNode.data.id].push(nvrNode.parent.data)
          }
        } else {
        // 纯IPC
          this.dragInNodes[endNode.data.id].push(node.data)
        }
      }
    })
  }

  private deleteNodeInDeleteNodes(node, endNode) {
    let flag = false
    this.deleteNodes.forEach(dir => {
      if (endNode.data.id === dir.dirId) {
        dir.devices.forEach(device => {
          if (device.id === node.data.id) {
            flag = true
            dir.devices = dir.devices.filter(item => item.id !== node.data.id)
          }
        })
      }
    })
    return flag
  }

  private sortNodeOnOrderSeq(nodes) {
    // ipc
    const hasOrderSeq = nodes.filter(node => node.data.orderSequence !== '0')
    const sortNodesWithOS = hasOrderSeq.sort((n1, n2) => {
      const n1OS = n1.data?.orderSequence
      const n2OS = n2.data?.orderSequence
      return n2OS.localeCompare(n1OS)
    })
    // nvr通道
    const notHasOrderSeq = nodes.filter(node => node.data.orderSequence === '0')
    const sortNodesWithOutOS = notHasOrderSeq.sort((n1, n2) => {
      const n1cn = parseInt(n1.data?.channelNum)
      const n2cn = parseInt(n2.data?.channelNum)
      return n1cn - n2cn
    })
    return [...sortNodesWithOS, ...sortNodesWithOutOS]
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

  private async next() {
    this.step = 1
    // 点击下一步时，展开所有的node
    // 由于懒加载，tree的data实际上不会更新，因此，强制刷新整个树
    await this.initSharedDirs()
    const vgroupTree: any = this.$refs.vgroupTree
    // const nodes: any = vgroupTree.store.nodesMap
    this.sharedDirList.forEach(async item => { await this.expandNodes(vgroupTree, vgroupTree.getNode(item)) })
  }

  private prev() {
    this.errorNodesData = []
    this.step = 0
    // 复位拖拽过去还未共享的节点
    Object.keys(this.dragInNodes).forEach(label => {
      this.dragInNodes[label].forEach(data => {
        data.upGbId = data.upGbIdOrigin
      })
    })
  }

  private allowDrag(node) {
    if (node.data.type === 'nvr') {
      this.$message({
        message: '请拖拽nvr下的设备，nvr设备本身将自动共享',
        type: 'warning'
      })
      return false
    } else if (node.data.type !== 'ipc') {
      this.$message({
        message: '不能拖拽目录',
        type: 'warning'
      })
      return false
    } else if (node.data.disabled === true) {
      this.$message({
        message: '设备已共享，不能拖拽',
        type: 'warning'
      })
      return false
    } else if (node.checked !== true) {
      return false
    }
    return true
  }

  private async submit() {
    const isDuplicate = this.checkGbIdDuplicated(this.sharedDirList)
    if (isDuplicate) {
      this.$message.error('级联国标ID重复，请修改')
      return
    }
    const isDigitRight = this.checkDirDigit(this.sharedDirList)
    if (isDigitRight) {
      this.mode === 'vgroup'
        ? this.$message.error('向上级联国标ID位数错误，目录级联ID只能为20位，设备级联ID只能为20位')
        : this.$message.error('向上级联国标ID位数错误，目录级联ID只能为2、4、6、8位，设备级联ID只能为20位')
      return
    }
    const list = _.cloneDeep(this.sharedDirList)
    if (list.length === 0) {
      return this.$message({
        message: '没有要提交的内容',
        type: 'warning'
      })
    }
    const param = []
    list.forEach(item => param.push(...this.generateParam(item, item.children)))
    try {
      await shareDevice({
        platformId: this.platformId,
        dirs: param
      })
      this.deleteNodes.forEach(async dnode => {
        await cancleShareDevice({
          platformId: this.platformId,
          dirId: dnode.dirId,
          devices: dnode.devices.map(device => ({
            deviceId: device.deviceId
          }))
        })
      })
      this.$message.success('修改成功！')
      this.closeDialog(true)
    } catch (e) {
      console.log(e)
      this.$message.error(e)
    }
  }

  private generateParam(dir, list) {
    const devices = []
    const dirs = []
    if (list) {
      list.forEach(item => {
        if (item.type === 'ipc') {
          this.ifIPCSubmit(dir, item) && devices.push(item)
        } else if (item.type === 'nvr') {
          const nvrUnchangedFlag = this.filterNVRChannels(dir, item)
          nvrUnchangedFlag && devices.push({ ...item,
            channels: item.channels.map(channel => ({
              // channelNum: channel.channelNum || '',
              channelName: channel.label,
              gbId: channel.gbId,
              deviceId: channel.id,
              deviceIp: channel.deviceIp,
              deviceIpv6: channel.deviceIpv6 || '',
              devicePort: channel.devicePort,
              upGbId: channel.upGbId
            }))
          })
        } else {
          dirs.push(...this.generateParam(item, item.children))
        }
      })
    }
    dirs.push({
      dirId: dir.dirId,
      gbId: dir.upGbId,
      devices: devices.map(device => ({
        deviceId: device.id,
        gbId: device.gbId,
        upGbId: device.upGbId,
        deviceName: device.label,
        deviceType: device.type,
        inProtocol: device.inProtocol,
        channels: device.channels || [],
        groupId: device.groupId,
        groupDirId: device.groupDirId
      }))
    })
    return dirs
  }

  private ifIPCSubmit(dir, device) {
    if (this.dragInNodes[dir.id]) {
      // 如果是本次拖拽的
      const res = this.dragInNodes[dir.id].filter(item => item.id === device.id)
      return res.length > 0
    } else {
      // 如果是原来已共享的
      return device.upGbId !== device.upGbIdOrigin
    }
  }

  private filterNVRChannels(dir, device) {
    let dragInNVR = null
    if (this.dragInNodes[dir.id]) {
      const res = this.dragInNodes[dir.id].filter(item => item.id === device.id)
      if (res.length > 0) {
        dragInNVR = res[0]
      }
    }
    if (dragInNVR) {
      const dragInChannels = device.children.filter(child => {
        const temp = dragInNVR.channels.filter(channel => channel.deviceId === child.id || channel.id === child.id)
        return temp.length > 0
      })
      const sharedChannels = device.children.filter(child => {
        const temp = dragInNVR.channels.filter(channel => channel.deviceId === child.id || channel.id === child.id)
        return temp.length === 0
      })
      const sharedButModifiedChannels = sharedChannels.filter(child => child.upGbId !== child.upGbIdOrigin)
      device.channels = [...dragInChannels, ...sharedButModifiedChannels]
    } else {
      device.channels = device.children ? device.children.filter(child => child.upGbId !== child.upGbIdOrigin) : []
    }
    return !(device.upGbId === device.upGbIdOrigin && device.channels.length === 0)
  }

  private changeMode() {
    this.gbIdMode = this.gbIdMode === 'vgroup' ? 'district' : 'vgroup'
  }

  private async innerOp(opParam) {
    const vgroupTree: any = this.$refs.vgroupTree
    // 刷新某个节点
    if (opParam.selectedNode) {
      // 有选择节点
      if (opParam.selectedNode.level !== 1) {
        if (opParam.type === 'deleteDevice') {
          this.deleteNode(opParam.selectedNode)
        }
        if (opParam.type === 'deleteDevice' && opParam.selectedNode.parent.data.type === 'nvr') {
          opParam.selectedNode.parent.loaded = false
          this.forceRefreshChildren(vgroupTree, opParam.selectedNode.parent.parent)
        } else {
          this.forceRefreshChildren(vgroupTree, opParam.type === 'append' ? opParam.selectedNode : opParam.selectedNode.parent)
        }
      } else {
        // 根节点更新
        this.initSharedDirs()
      }
    } else {
      // 无选择节点：创建根目录
      const res = await describeShareDirs({
        platformId: this.platformId,
        dirId: '-1',
        pageSize: 1000,

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
              inProtocol: group.inProtocol || '',
              upGbId: group.gbId || '',
              upGbIdOrigin: group.gbId || ''
            }],
            upGbId: group.gbId || '',
            upGbIdOrigin: group.gbId || ''
          })
        })
      }
      const difference = newSharedDirs.filter(x => !this.sharedDirList.find(y => y.dirId === x.dirId))

      this.sharedDirList.push(difference[0])
    }
    this.innerVisible = false
  }

  private clearSelected() {
    this.selectedNode = null
  }

  // 根据nvr节点的checked状态改变disabled
  private resetNvrStatus(node) {
    if (node.data.type === 'nvr') {
      node.childNodes.forEach(child => {
        child.checked = child.data.disabled
      })
    }
  }

  private appendDragInNodes(node) {
    if (this.dragInNodes[node.data.id]) {
      const vgroupTree: any = this.$refs.vgroupTree
      this.dragInNodes[node.data.id].forEach(dragNodeData => {
        if (dragNodeData.type === 'nvr') {
          let findFlag = false
          node.childNodes.forEach(child => {
            if (child.data.id === dragNodeData.id) {
              child.data.channels.push(...dragNodeData.channels)
              findFlag = true
            }
          })
          if (!findFlag) {
            dragNodeData.children = [] // 首次添加nvr节点，需要清空原有children，否则后面利用children做校验会出错
            vgroupTree.append(dragNodeData, node.data)
          }
        } else {
          vgroupTree.append(dragNodeData, node.data)
        }
      })
    }
  }

  private removeDeleteNodes() {
    const vgroupTree: any = this.$refs.vgroupTree
    const dirTree: any = this.$refs.dirTree
    this.deleteNodes.forEach(dir => {
      dir.devices.forEach(device => {
        const node = vgroupTree.getNode(device)
        if (node) {
          const parentDir = node.parent.data.type === 'nvr' ? node.parent.parent : node.parent
          if (node && parentDir.data.id === dir.dirId) {
            vgroupTree.remove(device)
            const removedNode = dirTree.getNode(device)
            if (removedNode) {
              removedNode.data.disabled = false
              removedNode.checked = false
            }
          }
        }
      })
    })
  }

  // 目前只操作设备的删除，ipc & nvr
  private deleteNode(node) {
    const dirTree: any = this.$refs.dirTree
    const parentDirId = node.parent.data.type === 'nvr' ? node.parent.parent.data.dirId : node.parent.data.dirId
    if (node.data.sharedFlag) {
      let findFlag = false
      this.deleteNodes.forEach(item => {
        if (item.dirId === parentDirId) {
          item.devices.push(node.data)
          findFlag = true
        }
      })
      if (!findFlag) {
        this.deleteNodes.push({ dirId: parentDirId, devices: [node.data] })
      }
    } else {
      // 暂存的，就不用进入deleteNodes里了
      if (node.parent.data.type === 'nvr') {
        // nvr通道
        this.dragInNodes[parentDirId].forEach(item => {
          if (item.id === node.parent.data.id || (item.deviceId && item.deviceId === node.parent.data.deviceId)) {
            const nvrNode = dirTree.getNode(item.id)
            const channelNode = dirTree.getNode(item.channels.filter(channel => channel.id === node.data.id)[0])
            if (nvrNode) {
              nvrNode.data.disabled = false
            }
            if (channelNode) {
              channelNode.data.disabled = false
              channelNode.checked = false
            }
            const filterdChannels = item.channels.filter(channel => channel.id !== node.data.id)
            item.channels = filterdChannels
          }
        })
      } else {
        // 纯ipc或nvr设备本身
        Object.keys(this.dragInNodes).forEach(dirId => {
          if (parentDirId === dirId) {
            this.dragInNodes[dirId] = this.dragInNodes[dirId].filter(dragInNode => dragInNode.id !== node.data.id)
          }
        })
        const INNode = dirTree.getNode(node.data)
        INNode.data.disabled = false
        INNode.checked = false
      }
      // remove之后，树竟然不清除节点，真他妈坑
      const vgroupTree: any = this.$refs.vgroupTree
      if (vgroupTree.store.nodesMap[node.data.id]) {
        this.$delete(vgroupTree.store.nodesMap, node.data.id)
        if (node.data.type === 'nvr') {
          node.childNodes.forEach(child => {
            this.$delete(vgroupTree.store.nodesMap, child.data.id)
          })
        }
      }
    }
    if (node.data.type === 'nvr') {
      this.uncheckedNvrNode(node.data.id)
    }
  }

  private uncheckedNvrNode(id) {
    const dirTree: any = this.$refs.dirTree
    const nvrNode = dirTree.getNode(id)
    this.$nextTick(() => {
      if (nvrNode && nvrNode.childNodes) {
        nvrNode.childNodes.forEach(child => {
          child.data.disabled = false
          child.checked = false
        })
      }
    })
  }

  private tagNvrUnloaded(node) {
    if (node.childNodes) {
      node.childNodes.forEach(child => {
        if (child.data.type === 'nvr') {
          child.expanded = false
          child.loaded = false
        }
      })
    }
  }

  private allowDragSharedTree(draggingNode) {
    const vgroupTree: any = this.$refs.vgroupTree
    if (vgroupTree.getNode(draggingNode.data)) {
      // 不能拖拽共享树下的节点
      return false
    }
    return true
  }

  private filterShareDeviceIds(id) {
    let res = false

    this.deleteNodes.forEach(node => {
      res = node.devices.find(device => device.id === id)
    })
    if (!res) {
      this.deleteNodes.forEach(node => {
        node.devices.forEach(device => {
          if (device.channels) {
            const channels = device.channels
            res = !!channels.find(channel => channel.deviceId === id)
          }
        })
      })
    }
    return res
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

      span {
        margin-left: 3px;
      }

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

  .error {
    ::v-deep .el-input__inner {
      border: 1px solid red;
    }
  }

  .modified {
    ::v-deep .el-input__inner {
      color: $primary;
    }
  }
}

.el-popover__reference {
  margin-left: 3px;
}

.security-icon {
  background: $primary;
  color: white;
  border-radius: 100%;
  padding: 0 4px;
  font-size: 12px;
}

</style>
