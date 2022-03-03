<!-- 音量控制按钮 -->
<template>
  <div class="controls__btn controls__volume">
    <svg-icon name="volume" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Player } from './models/Player'

@Component({
  name: 'Volume'
})
export default class extends Vue {
  @Prop()
  private player: Player
}
</script>
