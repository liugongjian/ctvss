<!-- 截图 -->
<template>
  <div class="controls__btn controls__snapshot" @click.stop.prevent="snapshot">
    <svg-icon name="snapshot" width="18px" height="18px" />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Snapshot'
})
export default class extends ComponentMixin {
  /**
   * 截图保存
   */
  private snapshot() {
    console.log(this.player)
  }
}
</script>
