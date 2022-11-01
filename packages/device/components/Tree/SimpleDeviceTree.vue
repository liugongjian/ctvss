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
    @handle-node="handleNode"
  >
    <template slot="rootLabelPrefix">
      <svg-icon name="component" />
    </template>
    <template slot="rootLabel">
      {{ rootLabel }}
    </template>
    <template slot="rootLabelSuffix">
      <span>{{ `(${rootSums.onlineSize}/${rootSums.totalSize})` }}</span>
    </template>
    <template slot="rootTools" slot-scope="{ data }">
      <el-tooltip effect="dark" content="导出全部搜索结果" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.ExportSearchResult, data)"><svg-icon name="export" /></el-button>
      </el-tooltip>
    </template>
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus)" :status="data[deviceEnum.StreamStatus]" />
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

@Component({
  name: 'SimpleDeviceTree'
})
export default class extends Mixins(treeMixin) {
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
