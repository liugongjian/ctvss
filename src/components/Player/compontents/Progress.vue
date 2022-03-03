<!-- 进度条 -->
<template>
  <div class="controls__progress__bar">
    progress bar
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
