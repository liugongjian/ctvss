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
    :has-checkbox="true"
    @handle-node="handleNode"
    @check-change="onCheckDevice"
  >
    <template slot="itemLabelPrefix" slot-scope="{ node, data }">
      <svg-icon v-if="!node.expanded && data.type === directoryTypeEnum.Dir" name="dir-close" />
      <svg-icon v-else :class="{ 'active-icon': data[deviceEnum.DeviceStatus] === statusEnum.On }" :name="data.type" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'

@Component({
  name: 'IAMResourceTree'
})
export default class extends Mixins(treeMixin) {
  @Prop({ default: () => [] })
  public checkedList

  @Prop({ default: () => null })
  public filterTypeArr

  @Prop({ default: () => null })
  public filterInProtocolArr

  @Prop({ default: () => null })
  public filterVideoProtocolArr
  
  public async onTreeLoadedHook(node, res) {
    if (node.level === 0) {
      window.setImmediate(() => (this as any).initResourceStatus())
      res.dirs.map((item: any) => {
        item.path = [{
          id: item.id,
          label: '',
          type: item.type
        }]
      })
    } else {
      const parentPath = this.concatPath(node)
      res.dirs.map((item: any) => {
        item.path = node.data.path.concat([{
          label: node.level === 1 ? node.label : parentPath + '/' + node.label,
          ...item
        }])
      })
    }
    // 节点过滤
    if (Array.isArray(this.filterTypeArr) && this.filterTypeArr.length) {
      res.dirs = res.dirs.filter((dir: any) => this.filterTypeArr.includes(dir.type))
    }
    if (Array.isArray(this.filterInProtocolArr) && this.filterInProtocolArr.length) {
      res.dirs = res.dirs.filter((dir: any) => !dir.inProtocol || this.filterInProtocolArr.includes(dir.inProtocol))
    }
    if (Array.isArray(this.filterVideoProtocolArr) && this.filterVideoProtocolArr.length) {
      res.dirs = res.dirs.filter((dir: any) => this.filterVideoProtocolArr.includes(dir.inVideoProtocol))
    }
    return res.dirs
  }

  /**
   * 初始化资源选中状态
   */
  public async initResourceStatus() {
    Promise.resolve(this.checkedList).then(async(checkedList: any) => {
      if (checkedList.length) {
        const pathList = checkedList.map((resource: any) => resource.split(':')[2].split('/'))
        const checkedKeys = pathList.map((path: string[]) => path[path.length - 1])
        for (let idx = 0, len = pathList.length; idx < len; idx++) {
          await this.loadChildren(pathList[idx], true)
        }
        this.setCheckedKeys(checkedKeys)
        this.$emit('check-device', this.getCheckedNodes())
      }
      this.$emit('resource-loaded', this.getCheckedNodes())
    })
  }

  // 拼接 path
  private concatPath(node: any) {
    if (typeof(node.parent.label) === 'undefined') return ''
    const label = node.parent.label ? node.parent.label : ''
    return this.concatPath(node.parent) + '/' + label
  }

  /**
   * 节点选中事件
  */
  private onCheckDevice() {
    const nodes = this.getCheckedNodes()
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
