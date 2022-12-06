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
    :expand-on-click-node="false"
    @handle-node="handleNode"
  >
    <template slot="rootLabelPrefix">
      <svg-icon name="component" />
    </template>
    <template slot="rootLabel">
      {{ rootLabel }}
    </template>
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus, null, data)" :status="data[deviceEnum.StreamStatus]" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix" slot-scope="{ data }">
      <span class="alert-type">{{ renderAlertType(data) }}</span>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
// import StatusBadge from '@/components/StatusBadge/index.vue'
import { renderAlertType } from '@/utils/device'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'AlarmTree',
  // components: {
  //   StatusBadge
  // }
})
export default class extends Mixins(treeMixin) {
  private renderAlertType = renderAlertType
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
