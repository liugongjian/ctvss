<template>
  <div
    class="player-container"
    :class="{'player-container--hidden': isHiddenTools}"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut"
    @mousemove="onMouseMove"
  >
    <slot name="header" />
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
@Component({
  name: 'PlayerContainer'
})
export default class extends Vue {
  private isHiddenTools: boolean = true
  private timer: any

  @Prop()
  private onCanPlay?: false
  // 判断是否选中日历
  @Prop()
  private calendarFocus?: false

  @Watch('onCanPlay')
  private onCanPlayChange(onCanPlay: boolean) {
    !this.calendarFocus && onCanPlay && this.setMouseEvent(3000)
  }

  // 鼠标进入回调
  private onMouseOver() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
  }

  // 鼠标移出回调
  private onMouseOut() {
    !this.calendarFocus && this.setMouseEvent(500)
  }

  // 鼠标移动回调
  private onMouseMove() {
    const eventTarget: any = window.event?.target
    if (this.checkIsVideo(eventTarget)) {
      this.setMouseEvent(3000)
    } else if (this.checkIsTools(eventTarget)) {
      this.timer && clearTimeout(this.timer)
      this.isHiddenTools = false
    } else {
      this.setMouseEvent(500)
    }
  }

  // 延时隐藏工具栏
  private setMouseEvent(timeout: number) {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
    this.timer = setTimeout(() => {
      !this.calendarFocus && (this.isHiddenTools = true)
    }, timeout)
  }

  // 校验鼠标是否指向视频
  private checkIsVideo(dom: any) {
    if (['VIDEO', 'CANVAS'].includes(dom.nodeName)) {
      return true
    } else {
      return false
    }
  }

  // 校验鼠标是否指向工具栏
  private checkIsTools(dom: any) {
    if (dom && dom.className) {
      let classNameList = dom.className.toString().split(' ')
      if (classNameList) {
        if (
          classNameList.includes('controls') ||
          classNameList.includes('screen-header') ||
          classNameList.includes('selected') ||
          classNameList.includes('timeline__box') ||
          classNameList.includes('filter-container')
        ) {
          return true
        }
      }
      return this.checkIsTools(dom.parentNode)
    } else {
      return false
    }
  }
}
</script>
