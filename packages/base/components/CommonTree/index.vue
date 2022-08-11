<template>
  <div
    v-loading="treeLoading"
    class="common-tree"
  >
    <div
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
      :load="load"
      :default-expand-all="!lazy"
      highlight-current
      @node-click="handleNode"
    >
      <div
        slot-scope="{node, data}"
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

  @Prop({ default: null })
  private getNodeInfo

  private treeLoading: boolean = false
  private treeKey: string = 'ct' + new Date().getTime()
  private currentNodeKey = null

  private mounted() {
    this.initTree()
  }

  /**
   * 初始化树
   */
  private initTree() {
    console.log('init')
    this.currentNodeKey = this.defaultKey
    const node = (this.$refs.Tree as any).getNode(this.currentNodeKey)
    const data = node && node.data
    this.handleNode(data, node)
    // 更新tree组件key值以保证组件重新渲染
    this.treeKey = 'ct' + new Date().getTime()
  }

  /**
   * 加载节点
   */
  private async load(node: any, resolve: Function) {
    try {
      if (node.level === 0) {
        this.treeLoading = true
        resolve(await this.getNodeInfo('root'))
        this.treeLoading = false
      } else if (node.level < 4) {
        resolve(await this.getNodeInfo('node'))
      } else if (node.level === 4) {
        resolve(await this.getNodeInfo('leaf'))
      } else {
        resolve([])
      }
    } catch (e) {
      resolve([])
    } finally {
      this.treeLoading = false
    }
  }

  /**
   * node点击事件
   */
  private handleNode(data: any, node: any) {
    this.currentNodeKey = node ? node.key : null;
    (this.$refs.Tree as any).setCurrentKey(this.currentNodeKey)
    this.$emit('handle-node', data)
  }
}
</script>

<style lang="scss" scoped>
.common-tree {
  flex: 1;
  position: relative;

  ::v-deep .svg-icon {
    color: $color-grey-15;
    font-size: $text-size-medium;
  }

  &__root {
    display: flex;
    align-items: center;
    position: relative;
    border-bottom: 1px solid $border-color-primary;
    padding: $padding-small;
    margin-bottom: $margin-small;
    background: $color-white;
    cursor: pointer;

    &--active {
      background: $color-grey-8;
    }

    &__label {
      flex-shrink: 0;
      position: relative;
      margin-right: $margin-small;
    }

    &__label-prefix {
      position: relative;
      margin-right: $margin-small;
    }

    &__label-suffix {
      position: relative;
      color: $color-grey-15;
    }

    &__tools {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      position: sticky;
      right: $padding-small;
      background: inherit;

      ::v-deep {
        .el-button {
          padding: 0;
        }
      }
    }
  }

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;

    &__label {
      position: relative;
      margin-right: $margin-small;
    }

    &__label-prefix {
      position: relative;
      margin-right: $margin-small;
    }

    &__label-suffix {
      position: relative;
      color: $color-grey-15;
    }

    &:hover {
      .common-tree__item__tools {
        display: flex;
      }
    }

    &__tools {
      display: none;
      position: absolute;
      right: $padding-small;
      background: $color-grey-8;

      ::v-deep {
        .el-button {
          padding: 0;
        }

        .el-button + .el-button {
          margin-left: $margin-tiny;
        }
      }
    }
  }
}
</style>
