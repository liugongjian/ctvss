<template>
  <div class="app-container platform-container">
    <el-card class="platform">
      <div class="platform__header">
        <span>设备树列表</span>
        <el-tooltip content="添加上级平台">
          <el-button type="primary" @click="handleCreate"><span>添加</span></el-button>
        </el-tooltip>
      </div>
      <div ref="treeWrap" v-loading="loading.platform" class="platform__list">
        <ul>
          <li v-for="tree in treeList" :key="tree.platformId" :class="{'actived': currentTree && (currentTree.platformId === tree.platformId)}" @click="selectTree(tree)">
            <span><status-badge :status="tree.status" /> {{ tree.name }}</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
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
        <div class="tree" :style="{height: treeMaxHeight + 'px'}">
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
                {{ node.label }}
                <span class="sum-icon">{{ getSums(data) }}</span>
                <span class="alert-type">{{ renderAlertType(data) }}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="operator">
          <el-button type="primary"><i class="el-icon-arrow-right" /></el-button>
          <el-button><i class="el-icon-arrow-left" /></el-button>
          <el-button><i class="el-icon-arrow-up" /></el-button>
          <el-button><i class="el-icon-arrow-down" /></el-button>
        </div>
        <div class="tree" :style="{height: treeMaxHeight + 'px'}">
          <el-tree
            key="device-el-tree-original"
            ref="dirTree"
            empty-text="暂无目录或设备"
            :data="treeDirList"
            node-key="id"
            highlight-current
            lazy
            show-checkbox
            :load="loadTreeDirs"
            :props="treeProp"
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
                {{ node.label }}
                <span class="sum-icon">{{ getSums(data) }}</span>
                <span class="alert-type">{{ renderAlertType(data) }}</span>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
    </el-card>
    <Dialogue
      v-if="dialog.visible"
      :title="dialog.title"
      @dialogSubmit="dialogSubmit"
      @dialogCancel="dialogCancel"
    >
      <el-form v-if="dialog.type === 'create'" :model="dialog.data">
        <el-form-item label="名称" prop="name" :rules="dialog.data.rule">
          <el-input v-model="dialog.data.name" autocomplete="off" />
        </el-form-item>
      </el-form>
    </Dialogue>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { deletePlatform, getPlatforms, validateShareDirs, validateShareDevices } from '@/api/upPlatform'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Dialogue from './component/dialogue.vue'
import { checkPermission } from '@/utils/permission'
import { renderAlertType, getSums, setDirsStreamStatus } from '@/utils/device'
import { getGroups } from '@/api/group'
import { getDeviceTree } from '@/api/device'

@Component({
  name: 'UpPlatformList',
  components: {
    StatusBadge,
    Dialogue
  }
})
export default class extends Vue {
  private checkPermission = checkPermission
  private renderAlertType = renderAlertType
  private getSums = getSums

  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private dirList = []
  private treeDirList = []
  private dirNodeStatus = {
    checked: [],
    halfChecked: []
  }
  private dialog = {
    type: '', // 处理的是哪个操作
    visible: false,
    title: '',
    data: {}
  }

  private treeList: Array<any> = []
  private currentTree: any = {}
  public maxHeight = null
  private treeMaxHeight = null

  public loading = {
    platform: false,
    dir: false,
    sharedDevices: false,
    startStop: false
  }

  private async mounted() {
    await this.getTreeList()
    this.initDirs()
    this.initTreeDirs()
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
      this.treeList = res.platforms
      if (this.currentTree.platformId) {
        const currentTree = this.platformList.find((tree: any) => tree.platformId === this.currentTree.platformId)
        this.currentTree = currentTree
      } else {
        this.initPlatform()
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
  private initPlatform() {
    if (this.treeList.length !== 0) {
      this.selectTree(this.treeList[0])
    }
  }

  /**
   * 设备树初始化
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
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            inProtocol: group.inProtocol || '',
            upGbId: group.gbId || '',
            upGbIdOrigin: group.gbId || ''
          }],
          upGbId: group.gbId || '',
          upGbIdOrigin: group.gbId || ''
        })
      })
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
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 设备树初始化
   */
  public async initTreeDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.treeDirList = []
      res.groups.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        this.treeDirList.push({
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
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
            inProtocol: group.inProtocol || '',
            upGbId: group.gbId || '',
            upGbIdOrigin: group.gbId || ''
          }],
          upGbId: group.gbId || '',
          upGbIdOrigin: group.gbId || ''
        })
      })
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
      this.dirList = []
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
          path: node.data.path.concat([{ ...dir, upGbId: dir.gbId || '', upGbIdOrigin: dir.gbId || '', inProtocol: dir.inProtocol || node.data.inProtocol }]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          dragInFlag: !!node.data?.dragInFlag,

          gbId: dir.gbId,
          upGbId: dir.gbId || '',
          upGbIdOrigin: dir.gbId || ''
        }
      })
      dirs = setDirsStreamStatus(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 删除上级平台
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
   * 编辑上级平台
   */
  private editPlatform(platform: any) {
    this.$router.push({
      path: '/up-platform/gb28121-update',
      query: {
        platformId: platform.platformId
      }
    })
  }

  /**
   * 选择平台
   */
  private selectTree(tree: any) {
    this.currentTree = tree
    this.initDirs()
  }

  private handleCreate() {
    this.dialog = {
      type: 'create',
      visible: true,
      title: '新建设备树',
      data: {
        name: '',
        rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
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
    this.treeMaxHeight = this.maxHeight - 160
  }

  private dialogSubmit() {
    this.dialogCancel()
  }

  private dialogCancel() {
    this.dialog.visible = false
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
    height: 100%;
  }

  .platform {
    margin-right: 10px;
    min-width: 260px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $borderGrey;
      padding: 15px;

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
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

    .tree-wraper {
      height: 100%;
      display: flex;

      .tree {
        flex: 1;
        overflow: auto;

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
      }

      .operator {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .el-button {
          margin: 0 10px 20px !important;
        }
      }
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
