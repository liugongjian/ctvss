<template>
  <div class="screen-tools__btn" @click="closeAll">
    <svg-icon name="combine" />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Datepicker'
})
export default class extends ComponentMixin {
  private closeAll() {
    this.screenManager.screenList.forEach(screen => {
      screen.destroy()
    })
  }
}

</script>
