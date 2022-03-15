<template>
  <div />
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Polling'
})
export default class extends ComponentMixin {
  public startPolling() {
    console.log('startPolling', this.screenManager.devicesQueue)
  }
}

</script>
