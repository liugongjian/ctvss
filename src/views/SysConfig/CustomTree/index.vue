<template>
  <div class="app-container platform-container">
    <el-alert
      title="自定义设备树可在实时预览、录像回放的设备树列表处切换使用。"
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    />
    <el-card v-if="!treeListEmpty" class="platform">
      <div class="platform__header">
        <span class="tree_title">设备树列表</span>
        <el-tooltip content="添加设备树">
          <el-button @click="openDialog('createTree')"><span>+ 添加</span></el-button>
        </el-tooltip>
      </div>
      <div ref="treeWrap" v-loading="treeLoading.platform" class="platform__list">
        <ul>
          <li v-for="tree in treeList" :key="tree.treeId" :class="{ 'actived': currentTree && (currentTree.treeId === tree.treeId) }" @click="selectTree(tree)">
            <div>
              <el-tooltip v-if="!tree.editFlag" effect="dark" :content="tree.treeName" placement="top" :open-delay="500">
                <span> {{ tree.treeName.length > 8 ? tree.treeName.slice(0,7) + '...' : tree.treeName }}</span>
              </el-tooltip>
              <span v-if="tree.editFlag" class="platform__list__item" @click.stop="">
                <el-input v-model="treeName" autofocus size="mini" />
                <i class="el-icon-check" @click="handleChangeTreeName(treeName, tree)" />
                <i class="el-icon-close" @click="handleCancel(tree)" />
              </span>
              <div v-if="!tree.editFlag" class="tools">
                <el-tooltip class="item" effect="dark" content="编辑设备树" placement="top" :open-delay="300">
                  <el-button type="text" @click.stop="editTreeName(tree)"><svg-icon name="edit" /></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除设备树" placement="top" :open-delay="300">
                  <el-button type="text" @click.stop="deleteTree(tree)"><svg-icon name="trash" /></el-button>
                </el-tooltip>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="treeList && !treeList.length && !treeLoading.platform" class="empty-text">请创建设备树</div>
      </div>
    </el-card>
    <el-card v-if="!treeListEmpty" ref="deviceWrap" class="shared-devices">
      <div class="tree-wraper" :style="{ height: treeMaxHeight + 'px' }">
        <div v-if="isEditing" class="tree-wraper__border">
          <div class="header">
            <span class="title">全部设备</span>
            <span class="num">已选中{{ leftCheckedNum }}项</span>
          </div>
          <div class="tree">
            <el-tree
              key="device-el-tree-original"
              ref="dirTree"
              empty-text="暂无目录或设备"
              :data="dirList"
              node-key="id"
              :default-expanded-keys="[-1]"
              highlight-current
              lazy
              show-checkbox
              :load="loadDirs"
              :props="treeProp"
              @check="checkCallback"
              @node-click="nclick"
            >
              <span
                slot-scope="{ node, data }"
                class="custom-tree-node"
                :class="{ 'online': data.deviceStatus === 'on' }"
              >
                <span class="node-name" :class="{ 'node-disabled': data.disabled }">
                  <svg-icon :name="nodeType(node)" width="15" height="15" />
                  <!-- <span v-else-if="node.level !== 1" class="node-dir">
                    <svg-icon name="dir-close" width="15" height="15" />
                  </span> -->
                  <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                  {{ node.label }}
                  <span class="sum-icon">{{ getTotalOfTree(data) }}</span>
                  <span class="alert-type">{{ renderAlertType(data) }}</span>
                </span>
              </span>
            </el-tree>
          </div>
        </div>
        <div v-if="isEditing" class="operator">
          <el-button :type="leftCheckedNum > 0 ? 'primary' : ''" :disabled="leftCheckedNum === 0" size="mini" @click="addDevices"><i class="el-icon-arrow-right" /></el-button>
          <el-button :class="{ 'violet': rightCheckedNum > 0 }" :disabled="rightCheckedNum === 0" size="mini" @click="removeDevices"><i class="el-icon-arrow-left" /></el-button>
          <el-button :class="{ 'violet': rightCheckedNum > 0 }" :disabled="rightCheckedNum === 0" size="mini" @click="sortDevicesUp"><i class="el-icon-arrow-up" /></el-button>
          <el-button :class="{ 'violet': rightCheckedNum > 0 }" :disabled="rightCheckedNum === 0" size="mini" @click="sortDevicesDown"><i class="el-icon-arrow-down" /></el-button>
        </div>
        <div class="tree-wraper__border">
          <div class="header">
            <span class="title">{{ currentTree.treeName }}</span>
            <span v-if="isEditing" class="num">已选中{{ rightCheckedNum }}项</span>
            <span v-if="!isEditing" class="num">
              <el-button type="text" @click="editTreeFrame">编辑</el-button>
            </span>
          </div>
          <div class="tree" :class="{ 'violet-bg': isEditing }">
            <el-tree
              key="device-el-tree-original"
              ref="dirTree2"
              empty-text="暂无目录或设备"
              :data="treeDirList"
              node-key="id"
              highlight-current
              :default-expanded-keys="[-1]"
              lazy
              :show-checkbox="isEditing"
              :load="loadTreeDirs"
              :props="treeProp"
              @check="checkCallback2"
              @node-click="selectNode"
            >
              <span
                slot-scope="{ node, data }"
                class="custom-tree-node"
                :class="{ 'online': data.deviceStatus === 'on' }"
              >
                <span class="node-name with-operator">
                  <div>
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else-if="node.level !== 1" class="node-dir">
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                    {{ data.parentDevice && !enableCloudChannelName ? `${data.label}(${data.parentDevice.label})`: node.label }}
                    <span v-if="data.originFlag" class="sum-icon">{{ getTotalOfTree(data) }}</span>
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
      <div v-show="isEditing" class="button">
        <el-button type="primary" :loading="treeLoading.submitting" @click="submit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-card>
    <el-card v-if="treeListEmpty" class="empty">
      <div class="title">设备树列表</div>
      <div class="content">
        <svg-icon name="empty" width="40" height="40" class="avatar" />
        <div class="wording">暂无自定义设备树</div>
        <div class="wording">点击下方“添加”按钮新增</div>
        <div class="button">
          <el-button @click="openDialog('createTree')"><span>+ 添加</span></el-button>
        </div>
      </div>
    </el-card>
    <Dialogue
      v-if="dialog.visible"
      :title="dialog.title"
      @dialogSubmit="dialogSubmit"
      @dialogCancel="dialogCancel"
    >
      <div v-if="dialog.type === 'deleteDir'" class="dialog__content">
        <div>将删除该目录下的所有目录和设备，确定删除吗？</div>
        <el-checkbox v-model="hideDeleteDirDialog">本次编辑不再询问</el-checkbox>
      </div>
      <el-form v-else :model="dialog.data">
        <el-form-item :label="`${dialog.type === 'createTree' ? '设备树' : '目录'}名称`" prop="name" :rules="dialog.data.rule" :error="duplicateDirError">
          <el-input v-model="dialog.data.name" autocomplete="off" />
        </el-form-item>
      </el-form>
    </Dialogue>
  </div>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Dialogue from './component/dialogue.vue'
