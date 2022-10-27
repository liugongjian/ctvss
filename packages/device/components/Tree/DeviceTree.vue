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
    <template slot="itemTools" slot-scope="{ data }">
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.SortDirectory)" effect="dark" content="子目录排序" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.SortDirectory, data)"><svg-icon name="sort" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.AddDirectory)" effect="dark" content="添加子目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.AddDirectory, data)"><svg-icon name="plus" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.EditDirectory)" effect="dark" content="编辑目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.EditDirectory, data)"><svg-icon name="edit" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.DeleteDirectory)" effect="dark" content="删除目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.DeleteDirectory, data)"><svg-icon name="trash" /></el-button>
      </el-tooltip>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'DeviceTree'
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
