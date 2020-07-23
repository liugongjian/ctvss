<template>
  <div class="info-item">
    <div class="info-item--key" :style="`min-width: ${labelWidth}px`">{{ label }}</div>
    <div class="info-item--val">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Inject, Vue } from 'vue-property-decorator'

@Component({
  name: 'InfoListItem'
})
export default class extends Vue {
  @Prop() private label?: string
  @Inject('labelWidth') private labelWidth!: number
}
</script>

<style lang="scss" scoped>
  .info-item {
    display: flex;
    padding: 15px 0;
    align-items: top;
    line-height: 150%;

    &--key {
      color: $textGrey;
      padding-right: 10px;
      box-sizing: content-box;
    }
  }
</style>