import { checkPermission } from '@/utils/permission'
import { renderAlertType, getTotalOfTree, setDirsStreamStatus } from '@/utils/device'
import { getGroups } from '@/api/group'
import { getDeviceTree } from '@/api/device'
import ElTree from './component/tree/src/tree.vue'
import { cloneDeep } from 'lodash'
import { createTree, deleteTree, loadTreeNode, describeTreeIds, getTreeList, updateTreeNodes, updateTreeName } from '@/api/customTree'
import { getLocalStorage } from '@/utils/storage'
import TreeMixin from '@vss/device/components/Tree/treeMixin'

/**
 * Attention: 1. 右侧树节点中后端传来的数据有originFlag: true的标记，删除这类节点，是把node.visible设置为false；=> 那么提交的时候根据这两个属性，进行删除操作
 * 2. 右侧树节点中没有originFlag: true标记的，是编辑操作中添加的，删除这类节点，直接remove掉即可
 * 3. 为了避免ID冲突，本次编辑中添加的节点data的id + 'T' (设备是'T' + id ; 目录是'T' + 当前时间戳)
 *
 * TODO:
 */

const root = {
  id: -1,
  label: '全部',
  type: 'dir',
  disabled: false,
  showCheckbox: false,
  originFlag: true,
  totalSize: 0,
  onlineSize: 0
}

@Component({
  name: 'UpPlatformList',
  components: {
    StatusBadge,
    Dialogue,
    ElTree
  }
})
export default class extends Mixins(TreeMixin) {
  private checkPermission = checkPermission
  private renderAlertType = renderAlertType
  private getTotalOfTree = getTotalOfTree

