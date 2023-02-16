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
    <div v-loading="loading.dir" class="tree-wrap">
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
          :class="{'online': data.deviceStatus === 'on'}"
        >
          <span class="node-name">
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
          :class="{'online': data.deviceStatus === 'on'}"
        >
          <span class="node-name">
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
import { getDeviceTree } from '@/api/device'
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

  private dialogVisible = true
  private submitting = false
  public dirList = []
  private currentDir: any = null
  private getSums = getSums
  private revertSearchFlag = false

  /**
   * 当前业务组ID
   */
  private get groupId() {
    return GroupModule.group!.groupId
  }

  private async mounted() {
    await this.initDirs()
  }

  public async initDirs() {
    try {
      VGroupModule.resetVGroupInfo()
      this.loading.dir = true
      let res
      if (this.isCustomTree) {
        res = await loadTreeNode({
          dirId: this.currentGroupId
        })
      } else {
        res = await getDeviceTree({
          groupId: this.currentGroupId,
          id: 0,
          deviceStatusKeys: this.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
          streamStatusKeys: this.advancedSearchForm.streamStatusKeys.join(',') || undefined,
          matchKeys: this.advancedSearchForm.matchKeys.join(',') || undefined,
          deviceAddresses: this.advancedSearchForm.deviceAddresses.code ? this.advancedSearchForm.deviceAddresses.code + ',' + this.advancedSearchForm.deviceAddresses.level : undefined,
          searchKey: this.advancedSearchForm.searchKey || undefined
        })
      }
      this.dirList = this.setDirsStreamStatus(res.dirs)
      const query: any = this.$route.query
      // 根据搜索结果 组装 目录树（柳州搜索新增功能）
      const outerSearch = {
        deviceStatusKeys: (query.deviceStatusKeys || '').split(','),
        streamStatusKeys: (query.streamStatusKeys || '').split(','),
        matchKeys: (query.matchKeys || '').split(','),
        searchKey: query.searchKey || '',
        deviceAddressesCode: (query.deviceAddresses || '').split(',')[0]
      }
      this.revertSearchFlag = Boolean(outerSearch.searchKey ||
        outerSearch.deviceStatusKeys.length ||
        outerSearch.streamStatusKeys.length ||
        outerSearch.deviceAddressesCode
      )

      if (this.revertSearchFlag) {
        this.dirList = this.transformDirList(this.dirList)
      }
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  private selectDevice(dir: any) {
    if (dir.type === 'ipc') {
      this.closeDialog(dir)
    }
  }

  private closeDialog(device: Device) {
    this.dialogVisible = false
    this.$emit('on-close', device)
  }
}
</script>
<style lang="scss" scoped>
  .tree-wrap {
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
