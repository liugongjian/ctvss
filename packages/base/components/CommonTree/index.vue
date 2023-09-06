<template>
  <div
    class="common-tree"
  >
    <div>
      <slot name="treeHeader" />
    </div>
    <div
      v-show="hasRoot"
      ref="root"
      class="common-tree__root"
      :class="{ 'common-tree__root--active': currentKey === rootKey }"
      @click="handleNode({ id: rootKey })"
    >
      <div class="common-tree__root__label-prefix">
        <slot name="rootLabelPrefix" />
      </div>
      <span class="common-tree__root__label">
        <slot name="rootLabel" />
      </span>
      <div class="common-tree__root__label-suffix">
        <slot name="rootLabelSuffix" />
      </div>
      <div class="common-tree__root__tools">
        <slot name="rootTools" />
      </div>
    </div>
    <div class="common-tree__content">
      <div class="common-tree__content__container">
        <el-tree
          :key="treeKey"
          ref="Tree"
          v-loading="treeLoading"
          :node-key="nodeKey"
          :current-node-key="currentNodeKey"
          :data="data"
          :lazy="lazy"
          :load="loadChildren"
          :props="props"
          :empty-text="emptyText"
          :default-expand-all="!lazy"
          :expand-on-click-node="expandOnClickNode"
          :show-checkbox="hasCheckbox"
          highlight-current
          @node-click="handleNode"
          @check-change="onCheckChange"
        >
          <div
            slot-scope="{ node, data }"
            v-draggable="{ node, isDraggable }"
            class="common-tree__item"
            :title="getTitle(data)"
            :disabled="true"
            :class="{ 'current-node': node.key === currentNodeKey, 'node-disable': isNodeDisabled(node) }"
          >
            <div class="common-tree__item__label-prefix">
              <slot name="itemLabelPrefix" :node="node" :data="data" />
            </div>
            <div class="common-tree__item__label">
              <slot name="itemLabel" :node="node" :data="data" />
            </div>
            <div class="common-tree__item__label-suffix">
              <slot name="itemLabelSuffix" :node="node" :data="data" />
            </div>
            <div class="common-tree__item__tools">
              <slot name="itemTools" :node="node" :data="data" />
            </div>
          </div>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { draggable } from './draggable'

@Component({
  name: 'CommonTree',
  directives: {
    'draggable': draggable
  }
})
export default class extends Vue {
  @Prop({ default: () => [] })
  private data

  @Prop({ default: '' })
  private nodeKey

  @Prop({ default: null })
  private rootKey

  @Prop({ default: '' })
  private emptyText

  @Prop({ default: {} })
  private props

  @Prop({ default: true })
  private lazy: boolean

  @Prop({ default: {} })
  private load

  @Prop({ default: null })
  private getNodeInfo

  @Prop({ default: () => false })
  private isDraggable: Function | boolean

  @Prop({ default: () => function(){ return false } })
  private isNodeDisabled: Function | boolean

  @Prop({ default: () => function() { return '' } })
  private getTitle: Function

  @Prop({ default: false })
  private hasCheckbox: boolean

  @Prop({ default: true })
  private expandOnClickNode: boolean

  private hasRoot = false
  private treeKey: string = 'ct' + new Date().getTime()
  public currentKey = null
  public defaultKey = null
  public treeLoading = false

  private get tree() {
    // tree与treeKey实现数据响应关联
    return this.treeKey && this.$refs.Tree as any
  }

  private get currentNodeKey() {
    return (this.currentKey === this.rootKey) ? null : this.currentKey
  }

  private mounted() {
    this.checkRootVisable()
  }

  /**
   * 判断是否显示root
   */
  private checkRootVisable() {
    const rootChildren = [...(this.$refs.root as HTMLDivElement).children]
    if (!rootChildren.length) return
    this.hasRoot = rootChildren.reduce((pre, cur) => {
      return pre || cur.children.length !== 0
    }, false)
    this.currentKey = this.currentKey || this.rootKey
  }

  /**
   * 初始化树
   */
  private initTree() {
    this.currentKey = this.currentKey || this.rootKey
    // 更新tree组件key值以保证组件重新渲染
    this.treeKey = 'ct' + new Date().getTime()
  }

  /**
   * 懒加载时加载子目录
   */
  public async loadChildren(payload: any, resolve?: Function, enableCache?: boolean) {
    payload.level === 0 && (this.treeLoading = true)
    // 判断为key则获取node
    if (typeof payload === 'string') {
      payload = this.tree.getNode(payload)
    }
    // 启用树节点缓存时：如果已经加载过，则提前返回，不重新请求接口
    if (enableCache && payload && payload.loaded) {
      payload.parent.expanded = true
      return
    }
    // 非懒加载树不需要加载节点直接展开
    if (!this.lazy) {
      payload.expanded = true
      return
    }

    // 未传则使用自定义resolve
    if (!resolve) {
      resolve = this.resolveChildren.bind(this, payload)
    }
    try {
      payload.loading = true
      resolve(await this.load(payload))
      payload.loading = false
    } catch (e) {
      resolve([])
    }
    this.treeLoading = false
  }

  private resolveChildren = function(node, data) {
    if (!node) return
    this.tree.updateKeyChildren(node.data.id, data)
    node.expanded = true
    node.loaded = true
  }

  /**
   * node点击事件
   */
  private handleNode(data: any, node: any) {
    this.setCurrentKey(data.id)
    this.$emit('handle-node', data, node)
  }

  private getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    return this.tree.getCheckedNodes(leafOnly, includeHalfChecked)
  }

  private setCheckedNodes(nodes) {
    return this.tree.setCheckedNodes(nodes)
  }

  private getCheckedKeys(leafOnly = false) {
    return this.tree.getCheckedKeys(leafOnly)
  }

  private setCheckedKeys(keys, leafOnly = false) {
    return this.tree.setCheckedKeys(keys, leafOnly)
  }

  private setChecked(data, checked: boolean, deep = false) {
    return this.tree.setChecked(data, checked, deep)
  }

  private getCurrentKey() {
    return this.tree.getCurrentKey()
  }

  private getCurrentNode() {
    return this.tree.getCurrentNode()
  }

  private setCurrentKey(key) {
    this.currentKey = key
    return this.tree.setCurrentKey(this.currentNodeKey)
  }

  private setCurrentNode(node) {
    return this.tree.setCurrentNode(node)
  }

  private getNode(data) {
    return this.tree.getNode(data)
  }

  /**
   * 节点选中事件
  */
  private onCheckChange(data: any) {
    this.setCurrentKey(data.id || data)
    this.$emit('check-change', data)
  }

}
</script>
