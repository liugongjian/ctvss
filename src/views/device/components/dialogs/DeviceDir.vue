<template>
  <el-dialog
    title="选择设备"
    :visible="dialogVisible"
    :append-to-body="true"
    :close-on-click-modal="true"
    width="400px"
    center
    @close="closeDialog"
  >
    <div
      v-loading="loading.dir"
      class="tree-wrap"
      :class="{'tree-wrap__tree--live': isLive, 'tree-wrap__tree--replay': !isLive}"
    >
      <el-tree
        v-if="!revertSearchFlag"
        key="device-dir-el-tree-original"
        ref="dirTree"
        node-key="id"
        highlight-current
        lazy
        :data="dirList"
        :load="loadDirs"
        :props="treeProp"
        @node-click="selectDevice"
      >
        <span
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="{
            'online': data.deviceStatus === 'on',
            'offline': (data.deviceStatus !== 'on' && data.type === 'ipc'),
            'no-permission': data.type === 'ipc' && !checkPermission(isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord'], data)
          }"
        >
          <span class="node-name" :title="getTitle(data)">
            <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
            <svg-icon :name="data.type" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
          </span>
        </span>
      </el-tree>
      <el-tree
        v-else
        key="device-dir-el-tree-filter"
        ref="dirTree"
        node-key="id"
        highlight-current
        :data="dirList"
        :props="treeProp"
        default-expand-all
        @node-click="selectDevice"
      >
        <span
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="{
            'online': data.deviceStatus === 'on',
            'offline': (data.deviceStatus !== 'on' && data.type === 'ipc'),
            'no-permission': data.type === 'ipc' && !checkPermission(isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord'], data)
          }"
        >
          <span class="node-name" :title="getTitle(data)">
            <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
            <svg-icon :name="data.type" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
          </span>
        </span>
      </el-tree>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import IndexMixin from '../../mixin/indexMixin'
import { GroupModule } from '@/store/modules/group'
import { Device } from '@/type/Device'
import { loadTreeNode } from '@/api/customTree'
import { VGroupModule } from '@/store/modules/vgroup'
import { getSums } from '@/utils/device'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'DeviceDir',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(IndexMixin) {
  @Prop()
  private device!: Device

  @Prop({ default: true })
  private isLive: boolean

  private dialogVisible = true
  private submitting = false
  public dirList = []
  private currentDir: any = null
  private revertSearchFlag = false
  private getSums = getSums

  /**
   * 当前业务组ID
   */
  private get groupId() {
    return GroupModule.group!.groupId
  }

  private async mounted() {
    console.log('this.isLive: ', this.isLive)
    await this.initDirs()
  }

  public async initDirs() {
    try {
      VGroupModule.resetVGroupInfo()
      this.loading.dir = true
      let data
      if (this.isCustomTree) {
        const res = await loadTreeNode({
          dirId: this.currentGroupId
        })
        data = res.dirs.map(dir => ({
          ...dir,
          ...dir.authMap
        }))
      } else {
        const query: any = this.$route.query
        const addressArr = (query.deviceAddresses || '').split(',')
        const outerSearch = {
          deviceStatusKeys: (query.deviceStatusKeys && query.deviceStatusKeys.split(',')) || [],
          streamStatusKeys: (query.streamStatusKeys && query.streamStatusKeys.split(',')) || [],
          matchKeys: (query.matchKeys && query.matchKeys.split(',')) || [],
          searchKey: query.searchKey || '',
          deviceAddresses: {
            code: addressArr[0] || '',
            level: addressArr[1] || ''
          }
        }

        this.revertSearchFlag = Boolean(outerSearch.searchKey ||
          outerSearch.deviceStatusKeys.length ||
          outerSearch.streamStatusKeys.length ||
          outerSearch.deviceAddresses.code
        )

        data = await this.getAuthActionsDeviceTree({
          groupId: this.currentGroupId,
          id: 0,
          deviceStatusKeys: outerSearch.deviceStatusKeys.join(',') || undefined,
          streamStatusKeys: outerSearch.streamStatusKeys.join(',') || undefined,
          matchKeys: outerSearch.matchKeys.join(',') || undefined,
          searchKey: outerSearch.searchKey || undefined,
          deviceAddresses: outerSearch.deviceAddresses.code ? outerSearch.deviceAddresses.code + ',' + this.outerSearch.deviceAddresses.level : undefined
        }, null)
      }
      this.dirList = data
      // 根据搜索结果 组装 目录树（柳州搜索新增功能）
      if (this.revertSearchFlag) {
        this.dirList = await this.transformDirList(this.dirList)
      }
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  private selectDevice(dir: any) {
    // 1）必须是IPC；2）实时预览必须设备在线
    if (dir.type !== 'ipc' || (this.isLive && dir.deviceStatus !== 'on')) {
      return
    }
    // 无权限
    const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    if (!this.checkPermission(perms, dir)) {
      return
    }
    if (dir.type === 'ipc') {
      this.closeDialog(dir)
    }
  }

  /**
   * 获取无权限提示
   */
  getTitle(data: any) {
    const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    const title = this.isLive ? '无实时预览权限' : '无录像回放权限'
    if (!this.checkPermission(perms, data)) {
      return title
    } else {
      return ''
    }
  }

  private closeDialog(device: Device) {
    this.dialogVisible = false
    this.$emit('on-close', device)
  }
}
</script>
<style lang="scss" scoped>
.tree-wrap__tree--live .offline .node-name {
  cursor: not-allowed;
}

.tree-wrap {
  .no-permission .node-name {
    cursor: not-allowed;
  }

  height: 300px;
  overflow: auto;

  .svg-icon {
    margin-right: 5px;
    color: #6e7c89;
  }

  .node-name {
    position: relative;
  }

  .custom-tree-node.online .node-name {
    .svg-icon {
      color: #65c465;
    }
  }

  .custom-tree-node .sum-icon {
    color: $textGrey;
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
</style>
