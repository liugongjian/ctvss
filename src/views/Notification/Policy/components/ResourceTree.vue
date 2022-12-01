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
import IAMResourceTree from '@vss/device/components/Tree/IAMResourceTree.vue'
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
  public filterTypeArr = ['dir', 'nvr', 'ipc']
  public filterInProtocolArr = ['video']
  // public loading = false
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  public async mounted() {
    // await this.initResourceStatus()
  }

    /**
   * 初始化资源选中状态
   */
  public initResourceStatus = async () => {
    Promise.resolve(this.checkedList).then(async(checkedList: any) => {
      if (checkedList.length) {
        const pathList = checkedList.map((resource: any) => resource.split(':')[2].split('/'))
        const checkedKeys = pathList.map((path: string[]) => path[path.length - 1])
        for (let idx = 0, len = pathList.length; idx < len; idx++) {
            await this.deviceTree.asyncLoadChildren(pathList[idx], true)
          }
        const tree = this.deviceTree.$refs.commonTree
        tree.setCheckedKeys(checkedKeys)
        this.onCheckDevice(this.getTreeCheckedNodes(tree))
      }
      this.$emit('resourceLoaded')
    })
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
