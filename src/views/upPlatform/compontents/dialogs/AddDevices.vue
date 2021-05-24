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
          @check-change="onCheckDevice"
          @node-click="selectDevice"
        >
          <span slot-scope="{node, data}" class="custom-tree-node">
            <span class="node-name">
              <svg-icon :name="data.type" color="#6e7c89" />
              {{ node.label }}
            </span>
          </span>
        </el-tree>
      </div>
      <div class="device-wrap">
        <div class="device-wrap__header">已选资源({{ deviceList.length }})</div>
        <el-table ref="deviceTable" :data="deviceList" empty-text="暂无选择资源" fit>
          <el-table-column key="label" prop="label" width="120" label="设备名称">
            <template slot-scope="{row}">
              {{ row.label || '-' }}
            </template>
          </el-table-column>
          <el-table-column key="path" prop="path" label="所在位置">
            <template slot-scope="{row}">
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
import { shareDevice, describeShareDevices } from '@/api/upPlatform'

@Component({
  name: 'AddDevices',
  components: {
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
  private platform: any

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
        group.inProtocol === 'gb28181' && (
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            disabled: true,
            path: [group.groupName]
          })
        )
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
      const res = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })
      const dirs = res.dirs.map((dir: any) => {
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          disabled: dir.type !== 'ipc',
          path: node.data.path.concat([dir.label])
        }
      })
      return dirs
    } catch (e) {
      return []
    }
  }

  /**
   * 单击ipc时直接勾选
   */
  private selectDevice(data: any) {
    if (data.type === 'ipc') {
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
      return node.type === 'ipc'
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
    return dirPath.join('/')
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
      console.log(this.deviceList)
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
}
</script>
<style lang="scss" scoped>
  .dialog-wrap {
    display: flex;
    margin: -15px 0 10px 0;
    border: 1px solid $borderGrey;
  }
  .tree-wrap {
    flex: 1 0;
    height: 550px;
    padding: 10px;
    overflow: auto;
    border-right: 1px solid $borderGrey;
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
