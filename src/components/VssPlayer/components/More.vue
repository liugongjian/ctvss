<!-- 更多 -->
<template>
  <div class="control__btn control__more" :class="{'control__more--active': isShowTools}" @click.stop.prevent="isShowTools = !isShowTools">
    <svg-icon name="more2" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Prop } from 'vue-property-decorator'
import ResizeObserver from 'resize-observer-polyfill'
import ComponentMixin from './mixin'
import { throttle } from 'lodash'
import { removeClass, addClass } from '@/utils'

@Component({
  name: 'More'
})
export default class extends ComponentMixin {
  @Prop()
  private hasAxis: boolean

  @Prop()
  private playerWrap: HTMLDivElement

  private isShowTools: boolean = false
  private resizeObserver: ResizeObserver

  private sizeThresholdList = {
    normal: {
      small: [230, 400],
      mini: [0, 230]
    },
    hasAxis: {
      small: [340, 400],
      mini: [0, 340]
    }
  }
  private sizeThreshold = null

  /**
   * 监听播放器是否创建
   */
  @Watch('isShowTools')
  private onShowTools(isShowTools: boolean) {
    if (isShowTools) {
      addClass(this.playerWrap, 'vss-player__wrap--show-tools')
      window.addEventListener('click', this.onClickWindow)
    } else {
      removeClass(this.playerWrap, 'vss-player__wrap--show-tools')
      window.removeEventListener('click', this.onClickWindow)
    }
  }

  @Watch('playerWrap')
  private onPlayerWrap() {
    this.observerInit()
    this.sizeThreshold = this.hasAxis ? this.sizeThresholdList['hasAxis'] : this.sizeThresholdList['normal']
  }

  /**
   * 挂载屏幕尺寸观测器
   */
  private observerInit() {
    // 监听播放器容器大小变化
    this.resizeObserver = new ResizeObserver(throttle(() => {
      this.clearClass()
      if (this.playerWrap.clientWidth >= this.sizeThreshold.small[0] && this.playerWrap.clientWidth < this.sizeThreshold.small[1]) {
        addClass(this.playerWrap, 'vss-player__wrap--small')
        this.$emit('isShow', false)
      } else if (this.playerWrap.clientWidth < this.sizeThreshold.mini[1]) {
        addClass(this.playerWrap, 'vss-player__wrap--mini')
        this.$emit('isShow', false)
      } else {
        this.isShowTools = false
        this.$emit('isShow', false)
        addClass(this.playerWrap, 'vss-player__wrap--medium')
      }
    }, 300))
    this.resizeObserver.observe(this.playerWrap)
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

  private clearClass() {
    removeClass(this.playerWrap, 'vss-player__wrap--small')
    removeClass(this.playerWrap, 'vss-player__wrap--mini')
    removeClass(this.playerWrap, 'vss-player__wrap--medium')
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
