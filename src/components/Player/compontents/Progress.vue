<!-- 进度条 -->
<template>
  <div class="control__progress__bar">
    {{ player && player.currentTime }} / {{ player && player.duration }}
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Progress'
})
export default class extends ComponentMixin {
}
</script>