  private dirList = []
  private treeDirList = []
  private treeList: Array<any> = []

  private groupInfos = []

  private leftCheckedNodes = []
  private rightCheckedNodes = []
  // 2023/1/3 该数据已准备好，后面需要在loadDirs最后checked时，将队列里的节点uncheck掉
  private removedOriginalNodes = []

  // 左侧需要check和disabled节点的id
  private checkedNodeIds = []

  private isEditing = false
  private treeName = ''

  private enableCloudChannelName = false

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
    type: '',
    visible: false,
    title: '',
    data: {}
  }

  private currentTree: any = {}
  public maxHeight = null
  private treeMaxHeight = null

  private hideDeleteDirDialog = false

  public treeLoading = {
    platform: false,
    dir: false,
    sharedDevices: false,
    startStop: false,
    submitting: false
  }

  private duplicateDirError = ''

  private nclick(n, d){
    console.log(n)
    console.log(d)
  }

  private get treeListEmpty() {
    this.calMaxHeight()
    return this.treeList.length === 0
  }

  private get leftCheckedNum() {
    return this.leftCheckedNodes.length
  }

  private get rightCheckedNum() {
    return this.rightCheckedNodes.length
  }

  @Watch('currentTree', {
    deep: true,
    immediate: true
  })
  private async currenTreeNameChange(val, oldVal) {
    this.treeName = this.currentTree.treeName
    if (val !== oldVal) {
      this.$nextTick(() => {
        this.treeDirList = [cloneDeep(root)]
        this.dirList = [cloneDeep(root)]
        if (this.currentTree.treeId) {
          this.getTotalsOfRightTree()
          this.getTotalsOfLeftTree()
        }
      })
    }
  }

  @Watch('isEditing')
  private isEditingChange() {
    this.isEditing && this.$nextTick(() => {
      this.dirList = [cloneDeep(root)]
      this.leftCheckedNodes = this.rightCheckedNodes = []
      this.getTotalsOfLeftTree()
    })
    !this.isEditing && this.$nextTick(() => (this.dirList = []))
  }

  @Watch('groupInfos.length')
  private groupsLoaded() {
    this.getTotalsOfLeftTree()
  }

  private async mounted() {
    // await this.getTreeList()
    this.enableCloudChannelName = this.getNvrShowChannelName()
    // this.initGroups()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private nodeType(node){
    if (node.data.type === 'dir'){
      return node.expanded ? 'dir' : 'dir-close'
    }
    return node.data.type
  }

  private getNvrShowChannelName() {
    const settings = getLocalStorage('settings')
    if (settings) {
      const settingsOb = JSON.parse(settings)
      return settingsOb.screenCache.enableCloudChannelName === 'true'
    }
    return false
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  private getTotalsOfLeftTree() {
    const res = { onlineSize: 0, totalSize: 0 }
    this.groupInfos.length > 0 && this.groupInfos.forEach(group => {
      res.onlineSize += group.onlineSize
      res.totalSize += group.totalSize
    })
    this.$nextTick(() => {
      const dirTree: any = this.$refs.dirTree
      if (dirTree) {
        const rootNode = dirTree.getNode(root.id)
        this.$set(rootNode.data, 'totalSize', res.totalSize)
        this.$set(rootNode.data, 'onlineSize', res.onlineSize)
      }
    })
  }

  private async getTotalsOfRightTree() {
    const dirTree2: any = this.$refs.dirTree2
    if (dirTree2) {
      const { deviceIds, totalSize } = await describeTreeIds({ id: this.currentTree.treeId })

      const onlineSize = await this.getOnlineNumOfTree()

      this.$nextTick(() => {
        const rootNode = dirTree2.getNode(root.id)
        this.$set(rootNode.data, 'totalSize', totalSize)
        this.$set(rootNode.data, 'onlineSize', onlineSize)
        this.checkedNodeIds = deviceIds
      })
    }
  }

  private async initGroups() {
    const res = await getGroups({
      pageSize: 1000
    })
    res.groups.forEach((group: any) => {
      // 放开rtsp rtmp
      // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
      group.inProtocol !== 'vgroup' && this.groupInfos.push({
        id: group.groupId,
        groupId: group.groupId,
        label: group.groupName,
        inProtocol: group.inProtocol,
        type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
        disabled: false,
        showCheckbox: false,
        totalSize: group.groupStats.deviceSize,
        onlineSize: group.groupStats.onlineIpcSize
      })
    })
  }

  /**
   * 查询上级平台列表
   */
  private async getTreeList() {
    try {
      this.treeLoading.platform = true
      const { trees } = await getTreeList({})
      this.treeList = trees.map(item => ({ ...item, editFlag: false }))
      if (this.currentTree.treeId) {
        const currentTree = this.treeList.find((tree: any) => tree.treeId === this.currentTree.treeId)
        this.currentTree = currentTree
      } else {
        this.initTree()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.treeLoading.platform = false
    }
  }

  /**
   * 初始化树列表
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
    try {
      this.treeLoading.dir = true
      if (this.groupInfos.length === 0) {
        // 如果组信息为空，再尝试加载一下，有可能是后端网络错误
        await this.initGroups()
      }
      resolve(this.groupInfos)
      this.setDirChecked()
    } catch (e) {
      resolve([])
      console.log(e)
    } finally {
      this.treeLoading.dir = false
    }
  }

  private async setDirChecked() {
    const dirTree: any = this.$refs.dirTree
    if (dirTree) {
      this.$nextTick(() => {
        this.initCheckedNode(dirTree)
      })
    }
  }

  private initCheckedNode(dirTree) {
    this.checkedNodeIds.forEach(id => {
      const node = dirTree.getNode(id)
      if (node) {
        node.checked = true
        node.data.disabled = true
      }
    })
  }

  private async getOnlineNumOfTree() {
    const { dirs }: any = await loadTreeNode({ dirId: this.currentTree.treeId })
    let res = 0
    dirs && dirs.forEach(dir => {
      if (dir.type === 'ipc' && dir.deviceStatus === 'on') {
        res++
      } else {
        res += dir.onlineSize
      }
    })
    return res
  }

  /**
   * 加载业务组树
   */
  private async loadDirs(node: any, resolve: Function) {
    this.treeLoading.dir = true
    const subData = await this.treeLoad(node)
    console.log('subData:', subData)
    // if (node.level === 0) return resolve([])
    // if (node.level === 1) return this.initDirs(resolve) // 展开全部，load业务组信息

    const dirs = this.resolveSubTreeData(node, subData)
    // const dirs = await this.getTree(node)


    this.setDirChecked()
    resolve(dirs)
    // this.tagNvrUnchecked(node, dirs)
    this.resetDirStatus(node)
    this.treeLoading.dir = false
  }

  private resolveSubTreeData(parentNode, subData){
    let dirs: any = subData.map((dir: any) => {
        return {
          ...dir,
          id: dir.id,
          label: dir.name,
          inProtocol: dir.inProtocol || parentNode.data.inProtocol,
          channelNum: dir.channelNum + '' || '0',
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          disabled: false,
          showCheckbox: dir.type === 'nvr' || dir.type === 'ipc',
          orderSequence: +dir.orderSequence,
          // 如果展开nvr，下面的通道加上nvr设备信息，其它则为null
          parentDevice: ['nvr'].includes(parentNode.data.type) ? parentNode.data : null,
          rootPlatForm: parentNode.data.type === 'platform' ? parentNode.data : (parentNode.data.rootPlatForm || null)
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
  }

  /**
   * 加载树目录
   */
  private async loadTreeDirs(node: any, resolve: Function) {
    this.treeLoading.dir = true
    if (node.level === 0) return resolve([])
    // 如果是当前编辑中添加的目录节点，且没有load，则返回空
    if (!node.data.originFlag && !node.loaded) return resolve([])
    // if (node.level === 1) return this.initTreeDirs(resolve) // 展开全部，load业务组信息
    const dirs = await this.getTree2(node)
    resolve(dirs)
    this.treeLoading.dir = false
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

      let dirs: any = devices.dirs.map((dir: any) => {
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
          disabled: false,
          showCheckbox: dir.type === 'nvr' || dir.type === 'ipc',
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          orderSequence: +dir.orderSequence,
          // 如果展开nvr，下面的通道加上nvr设备信息，其它则为null
          parentDevice: ['nvr'].includes(node.data.type) ? node.data : null,
          rootPlatForm: node.data.type === 'platform' ? node.data : (node.data.rootPlatForm || null)
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
      if (node.data.type === 'ipc') {
        return
      }
      let { dirs }: any = await loadTreeNode({ dirId: node.level === 1 ? this.currentTree.treeId : node.data.id })
      dirs = dirs.map((dir: any) => {
        return {
          ...dir,
          showCheckbox: dir.type === 'nvr' || dir.type === 'ipc',
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
      msg: `是否确认删除"${tree.treeName}"`,
      method: deleteTree,
      payload: {
        treeId: tree.treeId
      },
      onSuccess: async() => {
        if (tree.treeId === this.currentTree.treeId) {
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
    this.hideDeleteDirDialog ? this.hideOrRemoveDir(dirNode) : this.openDialog('deleteDir', dirNode)
  }

  private hideOrRemoveDir(dirNode) {
    if (dirNode.data.originFlag) {
      dirNode.visible = false
    } else {
      const dirTree2: any = this.$refs.dirTree2
      dirTree2.remove(dirNode)
    }
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

  private openDialog(type, node) {
    this.duplicateDirError = ''
    if (type === 'createTree') {
      this.treeList.forEach(t => {
        t.editFlag = false
      })
    }
    if (['createDir', 'createDir-root'].includes(type) && !node.loaded) {
      const nodId = node.data.id + ''
      if (!nodId.startsWith('T')) {
        return this.$message.warning('请先展开当前目录')
      }
    }
    const dic = {
      'createTree': '添加设备树',
      'createDir': '添加目录',
      'createDir-root': '添加目录',
      'updateDir': '修改目录',
      'deleteDir': '删除目录'
    }
    this.dialog = {
      type,
      visible: true,
      title: dic[type],
      data: type === 'deleteDir' ? { node } : {
        name: type === 'updateDir' ? cloneDeep(node.data.label) : '',
        rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  }

  private async checkCallback(data: any) {
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(data.id)
    await this.checkNodes(dirTree, node)
    const checkedNodes = dirTree.getCheckedNodes(true, false)
    this.leftCheckedNodes = checkedNodes.filter(cn => !cn.disabled)
  }

  private async checkCallback2(data: any) {
    const dirTree2: any = this.$refs.dirTree2
    const node = dirTree2.getNode(data.id)
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
        const dirs = await this.getTree2(node)
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
    if (treeWrap) {
      const size = treeWrap.getBoundingClientRect()
      const top = size.top
      const documentHeight = document.body.offsetHeight
      this.maxHeight = documentHeight - top - 90
      this.treeMaxHeight = this.maxHeight - 110
    }
  }

  private async dialogSubmit() {
    ['createDir', 'createDir-root'].includes(this.dialog.type) && this.createDir()
    this.dialog.type === 'updateDir' && this.updateDir()
    this.dialog.type === 'createTree' && await this.createTree()
    if (this.dialog.type === 'deleteDir') {
      // @ts-ignore
      this.hideOrRemoveDir(this.dialog.data.node)
      this.dialog.visible = false
    }
  }

  private async createTree() {
    try {
      // @ts-ignore
      await createTree({ treeName: this.dialog.data.name })
      this.$message.success('操作成功')
      this.dialogCancel()
      this.getTreeList()
    } catch (e) {
      this.$message.error(e)
    }
  }

  private updateDir() {
    // @ts-ignore
    this.currentDirNode.data.label = this.dialog.data.name
    this.tagOriginNodeAsEdited(this.currentDirNode)
    this.dialogCancel()
  }
  /**
   * 将原有的节点打上编辑标记
   */
  private tagOriginNodeAsEdited(originNode) {
    if (originNode.data.originFlag) {
      // 打上已编辑过的标志
      this.$set(originNode.data, 'editFlag', true)
    }
  }

  private createDir() {
    const dirTree2: any = this.$refs.dirTree2
    const parentNode = this.dialog.type === 'createDir' ? this.currentDirNode : dirTree2.getNode(root.id)
    // dialog.data.name
    let isNameDuplicate = false
    if (parentNode.childNodes.length > 0) {
      parentNode.childNodes.forEach(cnode => {
        // @ts-ignore
        if (cnode.data.label === this.dialog.data.name) {
          isNameDuplicate = true
        }
      })
    }
    if (!isNameDuplicate) {
      parentNode.expanded = true
      this.$nextTick(() => {
        const insertDir = {
          id: 'T' + new Date().getTime(), // 暂时给一个id保存在前端
          // @ts-ignore
          label: this.dialog.data.name,
          type: 'dir',
          isLeaf: false,
          orderSequence: parentNode.childNodes[0] ? +parentNode.childNodes[0].data.orderSequence - 1 : 0
          // orderSequence需要设置parentNode.childNodes[0].orderSequence - 1
        }
        parentNode.childNodes.length > 0 ? dirTree2.insertBefore(insertDir, parentNode.childNodes[0]) : dirTree2.append(insertDir, parentNode)
      })
      this.dialogCancel()
    } else {
      this.duplicateDirError = '文件名重复，不能创建'
    }
  }

  private dialogCancel() {
    this.dialog.visible = false
    if (this.dialog.type === 'deleteDir') {
      this.hideDeleteDirDialog = false
    }
  }

  private editTreeName(tree) {
    this.treeList.forEach(t => {
      t.editFlag = false
    })
    tree.editFlag = true
    this.currentTree = tree
  }

  private editTreeFrame() {
    this.isEditing = true
    const dirTree2: any = this.$refs.dirTree2
    this.currentDirNode = dirTree2.getNode(root.id)
    this.$set(this.currentDirNode.data, 'isSelected', true)
  }

  private handleNameInput(name) {
    this.treeName = name
  }

  private async submit() {
    this.treeLoading.submitting = true
    const dirTree2: any = this.$refs.dirTree2
    const treeRoot = dirTree2.getNode(root.id)
    const childNodes = treeRoot.childNodes
    const params = this.generateTreeParams(childNodes)
    const treeInfo = { id: this.currentTree.treeId, type: 'dir', parentDirId: '-1' }
    try {
      // 下面请求2次：1. 修改树的名称  2. 提交params
      await updateTreeNodes({ dirs: [{ ...treeInfo, dirs: params }] })
      // this.cancel()
      this.$message.success('操作成功')
      this.getTreeList()
      this.isEditing = false
    } catch (e) {
      console.log(e)
      this.$message.error(e)
    } finally {
      this.treeLoading.submitting = false
    }
  }

  private generateTreeParams(nodes) {
    const dirs = nodes.map(node => {
      let childs = []
      if (node.childNodes.length > 0) {
        childs = this.generateTreeParams(node.childNodes)
      }
      const res: any = {
        id: node.data.id,
        groupId: node.data.groupId || '',
        dirName: node.data.label,
        description: node.data.description || '',
        inProtocol: node.data.inProtocol || '',
        orderSequence: node.data.orderSequence + '',
        type: node.data.type,
        dirs: childs
      }
      if (node.data.originFlag) {
        res.id = node.data.id
      } else if (node.data.type === 'dir') {
        delete res.id
      } else {
        res.id = node.data.id.slice(1)
      }

      // platForm下的设备需要加上parentDeviceId, 且nvr不在platform下
      if (node.data.rootPlatForm) {
        res.parentDeviceId = node.data.rootPlatForm.id
      }

      // nvr通道需要添加nvr的设备id，platform下的设备需要加platform的设备id
      if (node.data.parentDevice) {
        res.parentDeviceId = node.data.parentDevice.id
      }
      res.action = this.getActionType(node)
      if (node.parent.data.originFlag) {
        // 如果父目录是后端来的节点  则加上parentDirId;否则父目录就是本次新创建的，不加这个参数
        res.action.sourceId = res.parentDirId = node.parent.level !== 1 ? node.parent.data.id + '' : this.currentTree.treeId + ''
      }

      return res
    })
    return dirs
  }

  private getActionType(node) {
    if (!node.visible) {
      return { type: 'del' }
    }
    if (!node.data.originFlag) {
      return { type: 'add' }
    } else if (node.data.editFlag) {
      return { type: 'update' }
    }
    return { type: '' }
  }

  private cancel() {
    this.isEditing = false
    this.$nextTick(() => {
      this.treeList.forEach(t => (t.editFlag = false))
      this.clearCheckedKeys()
      this.treeDirList = [cloneDeep(root)]
      this.getTotalsOfRightTree()
    })
  }
  private clearCheckedKeys() {
    const dirTree: any = this.$refs.dirTree
    const dirTree2: any = this.$refs.dirTree2
    dirTree && dirTree.setCheckedKeys([])
    dirTree2 && dirTree2.setCheckedKeys([])
  }

  private addDevices() {
    const dirTree: any = this.$refs.dirTree
    const dirTree2: any = this.$refs.dirTree2
    const checkedNodes = dirTree.getCheckedNodes(true, false)
    const cnAvailable = checkedNodes.length && checkedNodes.filter(data => !data.disabled)
    if (cnAvailable) {
      if (!this.currentDirNode.loaded) return this.$message.warning('请先展开当前目录')
      this.currentDirNode.expanded = true
      // 为了保证添加后的顺序，反转当前的节点顺序
      const cnAvReverse = cnAvailable.reverse()
      cnAvReverse.forEach(cndata => {
        const isNodeExist = this.currentDirNode.childNodes.findIndex(n => cndata.id === n.data.id)
        if (isNodeExist < 0) {
          const orSeq1st = this.currentDirNode.childNodes[0] ? this.currentDirNode.childNodes[0].data.orderSequence : 0
          // 为避免id冲突，本次操作新添加的设备ID前加T标识, 并将os设置为当前第一个子节点os-1
          const cloned = { ...cloneDeep(cndata), id: 'T' + cndata.id, orderSequence: orSeq1st - 1 }
          this.currentDirNode.childNodes.length > 0 ? dirTree2.insertBefore(cloned, this.currentDirNode.childNodes[0]) : dirTree2.append(cloned, this.currentDirNode)
        } else {
          // 如果是把删除操作撤销,就仅是把隐藏掉的节点再展现出来即可
          this.currentDirNode.childNodes[isNodeExist].visible = true
        }
        // 添加的节点，保存在checkedNodeIds
        if (!this.checkedNodeIds.includes(cndata.id)) {
          this.checkedNodeIds.push(cndata.id)
        }
        // dirTree2.append(cloned, this.currentDirNode)
        cndata.disabled = true
      })
      this.leftCheckedNodes = []
    }
  }

  private removeDevices() {
    const dirTree: any = this.$refs.dirTree
    const dirTree2: any = this.$refs.dirTree2
    const checkedNodes = dirTree2.getCheckedNodes(true, false)
    checkedNodes.forEach(cndata => {
      const cnNode = dirTree2.getNode(cndata)
      // 1. 如果是后端请求来的数据，则隐藏掉；如果是本次操作添加的节点，则直接从右树中删除
      if (cnNode) {
        if (cndata.originFlag) {
          cnNode.visible = false
          cnNode.checked = false
        } else {
          dirTree2.remove(cnNode)
        }
      }

      // 2. 如果是本次编辑添加的设备节点，要删除时，对左侧树的节点操作，需要去掉id中的T字符（第一位）
      const resetData = cndata.originFlag ? cndata : { ...cndata, id: cndata.id.slice(1) }
      const resetNode = dirTree.getNode(resetData)
      if (resetNode) {
        resetNode.data.disabled = false
        dirTree.setChecked(resetData, false)
      }

      // 3. 最后如果在checkedNodeIds删除掉这个node的id
      this.checkedNodeIds = this.checkedNodeIds.filter(nid => nid !== cndata.id)
    })
    this.rightCheckedNodes = []
  }

  private sortDevicesUp() {
    this.sortDevices(true)
  }

  private sortDevicesDown() {
    this.sortDevices(false)
  }

  /**
   * asd:boolean
   * 是否上移
   */
  private sortDevices(asd) {
    const dirTree2: any = this.$refs.dirTree2
    // opNodes = { parentNode : [index1，index2，...] } 其中index1，index2为parent子节点在children数组中的位置
    const parentNodes = []; const opNodes = new WeakMap()

    // 生成opNodes
    this.rightCheckedNodes.forEach(rn => {
      const node = dirTree2.getNode(rn) // 当前选中节点
      const parent = node.parent // 选中节点的父节点
      const nodeIndex = parent.childNodes.findIndex(cn => cn.data.id === node.data.id) // 在子节点数组中的index
      const exist = parentNodes.findIndex(pn => pn.data.id === parent.data.id)
      if (exist < 0) {
        parentNodes.push(parent)
        opNodes.set(parent, [nodeIndex])
      } else {
        const origin = [...opNodes.get(parent), nodeIndex]
        const res = origin.sort((a, b) => asd ? a - b : b - a)
        opNodes.set(parent, res)
      }
    })

    // 根据opNodes进行操作
    const direction = asd ? -1 : 1
    parentNodes.forEach(pn => {
      const nodeIndexs = opNodes.get(pn) // nodeIndexs为排好序的indexs数组,下面将index整体向前提一位
      nodeIndexs.reduce((pre, cur, index) => {
        const end = asd ? 0 : pn.childNodes.length - 1
        if (cur === end) { return cur } // 当前元素是第一位或最后一位，不做操作
        if (pre === cur + direction) { return cur }// 当前和前一个元素是挨着的，不能操作
        // 以上两种情况之外，交换当前元素和childNodes中之前的元素
        // 1. 交换元素
        // 1.1 找到前面的一个visible非true的节点的数组下标
        const curNode = pn.childNodes[cur]; let prevNode = pn.childNodes[cur + direction]
        let prevIndex = cur + direction
        while (prevNode && !prevNode.visible) {
          prevIndex += direction
          prevNode = pn.childNodes[prevIndex]
        }
        if (prevIndex < 0 || prevIndex > pn.childNodes.length - 1) {
          prevIndex = end
          prevNode = pn.childNodes[prevIndex]
        }

        // 1.2 交换orderSequence
        const curOrder = curNode.data?.orderSequence; const preOrder = prevNode.data?.orderSequence
        curNode.data.orderSequence = preOrder
        prevNode.data.orderSequence = curOrder

        // 1.3 交换节点，并在原有节点（origin）打上editFlag标记
        this.$set(pn.childNodes, cur, prevNode)
        this.$set(pn.childNodes, prevIndex, curNode)
        this.tagOriginNodeAsEdited(prevNode)
        this.tagOriginNodeAsEdited(curNode)

        // 2.交换后，cur前移
        nodeIndexs[index] = prevIndex
        return prevIndex
      }, nodeIndexs[0])
      // 更新完后，重新放回weakmap中
      opNodes.set(pn, nodeIndexs)
    })
  }

  private selectNode(data, node) {
    if (this.isEditing && data.type !== 'ipc' && data.type !== 'nvr') {
      if (this.currentDirNode) {
        this.$set(this.currentDirNode.data, 'isSelected', false)
      }
      this.$nextTick(() => {
        this.$set(node.data, 'isSelected', true)
        this.currentDirNode = node
      })
    }
  }

  private async handleChangeTreeName(treeName, tree) {
    try {
      await updateTreeName({ treeId: tree.treeId, treeName })
      tree.treeName = treeName
      tree.editFlag = false
      this.$message.success('操作成功')
    } catch (e) {
      this.$message.error(e)
    }
  }

  private handleCancel(tree) {
    tree.editFlag = false
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
    min-height: 87vh;
  }

  .platform {
    margin-right: 1px;
    min-width: 260px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      // border-bottom: 1px solid $borderGrey;
      padding: 16px;

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
      padding: 0 0 15px 15px;
      min-height: 100px;

      &__item {
        & > .el-input {
          width: 80%;
        }

        & > i {
          margin-left: 5px;
          color: #6e7c89;
        }
      }

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
              margin-left: -5px;
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
      min-height: 83vh;

      &__border {
        flex: 1;
        max-width: 40%;

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 20px;
          margin: 10px 0;

          .title {
            margin-left: 10px;
            font-size: 14px;
            color: #333;
            letter-spacing: 0;
            line-height: 12px;
            font-weight: 400;
          }

          .num {
            font-size: 12px;
            color: #666;
            line-height: 12px;
            font-weight: 400;
          }
        }

        .tree {
          height: calc(100% - 55px);
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

              .el-button + .el-button {
                margin-left: 5px;
              }
            }

            .node-disabled {
              color: #999;
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
                .svg-icon {
                  color: #333;
                }

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
            background-color: $info;
            border-color: $info;
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
          background: $info;
          border-color: $info;
        }
      }
    }

    .button {
      padding-left: 100px;
      margin-bottom: 15px;
    }
  }
}

::v-deep .el-form {
  margin-left: 13px;

  .el-input {
    width: 300px;
  }

  .el-form-item__error {
    left: 104px;
  }
}

.empty {
  width: 100%;
  min-height: 80vh;
  padding: 25px 0 15px 35px;

  .title {
    font-weight: bold;
    font-size: 14px;
    color: #333;
  }

  .content {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .button {
      margin-top: 30px;
    }

    .wording {
      font-size: 14px;
      color: #999;
    }

    .avatar {
      margin-bottom: 30px;
      color: #dadada;
    }
  }
}

.dialog__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > div {
    margin-bottom: 20px;
  }
}
</style>
