<template>
  <div class="player-container" :class="{'player-container--hidden': isHiddenTools}" @mouseover="onMouseOver" @mouseout="onMouseMove">
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
  @Watch('onCanPlay')
  private onCanPlayChange(onCanPlay: boolean) {
    onCanPlay && this.setMouseEvent()
  }

  private onMouseOver() {
    this.timer && clearTimeout(this.timer)
    this.isHiddenTools = false
  }

  private onMouseMove() {
    this.setMouseEvent()
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
