<!-- 音量控制按钮 -->
<template>
  <div class="control__btn control__volume">
    <svg-icon name="volume" width="18px" height="18px" />
    {{ player && player.isMuted }} {{ player && player.hasAudio }} {{ player && player.volume }}
  </div>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Volume'
})
export default class extends ComponentMixin {
  @Watch('player.volume')
  onChange() {
    console.log(this.player.volume)
  }
}
</script>
