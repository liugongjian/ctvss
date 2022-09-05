<template>
  <div
    v-loading="treeLoading"
    class="common-tree"
  >
    <div
      v-show="hasRoot"
      ref="root"
      class="common-tree__root"
      :class="{'common-tree__root--active': currentNodeKey === null}"
      @click="handleNode(null)"
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
    <el-tree
      :key="treeKey"
      ref="Tree"
      class="common-tree__body"
      node-key="id"
      :data="data"
      :empty-text="emptyText"
      :props="props"
      :lazy="lazy"
      :load="loadChildren"
      :default-expand-all="!lazy"
      highlight-current
      @node-click="handleNode"
    >
      <div
        slot-scope="{node, data}"
        v-item-directive="{node}"
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
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component({
  name: 'CommonTree'
})
export default class extends Vue {
  @Prop({ default: () => [] })
  private data

  @Prop({ default: '' })
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

  @Prop({ default: () => {
    return { bind: () => {} }
  } })
  private itemDirective

  @Prop({ default: false })
  private treeLoading: boolean

  private hasRoot: boolean = false
  private treeKey: string = 'ct' + new Date().getTime()
  private currentNodeKey = null

  private get tree() {
    // 利用log使得tree与treeKey实现数据响应关联
    console.log(this.treeKey)
    return this.$refs.Tree as any
  }

  private created() {
    Vue.directive('item-directive', this.itemDirective)
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
  }

  /**
   * 初始化树
   */
  private initTree() {
    console.log('init')
    this.currentNodeKey = this.defaultKey
    const node = this.tree.getNode(this.currentNodeKey)
    const data = node && node.data
    this.handleNode(data, node)
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
}
</script>
