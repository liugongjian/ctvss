<template>
  <div class="info-list" :class="`label-position-${labelPosition}`">
    <div v-if="title" class="info-list__title">{{ title }}</div>
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
  @Prop() private title?: string
  @Provide('labelWidth') @Prop({ default: 120 }) private labelWidth?: number
  @Prop({ default: 'right' }) private labelPosition?: string
}
</script>
<style lang="scss" scoped>
  .info-list__title {
    border-bottom: 1px solid $borderGrey;
    padding-bottom: 10px;
  }
  .info-list.label-position-right {
    ::v-deep .info-item--key {
      text-align: right;
    }
  }
</style>
