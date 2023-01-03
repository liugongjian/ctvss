<template>
  <div class="app-container platform-container">
    <el-alert
      title="自定义设备树可在实时预览、录像回放的设备树列表处切换使用。"
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    />
    <el-card class="platform">
      <div class="platform__header">
        <span class="tree_title">设备树列表</span>
        <el-tooltip content="添加上级平台">
          <el-button @click="openDialog('createTree')"><span>+ 添加</span></el-button>
        </el-tooltip>
      </div>
      <div ref="treeWrap" v-loading="loading.platform" class="platform__list">
        <ul>
          <li v-for="tree in treeList" :key="tree.platformId" :class="{'actived': currentTree && (currentTree.platformId === tree.platformId)}" @click="selectTree(tree)">
            <el-tooltip v-if="!tree.editFlag" effect="dark" :content="tree.name" placement="top" :open-delay="500">
              <span > {{ tree.name.length > 8 ? tree.name.slice(0,7) + '...' : tree.name}}</span>
            </el-tooltip>
            <span v-if="tree.editFlag" @click.stop=""><el-input v-model="treeName" autofocus size="mini"/></span>
            <div v-if="!tree.editFlag" class="tools">
              <el-tooltip class="item" effect="dark" content="编辑设备树" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="editTree(tree)"><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除设备树" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="deleteTree(tree)"><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
        </ul>
        <div v-if="treeList && !treeList.length && !loading.platform" class="empty-text">请创建设备树</div>
      </div>
    </el-card>
    <el-card ref="deviceWrap" class="shared-devices">
      <div class="tree-wraper">
        <div v-if="isEditing" class="tree-wraper__border" :style="{height: treeMaxHeight + 'px'}">
          <div class="header">
            <span class="title">全部设备</span>
            <span class="num">已选中{{leftCheckedNum}}项</span>
          </div>
          <div class="tree">
            <el-tree
              key="device-el-tree-original"
              ref="dirTree"
              empty-text="暂无目录或设备"
              :data="dirList"
              node-key="id"
              highlight-current
              lazy
              show-checkbox
              :load="loadDirs"
              :props="treeProp"
              @check="checkCallback"
              @node-click="clickEvent"
            >
              <span
                slot-scope="{node, data}"
                class="custom-tree-node"
                :class="{'online': data.deviceStatus === 'on'}"
              >
                <span class="node-name">
                  <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                  <span v-else-if="node.level !== 1" class="node-dir">
                    <svg-icon name="dir-close" width="15" height="15" />
                  </span>
                  <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                  {{ node.label }}
                  <span class="sum-icon">{{ getSums(data) }}</span>
                  <span class="alert-type">{{ renderAlertType(data) }}</span>
                </span>
              </span>
            </el-tree>
          </div>
        </div>
        <div v-if="isEditing" class="operator">
          <el-button :type="leftCheckedNum > 0 ? 'primary' : ''" :disabled="leftCheckedNum === 0" @click="addDevices" size="mini"><i class="el-icon-arrow-right" /></el-button>
          <el-button :class="{'violet':rightCheckedNum > 0}" :disabled="rightCheckedNum === 0" size="mini" @click="removeDevices"><i class="el-icon-arrow-left"/></el-button>
          <el-button :class="{'violet':rightCheckedNum > 0}" :disabled="rightCheckedNum === 0" size="mini" @click="sortDevicesUp"><i class="el-icon-arrow-up"/></el-button>
          <el-button :class="{'violet':rightCheckedNum > 0}" :disabled="rightCheckedNum === 0" size="mini" @click="sortDevicesDown"><i class="el-icon-arrow-down"/></el-button>
        </div>
        <div class="tree-wraper__border" :style="{height: treeMaxHeight + 'px'}">
          <div class="header">
            <span class="title">{{currentTree.name}}</span>
            <span class="num">已选中{{rightCheckedNum}}项</span>
          </div>
        <div class="tree" :class="{'violet-bg': isEditing}">
          <el-tree
            key="device-el-tree-original"
            ref="dirTree2"
            empty-text="暂无目录或设备"
            :data="treeDirList"
            node-key="id"
            highlight-current
            lazy
            :show-checkbox="isEditing"
            :load="loadTreeDirs"
            :props="treeProp"
            @check="checkCallback2"
            @node-click="selectNode"
          >
            <span
              slot-scope="{node, data}"
              class="custom-tree-node"
              :class="{'online': data.deviceStatus === 'on'}"
            >
              <span class="node-name with-operator">
                <div>
                  <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                  <span v-else-if="node.level !== 1" class="node-dir">
                    <svg-icon name="dir-close" width="15" height="15" />
                  </span>
                  <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                  {{ node.label }}
                  <span class="sum-icon">{{ getSums(data) }}</span>
                  <span class="alert-type">{{ renderAlertType(data) }}</span>
                </div>
                <div>
                  <el-button v-if="isEditing && node.level === 1" type="text" @click.stop="openDialog('createDir-root', node)"><svg-icon name="plus" />新建目录</el-button>
                  <template v-if="data.isSelected && node.level > 1">
                    <el-tooltip class="item" effect="dark" content="添加子目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('createDir', node)"><svg-icon name="plus" /></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="node.level > 1" class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="openDialog('updateDir', node)"><svg-icon name="edit" /></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="node.level > 1" class="item" effect="dark" content="删除目录" placement="top" :open-delay="300">
                      <el-button type="text" @click.stop="deleteDir(node)"><svg-icon name="trash" /></el-button>
                    </el-tooltip>
                  </template>
                </div>
              </span>
            </span>
          </el-tree>
        </div>
        </div>
      </div>
      <div v-if="isEditing" class="button">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button>取 消</el-button>
      </div>
    </el-card>
    <Dialogue
      v-if="dialog.visible"
      :title="dialog.title"
      @dialogSubmit="dialogSubmit"
      @dialogCancel="dialogCancel"
    >
      <el-form :model="dialog.data">
        <el-form-item label="名称" prop="name" :rules="dialog.data.rule">
          <el-input v-model="dialog.data.name" autocomplete="off" />
        </el-form-item>
      </el-form>
    </Dialogue>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { deletePlatform, getPlatforms, validateShareDirs, validateShareDevices } from '@/api/upPlatform'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Dialogue from './component/dialogue.vue'
