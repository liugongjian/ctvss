<template>
  <common-tree
    ref="commonTree"
    v-loading="loading"
    :node-key="nodeKey"
    :root-key="rootKey"
    :data="data"
    :lazy="lazy"
    :load="treeLoad"
    :props="defaultProps"
    :empty-text="emptyText"
    :is-draggable="checkIsDraggable"
    :is-node-disabled="checkIsDisable"
    :get-title="getTitle"
    :expand-on-click-node="false"
    @handle-node="handleNode"
  >
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus, null, data)" :status="data[deviceEnum.StreamStatus]" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix" slot-scope="{ data }">
      <svg-icon v-if="checkTreeItemStatus(data)" :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" name="playing" class="playing" />
      <span v-if="data.type !== deviceTypeEnum.Ipc">{{ `(${data.onlineSize}/${data.totalSize})` }}</span>
    </template>
    <template slot="itemTools" slot-scope="{ data }">
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.ShowMore)" effect="dark" content="更多操作" placement="top" :open-delay="300">
        <hover-selector>
          <template slot="tooltipBase">
            <el-button type="text"><svg-icon name="more" /></el-button>
          </template>
          <template slot="tooltipContent">
            <el-button size="mini" type="text" @click.stop="handleTools(toolsEnum.AutoPlay, data)">一键播放</el-button>
          </template>
        </hover-selector>
      </el-tooltip>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { DeviceTypeEnum } from '../../enums/index'
import treeMixin from '@vss/device/components/Tree/treeMixin'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'ReplayTree'
})
export default class extends Mixins(treeMixin) {
  public async onTreeLoadedHook(node, res) {
    return res.dirs.filter(item => item.inProtocol !== 'viid')
  }

  /**
   * 判断item是否可拖拽
   */
  public checkIsDraggable(node) {
    return node.data.type === DeviceTypeEnum.Ipc
      && checkPermission(['ivs:GetCloudRecord'], node.data)
  }

  /**
   * 判断item是否可以点击
   */
  public checkIsDisable(node) {
    return node.data.type === DeviceTypeEnum.Ipc
      && !checkPermission(['ivs:GetCloudRecord'], node.data)
  }

  /**
   * 获取item无权限提示
   */
  getTitle(data: any) {
    if (!checkPermission(['ivs:GetCloudRecord'], data)) {
      return '无录像回放权限'
    } else {
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.status-badge {
  position: absolute;
  top: -1px;
  left: -3px;
  width: 6px;
  height: 6px;
  opacity: 0.7;
}

.active-icon {
  color: $color-status-success;
}
</style>
