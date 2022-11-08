<template>
  <div class="dialog-wrap">
    <IAMResourceTree 
      ref="deviceTree"
      v-loading="loading.tree"
      class="tree-wrap"
      :load="treeLoad"
      :lazy="lazy"
      :data="dirList"
      :props="treeProp"
      @check-device="onCheckDevice"
    />
    <div class="device-wrap">
      <div class="device-wrap__header">已选资源({{ resourceList.length }})</div>
      <el-table ref="deviceTable" :data="resourceList" empty-text="暂无选择资源" fit>
        <el-table-column key="name" prop="name" width="220" label="业务组/目录名称/设备名称">
          <template slot-scope="{ row }">
            {{ row.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="path" prop="path" label="所在位置">
          <template slot-scope="{ row }">
            {{ renderPath(row.path) || '' }}
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
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { getDeviceTree } from '@/api/device'
import IAMResourceTree from '@vss/device/components/Tree/IAMResourceTree.vue'
import { getGroups } from '@/api/group'
import layoutMxin from '@vss/device/mixin/layoutMixin'

@Component({
  name: 'source-tree',
  components: {
    IAMResourceTree
  }
})
export default class extends Mixins(layoutMxin) {
  @Prop()
  private checkedList: []

  private resourceList = []
  private dirList: any = []
  // public loading = false
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  public async mounted() {
    await this.initDirs()
    await this.initResourceStatus(this.checkedList)
  }

  /**
   * 初始化资源选中状态
   */
  public async initResourceStatus(checkedList: any) {
    // this.loading = true
    const deviceTree: any = this.deviceTree.$refs.commonTree
    const checkedKeys = []
    for (let index = 0, len = checkedList.length; index < len; index++) {
      const resource = checkedList[index]
      if (/vssgroup/.test(resource)) {
        const _key = resource.split(':').slice(-1)[0]
        checkedKeys.push(_key)
      } else {
        const keyPath = resource.split(':').slice(2).join('/').split(/\//)
        if (keyPath && keyPath.length) {
          for (let i = 0; i < keyPath.length - 1; i++) {
            const _key = keyPath[i]
            const node = deviceTree && deviceTree.getNode(_key)
            if (node) {
              await this.loadDirChildren(_key, node)
            }
          }
          checkedKeys.push(keyPath[keyPath.length - 1])
        }
      }
    }
    deviceTree && deviceTree.setCheckedKeys(checkedKeys)
    // this.loading = false
  }

  /**
   * 目录初始化
   */
  public async initDirs() {
    try {
      // this.loading = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        (group.inProtocol !== 'vgroup') && (
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            parentId: '0',
            path: [{
              id: group.groupId,
              label: group.groupName,
              type: 'group'
            }],
            isLeaf: group.inProtocol !== 'gb28181'
          })
        )
      })
    } catch (e) {
      this.dirList = []
    } finally {
      // this.loading = false
    }
  }

  /**
   * 加载子目录
   */
  public async loadDirChildren(key: string, node: any) {
    if (node.loaded) {
      node.parent.expanded = true
      return
    }
    try {
      const deviceTree: any = this.deviceTree.$refs.commonTree
      const data = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })
      if (data.dirs) {
        const dirs = data.dirs.map((dir: any) => ({
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          path: node.data.path.concat([dir]),
          parentId: node.data.id
        }))
        deviceTree && deviceTree.updateKeyChildren(key, dirs)
      }
      node.expanded = true
      node.loaded = true
    } catch (e) {
      console.log(e)
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
      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })

      const dirs: any = devices.dirs.map((dir: any) => {
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          path: node.data.path.concat([dir]),
          parentId: node.data.id
        }
      })
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice(nodes: any) {
    const list = nodes.filter((node: any) => {
      const currentNodeParentDirId = (node.parentDirId === 0 || node.parentDirId === -1) ? 0 : node.parentDirId
      const currentNodeParentDeviceId = (node.parentDeviceId === 0 || node.parentDeviceId === -1) ? 0 : node.parentDeviceId
      const nodeIdsList = nodes.map((node: any) => node.id)
      return ((currentNodeParentDirId !== 0) && nodeIdsList.indexOf(node.parentDirId) === -1) && ((currentNodeParentDeviceId !== 0) && nodeIdsList.indexOf(node.parentDeviceId) === -1)
    })
    this.resourceList = list
    this.$emit('resourceListChange', this.resourceList.map((resource: any) => {
      const mainUserID = this.$store.state.user.mainUserID
      const pathIds = resource.path.map((obj: any) => obj.id)
      return `${mainUserID}:${'type-' + resource.type}:${pathIds.join('/')}`
    }))
  }

  /**
   * 移除设备
   */
  private removeDevice(device: any) {
    const tree = this.deviceTree.$refs.commonTree
    tree.setChecked(device.id, false, true)
    this.onCheckDevice(this.getTreeCheckedNodes(tree))
  }
    
  private getTreeCheckedNodes(tree: any) {
    const nodes = tree.getCheckedNodes()
    return nodes
  }

  /**
   * 显示设备所在路径
   */
  private renderPath(path: any) {
    const end = path.length - 1
    if (path.length > 1) {
      return path[end].label.indexOf('/') === 0 ? path[end].label.slice(1) : path[end].label
    } else {
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-wrap {
    width: 100%;
    display: flex;
    border: 1px solid $borderGrey;
    border-radius: 5px;
  }

  .tree-wrap {
    flex: 1 0;
    height: 550px;
    padding: 10px;
    overflow: auto;
    border-right: 1px solid $borderGrey;

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

  .el-table {
    width: 100%;
  }

  .el-table ::v-deep .is-ctyun-policy .cell .el-checkbox__inner {
    display: none;
    position: relative;
  }
</style>