import { checkPermission } from '@/utils/permission'
import { renderAlertType, getSums, setDirsStreamStatus } from '@/utils/device'
import { getGroups } from '@/api/group'
import { getDeviceTree } from '@/api/device'
import ElTree from './component/tree/src/tree.vue'
import { cloneDeep } from 'lodash'

/**
 * Attention: 1. 右侧树节点中后端传来的数据有originFlag: true的标记，删除这类节点，是把node.visible设置为false；=> 那么提交的时候根据这两个属性，进行删除操作
 * 2. 右侧树节点中没有originFlag: true标记的，是编辑操作中添加的，删除这类节点，直接remove掉即可
 * 3. 为了避免ID冲突，本次编辑中添加的节点data的id + 'T' (设备是'T' + id ; 目录是'T' + 当前时间戳)
 *
 * TODO:
 */


const root = {
      id: 0,
      label: "全部",
      type: 'dir',
      disabled: false,
      showCheckbox: false,
    }

@Component({
  name: 'UpPlatformList',
  components: {
    StatusBadge,
    Dialogue,
    ElTree
  }
})
export default class extends Vue {
  private checkPermission = checkPermission
  private renderAlertType = renderAlertType
  private getSums = getSums

  private dirList = []
  private treeDirList = []
  private treeList: Array<any> = []

  private leftCheckedNodes = []
  private rightCheckedNodes = []
  // 2023/1/3 该数据已准备好，后面需要在loadDirs最后checked时，将队列里的节点uncheck掉
  private removedOriginalNodes = []

  private isEditing = false
  private treeName = ''

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private currentDirNode = null

  private dirNodeStatus = {
    checked: [],
    halfChecked: []
  }
  private dialog = {
    type:'',
    visible: false,
    title: '',
    data: {}
  }

  private currentTree: any = {}
  public maxHeight = null
  private treeMaxHeight = null

  public loading = {
    platform: false,
    dir: false,
    sharedDevices: false,
    startStop: false
  }

