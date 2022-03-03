<!-- 进度条 -->
<template>
  <div class="controls__progress__bar">
    progress bar
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Player } from './models/Player'

@Component({
  name: 'Progress'
})
export default class extends Vue {
  @Prop()
  private player: Player
}
</script>
