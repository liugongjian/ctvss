<template>
  <el-dropdown class="dropdown" trigger="click" placement="bottom-start" @command="handleScreenSize">
    <el-tooltip content="选择分屏" placement="top">
      <el-button class="screen-tools__btn">
        <svg-icon name="screen" />
      </el-button>
    </el-tooltip>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="(item, index) in screenSizeList"
        :key="index"
        :command="item"
        :class="{'el-dropdown-item__active': item.layout === layout}"
        :disabled="disabled"
      >
        <span class="el-dropdown-menu__screen-icon"><svg-icon :name="`screen${item.layout}`" /></span>
        <label>{{ item.label }}</label>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'SizeSelector'
})
export default class extends ComponentMixin {
  @Prop()
  private disabled: boolean

  private screenSizeList = [
    {
      label: '1分屏',
      layout: '1',
      size: 1
    },
    {
      label: '3分屏',
      layout: '3',
      size: 3
    },
    {
      label: '4分屏',
      layout: '4',
      size: 4
    },
    {
      label: '9分屏',
      layout: '9',
      size: 9
    },
    {
      label: '16分屏',
      layout: '16',
      size: 16
    },
    {
      label: '32分屏',
      layout: '32',
      size: 32
    },
    {
      label: '1+3分屏',
      layout: '1_3',
      size: 4
    },
    {
      label: '1+5分屏',
      layout: '1_5',
      size: 6
    },
    {
      label: '1+7分屏',
      layout: '1_7',
      size: 8
    },
    {
      label: '1+15分屏',
      layout: '1_15',
      size: 16
    }
  ]

  private get layout() {
    return this.screenManager.layout
  }

  private handleScreenSize(screenSize) {
    this.screenManager.size = screenSize.size
    this.screenManager.layout = screenSize.layout
    /* 当前选中的index如果是大于分屏数量，将index切换到最后一个分屏 */
    if (screenSize.size <= this.screenManager.currentIndex) {
      this.screenManager.currentIndex = screenSize.size - 1
    }
  }
}
</script>
<style lang="scss" scoped>
  .dropdown {
    margin: 0;
  }
</style>
