<template>
  <common-tree
    ref="commonTree"
    :default-key="defaultKey"
    :data="data"
    :props="defaultProps"
    :empty-text="emptyText"
    :lazy="lazy"
    :get-node-info="getNodeInfo"
    :item-directive="dropScreen"
    :load="load"
    :tree-loading="treeLoading"
    @handle-node="handleNode"
  >
    <template slot="itemLabelPrefix" slot-scope="{data}">
      <svg-icon :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus)" status="on" />
    </template>
    <template slot="itemLabel" slot-scope="{node}">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix">
      <span>{{ `(1/11)` }}</span>
    </template>
    <template slot="itemTools" slot-scope="{node, data}">
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
import treeMixin from './treeMixin'

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
