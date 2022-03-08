<!-- 切换播放速率 -->
<template>
  <div class="control__btn control__playback-rate">
    倍速
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'PlaybackRate'
})
export default class extends ComponentMixin {
}
</script>
