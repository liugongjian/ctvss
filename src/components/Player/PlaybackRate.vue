<!-- 切换播放速率 -->
<template>
  <div class="controls__btn controls__playback-rate">
    倍速
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Player } from './models/Player'

@Component({
  name: 'PlaybackRate'
})
export default class extends Vue {
  @Prop()
  private player: Player
}
</script>
