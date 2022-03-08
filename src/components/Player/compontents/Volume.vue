<!-- 音量控制按钮 -->
<template>
  <div class="controls__btn controls__volume">
    <svg-icon name="volume" width="18px" height="18px" />
    {{ player.hasAudio }}
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Volume'
})
export default class extends ComponentMixin {

}
</script>
