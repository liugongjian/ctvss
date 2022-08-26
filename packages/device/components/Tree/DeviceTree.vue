<template>
  <common-tree
    ref="commonTree"
    :data="data"
    :props="defaultProps"
    :empty-text="emptyText"
    :lazy="lazy"
    :get-node-info="getNodeInfo"
    @handle-node="handleNode"
  >
    <template slot="rootLabelPrefix">
      <svg-icon name="component" />
    </template>
    <template slot="rootLabel">
      {{ rootLabel }}
    </template>
    <template slot="rootLabelSuffix">
      <span>{{ `(1/11)` }}</span>
    </template>
    <template slot="rootTools" slot-scope="{data}">
      <el-tooltip effect="dark" content="导出全部搜索结果" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools('exportSearchResult', data)"><svg-icon name="export" /></el-button>
      </el-tooltip>
    </template>
    <template slot="itemLabelPrefix">
      <svg-icon name="dir" />
      <status-badge status="on" />
    </template>
    <template slot="itemLabel" slot-scope="{node}">
      {{ node.label }}
    </template>
    <template slot="itemLabelSuffix">
      <span>{{ `(1/11)` }}</span>
    </template>
    <template slot="itemTools" slot-scope="{data}">
      <el-tooltip effect="dark" content="子目录排序" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools('sortSubdirectory', data)"><svg-icon name="sort" /></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="添加子目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools('addSubdirectory', data)"><svg-icon name="plus" /></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="编辑目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools('editDirectory', data)"><svg-icon name="edit" /></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="删除目录" placement="top" :open-delay="300">
        <el-button type="text" @click.stop="handleTools('deleteDirectory', data)"><svg-icon name="trash" /></el-button>
      </el-tooltip>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getNodeInfo } from '../../api/device'

@Component({
  name: 'DeviceTree'
})
export default class extends Vue {
  @Prop({ default: true })
  private lazy: boolean

  @Prop({ default: () => [] })
  private data

  private getNodeInfo = getNodeInfo
  private rootLabel: string = '根目录'
  private emptyText: string = '暂无目录或设备'
  private defaultProps = {
    children: 'children',
    label: 'label'
  }

  private initCommonTree() {
    let commonTree: any = this.$refs.commonTree
    commonTree.initTree()
  }

  /**
   * node点击事件
   * @param data node信息
   */
  private handleNode(data: any) {
    this.$emit('handle-node', data)
  }

  /**
   * 工具栏功能触发回调
   * @param type 触发功能类型
   * @param data node信息
   */
  private handleTools(type: any, data: any) {
    this.$emit('handle-tools', type, data)
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
</style>
