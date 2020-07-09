<template>
  <div class="status-badge" :class="`status-badge--${status}`" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'StatusBadge'
})
export default class extends Vue {
  @Prop() private status!: string
}
</script>

<style lang="scss" scoped>
  .status-badge {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 100px;

    &--on {
      background-color: $success;
    }
    &--off {
      background-color: $danger;
    }
    &--warning {
      background-color: $primary;
    }
  }
</style>