  private get leftCheckedNum(){
    return this.leftCheckedNodes.length
  }

  private get rightCheckedNum(){
    return this.rightCheckedNodes.length
  }


  @Watch('currentTree',{
    deep: true
  })
  private currenTreeNameChange(val, oldVal){
    this.treeName = this.currentTree.name
    if( val !== oldVal ){
      this.treeDirList = []
      this.$nextTick(() => this.treeDirList.push(cloneDeep(root)))
    }
  }

  @Watch('isEditing')
  private isEditingChange(){
    this.isEditing && this.$nextTick(() => {
      this.dirList.push(cloneDeep(root))
      this.leftCheckedNodes = this.rightCheckedNodes = []
    })
    !this.isEditing && this.$nextTick(() => (this.dirList=[]))
  }

  private async mounted() {
    await this.getTreeList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 查询上级平台列表
   */
  private async getTreeList() {
    try {
      this.loading.platform = true
      const res = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.treeList = res.platforms.map(item => ({...item, editFlag: false}))
      if (this.currentTree.platformId) {
        const currentTree = this.platformList.find((tree: any) => tree.platformId === this.currentTree.platformId)
        this.currentTree = currentTree
      } else {
        this.initTree()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.platform = false
    }
  }

  /**
   * 初始化上级平台
   */
  private initTree() {
    if (this.treeList.length !== 0) {
      this.selectTree(this.treeList[0])
    }
  }

  /**
   * 设备树初始化
   */
  public async initDirs(resolve) {
    const dirList = []
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })

      res.groups.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        dirList.push({
          id: group.groupId,
          groupId: group.groupId,
          label: group.groupName,
          inProtocol: group.inProtocol,
          type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
          disabled: false,
          showCheckbox: false,
          path: [{
            id: group.groupId,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            inProtocol: group.inProtocol || '',
          }]
        })
      })
      resolve(dirList)
      if (this.platformId) {
        const { groups } = await validateShareDirs({
          platformId: this.platformId,
          groups: res.groups.map(group => ({
            groupId: group.groupId,
            inprotocol: group.inProtocol,
            dirs: []
          }))
        })
        this.setDirChecked(groups, 'group')
      }
    } catch (e) {
      resolve([])
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 设备树初始化
   */
  public async initTreeDirs(resolve) {
    const treeDirList = []
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      res.groups.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        treeDirList.push({
          id: group.groupId,
          groupId: group.groupId,
          label: group.groupName,
          inProtocol: group.inProtocol,
          type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
          disabled: false,
          showCheckbox: false,
          path: [{
            id: group.groupId,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            inProtocol: group.inProtocol || ''
          }],
          originFlag: true
        })
      })
      resolve(treeDirList)
      if (this.platformId) {
        const { groups } = await validateShareDirs({
          platformId: this.platformId,
          groups: res.groups.map(group => ({
            groupId: group.groupId,
            inprotocol: group.inProtocol,
            dirs: []
          }))
        })
        this.setDirChecked(groups, 'group')
      }
    } catch (e) {
      resolve([])
    } finally {
      this.loading.dir = false
    }
  }

  private async setDirChecked(groups, type) {
    const checkeNodes = type === 'group' ? groups.map(group => group.groupIdStatus) : groups[0].groupIdStatus.dirs
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
    if (this.dirNodeStatus.halfChecked) {
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
   * 加载业务组树
   */
  private async loadDirs(node: any, resolve: Function) {
    this.loading.dir = true
    if (node.level === 0) return resolve([])
    if (node.level === 1) return this.initDirs(resolve) // 展开全部，load业务组信息

    const dirs = await this.getTree(node)

    const dirParam = dirs.filter(item => item.type === 'dir' || item.type === 'platform' || item.type === 'platformDir' || item.type === 'nvr')
      .map(dir => ({ dirId: dir.id, parentDirId: node.level === 1 ? '0' : node.id + '' }))
    resolve(dirs)

    if (this.platformId) {
      const { groups } = await validateShareDirs({
        platformId: this.platformId,
        groups: [{
          groupId: node.data.groupId,
          inprotocol: node.data.inprotocol,
          dirs: dirParam
        }]
      })

      this.setDirChecked(groups, 'dir')
    }

    // this.tagNvrUnchecked(node, dirs)
    this.resetDirStatus(node)
    this.loading.dir = false
  }

  /**
   * 加载树目录
   */
  private async loadTreeDirs(node: any, resolve: Function) {
    this.loading.dir = true
    if (node.level === 0) return resolve([])
    if (node.level === 1) return this.initTreeDirs(resolve) // 展开全部，load业务组信息
    const dirs = await this.getTree2(node)

    const dirParam = dirs.filter(item => item.type === 'dir' || item.type === 'platform' || item.type === 'platformDir' || item.type === 'nvr')
      .map(dir => ({ dirId: dir.id, parentDirId: node.level === 1 ? '0' : node.id + '' }))
    resolve(dirs)

    if (this.platformId) {
      const { groups } = await validateShareDirs({
        platformId: this.platformId,
        groups: [{
          groupId: node.data.groupId,
          inprotocol: node.data.inprotocol,
          dirs: dirParam
        }]
      })

      this.setDirChecked(groups, 'dir')
    }

    // this.tagNvrUnchecked(node, dirs)
    this.resetDirStatus(node)
    this.loading.dir = false
  }

  // 根据nvr节点的checked状态改变disabled
  private resetDirStatus(node) {
    if (node.data.type === 'nvr' || node.data.type === 'dir' || node.data.type === 'platform' || node.data.type === 'platformDir' || node.data.type === 'top-group') {
      node.childNodes.forEach(child => {
        child.checked = child.data.disabled
      })
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
      let shareDeviceIds: any = []
      let paramNoNvrDevice = devices.dirs.filter(item => item.type !== 'nvr')
      const param = {
        platformId: this.platformId,
        devices: paramNoNvrDevice.map(device => ({
          deviceId: device.id
        }))
      }
      try {
        if (this.platformId) {
          const res = await validateShareDevices(param)
          if (res.isUsed) {
            shareDeviceIds = res.isUsed.map(item => item.deviceId)
          }
        }
      } catch (e) {
        console.log(e)
      }

      const dirTree: any = this.$refs.dirTree
      let checkedKeys = dirTree.getCheckedKeys()
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
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          channelNum: dir.channelNum + '' || '0',
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          disabled: sharedFlag && !isDeleteFlag,
          showCheckbox: dir.type === 'nvr' || dir.type === 'ipc',
          path: node.data.path.concat([{ ...dir, upGbId: dir.gbId || '', upGbIdOrigin: dir.gbId || '', inProtocol: dir.inProtocol || node.data.inProtocol }]),
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || ''
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

   /**
   * 获取菜单树
   */
  private async getTree2(node: any) {
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
      let shareDeviceIds: any = []
      let paramNoNvrDevice = devices.dirs.filter(item => item.type !== 'nvr')
      const param = {
        platformId: this.platformId,
        devices: paramNoNvrDevice.map(device => ({
          deviceId: device.id
        }))
      }
      try {
        if (this.platformId) {
          const res = await validateShareDevices(param)
          if (res.isUsed) {
            shareDeviceIds = res.isUsed.map(item => item.deviceId)
          }
        }
      } catch (e) {
        console.log(e)
      }

      const dirTree2: any = this.$refs.dirTree2
      let checkedKeys = dirTree2.getCheckedKeys()
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        let isDeleteFlag = false
        if (shareDeviceIds.includes(dir.id)) {
          sharedFlag = true

          isDeleteFlag = this.filterShareDeviceIds(dir.id)
          if (!isDeleteFlag) {
            checkedKeys.push(dir.id)
          }
          dirTree2.setCheckedKeys(checkedKeys)
        }
        // setCheckedKeys会影响所有节点的半选状态，因此要重新设置
        this.initIdeterminateNode(dirTree2)
        return {
          ...dir,
          id: dir.id,
          groupId: node.data.groupId,
          groupDirId: node.data.type === 'top-group' || node.data.type === 'vgroup' ? '-1' : node.data.id,
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          channelNum: dir.channelNum + '' || '0',
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          disabled: sharedFlag && !isDeleteFlag,
          showCheckbox: dir.type === 'nvr' || dir.type === 'ipc',
          path: node.data.path.concat([{ ...dir, upGbId: dir.gbId || '', upGbIdOrigin: dir.gbId || '', inProtocol: dir.inProtocol || node.data.inProtocol }]),
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',

          originFlag: true // 后端保存的数据标志
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 删除树
   */
  private deleteTree(tree: any) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除"${tree.name}"`,
      method: deletePlatform,
      payload: {
        platformId: tree.platformId
      },
      onSuccess: async() => {
        if (tree.platformId === this.currentTree.platformId) {
          this.currentTree = {}
        }
        await this.getTreeList()
      }
    })
  }

  /**
   * 删除文件夹
   */
  private deleteDir(dirNode: any) {
    dirNode.visible = false
  }


  /**
   * 选择平台
   */
  private selectTree(tree: any) {
    this.currentTree = tree
    this.isEditing = false
    this.treeList.forEach(t => {
      t.editFlag = false
    })
  }

  private openDialog(type , node) {
    if(['createDir','createDir-root'].includes(type) && !node.loaded){
      const nodId = node.data.id + ''
      if(!nodId.startsWith('T')){
        return this.$message.error('请先展开当前目录，再创建！')
      }
    }
    const dic = {
      'createTree' : '新建设备树',
      'createDir' : '新建目录',
      'createDir-root' : '新建目录',
      'updateDir' : '修改目录',
    }
    this.dialog = {
      type,
      visible: true,
      title: dic[type],
      data: {
        name: type === 'updateDir' ? cloneDeep(node.data.label) : '',
        rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  }

  private async checkCallback(data: any) {
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(data.id)
    await this.checkNodes(dirTree, node)
    this.leftCheckedNodes = dirTree.getCheckedNodes(true, false)

  }

  private async checkCallback2(data: any) {
    const dirTree2: any = this.$refs.dirTree2
    const node = dirTree2.getNode(data.id)
    console.log('data:',data)
    console.log('node:',node)
    await this.checkNodes2(dirTree2, node)
    this.rightCheckedNodes = dirTree2.getCheckedNodes(true, false)
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

  private async checkNodes2(dirTree: any, node: any) {
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
          this.checkNodes2(dirTree, child)
        }
      })
    }
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const treeWrap: any = this.$refs.treeWrap
    const size = treeWrap.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 90
    this.treeMaxHeight = this.maxHeight - 110
  }

  private dialogSubmit() {
    ['createDir', 'createDir-root'].includes(this.dialog.type) && this.createDir()
    this.dialogCancel()
  }

  private async createDir(){
    const dirTree2: any = this.$refs.dirTree2
    const parentNode = this.dialog.type === 'createDir' ? this.currentDirNode : dirTree2.getNode(0)
    parentNode.expanded = true
    this.$nextTick(() => {
      const insertDir = {
        id: 'T' + new Date().getTime(), //暂时给一个id保存在前端
        // @ts-ignore
        label: this.dialog.data.name,
        type: 'dir',
        isLeaf: true,
        // orderSequence需要设置parentNode.childNodes[0].orderSequence + 1
      }
      parentNode.childNodes.length > 0 ? dirTree2.insertBefore( insertDir, parentNode.childNodes[0]) : dirTree2.append(insertDir, parentNode)
    })
  }

  private dialogCancel() {
    this.dialog.visible = false
  }

  private clickEvent(node, data){
    console.log(node)
    console.log(data)
  }

  private editTree(tree){
    this.treeList.forEach(t => {
      t.editFlag = false
    })
    this.$nextTick(() => {
      tree.editFlag = this.isEditing = true
      this.currentTree = tree
    })

  }

  private handleNameInput(name){
    this.treeName = name
  }

  private submit(){

    this.cancel()
  }

  private cancel(){
    const dirTree:any = this.$refs.dirTree
    const dirTree2:any = this.$refs.dirTree2
    this.isEditing = false
    this.$nextTick(() => {
      this.treeList.forEach(t => (t.editFlag = false))
      dirTree.setCheckedKeys([])
      dirTree2.setCheckedKeys([])
    })
  }

  private addDevices(){
    const dirTree: any = this.$refs.dirTree
    const dirTree2: any = this.$refs.dirTree2
    const checkedNodes = dirTree.getCheckedNodes(true, false)
    const cnAvailable = checkedNodes.length && checkedNodes.filter(data => !data.disabled)
    if(cnAvailable){
      this.currentDirNode.expanded = true
      cnAvailable.forEach(cndata => {
        const isNodeExist = this.currentDirNode.childNodes.findIndex(n => cndata.id === n.data.id)
        if( isNodeExist < 0 ){
          // 为避免id冲突，本次操作新添加的设备ID前加T标识
          const cloned = { ...cloneDeep(cndata), id: 'T' + cndata.id }
          this.currentDirNode.childNodes.length > 0 ? dirTree2.insertBefore( cloned, this.currentDirNode.childNodes[0]) : dirTree2.append(cloned, this.currentDirNode)
        } else {
          // 如果是把删除操作撤销,就仅是把隐藏掉的节点再展现出来即可
          this.currentDirNode.childNodes[isNodeExist].visible = true
        }
        // 添加的节点，在删除队列中去掉
        this.removedOriginalNodes = this.removedOriginalNodes.filter(n => n.data.id !== cndata.id)
        // dirTree2.append(cloned, this.currentDirNode)
        cndata.disabled = true
      })
      this.leftCheckedNodes = []
    }
  }

  private removeDevices(){
    const dirTree: any = this.$refs.dirTree
    const dirTree2: any = this.$refs.dirTree2
    const checkedNodes = dirTree2.getCheckedNodes(true, false)
    checkedNodes.forEach(cndata => {

      const cnNode = dirTree2.getNode(cndata)
      // 如果是后端请求来的数据，则隐藏掉；如果是本次操作添加的节点，则直接从右树中删除
      if(cnNode){
        if(cndata.originFlag) {
          cnNode.visible = false
          cnNode.checked = false
          this.removedOriginalNodes.push(cnNode)
        } else {
          // 本次编辑的节点删除时ID需要去掉T字符
          dirTree2.remove(cnNode)
        }
      }

      // 如果是本次编辑添加的设备节点，要删除时，对左侧树的节点操作，需要去掉id中的T字符（第一位）
      const resetData = cndata.originFlag ? cndata : {...cndata, id: cndata.id.slice(1)}
      const resetNode = dirTree.getNode(resetData)
      if(resetNode){
        resetNode.data.disabled = false
        dirTree.setChecked(resetData,false)
      }
    })
    this.rightCheckedNodes = []
  }

  private sortDevicesUp(){
    this.sortDevices(true)
  }

  private sortDevicesDown(){
    this.sortDevices(false)
  }

  /**
   * asd:boolean
   * 是否上移
   */
  private sortDevices(asd){
    const dirTree2: any = this.$refs.dirTree2
    // opNodes = { parentNode : [index1，index2，...] } 其中index1，index2为parent子节点在children数组中的位置
    const parentNodes = [], opNodes = new WeakMap()

    this.rightCheckedNodes.forEach(rn => {
      const node = dirTree2.getNode(rn) // 当前选中节点
      const parent = node.parent // 选中节点的父节点
      const nodeIndex = parent.childNodes.findIndex(cn => cn.data.id === node.data.id) // 在子节点数组中的index
      const exist = parentNodes.findIndex(pn => pn.data.id === parent.data.id)
      if(exist < 0){
        parentNodes.push(parent)
        opNodes.set(parent, [nodeIndex])
      } else {
        const origin = [...opNodes.get(parent), nodeIndex]
        const res = origin.sort((a,b) => asd ? a - b : b - a)
        opNodes.set(parent, res)
      }
    })
    const direction = asd ? -1 : 1
    parentNodes.forEach(pn => {
      const nodeIndexs = opNodes.get(pn) // nodeIndexs为排好序的indexs数组,下面将index整体向前提一位
      nodeIndexs.reduce((pre, cur, index) => {
        const end = asd ? 0 : pn.childNodes.length - 1
        if(cur === end) { return cur } // 当前元素是第一位或最后一位，不做操作
        if(pre === cur + direction) { return cur }//当前和前一个元素是挨着的，不能操作
        // 以上两种情况之外，交换当前元素和childNodes中之前的元素
        // 1. 交换元素
        const curNode = pn.childNodes[cur], prevNode = pn.childNodes[cur + direction]
        const curOrder = curNode.data?.orderSequence, preOrder = prevNode.data?.orderSequence
        // 1.1 交换orderSequence
        curNode.data.orderSequence = preOrder
        prevNode.data.orderSequence = curOrder

        this.$set(pn.childNodes, cur, prevNode)
        this.$set(pn.childNodes, cur + direction, curNode)
        // 2.cur也前移
        nodeIndexs[index] = cur  + direction
        return cur  + direction
      }, nodeIndexs[0])
      // 更新完后，重新放回weakmap中
      opNodes.set(pn, nodeIndexs)
    })
  }



  private selectNode(data, node){
    console.log(data)
    console.log(node)
    if(this.isEditing && data.type !== 'ipc' && data.type !== 'nvr'){
      if(this.currentDirNode){
        this.$set(this.currentDirNode.data, 'isSelected' ,false)
      }
      this.$nextTick(()=> {
        this.$set(node.data, 'isSelected' ,true)
        this.currentDirNode = node
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  box-shadow: none !important;
  border-radius: 0 !important;
}

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
  position: relative;
  padding-top: 50px !important;

  .el-alert {
    position: absolute;
    top: 7px;
    width: 97%;
  }

  ::v-deep .el-card__body {
    padding: 0;
    height: 100%;
  }

  .platform {
    margin-right: 1px;
    min-width: 260px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $borderGrey;
      padding: 15px;

      .tree_title {
        font-size: 14px;
        color: #333;
        letter-spacing: 0;
        line-height: 14px;
        font-weight: 600;
      }

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
      }
    }

    &__list {
      padding: 15px 0 15px 15px;
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

            .el-button {
              padding: 5px;
            }

            .el-button + .el-button {
              margin-left: 0;
            }
          }

          &:hover {
            background: rgba(255, 122, 4, 10%);

            .tools {
              display: block;
            }
          }

          &.actived {
            border-right: 3px solid #ff7a04;
            color: #ff7a04;

            svg {
              background: rgba(255, 122, 4, 10%);
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

    .input {
      padding: 20px;
      display: flex;
      justify-content: space-between;

      .el-input {
        width: 200px;
      }

      .name {
        display: flex;
        align-items: center;
      }
    }

    .tree-wraper {
      height: calc(100% - 120px);
      display: flex;
      margin: 15px 20px;

      &__border {
        flex: 1;
        max-width: 40%;

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 29px;
          margin-top: 10px;

          .title {
            margin-left: 10px;
            font-size: 16px;
            color: #333;
            letter-spacing: 0;
            line-height: 12px;
            font-weight: bold;
          }

          .num {
            font-size: 12px;
            color: #666;
            line-height: 12px;
            font-weight: 400;
          }
        }

        .tree {
          height: 100%;
          overflow: auto;
          border: 1px solid #ddd;
          border-radius: 2px;
          padding: 15px 35px;

          .custom-tree-node {
            display: inline-block;
            width: 100%;

            .with-operator {
              display: flex;
              justify-content: space-between;
            }

            .node-name {
              line-height: 36px;
              vertical-align: middle;
              position: relative;
              width: 100%;
              overflow: hidden;

              span {
                margin-left: 3px;
              }

              .svg-icon {
                color: #6e7c89;
              }

              .el-button {
                color: #333;
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
              top: 8px;
              left: -1px;
              width: 6px;
              height: 6px;
              opacity: 0.7;
              display: none;

              &--on {
                display: block;
              }
            }
          }
        }

        .violet-bg {
          ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
            background-color: #4f84e6;
            border-color: #4f84e6;
          }
        }
      }

      .operator {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .el-button {
          margin: 0 10px 20px !important;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;

          i {
            width: 12px;
            height: 12px;
          }
        }

        .violet {
          color: #fff;
          background: #4f84e6;
          border-color: #4f84e6;
        }
      }
    }

    .button {
      padding-left: 100px;
    }
  }
}

.el-form {
  .el-input {
    width: 80%;
  }

  .el-form-item__error {
    left: 64px;
  }
}
</style>
