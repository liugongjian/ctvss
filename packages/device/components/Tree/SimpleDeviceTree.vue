<template>
  <common-tree
    ref="commonTree"
    v-loading="loading"
    :node-key="nodeKey"
    :root-key="rootKey"
    :default-key="defaultKey"
    :data="data"
    :lazy="lazy"
    :load="treeLoad"
    :props="defaultProps"
    :empty-text="emptyText"
    :is-node-disabled="checkIsDisable"
    :get-title="getTitle"
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
      <span v-if="data.type !== deviceTypeEnum.Ipc">{{ `(${data.onlineSize}/${data.totalSize})` }}</span>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { DeviceTypeEnum, DeviceEnum, StatusEnum } from '../../enums/index'
import treeMixin from '@vss/device/components/Tree/treeMixin'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'SimpleDeviceTree'
})
export default class extends Mixins(treeMixin) {
  @Prop({ default: true })
  private isLive: boolean
  /**
   * 判断item是否可以点击
   */
  public checkIsDisable(node) {
    const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    if (this.isLive) {
      return node.data.type === DeviceTypeEnum.Ipc
        && (node.data[DeviceEnum.DeviceStatus] !== StatusEnum.On || !checkPermission(perms, node.data))
    } else {
      return node.data.type === DeviceTypeEnum.Ipc
        && !checkPermission(perms, node.data)
    }
  }

  /**
   * 获取item无权限提示
   */
  getTitle(data: any) {
    const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    const title = this.isLive ? '无实时预览权限' : '无录像回放权限'
    if (!checkPermission(perms, data)) {
      return title
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
