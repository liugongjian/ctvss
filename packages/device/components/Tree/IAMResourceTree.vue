<template>
  <common-tree
    ref="commonTree"
    :node-key="nodeKey"
    :root-key="rootKey"
    :default-key="defaultKey"
    :data="data"
    :lazy="lazy"
    :load="load"
    :props="defaultProps"
    :empty-text="emptyText"
    :has-checkbox="true"
    @handle-node="handleNode"
    @check-device="handleCheck"
  >
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
      <!-- <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus)" :status="data[deviceEnum.StreamStatus]" /> -->
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
    <!-- <template slot="itemLabelSuffix" slot-scope="{ data }">
      <span v-if="data.type !== deviceTypeEnum.Ipc">{{ `(${data.onlineSize}/${data.totalSize})` }}</span>
    </template> -->
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'IAMResourceTree'
})
export default class extends Mixins(treeMixin) {

  private handleCheck(nodes: any) {
    this.$emit('check-device', nodes)
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
