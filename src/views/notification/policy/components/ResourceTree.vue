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
              <svg-icon :name="data.type" color="#6e7c89" />
              {{ node.label }}
            </span>
          </span>
        </el-tree>
      </div>
      <div class="device-wrap">
        <div class="device-wrap__header">已选资源({{ resourceList.length }})</div>
        <el-table ref="deviceTable" :data="resourceList" empty-text="暂无选择资源" fit>
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
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { getNotificationPolicyInfo, createNotificationPolicy, editNotificationPolicy } from '@/api/notification'

@Component({
  name: 'source-tree'
})
export default class extends Vue {
  @Prop()
  private checkedList: []

  private resourceList = []
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

  @Watch('resourceList')
  private resourceListChange(resourceList) {
    this.$emit('resourceListChange', resourceList.map(item => item.id))
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
  //             await this.loadDirChildren(_key, node)
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
            isLeaf: true
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
   * 加载子目录
   */
  // public async loadDirChildren(key: string, node: any) {
  //   if (node.loaded) {
  //     node.parent.expanded = true
  //     return
  //   }
  //   try {
  //     const dirTree: any = this.$refs.dirTree
  //     let data = await getDeviceTree({
  //       groupId: node.data.groupId,
  //       id: node.data.type === 'group' ? 0 : node.data.id,
  //       inProtocol: node.data.inProtocol,
  //       type: node.data.type === 'group' ? undefined : node.data.type
  //     })
  //     if (data.dirs) {
  //       const dirs = data.dirs.filter((dir: any) => dir.type === 'dir').map((dir: any) => ({
  //         id: dir.id,
  //         groupId: node.data.groupId,
  //         label: dir.label,
  //         inProtocol: node.data.inProtocol,
  //         isLeaf: dir.isLeaf,
  //         type: dir.type,
  //         path: node.data.path.concat([dir]),
  //         parentId: node.data.id
  //       }))
  //       dirTree.updateKeyChildren(key, dirs)
  //     }
  //     node.expanded = true
  //     node.loaded = true
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  /**
   * 加载目录
   */
  // private async loadDirs(node: any, resolve: Function) {
  //   if (node.level === 0) return resolve([])
  //   const dirs = await this.getTree(node)
  //   resolve(dirs)
  // }

  /**
   * 获取菜单树
   */
  // private async getTree(node: any) {
  //   try {
  //     let shareDeviceIds: any = []

  //     const devices: any = await getDeviceTree({
  //       groupId: node.data.groupId,
  //       id: node.data.type === 'group' ? 0 : node.data.id,
  //       inProtocol: node.data.inProtocol,
  //       type: node.data.type === 'group' ? undefined : node.data.type
  //     })

  //     const dirTree: any = this.$refs.dirTree
  //     let checkedKeys = dirTree.getCheckedKeys()
  //     let dirs: any = devices.dirs.filter((dir: any) => dir.type === 'dir').map((dir: any) => {
  //       if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
  //         checkedKeys.push(dir.id)
  //         dirTree.setCheckedKeys(checkedKeys)
  //       }
  //       return {
  //         id: dir.id,
  //         groupId: node.data.groupId,
  //         label: dir.label,
  //         inProtocol: node.data.inProtocol,
  //         isLeaf: dir.isLeaf,
  //         type: dir.type,
  //         path: node.data.path.concat([dir]),
  //         parentId: node.data.id
  //       }
  //     })
  //     return dirs
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
    this.resourceList = nodes.filter((node: any) => {
      const nodeIdsList = nodes.map((node: any) => node.id)
      return nodeIdsList.indexOf(node.parentId) === -1
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