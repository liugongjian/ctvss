<!-- 更多 -->
<template>
  <div v-if="isShowMoreBtn" class="control__btn control__more" :class="{'control__more--active': isShowTools}" @click.stop.prevent="isShowTools = !isShowTools">
    <svg-icon
      name="more2"
      width="18px"
      height="18px"
    />
  </div>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import ComponentMixin from './mixin'
import { throttle } from 'lodash'

@Component({
  name: 'More'
})
export default class extends ComponentMixin {
  private isShowTools: boolean = false
  private isShowMoreBtn: boolean = false
  private resizeObserver: ResizeObserver
  private palyerWrap: HTMLElement = null

  /**
   * 监听播放器是否创建
   */
  @Watch('isShowTools')
  private onShowTools(isShowTools: boolean) {
    if (isShowTools) {
      this.adjustRightTools('show')
      window.addEventListener('click', this.onClickWindow)
    } else {
      this.adjustRightTools('hidden')
      window.removeEventListener('click', this.onClickWindow)
    }
  }

  private beforeMount() {
    this.observerInit()
  }

  /**
   * 挂载屏幕尺寸观测器
   */
  private observerInit() {
    this.palyerWrap = this.player.container.parentElement.parentElement
    // 监听播放器容器大小变化
    this.resizeObserver = new ResizeObserver(throttle(() => {
      console.log(this.player.container.clientWidth)
      if (this.player.container.clientHeight < 100 || this.player.container.clientWidth < 300) {
        this.isShowMoreBtn = true
        !this.isShowTools && this.adjustRightTools('hidden')
        this.adjustRightTools('offset')
      } else {
        this.isShowMoreBtn = false
        this.isShowTools = false
        this.adjustRightTools('show')
        this.adjustRightTools('cancelOffset')
      }
    }, 300))
    this.resizeObserver.observe(this.player.container.parentElement)
  }

  /**
   * 点击window隐藏right tools
   */
  private onClickWindow(event: MouseEvent) {
    let targert: any = event.target
    while (targert.parentElement) {
      targert = targert.parentElement
      if (targert.id === 'control') {
        return
      }
      this.isShowTools = false
    }
  }

  /**
   * 调整rightTools样式
   * @param type 调整类型
   */
  private adjustRightTools(type: string) {
    if (!this.palyerWrap) {
      return
    }
    let classVal = this.palyerWrap.getAttribute('class')
    switch (type) {
      case 'hidden':
        classVal = classVal.concat(classVal.indexOf('player__wrap--right-hidden') >= 0 ? '' : ' player__wrap--right-hidden')
        break
      case 'show':
        classVal = classVal.replace('player__wrap--right-hidden', '')
        break
      case 'offset':
        classVal = classVal.concat(classVal.indexOf('player__wrap--right-offset') >= 0 ? '' : ' player__wrap--right-offset')
        break
      case 'cancelOffset':
        classVal = classVal.replace('player__wrap--right-offset', '')
        break
    }
    this.palyerWrap.setAttribute('class', classVal)
  }

  private beforeDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }
}
</script>
<style lang="scss" scoped>
  .control__more {
    position: absolute;
    right: 10px;

    &--active {
      color: $primary;
    }
  }
</style>
