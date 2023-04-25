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
          slot-scope="{ node, data }"
          class="custom-tree-node"
          :class="`custom-tree-node__${data.type}`"
        >
          <span class="node-name">
            <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
            <span v-else class="node-dir">
              <svg-icon name="dir" width="15" height="15" />
              <svg-icon name="dir-close" width="15" height="15" />
            </span>
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
import { getNodeInfo, previewAuthActions } from '@vss/device/api/dir'
import { DirectoryTypeEnum } from '@vss/device/enums/index'
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
    const userVersion = UserModule.version
    const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
    const res = settings.systemActionList
      .filter((action: any) => !denyPerms.includes(action.actionKey))
      .filter((action: any) => !action.version || action.version === userVersion)
    return res
  }

  private async loadDirs(node: any, resolve: Function) {
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any) {
    try {
      const isRoot = node.level === 0
      const devices = await getNodeInfo({
        id: isRoot ? '' : node.data.id,
        type: isRoot ? DirectoryTypeEnum.Dir : node.data.type
      })

      const dirs: any = devices.dirs
        .map((dir: any) => {
          return {
            id: dir.id,
            label: dir.label,
            inProtocol: dir.inProtocol,
            isLeaf: dir.isLeaf,
            type: dir.type,
            path: isRoot ? [dir] : node.data.path.concat([dir]),
            // parentId: node.data.id
          }
        })

      const isGet = this.dialogData.dialogType === 'get'
      const permissionRes = await previewAuthActions({
        targetResources: dirs.map(dir => ({
          dirPath: ((dir.type === 'dir' || dir.type === 'platformDir') ? dir.path.slice(1).map(path => path.id).join('/') : dir.path.slice(1).map(path => path.id).join('/').slice(0, -1)) || '0',
          deviceId: (dir.type === 'dir' || dir.type === 'platformDir') ? undefined : dir.path[dir.path.length - 1].id
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

  private closeDialog() {
    this.$emit('on-close', false)
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__footer {
  margin-top: 0;
  padding-bottom: 15px;
}

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
  height: 580px;
  overflow: auto;
  padding-top: 15px;
  padding-bottom: 5px;

  &_action-wrap {
    display: flex;
    justify-content: flex-end;
    border-right: 1px solid #ccc;
    margin-right: -1px;

    &_name {
      width: 26px;
      padding: 2px 5px;
      border-top: 1px solid #ccc;
      border-left: 1px solid #ccc;
    }
  }

  &_tree-wrap {
    border-bottom: 1px solid #ccc;

    .is-disabled + .custom-tree-node__ipc {
      cursor: not-allowed;
    }
  }
}
</style>
