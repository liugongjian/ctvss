<template>
  <div class="dialog-wrap">
    <div v-loading="loading" class="tree-wrap">
      <el-tree
        ref="dirTree"
        node-key="id"
        lazy
        show-checkbox
        :props="treeProp"
        :load="loadGUser"
        :check-strictly="false"
        :default-checked-keys="checkedList"
        @check-change="onCheckDevice"
      >
        <span slot-scope="{ data }" class="custom-tree-node" :class="`custom-tree-node__${data.type}`">
          <span class="node-name">
            {{ data.label }}
          </span>
          <span v-if="data.phoneVerified === 0">
            {{ '(未完成验证，' }}
            <span class="resend-button" @click="verifyPhone(data)">点击重新发送</span>
            {{ ')' }}
          </span>
        </span>
      </el-tree>
    </div>
    <div class="device-wrap">
      <div class="device-wrap__header">已选对象({{ destinationList.length }})</div>
      <el-table ref="deviceTable" :data="destinationList" empty-text="暂无选择资源" fit>
        <el-table-column key="label" prop="label" label="子用户组/子用户名称">
          <template slot-scope="{ row }">
            {{ row.label || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="path" prop="path" label="所在位置">
          <template slot-scope="{ row }">
            {{ renderPath(row.path) || '-' }}
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getGUserList, verifyPhone } from '@/api/accessManage'

@Component({
  name: 'source-tree'
})
export default class extends Vue {
  @Prop()
  private checkedList: []

  private destinationList = []
  public loading = false
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private async verifyPhone(row: any) {
    try {
      await verifyPhone({
        iamUserId: row.id
      })
      this.$message.success('验证短信发送成功!')
    } catch (err) {
      this.$message.error(err && err.message)
    }
  }

  /**
   * 加载目录
   */
  private async loadGUser(node: any, resolve: Function) {
    try {
      this.loading = true
      const res = await getGUserList({
        parentGroupId: (node.data && node.data.id) || '-1'
      })
      const dirs: any = res.data.map((guser: any) => {
        return {
          id: guser.id,
          label: guser.name,
          path: node.data && node.data.path ? node.data.path.concat([guser]) : [guser],
          parentId: (node.data && node.data.id) || '-1',
          type: guser.type,
          isLeaf: guser.type === 'user',
          phoneVerified: guser.phoneVerified
        }
      })
      resolve(dirs)
      if (node.level === 0) {
        this.$nextTick(() => this.initResourceStatus(this.checkedList))
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 初始化资源选中状态
   */
  public async initResourceStatus(checkedList: any) {
    this.loading = true
    const dirTree: any = this.$refs.dirTree
    const checkedKeys = []
    for (let index = 0, len = checkedList.length; index < len; index++) {
      const resource = checkedList[index].path
      const keyPath = resource.split('/')
      if (keyPath && keyPath.length) {
        for (let i = 0; i < keyPath.length - 1; i++) {
          const _key = keyPath[i]
          const node = dirTree.getNode(_key)
          if (node) {
            await this.loadChildrenNodes(_key, node)
          }
        }
        checkedKeys.push(keyPath[keyPath.length - 1])
      }
    }
    dirTree.setCheckedKeys(checkedKeys)
    this.loading = false
  }

  /**
   * 加载子节点
   */
  private async loadChildrenNodes(key: string, node: any) {
    if (node.loaded) {
      node.parent.expanded = true
      return
    }
    try {
      const dirTree: any = this.$refs.dirTree
      const res = await getGUserList({
        parentGroupId: key
      })
      dirTree.updateKeyChildren(key, res.data.map((guser: any) => {
        return {
          id: guser.id,
          label: guser.name,
          parentId: node.data.id,
          type: guser.type,
          isLeaf: guser.type === 'user',
          path: node.data.path.concat([guser])
        }
      }))
      node.expanded = true
      node.loaded = true
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice() {
    const dirTree: any = this.$refs.dirTree
    const nodes = dirTree.getCheckedNodes()
    this.destinationList = nodes.filter((node: any) => {
      const nodeIdsList = nodes.map((node: any) => node.id)
      return nodeIdsList.indexOf(node.parentId) === -1
    })

    this.$emit('destinationListChange', this.destinationList.map((destination: any) => {
      return {
        id: destination.id,
        type: destination.type,
        path: destination.path.map((obj: any) => obj.id).join('/')
      }
    }))
  }

  /**
   * 移除设备
   */
  private removeDevice(group: any) {
    const dirTree: any = this.$refs.dirTree
    dirTree.setChecked(group.id, false)
  }

  /**
   * 显示设备所在路径
   */
  private renderPath(path: any) {
    const dirPath = path.slice(0, -1)
    const dirPathName = dirPath.map((dir: any) => {
      return dir.name
    })
    return dirPathName.join('/')
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

  .resend-button {
    text-decoration: underline;
    cursor: pointer;
    color: $primary;
  }
</style>
