<template>
  <common-tree
    ref="commonTree"
    v-loading="loading"
    :node-key="nodeKey"
    :root-key="rootKey"
    :default-key="defaultKey"
    :data="dirList"
    :lazy="lazy"
    :load="treeLoadAiV1"
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
      {{ node.data.label }}
    </template>
    <template slot="itemLabelSuffix" slot-scope="{ data }">
      <span class="alert-type">{{ renderAlertType(data) }}</span>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { renderAlertType } from '@/utils/device'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'AIAlarmTree'
})
export default class extends Mixins(treeMixin) {
  @Prop({ default: () => ['dir', 'nvr', 'ipc', 'platform'] })
  public filterTypeArr

  private renderAlertType = renderAlertType

  private mounted(){
    this.initDirsAlarm()
  }


  public async onTreeLoadedHook(node, res) {
    return res.dirs
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
