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
    :expand-on-click-node="false"
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
    <!-- <template slot="rootTools" slot-scope="{ data }">
      <el-tooltip effect="dark" content="导出全部搜索结果" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.ExportSearchResult, data)"><svg-icon name="export" /></el-button>
      </el-tooltip>
    </template> -->
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
      <status-badge v-if="checkVisible(data.type, toolsEnum.StreamStatus, null, data)" :status="getStreamStatus(data[deviceEnum.Streams])" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix" slot-scope="{ data }">
      <span v-if="data.type !== deviceTypeEnum.Ipc">{{ `(${data.onlineSize}/${data.totalSize})` }}</span>
    </template>
    <template slot="itemTools" slot-scope="{ data }">
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.SortDirectory, [policyEnum.UpdateDevice], data)" effect="dark" content="子目录排序" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.SortDirectory, data)"><svg-icon name="sort" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.AddDirectory, [policyEnum.UpdateDevice], data)" effect="dark" content="添加子目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.AddDirectory, data)"><svg-icon name="plus" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.EditDirectory, [policyEnum.UpdateDevice], data)" effect="dark" content="编辑目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools(toolsEnum.EditDirectory, data)"><svg-icon name="edit" /></el-button>
      </el-tooltip>
      <el-tooltip v-if="checkVisible(data.type, toolsEnum.DeleteDirectory, [policyEnum.DeleteDevice], data)" effect="dark" content="删除目录" placement="top" :open-delay="300">
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
  public async onTreeLoadedHook(node, res) {
    if (node.level === 0) {
      const pathStr =  this.$route.query.path as string
      const pathList = pathStr ? pathStr.split(',') : []
      window.setImmediate(() => {
        this.loadChildren(pathList)
      })
    }
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
