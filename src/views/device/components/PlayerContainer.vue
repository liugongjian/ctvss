<template>
  <div class="player-container" :class="{'player-container--hidden': isHiddenTools}" @mouseover="isHiddenTools = false" @mouseout="isHiddenTools = true">
    <slot name="header" />
    <slot name="body" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'PlayerContainer'
})
export default class extends Vue {
  private isHiddenTools: boolean = true
}
</script>
