<template>
  <el-card class="common-layout" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dragBarConfig.isDragging}">
    <el-button class="common-layout__hamburger" @click="toggleHamburger">
      <svg-icon name="hamburger" />
    </el-button>
    <div
      class="common-layout__split"
      :style="`left: ${dragBarConfig.width}px`"
      @mousedown="changeWidthStart($event)"
    />
    <div class="common-layout__left" :style="`width: ${dragBarConfig.width}px`">
      <div class="common-layout__left__header">
        <slot name="leftHeader" />
      </div>
      <div class="common-layout__left__body">
        <slot name="leftBody" />
      </div>
      <div class="common-layout__left__bottom">
        <slot name="leftBottom" />
      </div>
    </div>
    <div class="common-layout__right">
      <div class="common-layout__right__header">
        <slot name="rightHeader" />
      </div>
      <div class="common-layout__right__body">
        <slot name="rightBody" />
      </div>
      <div class="common-layout__right__bottom">
        <slot name="rightBottom" />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'CommonLayout'
})
export default class extends Vue {
  private isExpanded: boolean = true
  private dragBarConfig = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  /**
   * 收起/展开目录列表
   */
  private toggleHamburger(): void {
    // this.isExpanded = !this.isExpanded
  }

  /**
   * 设置左侧布局宽度
   * @param e 拖拽对象
   */
  private changeWidthStart(e: MouseEvent) {
    // const $dirList: any = this.$refs.dirList
    // this.dragBarConfig.isDragging = true
    // this.dragBarConfig.start = e.x
    // this.dragBarConfig.orginWidth = $dirList.clientWidth

    // window.addEventListener('mousemove', (e) => {
    //   if (!this.dragBarConfig.isDragging) return
    //   this.dragBarConfig.offset = this.dragBarConfig.start - e.x
    //   const width = this.dragBarConfig.orginWidth - this.dragBarConfig.offset
    //   if (width < 50) return
    //   this.dragBarConfig.width = width
    // })
    // window.addEventListener('mouseup', () => {
    //   this.dragBarConfig.isDragging = false
    // })
  }
}
</script>

<style lang="scss" scoped>
.common-layout {
  &__hamburger {

  }

  &__split {

  }

  &__left {
    &__header {

    }

    &__body {

    }

    &__bottom {

    }
  }

  &__right {
    &__header {

    }

    &__body {

    }
  }
}
</style>
