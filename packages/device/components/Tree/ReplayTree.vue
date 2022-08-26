<template>
  <common-tree
    ref="commonTree"
    :data="data"
    :props="defaultProps"
    :empty-text="emptyText"
    :lazy="lazy"
    :get-node-info="getNodeInfo"
    :item-directive="dropScreen"
    @handle-node="handleNode"
  >
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
      <el-tooltip effect="dark" content="更多操作" placement="top" :open-delay="300">
        <hover-selector>
          <template slot="tooltipBase">
            <el-button type="text"><svg-icon name="more" /></el-button>
          </template>
          <template slot="tooltipContent">
            <el-button size="mini" type="text" @click.stop="handleTools('autoPlay', data)">一键播放</el-button>
          </template>
        </hover-selector>
      </el-tooltip>
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getNodeInfo } from '../../api/device'
import { dropScreen } from './dropScreen'

@Component({
  name: 'ReplayTree'
})
export default class extends Vue {
  @Prop({ default: true })
  private lazy: boolean

  @Prop({ default: () => [] })
  private data

  private dropScreen = dropScreen
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
