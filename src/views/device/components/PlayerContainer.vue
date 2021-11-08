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
  @Prop()
  private calendarFocus?: false

  @Watch('onCanPlay')
  private onCanPlayChange(onCanPlay: boolean) {
    !this.calendarFocus && onCanPlay && this.setMouseEvent(3000)
  }

  private onMouseOver() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
  }

  private onMouseOut() {
    !this.calendarFocus && this.setMouseEvent(500)
  }

  private onMouseMove() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
    const eventTarget: any = window.event?.target
    if (['VIDEO', 'CANVAS'].includes(eventTarget.nodeName)) {
      this.timer = setTimeout(() => {
        !this.calendarFocus && (this.isHiddenTools = true)
      }, 3000)
    }
  }

  private setMouseEvent(timeout: any) {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
    this.timer = setTimeout(() => {
      this.isHiddenTools = true
    }, timeout)
  }
}
</script>
