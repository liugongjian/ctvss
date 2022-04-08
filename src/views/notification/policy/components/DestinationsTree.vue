<template>
  <div class="dialog-wrap">
    <div class="dialog-wrap">
      <div v-loading="loading.dir" class="tree-wrap">
        <el-tree
          ref="dirTree"
          node-key="id"
          lazy
          show-checkbox
          :data="dirList"
          :props="treeProp"
          :check-strictly="false"
          :default-checked-keys="checkedList"
          @check-change="onCheckDevice"
        >
          <span slot-scope="{node, data}" class="custom-tree-node" :class="`custom-tree-node__${data.type}`">
            <span class="node-name">
              {{ data.label }}
            </span>
          </span>
        </el-tree>
      </div>
      <div class="device-wrap">
        <div class="device-wrap__header">已选对象({{ destinationList.length }})</div>
        <el-table ref="deviceTable" :data="destinationList" empty-text="暂无选择资源" fit>
          <el-table-column key="label" prop="label" width="180" label="业务组/目录名称">
            <template slot-scope="{row}">
              {{ row.label || '-' }}
            </template>
          </el-table-column>
          <!-- <el-table-column key="path" prop="path" label="所在位置">
            <template slot-scope="{row}">
              {{ renderPath(row.path) }}
            </template>
          </el-table-column> -->
          <el-table-column label="操作" prop="action" class-name="col-action" width="110" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="removeDevice(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { getGroupList, getUserList, deleteUser } from '@/api/accessManage'

@Component({
  name: 'source-tree'
})
export default class extends Vue {
  @Prop()
  private checkedList: []

  private destinationList = []
  private dirList: any = []
  public loading = {
    dir: false,
    resource: false
  }
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  // @Watch('checkedList')
  // private checkedListChange(checkedList) {
  //   this.initResourceStatus(checkedList)
  // }

  @Watch('destinationList')
  private destinationListChange(destinationList) {
    this.$emit('destinationListChange', destinationList.map(item => item.id))
  }


  private async mounted() {
    await this.initDirs()
    this.$nextTick(() => {
      this.onCheckDevice()
    })
  }

  /**
   * 初始化资源选中状态
   */
  // public async initResourceStatus(checkedList: any) {
  //   const dirTree: any = this.$refs.dirTree
  //   const checkedKeys = []
  //   for (let index = 0, len = checkedList.length; index < len; index++) {
  //     const resource = checkedList[index]
  //     if (/vssgroup/.test(resource)) {
  //       const _key = resource.split(':').slice(-1)[0]
  //       checkedKeys.push(_key)
  //     } else {
  //       const keyPath = resource.split(':').slice(2).join('/').split(/\//)
  //       if (keyPath && keyPath.length) {
  //         for (let i = 0; i < keyPath.length - 1; i++) {
  //           const _key = keyPath[i]
  //           const node = dirTree.getNode(_key)
  //           if (node) {
  //             await this.loadChildrenNodes(_key, node)
  //           }
  //         }
  //         checkedKeys.push(keyPath[keyPath.length - 1])
  //       }
  //     }
  //   }
  //   dirTree.setCheckedKeys(checkedKeys)
  // }

  /**
   * 目录初始化
   */
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroupList({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        this.dirList.push({
          id: group.groupId,
          label: group.groupName,
          path: [{
            id: group.groupId,
            label: group.groupName
          }],
          parentId: '0',
          isLeaf: true
        })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载子目录
   */
  // private async loadChildrenNodes(key: string, node: any) {
  //   try {
  //     const groupTree: any = this.$refs.groupTree
  //     let data = await getGroupList({
  //       parentGroupId: key
  //     })
  //     groupTree.updateKeyChildren(key, data.groups.map((group: any) => {
  //       return {
  //         id: group.groupId,
  //         label: group.groupName,
  //         path: node.data.path.concat([{
  //           id: group.groupId,
  //           label: group.groupName,
  //           path: node.data.path.concat([group]),
  //           parentId: node.data.id
  //         }])
  //       }
  //     }))
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  /**
   * 加载目录
   */
  // private async loadGroups(node: any, resolve: Function) {
  //   if (node.level === 0) return resolve([])
  //   try {
  //     const res = await getGroupList({
  //       parentGroupId: node.data.id
  //     })
  //     let dirs: any = res.groups.map((group: any) => {
  //       return {
  //         id: group.groupId,
  //         label: group.groupName,
  //         path: node.data.path.concat([group]),
  //         parentId: node.data.id
  //       }
  //     })
  //     resolve(dirs)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

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
  }

  /**
   * 移除设备
   */
  private removeDevice(group: any) {
    const dirTree: any = this.$refs.dirTree
    console.log(group)
    const childNodes: any = dirTree.getNode(group.id).childNodes
    dirTree.setChecked(group.id, false)
    // while (childNodes.length) {
    //   childNodes.forEach(node => {
    //     this.removeDevice(node.data)
    //   })
    // }
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