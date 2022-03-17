<template>
  <div class="screen-tools__btn" :class="{'selected': isSync}" @click="toggleSync">
    <svg-icon name="arrow-right" />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Sync'
})
export default class extends ComponentMixin {
  private get isSync() {
    return this.screenManager.isSync
  }

  private toggleSync() {
    this.screenManager.isSync = !this.screenManager.isSync
  }
}

</script>
