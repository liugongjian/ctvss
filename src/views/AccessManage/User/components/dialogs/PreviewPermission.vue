<template>
  <el-dialog
    v-loading="loading.dir"
    :title="dialogData.dialogTitle || dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="1000px"
    @close="closeDialog"
  >
    <div class="el-dialog__body_action-wrap">
      <span
        v-for="actionName of filteredSystemActionList.map(action => action.actionName)"
        :key="actionName"
        class="el-dialog__body_action-wrap_name"
      >
        {{ actionName }}
      </span>
    </div>
    <div class="el-dialog__body_tree-wrap">
      <el-tree
        ref="previewTree"
        node-key="id"
        lazy
        :load="loadDirs"
        :props="treeProp"
      >
        <span
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="`custom-tree-node__${data.type}`"
        >
          <span class="node-name">
            <svg-icon :name="data.type" color="#6e7c89" />
            <span :title="node.label" style="margin-left: 5px;">{{ node.label }}</span>
          </span>
          <div class="node-permission">
            <template v-for="actionKey of filteredSystemActionList.map(action => action.actionKey)">
              <span
                v-if="!data[actionKey]"
                :key="actionKey + node.id"
                class="node-permission__action node-permission__action-inherited"
              >
                {{ '-' }}
              </span>
              <span
                v-else-if="data[actionKey] && Number(data[actionKey].level)"
                :key="actionKey + node.id"
                :class="{
                  'node-permission__action-inherited': data[actionKey] && data[actionKey].isInherited
                }"
                class="node-permission__action"
              >
                {{ data[actionKey].level }}
              </span>
              <i
                v-else
                :key="actionKey + node.id"
                :class="{
                  'el-icon-check': data[actionKey] && data[actionKey].auth,
                  'el-icon-close': data[actionKey] && !data[actionKey].auth,
                  'node-permission__action-inherited': data[actionKey] && data[actionKey].isInherited
                }"
                class="node-permission__action"
              />
            </template>
          </div>
        </span>
      </el-tree>
    </div>
    <div slot="footer" align="center">
      <el-button type="primary" @click="closeDialog">{{ '关闭' }}</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getGroups } from '@/api/group'
import { getDeviceTree } from '@/api/device'
import { previewAuthActions } from '@/api/accessManage'
import settings from '@/settings'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'PreviewPermission'
})
export default class extends Vue {
  @Prop() private dialogData: any

  private loading = {
    dir: false
  }
  private dialogTitle = '权限预览'
  private dialogVisible = true
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private get filteredSystemActionList() {
    const tagObject = UserModule.tags || ({})
    const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
    const res = settings.systemActionList
      .filter((action: any) => !denyPerms.includes(action.actionKey))
    return res
  }

  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) {
      const groups = await this.initDirs()
      resolve(groups)
    } else {
      const dirs = await this.getTree(node)
      resolve(dirs)
    }
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
      const groups = []
      res.groups.forEach((group: any) => {
        group.inProtocol !== 'vgroup' &&
          groups.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            parentId: '0',
            path: [
              {
                id: group.groupId,
                label: group.groupName,
                type: 'group'
              }
            ]
          })
      })
      return groups
    } catch (e) {
      console.log('e: ', e)
      return []
    } finally {
      this.loading.dir = false
    }
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

      const dirs: any = devices.dirs
        .map((dir: any) => {
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

      const isGet = this.dialogData.dialogType === 'get'
      const permissionRes = await previewAuthActions({
        targetResources: dirs.map(dir => ({
          groupId: node.data.groupId,
          dirPath: dir.type === 'dir' ? dir.path.slice(1).map(path => path.id).join('/') : dir.path.slice(1).map(path => path.id).join('/').slice(0, -1),
          deviceId: dir.type === 'dir' ? undefined : dir.path[dir.path.length - 1].id
        })),
        iamUserId: isGet ? this.dialogData.iamUserId : undefined,
        iamGroupId: isGet ? undefined : this.dialogData.iamGroupId,
        policyIds: isGet ? undefined : this.dialogData.policyIds
      })
      const result = dirs.map((dir, index) => ({
        ...dir,
        ...permissionRes.result[index].iamUser.actions
      }))
      return result
    } catch (e) {
      console.log(e)
    }
  }

  private mounted() {
  }

  private closeDialog() {
    this.$emit('on-close', false)
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-tree-node {
  position: relative;

  &__content {
    border: 1px solid #ccc;
    border-bottom: none;

    .node-name {
      display: block;
      width: 210px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-permission {
      position: absolute;
      top: 0;
      right: 0;
      line-height: 26px;
      height: 26px;
      z-index: 999;

      &__action-inherited {
        color: #ccc;
      }

      &__action {
        display: inline-block;
        border-left: 1px solid #ccc;
        width: 26px;
        height: 26px;
        line-height: 26px;
        text-align: center;
      }
    }
  }
}

::v-deep .el-dialog__body {
  position: relative;

  &_action-wrap {
    margin-top: 5px;
    float: right;
    display: flex;
    justify-content: flex-end;
    margin-right: 27px;
    border-left: 1px solid #ccc;

    &_name {
      width: 26px;
      padding: 0 5px;
      border-top: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }
  }

  &_tree-wrap {
    clear: both;
    // flex: 1 0;
    height: 500px;
    padding: 10px;
    padding-top: 0;
    overflow: auto;
    border-right: 1px solid $borderGrey;

    .is-disabled + .custom-tree-node__ipc {
      cursor: not-allowed;
    }
  }
}
</style>
