<template>
  <common-tree
    ref="commonTree"
    v-loading="loading"
    :node-key="nodeKey"
    :root-key="rootKey"
    :default-key="defaultKey"
    :data="data"
    :lazy="lazy"
    :load="defaultLoad"
    :props="defaultProps"
    :empty-text="emptyText"
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
import { Component, Mixins } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'
import { DirectoryTypeEnum } from '@vss/device/enums/index'
import { getNodeInfo } from '@vss/device/api/dir'

@Component({
  name: 'SimpleDeviceTree'
})
export default class extends Mixins(treeMixin) {
  private loading = false
  private async defaultLoad(node) {
    try {
      let res
      if (node.level === 0) {
        this.loading = true
        res = await getNodeInfo({ id: '', type: DirectoryTypeEnum.Dir })
        this.rootSums.onlineSize = res.onlineSize
        this.rootSums.totalSize = res.totalSize
        this.loading = false
      } else {
        res = await getNodeInfo({ id: node.data.id, type: node.data.type })
      }
      return res.dirs
    } catch (e) {
      console.log(e)
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
