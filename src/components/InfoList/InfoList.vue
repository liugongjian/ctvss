<template>
  <div class="info-list" :class="`label-position-${labelPosition}`">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator'
import InfoListItem from './InfoListItem.vue'

@Component({
  name: 'InfoList',
  components: { InfoListItem }
})
export default class extends Vue {
  @Provide('labelWidth') @Prop({ default: 120 }) private labelWidth?: number
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
