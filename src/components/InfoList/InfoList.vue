<template>
  <div class="info-list" :class="`label-position-${labelPosition}`">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'InfoList'
})
export default class extends Vue {
  @Prop({ default: 120 }) private labelWidth?: number
  @Prop({ default: 'right' }) private labelPosition?: string
}
</script>
<style lang="scss" scoped>
  .info-list.label-position-right {
    ::v-deep .info-item--key {
      text-align: right;
    }
  }
</style>
