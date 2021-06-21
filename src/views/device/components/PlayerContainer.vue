<template>
  <div
    class="player-container"
    :class="{'player-container--hidden': isHiddenTools}"
    @mouseover="onMouseOver"
    @mouseout="onMouseOut"
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
    !this.calendarFocus && onCanPlay && this.setMouseEvent()
  }
  // @Watch('calendarFocus')
  // private oncalendarFocus(calendarFocus: boolean) {
  //   console.log(calendarFocus);

  //   if (calendarFocus) {
  //     this.timer && clearTimeout(this.timer)
  //     this.isHiddenTools = false
  //   } else {
  //     const eventTarget: any = window.event?.target
  //     if (!['VIDEO', 'CANVAS'].includes(eventTarget.nodeName)) {
  //       this.setMouseEvent()
  //     }
  //   }
  // }

  private onMouseOver() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
  }

  private onMouseOut() {
    !this.calendarFocus && this.setMouseEvent()
  }

  private setMouseEvent() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
    this.timer = setTimeout(() => {
      this.isHiddenTools = true
    }, 3000)
  }
}
</script>
