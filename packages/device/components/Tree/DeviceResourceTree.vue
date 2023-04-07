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
      <svg-icon v-else :name="data.type" />
    </template>
    <template slot="itemLabel" slot-scope="{ node }">
      {{ node.label }}
    </template>
  </common-tree>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import treeMixin from '@vss/device/components/Tree/treeMixin'
import { DeviceTypeEnum } from '@vss/device/enums'

@Component({
  name: 'DeviceResourceTree'
})
export default class extends Mixins(treeMixin) {
  @Prop({ default: () => [] })
  public checkedList

  public checkedKeys: string[] = []

  public created() {
    this.checkedKeys = this.checkedList.map(item => item.path[item.path.length - 1])
  }
  
  public async onTreeLoadedHook(node, res) {
    if (node.level === 0) {
      // window.setImmediate(() => (this as any).initResourceStatus())
      res.dirs = res.dirs.filter((item: any) => {
        item.path = [{
          id: item.id,
          label: '',
          type: item.type
        }]
        if (![DeviceTypeEnum.Ipc].includes(item.type)) {
          item.disabled = true
        }
        return !this.checkedKeys.includes(item.id)
      })
    } else {
      res.dirs = res.dirs.filter((item: any) => {
        item.path = node.data.path.concat([item])
        if (![DeviceTypeEnum.Ipc].includes(item.type)) {
          item.disabled = true
        }
        return !this.checkedKeys.includes(item.id)
      })
    }
    return res.dirs
  }

  // /**
  //  * 初始化资源选中状态
  //  */
  // public async initResourceStatus() {
  //   Promise.resolve(this.checkedList).then(async(checkedList: any) => {
  //     console.log(checkedList)
  //     if (checkedList.length && checkedList[0] !== '*') {
  //       const pathList = checkedList.map(item => item.path)
  //       // const checkedKeys = pathList.map((path: string[]) => path[path.length - 1])
  //       for (let idx = 0, len = pathList.length; idx < len; idx++) {
  //         await this.loadChildren(pathList[idx], true)
  //       }
  //       // this.checkedKeys = checkedKeys
  //       // console.log(checkedKeys)
  //       this.$emit('check-device', this.getCheckedNodes())
  //     }
  //     this.$emit('resource-loaded', this.getCheckedNodes())
  //   })
  // }

  /**
   * 点击树节点
   */
  public handleNode(data, node) {
    if (data.type !== DeviceTypeEnum.Ipc) return
    this.setChecked(data.id, !node.checked)
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
