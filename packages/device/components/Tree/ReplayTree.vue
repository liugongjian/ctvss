<template>
  <common-tree
    ref="commonTree"
    :node-key="nodeKey"
    :root-key="rootKey"
    :data="data"
    :lazy="lazy"
    :load="load"
    :props="defaultProps"
    :empty-text="emptyText"
    :is-draggable="checkIsDraggable"
    @handle-node="handleNode"
  >
    <template slot="itemLabelPrefix" slot-scope="{ data }">
      <svg-icon :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus)" status="on" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix" slot-scope="{ data }">
      <span v-if="data.type !== deviceTypeEnum.Ipc">{{ `(${data.onlineSize}/${data.totalSize})` }}</span>
    </template>
    <template slot="itemTools" slot-scope="{ node, data }">
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.ShowMore)" effect="dark" content="更多操作" placement="top" :open-delay="300">
        <hover-selector>
          <template slot="tooltipBase">
            <el-button type="text"><svg-icon name="more" /></el-button>
          </template>
          <template slot="tooltipContent">
            <el-button size="mini" type="text" @click.stop="handleTools(toolsEnum.AutoPlay, node)">一键播放</el-button>
          </template>
        </hover-selector>
      </el-tooltip>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'ReplayTree'
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
</style>
