<template>
  <el-card class="common-layout" :class="{ 'common-layout--collapsed': !isExpanded, 'common-layout--dragging': dragBarConfig.isDragging }">
    <el-button class="common-layout__hamburger" @click="toggleHamburger">
      <svg-icon name="hamburger" />
    </el-button>
    <div
      class="common-layout__split"
      :style="`left: ${dragBarConfig.width}px`"
      @mousedown="changeWidthStart($event)"
    />
    <div ref="layoutLeft" class="common-layout__left" :style="`width: ${dragBarConfig.width}px`">
      <div class="common-layout__left__header">
        <slot name="leftHeader" />
      </div>
      <div class="common-layout__left__body">
        <slot name="leftBody" class="test" />
      </div>
      <!-- v2暂不支持搜索功能，此处去除class样式 -->
      <!-- <div class="common-layout__left__bottom"> -->
      <div>
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
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'CommonLayout'
})
export default class extends Vue {
  private isExpanded = true
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
    this.isExpanded = !this.isExpanded
  }

  /**
   * 设置左侧布局宽度
   * @param e 拖拽对象
   */
  private changeWidthStart(e: MouseEvent) {
    const $layoutLeft: any = this.$refs.layoutLeft
    this.dragBarConfig.isDragging = true
    this.dragBarConfig.start = e.x
    this.dragBarConfig.orginWidth = $layoutLeft.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dragBarConfig.isDragging) return
      this.dragBarConfig.offset = this.dragBarConfig.start - e.x
      const width = this.dragBarConfig.orginWidth - this.dragBarConfig.offset
      if (width < 50) return
      this.dragBarConfig.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dragBarConfig.isDragging = false
    })
  }
}
</script>

<style lang="scss" scoped>
$bar-height: 40px;

@media screen and (max-width: 1650px) {
  .common-layout {
    margin-bottom: -$margin-medium;
  }
}

.common-layout {
  min-width: 1080px;
  // margin-bottom: -$margin-medium;

  ::v-deep {
    > .el-card__body {
      position: relative;
      min-height: 100px;
      display: flex;
      padding: 0;
      width: 100%;
      height: calc(100vh - $header-height - $padding-medium * 2 - 3px);
    }
  }

  &--dragging {
    cursor: ew-resize;

    .common-layout__left {
      transition: none;
    }

    * {
      user-select: none;
    }
  }

  &--collapsed {
    .common-layout__hamburger {
      .svg-icon {
        transform: rotate(180deg);
      }
    }

    .common-layout__split {
      display: none;
    }

    .common-layout__left {
      width: 0 !important;
    }

    .common-layout__left__header {
      padding-left: 70px;
    }

    .common-layout__right__header {
      padding-left: 70px;
    }
  }

  &__hamburger {
    position: absolute;
    border: none;
    border-radius: 0;
    left: 0;
    top: 0;
    z-index: 21;
    height: 39px;
    border-right: 1px solid $border-color-primary;
    font-size: $text-size-x-large;
    padding: 10px 15px;
    background: $color-grey-10;
  }

  &__split {
    position: absolute;
    top: 0;
    margin-left: -8px;
    z-index: 100;
    height: 100%;
    width: 8px;
    border-right: 1px solid $border-color-primary;
    transition: border 0.2s;
    cursor: ew-resize;

    &:hover {
      border-right-color: $textLightGrey;
    }
  }

  &__left {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    overflow: hidden;
    transition: width 0.2s;

    &__header {
      display: flex;
      justify-content: flex-end;
      line-height: $bar-height;
      height: $bar-height;
      padding: 0 $padding-medium;
      border-bottom: 1px solid $border-color-primary;
      transition: padding-left 0.2s;

      ::v-deep .el-button--text {
        color: $color-grey-14;
        font-size: $text-size-large;
      }
    }

    &__body {
      flex: 1;
      display: flex;
      position: relative;
      padding: $padding-small;
    }

    &__bottom {
      display: flex;
      padding: 5px;
      min-height: $bar-height;
      border-top: 1px solid $border-color-primary;

      ::v-deep .el-input--suffix .el-input__inner {
        padding-right: 0;
      }

      ::v-deep .el-button--mini {
        padding: 7px;
      }

      ::v-deep &-button {
        margin-left: 5px !important;
      }
    }
  }

  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;
    height: 100%;

    &__header {
      display: flex;
      max-height: $bar-height;
      line-height: $bar-height;
      padding: 0 $padding-medium;
      border-bottom: 1px solid $border-color-primary;
      background: $color-grey-10;
      white-space: nowrap;
      overflow: hidden;
      transition: padding-left 0.2s;

      ::v-deep span {
        cursor: pointer;

        &:after {
          content: '/';
          color: $text-color-primary;
          margin: 0 10px;
        }

        &:last-child:after {
          content: '';
        }
      }
    }

    &__body {
      flex: 1;
      display: flex;
      position: relative;
      padding: $padding-medium;
      overflow: auto;
    }
  }
}
</style>
