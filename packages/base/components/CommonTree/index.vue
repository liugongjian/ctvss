<template>
  <div
    v-loading="treeLoading"
    class="common-tree"
  >
    <div
      v-show="hasRoot"
      ref="root"
      class="common-tree__root"
      :class="{ 'common-tree__root--active': currentNodeKey === '-1' }"
      @click="handleNode({ id: '-1' })"
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
          node-key="id"
          :data="data"
          :empty-text="emptyText"
          :props="props"
          :lazy="lazy"
          :load="loadChildren"
          :default-expand-all="!lazy"
          :expand-on-click-node="false"
          :show-checkbox="hasCheckbox"
          highlight-current
          @node-click="handleNode"
        >
          <div
            slot-scope="{ node, data }"
            v-draggable="{ node, isDraggable }"
            class="common-tree__item"
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

  @Prop({ default: '-1' })
  private defaultKey

  @Prop({ default: '' })
  private emptyText

  @Prop({ default: () => {} })
  private props

  @Prop({ default: true })
  private lazy: boolean

  @Prop({ default: () => {} })
  private load

  @Prop({ default: null })
  private getNodeInfo

  @Prop({ default: false })
  private treeLoading: boolean

  @Prop({ default: () => false })
  private isDraggable: Function | boolean

  @Prop({ default: false })
  private hasCheckbox: boolean

  private hasRoot = false
  private treeKey: string = 'ct' + new Date().getTime()
  private currentNodeKey = null

  private get tree() {
    // 利用log使得tree与treeKey实现数据响应关联
    console.log(this.treeKey)
    return this.$refs.Tree as any
  }

  private created() {
  }

  private mounted() {
    this.initTree()
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
  }

  /**
   * 初始化树
   */
  private initTree() {
    console.log('init')
    this.currentNodeKey = this.defaultKey
    // const node = this.tree.getNode(this.currentNodeKey)
    // const data = node && node.data
    // this.handleNode(data, node)
    // 更新tree组件key值以保证组件重新渲染
    this.treeKey = 'ct' + new Date().getTime()
  }

  /**
   * 懒加载时加载子目录
   */
  public async loadChildren(payload: any, resolve?: Function) {
    // 判断为key则获取node
    if (typeof payload === 'string') {
      payload = this.tree.getNode(payload)
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
    this.currentNodeKey = node ? node.key : null
    this.tree.setCurrentKey(this.currentNodeKey)
    this.$emit('handle-node', data)
  }

  private getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    return this.tree.getCheckedNodes(leafOnly, includeHalfChecked)
  }

  private setCheckedNodes(nodes) {
    return this.tree.setCheckedNodes(nodes)
  }

  private getCheckedKeys(leafOnly = false) {
    return this.tree.getCheckedNodes(leafOnly)
  }

  private setCheckedKeys(keys, leafOnly = false) {
    return this.tree.setCheckedKeys(keys, leafOnly)
  }
}
</script>
