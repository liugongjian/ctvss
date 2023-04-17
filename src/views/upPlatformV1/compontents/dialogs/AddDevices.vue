<template>
  <el-dialog
    title="添加资源"
    :visible="dialogVisible"
    :close-on-click-modal="true"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="dialog-wrap">
      <div v-loading="loading.dir" class="tree-wrap">
        <el-tree
          ref="dirTree"
          node-key="id"
          lazy
          show-checkbox
          :data="dirList"
          :load="loadDirs"
          :props="treeProp"
          :check-strictly="false"
          @check="checkCallback"
          @check-change="onCheckDevice"
          @node-click="selectDevice"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node" :class="{ 'online': data.deviceStatus === 'on' }">
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
      <div class="device-wrap">
        <div class="device-wrap__header">已选资源({{ deviceList.length }})</div>
        <el-table ref="deviceTable" :data="deviceList" empty-text="暂无选择资源" fit>
          <el-table-column key="label" prop="label" width="120" label="设备名称">
            <template slot-scope="{ row }">
              {{ row.label || '-' }}
            </template>
          </el-table-column>
          <el-table-column key="path" prop="path" label="所在位置">
            <template slot-scope="{ row }">
              {{ renderPath(row.path) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="action" class-name="col-action" width="110" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="removeDevice(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { shareDeviceV1, describeShareDevicesV1 } from '@/api/upPlatform'
import { setDirsStreamStatus } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'AddDevices',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  private dialogVisible = true
  private submitting = false
  private dirList: any = []
  private deviceList: any = []
  public loading = {
    dir: false
  }
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  @Prop()
  private platformId: any
  private typeMapping: any = {
    dir: 0,
    nvr: 1,
    platform: 3,
    platformDir: 4
  }

  private mounted() {
    this.initDirs()
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
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    resolve(dirs)
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
        console.log('plat------', this.platformId)
        const params: any = {
          platformId: this.platformId,
          inProtocol: node.data.inProtocol,
          groupId: node.data.realGroupId || node.data.groupId,
          dirId: node.data.type === 'top-group' || node.data.type === 'group' ? 0 : node.data.id,
          dirType: '0',
          pageNum: 1,
          pageSize: 1000
        }
        const shareDevices: any = await describeShareDevicesV1(params)
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
      const checkedKeys = dirTree.getCheckedKeys()
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
          realGroupInProtocol: node.data.realGroupInProtocol || ''
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

  private async checkNodes(dirTree: any, node: any) {
    if (node.checked) {
      if (node.loaded) {
        node.expanded = true
      } else {
        const dirs = await this.getTree(node)
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
    console.log('before:', this.deviceList)
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
      await shareDeviceV1({
        platformId: this.platformId,
        vssGroups: groups
      })
      console.log('after:', groups)
      this.$message.success('添加资源成功！')
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
    this.closeDialog(true)
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
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

    .custom-tree-node {
      width: auto;

      .node-name {
        position: relative;

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

    &__header {
      font-weight: bold;
      text-align: center;
      padding: 10px;
    }
  }
</style>
