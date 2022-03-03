<!-- 截图 -->
<template>
  <div class="controls__btn controls__snapshot" @click.stop.prevent="snapshot">
    <svg-icon name="snapshot" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Player } from '../Player/models/Player'

@Component({
  name: 'PlaybackRate'
})
export default class extends Vue {
  @Prop()
  private player: Player

  /**
   * 截图保存
   */
  private snapshot() {}
}
</script>
